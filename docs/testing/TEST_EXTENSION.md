# Extension Loading Test

## Quick Check

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select this folder
6. Check for errors

## Expected Result

✅ Extension loads without errors
✅ TalentScreen icon appears in toolbar
✅ No red error text on extension card

## If You See Errors

### Service Worker Error
```
Error: Could not load background script
```
**Fix:** Check `src/background/background.js` line 3

### Icon Error
```
Could not load icon
```
**Fix:** Check `assets/icons/` folder has:
- icon16.png
- icon48.png
- icon128.png

### Manifest Error
```
Invalid manifest
```
**Fix:** Validate manifest.json syntax

## Quick Validation Commands

```bash
# Check all required files exist
ls -la src/background/background.js
ls -la src/core/resumeProcessor.js
ls -la src/ui/sidepanel.html
ls -la src/ui/sidepanel.js
ls -la src/ui/styles.css
ls -la assets/icons/icon16.png
ls -la assets/icons/icon48.png
ls -la assets/icons/icon128.png
ls -la assets/icons/logo_sidepanel.png

# Validate JavaScript syntax
node --check src/background/background.js
node --check src/core/resumeProcessor.js
node --check src/ui/sidepanel.js

# Check manifest
cat manifest.json | python3 -m json.tool > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"
```

## Test Side Panel

1. Click TalentScreen extension icon
2. Side panel should open on right
3. You should see "Get Started" screen
4. Try uploading `docs/sample_resume.json`

## Console Logs

Check for initialization messages:

```javascript
// In side panel (right-click icon → Inspect)
[Sidepanel] Init
[Sidepanel] Storage loaded

// In service worker (chrome://extensions/ → "service worker" link)
SidePanel behavior set
```

## Common Issues Fixed

✅ Changed background service worker from "type": "module" to standard
✅ Updated all asset paths to absolute paths (/src/...)
✅ Converted talentscreen.jpeg to PNG format
✅ Created all required icon sizes (16, 48, 128, 52)
✅ Fixed resumeProcessor.js import path

## Status

Extension should now load successfully! 🎉
