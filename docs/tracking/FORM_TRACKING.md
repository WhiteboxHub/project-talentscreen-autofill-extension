# Form Tracking System

Complete guide to TalentScreen's form tracking and monitoring capabilities.

---

## Overview

The Form Tracking System provides real-time monitoring of field detection, autofill progress, failures, and user intervention points during job application sessions.

### Key Features

- **Field Detection**: Tracks all form fields (text, dropdown, checkbox, radio, file upload)
- **Fill Tracking**: Monitors successful fills, skips, failures, and manual review needs
- **Retry Logic**: Automatically retries failed fields with configurable limits
- **Human-in-Loop**: Pauses for CAPTCHA, unknown questions, sensitive fields, low confidence
- **Session History**: Stores complete application session data locally
- **Privacy-First**: Sensitive data is redacted, all tracking is local
- **Debug Mode**: Detailed logging for troubleshooting
- **Export Support**: JSON export for Playwright/CLI automation

---

## Architecture

### Core Components

```
src/core/formTracker.js          → Core tracking logic
src/content/trackingIntegration.js → Integration with content scripts
src/ui/sidepanel.js              → UI updates and visualization
src/ui/sidepanel.html            → Tracking dashboard UI
src/ui/styles.css                → Tracking styles
```

### Data Flow

```
1. User clicks "Autofill Form"
2. TrackingIntegration.init() starts session
3. Fields detected → FormTracker.registerField()
4. Fields filled → FormTracker.markFilled()
5. Failures → FormTracker.markFailed() → Retry queue
6. Progress updates → Sent to sidepanel
7. Session complete → FormTracker.endSession()
8. History saved to chrome.storage.local
```

---

## Usage

### Starting a Session

```javascript
// In content script
if (window.TrackingIntegration) {
    TrackingIntegration.init('greenhouse', strategyInstance);
}
```

### Tracking Field Detection

```javascript
// Register a field
const fieldId = TrackingIntegration.trackField(
    inputElement,
    'First Name',
    'text',
    { confidence: 0.95 }
);
```

### Tracking Fill Status

```javascript
// Success
TrackingIntegration.trackFilled(element, 'John Doe', 'resumeData.basics.name');

// Skipped (no data available)
TrackingIntegration.trackSkipped(element, 'no_data');

// Failed
TrackingIntegration.trackFailed(element, 'Element not visible');

// Needs review
TrackingIntegration.trackNeedsReview(element, 'captcha');
```

### Ending a Session

```javascript
TrackingIntegration.endSession('completed'); // or 'failed', 'partial'
```

---

## Field States

| State | Description | Example |
|-------|-------------|---------|
| **detected** | Field found on page | Initial scan |
| **filled** | Successfully filled | Name → "John Doe" |
| **skipped** | No data available | "Military Service" → No data |
| **failed** | Fill attempt failed | Element not found after retry |
| **needs_review** | Requires manual input | CAPTCHA, unknown question |
| **retrying** | Currently being retried | After initial failure |

---

## Retry Logic

### Configuration

```javascript
FormTracker.setConfig('MAX_RETRIES', 3);        // Default: 3
FormTracker.setConfig('RETRY_DELAY', 1000);     // Default: 1000ms
```

### Retry Flow

1. Field fails → Added to retry queue
2. After initial fill completes → Process retries
3. Each retry increments `retryCount`
4. After MAX_RETRIES → Marked as permanently failed

### Manual Retry

User can manually retry failed fields from the Tracking dashboard:

```
Dashboard → Tracking Tab → Failed Fields → Retry Failed Fields button
```

---

## Human-in-Loop Support

### Pause Triggers

The system automatically pauses for:

- **CAPTCHA**: `trackNeedsReview(element, 'captcha')`
- **Unknown Question**: `trackNeedsReview(element, 'unknown_question')`
- **Sensitive Field**: `trackNeedsReview(element, 'sensitive_field')`
- **Low Confidence**: `trackNeedsReview(element, 'low_confidence')`

### Sensitive Field Detection

