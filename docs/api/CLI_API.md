# CLI & Playwright Integration API

Complete guide to using TalentScreen extension programmatically via CLI, Playwright, Puppeteer, or any automation tool.

---

## Quick Start

### Playwright Example

```javascript
const { chromium } = require('playwright');

(async () => {
    // Launch browser with extension
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=/path/to/extension`,
            `--load-extension=/path/to/extension`
        ]
    });

    const page = await context.newPage();
    await page.goto('https://boards.greenhouse.io/company/jobs/123456');

    // Inject resume profile
    const profile = require('./resume.json');
    const result = await page.evaluate((prof) => {
        return window.AutofillExtension.injectProfile(prof);
    }, profile);

    console.log('Profile injected:', result);

    // Dry run to see what would be filled
    const dryRun = await page.evaluate((prof) => {
        return window.AutofillExtension.dryRun(prof, {
            confidenceThreshold: 0.7,
            fillEEO: false,
            fillLegal: false
        });
    }, profile);

    console.log('Dry run results:', dryRun);

    // Fill the form
    const fillResult = await page.evaluate((prof) => {
        return window.AutofillExtension.fill(prof, {
            confidenceThreshold: 0.7,
            fillEEO: false,
            fillLegal: false
        });
    }, profile);

    console.log('Fill results:', fillResult);
    console.log(`Filled ${fillResult.fields.filled.length}/${fillResult.fields.total} fields`);

    // Export report
    const report = await page.evaluate(() => {
        return window.AutofillExtension.exportReport();
    });

    require('fs').writeFileSync('report.json', JSON.stringify(report, null, 2));

    await context.close();
})();
```

---

## Public API Reference

### `window.AutofillExtension`

All methods are available on the global `window.AutofillExtension` object.

---

## Core Methods

### `getPageContext()`

Returns information about the current page.

**Returns:**
```javascript
{
    url: string,
    title: string,
    atsType: string,           // 'greenhouse', 'lever', 'workday', etc.
    company: string,
    jobTitle: string,
    formSections: Array<{
        index: number,
        title: string,
        fieldCount: number
    }>,
    hasMultipleSteps: boolean,
    hasCAPTCHA: boolean,
    timestamp: string           // ISO 8601
}
```

**Example:**
```javascript
const context = await page.evaluate(() => {
    return window.AutofillExtension.getPageContext();
});

console.log(`ATS: ${context.atsType}`);
console.log(`Company: ${context.company}`);
console.log(`Multi-step: ${context.hasMultipleSteps}`);
```

---

### `getFields()`

Returns all detected form fields with metadata.

**Returns:**
```javascript
Array<{
    id: string,                 // Unique field identifier
    index: number,
    label: string,              // Field label
    type: string,               // 'text', 'email', 'select', etc.
    name: string,
    required: boolean,
    value: string,              // Current value
    placeholder: string,
    options: Array<{            // For select fields
        value: string,
        text: string
    }> | null,
    confidence: number,         // 0-1 match confidence
    matchedPath: string | null, // Data path if matched
    category: string,           // 'personal', 'work', 'education', 'eeo', 'legal', 'other'
    isSensitive: boolean,
    isEEO: boolean,
    isLegal: boolean,
    selector: string,           // CSS selector
    visible: boolean,
    disabled: boolean,
    readonly: boolean
}>
```

**Example:**
```javascript
const fields = await page.evaluate(() => {
    return window.AutofillExtension.getFields();
});

console.log(`Total fields: ${fields.length}`);
console.log(`Required fields: ${fields.filter(f => f.required).length}`);
console.log(`EEO fields: ${fields.filter(f => f.isEEO).length}`);
```

---

### `dryRun(profile, options)`

Simulates filling without actually modifying the form.

**Parameters:**
- `profile` (object): Resume JSON (JSON Resume format)
- `options` (object, optional):
  - `confidenceThreshold` (number): 0-1, default 0.6
  - `fillEEO` (boolean): default false
  - `fillLegal` (boolean): default false
  - `fillSensitive` (boolean): default false
  - `customMappings` (object): Field label → JSON path mappings

**Returns:**
```javascript
{
    mode: 'dry_run',
    context: { /* page context */ },
    fields: {
        total: number,
        willFill: Array<{
            field: string,
            value: any,
            confidence: number,
            source: string,
            category: string
        }>,
        willSkip: Array<{
            field: string,
            reason: string,
            category: string
        }>,
        needsReview: Array<{
            field: string,
            value: any,
            confidence: number,
            reason: string,
            category: string
        }>,
        blocked: Array<{
            field: string,
            reason: string,
            category: string
        }>
    },
    warnings: Array<string>,
    errors: Array<string>
}
```

**Example:**
```javascript
const result = await page.evaluate((profile) => {
    return window.AutofillExtension.dryRun(profile, {
        confidenceThreshold: 0.8,
        fillEEO: false,
        fillLegal: true
    });
}, profile);

