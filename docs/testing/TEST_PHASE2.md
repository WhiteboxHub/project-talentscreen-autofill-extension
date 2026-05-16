# Phase 2 Testing Guide

## Quick Test Checklist

### Setup
1. Reload extension: `chrome://extensions/` → Click reload button
2. Open extension sidepanel
3. Open settings page: Click gear icon or "Settings & Information"

---

## Test 1: Settings Manager Module

### Test 1A: Get/Set Settings

#### Steps
1. Open browser DevTools console
2. Run these commands:

```javascript
// Test get
const value = await SettingsManager.get('autofillAfterPageTurn');
console.log('Current value:', value); // Should be 'manually'

// Test set
await SettingsManager.set('autofillAfterPageTurn', 'automatically');
console.log('Set to automatically');

// Verify
const newValue = await SettingsManager.get('autofillAfterPageTurn');
console.log('New value:', newValue); // Should be 'automatically'

// Test getAll
const all = await SettingsManager.getAll();
console.log('All settings:', all);
```

#### Expected Results
✅ All commands execute without errors  
✅ Values retrieved correctly  
✅ Settings persist after set  
✅ getAll() returns object with 15+ settings

### Test 1B: Validation

```javascript
// Test valid setting
const valid = SettingsManager.validate('fillEEO', true);
console.log('Valid:', valid); // Should be { valid: true }

// Test invalid setting
const invalid = SettingsManager.validate('fillEEO', 'invalid');
console.log('Invalid:', invalid); // Should be { valid: false, error: '...' }

// Test range validation
const validRange = SettingsManager.validate('retryAttempts', 5);
console.log('Valid range:', validRange); // Should be { valid: true }

const invalidRange = SettingsManager.validate('retryAttempts', 99);
console.log('Invalid range:', invalidRange); // Should be { valid: false }
```

#### Expected Results
✅ Valid values pass  
✅ Invalid values fail with error message  
✅ Range validation works

### Test 1C: Reset

```javascript
// Change a setting
await SettingsManager.set('fillEEO', true);

// Reset it
await SettingsManager.reset('fillEEO');

// Verify
const value = await SettingsManager.get('fillEEO');
console.log('After reset:', value); // Should be false (default)

// Reset all
await SettingsManager.resetAll();
const all = await SettingsManager.getAll();
console.log('After resetAll:', all); // Should match defaults
```

#### Expected Results
✅ Individual reset works  
✅ ResetAll restores all defaults

---

## Test 2: Settings UI - Preferences Section

### Test 2A: Navigate to Preferences

#### Steps
1. Open settings page
2. Click "Preferences" tab in navigation

#### Expected Results
✅ Preferences section displays  
✅ 4 subsections visible:
   - Autofill Behavior
   - User Interface
   - Performance
   - Danger Zone

### Test 2B: Autofill After Page Turn

#### Steps
1. In Preferences → Autofill Behavior
2. Find "Autofill After Page Turn" dropdown
3. Should show "Manually" by default
4. Change to "Automatically"
5. Click "Save Preferences"

#### Expected Results
✅ Dropdown has 2 options: Manually, Automatically  
✅ Hint text explains both options  
✅ Value changes when selected  
✅ Toast message: "Preferences saved successfully!"

### Test 2C: Default Plugin View

#### Steps
1. In Preferences → User Interface
2. Find "Default Plugin View" dropdown
3. Should show "Expanded" by default
4. Change to "Minimized"
5. Click "Save Preferences"

#### Expected Results
✅ Dropdown has 2 options: Expanded, Minimized  
✅ Hint text explains both options  
✅ Value changes when selected  
✅ Toast message confirms save

### Test 2D: Checkbox Settings

#### Steps
1. Check all checkboxes:
   - ☑ Preserve user-entered values
   - ☑ Fill EEO fields
   - ☑ Fill legal/work authorization fields
   - ☑ Highlight filled fields
2. Click "Save Preferences"
3. Reload page
4. Return to Preferences

#### Expected Results
✅ All checkboxes stay checked after reload  
✅ Settings persist across sessions

### Test 2E: Performance Settings

#### Steps
1. In Preferences → Performance
2. Change "Delay Between Fields" to 200
3. Change "Retry Attempts" to 5
4. Click "Save Preferences"

#### Expected Results
✅ Number inputs accept values  
✅ Values within range (0-5000 for delay, 0-10 for retries)  
✅ Hint text shows defaults  
✅ Settings save successfully

### Test 2F: Reset to Defaults

#### Steps
1. Change several settings
2. Click "Reset to Defaults"
3. Confirm in dialog
4. Check all settings

#### Expected Results
✅ Confirmation dialog appears  
✅ Clicking "OK" resets all settings  
✅ Form reloads with default values  
✅ Toast message: "Preferences reset to defaults"

---

## Test 3: Autofill Information Fields

### Test 3A: Navigate to Edit Information

#### Steps
1. Open sidepanel
2. Click "Settings & Information" button
3. OR click gear icon in header
4. Click "Edit Information" tab (if modal)
5. Click "Personal Info" sub-tab

