# Phase 1 Testing Guide

## Quick Test Checklist

### Setup
1. Load extension in Chrome: `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select extension directory
5. Pin extension to toolbar

---

## Test 1: Feedback Modal

### Steps
1. Open extension sidepanel on any job site
2. Click feedback button (💬 icon) in header
3. Verify modal opens with:
   - Title: "Share Your Feedback"
   - Rating scale 0-10
   - 6 problem checkboxes
   - Free text area
   - Cancel and Submit buttons

4. Select rating (e.g., 8)
5. Check 2 problems (e.g., "fields not detected", "process too long")
6. Enter feedback text: "Great extension but needs improvement on..."
7. Click Submit

### Expected Results
✅ Modal opens smoothly  
✅ Rating highlights when selected  
✅ Checkboxes toggle correctly  
✅ Text area accepts input  
✅ Success message displays: "Thank You!"  
✅ Modal closes after clicking "Done"  
✅ Can close with Escape key or overlay click

### Verify Data Saved
1. Open DevTools Console
2. Run:
```javascript
chrome.storage.local.get(['feedbackSubmissions'], (result) => {
  console.log('Feedback:', result.feedbackSubmissions);
});
```
3. Should see array with feedback object containing:
   - rating: 8
   - problems: [...] 
   - feedback: "Great extension..."
   - timestamp
   - session data (if on job site)

---

## Test 2: Autofill Confirmation

### Test 2A: With Existing Progress

#### Steps
1. Open extension on supported job site (e.g., Greenhouse, Lever)
2. Upload JSON and PDF resume
3. Click "Autofill" button
4. Wait for some fields to fill
5. Click "Autofill" button again

#### Expected Results
✅ Confirmation dialog appears:
   - Title: "Autofill Again?"
   - Message: "Are you sure you want to autofill again? This will overwrite your current progress."
   - Checkbox: "Don't ask again"
   - Buttons: "Cancel" and "Yes, Autofill"

✅ Clicking "Cancel" closes dialog, no autofill  
✅ Clicking "Yes, Autofill" proceeds with autofill  
✅ Checking "Don't ask again" saves preference

### Test 2B: Without Existing Progress

#### Steps
1. Open extension on new job site (no fields filled)
2. Click "Autofill" button

#### Expected Results
✅ No confirmation dialog  
✅ Autofill starts immediately

### Test 2C: Don't Ask Again Preference

#### Steps
1. Repeat Test 2A but check "Don't ask again"
2. Reload page
3. Fill form again
4. Click "Autofill" button again

#### Expected Results
✅ No confirmation dialog (preference saved)  
✅ Autofill starts immediately

### Verify Preference Saved
```javascript
chrome.storage.local.get(['userPreferences'], (result) => {
  console.log('Preferences:', result.userPreferences);
  // Should show: { dontAskAgainAutofill: true }
});
```

### Reset Preference
```javascript
chrome.storage.local.set({ 
  userPreferences: { dontAskAgainAutofill: false } 
});
```

---

## Test 3: Unsupported Page View

### Test 3A: Unsupported Site

#### Steps
1. Navigate to unsupported job site:
   - Try: `https://www.example.com/jobs/` 
   - Or: `https://careers.stripe.com/` (if not in supported list)
2. Open extension sidepanel

#### Expected Results
✅ Shows unsupported view with:
   - Icon: Circle with exclamation mark
   - Title: "Autofill Not Supported"
   - Message: "Save this job in one click. Track this application and prepare autofill information."
   - Button: "Submit Request"
   - Button: "Find More Jobs"
   - Info text explaining why not supported

### Test 3B: Submit Request Button

#### Steps
1. On unsupported site, click "Submit Request"

#### Expected Results
✅ Opens new tab to GitHub issues page  
✅ Issue title pre-filled: "Add support for: [Page Title]"  
✅ Issue body contains:
   - URL of the page
   - Request for ATS support

### Test 3C: Find More Jobs Button

#### Steps
1. On unsupported site, click "Find More Jobs"

#### Expected Results
✅ Opens new tab to popular job board  
✅ One of: LinkedIn Jobs, Indeed, or Glassdoor

### Test 3D: Supported Site

#### Steps
1. Navigate to supported job site:
   - Greenhouse: `https://boards.greenhouse.io/`
   - Lever: `https://jobs.lever.co/`
   - Workday: Any `*.myworkdayjobs.com` site
2. Open extension sidepanel

#### Expected Results
✅ Shows normal setup view (if no resume) OR active view (if resume uploaded)  
✅ Does NOT show unsupported view

---

## Test 4: Integration Tests

### Test 4A: Complete Flow

#### Steps
1. Open Greenhouse job posting: `https://boards.greenhouse.io/embed/job_app?token=...`
2. Open sidepanel
3. Upload JSON resume
4. Upload PDF resume
5. Click "Complete Setup"
6. Click "Autofill" (no confirmation - first time)
7. Wait for fields to fill
8. Click feedback button
9. Submit feedback with rating 9
10. Click "Autofill" again (should show confirmation)
11. Select "Don't ask again"
12. Click "Yes, Autofill"
13. Navigate to unsupported site
14. Open sidepanel (should show unsupported view)

#### Expected Results
✅ All steps complete without errors  
✅ Feedback saved  
✅ Preference saved  
✅ UI switches correctly between views

### Test 4B: Cross-Tab Behavior

#### Steps
1. Open Tab A: Supported job site with autofill progress
2. Open Tab B: Different supported job site (no progress)
3. Click autofill in Tab A → Should show confirmation
4. Click autofill in Tab B → Should NOT show confirmation

