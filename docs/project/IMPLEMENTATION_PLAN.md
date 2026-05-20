# TalentScreen Extension - Implementation Plan

## Overview
This document provides a phased approach to complete the missing features identified in IMPLEMENTATION_STATUS.md.

---

## Phase 1: Critical UX Features (Week 1)

### 1.1 Feedback Modal
**Priority:** 🔴 High  
**Effort:** Medium (4-6 hours)

**Tasks:**
- [ ] Create `src/ui/components/feedback-modal.html`
- [ ] Create `src/ui/components/feedback-modal.js`
- [ ] Add feedback button to sidepanel header
- [ ] Implement rating scale (0-10)
- [ ] Add problem checkboxes (6 options)
- [ ] Add free text area
- [ ] Store feedback in `chrome.storage.local.feedbackSubmissions`
- [ ] Add export feedback functionality

**Files to Create:**
```
src/ui/components/
├── feedback-modal.html
├── feedback-modal.js
└── feedback-modal.css
```

**Integration:**
```javascript
// sidepanel.html - Add feedback button
<button id="feedbackBtn" class="icon-btn" title="Send Feedback">
  <svg>...</svg>
</button>

// sidepanel.js - Show modal
document.getElementById('feedbackBtn').addEventListener('click', () => {
  FeedbackModal.show(currentSession);
});
```

---

### 1.2 Autofill Again Confirmation
**Priority:** 🔴 High  
**Effort:** Small (2-3 hours)

**Tasks:**
- [ ] Create reusable confirmation dialog component
- [ ] Check for existing progress before autofill
- [ ] Show confirmation modal if progress exists
- [ ] Add "Don't ask again" checkbox
- [ ] Store preference in `chrome.storage.local.dontAskAgainAutofill`
- [ ] Bypass confirmation if preference is set

**Implementation:**
```javascript
// src/ui/components/confirmation-dialog.js
class ConfirmationDialog {
  static show({ title, message, dontAskAgainKey, onConfirm, onCancel }) {
    // Modal HTML
    // Return promise
  }
}

// sidepanel.js - fillFormBtn handler
async function handleFillForm() {
  const hasProgress = FormTracker.hasActiveSession();
  
  if (hasProgress && !dontAskAgainPreference) {
    const confirmed = await ConfirmationDialog.show({
      title: 'Autofill Again?',
      message: 'Are you sure to autofill again? This will overwrite your current progress.',
      dontAskAgainKey: 'dontAskAgainAutofill'
    });
    
    if (!confirmed) return;
  }
  
  // Proceed with autofill
  initiateAutofill();
}
```

---

### 1.3 Unsupported Page View
**Priority:** 🔴 High  
**Effort:** Medium (3-4 hours)

**Tasks:**
- [ ] Add ATS detection to `updateUI()` in sidepanel.js
- [ ] Create unsupported view HTML in sidepanel.html
- [ ] Add "Submit Request" button (opens GitHub issue or form)
- [ ] Add "Find More Jobs" button (links to job boards)
- [ ] Update messaging (no AI references)
- [ ] Add floating icon state

**Implementation:**
```javascript
// sidepanel.js
function updateUI() {
  const atsType = detectCurrentATS();
  const isSupported = SUPPORTED_ATS.includes(atsType);
  
  if (!isSupported) {
    showUnsupportedView();
  } else {
    showSupportedView();
  }
}

function showUnsupportedView() {
  setupView.classList.add('hidden');
  activeView.classList.add('hidden');
  unsupportedView.classList.remove('hidden');
}
```

**HTML:**
```html
<!-- sidepanel.html -->
<div id="unsupportedView" class="hidden">
  <div class="unsupported-card">
    <svg class="unsupported-icon">...</svg>
    <h3>Autofill Not Supported</h3>
    <p>Save this job in one click</p>
    <p>Track this application and prepare autofill information</p>
    <button id="submitRequestBtn">Submit Request</button>
    <button id="findJobsBtn" class="secondary">Find More Jobs</button>
  </div>
</div>
```

---

## Phase 2: Settings & Configuration (Week 2)

