# Publishing Guide - Chrome Web Store

Complete guide to publishing the TalentScreen Autofill Extension to the Chrome Web Store.

**Last Updated**: 2026-05-16

---

## Prerequisites

### 1. Chrome Web Store Developer Account

- **Cost**: $5 USD one-time registration fee
- **Sign up**: https://chrome.google.com/webstore/devconsole
- **Payment**: Credit/debit card required
- **Verification**: Google account verification needed

### 2. Required Assets

- [ ] Extension icon (128x128 PNG)
- [ ] Screenshots (1280x800 or 640x400 PNG/JPG)
- [ ] Promotional images (optional but recommended)
- [ ] Privacy policy URL (if collecting data)
- [ ] Support email address

### 3. Legal Requirements

- [ ] Privacy policy (required if extension collects user data)
- [ ] Terms of service (recommended)
- [ ] Data usage disclosure
- [ ] Permissions justification

---

## Step 1: Prepare Extension

### 1.1 Clean Build

```bash
# Remove development files
rm -rf .DS_Store
rm -rf **/.DS_Store
rm -rf .claude/
rm -rf node_modules/
rm -rf *.log

# Verify manifest.json
cat manifest.json | jq .

# Test extension locally
# Load in Chrome: chrome://extensions/ → "Load unpacked"
```

### 1.2 Update Manifest

Check `manifest.json` for production readiness:

```json
{
  "manifest_version": 3,
  "name": "TalentScreen - Whitebox Learning Autofill",
  "version": "2.0.0",  // Increment for updates
  "description": "TalentScreen - Whitebox Learning Autofill extension intelligently fills job application forms...",
  "author": "Whitebox Learning - Sampath Velupula",
  "homepage_url": "https://chromewebstore.google.com/detail/talentscreen-autofill/bebdlhhpgmegdebdballinfmfnlpmeio"
}
```

**Version Numbering**:
- Major updates: `2.0.0` → `3.0.0`
- Feature updates: `2.0.0` → `2.1.0`
- Bug fixes: `2.0.0` → `2.0.1`

### 1.3 Create ZIP Archive

```bash
# Create distribution directory
mkdir -p dist

# Create ZIP (exclude unnecessary files)
zip -r dist/talentscreen-autofill-v2.0.0.zip \
  manifest.json \
  assets/ \
  src/ \
  -x "*.DS_Store" \
  -x "*/.DS_Store" \
  -x "*.log" \
  -x "*node_modules*" \
  -x "*.git*"

# Verify ZIP contents
unzip -l dist/talentscreen-autofill-v2.0.0.zip

# Check ZIP size (should be under 50MB)
ls -lh dist/talentscreen-autofill-v2.0.0.zip
```

**Alternative** (exclude more files):

```bash
# Using .gitignore-like exclusions
zip -r dist/talentscreen-autofill-v2.0.0.zip . \
  -x "*.DS_Store" \
  -x "docs/*" \
  -x "*.md" \
  -x ".git*" \
  -x ".claude/*" \
  -x "dist/*" \
  -x "node_modules/*" \
  -x "*.log"
```

### 1.4 Test ZIP Package

```bash
# Extract to temp directory
mkdir -p tmp/test-extension
unzip dist/talentscreen-autofill-v2.0.0.zip -d tmp/test-extension/

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select tmp/test-extension/
# 5. Test all features

# Clean up
rm -rf tmp/
```

---

## Step 2: Prepare Store Assets

### 2.1 Screenshots

**Requirements**:
- **Size**: 1280x800 or 640x400 pixels
- **Format**: PNG or JPG
- **Quantity**: 1-5 screenshots (recommend 5)
- **Content**: Show key features

**Recommended Screenshots**:
1. **Setup View** - Initial setup with JSON/PDF upload
2. **Autofill Button** - Main interface with autofill button
3. **Settings Page** - Custom fields configuration
4. **Form Filling** - Extension filling a job application
5. **Completion Widget** - Progress tracking

**How to Create**:
```bash
# Take screenshots in Chrome
# Cmd+Shift+4 (Mac) or Windows+Shift+S (Windows)

# Resize if needed (using ImageMagick)
convert screenshot.png -resize 1280x800 screenshot-resized.png

# Or use online tool: https://www.iloveimg.com/resize-image
```

