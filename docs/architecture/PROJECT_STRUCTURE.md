# TalentScreen Extension - Project Structure

## Directory Layout

```
talentscreen-autofill-extension/
├── assets/
│   ├── icons/                    # Extension icons (all sizes)
│   │   ├── icon16.png           # 16x16 toolbar icon
│   │   ├── icon48.png           # 48x48 extension page icon
│   │   ├── icon128.png          # 128x128 Chrome Web Store icon
│   │   ├── logo_sidepanel.png   # 52x52 sidepanel logo
│   │   ├── talentscreen.jpeg    # Original logo (source)
│   │   └── talentscreen.png     # Converted logo
│   └── styles.css               # Legacy styles (unused)
│
├── build/
│   └── package.js               # Build script for packaging extension
│
├── docs/
│   ├── api/
│   │   ├── API_IMPLEMENTATION.md    # Public API implementation summary
│   │   └── CLI_API.md               # Complete CLI/Playwright guide (1100+ lines)
│   ├── dev/
│   │   ├── FIXED.md                 # Initial bug fix documentation
│   │   └── REFACTOR_SUMMARY.md      # Refactoring documentation
│   ├── setup/
│   │   ├── LOAD_EXTENSION.md        # How to load extension in Chrome
│   │   └── QUICK_START.md           # Quick start guide
│   ├── testing/
│   │   ├── TEST_EXTENSION.md        # Testing procedures
│   │   └── TESTING.md               # Testing guide
│   ├── tracking/
│   │   ├── FORM_TRACKING.md         # Form tracking system guide (750+ lines)
│   │   └── TRACKING_IMPLEMENTATION.md # Tracking implementation details
│   ├── sample_resume.json           # Sample resume in JSON Resume format
│   └── sample_resume.pdf            # Sample resume PDF
│
├── src/
│   ├── background/
│   │   └── background.js            # Service worker (background script)
│   │
│   ├── content/
│   │   ├── atsStrategies/           # ATS-specific form filling strategies
│   │   │   ├── genericStrategy.js   # Generic/fallback strategy (base class)
│   │   │   ├── strategyRegistry.js  # Strategy registration and detection
│   │   │   ├── adpStrategy.js       # ADP Workforce Now
│   │   │   ├── applytojobStrategy.js # ApplyToJob
│   │   │   ├── ashbyStrategy.js     # Ashby
│   │   │   ├── bamboohrStrategy.js  # BambooHR
│   │   │   ├── brassringStrategy.js # Kenexa BrassRing
│   │   │   ├── greenhouseStrategy.js # Greenhouse
│   │   │   ├── icimsStrategy.js     # iCIMS
│   │   │   ├── indeedStrategy.js    # Indeed
│   │   │   ├── jobviteStrategy.js   # Jobvite
│   │   │   ├── leverStrategy.js     # Lever
│   │   │   ├── linkedinStrategy.js  # LinkedIn
│   │   │   ├── oraclecloudStrategy.js # Oracle Cloud
│   │   │   ├── paychexStrategy.js   # Paychex
│   │   │   ├── paycomStrategy.js    # Paycom
│   │   │   ├── personioStrategy.js  # Personio
│   │   │   ├── recruiteeStrategy.js # Recruitee
│   │   │   ├── ripplingStrategy.js  # Rippling
│   │   │   ├── smartrecruitersStrategy.js # SmartRecruiters
│   │   │   ├── successfactorsStrategy.js # SAP SuccessFactors
│   │   │   ├── taleoStrategy.js     # Oracle Taleo
│   │   │   ├── teamtailorStrategy.js # Teamtailor
│   │   │   ├── ultiproStrategy.js   # UltiPro/UKG
│   │   │   ├── workableStrategy.js  # Workable
│   │   │   └── workdayStrategy.js   # Workday
│   │   ├── content.js               # Main content script (coordinator)
│   │   └── trackingIntegration.js   # Form tracking integration layer
│   │
│   ├── core/
│   │   ├── resumeProcessor.js       # Resume data normalization (JSON Resume → flat fields)
│   │   ├── formTracker.js           # Form tracking engine (session/field tracking)
│   │   └── autofillAPI.js           # Public API for CLI/Playwright (window.AutofillExtension)
│   │
│   └── ui/
│       ├── sidepanel.html           # Side panel UI (main interface)
│       ├── sidepanel.js             # Side panel controller (UI logic)
│       └── styles.css               # Side panel styles
│
├── CHANGELOG.md                     # Version history and changes
├── LICENSE                          # License information
├── manifest.json                    # Chrome extension manifest (Manifest V3)
├── package.json                     # Node.js package metadata
├── PRIVACY_POLICY.md                # Privacy policy
├── PROJECT_STRUCTURE.md             # This file
└── README.md                        # Main project documentation
```

