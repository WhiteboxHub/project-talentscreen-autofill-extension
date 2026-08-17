async function fetchWblAutofillContext(wblAuth) {
  if (!wblAuth?.token || !wblAuth?.candidateId || !wblAuth?.apiUrl) {
    console.warn('[TalentScreen] fetch skipped — missing wblAuth fields');
    return null;
  }
  const base = wblAuth.apiUrl.endsWith('/api') ? wblAuth.apiUrl : `${wblAuth.apiUrl}/api`;
  const url = `${base}/candidates/${wblAuth.candidateId}/autofill-context`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${wblAuth.token}` },
    });
    if (!response.ok) {
      console.warn('[TalentScreen] autofill-context HTTP', response.status, url);
      return null;
    }
    return response.json();
  } catch (e) {
    console.warn('[TalentScreen] autofill-context fetch error:', e.message);
    return null;
  }
}

async function uploadResumeToMyResume(resumeFile, wblAuth) {
  if (!wblAuth?.token || !wblAuth?.candidateId || !wblAuth?.apiUrl) {
    return { status: 'no_auth' };
  }
  const blob = await fetch(resumeFile.data).then((r) => r.blob());
  const formData = new FormData();
  formData.append('file', blob, resumeFile.name || 'resume.pdf');
  const base = wblAuth.apiUrl.endsWith('/api') ? wblAuth.apiUrl : `${wblAuth.apiUrl}/api`;
  const uploadUrl = `${base}/candidates/${wblAuth.candidateId}/marketing/upload-resume`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${wblAuth.token}` },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Resume upload to WBL failed');
  }
  return response.json();
}
importScripts('/src/core/resumeProcessor.js');
importScripts('/src/background/analytics.js');

try {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }, () => {
      if (chrome.runtime.lastError) {
        console.error("SidePanel behavior error (ignorable):", chrome.runtime.lastError);
      }
    });
  }
} catch (e) {
  console.warn("SidePanel API not fully supported or error during init:", e);
}

// Track open side panels per window
const openSidePanelWindows = new Set();
const LAUNCH_CONTEXTS_KEY = 'talentscreenLaunchContexts';

// Global variables to track the most recently clicked job board launch
let lastLaunchUrl = null;
let lastLaunchTime = 0;

async function getLaunchContexts() {
  const storage = chrome.storage.session || chrome.storage.local;
  const result = await storage.get(LAUNCH_CONTEXTS_KEY);
  return result[LAUNCH_CONTEXTS_KEY] || { pending: {}, tabs: {} };
}

async function saveLaunchContexts(contexts) {
  const storage = chrome.storage.session || chrome.storage.local;
  await storage.set({ [LAUNCH_CONTEXTS_KEY]: contexts });
}

async function syncWblResumeToStorage(request) {
  const stored = await chrome.storage.local.get(['wblAuth', 'resumeData', 'resumeFile', 'normalizedData']);
  const wblAuth = request.wblAuth || stored.wblAuth;

  // ponytail: single global cache per browser — clear when WBL account switches
  if (wblAuth?.candidateId && stored.wblAuth?.candidateId && stored.wblAuth.candidateId !== wblAuth.candidateId) {
    await chrome.storage.local.remove(['resumeData', 'resumeFile', 'normalizedData']);
  }

  const patch = {};
  if (request.wblAuth) patch.wblAuth = request.wblAuth;
  if (request.resumeData) {
    patch.resumeData = request.resumeData;
    patch.normalizedData = ResumeProcessor.normalize(request.resumeData);
  }

  if (Object.keys(patch).length) {
    await chrome.storage.local.set(patch);
  }

  const ctx = await fetchWblAutofillContext(wblAuth);
  if (!ctx) {
    console.warn('[TalentScreen] autofill-context fetch failed — check WBL login / site access');
    return;
  }

  const apiPatch = {};
  if (ctx.resume_data) {
    apiPatch.resumeData = ctx.resume_data;
    apiPatch.normalizedData = ResumeProcessor.normalize(ctx.resume_data);
  }
  if (ctx.resume_file) {
    apiPatch.resumeFile = ctx.resume_file;
  }
  if (Object.keys(apiPatch).length) {
    await chrome.storage.local.set(apiPatch);
  } else {
    await chrome.storage.local.remove(['resumeData', 'resumeFile', 'normalizedData']);
    console.warn('[TalentScreen] no resume for candidate', wblAuth?.candidateId, '— upload on My Resume');
  }
}

