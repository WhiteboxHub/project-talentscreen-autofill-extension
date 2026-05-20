# How to Host Your Privacy Policy

**Quick Guide**: 3 easy options to host your privacy policy for Chrome Web Store submission.

---

## Option 1: GitHub Pages (Recommended - FREE)

**Time**: 5 minutes  
**Cost**: Free  
**Best for**: Developers comfortable with GitHub

### Steps:

1. **Create a new public repository**
   ```bash
   # On GitHub.com, create new repo named: talentscreen-privacy
   # Make it PUBLIC
   ```

2. **Push the privacy policy**
   ```bash
   cd /path/to/your/project
   
   # Copy privacy policy
   cp privacy-policy.html index.html
   
   # Create new repo
   git init talentscreen-privacy
   cd talentscreen-privacy
   git add index.html
   git commit -m "Add privacy policy"
   
   # Push to GitHub
   git remote add origin https://github.com/YOUR_USERNAME/talentscreen-privacy.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Click Save

4. **Get URL** (available in 1-2 minutes)
   ```
   https://YOUR_USERNAME.github.io/talentscreen-privacy/
   ```

5. **Test**: Open URL in browser, verify it displays correctly

6. **Use this URL in Chrome Web Store**

---

## Option 2: GitHub Gist (Fastest - FREE)

**Time**: 2 minutes  
**Cost**: Free  
**Best for**: Quick solution

### Steps:

1. **Go to GitHub Gist**
   - Visit: https://gist.github.com

2. **Create new gist**
   - Filename: `privacy-policy.html`
   - Paste entire content from `privacy-policy.html`
   - Make it **PUBLIC**
   - Click "Create public gist"

3. **Get raw URL**
   - Click "Raw" button
   - Copy URL (looks like: `https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/...`)

4. **Use this URL in Chrome Web Store**

⚠️ **Note**: Raw gist URLs include a hash that changes on edits. If you update the policy, you'll need to update the Chrome Web Store URL.

---

## Option 3: Company Website

**Time**: 10-30 minutes  
**Cost**: Depends on hosting  
**Best for**: Professional appearance

### Steps:

1. **Upload to your web server**
   ```bash
   # Example using SCP
   scp privacy-policy.html user@whitebox-learning.com:/var/www/html/talentscreen-privacy.html
   
   # Or use FTP, cPanel, etc.
   ```

2. **Configure web server** (if needed)
   - Ensure HTML files are served with correct MIME type
   - Add to `.htaccess` (Apache) or `nginx.conf`:
   ```
   AddType text/html .html
   ```

3. **Test URL**
   ```
   https://whitebox-learning.com/talentscreen-privacy.html
   ```

4. **Use this URL in Chrome Web Store**

---

## Option 4: Free Static Hosting Services

### Netlify (Free)

1. Sign up: https://netlify.com
2. Drag and drop `privacy-policy.html`
3. Get URL: `https://YOUR_SITE.netlify.app`

### Vercel (Free)

1. Sign up: https://vercel.com
2. Deploy single HTML file
3. Get URL: `https://YOUR_SITE.vercel.app`

### Cloudflare Pages (Free)

1. Sign up: https://pages.cloudflare.com
2. Connect GitHub repo or upload file
3. Get URL: `https://YOUR_SITE.pages.dev`

---

## Quick Comparison

| Option | Time | Cost | Difficulty | Professional | Updates Easy |
|--------|------|------|------------|--------------|--------------|
| GitHub Pages | 5 min | Free | Easy | ✓ | ✓ |
| GitHub Gist | 2 min | Free | Very Easy | - | ⚠️ |
| Company Website | 10-30 min | Varies | Medium | ✓✓ | ✓ |
| Netlify/Vercel | 3 min | Free | Very Easy | ✓ | ✓ |

---

## Recommended: GitHub Pages

**Why?**
- Free and permanent
- Professional URL
- Easy to update
- Version controlled
- Supports custom domain

**Full Example**:

```bash
# 1. Create repo on GitHub.com named: talentscreen-privacy

# 2. Clone and setup
git clone https://github.com/YOUR_USERNAME/talentscreen-privacy.git
cd talentscreen-privacy

# 3. Copy privacy policy
cp /path/to/privacy-policy.html index.html

# 4. Commit and push
git add index.html
git commit -m "Add privacy policy for TalentScreen extension"
git push origin main

# 5. Enable GitHub Pages (on GitHub.com)
# Settings → Pages → Source: main branch

# 6. Wait 1-2 minutes, then access:
# https://YOUR_USERNAME.github.io/talentscreen-privacy/
```

