# 🚀 TalentScreen - Whitebox Learning Autofill

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Chrome-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**TalentScreen - Whitebox Learning Autofill** is an intelligent Chrome extension that streamlines job applications by auto-filling forms across 26+ Applicant Tracking Systems (ATS) using your JSON resume data.

🔗 **[Install from Chrome Web Store](https://chromewebstore.google.com/detail/talentscreen-autofill/bebdlhhpgmegdebdballinfmfnlpmeio)**

---

## ✨ Key Features

- **🎯 Manual Control**: User-triggered autofill with visual feedback
- **📁 Dual Format Support**: JSON resume + optional PDF attachment
- **🛠️ Integrated Data Manager**: Edit resume data directly in the extension
- **📊 Application Tracking**: Automatic history of filled applications
- **🔒 User-Lock System**: Protects manually edited fields from overwrites
- **✅ Smart Validation**: Pre-flight checks for required resume fields
- **🎨 Modern Setup-First UI**: Clean, intuitive interface with no clutter
- **🔄 Custom Fields**: Extended support for EEO, legal, and technical screening questions

---

## 🏗️ Supported ATS Platforms

TalentScreen supports 26+ major Applicant Tracking Systems:

| Category | Platforms |
|----------|-----------|
| **Enterprise** | Workday, SuccessFactors, Oracle Cloud, Taleo |
| **Popular** | Greenhouse, Lever, iCIMS, SmartRecruiters |
| **Modern** | Ashby, Rippling, BambooHR, Personio |
| **Large Networks** | Indeed, LinkedIn Jobs |
| **Payroll-Integrated** | ADP, Paychex, UltiPro (UKG), Paycom |
| **Others** | Jobvite, Workable, Recruitee, TeamTailor, BrassRing, ApplyToJob |
| **Generic Fallback** | Heuristic matching for custom job boards |

---

## 📥 Installation

### From Chrome Web Store (Recommended)
1. Visit the [Chrome Web Store listing](https://chromewebstore.google.com/detail/talentscreen-autofill/bebdlhhpgmegdebdballinfmfnlpmeio)
2. Click **"Add to Chrome"**
3. Pin the extension to your toolbar

### From Source (Development)
```bash
# Clone repository
git clone https://github.com/your-org/talentscreen-autofill-extension.git
cd talentscreen-autofill-extension

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension directory
```

---

## 🎯 Getting Started

### 1. Prepare Your Resume JSON

TalentScreen uses the [JSON Resume](https://jsonresume.org/) standard with custom field extensions.

**📄 Sample Template:** [View on GitHub](https://github.com/WhiteboxHub/project-avatar-resume-json-cli/blob/main/src/resumes/test/demo.json)

**Minimal Example:**
```json
{
  "basics": {
    "name": "Your Name",
    "email": "you@example.com",
    "phone": "+1-555-0100",
    "location": {
      "city": "San Francisco",
      "region": "CA",
      "postalCode": "94102",
      "countryCode": "US"
    }
  },
  "work": [
    {
      "name": "Company Name",
      "position": "Software Engineer",
      "startDate": "2020-01-01",
      "summary": "Built scalable systems..."
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "area": "Computer Science",
      "studyType": "Bachelor",
      "endDate": "2019-12-01"
    }
  ],
  "skills": [
    {
      "name": "Programming",
      "keywords": ["JavaScript", "Python", "React"]
    }
  ]
}
```

### 2. Upload Your Data

1. Click the extension icon to open the side panel
2. Upload your **resume JSON** (required)
3. Upload your **resume PDF** (optional, for file attachments)
4. Click **"Autofill Form"** on any supported job application page

### 3. Manage Your Information

- Click **"Manage Information"** to edit your JSON data
- Use **"Update JSON"** or **"Update PDF"** quick actions
- View recent applications in the **History** section

---

## 🏗️ Project Structure

```
talentscreen-autofill-extension/
├── manifest.json                    # Extension configuration
├── src/
│   ├── core/
│   │   └── resumeProcessor.js       # Central data normalization module
│   ├── background/
│   │   └── background.js            # Service worker (Manifest V3)
│   ├── content/
│   │   ├── content.js               # Page interaction orchestrator
│   │   └── atsStrategies/           # ATS-specific strategies (26 files)
│   │       ├── strategyRegistry.js  # Strategy pattern implementation
│   │       ├── genericStrategy.js   # Base strategy (937 LOC)
│   │       ├── workdayStrategy.js
│   │       ├── greenhouseStrategy.js
│   │       └── ...
│   └── ui/
│       ├── sidepanel.html           # Extension UI
│       ├── sidepanel.js             # UI controller
│       └── styles.css               # Modern styling
├── assets/
│   └── icons/                       # Extension icons
├── docs/
│   └── sample_resume.json           # Full resume template
├── build/
│   └── package.js                   # Build script
└── README.md
```

---

## 🔧 Development

### Prerequisites
- Node.js 16+ (for build script)
- Chrome/Chromium browser
- Git

### Setup
```bash
# Install (no dependencies currently)
npm install

# Lint JavaScript files
npm run lint

# Build production ZIP
npm run build

# Run tests (placeholder)
npm test
```

### Loading Unpacked Extension
1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the project root directory
5. The extension will appear with a generated ID

### Testing
```bash
# Manual Testing Checklist
1. Load extension in Chrome
2. Navigate to a test job board (e.g., greenhouse.io/embed/job_board)
3. Upload sample JSON from docs/
4. Click "Autofill Form"
5. Verify fields populate correctly
6. Manually edit a field
7. Click "Autofill Form" again
8. Verify manually edited field is NOT overwritten (user-lock)
9. Check application history
```

### Debugging
```bash
# View extension logs
1. Right-click extension icon → Inspect popup
2. Console tab shows [Sidepanel] logs

# View content script logs
1. Open any job application page
2. Open DevTools (F12)
3. Console shows [Content] logs

# View service worker logs
1. Navigate to chrome://extensions/
2. Click "service worker" link under extension
3. Console shows [Background] logs
```

---

## 🏗️ Architecture

### Strategy Pattern for ATS Detection
```javascript
// Each ATS gets a custom strategy
class WorkdayStrategy extends GenericStrategy {
  execute(normalizedData, resumeFile) {
    // Workday-specific logic
  }
}

// Registration
ATSStrategyRegistry.register(
  (url) => url.includes('workday.com'),
  WorkdayStrategy
);
```

### Data Flow
```
1. User uploads JSON → sidepanel.js
2. ResumeProcessor.normalize() → Structured data
3. Chrome storage → Persisted
4. User clicks "Autofill" → Message to content script
5. ATSStrategyRegistry.getStrategy() → Selects strategy
6. Strategy.execute() → Fills form fields
7. Progress updates → Back to sidepanel
8. History logged → Chrome storage
```

### Custom Fields Extension
```json
{
  "custom_fields": {
    "eeo": {
      "gender": "male",
      "ethnicity": "asian",
      "veteran_status": "no",
      "disability_status": "no"
    },
    "legal": {
      "work_auth_us": true,
      "sponsorship_required_now": false,
      "security_clearance": "no"
    },
    "technical_screening": {
      "years_python": 10,
      "years_llm": 3
    },
    "application_logistics": {
      "willing_to_relocate": "yes",
      "screening_answers": {
        "why_interested": "Your compelling reason...",
        "why_good_fit": "Your relevant experience..."
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Extension Not Working
**Problem:** "Could not reach page" error  
**Solution:**
- Reload the job application page
- Ensure the site is in the supported ATS list
- Check if content script loaded: DevTools → Sources → Content Scripts

**Problem:** Fields not filling correctly  
**Solution:**
- Verify JSON format using [jsonlint.com](https://jsonlint.com/)
- Check required fields: name, email
- Some ATS use dynamic forms that load slowly—wait 2-3 seconds

**Problem:** PDF not attaching  
**Solution:**
- Ensure file is under 10MB
- Supported formats: PDF, DOC, DOCX
- Some ATS don't support automated file uploads

### Build Issues
**Problem:** `npm run build` fails  
**Solution:**
```bash
# Ensure you have zip utility installed
which zip  # Should return /usr/bin/zip or similar

# On macOS, zip is pre-installed
# Command to run for zip file in macOS : chmod +x build.sh then ./build.sh
# Command to run for zip file in windows : ./build.ps1
# On Linux: apt-get install zip
```

---

## 🤝 Contributing

Contributions are welcome! To add support for a new ATS:

### 1. Create a New Strategy
```javascript
// src/content/atsStrategies/newAtsStrategy.js
class NewAtsStrategy extends GenericStrategy {
  constructor() {
    super();
    this.CONFIDENCE_THRESHOLD = 70;
  }

  async execute(normalizedData, resumeFile) {
    await super.execute(normalizedData, resumeFile);
    // Add ATS-specific logic here
  }
}

// Register
if (typeof ATSStrategyRegistry !== 'undefined') {
  ATSStrategyRegistry.register(
    (url) => url.includes('newats.com'),
    NewAtsStrategy
  );
}
```

### 2. Update manifest.json
```json
{
  "host_permissions": [
    "*://*.newats.com/*"
  ],
  "content_scripts": [{
    "matches": ["*://*.newats.com/*"],
    "js": [
      "src/core/resumeProcessor.js",
      "src/content/atsStrategies/genericStrategy.js",
      "src/content/atsStrategies/strategyRegistry.js",
      "src/content/atsStrategies/newAtsStrategy.js",
      "src/content/content.js"
    ]
  }]
}
```

### 3. Submit Pull Request
- Fork the repository
- Create a feature branch: `git checkout -b add-newats-support`
- Test thoroughly on live ATS site
- Submit PR with:
  - Strategy implementation
  - Manifest updates
  - Test results/screenshots

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Authors

**Whitebox Learning** - Educational platform for AI and software engineering

- **Lead Developer:** Sampath Velupula
- **Contributors:** Ravi Kumar Rayapalli, Ramana Gangarao, Bavish Kangari, Jafar Vali, Jatin Thakur

---

## 🔐 Privacy

This extension:
- ✅ Stores all data **locally** in Chrome storage
- ✅ **Never sends** data to external servers
- ✅ **Open source** - audit the code yourself
- ✅ Requests permissions only for supported job boards

Read our full [Privacy Policy](PRIVACY_POLICY.md)

---

## 📞 Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/your-org/talentscreen-autofill-extension/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/your-org/talentscreen-autofill-extension/discussions)
- 📧 **Email:** support@whiteboxlearning.com

---

## 🗺️ Roadmap

### v2.1 (Q3 2026)
- [ ] Test framework with Playwright
- [ ] ML-based field detection
- [ ] Multi-language support

### v2.2 (Q4 2026)
- [ ] Firefox/Edge support
- [ ] Resume template library
- [ ] Advanced analytics dashboard

### v3.0 (2027)
- [ ] AI-powered cover letter generation
- [ ] Interview preparation assistant
- [ ] Job search optimization

---

**Built for job seekers who value their time. Made with ❤️ by Whitebox Learning.**