---

## File Counts

- **Total JavaScript files:** 54
- **Core modules:** 3 (resumeProcessor, formTracker, autofillAPI)
- **ATS strategies:** 26
- **Content scripts:** 2 (content.js, trackingIntegration.js)
- **UI scripts:** 2 (sidepanel.js, background.js)
- **Documentation files:** 14 markdown files
- **Icons:** 6 files

---

## Key Files Description

### Core System Files

#### `manifest.json`
- Extension configuration
- Permissions: storage, contextMenus, sidePanel, activeTab
- Content scripts injection for 26+ ATS platforms
- Service worker registration

#### `src/background/background.js`
- Service worker (background script)
- Handles extension icon clicks
- Opens side panel
- Manages window-to-panel communication

#### `src/content/content.js`
- Main content script coordinator
- Detects ATS type via StrategyRegistry
- Listens for fill_form messages from sidepanel
- Coordinates form filling via ATS strategies
- Handles PDF file uploads

---

### Core Logic Modules

#### `src/core/resumeProcessor.js` (26 KB)
- **Purpose:** Single source of truth for resume data normalization
- **Input:** JSON Resume format (with custom_fields extension)
- **Output:** Flat normalized data structure for field filling
- **Features:**
  - Supports custom_fields (EEO, legal, technical_screening)
  - Reverse mapping (normalized → original path)
  - Name parsing (first/last from full name)
  - Date formatting
  - LinkedIn profile extraction
- **Used by:** All ATS strategies, autofillAPI, sidepanel

#### `src/core/formTracker.js` (547 lines)
- **Purpose:** Form tracking and monitoring system
- **Features:**
  - Field detection and registration
  - Fill status tracking (filled/skipped/failed/needs_review)
  - Automatic retry queue with configurable limits
  - Session tracking (company, ATS, timestamps)
  - History storage (last 1000 sessions)
  - Debug mode with detailed logging
  - Privacy: automatic sensitive data redaction
- **Exposed as:** `window.FormTracker`
- **Used by:** trackingIntegration, sidepanel, CLI

#### `src/core/autofillAPI.js` (680 lines)
- **Purpose:** Public API for CLI/Playwright integration
- **Features:**
  - Profile injection (bypasses UI upload)
  - Dry run mode (preview without filling)
  - Field discovery (returns all detected fields)
  - Schema validation (email, URL, date formats)
  - Custom field mappings
  - Multi-step form detection
  - Confidence threshold configuration
  - EEO/Legal/Sensitive field protection (opt-in required)
  - Idempotency (prevents duplicate fills)
  - Exportable run reports
- **Exposed as:** `window.AutofillExtension`
- **Used by:** Playwright, CLI tools, automation scripts

---

### Integration Layer

#### `src/content/trackingIntegration.js` (404 lines)
- **Purpose:** Bridge between FormTracker and content scripts
- **Features:**
  - Session initialization
  - Field registration helpers
  - Label extraction from DOM
  - Element selector generation
  - XPath generation
  - Message handlers for sidepanel
  - Retry callback support
- **Used by:** ATS strategies, content.js

---

### ATS Strategies

#### `src/content/atsStrategies/genericStrategy.js`
- **Purpose:** Base strategy class with common form-filling logic
- **Features:**
  - Field detection and matching
  - Text input filling
  - Select/dropdown filling
  - Checkbox/radio button handling
  - File upload handling
  - User-lock system (prevents overwriting manual edits)
  - Multi-step form support
  - Dynamic field detection
- **Extended by:** All 26 ATS-specific strategies

#### `src/content/atsStrategies/strategyRegistry.js`
- **Purpose:** ATS detection and strategy selection
- **Features:**
  - URL-based ATS detection
  - DOM pattern-based detection
  - Strategy registration
  - Fallback to genericStrategy
- **Detects:** 26+ ATS platforms