async function saveLaunchContext(request) {
  const { resumeData, resumeFile, ...context } = request;
  const contexts = await getLaunchContexts();
  const nextContext = { ...context, launchedAt: Date.now() };
  delete nextContext.jobDead;

  contexts.pending[context.applicationUrl] = nextContext;
  contexts.lastLaunch = nextContext;
  contexts.deadTabs = contexts.deadTabs || {};
  for (const tabId of Object.keys(contexts.tabs)) {
    if (contexts.tabs[tabId].applicationUrl === context.applicationUrl) {
      contexts.tabs[tabId] = nextContext;
      delete contexts.deadTabs[tabId];
    }
  }
  await saveLaunchContexts(contexts);
  notifyLaunchContextUpdated(nextContext);

  if ('resumeData' in request || request.wblAuth) {
    const patch = {};
    if (resumeData) {
      patch.resumeData = resumeData;
      patch.normalizedData = ResumeProcessor.normalize(resumeData);
    }
    if (request.wblAuth) {
      patch.wblAuth = request.wblAuth;
    } else if (request.candidateId) {
      const existing = await chrome.storage.local.get(['wblAuth']);
      patch.wblAuth = { ...(existing.wblAuth || {}), candidateId: request.candidateId };
    }
    if (Object.keys(patch).length) {
      await chrome.storage.local.set(patch);
    }
    await syncWblResumeToStorage(request);
  }
}

function normalizeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    return `${u.protocol}//${u.hostname}${path}`;
  } catch (e) {
    return url.split('?')[0].split('#')[0].replace(/\/$/, "");
  }
}

async function assignLaunchContext(tabId, url) {
  if (!url) return null;
  const contexts = await getLaunchContexts();
  const normUrl = normalizeUrl(url);
  const matchedKey = Object.keys(contexts.pending).find((key) => normalizeUrl(key) === normUrl);

  if (matchedKey) {
    contexts.tabs[tabId] = contexts.pending[matchedKey];
    await saveLaunchContexts(contexts);
    return contexts.tabs[tabId];
  }

  const stored = contexts.tabs[tabId];
  if (stored && normalizeUrl(stored.applicationUrl) === normUrl) {
    return stored;
  }

  if (lastLaunchUrl && normalizeUrl(lastLaunchUrl) === normUrl && Date.now() - lastLaunchTime < 30000) {
    const pending = contexts.pending[lastLaunchUrl];
    if (pending) {
      contexts.tabs[tabId] = pending;
      await saveLaunchContexts(contexts);
      return pending;
    }
  }

  if (stored && normalizeUrl(stored.applicationUrl) !== normUrl) {
    delete contexts.tabs[tabId];
    await saveLaunchContexts(contexts);
  }
  return null;
}

function isDashboardUrl(url) {
  if (!url) return false;
  return url.includes('localhost') || url.includes('127.0.0.1') || url.includes('whitebox-learning');
}

function notifyLaunchContextUpdated(context) {
  if (!context) return;
  chrome.runtime.sendMessage({ action: 'launch_context_updated', context }).catch(() => {});
}

async function syncLaunchTabsForUrl(applicationUrl) {
  const contexts = await getLaunchContexts();
  const pending = contexts.pending[applicationUrl];
  if (!pending) return;

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;
    if (normalizeUrl(tab.url) !== normalizeUrl(applicationUrl)) continue;
    contexts.tabs[tab.id] = pending;
    await saveLaunchContexts(contexts);
  }
}