Keywords that trigger sensitive field detection:

```javascript
const SENSITIVE_KEYWORDS = [
    'ssn',
    'social security',
    'password',
    'credit card',
    'bank account'
];
```

Sensitive values are redacted in logs: `***REDACTED***`

---

## UI Components

### Progress Bar (Active View)

Shows real-time progress:

```
Form Progress: 35/42 fields
[████████████████░░░░] 83%

Filled: 35
Skipped: 3
Failed: 2
Needs Review: 2
```

### Tracking Dashboard (Modal)

Access via: `Manage Information → Tracking Tab`

#### Current Session Card

- ATS Platform
- Company
- Start Time
- Completion Percentage

#### Field Status List

All fields with their current state (filled, skipped, failed, needs review).

#### Failed Fields Card

List of failed fields with error messages and retry count.

#### Needs Review Card

Fields requiring manual intervention.

#### Session History

Last 10 application sessions with completion stats.

---

## Session Data Structure

```json
{
  "id": "session_1234567890_abc123",
  "atsType": "greenhouse",
  "jobUrl": "https://boards.greenhouse.io/company/jobs/123456",
  "company": "Example Corp",
  "startTime": "2026-05-14T10:30:00.000Z",
  "endTime": "2026-05-14T10:32:15.000Z",
  "status": "completed",
  "fields": {
    "total": 42,
    "filled": 35,
    "skipped": 3,
    "failed": 2,
    "needs_review": 2
  },
  "retries": {
    "total": 5,
    "successful": 3,
    "failed": 2
  },
  "submissionDetected": true,
  "completionPercentage": 83
}
```

---

## Field State Structure

```json
{
  "id": "name:firstName",
  "label": "First Name",
  "type": "text",
  "required": true,
  "status": "filled",
  "value": "John",
  "valueSource": "resumeData.basics.name",
  "timestamp": "2026-05-14T10:30:05.000Z",
  "retryCount": 0,
  "retryReasons": [],
  "confidence": 1.0,
  "isSensitive": false,
  "error": null
}
```

---

## Debug Mode

### Enable Debug Mode

**Via UI:**
```
Dashboard → Tracking Tab → Debug Mode Toggle
```

**Via Code:**
```javascript
FormTracker.setDebugMode(true);
```

### What Debug Mode Logs

- Field registration events
- Fill success/failure
- Retry attempts
- Session state changes
- Error details

### Viewing Debug Logs

```javascript
const logs = FormTracker.getDebugLogs();
console.table(logs);
```

Or export via: `Dashboard → Tracking Tab → Export Tracking Data`

---

## Export & API

### Export Tracking Data

**Via UI:**
```
Dashboard → Tracking Tab → Export Tracking Data button
```

**Via Code:**
```javascript
const data = FormTracker.exportSessionData();
// Returns: { currentSession, fieldStates, failures, needsReview, history, debugLogs }
```

### CLI / Playwright Integration

```javascript
// In Playwright script
const trackingData = await page.evaluate(() => {
    return window.FormTracker.exportSessionData();
});

console.log('Completion:', trackingData.currentSession.completionPercentage + '%');
console.log('Failed fields:', trackingData.failures.length);
```

### API Methods

```javascript
// Session management
FormTracker.startSession(atsType, jobUrl, company)
FormTracker.endSession(status)
FormTracker.getCurrentSession()

// Field tracking
FormTracker.registerField(fieldId, fieldData)
FormTracker.markFilled(fieldId, value, valueSource)
FormTracker.markSkipped(fieldId, reason)
FormTracker.markFailed(fieldId, error)
FormTracker.markNeedsReview(fieldId, reason)

// Retries
FormTracker.processRetries(fillCallback)
FormTracker.getRetryQueue()

// Data retrieval
FormTracker.getFieldStates()
FormTracker.getFailures()
FormTracker.getNeedsReview()
FormTracker.getHistory()

// Debug
FormTracker.setDebugMode(enabled)
FormTracker.getDebugLogs()

// Export
FormTracker.exportSessionData()
```

---

## Performance Considerations

