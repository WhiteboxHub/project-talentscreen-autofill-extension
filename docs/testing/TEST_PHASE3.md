# Phase 3 Testing Guide: Resume Management

**Phase**: 3 - Resume Management  
**Status**: Ready for Testing  
**Date**: May 15, 2026

## Test Environment Setup

1. Load unpacked extension in Chrome
2. Open Developer Tools (F12) → Console tab
3. Open sidepanel from extension icon
4. Have 2-3 test resume files ready (PDF/DOC format)

## Test Categories

- [Storage & CRUD Operations](#1-storage--crud-operations)
- [Resume Selector Modal UI](#2-resume-selector-modal-ui)
- [Resume Selection & Preview](#3-resume-selection--preview)
- [Resume Editing & Management](#4-resume-editing--management)
- [Legacy Migration](#5-legacy-migration)
- [Backward Compatibility](#6-backward-compatibility)
- [Error Handling](#7-error-handling)
- [Edge Cases](#8-edge-cases)

---

## 1. Storage & CRUD Operations

### Test 1.1: Add First Resume
**Objective**: Verify resume is correctly stored and set as primary

**Steps**:
1. Open sidepanel
2. Upload resume file
3. Click "Complete Setup"
4. Open DevTools → Application → Storage → Local Storage
5. Check `resumes` key

**Expected**:
- `resumes` array contains 1 item
- Resume has all fields: `id`, `name`, `jsonData`, `fileData`, `fileName`, `fileType`, `fileSize`, `version`, `isPrimary`, `createdAt`, `updatedAt`
- `isPrimary` is `true`
- Legacy keys (`resumeData`, `resumeFile`) are also populated

**Console Command**:
```javascript
chrome.storage.local.get(['resumes'], (r) => console.log(r.resumes));
```

### Test 1.2: Add Multiple Resumes
**Objective**: Verify multiple resumes can be stored

**Steps**:
1. Upload 3 different resume files
2. For each, complete setup
3. Check storage after each upload

**Expected**:
- `resumes` array grows with each upload
- Each resume has unique `id`
- Only first resume has `isPrimary: true`
- All subsequent resumes have `isPrimary: false`

### Test 1.3: Get All Resumes
**Objective**: Verify retrieval of all resumes

**Console Command**:
```javascript
ResumeManager.getAll().then(resumes => {
  console.log('Total resumes:', resumes.length);
  console.log('Resumes:', resumes);
});
```

**Expected**:
- Returns array matching number of uploaded resumes
- All resume objects are complete

### Test 1.4: Get Resume by ID
**Objective**: Verify retrieval of specific resume

**Steps**:
1. Get all resumes and note an `id`
2. Retrieve that resume by ID

**Console Command**:
```javascript
const testId = 'resume_1715774400000_abc123def'; // Use real ID
ResumeManager.getById(testId).then(resume => {
  console.log('Found resume:', resume);
});
```

**Expected**:
- Returns correct resume object
- Returns `null` for non-existent ID

### Test 1.5: Get Primary Resume
**Objective**: Verify primary resume retrieval

**Console Command**:
```javascript
ResumeManager.getPrimary().then(primary => {
  console.log('Primary resume:', primary.name, primary.isPrimary);
});
```

**Expected**:
- Returns resume with `isPrimary: true`
- If no resumes, returns `null`

### Test 1.6: Update Resume
**Objective**: Verify resume updates work

**Console Command**:
```javascript
const testId = 'resume_1715774400000_abc123def'; // Use real ID
ResumeManager.update(testId, {
  name: 'Updated Resume Name',
  version: 'extension-template'
}).then(success => {
  console.log('Update success:', success);
  return ResumeManager.getById(testId);
}).then(resume => {
  console.log('Updated resume:', resume.name, resume.version);
});
```

**Expected**:
- Returns `true` on success
- Resume fields are updated
- `updatedAt` timestamp changes

### Test 1.7: Delete Resume
**Objective**: Verify resume deletion

**Steps**:
1. Get current resume count
2. Delete non-primary resume
3. Check count decreased

**Console Command**:
```javascript
ResumeManager.getAll().then(before => {
  console.log('Before delete:', before.length);
  return ResumeManager.delete(before[1].id); // Delete 2nd resume
}).then(() => {
  return ResumeManager.getAll();
}).then(after => {
  console.log('After delete:', after.length);
});
```

**Expected**:
- Resume is removed from array
- Count decreases by 1
- Returns `true` on success

### Test 1.8: Delete Primary Resume
**Objective**: Verify primary flag transfers when primary deleted

**Steps**:
1. Delete primary resume
2. Check if new primary is assigned

**Console Command**:
```javascript
ResumeManager.getPrimary().then(primary => {
  console.log('Deleting primary:', primary.name);
  return ResumeManager.delete(primary.id);
}).then(() => {
  return ResumeManager.getPrimary();
}).then(newPrimary => {
  console.log('New primary:', newPrimary ? newPrimary.name : 'none');
});
```

**Expected**:
- First remaining resume becomes primary
- If no resumes left, `getPrimary()` returns `null`

### Test 1.9: Set Primary Resume
**Objective**: Verify changing primary resume

**Console Command**:
```javascript
ResumeManager.getAll().then(resumes => {
  console.log('Current primary:', resumes.find(r => r.isPrimary).name);
  const newPrimaryId = resumes.find(r => !r.isPrimary).id;
  return ResumeManager.setPrimary(newPrimaryId);
}).then(() => {
  return ResumeManager.getAll();
}).then(updated => {
  const primary = updated.find(r => r.isPrimary);
  console.log('New primary:', primary.name);
  console.log('Primary count:', updated.filter(r => r.isPrimary).length);
});
```

**Expected**:
- Old primary loses flag (`isPrimary: false`)
- New primary gains flag (`isPrimary: true`)
- Only ONE resume has `isPrimary: true`
- Legacy storage updated with new primary

### Test 1.10: Rename Resume
**Objective**: Verify rename operation

**Console Command**:
```javascript
ResumeManager.getAll().then(resumes => {
  const id = resumes[0].id;
  console.log('Before:', resumes[0].name);
  return ResumeManager.rename(id, 'My New Resume Name');
}).then(() => {
  return ResumeManager.getAll();
}).then(updated => {
  console.log('After:', updated[0].name);
});
```

**Expected**:
- Name changes
- `updatedAt` changes
- Other fields unchanged

---

## 2. Resume Selector Modal UI

### Test 2.1: Open Modal
**Objective**: Verify modal opens correctly

**Steps**:
1. Upload at least 1 resume
2. Click "Select Resume" button in sidepanel

**Expected**:
- Modal overlay appears (dark background)
- Modal slides up from bottom
- Header shows "View & Select Your Resume"
- Close button (X) visible

### Test 2.2: Modal Layout
**Objective**: Verify two-column layout on desktop

**Steps**:
1. Open modal
2. Check layout at >768px width

**Expected**:
- Left column: Resume list
- Right column: Resume preview
- Both columns visible
- Modal max-width: 900px
- Proper spacing and borders

### Test 2.3: Resume List Display
**Objective**: Verify resumes display correctly

**Steps**:
1. Upload 3 resumes
2. Open modal

**Expected**:
- All 3 resumes listed
- Each shows:
  - Resume name (editable input)
  - File metadata (filename • size • date)
  - Document icon
  - Primary badge (if primary) OR star button
  - Delete button (trash icon)
- Primary resume has orange border
- Selected resume has blue background

### Test 2.4: Empty State
**Objective**: Verify empty state when no resumes

**Steps**:
1. Clear all resumes via DevTools:
   ```javascript
   chrome.storage.local.set({ resumes: [] });
   ```
2. Reload sidepanel
3. Open modal

**Expected**:
- "No resumes uploaded yet" message
- "Add New Resume" button still visible
- Preview shows "No resume selected"

### Test 2.5: Close Modal
**Objective**: Verify all close methods work

**Steps**:
1. Open modal
2. Test close via:
   - Click X button
   - Click outside modal (overlay)
   - Press Escape key

**Expected**:
- Modal disappears (fade out)
- Overlay removed from DOM
- Sidepanel remains functional

---

## 3. Resume Selection & Preview

### Test 3.1: Select Resume
**Objective**: Verify resume selection works

**Steps**:
1. Open modal with 3+ resumes
2. Click on different resumes

**Expected**:
- Clicked resume gets blue background + border
- Previous selection is deselected
- Preview updates to show clicked resume
- Download button becomes enabled

### Test 3.2: Preview Content
**Objective**: Verify preview shows correct data

**Steps**:
1. Select resume with complete data
2. Check preview pane

**Expected**:
- Name displays (from `basics.name`)
- Contact info (email • phone)
- Summary/objective (if present)
- Work experience section:
  - First 3 jobs listed
  - "Position at Company" format
  - "+ N more..." if >3 jobs
- Education section:
  - First 2 degrees
  - "Degree in Field" format
- Skills section:
  - First 10 skill keywords
  - Comma-separated

### Test 3.3: Preview Empty Data
**Objective**: Verify preview handles missing data

**Steps**:
1. Upload resume with minimal data (name only)
2. Select it

**Expected**:
- Name displays
- Missing sections don't show
- No JavaScript errors
- No "undefined" or "null" text

### Test 3.4: Version Selector
**Objective**: Verify version dropdown works

**Steps**:
1. Select a resume
2. Check version selector below preview
3. Change version

**Expected**:
- Dropdown shows 2 options:
  - "Original Version"
  - "Extension Template"
- Current version is selected by default
- Changing version updates resume storage

**Console Verification**:
```javascript
ResumeManager.getById('resume_id').then(r => console.log('Version:', r.version));
```

### Test 3.5: Download Resume
**Objective**: Verify resume download works

**Steps**:
1. Select resume with file attachment
2. Click "Download Resume" button

**Expected**:
- File downloads to default download folder
- Filename matches original upload name
- File opens correctly (PDF viewer, Word, etc.)
- Button is disabled when no resume selected

---

## 4. Resume Editing & Management

### Test 4.1: Inline Name Edit
**Objective**: Verify resume names can be edited inline

**Steps**:
1. Click on resume name input field
2. Edit text
3. Click outside or press Enter

**Expected**:
- Input becomes editable on focus
- Border/background changes on hover/focus
- Blur or Enter saves changes
- Name updates in storage

**Verification**:
```javascript
ResumeManager.getAll().then(r => console.log(r.map(res => res.name)));
```

### Test 4.2: Set as Primary
**Objective**: Verify star button sets resume as primary

**Steps**:
1. Open modal
2. Click star (⭐) button on non-primary resume

**Expected**:
- Star button converts to "Primary" badge
- Previous primary loses badge, gains star button
- Border color changes (orange for primary)
- Storage updated

**Verification**:
```javascript
ResumeManager.getPrimary().then(p => console.log('Primary:', p.name));
```

### Test 4.3: Delete Resume
**Objective**: Verify delete button works

**Steps**:
1. Click delete (trash) button on non-primary resume
2. Confirm deletion in dialog

**Expected**:
- Confirmation dialog appears
- On confirm: resume removed from list
- On cancel: resume remains
- List refreshes automatically

### Test 4.4: Delete with Cancel
**Objective**: Verify cancel prevents deletion

**Steps**:
1. Click delete button
2. Click "Cancel" in confirmation

**Expected**:
- Resume remains in list
- No changes to storage

### Test 4.5: Delete Last Resume
**Objective**: Verify behavior when deleting all resumes

**Steps**:
1. Delete all resumes one by one

**Expected**:
- Each deletion removes resume
- After last deletion:
  - Empty state appears
  - Preview shows "No resume selected"
  - Download/Continue buttons disabled

### Test 4.6: Add New Resume Button
**Objective**: Verify "Add New Resume" flow

**Steps**:
1. Click "Add New Resume" button in modal

**Expected**:
- Modal closes
- Sidepanel switches to setup view
- File upload area visible
- Can upload new resume

---

## 5. Legacy Migration

### Test 5.1: Migrate Single Resume
**Objective**: Verify old storage format migrates correctly

**Steps**:
1. Manually create old format:
   ```javascript
   chrome.storage.local.set({
     resumeData: {
       basics: { name: 'Test User', email: 'test@example.com' },
       work: [],
       education: []
     },
     resumeFile: {
       data: 'data:application/pdf;base64,abc123',
       name: 'resume.pdf',
       type: 'application/pdf',
       size: 12345
     }
   });
   ```
2. Reload extension
3. Open sidepanel (triggers migration)
4. Check storage

**Expected**:
- New `resumes` array created with 1 item
- Resume contains all data from old format
- `isPrimary: true`
- Legacy keys remain (backward compatibility)
- `createdAt` and `updatedAt` timestamps added

**Verification**:
```javascript
chrome.storage.local.get(['resumes', 'resumeData'], (r) => {
  console.log('Resumes array:', r.resumes);
  console.log('Legacy data still exists:', !!r.resumeData);
});
```

### Test 5.2: Skip Migration if Already Done
**Objective**: Verify migration doesn't run twice

**Steps**:
1. After Test 5.1 completes
2. Reload extension again
3. Check console for migration message

**Expected**:
- No "[ResumeManager] Migrating legacy storage..." message
- Existing `resumes` array unchanged
- No duplicate resumes created

### Test 5.3: Migration with No Data
**Objective**: Verify migration handles empty state

**Steps**:
1. Clear all storage:
   ```javascript
   chrome.storage.local.clear();
   ```
2. Reload extension
3. Open sidepanel

**Expected**:
- No migration performed
- No errors
- Empty state appears
- Can upload new resume normally

---

## 6. Backward Compatibility

### Test 6.1: Legacy Keys Sync
**Objective**: Verify primary resume syncs to legacy keys

**Steps**:
1. Upload 2 resumes
2. Set second resume as primary
3. Check legacy storage keys

**Console Verification**:
```javascript
Promise.all([
  ResumeManager.getPrimary(),
  new Promise(r => chrome.storage.local.get(['resumeData', 'resumeFile'], r))
]).then(([primary, legacy]) => {
  console.log('Primary ID:', primary.id);
  console.log('Primary name:', primary.jsonData.basics.name);
  console.log('Legacy name:', legacy.resumeData.basics.name);
  console.log('Names match:', primary.jsonData.basics.name === legacy.resumeData.basics.name);
});
```

**Expected**:
- `resumeData` matches primary resume's `jsonData`
- `resumeFile` matches primary resume's file fields
- Data stays in sync when primary changes

### Test 6.2: Autofill Uses Primary
**Objective**: Verify autofill still works with new storage

**Steps**:
1. Navigate to job application page
2. Open sidepanel
3. Click "Autofill" button

**Expected**:
- Form fills with primary resume data
- No errors in console
- All supported fields populate

### Test 6.3: Settings Integration
**Objective**: Verify resume management works with settings

**Steps**:
1. Change settings (e.g., autofill preferences)
2. Switch primary resume
3. Verify settings persist

**Expected**:
- Settings unaffected by resume changes
- Resume data and settings stored separately
- No conflicts

---

## 7. Error Handling

### Test 7.1: Invalid Resume ID
**Objective**: Verify graceful handling of bad IDs

**Console Commands**:
```javascript
// Test getById
ResumeManager.getById('invalid_id').then(r => console.log('Result:', r));

// Test delete
ResumeManager.delete('invalid_id').then(success => console.log('Success:', success));

// Test update
ResumeManager.update('invalid_id', { name: 'Test' }).then(success => console.log('Success:', success));
```

**Expected**:
- `getById`: Returns `null`
- `delete`: Returns `false` + console error
- `update`: Returns `false` + console error
- No crashes or exceptions

### Test 7.2: Storage Quota Exceeded
**Objective**: Verify behavior when storage limit hit

**Steps**:
1. Upload large resume files (multiple 2MB PDFs)
2. Continue until storage full

**Expected**:
- Error message when quota exceeded
- Previous resumes remain intact
- User informed about storage limits
- Can delete resumes to free space

### Test 7.3: Corrupted Storage Data
**Objective**: Verify recovery from bad data

**Steps**:
1. Manually corrupt storage:
   ```javascript
   chrome.storage.local.set({ resumes: 'not_an_array' });
   ```
2. Reload extension
3. Open sidepanel

**Expected**:
- Extension doesn't crash
- Falls back to empty array
- Console error logged
- Can upload new resume

### Test 7.4: Missing File Data
**Objective**: Verify handling of resume without file

**Steps**:
1. Create resume with no file:
   ```javascript
   ResumeManager.add({ basics: { name: 'Test' } }, null, 'No File Resume');
   ```
2. Open modal
3. Select the resume
4. Try to download

**Expected**:
- Resume appears in list
- Preview shows data
- Download button disabled or shows error
- No crashes

---

## 8. Edge Cases

### Test 8.1: Very Long Resume Names
**Objective**: Verify UI handles long names

**Steps**:
1. Rename resume to very long name (100+ characters)
2. Check list and preview

**Expected**:
- Name doesn't break layout
- Text truncates with ellipsis if needed
- Full name visible in input when editing

### Test 8.2: Special Characters in Names
**Objective**: Verify names with special chars work

**Steps**:
1. Rename resume to: `Resume (2024) - John's "Latest" Version #1`
2. Check storage and display

**Expected**:
- Name saved correctly
- No XSS vulnerabilities (HTML escaped)
- Special characters display properly

### Test 8.3: Rapid Clicking
**Objective**: Verify UI handles rapid interactions

**Steps**:
1. Rapidly click:
   - Different resumes
   - Set primary button
   - Delete button
   - Open/close modal

**Expected**:
- No duplicate operations
- No race conditions
- UI remains responsive
- Storage consistent

### Test 8.4: Large Number of Resumes
**Objective**: Verify performance with many resumes

**Steps**:
1. Upload 10+ resumes
2. Open modal
3. Scroll through list
4. Select different resumes

**Expected**:
- List scrolls smoothly
- No lag when selecting
- Preview updates quickly
- Storage operations remain fast

### Test 8.5: Resume with Missing Sections
**Objective**: Verify preview handles incomplete data

**Steps**:
1. Upload resume with only:
   - Name
   - One job (no education/skills)
2. Check preview

**Expected**:
- Shows available sections only
- Missing sections don't render
- No "undefined" or empty headings
- No console errors

### Test 8.6: Duplicate File Names
**Objective**: Verify handling of same filename

**Steps**:
1. Upload resume named "resume.pdf"
2. Upload different resume also named "resume.pdf"

**Expected**:
- Both resumes stored
- Distinguished by generated ID
- Names auto-incremented ("Resume 2")
- No data overwritten

### Test 8.7: Modal During Autofill
**Objective**: Verify modal doesn't interfere with autofill

**Steps**:
1. Open modal
2. While modal open, trigger autofill

**Expected**:
- Modal remains open OR closes gracefully
- Autofill completes successfully
- No conflicts
- No errors

### Test 8.8: Version Change Persistence
**Objective**: Verify version selection persists

**Steps**:
1. Select resume
2. Change version to "Extension Template"
3. Close modal
4. Reopen modal
5. Select same resume

**Expected**:
- Version dropdown shows "Extension Template"
- Version persisted in storage
- Version survives page reload

---

## Performance Benchmarks

### Storage Operations
- `getAll()`: <50ms
- `add()`: <100ms
- `update()`: <50ms
- `delete()`: <50ms
- `getPrimary()`: <50ms

### UI Responsiveness
- Modal open animation: 300ms
- Resume selection: Instant (<50ms)
- Preview render: <100ms
- List render (10 resumes): <200ms

**Measure in Console**:
```javascript
console.time('getAll');
ResumeManager.getAll().then(() => console.timeEnd('getAll'));
```

---

## Regression Testing

After any code changes, re-run:
1. Test 1.1, 1.2 (Basic CRUD)
2. Test 2.1, 2.5 (Modal open/close)
3. Test 3.1, 3.2 (Selection & preview)
4. Test 4.1, 4.3 (Edit & delete)
5. Test 5.1 (Migration)
6. Test 6.1, 6.2 (Backward compatibility)

---

## Test Results Template

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Add First Resume | ⬜ Pass / ❌ Fail | |
| 1.2 | Add Multiple Resumes | ⬜ Pass / ❌ Fail | |
| 1.3 | Get All Resumes | ⬜ Pass / ❌ Fail | |
| ... | ... | ... | |

---

## Known Issues / Limitations

1. **Storage Quota**: ~10MB limit (6-8 resumes typical)
2. **No Cloud Sync**: Resumes are device-local
3. **Version System**: UI only, doesn't transform data yet
4. **No Undo**: Deleted resumes can't be recovered

---

## Troubleshooting

### Modal Won't Open
- Check console for errors
- Verify resume-selector-modal.js loaded
- Check if `ResumeSelectorModal` exists: `console.log(window.ResumeSelectorModal)`

### Resumes Not Saving
- Check storage quota: `chrome.storage.local.getBytesInUse(console.log)`
- Check for chrome.runtime.lastError
- Verify permissions in manifest.json

### Preview Not Updating
- Check resume has valid jsonData
- Verify resume structure matches JSON Resume format
- Check console for render errors

### Migration Not Working
- Clear all storage and retry
- Check if legacy keys exist
- Verify migration runs on init()

---

## Automated Testing (Future)

For future CI/CD integration:

```javascript
// Example Jest test structure
describe('ResumeManager', () => {
  test('should add resume', async () => {
    const resume = await ResumeManager.add(mockData, mockFile);
    expect(resume.id).toBeDefined();
    expect(resume.isPrimary).toBe(true);
  });
  
  test('should get all resumes', async () => {
    const resumes = await ResumeManager.getAll();
    expect(Array.isArray(resumes)).toBe(true);
  });
});
```

---

**Testing Complete**: Phase 3 is ready for Phase 4 development.
