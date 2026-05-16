# Phase 4 Testing Guide: Smart Autofill Features

**Phase**: 4 - Smart Autofill Features  
**Status**: Ready for Testing  
**Date**: May 15, 2026

## Test Environment Setup

1. Load unpacked extension in Chrome
2. Open Developer Tools (F12) → Console tab
3. Navigate to job application pages with various scenarios
4. Have test resume uploaded in extension

## Test Categories

- [CAPTCHA Detection](#1-captcha-detection)
- [Dynamic Form Watcher](#2-dynamic-form-watcher)
- [User Value Preservation](#3-user-value-preservation)
- [Integration Tests](#4-integration-tests)
- [Performance Tests](#5-performance-tests)
- [Edge Cases](#6-edge-cases)

---

## 1. CAPTCHA Detection

### Test 1.1: Detect reCAPTCHA v2
**Objective**: Verify reCAPTCHA v2 (checkbox) detection

**Steps**:
1. Navigate to page with reCAPTCHA v2 (e.g., Greenhouse form with CAPTCHA)
2. Open console
3. Run detection

**Console Command**:
```javascript
const detection = CaptchaDetector.detect();
console.log('Detection:', detection);
console.log('Status:', CaptchaDetector.getStatus());
```

**Expected**:
- `detection.hasCaptcha === true`
- `detection.type === 'recaptcha'`
- `detection.element` is the CAPTCHA container
- Status message: "reCAPTCHA detected - please complete it manually"
- Toast notification appears on page

**Visual Verification**:
- Should see checkbox CAPTCHA on page
- Can find `.g-recaptcha` element in DOM

### Test 1.2: Detect reCAPTCHA v3
**Objective**: Verify invisible reCAPTCHA detection

**Steps**:
1. Navigate to page with reCAPTCHA v3 (invisible)
2. Check for detection

**Console Command**:
```javascript
console.log('reCAPTCHA:', CaptchaDetector.hasRecaptcha());
console.log('Element:', document.querySelector('iframe[src*="recaptcha"]'));
```

**Expected**:
- `hasRecaptcha() === true`
- Can find reCAPTCHA iframe in DOM
- May not have visible checkbox

### Test 1.3: Detect hCaptcha
**Objective**: Verify hCaptcha detection

**Steps**:
1. Navigate to page with hCaptcha
2. Run detection

**Console Command**:
```javascript
const detection = CaptchaDetector.detect();
console.log('Type:', detection.type);
console.log('hCaptcha:', CaptchaDetector.hasHcaptcha());
```

**Expected**:
- `detection.type === 'hcaptcha'`
- `hasHcaptcha() === true`
- Can find `.h-captcha` element or hCaptcha iframe

### Test 1.4: Detect Cloudflare Turnstile
**Objective**: Verify Turnstile detection

**Steps**:
1. Navigate to page with Turnstile
2. Run detection

**Console Command**:
```javascript
const detection = CaptchaDetector.detect();
console.log('Type:', detection.type);
console.log('Turnstile:', CaptchaDetector.hasTurnstile());
```

**Expected**:
- `detection.type === 'turnstile'`
- `hasTurnstile() === true`
- Can find `[data-cf-turnstile]` or Turnstile iframe

### Test 1.5: No CAPTCHA Page
**Objective**: Verify correct negative detection

**Steps**:
1. Navigate to page without CAPTCHA
2. Run detection

**Console Command**:
```javascript
const detection = CaptchaDetector.detect();
console.log('Has CAPTCHA:', detection.hasCaptcha);
console.log('Status:', CaptchaDetector.getStatus());
```

**Expected**:
- `detection.hasCaptcha === false`
- `detection.type === null`
- Status message: "No CAPTCHA detected"
- No toast notification

### Test 1.6: Check CAPTCHA Solved Status
**Objective**: Verify solution detection

**Steps**:
1. Navigate to page with CAPTCHA
2. Check before solving
3. Complete CAPTCHA
4. Check after solving

**Console Commands**:
```javascript
// Before solving
console.log('Solved before:', CaptchaDetector.isSolved());

// After solving (manually complete CAPTCHA)
console.log('Solved after:', CaptchaDetector.isSolved());

// Check response token
const responseEl = document.getElementById('g-recaptcha-response');
console.log('Response token length:', responseEl?.value?.length);
```

**Expected**:
- Before: `isSolved() === false`
- After: `isSolved() === true`
- Response token has value (length > 0)

### Test 1.7: Get Nearby Fields
**Objective**: Verify detection of fields near CAPTCHA

**Steps**:
1. Navigate to page with CAPTCHA
2. Get nearby fields

**Console Command**:
```javascript
const fields = CaptchaDetector.getNearbyFields();
console.log('Nearby fields:', fields.length);
fields.forEach(f => console.log(`- ${f.name} (${f.type})`));
```

**Expected**:
- Returns array of input/select/textarea elements
- Fields are within same form or container as CAPTCHA
- Typically includes submit button and surrounding inputs

### Test 1.8: Wait for Solution
**Objective**: Verify async solution waiting

**Steps**:
1. Navigate to page with CAPTCHA
2. Start waiting
3. Solve CAPTCHA
4. Check result

**Console Command**:
```javascript
console.log('Waiting for CAPTCHA solution (60s timeout)...');
const solved = await CaptchaDetector.waitForSolution(60000);
console.log('Solved:', solved);
```

**Expected**:
- Promise resolves to `true` when CAPTCHA solved
- Promise resolves to `false` if timeout reached
- Checks every 500ms for solution

### Test 1.9: Export Detection Result
**Objective**: Verify result export for logging

**Console Command**:
```javascript
const result = CaptchaDetector.exportResult();
console.log(JSON.stringify(result, null, 2));
```

**Expected**:
```json
{
  "timestamp": "2026-05-15T...",
  "url": "https://...",
  "detection": {
    "hasCaptcha": true,
    "type": "recaptcha",
    "element": "[object HTMLDivElement]",
    "details": {
      "recaptcha": true,
      "hcaptcha": false,
      "turnstile": false
    }
  },
  "status": {
    "present": true,
    "type": "recaptcha",
    "solved": false,
    "message": "reCAPTCHA detected - please complete it manually",
    "severity": "warning"
  },
  "nearbyFieldsCount": 5
}
```

---

## 2. Dynamic Form Watcher

### Test 2.1: Initialize Watcher
**Objective**: Verify watcher starts correctly

**Console Command**:
```javascript
DynamicFormWatcher.init();
console.log('Stats:', DynamicFormWatcher.getStats());
```

**Expected**:
- `[DynamicFormWatcher] Initialized` logged
- Stats show `isActive: true`
- No errors in console

### Test 2.2: Detect New Fields (AJAX Load)
**Objective**: Verify detection of dynamically added fields

**Steps**:
1. Navigate to multi-step form (e.g., Workday)
2. Initialize watcher
3. Click "Next" to load new fields
4. Monitor console

**Expected**:
- `[DynamicFormWatcher] New fields detected: N` logged
- `dynamicFieldsDetected` event fires
- New fields are tracked
- Autofill can target new fields

**Test Simulation**:
```javascript
// Simulate adding new field
const newInput = document.createElement('input');
newInput.type = 'text';
newInput.name = 'dynamicField';
newInput.placeholder = 'Dynamic Field';
document.querySelector('form').appendChild(newInput);

// Wait for detection
setTimeout(() => {
  const stats = DynamicFormWatcher.getStats();
  console.log('Tracked fields:', stats.trackedFieldsCount);
}, 1000);
```

### Test 2.3: Detect Loaded Dropdowns
**Objective**: Verify detection of dropdowns that load options

**Steps**:
1. Navigate to form with lazy-loaded dropdowns
2. Select a field that triggers dropdown population
3. Monitor console

**Expected**:
- `[DynamicFormWatcher] Dropdowns loaded: N` logged
- `dropdownsLoaded` event fires
- Dropdown options are available for filling

**Test Simulation**:
```javascript
// Simulate dropdown loading
const select = document.querySelector('select[name="country"]');
const option1 = document.createElement('option');
option1.value = 'US';
option1.text = 'United States';
select.appendChild(option1);

// Wait for detection
setTimeout(() => {
  console.log('Dropdown detected:', select.options.length);
}, 1000);
```

### Test 2.4: Detect Newly Visible Fields
**Objective**: Verify detection when hidden fields become visible

**Steps**:
1. Find page with conditional fields
2. Trigger condition to show hidden field
3. Monitor console

**Expected**:
- `[DynamicFormWatcher] Fields became visible: N` logged
- Hidden fields that become visible are detected
- Can attempt to fill now-visible fields

**Test Simulation**:
```javascript
// Create hidden field
const hiddenInput = document.createElement('input');
hiddenInput.type = 'text';
hiddenInput.name = 'hiddenField';
hiddenInput.style.display = 'none';
document.body.appendChild(hiddenInput);

// Make it visible after 2s
setTimeout(() => {
  hiddenInput.style.display = 'block';
  console.log('Field made visible');
}, 2000);

// Check if detected after 3s
setTimeout(() => {
  const stats = DynamicFormWatcher.getStats();
  console.log('Tracked visible fields:', stats.trackedFieldsCount);
}, 3000);
```

### Test 2.5: Detect Page Change (SPA Navigation)
**Objective**: Verify detection of SPA route changes

**Steps**:
1. Navigate to SPA job application (e.g., Lever, Greenhouse)
2. Complete first page
3. Click "Next" or navigate to next step
4. Monitor console

**Expected**:
- `[DynamicFormWatcher] Page change detected` logged
- `pageChanged` event fires with new URL
- Tracked fields are cleared
- Can re-autofill on new page

**Test Simulation**:
```javascript
// Listen for page change
document.addEventListener('pageChanged', (e) => {
  console.log('Page changed event:', e.detail);
});

// Simulate SPA navigation
history.pushState({}, '', '/step-2');
setTimeout(() => {
  console.log('URL changed to:', window.location.href);
}, 1000);
```

### Test 2.6: Auto-Continue Autofill
**Objective**: Verify auto-continue on page change

**Prerequisites**:
1. Set `autofillAfterPageTurn: 'automatically'` in settings
2. Upload resume
3. Start autofill on page 1

**Steps**:
1. Fill first page
2. Click "Next"
3. Wait for auto-continue

**Expected**:
- After page change, autofill continues automatically after 1s
- `autoContinueAutofill` event fires
- Second page fields are filled
- No manual intervention needed

**Settings Check**:
```javascript
SettingsManager.get('autofillAfterPageTurn').then(val => {
  console.log('Auto-continue setting:', val);
});
```

### Test 2.7: Debouncing
**Objective**: Verify mutations are debounced to avoid excessive processing

**Steps**:
1. Trigger rapid DOM changes
2. Monitor console

**Test Simulation**:
```javascript
// Add 10 fields rapidly
for (let i = 0; i < 10; i++) {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = `field${i}`;
  document.body.appendChild(input);
}

// Should only process once after 500ms
// Check console: should see ONE "New fields detected: 10"
```

**Expected**:
- Only one processing message appears
- Debounce delay is 500ms
- All 10 fields captured in single batch

### Test 2.8: Stop Watcher
**Objective**: Verify watcher can be stopped

**Console Commands**:
```javascript
DynamicFormWatcher.stop();
console.log('Stats:', DynamicFormWatcher.getStats());

// Try to trigger detection (should not work)
const input = document.createElement('input');
document.body.appendChild(input);

// Wait 1s - no detection should occur
setTimeout(() => {
  console.log('Detection should not have occurred');
}, 1000);
```

**Expected**:
- `[DynamicFormWatcher] Stopped` logged
- `isActive: false` in stats
- New fields are not detected after stop
- Can re-initialize if needed

### Test 2.9: Export Data
**Objective**: Verify data export for debugging

**Console Command**:
```javascript
const data = DynamicFormWatcher.exportData();
console.log(JSON.stringify(data, null, 2));
```

**Expected**:
```json
{
  "stats": {
    "isActive": true,
    "trackedFieldsCount": 15,
    "currentUrl": "https://...",
    "currentStep": "Step 2 of 3"
  },
  "trackedFields": [
    "firstName",
    "lastName",
    "email",
    ...
  ],
  "config": {
    "debounceDelay": 500,
    "maxRetries": 3
  },
  "timestamp": "2026-05-15T..."
}
```

---

## 3. User Value Preservation

### Test 3.1: Preserve Text Input Value
**Objective**: Verify user-entered text is not overwritten

**Steps**:
1. Navigate to job application form
2. Manually type value into "First Name" field
3. Trigger autofill

**Expected**:
- First Name field is NOT overwritten
- Other empty fields are filled
- Console shows: `[AutofillAPI] Preserving user value in field: firstName`

**Verification**:
```javascript
// Check field after autofill
const firstNameField = document.querySelector('input[name="firstName"]');
console.log('User filled:', firstNameField.dataset.userFilled);
console.log('Value:', firstNameField.value);
```

### Test 3.2: Preserve Checkbox Value
**Objective**: Verify checked checkboxes are preserved

**Steps**:
1. Navigate to form with checkboxes
2. Manually check a checkbox
3. Trigger autofill

**Expected**:
- Checked checkbox remains checked
- Unchecked checkboxes can be filled by autofill
- Preserved checkbox marked with `data-user-filled="true"`

### Test 3.3: Preserve Select Value
**Objective**: Verify selected dropdown values are preserved

**Steps**:
1. Navigate to form with dropdowns
2. Manually select option from dropdown
3. Trigger autofill

**Expected**:
- Selected option remains selected
- Empty dropdowns (still on first option) can be filled
- Preserved dropdown marked as user-filled

### Test 3.4: Override Preservation
**Objective**: Verify override mechanism works

**Steps**:
1. Manually fill field
2. Mark field with override attribute
3. Trigger autofill

**Console Commands**:
```javascript
// Fill field manually
const input = document.querySelector('input[name="email"]');
input.value = 'user@example.com';

// Mark for override
input.dataset.allowOverwrite = 'true';

// Trigger autofill
// Field should be overwritten despite having value
```

**Expected**:
- Field with `data-allow-overwrite="true"` is overwritten
- Other fields with values are preserved

### Test 3.5: Disable Preservation
**Objective**: Verify setting can disable preservation

**Steps**:
1. Set `preserveUserInput: false` in settings
2. Manually fill fields
3. Trigger autofill

**Console Commands**:
```javascript
await SettingsManager.set('preserveUserInput', false);

// Now trigger autofill
// All fields should be overwritten
```

**Expected**:
- All fields are filled, including those with user values
- No preservation occurs
- No "Preserving user value" messages

### Test 3.6: Tracking Integration
**Objective**: Verify preserved fields are tracked correctly

**Steps**:
1. Manually fill 3 fields
2. Trigger autofill
3. Check autofill results

**Console Command**:
```javascript
// After autofill
const result = AutofillExtension.getResult();
console.log('Skipped fields:', result.fields.skipped);
```

**Expected**:
- Skipped array contains preserved fields
- Reason: `'user_value_preserved'`
- Count of preserved fields is accurate

**Example Result**:
```json
{
  "fields": {
    "filled": [...],
    "skipped": [
      {
        "field": "First Name",
        "reason": "user_value_preserved",
        "category": "personal"
      },
      {
        "field": "Email",
        "reason": "user_value_preserved",
        "category": "personal"
      }
    ]
  }
}
```

### Test 3.7: Empty vs Placeholder
**Objective**: Verify placeholder text doesn't count as user value

**Steps**:
1. Find field with placeholder text
2. Don't type anything
3. Trigger autofill

**Expected**:
- Field with only placeholder (no value) is filled
- Placeholder text is not considered a user value
- Field is successfully filled by autofill

### Test 3.8: Whitespace Only
**Objective**: Verify whitespace-only values are not preserved

**Steps**:
1. Type only spaces into field
2. Trigger autofill

**Expected**:
- Field with only whitespace is filled
- Trimmed value is empty, so treated as empty field
- Autofill proceeds normally

---

## 4. Integration Tests

### Test 4.1: CAPTCHA + Autofill
**Objective**: Verify autofill pauses when CAPTCHA detected

**Steps**:
1. Navigate to form with CAPTCHA
2. Trigger autofill
3. Observe behavior

**Expected**:
- Autofill starts normally
- When CAPTCHA field reached, autofill pauses
- User warned via toast: "⚠️ reCAPTCHA detected - please complete it manually"
- Can continue after solving CAPTCHA

### Test 4.2: Dynamic Form + User Values
**Objective**: Verify user values preserved on dynamically loaded fields

**Steps**:
1. Fill first page manually
2. Click "Next" (loads new fields)
3. Trigger autofill on second page

**Expected**:
- First page values are preserved
- Second page empty fields are filled
- No overwriting of manual entries

### Test 4.3: Auto-Continue + Preservation
**Objective**: Verify auto-continue respects user values

**Steps**:
1. Enable auto-continue: `autofillAfterPageTurn: 'automatically'`
2. Fill first page with autofill
3. Manually edit a field
4. Click "Next"

**Expected**:
- Auto-continue triggers on page 2
- Manually edited field on page 1 is preserved
- Page 2 fields are auto-filled
- No errors in console

### Test 4.4: All Phase 4 Features Together
**Objective**: Verify all features work harmoniously

**Steps**:
1. Navigate to complex multi-step form with CAPTCHA
2. Manually fill 2 fields
3. Trigger autofill
4. Complete CAPTCHA when prompted
5. Continue through steps

**Expected**:
- User values preserved throughout
- CAPTCHA detected and warned
- Dynamic fields detected on each step
- Auto-continue works (if enabled)
- Successful form completion

---

## 5. Performance Tests

### Test 5.1: CAPTCHA Detection Performance
**Objective**: Measure detection time

**Console Command**:
```javascript
console.time('captchaDetection');
const detection = CaptchaDetector.detect();
console.timeEnd('captchaDetection');
```

**Expected**:
- Detection time: <10ms
- No noticeable page load delay

### Test 5.2: Watcher Memory Usage
**Objective**: Verify watcher doesn't leak memory

**Steps**:
1. Open Performance tab in DevTools
2. Take heap snapshot
3. Navigate through 10 pages with watcher active
4. Take another heap snapshot
5. Compare

**Expected**:
- Memory increase: <1MB
- No retained detached DOM nodes
- Set size grows linearly with tracked fields

### Test 5.3: Mutation Processing Speed
**Objective**: Measure mutation processing time

**Console Commands**:
```javascript
// Add 100 fields rapidly
console.time('mutationProcessing');

for (let i = 0; i < 100; i++) {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = `field${i}`;
  document.body.appendChild(input);
}

// Wait for processing
setTimeout(() => {
  console.timeEnd('mutationProcessing');
}, 1000);
```

**Expected**:
- Processing time: <100ms for 100 fields
- Debounce prevents multiple scans
- No UI jank or freeze

### Test 5.4: User Value Check Performance
**Objective**: Measure preservation check overhead

**Console Command**:
```javascript
// Test 1000 field checks
const fields = document.querySelectorAll('input, select, textarea');

console.time('valueChecks');
for (let i = 0; i < 1000; i++) {
  fields.forEach(field => {
    const type = field.type || field.tagName.toLowerCase();
    // Simulate check (actual check is internal)
    const hasValue = field.value?.trim().length > 0;
  });
}
console.timeEnd('valueChecks');
```

**Expected**:
- 1000 checks complete in <50ms
- No noticeable autofill slowdown
- <1ms per field check

---

## 6. Edge Cases

### Test 6.1: Multiple CAPTCHAs
**Objective**: Handle page with multiple CAPTCHA types

**Steps**:
1. Create test page with reCAPTCHA + hCaptcha
2. Run detection

**Expected**:
- Detects first CAPTCHA found
- Returns single type (not both)
- No errors

### Test 6.2: CAPTCHA in iframe
**Objective**: Detect CAPTCHA embedded in iframe

**Expected**:
- CAPTCHA iframe detected
- Can find parent container
- Nearby fields detected correctly

### Test 6.3: Shadow DOM Fields
**Objective**: Handle fields in Shadow DOM

**Known Limitation**:
- Shadow DOM fields may not be detected by watcher
- Standard querySelector doesn't penetrate shadow roots
- Future enhancement needed

### Test 6.4: Rapid Page Changes
**Objective**: Handle rapid SPA navigation

**Steps**:
1. Rapidly click "Next" multiple times
2. Monitor console

**Expected**:
- Debounce prevents excessive processing
- Only final page state is processed
- No duplicate tracking

### Test 6.5: Field Removed While Tracking
**Objective**: Handle fields that are removed from DOM

**Test Simulation**:
```javascript
// Add field
const input = document.createElement('input');
input.id = 'tempField';
document.body.appendChild(input);

// Wait for tracking
setTimeout(() => {
  // Remove field
  input.remove();
  
  // Check stats
  console.log('Stats:', DynamicFormWatcher.getStats());
}, 1000);
```

**Expected**:
- No errors when field removed
- Tracked fields Set may still contain ID
- Next scan will detect field is gone

### Test 6.6: Disabled CAPTCHA Detection
**Objective**: Verify system works without CaptchaDetector

**Steps**:
1. Remove CaptchaDetector from manifest
2. Reload extension
3. Trigger autofill

**Expected**:
- No errors
- Autofill works normally
- No CAPTCHA warnings (feature absent)

### Test 6.7: Very Long Field Values
**Objective**: Verify preservation works with large values

**Steps**:
1. Paste 10,000 character text into textarea
2. Trigger autofill

**Expected**:
- Value is preserved
- No truncation
- No performance issues

---

## Regression Testing

After any code changes, re-run:
1. Test 1.1, 1.5 (CAPTCHA detection)
2. Test 2.1, 2.2 (Dynamic watcher)
3. Test 3.1, 3.3 (User preservation)
4. Test 4.4 (Integration)

---

## Test Results Template

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Detect reCAPTCHA v2 | ⬜ Pass / ❌ Fail | |
| 1.2 | Detect reCAPTCHA v3 | ⬜ Pass / ❌ Fail | |
| 1.3 | Detect hCaptcha | ⬜ Pass / ❌ Fail | |
| ... | ... | ... | |

---

## Known Issues

1. **Shadow DOM**: Fields in shadow roots not detected by watcher
2. **Invisible CAPTCHAs**: Harder to detect if completely hidden
3. **Heavy Mutations**: Pages with constant DOM changes may cause performance issues
4. **iOS Safari**: MutationObserver behaves differently on iOS

---

## Troubleshooting

### CAPTCHA Not Detected
- Check if CAPTCHA is in iframe
- Verify CAPTCHA type is supported
- Check console for errors
- Use `CaptchaDetector.exportResult()` for debugging

### Watcher Not Detecting Fields
- Check if watcher is initialized: `DynamicFormWatcher.getStats()`
- Verify fields are visible and enabled
- Check if debounce delay too long
- Export data: `DynamicFormWatcher.exportData()`

### User Values Not Preserved
- Check setting: `SettingsManager.get('preserveUserInput')`
- Verify field has actual value (not just placeholder)
- Check if field has `data-allow-overwrite="true"`
- Check console for preservation messages

---

**Testing Complete**: Phase 4 is ready for Phase 5 development.