### 2.1 Settings Manager Module
**Priority:** 🟡 Medium  
**Effort:** Small (2-3 hours)

**Tasks:**
- [ ] Create `src/core/settingsManager.js`
- [ ] Centralize all settings in one storage key
- [ ] Add default settings
- [ ] Add get/set methods
- [ ] Add validation

**Implementation:**
```javascript
// src/core/settingsManager.js
const SettingsManager = {
  defaults: {
    autofillAfterPageTurn: 'manually', // 'automatically' | 'manually'
    defaultPluginView: 'expanded', // 'expanded' | 'minimized'
    dontAskAgainAutofill: false,
    fillEEO: false,
    fillLegal: false,
    fillSensitive: false,
    debugMode: false
  },
  
  async get(key) {
    const settings = await chrome.storage.local.get('userSettings');
    return settings.userSettings?.[key] ?? this.defaults[key];
  },
  
  async set(key, value) {
    const settings = await chrome.storage.local.get('userSettings');
    const updated = { ...settings.userSettings, [key]: value };
    await chrome.storage.local.set({ userSettings: updated });
  },
  
  async getAll() {
    const settings = await chrome.storage.local.get('userSettings');
    return { ...this.defaults, ...settings.userSettings };
  }
};
```

---

### 2.2 Add Missing Settings
**Priority:** 🟡 Medium  
**Effort:** Small (1-2 hours)

**Tasks:**
- [ ] Add "Autofill After Page Turn" to Preferences section
- [ ] Add "Default Plugin View" to Preferences section
- [ ] Wire up to SettingsManager
- [ ] Apply settings in autofill logic

**HTML Addition to settings.html:**
```html
<!-- Preferences Section -->
<div class="subsection">
  <h3>Autofill Behavior</h3>
  
  <div class="form-group">
    <label>Autofill After Page Turn</label>
    <select id="autofillAfterPageTurn">
      <option value="automatically">Automatically</option>
      <option value="manually">Manually</option>
    </select>
    <p class="form-hint">
      Automatically: Continue autofill when moving to next page/step.<br>
      Manually: Click Autofill again on each page.
    </p>
  </div>
  
  <div class="form-group">
    <label>Default Plugin View</label>
    <select id="defaultPluginView">
      <option value="expanded">Expanded</option>
      <option value="minimized">Minimized</option>
    </select>
    <p class="form-hint">
      Expanded: Panel opens by default.<br>
      Minimized: Only floating icon is shown.
    </p>
  </div>
</div>
```

---

### 2.3 Complete Autofill Information Fields
**Priority:** 🟡 Medium  
**Effort:** Medium (3-4 hours)

**Tasks:**
- [ ] Add Middle Name field
- [ ] Add Phone Type dropdown
- [ ] Add Address Line field
- [ ] Add County field
- [ ] Sync with settings.html fields
- [ ] Update resumeProcessor.js to handle new fields
- [ ] Add required field asterisks consistently
- [ ] Add info banner message

**Fields to Add:**
```html
<div class="form-group">
  <label>First Name <span class="required">*</span></label>
  <input type="text" id="firstName" required>
</div>

<div class="form-group">
  <label>Middle Name</label>
  <input type="text" id="middleName">
</div>

<div class="form-group">
  <label>Last Name <span class="required">*</span></label>
  <input type="text" id="lastName" required>
</div>

<div class="form-group">
  <label>Phone Type</label>
  <select id="phoneType">
    <option value="mobile">Mobile</option>
    <option value="home">Home</option>
    <option value="work">Work</option>
  </select>
</div>

<div class="form-group full-width">
  <label>Address Line</label>
  <input type="text" id="addressLine" placeholder="123 Main Street, Apt 4B">
</div>

<div class="form-group">
  <label>County</label>
  <input type="text" id="county">
</div>
```

**Info Banner:**
```html
<div class="info-banner">
  <svg class="info-icon">...</svg>
  <p>Your autofill information updates automatically when you change your uploaded resume or update information in an application form.</p>
</div>
```

---

## Phase 3: Resume Management (Week 3)

### 3.1 Resume Selection Modal
**Priority:** 🟡 Medium  
**Effort:** Large (6-8 hours)

