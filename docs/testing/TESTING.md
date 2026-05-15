# Testing Guide

## Pre-Release Checklist

### ✅ Installation & Setup
- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] No manifest.json validation errors
- [ ] Service worker starts successfully
- [ ] Icon appears in Chrome toolbar

### ✅ UI Flow
- [ ] Setup screen displays on first load (no resume data)
- [ ] JSON upload button works
- [ ] PDF upload button works
- [ ] Sample JSON link opens correct GitHub URL
- [ ] After JSON upload, active view appears
- [ ] "Manage Information" modal opens/closes
- [ ] Quick action buttons (Update JSON/PDF) work
- [ ] Status messages appear and auto-dismiss

### ✅ Data Validation
- [ ] Invalid JSON shows error message
- [ ] Missing required fields (name, email) show validation error
- [ ] PDF file size >10MB rejected with error
- [ ] Non-PDF/DOC files rejected
- [ ] Malformed JSON doesn't crash extension

### ✅ Autofill Functionality
- [ ] Navigate to test job board (e.g., Greenhouse demo)
- [ ] Click "Autofill Form" button
- [ ] Fields populate correctly
- [ ] Progress bar appears and updates
- [ ] Status message confirms success

### ✅ User Lock System
- [ ] Fill form with autofill
- [ ] Manually change a field value
- [ ] Click "Autofill Form" again
- [ ] Manually edited field NOT overwritten
- [ ] Other fields re-fill normally

### ✅ History Tracking
- [ ] Application appears in history after autofill
- [ ] Recent applications show with relative timestamps
- [ ] Company and role names displayed
- [ ] Clear history button works

### ✅ Error Handling
- [ ] Click "Autofill" on non-job page → shows error
- [ ] Reload page during autofill → no crash
- [ ] Close sidepanel during operation → no crash
- [ ] Storage quota exceeded → helpful error (if testable)

### ✅ ATS Platform Tests

Test on at least 3 platforms from different categories:

#### Greenhouse (Modern)
- URL: `https://boards.greenhouse.io/embed/job_board?for=[company]`
- [ ] Name fields fill
- [ ] Email fills
- [ ] Phone fills
- [ ] Resume attachment works
- [ ] Education dropdown works

#### Workday (Enterprise)
- URL: `https://[company].myworkdayjobs.com/`
- [ ] Apply button clicked/highlighted
- [ ] Personal info section fills
- [ ] Work experience section fills
- [ ] EEO questions fill (if custom_fields present)

#### Lever (Startup-Friendly)
- URL: `https://jobs.lever.co/[company]`
- [ ] Full name fills
- [ ] Location fills
- [ ] LinkedIn URL fills
- [ ] Cover letter/Why interested fills (if in custom_fields)

### ✅ Custom Fields (Extended Schema)

Using sample resume with `custom_fields`:

- [ ] EEO fields (gender, ethnicity, veteran) fill
- [ ] Legal fields (work_auth_us, sponsorship) fill
- [ ] Technical screening (years_python, etc.) fill
- [ ] Screening answers (why_interested, why_good_fit) fill in text areas

### ✅ Browser Compatibility
- [ ] Chrome stable (latest)
- [ ] Chrome Beta
- [ ] Chromium
- [ ] Edge (Chromium-based)

### ✅ Performance
- [ ] Extension loads in <1 second
- [ ] Autofill completes in <5 seconds on typical form
- [ ] No memory leaks after 10+ autofills (check Task Manager)
- [ ] Works on pages with 50+ form fields

### ✅ Security & Privacy
- [ ] No data sent to external servers (check Network tab)
- [ ] All storage is local (verify in DevTools → Application → Storage)
- [ ] No eval() or unsafe code execution
- [ ] CSP headers respected

---

## Test Data

### Minimal Valid JSON
```json
{
  "basics": {
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Complete Test JSON
Use `docs/sample_resume.json`

### Invalid Test Cases
1. **Missing email**: Remove `basics.email`
2. **Malformed JSON**: Add syntax error
3. **Empty file**: `{}`
4. **Non-JSON**: Upload `.txt` file

---

## Regression Tests (v1.6 → v2.0)

- [ ] Existing v1.6 user data still works
- [ ] Old JSON format (without custom_fields) works
- [ ] Application history from v1.6 displays correctly
- [ ] Upgrade doesn't lose stored resume data

---

## Bug Reporting Template

```
**Environment:**
- Chrome Version: [e.g., 125.0.6422.60]
- Extension Version: 2.0.0
- OS: [e.g., macOS 14.5]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Screenshots:**
(Attach if applicable)

**Console Errors:**
(Open DevTools → Console, paste errors)

**Workaround:**
(If found)
```

---

## Automated Testing (Future)

### Unit Tests (Vitest)
```javascript
// src/core/resumeProcessor.test.js
describe('ResumeProcessor.normalize', () => {
  it('should handle missing email', () => {
    const input = { basics: { name: "Test" } };
    expect(() => ResumeProcessor.normalize(input)).toThrow();
  });
});
```

### E2E Tests (Playwright)
```javascript
// tests/e2e/autofill.spec.js
test('should fill Greenhouse form', async ({ page, context }) => {
  await page.goto('https://boards.greenhouse.io/embed/job_board');
  // ... autofill test
});
```

---

## Manual Test Report Template

```markdown
# Test Report - v2.0.0

**Date:** 2026-05-14
**Tester:** [Name]
**Environment:** Chrome 125 / macOS 14

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Installation | ✅ Pass | No errors |
| JSON Upload | ✅ Pass | Validation works |
| Greenhouse Autofill | ✅ Pass | All fields filled |
| User Lock System | ⚠️ Partial | Issue with checkboxes |
| History Tracking | ✅ Pass | |

## Issues Found

1. **Issue #1**: Checkbox user-lock not working
   - Severity: Medium
   - Steps: [...]
   - Workaround: None

## Overall Assessment

- **Pass**: 18/20 tests
- **Fail**: 0/20 tests
- **Partial**: 2/20 tests
- **Recommendation:** Ready for beta / Needs fixes
```