#### Expected Results
✅ Personal Info form displays  
✅ Info banner at top visible  
✅ All new fields present

### Test 3B: Info Banner

#### Steps
1. Check top of Personal Info form
2. Verify info banner displays

#### Expected Results
✅ Blue/green background  
✅ Info icon (ℹ️) on left  
✅ Text: "Your autofill information updates automatically..."  
✅ Readable and accessible

### Test 3C: New Fields Present

Verify all fields exist:
- [ ] First Name *
- [ ] Middle Name
- [ ] Last Name *
- [ ] Email Address *
- [ ] Phone Type (dropdown)
- [ ] Phone *
- [ ] Country *
- [ ] City *
- [ ] State/Region
- [ ] Address Line
- [ ] Postal Code
- [ ] County
- [ ] LinkedIn URL
- [ ] Professional Summary

#### Expected Results
✅ All 14 fields present  
✅ Required fields have * asterisk  
✅ Dropdowns work  
✅ Textareas expand

### Test 3D: Name Parsing

#### Steps
1. Upload resume with full name: "John Michael Doe"
2. Open Personal Info form
3. Check field values

#### Expected Results
✅ First Name: "John"  
✅ Middle Name: "Michael"  
✅ Last Name: "Doe"

### Test 3E: Edit and Save

#### Steps
1. Change First Name to "Jane"
2. Add Middle Name: "Marie"
3. Change Last Name to "Smith"
4. Update other fields:
   - Phone Type: "Home"
   - Country: "United States"
   - Address: "456 Oak Ave, Unit 7"
   - Postal Code: "94103"
   - County: "San Francisco"
5. Click "Save Personal Info"

#### Expected Results
✅ All fields editable  
✅ Save button works  
✅ Toast message: "Personal information updated!"  
✅ Full name reconstructs: "Jane Marie Smith"

### Test 3F: Data Persistence

#### Steps
1. Edit and save personal info
2. Close sidepanel
3. Reopen sidepanel
4. Open Personal Info form

#### Expected Results
✅ All edited values persist  
✅ Name still split correctly  
✅ No data loss

---

## Test 4: Integration Tests

### Test 4A: Settings Affect Autofill

#### Steps
1. Open settings
2. Enable "Fill EEO fields"
3. Enable "Fill legal/work authorization fields"
4. Save preferences
5. Open job application with EEO fields
6. Click Autofill

#### Expected Results
✅ EEO fields get filled  
✅ Legal fields get filled  
✅ Previously skipped fields now filled

### Test 4B: Disable EEO/Legal

#### Steps
1. Open settings
2. Disable "Fill EEO fields"
3. Disable "Fill legal/work authorization fields"
4. Save preferences
5. Open job application
6. Click Autofill

#### Expected Results
✅ EEO fields skipped  
✅ Legal fields skipped  
✅ Other fields still filled

### Test 4C: Performance Settings Apply

#### Steps
1. Open settings
2. Set "Delay Between Fields" to 500ms
3. Save preferences
4. Open job application
5. Click Autofill
6. Watch fields fill

#### Expected Results
✅ Noticeable delay between each field  
✅ Approximately 500ms between fills

### Test 4D: Complete Information Flow

#### Steps
1. Upload JSON resume
2. Upload PDF resume
3. Go to settings → Personal Info
4. Add all missing fields (middle name, county, etc.)
5. Save
6. Go to settings → Preferences
7. Configure autofill behavior
8. Save
9. Open job application
10. Click Autofill

#### Expected Results
✅ All fields from personal info available for autofill  
✅ Autofill respects preference settings  
✅ No errors or data loss

---

## Test 5: Validation Tests

### Test 5A: Required Fields

#### Steps
1. Open Personal Info form
2. Clear First Name field
3. Try to save

#### Expected Results
✅ Form validation prevents save  
✅ Browser shows "Please fill out this field"  
✅ Required field indicator (*) visible

### Test 5B: Email Validation

#### Steps
1. Enter invalid email: "notanemail"
2. Try to save

#### Expected Results
✅ Browser shows "Please enter an email address"  
✅ Email input type validation works

### Test 5C: Number Input Ranges

#### Steps
1. Open settings → Preferences
2. Try to enter delay: 10000 (over max)
3. Try to enter retries: 20 (over max)

#### Expected Results
✅ Input capped at max value  
✅ Or validation error shown  
✅ Can't save invalid values

---

## Test 6: Storage Verification

### Test 6A: Inspect Storage

#### Steps
1. Open DevTools → Application tab → Storage → Local Storage → chrome-extension://...
2. Find `userSettings` key
3. Check value

```javascript
// Or run in console
chrome.storage.local.get(['userSettings'], (result) => {
  console.log('User Settings:', result.userSettings);
});
```

#### Expected Results
✅ `userSettings` key exists  
✅ Contains all saved preferences  
✅ Values match UI settings

### Test 6B: Enhanced Resume Data

```javascript
chrome.storage.local.get(['resumeData'], (result) => {
  console.log('Resume Data:', result.resumeData);
  console.log('Phone Type:', result.resumeData.basics.phoneType);
  console.log('County:', result.resumeData.basics.location.county);
});
```