console.log(`Will fill: ${result.fields.willFill.length}`);
console.log(`Will skip: ${result.fields.willSkip.length}`);
console.log(`Needs review: ${result.fields.needsReview.length}`);

// Check for warnings
result.warnings.forEach(warning => console.warn(warning));
```

---

### `fill(profile, options)`

Fills the form with profile data.

**Parameters:**
- `profile` (object): Resume JSON
- `options` (object, optional): Same as `dryRun()` plus:
  - `dryRun` (boolean): If true, performs dry run instead

**Returns:**
```javascript
{
    mode: 'fill',
    context: { /* page context */ },
    fields: {
        total: number,
        filled: Array<{
            field: string,
            value: any,           // Sanitized if sensitive
            confidence: number,
            source: string,
            category: string
        }>,
        skipped: Array<{
            field: string,
            reason: string,
            category: string
        }>,
        failed: Array<{
            field: string,
            reason: string,
            category: string
        }>,
        needsReview: Array<{
            field: string,
            value: any,
            confidence: number,
            reason: string,
            category: string
        }>
    },
    completion: {
        percentage: number,       // 0-100
        filled: number,
        total: number
    },
    warnings: Array<string>,
    errors: Array<string>,
    timestamp: string
}
```

**Example:**
```javascript
const result = await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile, {
        confidenceThreshold: 0.7,
        fillEEO: false
    });
}, profile);

console.log(`Completion: ${result.completion.percentage}%`);
console.log(`Filled: ${result.fields.filled.length}`);
console.log(`Failed: ${result.fields.failed.length}`);

if (result.errors.length > 0) {
    console.error('Errors:', result.errors);
}
```

---

### `getResult()`

Returns the last fill/dry-run result.

**Returns:** Same structure as `fill()` or `dryRun()` result.

**Example:**
```javascript
const lastResult = await page.evaluate(() => {
    return window.AutofillExtension.getResult();
});
```

---

### `clearSession()`

Clears current session and filled fields tracker.

**Returns:**
```javascript
{
    success: boolean,
    message: string
}
```

**Example:**
```javascript
await page.evaluate(() => {
    return window.AutofillExtension.clearSession();
});
```

---

## Profile Management

### `injectProfile(profile)`

Injects resume profile directly, bypassing UI upload.

**Parameters:**
- `profile` (object): Resume JSON with required fields

**Returns:**
```javascript
{
    success: boolean,
    message?: string,
    schemaVersion?: string,
    error?: string,
    validationErrors?: Array<string>
}
```

**Example:**
```javascript
const result = await page.evaluate((profile) => {
    return window.AutofillExtension.injectProfile(profile);
}, profile);

if (!result.success) {
    console.error('Validation errors:', result.validationErrors);
}
```

---

### `getProfile()`

Returns currently injected profile.

**Returns:** Profile object or `null`.

---

## Configuration

### `configure(settings)`

Updates extension settings.

**Parameters:**
```javascript
{
    confidenceThreshold: number,     // 0-1, default 0.6
    fillEEO: boolean,                // default false
    fillLegal: boolean,              // default false
    fillSensitive: boolean,          // default false
    autoSubmit: boolean,             // default false
    pauseOnLowConfidence: boolean,   // default true
    pauseOnMissingData: boolean,     // default true
    pauseOnCAPTCHA: boolean          // default true
}
```

**Returns:**
```javascript
{
    success: boolean,
    settings: { /* current settings */ }
}
```

**Example:**
```javascript
await page.evaluate(() => {
    return window.AutofillExtension.configure({
        confidenceThreshold: 0.8,
        fillEEO: false,
        fillLegal: true,
        pauseOnLowConfidence: true
    });
});
```

---

### `getConfiguration()`

Returns current settings.

**Example:**
```javascript
const config = await page.evaluate(() => {
    return window.AutofillExtension.getConfiguration();
});

