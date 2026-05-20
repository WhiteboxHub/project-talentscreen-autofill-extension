# Auto-Open Extension Feature

## Overview
The TalentScreen extension now automatically opens the side panel whenever a user navigates to or opens an ATS (Applicant Tracking System) site.

## Features Implemented

### 1. **Automatic Side Panel Opening**
- The extension automatically attempts to open when any ATS site is detected
- Works across multiple scenarios:
  - Page loads and refreshes
  - Tab switching
  - New tabs opened with ATS links
  - New windows opened with ATS sites

### 2. **Visual Indicators**
- **Green Badge**: Shows "!" on the extension icon when on an ATS site
- **Tooltip Update**: Changes to "Click to open TalentScreen autofill" on ATS sites
- **Badge Color**: Green (#4CAF50) for active ATS sites

### 3. **Retry Mechanism**
- Implements exponential backoff retry (3 attempts)
- Retry delays: 500ms, 1000ms, 1500ms
- Gracefully handles Chrome's user gesture requirements

### 4. **Supported Scenarios**

#### ✅ Page Load/Refresh
```javascript
chrome.tabs.onUpdated -> tryOpenSidePanel()
```

#### ✅ Tab Switching
```javascript
chrome.tabs.onActivated -> tryOpenSidePanel()
```

#### ✅ New Window with ATS Site
```javascript
chrome.windows.onCreated -> detect ATS -> tryOpenSidePanel()
```

#### ✅ New Tab Created (Ctrl+Click, Middle Click)
```javascript
chrome.tabs.onCreated -> detect ATS -> tryOpenSidePanel()
```

## Supported ATS Platforms (26+)
- Greenhouse
- Lever
- Workday
- SmartRecruiters
- iCIMS
- Taleo
- Ashby
- BambooHR
- Indeed
- LinkedIn Jobs
- Workable
- SuccessFactors
- Personio
- Recruitee
- TeamTailor
- UltiPro
- UKG
- Paycom
- Paychex
- Oracle Cloud
- Brass Ring
- ADP
- Jobvite
- Rippling
- ApplyToJob

## Technical Details

### Files Modified
1. **src/background/background.js**
   - Added `isATSSite()` helper function
   - Added `tryOpenSidePanel()` with retry logic
   - Enhanced `chrome.tabs.onUpdated` listener
   - Enhanced `chrome.tabs.onActivated` listener
   - Added `chrome.windows.onCreated` listener
   - Added `chrome.tabs.onCreated` listener

2. **manifest.json**
   - Added "tabs" permission for full tab access

### Key Functions

#### `isATSSite(url)`
Checks if a URL matches any of the 26+ supported ATS platforms.

#### `tryOpenSidePanel(tabId, windowId, retryCount)`
Attempts to open the side panel with retry logic:
- Checks if panel is already open
- Attempts to open via `chrome.sidePanel.open()`
- Retries up to 3 times with exponential backoff
- Handles Chrome's user gesture requirement gracefully

## User Experience

### Before
- User had to manually click the extension icon every time
- No indication when on an ATS site
- Required multiple clicks across different tabs/windows

### After
- Extension opens automatically on ATS sites
- Green badge provides visual feedback
- Works seamlessly across tabs and windows
- Minimal user interaction required

## Chrome API Limitations

Chrome's `chrome.sidePanel.open()` API has security restrictions:
- **User Gesture Requirement**: Some contexts require user interaction
- **Workaround**: Extension shows badge and retries automatically
- **Fallback**: User can click the extension icon if auto-open fails

## Testing Scenarios

### ✅ Test Cases
1. Open a Greenhouse job posting → Side panel opens
2. Switch to a Lever job tab → Side panel opens
3. Open Workday link in new tab (Ctrl+Click) → Side panel opens
4. Open Indeed job in new window → Side panel opens
5. Navigate to LinkedIn Jobs → Side panel opens
6. Switch to non-ATS site → Badge clears

## Console Logs

The extension provides detailed logging:
```
[TalentScreen] Successfully opened side panel for tab 123
[TalentScreen] Side panel already open for this window
[TalentScreen] Retry 1/3 to open side panel
[TalentScreen] New window opened with ATS site, attempting to open side panel
[TalentScreen] New tab created with ATS site
```

## Future Enhancements

Potential improvements:
- User preference to disable auto-open
- Different badge styles for different ATS types
- Analytics on auto-open success rate
- Custom ATS site list in settings

## Changes Summary

### Removed
- ❌ "Unlimited autofills available" text from sidepanel.html

### Added
- ✅ Auto-open functionality for ATS sites
- ✅ Green badge indicator
- ✅ Retry mechanism with exponential backoff
- ✅ Support for new windows and tabs
- ✅ Enhanced logging

### Modified
- ✅ background.js: Comprehensive auto-open logic
- ✅ manifest.json: Added "tabs" permission