#### Expected Results
✅ New fields present in resumeData  
✅ phoneType saved  
✅ county, address, etc. saved

---

## Test 7: Error Handling

### Test 7A: Storage Error Simulation

#### Steps
1. Open DevTools console
2. Try invalid setting:

```javascript
await SettingsManager.set('invalidKey', 'value');
```

#### Expected Results
✅ No crash  
✅ Error logged to console  
✅ Extension continues working

### Test 7B: Form Error Handling

#### Steps
1. Open Personal Info form
2. Paste very long text (10000+ chars) in address
3. Try to save

#### Expected Results
✅ No crash  
✅ Data truncated or error shown  
✅ User notified

---

## Test 8: Cross-Browser Compatibility

### Test in Multiple Browsers
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Brave (latest)

### Expected Results
✅ Settings UI works identically  
✅ Storage works correctly  
✅ No browser-specific bugs

---

## Test 9: Performance Tests

### Test 9A: Settings Load Time

#### Steps
1. Open DevTools → Performance tab
2. Start recording
3. Open settings page
4. Stop recording
5. Check `loadPreferences()` time

#### Expected Results
✅ Settings load < 50ms  
✅ No blocking operations  
✅ UI responsive

### Test 9B: Form Population Time

#### Steps
1. Open sidepanel
2. Measure time to populate Personal Info form
3. With large resume data (many work entries, etc.)

#### Expected Results
✅ Form populates < 100ms  
✅ No lag or freeze  
✅ Smooth user experience

---

## Test 10: Accessibility

### Test 10A: Keyboard Navigation

#### Settings Page
- [ ] Tab through all form fields
- [ ] Space toggles checkboxes
- [ ] Enter saves form
- [ ] Dropdown accessible via keyboard

#### Personal Info Form
- [ ] Tab through all fields
- [ ] Can fill all fields without mouse
- [ ] Save button reachable

#### Expected Results
✅ Full keyboard accessibility  
✅ Logical tab order  
✅ No keyboard traps

### Test 10B: Screen Reader

Use screen reader (VoiceOver, NVDA, JAWS):
1. Navigate through settings
2. Navigate through personal info form
3. Interact with all controls

#### Expected Results
✅ All labels announced  
✅ Required fields indicated  
✅ Hint text readable  
✅ Button purposes clear

---

## Test 11: Upgrade/Migration

### Test 11A: Fresh Install

#### Steps
1. Install extension from scratch
2. Check settings
3. Check default values

#### Expected Results
✅ All settings have default values  
✅ No errors on first load  
✅ Settings page functional

### Test 11B: Upgrade from Phase 1

#### Steps
1. Have Phase 1 data in storage
2. Load Phase 2 extension
3. Check settings
4. Check personal info

#### Expected Results
✅ Phase 1 data preserved  
✅ New settings get defaults  
✅ Old userPreferences still work  
✅ No data loss

---

## Bug Report Template

```
**Component:** [SettingsManager / Settings UI / Personal Info Form]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Console Errors:**
```
[Paste errors]
```

**Storage State:**
```javascript
// Run in console and paste output
chrome.storage.local.get(null, (result) => {
  console.log(JSON.stringify(result, null, 2));
});
```

**Environment:**
- Browser: Chrome 120.0.0
- Extension Version: 2.2.0
- OS: macOS 14.0

**Additional Context:**

```

---

## Success Criteria

Phase 2 passes testing if:

1. ✅ SettingsManager module works correctly
2. ✅ All settings save and load properly
3. ✅ Settings persist across sessions
4. ✅ All new personal info fields work
5. ✅ Name parsing works correctly
6. ✅ Info banner displays properly
7. ✅ Settings affect autofill behavior
8. ✅ No crashes or data loss
9. ✅ Good performance (< 100ms)
10. ✅ Fully accessible

---

## Test Results Log

Date: ___________  
Tester: ___________

| Test | Status | Notes |
|------|--------|-------|
| Settings Manager | ☐ Pass ☐ Fail | |
| Settings UI | ☐ Pass ☐ Fail | |
| Personal Info Fields | ☐ Pass ☐ Fail | |
| Integration | ☐ Pass ☐ Fail | |
| Validation | ☐ Pass ☐ Fail | |
| Storage | ☐ Pass ☐ Fail | |
| Error Handling | ☐ Pass ☐ Fail | |
| Performance | ☐ Pass ☐ Fail | |
| Accessibility | ☐ Pass ☐ Fail | |
| Upgrade/Migration | ☐ Pass ☐ Fail | |

**Overall Status:** ☐ PASS ☐ FAIL  

**Ready for Production:** ☐ YES ☐ NO

---

## Next Steps After Testing

If all tests pass:
1. Update version to 2.2.0 in manifest.json
2. Create git commit: "feat: Phase 2 - Settings Manager & Complete Fields"
3. Create release notes
4. Proceed to Phase 3 implementation

If tests fail:
1. Document failures
2. Fix bugs
3. Re-test
4. Repeat until all pass