console.log('Confidence threshold:', config.confidenceThreshold);
console.log('Fill EEO:', config.fillEEO);
```

---

## Custom Mappings

### `setCustomMappings(mappings)`

Set custom field label → JSON path mappings.

**Parameters:**
```javascript
{
    "Field Label": "json.path.to.value",
    "Years of Python Experience": "custom_fields.technical_screening.years_python",
    "Preferred Start Date": "custom_fields.application_logistics.preferred_start"
}
```

**Returns:**
```javascript
{
    success: boolean,
    count: number              // Total mappings
}
```

**Example:**
```javascript
await page.evaluate(() => {
    return window.AutofillExtension.setCustomMappings({
        "Years of Python Experience": "custom_fields.technical_screening.years_python",
        "Willing to Relocate": "custom_fields.application_logistics.willing_to_relocate"
    });
});
```

---

### `getCustomMappings()`

Returns current custom mappings.

---

## Multi-Step Forms

### `detectMultiStep()`

Detects multi-step form structure.

**Returns:**
```javascript
{
    isMultiStep: boolean,
    currentStep: number,
    totalSteps: number | null,
    navigation: {
        next: string | null,       // CSS selector for Next button
        previous: string | null,   // CSS selector for Previous button
        submit: string | null      // CSS selector for Submit button
    }
}
```

**Example:**
```javascript
const multiStep = await page.evaluate(() => {
    return window.AutofillExtension.detectMultiStep();
});

if (multiStep.isMultiStep) {
    console.log(`Step ${multiStep.currentStep} of ${multiStep.totalSteps}`);
    
    // Fill current step
    await page.evaluate((profile) => {
        return window.AutofillExtension.fill(profile);
    }, profile);
    
    // Click Next
    if (multiStep.navigation.next) {
        await page.click(multiStep.navigation.next);
        await page.waitForTimeout(2000);
        
        // Fill next step
        await page.evaluate((profile) => {
            return window.AutofillExtension.fill(profile);
        }, profile);
    }
}
```

---

## Reporting

### `exportReport()`

Exports complete run report.

**Returns:**
```javascript
{
    version: string,
    timestamp: string,
    application: {
        company: string,
        jobTitle: string,
        url: string,
        atsType: string
    },
    results: {
        mode: string,
        fieldsTotal: number,
        fieldsFilled: number,
        fieldsSkipped: number,
        fieldsFailed: number,
        fieldsNeedingReview: number,
        completion: {
            percentage: number,
            filled: number,
            total: number
        },
        warnings: Array<string>,
        errors: Array<string>
    },
    tracking: { /* FormTracker session data */ }
}
```

**Example:**
```javascript
const report = await page.evaluate(() => {
    return window.AutofillExtension.exportReport();
});