### 2.2 Promotional Images (Optional)

**Small Promotional Tile**:
- Size: 440x280 pixels
- Format: PNG or JPG
- Shows in Chrome Web Store search results

**Large Promotional Tile**:
- Size: 920x680 pixels
- Format: PNG or JPG
- Featured in Chrome Web Store

**Marquee Promotional Tile**:
- Size: 1400x560 pixels
- Format: PNG or JPG
- Featured placement (if selected by Google)

### 2.3 Privacy Policy

**Required if extension**:
- Collects user data
- Transmits data off-device
- Uses user credentials
- Uses remote code

**Your extension collects**:
- Resume JSON data (stored locally)
- Resume PDF files (stored locally)
- Form tracking data (local)

**Create privacy policy**:
1. Use template: https://www.privacypolicygenerator.info/
2. Host on website or GitHub
3. Example URL: https://whitebox-learning.com/talentscreen-privacy

**Key points to include**:
```
- What data is collected: Resume data, job application tracking
- Where data is stored: Chrome local storage (device only)
- Data sharing: No data shared with third parties
- Data retention: Until user deletes extension
- User rights: Can delete data anytime via extension
- Contact: support email
```

---

## Step 3: Chrome Web Store Developer Console

### 3.1 Access Developer Console

1. Go to: https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay $5 registration fee (if first time)
4. Accept developer agreement

### 3.2 Create New Item

1. Click **"New Item"** button
2. Upload ZIP file: `dist/talentscreen-autofill-v2.0.0.zip`
3. Wait for upload (may take 1-2 minutes)
4. Click **"Continue"**

### 3.3 Fill Store Listing

**Product Details**:

```
Item name: TalentScreen - Whitebox Learning Autofill

Summary (132 chars max):
Intelligently autofills job applications across 26+ ATS platforms using your JSON resume data. Save time, apply faster.

Description (16,000 chars max):
TalentScreen Autofill Extension revolutionizes the job application process by intelligently filling out forms across 26+ Applicant Tracking Systems (ATS) including Workday, Greenhouse, Lever, LinkedIn, SmartRecruiters, and more.

🎯 KEY FEATURES

✅ Smart Autofill
- Automatically detects and fills job application forms
- Supports 26+ ATS platforms
- React/Angular SPA compatibility
- Multi-pass autofill for dynamic forms
- 80-95% field fill success rate

✅ Resume Management
- Upload JSON resume data (JSON Resume format)
- Upload PDF/DOC resume for attachments
- Manage custom fields (EEO, work authorization, technical screening)
- Edit information anytime in settings

✅ Application Tracking
- Track all job applications automatically
- View application history
- Monitor form completion progress
- Export tracking data

✅ Privacy First
- All data stored locally on your device
- No cloud storage or external transmission
- No account required
- Complete control over your data

🏢 SUPPORTED ATS PLATFORMS

- Workday
- Greenhouse
- Lever
- LinkedIn Jobs
- SmartRecruiters
- Workable
- Taleo
- SuccessFactors
- iCIMS
- BambooHR
- Ashby
- And 15+ more...

📋 HOW TO USE

1. Install the extension
2. Upload your JSON resume and PDF
3. Navigate to any job application page
4. Click the Autofill button
5. Review and submit!

🔒 PRIVACY & SECURITY

Your resume data never leaves your device. All information is stored in Chrome's local storage and is never transmitted to external servers.

📧 SUPPORT

Email: sampath.velupula@gmail.com, recruiting@whitebox-learning.com
Privacy Policy: [Your Privacy Policy URL]
GitHub: https://github.com/WhiteboxHub

Made with ❤️ by Whitebox Learning
```

**Category**: Productivity

**Language**: English (United States)

### 3.4 Upload Assets

**Icon**:
- Upload: `assets/icons/icon128.png`
- Must be 128x128 pixels

**Screenshots**:
- Upload 5 screenshots (1280x800 each)
- Add captions for each:
  1. "Easy setup - Upload your resume in seconds"
  2. "One-click autofill for any job application"
  3. "Manage all your information in one place"
  4. "Watch forms fill automatically"
  5. "Track your application progress"