function handlePrepareTalentScreenApply(request, sendResponse, sender) {
  if (!request.applicationUrl || !request.jobId) {
    sendResponse({ status: 'ignored' });
    return false;
  }

  lastLaunchUrl = request.applicationUrl;
  lastLaunchTime = Date.now();

  saveLaunchContext(request)
    .then(async () => {
      await syncLaunchTabsForUrl(request.applicationUrl);
      notifyLaunchContextUpdated({
        jobId: request.jobId,
        title: request.title,
        company: request.company,
        applicationUrl: request.applicationUrl,
        resumeVersion: request.resumeVersion,
        launchedAt: Date.now(),
      });
      sendResponse({ status: 'ready' });
    })
    .catch(() => sendResponse({ status: 'error' }));
  return true;
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel") {
    let windowId = null;

    port.onMessage.addListener((msg) => {
      if (msg.action === 'register_window' && msg.windowId) {
        windowId = msg.windowId;
        openSidePanelWindows.add(windowId);
      }
    });

    port.onDisconnect.addListener(() => {
      if (windowId) {
        openSidePanelWindows.delete(windowId);
      }
    });
  }
});

// Helper function to check if URL is an ATS site
function isATSSite(url) {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  const jobBoards = [
    'greenhouse.io', 'lever.co', 'myworkdayjobs.com', 'workday.com',
    'smartrecruiters.com', 'applytojob.com', 'ashbyhq.com', 'bamboohr.com',
    'icims.com', 'indeed.com', 'linkedin.com', 'workable.com',
    'taleo.net', 'successfactors.com', 'personio.com', 'recruitee.com',
    'teamtailor.com', 'ultipro.com', 'ukg.com', 'paycomonline.net',
    'paychex.com', 'oraclecloud.com', 'brassring.com', 'adp.com',
    'jobvite.com', 'rippling-ats.com', 'silkroad.com', 'kforce.com'
  ];
  return jobBoards.some(board => urlLower.includes(board));
}

function isRecentLaunch() {
  return lastLaunchUrl && (Date.now() - lastLaunchTime < 15000);
}

function setAtsBadge(tabId) {
  chrome.action.setBadgeText({ text: 'ON', tabId });
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });
  chrome.action.setTitle({ title: 'Click to open TalentScreen autofill', tabId });
}

// Badge only on ATS tabs — side panel opens from Apply click (user gesture), not from tab events.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const contexts = await getLaunchContexts();
    if (contexts.deadTabs?.[tabId]) {
      delete contexts.deadTabs[tabId];
      await saveLaunchContexts(contexts);
    }
  }

  if (changeInfo.status !== 'complete' || !tab.url) return;

  await assignLaunchContext(tabId, tab.url);
  const contexts = await getLaunchContexts();
  const ctx = contexts.tabs[tabId];
  if (ctx) notifyLaunchContextUpdated(ctx);

  if (isATSSite(tab.url)) {
    setAtsBadge(tabId);
    chrome.storage.session?.set({ lastJobSiteDetected: { url: tab.url, tabId, windowId: tab.windowId } }).catch(() => { });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
    chrome.action.setTitle({ title: 'Open side panel', tabId });
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (!tab.url) return;

  const ctx = await assignLaunchContext(activeInfo.tabId, tab.url);
  if (ctx) notifyLaunchContextUpdated(ctx);

  if (isATSSite(tab.url)) {
    setAtsBadge(activeInfo.tabId);
  } else {
    chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
    chrome.action.setTitle({ title: 'Open side panel', tabId: activeInfo.tabId });
  }
});