---

## Testing Your Privacy Policy URL

Before submitting to Chrome Web Store:

1. **Open URL in browser**
   - Verify it loads correctly
   - Check formatting and readability
   - Test on mobile (optional)

2. **Check accessibility**
   - URL must be publicly accessible
   - No login or authentication required
   - No CAPTCHA or blockers

3. **Verify HTTPS**
   - URL should start with `https://`
   - Chrome Web Store requires HTTPS

4. **Test from different network**
   - Try from different device/network
   - Ensure no corporate firewalls block it

---

## Adding URL to Chrome Web Store

1. **Go to Developer Console**
   - https://chrome.google.com/webstore/devconsole

2. **Edit your extension listing**
   - Navigate to Privacy tab
   - Find "Privacy policy" field

3. **Enter URL**
   ```
   https://YOUR_USERNAME.github.io/talentscreen-privacy/
   ```

4. **Save and submit**

---

## Updating Privacy Policy Later

### GitHub Pages:
```bash
cd talentscreen-privacy
# Edit index.html
git add index.html
git commit -m "Update privacy policy"
git push origin main
# Changes live in 1-2 minutes
```

### GitHub Gist:
- Edit gist on GitHub
- ⚠️ Raw URL changes - update Chrome Web Store

### Company Website:
- Upload new file via FTP/SCP
- Changes immediate

---

## Custom Domain (Optional)

### For GitHub Pages:

1. **Buy domain** (e.g., namecheap.com, godaddy.com)
   - Example: `talentscreen.com`

2. **Add CNAME record**
   ```
   privacy.talentscreen.com → YOUR_USERNAME.github.io
   ```

3. **Configure GitHub Pages**
   - Settings → Pages → Custom domain
   - Enter: `privacy.talentscreen.com`

4. **Wait for DNS propagation** (up to 24 hours)

5. **Update Chrome Web Store**
   ```
   https://privacy.talentscreen.com/
   ```

---

## Troubleshooting

### Issue: 404 Not Found
- **GitHub Pages**: Wait 1-2 minutes after enabling
- **Verify**: File is named `index.html` (not `privacy-policy.html`)
- **Check**: Branch is correct (main or master)

### Issue: Chrome Web Store rejects URL
- **Verify**: URL is publicly accessible (incognito mode)
- **Check**: URL starts with `https://`
- **Ensure**: No redirects or shortened URLs
- **Test**: URL from different network/device

### Issue: Privacy policy not displaying correctly
- **Verify**: HTML syntax is valid
- **Check**: No missing closing tags
- **Test**: Open in multiple browsers

---

## Example URLs

**GitHub Pages**:
```
https://whiteboxhub.github.io/talentscreen-privacy/
```

**GitHub Gist**:
```
https://gist.githubusercontent.com/sampathvelupula/abc123def456.../raw/.../privacy-policy.html
```

**Company Website**:
```
https://whitebox-learning.com/talentscreen-privacy.html
```

**Custom Domain**:
```
https://privacy.talentscreen.com/
```

---

## Quick Start Command (GitHub Pages)

Copy and paste this, replace YOUR_USERNAME:

```bash
# Create and setup privacy policy repo
git clone https://github.com/YOUR_USERNAME/talentscreen-privacy.git
cd talentscreen-privacy
cp /Users/sampath/dev/project-talentscreen-autofill-extension/privacy-policy.html index.html
git add index.html
git commit -m "Add privacy policy"
git push origin main

echo "✓ Privacy policy pushed to GitHub"
echo "→ Enable GitHub Pages in repo Settings"
echo "→ URL will be: https://YOUR_USERNAME.github.io/talentscreen-privacy/"
```

---

## Next Steps

1. ✅ Choose hosting option
2. ✅ Deploy privacy-policy.html
3. ✅ Get public URL
4. ✅ Test URL in browser
5. ✅ Add URL to Chrome Web Store privacy tab
6. ✅ Save and submit extension

---

**Recommended**: Use **GitHub Pages** for a professional, free, permanent solution.

**Need help?** Email: sampath.velupula@gmail.com