**Promotional Images** (optional):
- Small tile: 440x280
- Large tile: 920x680

### 3.5 Privacy Settings

**Single Purpose**:
```
TalentScreen autofills job application forms using user-provided resume data to save time and reduce repetitive data entry.
```

**Permission Justification**:

```
storage: Store user resume data and application tracking locally
activeTab: Detect job application forms on current page
tabs: Auto-open extension when ATS sites are detected
sidePanel: Display extension interface
contextMenus: Quick access via right-click menu
```

**Host Permissions Justification**:
```
Access to 26+ ATS domains (workday, greenhouse, lever, etc.) is required to detect job application forms and autofill fields on these specific platforms.
```

**Data Usage**:
- [ ] Personally identifiable information: YES
  - Type: Name, email, phone, address, resume data
  - Purpose: Autofill job applications
  - Stored: Locally on user's device
  - Transmitted: Never

**Privacy Policy URL**:
```
https://whitebox-learning.com/talentscreen-privacy
(or GitHub: https://github.com/WhiteboxHub/talentscreen-privacy)
```

### 3.6 Distribution

**Visibility**:
- [x] Public
- [ ] Unlisted (only via direct link)

**Regions**: Select all (or specific countries)

**Pricing**: Free

---

## Step 4: Submit for Review

### 4.1 Review Checklist

Before submitting, verify:

- [x] Manifest version incremented
- [x] All permissions justified
- [x] Privacy policy published and URL added
- [x] Screenshots uploaded (5 recommended)
- [x] Description complete and accurate
- [x] Extension tested locally
- [x] No console errors
- [x] All features working
- [x] ZIP file under 50MB
- [x] Icons present (16, 48, 128)

### 4.2 Submit

1. Click **"Submit for Review"** button
2. Confirm submission
3. Wait for automated checks (1-2 minutes)

**Automated Checks**:
- Manifest validation
- Permissions review
- Malware scan
- Code analysis

### 4.3 Review Timeline

**Expected Timeline**:
- **Automated review**: 1-2 hours (for simple extensions)
- **Manual review**: 1-3 business days (if flagged)
- **Complex extensions**: Up to 7 business days

**Status Updates**:
- Check developer console regularly
- Email notifications sent to account email

**Common Review Reasons**:
1. Permissions justification needed
2. Privacy policy missing/incomplete
3. Single purpose unclear
4. Code quality issues
5. Policy violations

---

## Step 5: Handle Review Feedback

### 5.1 If Approved ✅

**Congratulations!** Your extension is live.

**Post-Publication**:
1. Extension appears in Chrome Web Store
2. URL: `https://chromewebstore.google.com/detail/[extension-id]`
3. Share URL with users
4. Monitor reviews and ratings
5. Respond to user feedback

### 5.2 If Rejected ❌

**Common Rejection Reasons**:

**1. Permissions Not Justified**
- **Action**: Edit privacy tab, add detailed justification
- **Resubmit**: Update and resubmit

**2. Privacy Policy Issues**
- **Action**: Create detailed privacy policy
- **Host**: GitHub, website, or Google Doc (public)
- **Update**: Add URL to listing

**3. Single Purpose Unclear**
- **Action**: Clarify in description and single purpose field
- **Example**: "Autofills job applications using resume data"

**4. Code Quality Issues**
- **Action**: Review code, remove obfuscated code
- **Fix**: Address specific violations mentioned

**5. Policy Violations**
- **Action**: Review Chrome Web Store policies
- **Fix**: Remove violating functionality
- **Resubmit**: After fixes

### 5.3 Resubmit

1. Make required changes
2. Upload new ZIP (increment version)
3. Update listing if needed
4. Click "Resubmit"
5. Wait for re-review (usually faster)

---

## Step 6: Post-Publication

### 6.1 Monitor Performance

**Developer Console Metrics**:
- Total installs
- Active users (daily/weekly)
- Uninstalls
- Crash reports
- Reviews and ratings

### 6.2 Respond to Reviews

