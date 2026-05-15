# Changelog

## [2.0.0] - 2026-05-14

### 🎉 Major Refactor - Production Ready

#### ✨ Added
- **Custom Fields Support**: Extended JSON Resume with `custom_fields` for EEO, legal, technical screening
- **Setup-First UI**: New onboarding flow with clear setup screen before main features
- **Comprehensive Error Handling**: Try-catch blocks on all storage, file operations, and messaging
- **Modal-Based Data Management**: Clean modal interface for editing resume JSON
- **Enhanced Validation**: Pre-flight checks with helpful error messages
- **Quick Actions**: Fast update buttons for JSON and PDF files
- **Compact History View**: Streamlined application tracking with relative timestamps
- **File Size Limits**: 10MB maximum for PDF uploads to prevent crashes
- **Better Status Messages**: Color-coded, auto-dismissing notifications

#### 🔧 Changed
- **Branding**: Updated to "TalentScreen - Whitebox Learning Autofill"
- **UI Redesign**: Removed tabs, simplified to setup → active flow
- **ResumeProcessor**: Single source of truth in `src/core/` (removed 3 duplicates)
- **Sample JSON**: Updated to link to GitHub template with full example
- **Manifest v3**: Added homepage_url and proper service worker configuration
- **Package.json**: Removed Puppeteer dependency (unused), added proper metadata

#### 🗑️ Removed
- Code duplication (resumeProcessor.js in 4 locations → 1)
- Unused files: `package.ps1`, `zip_extension.py`, `sample_resume.json` (moved to docs/)
- Puppeteer dependency (200MB+ unused binary)
- Old `shared/` directory structure
- Tab-based navigation (simplified to modal)

#### 🐛 Fixed
- **CRITICAL**: Eliminated resumeProcessor.js duplication (1,674 lines of duplicate code)
- **CRITICAL**: Added comprehensive error handling throughout
- **HIGH**: Manifest now uses single core resumeProcessor
- **MEDIUM**: Storage errors now display helpful messages to user
- **MEDIUM**: File parsing errors caught and logged properly

#### 📚 Documentation
- Comprehensive README with:
  - Quick start guide
  - Architecture documentation
  - Development workflow
  - Build instructions
  - Contribution guidelines
  - Troubleshooting section
- New sample resume in `docs/` with custom_fields examples
- Build script with clear output

#### 🏗️ Architecture Improvements
- Modular file structure: `src/core/`, `src/background/`, `src/content/`, `src/ui/`
- Single resumeProcessor eliminates version skew
- Error boundaries prevent silent failures
- Proper logging with `[Component]` prefixes

### Migration Guide (v1.6 → v2.0)

**Data Compatibility**: Existing user data will work seamlessly. No migration needed.

**New Features to Try**:
1. Use custom_fields in your JSON for better EEO/legal question handling
2. Try the new "Manage Information" modal
3. Check out the compact history view

**Breaking Changes**: None for end users

---

## [1.6] - Previous Release

- Initial multi-ATS support
- Basic JSON Resume handling
- Tab-based UI
- Manual autofill trigger