#### Platform-Specific Strategies (26 files)
Each strategy extends genericStrategy and provides:
- Custom field selectors
- Platform-specific field matching
- Multi-step form handling
- Special field handling (e.g., Workday's unique structure)

**Supported Platforms:**
1. Workday
2. Greenhouse
3. Lever
4. SmartRecruiters
5. ApplyToJob
6. BambooHR
7. iCIMS
8. Indeed
9. LinkedIn
10. Workable
11. Taleo
12. SAP SuccessFactors
13. Personio
14. Recruitee
15. Teamtailor
16. UltiPro/UKG
17. Paycom
18. Paychex
19. Oracle Cloud
20. Kenexa BrassRing
21. Ashby
22. ADP Workforce Now
23. Jobvite
24. Rippling
25. (Generic fallback for unlisted platforms)

---

### UI Components

#### `src/ui/sidepanel.html`
- **Purpose:** Main user interface (side panel)
- **Sections:**
  1. **Setup View** (shown when no data)
     - JSON upload (mandatory)
     - PDF upload (mandatory)
     - Complete Setup button
  
  2. **Active View** (shown when data exists)
     - Progress section with tracking stats
     - Autofill Form button
     - Manage Information button
     - Application history
  
  3. **Dashboard Modal** (4 tabs)
     - Edit Information (5 sub-sections: personal, work, education, skills, custom)
     - Update JSON (replace profile)
     - Tracking (current session, field states, failures, history)
     - Settings (delete profile)

#### `src/ui/sidepanel.js` (1200+ lines)
- **Purpose:** UI controller for side panel
- **Features:**
  - Setup flow (mandatory JSON + PDF)
  - Form-based data editing
  - Dynamic work/education entries
  - Progress tracking display
  - Session tracking UI
  - Field states visualization
  - History rendering
  - Debug mode toggle
  - Export tracking data
- **Communicates with:** background.js, content.js, FormTracker

#### `src/ui/styles.css` (700+ lines)
- **Purpose:** Complete styling for side panel
- **Features:**
  - Modern, clean design
  - CSS variables for theming
  - Responsive layouts
  - Status badges
  - Progress bars
  - Modal overlays
  - Form styles
  - Tracking visualizations
  - Toggle switches

---

## Script Loading Order

### Content Scripts (injected into job application pages)
```
1. resumeProcessor.js       (data normalization)
2. formTracker.js           (tracking engine)
3. autofillAPI.js           (public API)
4. trackingIntegration.js   (integration layer)
5. genericStrategy.js       (base strategy)
6. strategyRegistry.js      (strategy selector)
7. [26 ATS strategies]      (platform-specific)
8. content.js               (main coordinator)
```

### Side Panel Scripts
```
1. resumeProcessor.js       (data normalization)
2. formTracker.js           (tracking display)
3. sidepanel.js             (UI controller)
```

---

## Data Flow

### 1. Profile Upload Flow
```
User uploads JSON/PDF → sidepanel.js → Validation → chrome.storage.local
→ ResumeProcessor.normalize() → Normalized data stored
```

### 2. Autofill Flow
```
User clicks "Autofill Form" → sidepanel.js sends message
→ content.js receives message → StrategyRegistry detects ATS
→ Strategy.fillForm() → Uses ResumeProcessor normalized data
→ TrackingIntegration tracks each field → FormTracker stores results
→ Progress updates sent to sidepanel → UI updates in real-time
```

### 3. CLI/Playwright Flow
```
Playwright injects profile → window.AutofillExtension.injectProfile()
→ Validates schema → Stores to chrome.storage
→ page.evaluate(() => window.AutofillExtension.dryRun())
→ Returns preview of what will be filled
→ page.evaluate(() => window.AutofillExtension.fill())
→ Fills form → Returns structured result
→ page.evaluate(() => window.AutofillExtension.exportReport())
→ Returns complete report with tracking data
```

---

## Communication Channels

### 1. Runtime Messages
```
sidepanel.js ←→ content.js
- fill_form
- get_tracking_data
- retry_failed_fields
- set_debug_mode
- export_tracking_data
```

### 2. Storage (chrome.storage.local)
```
- resumeData (original JSON)
- normalizedData (processed data)
- resumeFile (PDF/DOC file)
- applicationHistory (past applications)
- formTrackerHistory (tracking sessions)
- formTrackerDebugMode (debug setting)
```

### 3. Port Communication
```
sidepanel.js ←→ background.js
- register_window (window tracking)
```

### 4. Public API (window objects)
```
window.AutofillExtension  (CLI/Playwright API)
window.FormTracker        (tracking system)
window.TrackingIntegration (integration helpers)
window.ResumeProcessor    (data normalization)
```

---

## Dependencies

### Chrome APIs Used
- `chrome.storage.local` - Data persistence
- `chrome.runtime` - Messaging
- `chrome.tabs` - Tab communication
- `chrome.sidePanel` - Side panel API
- `chrome.contextMenus` - Future feature (unused currently)
- `chrome.windows` - Window tracking

### No External Libraries
- Pure JavaScript (no npm dependencies)
- No bundler required
- No build step (except for packaging)
- Works directly in Chrome

---

## Browser Compatibility

### Minimum Requirements
- Chrome 114+ (for sidePanel API)
- Manifest V3 support
- ES6+ JavaScript support

### Tested On
- Chrome 120+
- Edge 120+ (Chromium-based)

---

## File Size Summary

### Core Modules
- `resumeProcessor.js`: ~26 KB
- `formTracker.js`: ~17 KB
- `autofillAPI.js`: ~21 KB
- `trackingIntegration.js`: ~12 KB

### UI Files
- `sidepanel.html`: ~15 KB
- `sidepanel.js`: ~37 KB
- `styles.css`: ~23 KB

### Total Extension Size
- **Unpacked:** ~850 KB
- **Packed (.zip):** ~450 KB

---

## Feature Map

### ✅ Implemented Features

| Feature | Location | Status |
|---------|----------|--------|
| JSON Resume upload | sidepanel.js | ✅ |
| PDF resume upload | sidepanel.js | ✅ |
| Mandatory setup | sidepanel.html/js | ✅ |
| Form-based editing | sidepanel.html/js | ✅ |
| 26+ ATS support | atsStrategies/ | ✅ |
| Form tracking | formTracker.js | ✅ |
| Session history | formTracker.js | ✅ |
| Retry logic | formTracker.js | ✅ |
| Debug mode | formTracker.js | ✅ |
| Public CLI API | autofillAPI.js | ✅ |
| Dry run mode | autofillAPI.js | ✅ |
| Field discovery | autofillAPI.js | ✅ |
| Schema validation | autofillAPI.js | ✅ |
| Custom mappings | autofillAPI.js | ✅ |
| EEO protection | autofillAPI.js | ✅ |
| Multi-step support | autofillAPI.js | ✅ |
| Idempotency | autofillAPI.js | ✅ |
| Export reports | autofillAPI.js | ✅ |

### 📋 Documentation

| Document | Lines | Status |
|----------|-------|--------|
| CLI_API.md | 1100+ | ✅ Complete |
| FORM_TRACKING.md | 750+ | ✅ Complete |
| API_IMPLEMENTATION.md | 600+ | ✅ Complete |
| TRACKING_IMPLEMENTATION.md | 400+ | ✅ Complete |
| README.md | 300+ | ✅ Complete |

---

## Extension Permissions Explained

### `storage`
- Store resume data locally
- Save application history
- Persist user settings

### `contextMenus`
- (Currently unused, reserved for future features)

### `sidePanel`
- Display side panel UI
- Required for Manifest V3 side panel API

### `activeTab`
- Access current tab's DOM
- Inject content scripts
- Fill form fields

### Host Permissions
- 26+ ATS platform domains
- Required for content script injection
- Minimal: Only job application sites

---

## Security & Privacy

### Data Storage
- **Local only:** All data in `chrome.storage.local`
- **No cloud sync:** No external servers
- **No telemetry:** No analytics or tracking
- **User-controlled:** User can delete all data

### Sensitive Data
- **Automatic redaction:** SSN, passwords, etc. redacted in logs
- **Opt-in required:** EEO/Legal fields require explicit permission
- **No external sharing:** Data never leaves browser

### Permissions
- **Minimal:** Only necessary permissions requested
- **Scoped:** Host permissions limited to job sites only
- **Explained:** All permissions documented

---

## Development

### Local Development
```bash
# No build step required
# Just load unpacked extension in Chrome

# To test:
1. Open chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select project directory
```

### Packaging for Distribution
```bash
# Run build script
node build/package.js

# Output: extension.zip (ready for Chrome Web Store)
```

---

## Support & Maintenance

### Key Contact Points
- **Issues:** GitHub Issues
- **Documentation:** /docs/ directory
- **Examples:** docs/api/CLI_API.md
- **Testing:** docs/testing/

### Regular Maintenance
- [ ] Update ATS strategies as platforms change
- [ ] Monitor Chrome API changes
- [ ] Update documentation
- [ ] Review and close issues
- [ ] Test on new Chrome versions

---

This structure document is current as of version 2.0.0.
