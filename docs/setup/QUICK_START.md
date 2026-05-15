# Quick Start Guide - TalentScreen v2.0

**For Developers & Contributors**

## 🚀 5-Minute Setup

### 1. Install Extension (Development Mode)
```bash
# Clone repository
git clone [your-repo-url]
cd talentscreen-autofill-extension

# Open Chrome
# Navigate to: chrome://extensions/
# Enable: Developer mode (top right)
# Click: Load unpacked
# Select: This directory
```

### 2. Test Setup Screen
```bash
# Click extension icon in Chrome toolbar
# You should see: Setup screen with JSON/PDF upload
# No errors in console (right-click icon → Inspect)
```

### 3. Upload Sample Data
```bash
# Download sample JSON:
curl -o test-resume.json https://raw.githubusercontent.com/WhiteboxHub/project-avatar-resume-json-cli/main/src/resumes/test/demo.json

# In extension sidepanel:
# 1. Click "Choose JSON File"
# 2. Select test-resume.json
# 3. See: "Resume JSON uploaded successfully!"
```

### 4. Test Autofill
```bash
# Navigate to test job board:
https://boards.greenhouse.io/embed/job_board?for=benchling

# Click any job posting
# In sidepanel: Click "Autofill Form"
# Verify: Name, email, phone fields populate
```

### 5. Verify Build
```bash
npm install  # No dependencies, but initializes package
npm run lint  # Check JavaScript syntax
npm run build  # Creates extension.zip
```

---

## 🧪 Quick Test Scenarios

### Happy Path (2 min)
1. ✅ Upload JSON → See success message
2. ✅ Navigate to job board → Extension icon active
3. ✅ Click Autofill → Fields populate
4. ✅ Check History → Application logged

### Error Handling (3 min)
1. ✅ Upload invalid JSON → See error message
2. ✅ Upload 20MB PDF → See size limit error
3. ✅ Click Autofill on Google.com → See "not a job page" error
4. ✅ Manually edit field → Click Autofill → Field NOT overwritten

### UI Flow (2 min)
1. ✅ No data → Setup screen visible
2. ✅ Upload JSON → Active view visible
3. ✅ Click "Manage Information" → Modal opens
4. ✅ Edit JSON → Save → Success message

---

## 🐛 Common Issues

### "Could not reach page"
**Problem:** Content script not injected  
**Fix:** Reload the job application page

### "Invalid JSON file"
**Problem:** Syntax error in JSON  
**Fix:** Validate at jsonlint.com

### Extension not loading
**Problem:** Manifest error  
**Fix:** Check chrome://extensions/ for error details

### Fields not filling
**Problem:** ATS not recognized  
**Fix:** Check if URL is in manifest.json host_permissions

---

## 📁 Key Files to Know

```
manifest.json              → Extension config (permissions, scripts)
src/core/resumeProcessor.js → Data normalization (single source)
src/ui/sidepanel.js        → UI controller (error handling)
src/ui/sidepanel.html      → Extension interface
src/content/content.js     → Page interaction logic
src/content/atsStrategies/ → Platform-specific logic (26 files)
docs/sample_resume.json    → Full template with custom_fields
```

---

## 🔍 Debugging Commands

```bash
# Check service worker logs
# chrome://extensions/ → Click "service worker" link

# Check content script logs
# Open job page → F12 → Console

# Check sidepanel logs
# Right-click extension icon → Inspect

# View stored data
# F12 → Application → Storage → Local Storage → chrome-extension://[id]

# Clear all data
chrome.storage.local.clear()  # Run in DevTools console
```

---

## 🚢 Pre-Release Checklist

```bash
[ ] npm run lint → No errors
[ ] Load unpacked → No manifest errors
[ ] Test on 3 ATS platforms → All pass
[ ] Test error scenarios → Proper messages
[ ] Check history tracking → Works
[ ] Verify user lock → Manual edits protected
[ ] npm run build → extension.zip created
[ ] Test built ZIP → Loads correctly
```

---

## 📚 Next Steps

1. **Read:** Full README.md for architecture details
2. **Test:** Complete TESTING.md checklist
3. **Contribute:** Add new ATS strategy (see README "Contributing")
4. **Deploy:** Upload to Chrome Web Store

---

**Happy Coding! 🎉**

Questions? Open an issue on GitHub or email support@whiteboxlearning.com