// Save to file
require('fs').writeFileSync(
    `report-${report.application.company}-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
);
```

---

## Resume Schema

### Required Fields

```json
{
    "schema_version": "1.0",
    "basics": {
        "name": "Required",
        "email": "Required (valid format)",
        "phone": "Optional",
        "url": "Optional (valid URL)",
        "summary": "Optional",
        "location": {
            "city": "Optional",
            "region": "Optional",
            "countryCode": "Optional"
        },
        "profiles": [
            {
                "network": "LinkedIn",
                "url": "Optional (valid URL)"
            }
        ]
    },
    "work": [
        {
            "name": "Company name",
            "position": "Job title",
            "startDate": "YYYY-MM-DD (valid date)",
            "endDate": "YYYY-MM-DD (valid date) or null",
            "summary": "Optional"
        }
    ],
    "education": [
        {
            "institution": "School name",
            "studyType": "Degree",
            "area": "Field of study",
            "startDate": "YYYY-MM-DD (valid date)",
            "endDate": "YYYY-MM-DD (valid date) or null"
        }
    ],
    "skills": [
        {
            "name": "Category",
            "keywords": ["skill1", "skill2"]
        }
    ],
    "custom_fields": {
        "eeo": {
            "gender": "Optional",
            "ethnicity": "Optional",
            "veteran_status": "Optional",
            "disability_status": "Optional"
        },
        "legal": {
            "work_auth_us": true,
            "sponsorship_required_now": false,
            "sponsorship_required_future": false
        },
        "technical_screening": {
            "years_python": 5,
            "years_javascript": 3
        },
        "application_logistics": {
            "willing_to_relocate": "yes",
            "preferred_start": "2024-06-01",
            "screening_answers": {
                "why_interested": "Answer text",
                "why_good_fit": "Answer text"
            }
        }
    }
}
```

### Validation Rules

- Email: Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- URL: Must be valid URL (checked with `new URL()`)
- Dates: Must be `YYYY-MM-DD`, `YYYY-MM`, or `YYYY` format
- `basics.name` or `basics.label` is required
- `basics.email` is required

---

## Confidence Modes

### Aggressive (0.4)
- Fills fields with low confidence
- May fill incorrect fields
- Use when: Batch applying, willing to review

### Balanced (0.6) - Default
- Balanced accuracy vs coverage
- Skips uncertain matches
- Use when: Standard CLI automation

### Conservative (0.8)
- Only fills high-confidence matches
- Many fields may be skipped
- Use when: Critical applications, manual review preferred

**Example:**
```javascript
// Aggressive
await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile, {
        confidenceThreshold: 0.4
    });
}, profile);

// Conservative
await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile, {
        confidenceThreshold: 0.8
    });
}, profile);
```

---

## Privacy & Security

### EEO Fields

**Require explicit opt-in:**
```javascript
await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile, {
        fillEEO: true  // Explicit opt-in required
    });
}, profile);
```

### Legal Fields

**Require explicit opt-in:**
```javascript
await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile, {
        fillLegal: true  // Explicit opt-in required
    });
}, profile);
```

### Sensitive Fields

**SSN, passwords, credit cards, bank accounts:**
```javascript
await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile, {
        fillSensitive: false  // Always false by default
    });
}, profile);
```

### Data Redaction

Sensitive values are automatically redacted in logs:
```javascript
const result = await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile);
}, profile);

// Sensitive field values appear as:
// { field: "SSN", value: "***REDACTED***" }
```

---

## Error Handling

### Validation Errors

```javascript
const result = await page.evaluate((profile) => {
    return window.AutofillExtension.injectProfile(profile);
}, profile);

if (!result.success) {
    console.error('Validation failed:');
    result.validationErrors.forEach(err => console.error(`  - ${err}`));
}
```

### Fill Errors

```javascript
const result = await page.evaluate((profile) => {
    return window.AutofillExtension.fill(profile);
}, profile);

if (result.errors.length > 0) {
    console.error('Fill errors:');
    result.errors.forEach(err => console.error(`  - ${err}`));
}

// Individual field failures
result.fields.failed.forEach(field => {
    console.error(`Failed: ${field.field} - ${field.reason}`);
});
```

---

## Complete CLI Script Example

```javascript
#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function applyToJob(jobUrl, profilePath, options = {}) {
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${path.resolve(__dirname, '../extension')}`,
            `--load-extension=${path.resolve(__dirname, '../extension')}`
        ]
    });

    try {
        const page = await context.newPage();
        await page.goto(jobUrl, { waitUntil: 'networkidle' });

        // Inject profile
        const injectResult = await page.evaluate((prof) => {
            return window.AutofillExtension.injectProfile(prof);
        }, profile);

        if (!injectResult.success) {
            throw new Error(`Validation failed: ${injectResult.validationErrors.join(', ')}`);
        }

        console.log('✓ Profile injected');

        // Configure
        await page.evaluate((opts) => {
            return window.AutofillExtension.configure({
                confidenceThreshold: opts.confidence || 0.7,
                fillEEO: opts.fillEEO || false,
                fillLegal: opts.fillLegal || false,
                pauseOnLowConfidence: true
            });
        }, options);

        console.log('✓ Settings configured');

        // Dry run
        if (options.dryRun) {
            const dryResult = await page.evaluate((prof) => {
                return window.AutofillExtension.dryRun(prof);
            }, profile);

            console.log('\n--- DRY RUN RESULTS ---');
            console.log(`Will fill: ${dryResult.fields.willFill.length}`);
            console.log(`Will skip: ${dryResult.fields.willSkip.length}`);
            console.log(`Needs review: ${dryResult.fields.needsReview.length}`);
            console.log(`Blocked: ${dryResult.fields.blocked.length}`);

            if (options.verbose) {
                console.log('\nFields that will be filled:');
                dryResult.fields.willFill.forEach(f => {
                    console.log(`  - ${f.field} = ${f.value} (${f.confidence.toFixed(2)})`);
                });
            }

            await context.close();
            return dryResult;
        }

        // Check for multi-step
        const multiStep = await page.evaluate(() => {
            return window.AutofillExtension.detectMultiStep();
        });

        console.log(`✓ Multi-step: ${multiStep.isMultiStep}`);

        // Fill first step
        let fillResult = await page.evaluate((prof) => {
            return window.AutofillExtension.fill(prof);
        }, profile);

        console.log(`✓ Step 1: ${fillResult.completion.percentage}% complete`);
        console.log(`  Filled: ${fillResult.fields.filled.length}`);
        console.log(`  Failed: ${fillResult.fields.failed.length}`);

        // Handle multi-step
        let step = 1;
        while (multiStep.isMultiStep && multiStep.navigation.next && step < 5) {
            await page.click(multiStep.navigation.next);
            await page.waitForTimeout(2000);

            fillResult = await page.evaluate((prof) => {
                return window.AutofillExtension.fill(prof);
            }, profile);

            step++;
            console.log(`✓ Step ${step}: ${fillResult.completion.percentage}% complete`);
        }

        // Export report
        const report = await page.evaluate(() => {
            return window.AutofillExtension.exportReport();
        });

        const reportPath = `report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n✓ Report saved: ${reportPath}`);

        // Wait for user to submit (or auto-submit if enabled)
        if (options.autoSubmit) {
            // Auto-submit logic here
        } else {
            console.log('\n⏸ Paused for manual review. Press Enter to continue...');
            await page.pause();
        }

        await context.close();
        return report;

    } catch (error) {
        console.error('Error:', error.message);
        await context.close();
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const jobUrl = args[0];
    const profilePath = args[1] || './resume.json';

    if (!jobUrl) {
        console.error('Usage: node cli.js <job-url> [profile-path] [options]');
        process.exit(1);
    }

    applyToJob(jobUrl, profilePath, {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose'),
        fillEEO: args.includes('--fill-eeo'),
        fillLegal: args.includes('--fill-legal'),
        confidence: parseFloat(args.find(a => a.startsWith('--confidence='))?.split('=')[1] || '0.7')
    }).then(() => {
        console.log('✓ Done');
    }).catch(error => {
        console.error('✗ Failed:', error.message);
        process.exit(1);
    });
}