// Handle new windows opened with ATS sites
chrome.windows.onCreated.addListener(async (window) => {
  // Wait a moment for tabs to load
  setTimeout(async () => {
    try {
      const tabs = await chrome.tabs.query({ windowId: window.id });
      const activeTab = tabs.find(tab => tab.active);

      if (activeTab && activeTab.url && isATSSite(activeTab.url)) {
        setAtsBadge(activeTab.id);
      }
    } catch (error) {
      console.warn('[TalentScreen] Error checking new window tabs:', error);
    }
  }, 1000); // Wait 1 second for page to start loading
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open Side Panel",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "forceFillData",
    title: "Force Fill Data",
    contexts: ["all"]
  });
});

// Handle new tabs created (e.g., opening links in new tabs)
chrome.tabs.onCreated.addListener(async (tab) => {
  if (isRecentLaunch()) {
    try {
      const contexts = await getLaunchContexts();
      if (contexts.pending[lastLaunchUrl]) {
        contexts.tabs[tab.id] = contexts.pending[lastLaunchUrl];
        await saveLaunchContexts(contexts);
      }
    } catch (e) {
      console.warn('[TalentScreen] Failed to assign launch context on tab creation:', e);
    }
  }

  setTimeout(async () => {
    try {
      const updatedTab = await chrome.tabs.get(tab.id);
      if (!updatedTab.url) return;
      await assignLaunchContext(tab.id, updatedTab.url);
      if (isATSSite(updatedTab.url)) {
        setAtsBadge(tab.id);
      }
    } catch {
      // Tab URL not ready yet
    }
  }, 500);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const contexts = await getLaunchContexts();
  if (contexts.tabs[tabId]) {
    delete contexts.tabs[tabId];
    await saveLaunchContexts(contexts);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    chrome.sidePanel.open({ tabId: tab.id });
  } else if (info.menuItemId === "forceFillData") {
    chrome.storage.local.get(['resumeData', 'normalizedData', 'resumeFile'], (result) => {
      if (result.resumeData) {
        chrome.tabs.sendMessage(tab.id, {
          action: "fill_form",
          data: result.resumeData,
          normalizedData: result.normalizedData || ResumeProcessor.normalize(result.resumeData),
          resumeFile: result.resumeFile,
          manual: true
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log_fill') {
    logApplicationFill(request.data);
    sendResponse({ status: 'logged' });
  } else if (request.action === 'log_submission') {
    logApplicationSubmission(request.url);
    sendResponse({ status: 'updated' });
  } else if (request.action === 'sidepanel_opened') {
    AnalyticsTracker.trackEvent('extension_open');
    sendResponse({ status: 'tracked' });
  } else if (request.action === 'check_sidepanel_status') {
    const windowId = sender.tab?.windowId;
    sendResponse({ isOpen: windowId ? openSidePanelWindows.has(windowId) : false });
  } else if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  } else if (request.action === 'send_feedback_email') {
    handleFeedbackEmail(request.feedback, request.emailBody);
    sendResponse({ status: 'email_queued' });
  } else if (request.action === 'get_talentscreen_launch_context') {
    const tabId = request.tabId || (sender.tab && sender.tab.id);
    if (!tabId) {
      sendResponse(null);
    } else {
      chrome.tabs.get(tabId)
        .then(async (tab) => {
          const contexts = await getLaunchContexts();
          let context = await assignLaunchContext(tabId, tab.url || '');

          if (!context && contexts.lastLaunch) {
            const age = Date.now() - (contexts.lastLaunch.launchedAt || 0);
            const tabNorm = normalizeUrl(tab.url || '');
            const launchNorm = normalizeUrl(contexts.lastLaunch.applicationUrl || '');
            if (age < 30000 && (tabNorm === launchNorm || isDashboardUrl(tab.url))) {
              context = contexts.lastLaunch;
            }
          }

          sendResponse(context);
        })
        .catch(async () => {
          sendResponse(null);
        });
    }
    return true;
  } else if (request.action === 'autofill_talentscreen_launch') {
    if (!sender.tab?.id) {
      sendResponse({ status: 'error' });
      return true;
    }
    chrome.storage.local.get(['resumeData', 'normalizedData', 'resumeFile'], (result) => {
      if (!result.resumeData || !result.resumeFile) {
        sendResponse({ status: 'resume_required' });
        return;
      }
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'fill_form',
        data: result.resumeData,
        normalizedData: result.normalizedData || ResumeProcessor.normalize(result.resumeData),
        resumeFile: result.resumeFile,
        manual: true,
      }, () => sendResponse({ status: chrome.runtime.lastError ? 'error' : 'started' }));
    });
  } else if (request.action === 'job_page_ready') {
    // Side panel opens on Apply click (user gesture) — not here (gesture expired).
    sendResponse({ status: 'ack' });
  } else if (request.action === 'job_page_dead') {
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.action.setBadgeText({ text: '', tabId });
    }
    sendResponse({ status: 'logged' });
  } else if (request.action === 'open_side_panel_now') {
    // Must run in this turn (user gesture). Prefer windowId so the panel
    // stays open when Apply opens the job in a new tab.
    const tabId = sender.tab?.id;
    const windowId = sender.tab?.windowId;
    const opts = windowId ? { windowId } : tabId ? { tabId } : null;
    if (opts && chrome.sidePanel?.open) {
      const opened = chrome.sidePanel.open(opts);
      if (opened?.catch) {
        opened.catch((e) => console.warn('[TalentScreen] sidePanel.open failed:', e.message));
      }
    } else {
      console.warn('[TalentScreen] sidePanel.open skipped — no tab/window on sender');
    }
    sendResponse({ status: 'opened', tabId: tabId || null, windowId: windowId || null });
    return false;
  } else if (request.action === 'ping_wbl_bridge') {
    sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
  } else if (request.action === 'sync_wbl_resume') {
    syncWblResumeToStorage(request)
      .then(() => sendResponse({ status: 'ok' }))
      .catch((e) => sendResponse({ status: 'error', message: e.message || String(e) }));
    return true;
  } else if (request.action === 'fetch_wbl_resume') {
    chrome.storage.local.get(['wblAuth'], async (stored) => {
      try {
        await syncWblResumeToStorage({ wblAuth: stored.wblAuth, candidateId: stored.wblAuth?.candidateId });
        const latest = await chrome.storage.local.get(['resumeData', 'resumeFile']);
        if (!latest.resumeData) {
          sendResponse({ status: stored.wblAuth?.token ? 'empty' : 'no_auth' });
          return;
        }
        sendResponse({
          status: 'ok',
          resumeData: latest.resumeData,
          resumeFile: latest.resumeFile || null,
        });
      } catch (e) {
        sendResponse({ status: 'error', message: e.message || String(e) });
      }
    });
    return true;
  } else if (request.action === 'upload_resume_to_wbl') {
    chrome.storage.local.get(['wblAuth'], async (stored) => {
      try {
        const result = await uploadResumeToMyResume(request.resumeFile, stored.wblAuth);
        if (result?.status === 'no_auth') {
          sendResponse({ status: 'no_auth' });
          return;
        }
        const resumeData = result.candidate_json || null;
        const patch = { resumeFile: request.resumeFile };
        if (resumeData) {
          patch.resumeData = resumeData;
          patch.normalizedData = ResumeProcessor.normalize(resumeData);
        }
        await chrome.storage.local.set(patch);
        sendResponse({ status: 'ok', resumeData });
      } catch (e) {
        sendResponse({ status: 'error', message: e.message || String(e) });
      }
    });
    return true;
  } else if (request.action === 'prepare_talentscreen_apply') {
    return handlePrepareTalentScreenApply(request, sendResponse, sender);
  }
  return false;
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === 'open_side_panel_now') {
    const windowId = sender.tab?.windowId;
    const tabId = sender.tab?.id;
    if (windowId) {
      chrome.sidePanel.open({ windowId });
    } else if (tabId) {
      chrome.sidePanel.open({ tabId });
    }
    sendResponse({ status: 'opened' });
    return;
  }
  if (request.action !== 'prepare_talentscreen_apply' || !sender.url) {
    sendResponse({ status: 'ignored' });
    return;
  }

  try {
    const hostname = new URL(sender.url).hostname;
    if (hostname !== 'whitebox-learning.com' && !hostname.endsWith('.whitebox-learning.com') && hostname !== 'localhost') {
      sendResponse({ status: 'ignored' });
      return;
    }
  } catch {
    sendResponse({ status: 'ignored' });
    return;
  }

  return handlePrepareTalentScreenApply(request, sendResponse, sender);
});

