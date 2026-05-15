# 🚀 Load Extension in Chrome - Step by Step

## ✅ Pre-Flight Check Complete

All validation passed:
- ✅ manifest.json is valid JSON
- ✅ background.js syntax OK
- ✅ resumeProcessor.js syntax OK  
- ✅ sidepanel.js syntax OK
- ✅ All icon files created (16, 48, 128 px)
- ✅ Logo converted from JPEG to PNG
- ✅ All paths updated to absolute paths

---

## 📥 Load Extension (2 minutes)

### Step 1: Open Chrome Extensions
```
Open Chrome → Type in address bar:
chrome://extensions/
```

### Step 2: Enable Developer Mode
```
Top right corner → Toggle "Developer mode" ON
```

### Step 3: Load Unpacked Extension
```
Click "Load unpacked" button
Navigate to:
/Users/sampath/dev/project-talentscreen-autofill-extension
Click "Select"
```

### Step 4: Verify Extension Loaded
✅ You should see card titled: **"TalentScreen - Whitebox Learning Autofill"**
✅ Version: 2.0.0
✅ Status: **No errors** (no red text)
✅ Service worker: **Inactive** (normal until you click icon)

### Step 5: Pin Extension to Toolbar
```
Click puzzle icon (🧩) in Chrome toolbar
Find "TalentScreen - Whitebox Learning Autofill"
Click pin icon 📌
```

---

## 🧪 Test Extension (5 minutes)

### Test 1: Open Side Panel
```
1. Click TalentScreen icon in toolbar
2. Side panel opens on right side
3. You see "Get Started" screen with:
   - "Upload Resume JSON (Required)"
   - "Upload Resume PDF (Optional)"
```

**Expected:** No console errors

### Test 2: Upload Sample JSON
```
1. In side panel, click "Choose JSON File"
2. Navigate to:
   /Users/sampath/dev/project-talentscreen-autofill-extension/docs/sample_resume.json
3. Select file
4. See green success message: "Resume JSON uploaded successfully!"
5. View changes to "Active View" with "Autofill Form" button
```

**Expected:** UI switches to active view, no errors

### Test 3: Open Manage Information
```
1. Click "Manage Information" button
2. Modal opens with JSON data
3. Click X to close
```

**Expected:** Modal works smoothly

### Test 4: Test on Job Board
```
1. Navigate to test job board:
   https://boards.greenhouse.io/embed/job_board?for=benchling
   
2. Click any job posting
3. TalentScreen icon should show active
4. Side panel should auto-open (if not, click icon)
5. Click "Autofill Form" button
6. Watch fields populate with your data
```

**Expected:** Name, email, phone fields fill automatically

---

## 🔍 Debugging

### Check Service Worker
```
1. Go to chrome://extensions/
2. Find TalentScreen extension
3. Click "service worker" link
4. Console opens - should see:
   - No red errors
   - "SidePanel behavior set" (when you click icon)
```

### Check Side Panel Console
```
1. Right-click TalentScreen icon
2. Select "Inspect"
3. DevTools opens
4. Check Console tab for errors
```

### Check Content Script
```
1. Navigate to any job board
2. Press F12 to open DevTools
3. Console tab should show:
   - No errors related to TalentScreen
```

### Clear Extension Data (if needed)
```javascript
// Run in side panel console (Inspect → Console):
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  location.reload();
});
```

---

## 🐛 Common Issues & Fixes

### Issue: "Could not load background script"
**Cause:** Service worker syntax error
**Fix:** Already fixed - background.js validated ✅

### Issue: "Could not load icon"
**Cause:** Missing icon files
**Fix:** Already fixed - all icons created ✅

### Issue: Side panel shows blank page
**Cause:** CSS or JS not loading
**Fix:** Already fixed - paths updated to absolute ✅

### Issue: "Service worker registration failed"
**Cause:** manifest.json has "type": "module"
**Fix:** Already fixed - removed "type": "module" ✅

### Issue: Extension not appearing
**Cause:** Wrong folder selected
**Fix:** Make sure you select the root folder:
```
/Users/sampath/dev/project-talentscreen-autofill-extension
```
NOT a subfolder like /src/ or /assets/

---

## 📸 What You Should See

### 1. Extension Card (chrome://extensions/)
```
┌─────────────────────────────────────────┐
│ 📦 TalentScreen - Whitebox Learning     │
│    Autofill                              │
│                                          │
│ ID: [generated-id]                      │
│ Version: 2.0.0                          │
│ ✅ Enabled                               │
│                                          │
│ 🔧 Details   🗑️ Remove   🔄 Reload       │
└─────────────────────────────────────────┘
```

### 2. Side Panel (after clicking icon)
```
┌──────────────────────────────────────┐
│ 🎯 TalentScreen                      │
│    Whitebox Learning Autofill        │
├──────────────────────────────────────┤
│ Get Started                          │
│                                      │
│ Upload your resume to start...       │
│                                      │
│ 1. Upload Resume JSON (Required)     │
│ [ Choose JSON File ]                 │
│                                      │
│ Need a template?                     │
│ View sample JSON →                   │
│                                      │
│ 2. Upload Resume PDF (Optional)      │
│ [ Choose PDF/DOC ]                   │
│                                      │
└──────────────────────────────────────┘
```

### 3. After Upload (Active View)
```
┌──────────────────────────────────────┐
│ 🎯 TalentScreen                      │
│    Whitebox Learning Autofill        │
├──────────────────────────────────────┤
│ ✅ Ready to autofill!                │
│                                      │
│ [ ✓ Autofill Form ]                  │
│                                      │
│ [ ✏️ Manage Information ]             │
│                                      │
│ [ ⬆ Update JSON ] [ 📄 Update PDF ]   │
│                                      │
│ Recent Applications                  │
│ No applications yet                  │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Extension loaded without errors
- [ ] TalentScreen icon visible in toolbar
- [ ] Side panel opens when icon clicked
- [ ] Can upload sample JSON successfully
- [ ] UI switches to active view after upload
- [ ] Manage Information modal works
- [ ] Extension stays active (no crashes)

---

## 🎉 All Done!

Your extension is now ready to use!

**Next Steps:**
1. Customize `docs/sample_resume.json` with your real data
2. Test on various job boards
3. Report any issues

**Happy job hunting! 🚀**

---

## 📞 Need Help?

If extension still not loading:

1. **Screenshot the error** from chrome://extensions/
2. **Check Console** in service worker (click "service worker" link)
3. **Share error message** with developer

Common commands for debugging:
```bash
# Re-validate everything
cd /Users/sampath/dev/project-talentscreen-autofill-extension
python3 -c "import json; json.load(open('manifest.json'))"
node --check src/background/background.js
node --check src/core/resumeProcessor.js
node --check src/ui/sidepanel.js
ls -la assets/icons/*.png
```