**Tasks:**
- [ ] Create `src/ui/components/resume-selector-modal.html`
- [ ] Create `src/ui/components/resume-selector-modal.js`
- [ ] Support multiple resume storage
- [ ] Add primary resume marking
- [ ] Add resume name editing
- [ ] Add "Apply without resume" option
- [ ] Add resume preview panel
- [ ] Add version selection (Extension Template vs Original)
- [ ] Add Download Resume button
- [ ] Wire up to file upload fields

**Data Structure:**
```javascript
// chrome.storage.local.resumes
{
  resumes: [
    {
      id: 'uuid-1',
      name: 'Software Engineer Resume',
      fileName: 'resume_v2.pdf',
      jsonData: {...},
      fileData: 'base64...',
      fileSize: 245678,
      fileType: 'application/pdf',
      uploadedAt: '2026-05-15T10:30:00Z',
      isPrimary: true,
      version: 'original' // or 'extension-template'
    }
  ],
  selectedResumeId: 'uuid-1',
  applyWithoutResume: false
}
```

**Modal UI:**
```html
<div class="resume-selector-modal">
  <h2>View & Select Your Resume</h2>
  
  <div class="resume-list">
    <div class="resume-item primary">
      <div class="resume-info">
        <input type="text" value="Software Engineer Resume" class="resume-name-edit">
        <span class="resume-meta">resume_v2.pdf • 240 KB • May 15, 2026</span>
      </div>
      <div class="resume-actions">
        <button class="btn-icon" title="Download">⬇️</button>
        <button class="btn-icon" title="Delete">🗑️</button>
        <span class="primary-badge">Primary</span>
      </div>
    </div>
  </div>
  
  <label class="checkbox-label">
    <input type="checkbox" id="applyWithoutResume">
    Apply without resume
  </label>
  
  <div class="resume-preview">
    <!-- PDF preview or JSON view -->
  </div>
  
  <div class="version-selector">
    <label>Version:</label>
    <select>
      <option value="original">Original Version</option>
      <option value="extension-template">Extension Template</option>
    </select>
  </div>
  
  <div class="modal-actions">
    <button class="btn-secondary">Cancel</button>
    <button class="btn-primary">Continue</button>
  </div>
</div>
```

---

## Phase 4: Smart Autofill Features (Week 4)

### 4.1 CAPTCHA Detection
**Priority:** 🟡 Medium  
**Effort:** Small (2 hours)

**Tasks:**
- [ ] Create `src/core/captchaDetector.js`
- [ ] Detect reCAPTCHA v2/v3
- [ ] Detect hCaptcha
- [ ] Detect Cloudflare Turnstile
- [ ] Mark surrounding fields as NEEDS_REVIEW
- [ ] Show user alert

**Implementation:**
```javascript
// src/core/captchaDetector.js
const CaptchaDetector = {
  detect() {
    return {
      hasCaptcha: this.hasRecaptcha() || this.hasHcaptcha() || this.hasTurnstile(),
      type: this.getType(),
      element: this.getElement()
    };
  },
  
  hasRecaptcha() {
    return !!(
      document.querySelector('.g-recaptcha') ||
      document.querySelector('[data-sitekey]') ||
      document.querySelector('iframe[src*="recaptcha"]') ||
      window.grecaptcha
    );
  },
  
  hasHcaptcha() {
    return !!(
      document.querySelector('.h-captcha') ||
      document.querySelector('iframe[src*="hcaptcha"]') ||
      window.hcaptcha
    );
  },
  
  hasTurnstile() {
    return !!(
      document.querySelector('[data-cf-turnstile]') ||
      document.querySelector('iframe[src*="turnstile"]')
    );
  }
};
```

---

### 4.2 Dynamic Form Watcher
**Priority:** 🟡 Medium  
**Effort:** Medium (4-5 hours)

**Tasks:**
- [ ] Create `src/content/dynamicFormWatcher.js`
- [ ] Add debounced MutationObserver
- [ ] Detect new form fields
- [ ] Detect page navigation
- [ ] Detect dropdown option loading
- [ ] Trigger retry for pending fields
- [ ] Optimize performance with throttling