**Best Practices**:
- Respond to negative reviews professionally
- Thank users for positive feedback
- Address bugs mentioned in reviews
- Provide support contact for issues

**Example Response**:
```
Thank you for the feedback! We've fixed this issue in version 2.0.1. 
Please update the extension and let us know if you need further assistance: 
support@whitebox-learning.com
```

### 6.3 Release Updates

**When to Update**:
- Bug fixes
- New features
- Security patches
- ATS platform support

**Update Process**:
1. Increment version in manifest.json
2. Test changes locally
3. Create new ZIP
4. Upload in developer console
5. Update "What's new" field
6. Submit for review

**What's New Example**:
```
Version 2.0.1 - Bug Fixes
- Fixed SmartRecruiters form filling
- Improved React input compatibility
- Added debug mode
- Performance improvements
```

### 6.4 Marketing & Promotion

**Share Extension**:
- GitHub README
- Company website
- Social media
- Job boards
- LinkedIn
- YouTube demo video
- Blog posts

**Chrome Web Store URL**:
```
https://chromewebstore.google.com/detail/talentscreen-autofill/bebdlhhpgmegdebdballinfmfnlpmeio
```

**Short URL** (create using bit.ly or similar):
```
https://bit.ly/talentscreen-autofill
```

---

## Quick Command Reference

```bash
# Build and package
zip -r dist/extension-v2.0.0.zip . \
  -x "*.DS_Store" "docs/*" "*.md" ".git*" ".claude/*" "dist/*"

# Test locally
# 1. chrome://extensions/
# 2. Load unpacked → select folder

# Check manifest
cat manifest.json | jq .

# Increment version
# Edit manifest.json: "version": "2.0.1"

# Create privacy policy
# Use: https://www.privacypolicygenerator.info/
```

---

## Troubleshooting

### Issue: ZIP Upload Fails

**Solutions**:
- Check ZIP size (max 50MB)
- Verify manifest.json is valid
- Remove large files (videos, node_modules)
- Use maximum compression

### Issue: Permissions Rejected

**Solutions**:
- Add detailed justification for each permission
- Remove unnecessary permissions
- Link to documentation explaining usage

### Issue: Long Review Time

**Solutions**:
- Wait patiently (can take 7 days)
- Check spam folder for emails
- Don't resubmit during review
- Contact Chrome Web Store support if >7 days

### Issue: Extension Suspended

**Immediate Actions**:
1. Check email for violation details
2. Review Chrome Web Store policies
3. Fix violations
4. Appeal suspension (if applicable)
5. Contact Chrome Web Store support

---

## Resources

**Chrome Web Store**:
- Developer Console: https://chrome.google.com/webstore/devconsole
- Developer Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Best Practices: https://developer.chrome.com/docs/webstore/best_practices/

**Chrome Extensions**:
- Documentation: https://developer.chrome.com/docs/extensions/
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/intro/
- API Reference: https://developer.chrome.com/docs/extensions/reference/

**Support**:
- Stack Overflow: https://stackoverflow.com/questions/tagged/google-chrome-extension
- Chrome Extensions Google Group: https://groups.google.com/a/chromium.org/g/chromium-extensions

**Tools**:
- JSON Resume: https://jsonresume.org/
- Privacy Policy Generator: https://www.privacypolicygenerator.info/
- Image Resizer: https://www.iloveimg.com/resize-image

---

## Checklist Summary

### Pre-Submission
- [ ] Clean build created
- [ ] ZIP file tested locally
- [ ] All features working
- [ ] Version number updated
- [ ] Privacy policy published
- [ ] Screenshots captured (5)
- [ ] Store listing written
- [ ] Support email configured

### Submission
- [ ] ZIP uploaded
- [ ] Store listing filled
- [ ] Assets uploaded
- [ ] Privacy settings configured
- [ ] Permissions justified
- [ ] Single purpose clear
- [ ] Submitted for review

### Post-Publication
- [ ] Monitor reviews
- [ ] Respond to feedback
- [ ] Track metrics
- [ ] Plan updates
- [ ] Market extension

---

**Good luck with your extension launch!** 🚀

For questions or issues, contact: sampath.velupula@gmail.com
