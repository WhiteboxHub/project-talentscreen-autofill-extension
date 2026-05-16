# Privacy Policy - Quick Setup Guide

**Status**: ✅ Ready to host  
**Files created**: 3 versions available

---

## 📄 Files Available

1. **`privacy-policy.html`** - Styled HTML version (recommended)
2. **`privacy-policy.txt`** - Plain text version (backup)
3. **`PRIVACY_POLICY_TEMPLATE.md`** - Markdown reference

---

## 🚀 Fastest Option: GitHub Pages (5 minutes)

### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `talentscreen-privacy`
3. Make it **PUBLIC** ✓
4. **Do NOT** initialize with README
5. Click "Create repository"

### Step 2: Use Quick Setup Script

```bash
# Run this script (replace with your GitHub username)
./setup-github-privacy.sh YOUR_GITHUB_USERNAME

# Example:
./setup-github-privacy.sh whiteboxhub
```

The script will:
- Copy privacy-policy.html to index.html
- Create git repo
- Push to GitHub
- Give you next steps

### Step 3: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/talentscreen-privacy/settings/pages`
2. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
3. Click **Save**

### Step 4: Get Your URL (wait 1-2 minutes)

Your privacy policy will be live at:
```
https://YOUR_USERNAME.github.io/talentscreen-privacy/
```

### Step 5: Add to Chrome Web Store

1. Go to Chrome Web Store Developer Console
2. Navigate to your extension → Privacy tab
3. Enter the URL in "Privacy policy" field
4. Save

---

## 🔄 Alternative: Manual GitHub Upload

If you prefer not to use the script:

```bash
# 1. Create repo on GitHub (as above)

# 2. Clone the empty repo
git clone https://github.com/YOUR_USERNAME/talentscreen-privacy.git
cd talentscreen-privacy

# 3. Copy the privacy policy
cp /path/to/privacy-policy.html index.html

# 4. Commit and push
git add index.html
git commit -m "Add privacy policy"
git push origin main

# 5. Enable GitHub Pages (Settings → Pages)
```

---

## 📋 Other Hosting Options

### Option 1: GitHub Gist (2 minutes)

1. Go to: https://gist.github.com
2. Filename: `privacy-policy.html`
3. Paste content from `privacy-policy.html`
4. Create **public** gist
5. Click "Raw" button
6. Copy URL
7. Use in Chrome Web Store

⚠️ Note: Raw URL changes if you edit the gist

### Option 2: Company Website

1. Upload `privacy-policy.html` to your web server
2. Access via: `https://whitebox-learning.com/talentscreen-privacy.html`
3. Test URL works
4. Use in Chrome Web Store

### Option 3: Free Static Hosting

**Netlify** (https://netlify.com):
- Sign up → Drag and drop `privacy-policy.html`
- Get URL: `https://YOUR_SITE.netlify.app`

**Vercel** (https://vercel.com):
- Sign up → Deploy HTML file
- Get URL: `https://YOUR_SITE.vercel.app`

---

## ✅ Testing Your Privacy Policy

Before submitting to Chrome Web Store:

1. **Open URL in browser**
   - Verify it loads correctly
   - Check all sections display properly

2. **Test accessibility**
   - Open in incognito/private mode
   - Try from different device/network
   - Ensure no login required

3. **Verify HTTPS**
   - URL should start with `https://`
   - Chrome Web Store requires HTTPS

---

## 📝 Privacy Policy Content

Your privacy policy includes:

✓ What data is collected
✓ How data is stored (locally only)
✓ How data is used
✓ No data sharing statement
✓ Chrome permissions explained
✓ User rights (access, modify, delete)
✓ GDPR & CCPA compliance
✓ Contact information

**Key Points**:
- All data stored locally
- No external transmission
- No third-party services
- Complete user control

---

## 🔍 What Chrome Web Store Checks

When you submit, Chrome will verify:

1. Privacy policy URL is accessible
2. URL uses HTTPS
3. Policy covers data collection
4. Policy explains permissions
5. Policy mentions data sharing (or lack thereof)
6. Contact information present

Your policy covers all these requirements ✓

---

## 🛠️ Updating Privacy Policy Later

### GitHub Pages:
```bash
cd talentscreen-privacy
# Edit index.html
git add index.html
git commit -m "Update privacy policy"
git push origin main
# Live in 1-2 minutes
```

### GitHub Gist:
- Edit on GitHub
- Get new Raw URL
- Update Chrome Web Store

---

## 📞 Support

**Questions?**
- Email: sampath.velupula@gmail.com
- See: `HOSTING_PRIVACY_POLICY.md` for detailed guide

---

## 🎯 Recommended Approach

**For Most People**: Use GitHub Pages
- Free forever
- Professional URL
- Easy to update
- No maintenance required

**URL will be**:
```
https://YOUR_USERNAME.github.io/talentscreen-privacy/
```

---

## ⚡ Quick Checklist

Before submitting to Chrome Web Store:

- [ ] Privacy policy file created (`privacy-policy.html`)
- [ ] Hosted on public URL
- [ ] URL accessible via HTTPS
- [ ] Policy tested in browser
- [ ] URL added to Chrome Web Store Privacy tab
- [ ] No login/authentication required to view
- [ ] Contact email verified

---

## 🎉 You're Ready!

Once your privacy policy is hosted:

1. ✅ Copy the public URL
2. ✅ Go to Chrome Web Store Developer Console
3. ✅ Navigate to Privacy tab
4. ✅ Paste URL in "Privacy policy" field
5. ✅ Save and continue with submission

**Next**: Upload your extension ZIP and complete the store listing!

---

**Files**:
- `privacy-policy.html` - Use this for hosting
- `setup-github-privacy.sh` - Quick GitHub Pages setup
- `HOSTING_PRIVACY_POLICY.md` - Detailed hosting guide

**Need help?** See `HOSTING_PRIVACY_POLICY.md` for all options and troubleshooting.