**Implementation:**
```javascript
// src/content/dynamicFormWatcher.js
const DynamicFormWatcher = {
  observer: null,
  debounceTimer: null,
  
  init() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'disabled', 'hidden']
    });
  },
  
  handleMutations(mutations) {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(() => {
      const newFields = this.detectNewFields();
      const loadedDropdowns = this.detectLoadedDropdowns();
      const pageChanged = this.detectPageChange();
      
      if (newFields.length > 0) {
        FormTracker.addNewFields(newFields);
        this.retryPendingFills();
      }
      
      if (loadedDropdowns.length > 0) {
        FormTracker.retryFields(loadedDropdowns);
      }
      
      if (pageChanged) {
        this.handlePageChange();
      }
    }, 500); // Debounce 500ms
  },
  
  detectNewFields() {
    // Compare current fields to tracked fields
    const currentFields = document.querySelectorAll('input, select, textarea');
    const trackedIds = FormTracker.getTrackedFieldIds();
    
    return Array.from(currentFields).filter(field => {
      const id = this.getFieldId(field);
      return !trackedIds.includes(id);
    });
  }
};
```

---

### 4.3 User Value Preservation
**Priority:** 🟡 Medium  
**Effort:** Small (2-3 hours)

**Tasks:**
- [ ] Check if field has user-entered value before filling
- [ ] Show confirmation if overwriting non-empty field
- [ ] Add "Always overwrite" preference
- [ ] Skip confirmation for empty fields
- [ ] Update UI to show preserved fields

**Implementation:**
```javascript
// autofillAPI.js - _fillField method
async _fillField(element, value, type) {
  const currentValue = element.value || element.checked;
  
  if (currentValue && currentValue !== value) {
    const overwritePreference = await SettingsManager.get('alwaysOverwrite');
    
    if (!overwritePreference) {
      const confirmed = await this._confirmOverwrite(element, currentValue, value);
      if (!confirmed) {
        FormTracker.markAsUserFilled(element);
        return; // Skip this field
      }
    }
  }
  
  // Proceed with fill
  if (type === 'select') {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (type === 'checkbox') {
    element.checked = !!value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
```

---

## Phase 5: Polish & Optimization (Week 5)

### 5.1 Company Logo & Job Metadata
**Priority:** 🟢 Low  
**Effort:** Medium (4-5 hours)

**Tasks:**
- [ ] Add company logo fetching (Clearbit API or similar)
- [ ] Extract industry/category from job posting
- [ ] Extract posted time from page
- [ ] Extract applicant count if available
- [ ] Update job card UI with real data

---

### 5.2 Match Score (Optional)
**Priority:** 🟢 Low  
**Effort:** Large (8+ hours)

**Tasks:**
- [ ] Design matching algorithm
- [ ] Compare skills to job requirements
- [ ] Compare experience level
- [ ] Calculate percentage match
- [ ] Display in UI
- [ ] Add explanation tooltip

---

### 5.3 Performance Optimization
**Priority:** 🟢 Low  
**Effort:** Medium (3-4 hours)

**Tasks:**
- [ ] Profile DOM scanning performance
- [ ] Add throttling to field detection
- [ ] Optimize MutationObserver
- [ ] Add lazy loading for large forms
- [ ] Reduce memory footprint
- [ ] Add performance metrics to tracking

---

### 5.4 CLI API Enhancements
**Priority:** 🟡 Medium  
**Effort:** Small (1-2 hours)

**Tasks:**
- [ ] Add `retryFailed()` method
- [ ] Add `resumeFile` option support
- [ ] Add `overwriteExisting` option
- [ ] Add `autoContinueOnNextPage` option
- [ ] Update API documentation

**Implementation:**
```javascript
// autofillAPI.js
async retryFailed() {
  const failedFields = FormTracker.getFailedFields();
  const results = {
    total: failedFields.length,
    succeeded: 0,
    failed: 0,
    fields: []
  };
  
  for (const field of failedFields) {
    try {
      await this._retryField(field);
      results.succeeded++;
      results.fields.push({ ...field, status: 'success' });
    } catch (error) {
      results.failed++;
      results.fields.push({ ...field, status: 'failed', error: error.message });
    }
  }
  
  return results;
}
```

