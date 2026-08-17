// WBL page bridge — content script on whitebox-learning.com / localhost only.
(function () {
  chrome.runtime.sendMessage({ action: 'ping_wbl_bridge' }, function (resp) {
    if (chrome.runtime.lastError) {
      console.warn('[TalentScreen] Bridge not connected:', chrome.runtime.lastError.message);
    }
  });

  function openSidePanelNow() {
    if (!chrome.runtime?.id) {
      console.warn('[TalentScreen] Extension disconnected — press Ctrl+Shift+R on this page');
      return;
    }
    try {
      chrome.runtime.sendMessage({ action: 'open_side_panel_now' });
    } catch (e) {
      console.warn('[TalentScreen] open_side_panel_now failed:', e.message);
    }
  }

  function persistThenNotifyBg(localPatch, bgMessage) {
    var done = function () {
      if (!chrome.runtime?.id) return;
      chrome.runtime.sendMessage(bgMessage, function () {
        if (chrome.runtime.lastError) {
          console.warn('[TalentScreen]', chrome.runtime.lastError.message);
        }
      });
    };
    if (localPatch && Object.keys(localPatch).length) {
      chrome.storage.local.set(localPatch, done);
    } else {
      done();
    }
  }

  function clearResumeCacheIfCandidateChanged(nextAuth, done) {
    if (!chrome.storage?.local) {
      done();
      return;
    }
    chrome.storage.local.get(['wblAuth'], function (stored) {
      if (stored.wblAuth?.candidateId && nextAuth?.candidateId && stored.wblAuth.candidateId !== nextAuth.candidateId) {
        chrome.storage.local.remove(['resumeData', 'resumeFile', 'normalizedData'], done);
      } else {
        done();
      }
    });
  }

  var bootstrappedCandidateId = null;

  function bootstrapAuthFromPage() {
    var el = document.getElementById('wbl-user-identity');
    if (!el) return;

    var candidateId = Number(el.getAttribute('data-candidate-id'));
    var apiUrl = el.getAttribute('data-api-url') || '';
    if (!candidateId || !apiUrl) return;
    if (bootstrappedCandidateId === candidateId) return;
    bootstrappedCandidateId = candidateId;

    var inject = document.createElement('script');
    inject.textContent = '(' + function () {
      var token = localStorage.getItem('access_token')
        || localStorage.getItem('token')
        || localStorage.getItem('auth_token')
        || localStorage.getItem('bearer_token')
        || '';
      window.postMessage({ type: 'TS_PAGE_TOKEN', token: token }, '*');
    } + ')();';
    (document.head || document.documentElement).appendChild(inject);
    inject.remove();

    window.addEventListener('message', function onToken(event) {
      if (event.source !== window || event.data?.type !== 'TS_PAGE_TOKEN') return;
      window.removeEventListener('message', onToken);
      var token = event.data.token;
      if (!token) {
        console.warn('[TalentScreen] No WBL login token — log in first');
        return;
      }
      var wblAuth = { candidateId: candidateId, token: token, apiUrl: apiUrl };
      clearResumeCacheIfCandidateChanged(wblAuth, function () {
        persistThenNotifyBg({ wblAuth: wblAuth }, {
          action: 'sync_wbl_resume',
          wblAuth: wblAuth,
          candidateId: candidateId,
        });
      });
    });
  }

  function onApplyClick(e) {
    var link = e.target.closest('a[data-talentscreen-apply], a[title="Apply with TalentScreen"]');
    if (!link) return;
    openSidePanelNow();
  }

  document.addEventListener('click', onApplyClick, true);

  window.addEventListener('message', function (event) {
    if (event.source !== window || !event.data) return;

    if (event.data.type === 'TALENTSCREEN_WBL_AUTH') {
      var auth = event.data.payload || null;
      if (!auth) return;
      clearResumeCacheIfCandidateChanged(auth, function () {
        persistThenNotifyBg({ wblAuth: auth }, {
          action: 'sync_wbl_resume',
          wblAuth: auth,
          candidateId: auth.candidateId,
        });
      });
      return;
    }

    if (event.data.type === 'TALENTSCREEN_SYNC_RESUME') {
      var sync = event.data.payload || {};
      var localPatch = {};
      if (sync.wblAuth) localPatch.wblAuth = sync.wblAuth;
      if (sync.resumeData) localPatch.resumeData = sync.resumeData;
      clearResumeCacheIfCandidateChanged(sync.wblAuth, function () {
        persistThenNotifyBg(localPatch, {
          action: 'sync_wbl_resume',
          candidateId: sync.candidateId,
          wblAuth: sync.wblAuth || null,
        });
      });
      return;
    }

    if (event.data.type === 'TALENTSCREEN_LAUNCH') {
      if (!chrome.runtime?.id) return;
      var payload = event.data.payload || {};
      var store = {};
      if (payload.wblAuth) store.wblAuth = payload.wblAuth;
      if (payload.resumeData) store.resumeData = payload.resumeData;
      var slim = Object.assign({}, payload);
      delete slim.resumeFile;
      clearResumeCacheIfCandidateChanged(payload.wblAuth, function () {
        persistThenNotifyBg(store, Object.assign({ action: 'prepare_talentscreen_apply' }, slim));
      });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapAuthFromPage);
  } else {
    bootstrapAuthFromPage();
  }

  new MutationObserver(function () {
    if (document.getElementById('wbl-user-identity')) bootstrapAuthFromPage();
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