function logApplicationFill(data) {
  chrome.storage.local.get(['pendingSubmissions'], (result) => {
    let pending = result.pendingSubmissions || {};
    try {
      if (!data.url) {
        console.warn("AutoFill: No URL provided for pending submission");
        return;
      }
      const hostname = new URL(data.url).hostname;
      pending[hostname] = { ...data, date: new Date().toISOString() };
      chrome.storage.local.set({ pendingSubmissions: pending });

      // Track autofill completion in Google Analytics
      AnalyticsTracker.trackEvent('autofill_completed', {
        target_company: data.company || 'unknown',
        job_role: data.role || 'unknown',
        application_url: data.url || 'unknown'
      });
    } catch (e) {
      console.error("AutoFill: Error parsing URL for pending submission:", e, data);
    }
  });
}

function logApplicationSubmission(url) {
  if (!url) {
    console.warn("AutoFill: No URL provided for submission");
    return;
  }

  try {
    const hostname = new URL(url).hostname;
    chrome.storage.local.get(['applicationHistory', 'pendingSubmissions'], (result) => {
      let history = result.applicationHistory || [];
      let pending = result.pendingSubmissions || {};

      if (pending[hostname]) {
        const data = pending[hostname];
        const oneMinuteAgo = Date.now() - 60 * 1000;
        const isDuplicate = history.some(item =>
          item.url === data.url &&
          new Date(item.date).getTime() > oneMinuteAgo
        );

        if (!isDuplicate) {
          history.push({
            ...data,
            status: 'submitted',
            date: new Date().toISOString()
          });
          if (history.length > 50) history = history.slice(-50);
          chrome.storage.local.set({ applicationHistory: history });

          // Track application submission in Google Analytics
          AnalyticsTracker.trackEvent('application_submitted', {
            target_company: data.company || 'unknown',
            job_role: data.role || 'unknown',
            application_url: data.url || 'unknown'
          });
        }
        delete pending[hostname];
        chrome.storage.local.set({ pendingSubmissions: pending });
      }
    });
  } catch (e) {
    console.error("AutoFill: Error parsing URL for submission:", e, url);
  }
}

/**
 * Handle feedback email submission
 * Opens user's default email client with pre-filled feedback
 */
function handleFeedbackEmail(feedback, emailBody) {
  try {
    // Create mailto URL
    const recipients = 'sampath.velupula@gmail.com,recruiting@whitebox-learning.com';
    const subject = encodeURIComponent(`TalentScreen Feedback - Rating: ${feedback.rating}/5`);
    const body = encodeURIComponent(emailBody);

    // Mailto has URL length limits, so we'll open a new tab
    // The user can then send the email from their email client
    const mailtoUrl = `mailto:${recipients}?subject=${subject}&body=${body}`;

    // Try to open in new tab
    chrome.tabs.create({ url: mailtoUrl, active: false }, (tab) => {
      // Close the tab after a moment since mailto will open email client
      if (tab && tab.id) {
        setTimeout(() => {
          chrome.tabs.remove(tab.id).catch(() => { });
        }, 2000);
      }
    });
  } catch (error) {
    console.error('[TalentScreen] Error opening feedback email:', error);
  }
}