---

## Testing Strategy

### Unit Tests
```javascript
// tests/unit/
├── resumeProcessor.test.js
├── formTracker.test.js
├── settingsManager.test.js
├── captchaDetector.test.js
└── autofillAPI.test.js
```

### Integration Tests
```javascript
// tests/integration/
├── storage.test.js           // Chrome storage operations
├── messaging.test.js         // Content <-> Background messaging
└── session-tracking.test.js  // Full session lifecycle
```

### E2E Tests (Playwright)
```javascript
// tests/e2e/
├── greenhouse.spec.js
├── lever.spec.js
├── workday.spec.js
├── linkedin.spec.js
└── cli-api.spec.js          // Test window.AutofillExtension API
```

**Example E2E Test:**
```javascript
// tests/e2e/cli-api.spec.js
test('CLI API: fill form via window.AutofillExtension', async ({ page }) => {
  await page.goto('https://boards.greenhouse.io/example/jobs/123');
  
  // Inject profile
  const profile = { basics: { name: 'John Doe', email: 'john@example.com' } };
  await page.evaluate((prof) => {
    return window.AutofillExtension.injectProfile(prof);
  }, profile);
  
  // Fill form
  const result = await page.evaluate(() => {
    return window.AutofillExtension.fill(window.AutofillExtension.getProfile());
  });
  
  expect(result.fields.filled.length).toBeGreaterThan(0);
  expect(result.completion.percentage).toBeGreaterThan(50);
});
```

---

## Deployment Checklist

### Pre-Release
- [ ] All Phase 1 features complete
- [ ] All unit tests passing
- [ ] E2E tests on top 5 ATS platforms
- [ ] Manual testing on real job postings
- [ ] Performance profiling
- [ ] Security audit (no data leaks)
- [ ] Privacy compliance check
- [ ] Documentation updated

### Release
- [ ] Bump version in manifest.json
- [ ] Create release notes
- [ ] Build production bundle
- [ ] Test in Chrome/Edge
- [ ] Submit to Chrome Web Store
- [ ] Update README.md
- [ ] Tag release in Git

### Post-Release
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Plan Phase 2 features

---

## Estimated Timeline

| Phase | Duration | Features |
|-------|----------|----------|
| Phase 1 | 1 week | Feedback Modal, Autofill Confirmation, Unsupported View |
| Phase 2 | 1 week | Settings Manager, Missing Settings, Complete Forms |
| Phase 3 | 1 week | Resume Selection Modal |
| Phase 4 | 1 week | CAPTCHA Detection, Dynamic Watcher, Value Preservation |
| Phase 5 | 1 week | Polish, Optimization, CLI Enhancements |
| **Total** | **5 weeks** | **All features complete** |

---

## Resource Requirements

**Developer Time:**
- Full-time: 5 weeks
- Part-time (50%): 10 weeks
- Part-time (25%): 20 weeks

**Testing Time:**
- Automated tests: 1 week
- Manual QA: 1 week

**Total Project: 6-7 weeks** (with full-time developer + tester)

---

## Success Metrics

**Post-Phase 1:**
- ✅ Users can provide feedback easily
- ✅ No accidental data overwrites
- ✅ Graceful handling of unsupported sites

**Post-Phase 2:**
- ✅ All required fields editable
- ✅ User preferences saved and applied
- ✅ Settings UI complete

**Post-Phase 3:**
- ✅ Multi-resume management
- ✅ Resume selection workflow
- ✅ Apply without resume option

**Post-Phase 4:**
- ✅ CAPTCHA detection working
- ✅ Dynamic forms handled
- ✅ User values preserved

**Post-Phase 5:**
- ✅ 95% field fill success rate
- ✅ <2 second autofill time
- ✅ 100% CLI API coverage
- ✅ Zero data leaks
- ✅ All ATS platforms supported

---

## Contact & Questions

For questions about this implementation plan, contact:
- **Email:** [your-email]
- **GitHub:** [your-github]
- **Documentation:** See IMPLEMENTATION_STATUS.md for detailed status
