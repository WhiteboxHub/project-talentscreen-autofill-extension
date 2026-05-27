/**
 * smartrecruitersStrategy.js
 * Strategy for SmartRecruiters application forms (React SPA with nested Shadow DOM)
 *
 * SmartRecruiters uses deeply nested web components:
 *   oc-app-root > #shadow-root > oc-oneclick-form-root > #shadow-root >
 *   ... > spl-input > #shadow-root > input
 *
 * We must recursively pierce all shadow roots to find real <input> elements.
 */
class SmartRecruitersStrategy extends GenericStrategy {
    constructor() {
        super();
        this.CONFIDENCE_THRESHOLD = 30;

        this.config = {
            confidenceThreshold: 30,
            maxRetries: 3,
            retryDelay: 150,
            formStabilizationWait: 8000,
            formStabilizationCheckInterval: 300,
            minFieldsThreshold: 2,
            mutationObserverTimeout: 30000,
            secondPassDelay: 2000,
            applyButtonTimeout: 12000,
            debug: true  // Always log for SmartRecruiters to aid debugging
        };

        this.filledFields = new Set();
    }

    isDebugMode() {
        return true;
    }

    log(...args) {
        console.log('[SmartRecruiters]', ...args);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEEP SHADOW DOM TRAVERSAL
    // SmartRecruiters nests components like:
    //   oc-app-root → oc-oneclick-form-root → spl-input → <input>
    // We must pierce every shadow root recursively.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Recursively collect all real input-like elements from document and ALL nested shadow roots.
     * This is the single source of truth for field discovery.
     */
    _deepQueryAll(root, selectors) {
        const results = [];
        const selector = selectors.join(',');

        // Query the current root
        try {
            results.push(...Array.from(root.querySelectorAll(selector)));
        } catch (e) { /* ignore */ }

        // Walk all children and recurse into shadow roots
        const children = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
        for (const el of children) {
            if (el.shadowRoot) {
                results.push(...this._deepQueryAll(el.shadowRoot, selectors));
            }
        }

        return results;
    }

    /**
     * Detect all form fields using deep Shadow DOM traversal.
     */
    detectFields() {
        const selectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[type="tel"]',
            'input[type="url"]',
            'input[type="number"]',
            'input[type="date"]',
            'input[type="file"]',
            'input:not([type])',
            'textarea',
            'select',
            'input[type="radio"]',
            'input[type="checkbox"]',
            '[role="combobox"]',
            '[role="textbox"]',
            '[contenteditable="true"]'
        ];

        let fields = this._deepQueryAll(document, selectors);

        // Deduplicate
        fields = [...new Set(fields)];

        // Filter out truly unusable fields
        fields = fields.filter(field => {
            // Always allow file inputs (even hidden ones) for resume upload
            if (field.type === 'file') return true;
            // Skip type=hidden
            if (field.type === 'hidden') return false;
            // Skip visually hidden non-file fields (offsetParent null = not visible)
            // but allow radio/checkbox which are often styled custom
            if (field.offsetParent === null && field.type !== 'radio' && field.type !== 'checkbox') return false;
            // Skip already-filled text fields
            if (field.type !== 'radio' && field.type !== 'checkbox') {
                if (field.value && field.value.trim() !== '') return false;
            }
            return true;
        });

        this.log(`detectFields: found ${fields.length} fields (after deep shadow traversal)`);
        return fields;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LABEL / FEATURE EXTRACTION
    // Because fields live in shadow roots, standard label association doesn't
    // work. We climb UP the shadow DOM host chain to find context text.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Walk UP through composed tree (crossing shadow boundaries via host) to
     * find a text label that describes this field.
     */
    _getHostChainText(element) {
        const texts = [];
        let node = element;

        for (let depth = 0; depth < 10 && node; depth++) {
            // Collect direct attributes on this node
            const attrs = ['aria-label', 'placeholder', 'name', 'id', 'data-testid',
                           'data-test', 'autocomplete', 'title', 'label', 'data-label',
                           'aria-labelledby', 'data-fieldname', 'data-qa'];
            for (const attr of attrs) {
                const val = node.getAttribute ? node.getAttribute(attr) : null;
                if (val && val.length < 200) texts.push(val);
            }

            // Collect text from aria-labelledby target
            const labelledBy = node.getAttribute ? node.getAttribute('aria-labelledby') : null;
            if (labelledBy) {
                // Try in the same root and in document
                const roots = [node.getRootNode(), document];
                for (const r of roots) {
                    try {
                        const target = r.getElementById ? r.getElementById(labelledBy) : null;
                        if (target) texts.push(target.innerText || target.textContent || '');
                    } catch (e) { /* ignore */ }
                }
            }

            // Look for a <label> sibling or ancestor in this root
            const thisRoot = node.getRootNode ? node.getRootNode() : document;
            if (node.id) {
                try {
                    const lbl = thisRoot.querySelector ? thisRoot.querySelector(`label[for="${node.id}"]`) : null;
                    if (lbl) texts.push(lbl.textContent || '');
                } catch (e) { /* ignore */ }
            }
            const closestLabel = node.closest ? node.closest('label') : null;
            if (closestLabel) texts.push(closestLabel.textContent || '');

            // Grab slot/parent text (up to 300 chars)
            const parentText = node.parentElement ? (node.parentElement.textContent || '').substring(0, 300) : '';
            if (parentText.trim()) texts.push(parentText);

            // Cross shadow boundary: move to the shadow host
            const root = node.getRootNode ? node.getRootNode() : null;
            if (root && root !== document && root.host) {
                node = root.host;
            } else {
                // Move to parent element within the same tree
                node = node.parentElement;
            }
        }

        return texts.join(' ').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    extractFeatures(field) {
        return this._getHostChainText(field);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD MATCHING
    // ─────────────────────────────────────────────────────────────────────────

    findBestMatch(field, data) {
        const text = this.extractFeatures(field);
        const fieldType = field.type?.toLowerCase() || 'text';

        this.log(`Matching field type="${fieldType}" text="${text.substring(0, 120)}"`);

        // First name
        if ((text.includes('first') && text.includes('name')) ||
            text.includes('firstname') || text.includes('given name') || text.includes('givenname')) {
            return { value: data.identity?.first_name, confidence: 100, key: 'first_name' };
        }

        // Last name
        if ((text.includes('last') && text.includes('name')) ||
            text.includes('lastname') || text.includes('surname') || text.includes('family name')) {
            return { value: data.identity?.last_name, confidence: 100, key: 'last_name' };
        }

        // Full name (only if no first/last signals)
        if (text.includes('full name') ||
            (text.includes('name') && !text.includes('first') && !text.includes('last') &&
             !text.includes('company') && !text.includes('user'))) {
            const fullName = `${data.identity?.first_name || ''} ${data.identity?.last_name || ''}`.trim();
            if (fullName) return { value: fullName, confidence: 85, key: 'full_name' };
        }

        // Email
        if (text.includes('email') || text.includes('e-mail') || fieldType === 'email') {
            return { value: data.contact?.email, confidence: 100, key: 'email' };
        }

        // Phone — very broad matching since SR uses type="tel" but also plain text labels
        if (fieldType === 'tel' ||
            text.includes('phone') || text.includes('mobile') ||
            text.includes('telephone') || text.includes('cell') ||
            text.includes('contact number') || text.includes('handset') ||
            text.includes('phone number')) {
            return { value: data.contact?.phone, confidence: 100, key: 'phone' };
        }

        // LinkedIn — check before generic URL/website
        if (text.includes('linkedin')) {
            const linkedinVal = data.contact?.linkedin || data.contact?.linkedin_url || '';
            if (linkedinVal) return { value: linkedinVal, confidence: 98, key: 'linkedin' };
        }

        // City
        if ((text.includes('city') || text.includes('town') ||
             text.includes('municipality') || text.includes('area') ||
             (text.includes('location') && !text.includes('state') && !text.includes('country'))) &&
            !text.includes('state') && !text.includes('province')) {
            return { value: data.contact?.city, confidence: 90, key: 'city' };
        }

        // Website / Portfolio (must not match linkedin which is already handled)
        if ((text.includes('website') || text.includes('portfolio') || text.includes('personal site') ||
             text.includes('url') || text.includes('github')) && !text.includes('linkedin')) {
            const websiteVal = data.contact?.website || data.contact?.github || '';
            if (websiteVal) return { value: websiteVal, confidence: 90, key: 'website' };
        }

        // State / Province
        if (text.includes('state') || text.includes('province') || text.includes('region')) {
            return { value: data.contact?.state, confidence: 90, key: 'state' };
        }

        // Zip / Postal
        if (text.includes('zip') || text.includes('postal')) {
            return { value: data.contact?.zip, confidence: 90, key: 'zip' };
        }

        // Country
        if (text.includes('country')) {
            return { value: data.contact?.country, confidence: 90, key: 'country' };
        }

        // Address
        if (text.includes('address') && !text.includes('email')) {
            return { value: data.contact?.address, confidence: 85, key: 'address' };
        }

        // Work authorization
        if ((text.includes('authorized') || text.includes('authorization')) &&
            (text.includes('work') || text.includes('employment'))) {
            if (fieldType === 'radio' || fieldType === 'checkbox') {
                const workAuth = data.custom_fields?.legal?.work_auth_us !== undefined
                    ? data.custom_fields.legal.work_auth_us : true;
                if (text.includes('yes') || field.value === '1' || field.value?.toLowerCase() === 'yes') {
                    return { value: workAuth, confidence: 95, key: 'work_auth_yes' };
                }
            }
        }

        // Sponsorship
        if (text.includes('sponsor') &&
            (text.includes('visa') || text.includes('employment') || text.includes('require'))) {
            if (fieldType === 'radio' || fieldType === 'checkbox') {
                const needsSponsorship = data.custom_fields?.legal?.sponsorship_required_now ||
                    data.custom_fields?.legal?.sponsorship_required_future || false;
                if (text.includes('no') || field.value === '0' || field.value?.toLowerCase() === 'no') {
                    return { value: !needsSponsorship, confidence: 95, key: 'sponsorship_no' };
                }
                if (text.includes('yes') || field.value === '1' || field.value?.toLowerCase() === 'yes') {
                    return { value: needsSponsorship, confidence: 95, key: 'sponsorship_yes' };
                }
            }
        }

        // Cover letter / Why interested
        if (text.includes('cover letter') || text.includes('message to') ||
            text.includes('why are you') || text.includes('why interested')) {
            const answer = data.custom_fields?.application_logistics?.screening_answers?.why_interested ||
                data.summary?.text || '';
            return { value: answer, confidence: 70, key: 'cover_letter' };
        }

        // Why good fit
        if (text.includes('good fit') || text.includes('qualified') ||
            text.includes('qualifications') || text.includes('why you')) {
            const answer = data.custom_fields?.application_logistics?.screening_answers?.why_good_fit ||
                data.summary?.professional_statement || '';
            return { value: answer, confidence: 70, key: 'why_good_fit' };
        }

        // Relocation
        if (text.includes('relocate') || text.includes('relocation')) {
            if (fieldType === 'radio' || fieldType === 'checkbox') {
                const willingToRelocate = data.custom_fields?.application_logistics?.willing_to_relocate === 'yes';
                if (text.includes('yes') || field.value === '1' || field.value?.toLowerCase() === 'yes') {
                    return { value: willingToRelocate, confidence: 80, key: 'relocate_yes' };
                }
                if (text.includes('no') || field.value === '0' || field.value?.toLowerCase() === 'no') {
                    return { value: !willingToRelocate, confidence: 80, key: 'relocate_no' };
                }
            }
        }

        // Veteran status
        if ((text.includes('veteran') || text.includes('protected veteran')) &&
            (fieldType === 'select' || fieldType === 'radio')) {
            const veteranStatus = data.custom_fields?.eeo?.veteran_status || 'no';
            if (veteranStatus === 'no' && text.includes('not a protected veteran')) {
                return { value: true, confidence: 90, key: 'veteran_no' };
            }
            if (veteranStatus === 'yes' && text.includes('protected veteran')) {
                return { value: true, confidence: 90, key: 'veteran_yes' };
            }
            return { value: veteranStatus, confidence: 85, key: 'veteran_status' };
        }

        // Disability
        if (text.includes('disability') && (fieldType === 'select' || fieldType === 'radio')) {
            const disabilityStatus = data.custom_fields?.eeo?.disability_status || 'no';
            if (disabilityStatus === 'no' && (text.includes('do not have') || text.includes('not have'))) {
                return { value: true, confidence: 90, key: 'disability_no' };
            }
            if (disabilityStatus === 'yes' && text.includes('have a disability')) {
                return { value: true, confidence: 90, key: 'disability_yes' };
            }
            if (text.includes('not want to answer') || text.includes('prefer not')) {
                return { value: true, confidence: 85, key: 'disability_decline' };
            }
            return { value: disabilityStatus, confidence: 80, key: 'disability_status' };
        }

        // Gender
        if (text.includes('gender') && (fieldType === 'select' || fieldType === 'radio')) {
            const gender = data.custom_fields?.eeo?.gender || 'male';
            if (text.includes('prefer not')) return { value: true, confidence: 90, key: 'gender_decline' };
            if (gender === 'male' && text.includes('male')) return { value: true, confidence: 95, key: 'gender_male' };
            if (gender === 'female' && text.includes('female')) return { value: true, confidence: 95, key: 'gender_female' };
            return { value: gender, confidence: 85, key: 'gender' };
        }

        // Race/Ethnicity
        if ((text.includes('race') || text.includes('ethnicity')) &&
            (fieldType === 'select' || fieldType === 'radio')) {
            const ethnicity = data.custom_fields?.eeo?.ethnicity || 'asian';
            if (text.includes('prefer not')) return { value: true, confidence: 90, key: 'ethnicity_decline' };
            if (ethnicity === 'asian' && text.includes('asian')) return { value: true, confidence: 95, key: 'ethnicity_asian' };
            return { value: ethnicity, confidence: 80, key: 'ethnicity' };
        }

        return { value: null, confidence: 0, key: null };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RESUME FILE ATTACHMENT
    // SR uses a hidden <input type="file"> usually inside a shadow root.
    // We must also look for an "Upload Resume" button/label and scan all
    // shadow roots for file inputs.
    // ─────────────────────────────────────────────────────────────────────────

    async _attachResume(resumeFile) {
        this.log('Attempting to attach resume file...');

        // Build a File object from the stored data if needed
        let fileObj = resumeFile;
        if (resumeFile && !(resumeFile instanceof File) && resumeFile.data) {
            try {
                // resumeFile is { data: dataURL, name, type, size }
                const res = await fetch(resumeFile.data);
                const blob = await res.blob();
                fileObj = new File([blob], resumeFile.name || 'resume.pdf', { type: resumeFile.type || 'application/pdf' });
                this.log('Converted stored resumeFile data-URL to File object');
            } catch (e) {
                this.log('Could not convert resumeFile to File:', e);
                return false;
            }
        }

        if (!fileObj) return false;

        // Search for ALL file inputs across all shadow roots
        const fileInputs = this._deepQueryAll(document, ['input[type="file"]']);
        this.log(`Found ${fileInputs.length} file input(s) in deep shadow scan`);

        if (fileInputs.length > 0) {
            for (const input of fileInputs) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(fileObj);
                    input.files = dt.files;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    this.log('Resume attached to file input:', input);
                    return true;
                } catch (e) {
                    this.log('Error attaching to file input:', e);
                }
            }
        }

        // Fallback: look for SR upload button/label anywhere in the page
        const uploadKeywords = /upload|resume|cv|curriculum vitae|attach/i;
        const allButtons = this._deepQueryAll(document, ['button', 'a', '[role="button"]', 'label']);
        const uploadBtn = allButtons.find(el => {
            const txt = (el.innerText || el.textContent || '').trim();
            return uploadKeywords.test(txt);
        });

        if (uploadBtn) {
            this.log('Found upload button, clicking it:', uploadBtn);
            uploadBtn.click();
            await this.sleep(1000);
            // Try again after click exposes the file input
            const fileInputsRetry = this._deepQueryAll(document, ['input[type="file"]']);
            for (const input of fileInputsRetry) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(fileObj);
                    input.files = dt.files;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    this.log('Resume attached after button click');
                    return true;
                } catch (e) { /* ignore */ }
            }
        }

        this.log('Could not attach resume - no file input found');
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FIELD FILLING
    // ─────────────────────────────────────────────────────────────────────────

    async fillField(field, value, data, resumeFile) {
        const fieldId = this.getFieldIdentifier(field);

        if (this.filledFields.has(fieldId)) {
            return { success: true, skipped: true };
        }

        // File inputs are handled separately in _attachResume
        if (field.type === 'file') {
            return { success: false, skipped: true, reason: 'handled by _attachResume' };
        }

        const text = this.extractFeatures(field);
        const match = this.findBestMatch(field, data);

        if (!match.value) {
            this.log(`No match for field text="${text.substring(0, 80)}"`);
            return { success: false, skipped: true, reason: 'No match' };
        }
        if (match.confidence < this.config.confidenceThreshold) {
            this.log(`Low confidence (${match.confidence}) for field text="${text.substring(0, 80)}"`);
            return { success: false, skipped: true, reason: 'Low confidence' };
        }

        this.log(`Filling [${match.key}] "${text.substring(0, 60)}" → "${String(match.value).substring(0, 50)}"`);

        try {
            const fieldType = field.type?.toLowerCase();

            // Radio
            if (fieldType === 'radio') {
                if (match.value === true) {
                    field.click();
                    field.checked = true;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    this.filledFields.add(fieldId);
                    return { success: true, method: 'radio' };
                }
                return { success: false, skipped: true };
            }

            // Checkbox
            if (fieldType === 'checkbox') {
                if (match.value === true) {
                    field.click();
                    field.checked = true;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    this.filledFields.add(fieldId);
                    return { success: true, method: 'checkbox' };
                }
                return { success: false, skipped: true };
            }

            // Select
            if (field.tagName === 'SELECT') {
                const stringValue = String(match.value);
                const option = Array.from(field.options).find(opt =>
                    opt.text.toLowerCase().includes(stringValue.toLowerCase()) ||
                    opt.value.toLowerCase().includes(stringValue.toLowerCase())
                );
                if (option) {
                    field.value = option.value;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    this.filledFields.add(fieldId);
                    return { success: true, method: 'select' };
                }
                return { success: false, reason: 'Option not found' };
            }

            // Combobox
            if (field.getAttribute('role') === 'combobox' && typeof ComboboxHandler !== 'undefined') {
                const result = await ComboboxHandler.fillCombobox(field, match.value, { debug: this.config.debug });
                if (result.success) this.filledFields.add(fieldId);
                return result;
            }

            // Contenteditable
            if (field.getAttribute('contenteditable') === 'true') {
                field.focus();
                field.textContent = String(match.value);
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('blur', { bubbles: true }));
                this.filledFields.add(fieldId);
                return { success: true, method: 'contenteditable' };
            }

            // Regular text / email / tel / url inputs
            // Try React helper first (handles React synthetic events)
            if (typeof ReactInputHelper !== 'undefined') {
                const result = await ReactInputHelper.fillWithVerification(field, match.value, {
                    maxRetries: this.config.maxRetries,
                    retryDelay: this.config.retryDelay
                });
                if (result.success) {
                    this.filledFields.add(fieldId);
                    return result;
                }
                this.log('ReactInputHelper failed, trying native input events');
            }

            // Native approach — works for web components that listen to DOM events
            field.focus();
            // Use nativeInputValueSetter trick for React-controlled inputs
            try {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                )?.set;
                const nativeTextAreaSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                )?.set;
                const setter = field.tagName === 'TEXTAREA' ? nativeTextAreaSetter : nativeInputValueSetter;
                if (setter) {
                    setter.call(field, match.value);
                } else {
                    field.value = match.value;
                }
            } catch (e) {
                field.value = match.value;
            }
            field.dispatchEvent(new Event('input',  { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('blur',   { bubbles: true }));
            this.filledFields.add(fieldId);
            return { success: true, method: 'native' };

        } catch (error) {
            this.log('Error filling field:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FORM STABILIZATION
    // ─────────────────────────────────────────────────────────────────────────

    async waitForFormStabilization() {
        this.log('Waiting for form stabilization...');
        const startTime = Date.now();
        let lastFieldCount = 0;
        let stableCount = 0;
        const requiredStableChecks = 3;

        while (Date.now() - startTime < this.config.formStabilizationWait) {
            const fields = this.detectFields();
            const currentCount = fields.length;
            this.log(`Field count: ${currentCount} (last: ${lastFieldCount})`);

            if (currentCount === lastFieldCount && currentCount >= this.config.minFieldsThreshold) {
                stableCount++;
                if (stableCount >= requiredStableChecks) {
                    this.log(`Form stabilized with ${currentCount} fields`);
                    return true;
                }
            } else {
                stableCount = 0;
            }
            lastFieldCount = currentCount;
            await this.sleep(this.config.formStabilizationCheckInterval);
        }
        this.log(`Form stabilization timeout. Found ${lastFieldCount} fields`);
        return lastFieldCount >= this.config.minFieldsThreshold;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPEN APPLICATION FORM
    // ─────────────────────────────────────────────────────────────────────────

    async openApplicationForm() {
        const existingFields = this.detectFields();
        if (existingFields.length > 0) {
            this.log('Form fields already present');
            return;
        }

        // Search for Apply button across all shadow roots too
        const allButtons = this._deepQueryAll(document, ['button', 'a', '[role="button"]']);
        const applyEl = allButtons.find(el => {
            const txt = (el.innerText || el.textContent || '').toLowerCase();
            const href = el.getAttribute ? (el.getAttribute('href') || '') : '';
            if (txt.includes('indeed') || href.includes('indeed.com')) return false;
            return txt.includes('apply') || txt.includes('easy apply') || txt.includes('continue');
        });

        if (applyEl) {
            this.log('Clicking apply button:', applyEl);
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            applyEl.dispatchEvent(clickEvent);
            if (!clickEvent.defaultPrevented) applyEl.click();
            await this.sleep(this.config.applyButtonTimeout);
        } else {
            this.log('No apply button found; proceeding');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTOFILL PASS
    // ─────────────────────────────────────────────────────────────────────────

    async autofillPass(data, resumeFile, passNumber) {
        this.log(`--- Starting autofill pass ${passNumber} ---`);
        const fields = this.detectFields();
        this.log(`Pass ${passNumber}: found ${fields.length} fields`);

        let filled = 0, failed = 0, skipped = 0;

        for (const field of fields) {
            const result = await this.fillField(field, null, data, resumeFile);
            if (result.success && !result.skipped) filled++;
            else if (result.skipped) skipped++;
            else failed++;
            await this.sleep(50);
        }

        this.log(`Pass ${passNumber} done: ${filled} filled, ${failed} failed, ${skipped} skipped`);
        return { filled, failed, skipped, total: fields.length };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MUTATION OBSERVER
    // ─────────────────────────────────────────────────────────────────────────

    startMutationObserver(data, resumeFile) {
        if (typeof MutationManager === 'undefined') return;

        MutationManager.start(
            async (newFields) => {
                for (const field of newFields) {
                    await this.fillField(field, null, data, resumeFile);
                    await this.sleep(50);
                }
            },
            { timeout: this.config.mutationObserverTimeout, debounceDelay: 500, debug: this.config.debug }
        );
    }

    getFieldIdentifier(field) {
        return field.id || field.name || field.getAttribute('data-testid') || field.outerHTML.substring(0, 100);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXECUTE
    // ─────────────────────────────────────────────────────────────────────────

    async execute(normalizedData, resumeFile = null) {
        this.log('=== SmartRecruiters strategy START ===');
        this.filledFields.clear();

        try {
            // Wait for form or try to open it
            let formReady = await this.waitForFormStabilization();
            if (!formReady) {
                this.log('Form not ready, attempting to open application form...');
                await this.openApplicationForm();
                formReady = await this.waitForFormStabilization();
            }

            // Attach resume FIRST (before filling text fields)
            if (resumeFile) {
                await this._attachResume(resumeFile);
            }

            // Pass 1
            const firstPass = await this.autofillPass(normalizedData, resumeFile, 1);

            // Wait for dynamic fields
            await this.sleep(this.config.secondPassDelay);

            // Pass 2 (catches lazily rendered fields)
            const secondPass = await this.autofillPass(normalizedData, resumeFile, 2);

            // Watch for fields that appear later
            this.startMutationObserver(normalizedData, resumeFile);

            const totalFilled = firstPass.filled + secondPass.filled;
            const totalAttempted = firstPass.total + secondPass.total;
            this.log(`=== Strategy complete: ${totalFilled} filled out of ${totalAttempted} ===`);

            return { filled: totalFilled, attempted: totalAttempted, success: totalFilled > 0 };

        } catch (error) {
            console.error('[SmartRecruiters] Strategy error:', error);
            throw error;
        }
    }
}

// Register with Strategy Registry
if (typeof ATSStrategyRegistry !== 'undefined') {
    ATSStrategyRegistry.register(
        (url, doc) => url.includes('smartrecruiters.com'),
        SmartRecruitersStrategy
    );
}