module.exports = { applyToJob };
```

**Usage:**
```bash
# Dry run
node cli.js https://boards.greenhouse.io/company/jobs/123456 --dry-run --verbose

# Fill with conservative confidence
node cli.js https://boards.greenhouse.io/company/jobs/123456 --confidence=0.8

# Fill including legal fields
node cli.js https://boards.greenhouse.io/company/jobs/123456 --fill-legal

# Fill with custom profile
node cli.js https://boards.greenhouse.io/company/jobs/123456 ./my-resume.json
```

---

## Testing

### Unit Tests (Example using Jest)

```javascript
describe('AutofillExtension API', () => {
    it('validates profile correctly', async () => {
        const result = await page.evaluate(() => {
            return window.AutofillExtension.injectProfile({
                schema_version: '1.0',
                basics: {
                    name: 'Test User',
                    email: 'test@example.com'
                }
            });
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid email', async () => {
        const result = await page.evaluate(() => {
            return window.AutofillExtension.injectProfile({
                basics: {
                    name: 'Test',
                    email: 'invalid-email'
                }
            });
        });

        expect(result.success).toBe(false);
        expect(result.validationErrors).toContain('Invalid email format: invalid-email');
    });
});
```

---

## Troubleshooting

### API not available

**Problem:** `window.AutofillExtension is undefined`

**Solution:**
1. Ensure extension is loaded
2. Wait for page load: `await page.waitForTimeout(1000)`
3. Check content script injection

### Fields not detected

**Problem:** `getFields()` returns empty array

**Solution:**
1. Wait for form to render: `await page.waitForSelector('input')`
2. Check if using shadow DOM
3. Enable debug mode and check console

### Low fill rate

**Problem:** Many fields skipped

**Solution:**
1. Run `dryRun()` to see match confidence
2. Lower confidence threshold
3. Add custom mappings for specific fields
4. Check profile data completeness

---

## Support

For CLI/API issues:

1. Run with `--verbose` flag
2. Export report with `exportReport()`
3. Check browser console for errors
4. Open issue with report JSON

---

## License

Part of TalentScreen - Whitebox Learning Autofill Extension
© 2024 Whitebox Learning - Sampath Velupula