### Minimal Overhead

- Field detection: O(n) where n = number of fields
- State updates: O(1) using Map data structure
- History: Limited to last 1000 sessions
- Debug logs: Limited to last 1000 entries

### Storage Impact

- Average session: ~2-5 KB
- 100 sessions: ~200-500 KB
- Stored in `chrome.storage.local` (unlimited quota for extensions)

### DOM Rescanning

Avoid excessive rescanning:

```javascript
// ❌ Bad: Scan on every mutation
observer.observe(document.body, { childList: true, subtree: true });

// ✅ Good: Scan only on step changes
if (isNewStep()) {
    TrackingIntegration.scanNewFields();
}
```

---

## Privacy & Security

### Data Redaction

- Sensitive fields: Values replaced with `***REDACTED***`
- Only field labels and metadata stored
- No PII in logs unless explicitly enabled in debug mode

### Local-Only Storage

- All data stored in `chrome.storage.local`
- No external network calls
- No telemetry or analytics

### Export Control

- User must explicitly click "Export" button
- Data exported as JSON file to user's download folder
- User controls what to share

---

## Testing

### Manual Testing

1. Load extension
2. Navigate to job application
3. Enable Debug Mode
4. Click "Autofill Form"
5. Open Dashboard → Tracking Tab
6. Verify:
   - Fields detected
   - Fill progress updates
   - Failed fields appear
   - Retry works
   - Session history saved

### Automated Testing (Playwright)

```javascript
// Test tracking data export
const trackingData = await page.evaluate(() => {
    return window.FormTracker.exportSessionData();
});

expect(trackingData.currentSession).toBeDefined();
expect(trackingData.fieldStates.length).toBeGreaterThan(0);
```

---

## Troubleshooting

### Fields Not Detected

- Enable Debug Mode
- Check console for registration logs
- Verify FormTracker is loaded: `window.FormTracker`

### Progress Not Updating

- Check if session started: `FormTracker.getCurrentSession()`
- Verify message passing: Check for `chrome.runtime.lastError`

### Retries Not Working

- Check retry queue: `FormTracker.getRetryQueue()`
- Verify MAX_RETRIES config
- Check if fields are permanently failed

### Export Not Working

- Check console for errors
- Verify trackingIntegration.js is loaded
- Test with: `FormTracker.exportSessionData()`

---

## Examples

### Complete Integration Example

```javascript
// content.js
async function autofillForm(resumeData) {
    // Start tracking
    TrackingIntegration.init('greenhouse', strategyInstance);

    // Detect all fields
    const fields = document.querySelectorAll('input, select, textarea');

    for (const field of fields) {
        // Register field
        const fieldId = TrackingIntegration.trackField(field);

        try {
            // Attempt to fill
            const value = getValueForField(field, resumeData);

            if (!value) {
                TrackingIntegration.trackSkipped(field, 'no_data');
                continue;
            }

            await fillField(field, value);
            TrackingIntegration.trackFilled(field, value, 'resumeData');

        } catch (error) {
            TrackingIntegration.trackFailed(field, error.message);
        }
    }

    // Process retries
    await TrackingIntegration.processRetries(async (element, state) => {
        const value = getValueForField(element, resumeData);
        return await fillField(element, value);
    });

    // End session
    TrackingIntegration.endSession('completed');
}
```

---

## Roadmap

### Planned Features

- [ ] Field confidence scoring (ML-based)
- [ ] Auto-detection of multi-step forms
- [ ] Visual field highlighting (show failed fields on page)
- [ ] Session comparison (compare multiple applications)
- [ ] Export to CSV/Excel
- [ ] Cloud sync (optional, user-controlled)

---

## Support

For issues or questions about form tracking:

1. Enable Debug Mode
2. Export tracking data
3. Open issue at: https://github.com/WhiteboxHub/project-talentscreen-autofill-extension/issues
4. Include exported JSON and console logs

---

## License

Part of TalentScreen - Whitebox Learning Autofill Extension
© 2024 Whitebox Learning - Sampath Velupula