#### Expected Results
✅ Confirmation is tab-specific (based on progress)

---

## Test 5: Error Handling

### Test 5A: Storage Error

#### Steps
1. Disable storage permission (impossible in MV3, but simulate)
2. Try to submit feedback

#### Expected Results
✅ Graceful error handling  
✅ No crash or freeze

### Test 5B: No Active Tab

#### Steps
1. Open sidepanel on chrome://extensions page
2. Try to click "Submit Request" or "Find Jobs"

#### Expected Results
✅ Buttons disabled or show error  
✅ No crash

### Test 5C: Network Offline

#### Steps
1. Disable network
2. Try to open GitHub issue

#### Expected Results
✅ Browser shows offline error  
✅ Extension doesn't crash

---

## Test 6: Dark Mode

### Steps
1. Enable dark mode: System Preferences → Appearance → Dark
2. Open sidepanel
3. Test all Phase 1 features

### Expected Results
✅ Feedback modal has dark background  
✅ Confirmation dialog has dark background  
✅ Unsupported view has dark background  
✅ Text readable in dark mode  
✅ Icons visible in dark mode

---

## Test 7: Keyboard Navigation

### Feedback Modal
- ✅ Tab navigates through rating options
- ✅ Space/Enter selects rating
- ✅ Tab navigates through checkboxes
- ✅ Space toggles checkboxes
- ✅ Tab to text area
- ✅ Tab to Submit button
- ✅ Escape closes modal

### Confirmation Dialog
- ✅ Tab to checkbox
- ✅ Tab to Cancel button
- ✅ Tab to Confirm button
- ✅ Enter confirms
- ✅ Escape cancels

---

## Test 8: Mobile/Responsive (if applicable)

### Steps
1. Open DevTools
2. Toggle device emulation (iPhone, iPad)
3. Test all features

### Expected Results
✅ Modals fit screen  
✅ Buttons accessible  
✅ Text readable  
✅ No horizontal scroll

---

## Performance Tests

### Test 9A: Load Time
- ✅ Sidepanel opens in < 500ms
- ✅ Feedback modal opens in < 200ms
- ✅ Confirmation dialog opens in < 200ms

### Test 9B: Memory Usage
1. Open Chrome Task Manager
2. Check extension memory usage
3. Open/close modals 10 times

#### Expected Results
✅ Memory stays stable (no leak)  
✅ Memory < 50MB

---

## Browser Compatibility

### Test in Multiple Browsers
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Brave (latest)

### Expected Results
✅ All features work identically  
✅ No browser-specific bugs

---

## Automated Testing (Optional)

### Using Playwright

```javascript
// tests/phase1.spec.js
const { test, expect } = require('@playwright/test');

test('Feedback modal opens and submits', async ({ page }) => {
  await page.goto('chrome-extension://[id]/src/ui/sidepanel.html');
  
  // Click feedback button
  await page.click('#feedbackBtn');
  
  // Wait for modal
  await page.waitForSelector('.feedback-modal');
  
  // Select rating
  await page.click('input[name="rating"][value="8"]');
  
  // Check problem
  await page.check('input[value="fields_not_detected"]');
  
  // Enter feedback
  await page.fill('#feedbackText', 'Test feedback');
  
  // Submit
  await page.click('.feedback-btn-submit');
  
  // Wait for success
  await page.waitForSelector('.feedback-success');
  
  expect(await page.textContent('.feedback-success h3')).toBe('Thank You!');
});

test('Confirmation shows on second autofill', async ({ page, context }) => {
  // Setup extension context
  // Navigate to job site
  // Fill form once
  // Click autofill again
  // Verify confirmation appears
});
```

---

## Bug Report Template

If you find a bug, report using this template:

```
**Feature:** [Feedback Modal / Confirmation / Unsupported View]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 120.0.0
- Extension Version: 2.1.0
- OS: macOS 14.0

**Console Errors:**
```
[Paste any errors here]
```

**Additional Context:**

```

---

## Success Criteria

Phase 1 passes testing if:

1. ✅ Feedback modal collects and stores data correctly
2. ✅ Confirmation prevents accidental overwrites
3. ✅ Unsupported view guides users gracefully
4. ✅ No crashes or errors in normal usage
5. ✅ Dark mode works correctly
6. ✅ Keyboard navigation works
7. ✅ Data persists across sessions
8. ✅ All buttons and links functional

---

## Test Results Log

Date: ___________  
Tester: ___________

| Test | Status | Notes |
|------|--------|-------|
| Feedback Modal | ☐ Pass ☐ Fail | |
| Autofill Confirmation | ☐ Pass ☐ Fail | |
| Unsupported View | ☐ Pass ☐ Fail | |
| Integration | ☐ Pass ☐ Fail | |
| Error Handling | ☐ Pass ☐ Fail | |
| Dark Mode | ☐ Pass ☐ Fail | |
| Keyboard Nav | ☐ Pass ☐ Fail | |
| Performance | ☐ Pass ☐ Fail | |

**Overall Status:** ☐ PASS ☐ FAIL  

**Ready for Production:** ☐ YES ☐ NO

---

## Next Steps After Testing

If all tests pass:
1. Update version to 2.1.0 in manifest.json
2. Create git commit: "feat: Phase 1 - Feedback, Confirmation, Unsupported View"
3. Create release notes
4. Proceed to Phase 2 implementation

If tests fail:
1. Document failures in GitHub issues
2. Fix bugs
3. Re-test
4. Repeat until all tests pass
