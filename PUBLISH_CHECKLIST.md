# Publishing Checklist - TalentScreen Autofill Extension

Quick reference checklist for publishing to Chrome Web Store.

---

## Pre-Build Checklist

- [ ] **Version updated** in `manifest.json`
- [ ] **All features tested** locally
- [ ] **No console errors** in production
- [ ] **Code cleaned** (no debug logs)
- [ ] **Dependencies checked** (all required files present)
- [ ] **Icons verified** (16x16, 48x48, 128x128)
- [ ] **Permissions justified** (only what's needed)

---

## Build Package

```bash
# Run build script
./build.sh

# Verify output
ls -lh dist/talentscreen-autofill-v*.zip

# Test the ZIP
unzip -l dist/talentscreen-autofill-v*.zip | head -30
```

- [ ] **Build script executed** successfully
- [ ] **ZIP file created** in `dist/` folder
- [ ] **Size checked** (should be under 50MB, currently ~1.6MB ✅)
- [ ] **Contents verified** (no unwanted files)

---

## Assets Preparation

### Screenshots (5 recommended)

Take screenshots at 1280x800 resolution:

1. [ ] **Setup view** - JSON/PDF upload interface
2. [ ] **Main interface** - Autofill button and controls
3. [ ] **Settings page** - Custom fields configuration
4. [ ] **Form filling** - Extension filling a job application
5. [ ] **Tracking view** - Application history/progress

**Tools**:
- Mac: Cmd + Shift + 4
- Windows: Windows + Shift + S
- Resize: https://www.iloveimg.com/resize-image

### Privacy Policy

- [ ] **Policy written** (use `PRIVACY_POLICY_TEMPLATE.md`)
- [ ] **Policy hosted** publicly:
  - Option 1: GitHub Pages
  - Option 2: Company website
  - Option 3: Google Doc (public)
- [ ] **URL obtained** for Chrome Web Store listing

**Recommended URL structure**:
```
https://github.com/WhiteboxHub/talentscreen-privacy
or
https://whitebox-learning.com/talentscreen-privacy
```

### Store Listing Text

- [ ] **Name**: TalentScreen - Whitebox Learning Autofill
- [ ] **Summary** (132 chars): Ready
- [ ] **Description** (full): Ready (see `PUBLISHING_GUIDE.md`)
- [ ] **Category**: Productivity
- [ ] **Language**: English (United States)

---

## Chrome Web Store Setup

### Account Setup

- [ ] **Developer account** created
- [ ] **$5 registration fee** paid
- [ ] **Developer agreement** accepted
- [ ] **Email verified**

### Upload Extension

1. [ ] Go to: https://chrome.google.com/webstore/devconsole
2. [ ] Click **"New Item"**
3. [ ] Upload: `dist/talentscreen-autofill-v2.0.0.zip`
4. [ ] Wait for upload (1-2 min)
5. [ ] Click **"Continue"**

### Fill Store Listing

#### Product Details
- [ ] **Item name** entered
- [ ] **Summary** entered (132 chars max)
- [ ] **Description** entered (full)
- [ ] **Category** selected: Productivity
- [ ] **Language** selected: English

#### Assets
- [ ] **Icon** uploaded (128x128)
- [ ] **5 screenshots** uploaded (1280x800 each)
- [ ] **Screenshot captions** added
- [ ] **Promotional images** uploaded (optional)

#### Privacy
- [ ] **Single purpose** described:
  ```
  Autofills job application forms using user-provided resume data 
  to save time and reduce repetitive data entry.
  ```

- [ ] **Permission justifications** provided:
  - storage: Store resume data locally
  - activeTab: Detect forms on current page
  - tabs: Auto-open on ATS sites
  - sidePanel: Display interface
  - contextMenus: Quick access menu
  - Host permissions: Access 26+ ATS domains

- [ ] **Data usage** declared:
  - Type: Personally identifiable information
  - Purpose: Autofill job applications
  - Storage: Local device only
  - Transmission: Never transmitted

- [ ] **Privacy policy URL** added

#### Distribution
- [ ] **Visibility**: Public (or Unlisted)
- [ ] **Regions**: All (or specific)
- [ ] **Pricing**: Free

---

## Submit for Review

- [ ] **Final review** of all fields
- [ ] **Submit** button clicked
- [ ] **Confirmation** received
- [ ] **Automated checks** passed
- [ ] **Email confirmation** received

---

## Post-Submission

### Monitor Review Status

- [ ] **Check developer console** daily
- [ ] **Watch email** for updates
- [ ] **Expected timeline**: 1-7 business days

### If Approved ✅

- [ ] **Extension live** in Chrome Web Store
- [ ] **URL noted**: `https://chromewebstore.google.com/detail/[extension-id]`
- [ ] **Share URL** with users
- [ ] **Update README.md** with store link
- [ ] **Monitor reviews** and ratings
- [ ] **Respond to feedback**

### If Rejected ❌

- [ ] **Read rejection reason** in email
- [ ] **Fix issues** mentioned
- [ ] **Update ZIP** (increment version)
- [ ] **Resubmit** with fixes
- [ ] **Wait for re-review**

---

## Marketing (Post-Launch)

- [ ] **GitHub README** updated with Chrome Web Store badge
- [ ] **Company website** updated
- [ ] **Social media** announcement (LinkedIn, Twitter)
- [ ] **Demo video** created (YouTube)
- [ ] **Blog post** written
- [ ] **Email announcement** to users
- [ ] **Product Hunt** submission (optional)

---

## Maintenance Plan

### Regular Updates

- [ ] **Monitor reviews** weekly
- [ ] **Track metrics** in developer console
- [ ] **Fix bugs** as reported
- [ ] **Add ATS platforms** as requested
- [ ] **Update dependencies** quarterly

### Version Updates

When releasing updates:
- [ ] Increment version in `manifest.json`
- [ ] Update "What's new" in store listing
- [ ] Test thoroughly
- [ ] Build new ZIP
- [ ] Upload and submit

---

## Quick Links

- **Developer Console**: https://chrome.google.com/webstore/devconsole
- **Publishing Guide**: `docs/guides/PUBLISHING_GUIDE.md`
- **Privacy Policy Template**: `PRIVACY_POLICY_TEMPLATE.md`
- **Current Store Page**: https://chromewebstore.google.com/detail/talentscreen-autofill/bebdlhhpgmegdebdballinfmfnlpmeio

---

## Build Commands Reference

```bash
# Build production package
./build.sh

# Test locally
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select project root folder

# Check manifest version
cat manifest.json | grep version

# View build output
ls -lh dist/

# Test ZIP contents
unzip -l dist/talentscreen-autofill-v2.0.0.zip | less
```

---

## Support Contacts

**Developer**: Sampath Velupula  
**Email**: sampath.velupula@gmail.com, recruiting@whitebox-learning.com  
**Website**: https://whitebox-learning.com  
**GitHub**: https://github.com/WhiteboxHub

---

## Notes

- Keep this checklist updated with each release
- Document any issues encountered during review
- Track review times for future reference
- Save approved screenshots for consistency

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-16  
**Status**: Ready for submission ✅
