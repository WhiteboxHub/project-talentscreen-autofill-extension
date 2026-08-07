/**
 * leverStrategy.js
 * Strategy for Lever application forms.
 */
class LeverStrategy extends GenericStrategy {
    constructor() {
        super();
        this.CONFIDENCE_THRESHOLD = 65; // Slightly lower threshold for Lever
    }

    async execute(normalizedData, resumeFile = null) {
        await super.execute(normalizedData, resumeFile);
    }

    findValueForInput(input, normalizedData) {
        let match = this.findLeverSpecificMatch(input, normalizedData);
        if (match && match.value !== undefined && match.value !== null && match.value !== '') return match;
        return super.findValueForInput(input, normalizedData);
    }

    extractFeatures(input) {
        const features = super.extractFeatures(input);
        const question = this.getLeverQuestionText(input);
        if (!question) return features;

        const optionOnly = input.type === 'radio' || input.type === 'checkbox';
        if (optionOnly || !features.label_text || features.label_text.length < question.length) {
            features.label_text = question.toLowerCase();
        }
        features.nearby_text = `${question} ${features.nearby_text}`.toLowerCase();
        features.normalized_combined = ResumeProcessor.normalizeText(
            `${features.name_attr} ${features.id_attr} ${question} ${features.aria_label}`
        );
        return features;
    }

    getLeverQuestionText(input) {
        const container = input.closest('.application-question, fieldset, [role="group"]') ||
            input.closest('.application-field, .application-answer');
        if (!container) return '';

        const candidates = container.querySelectorAll(
            'legend, .application-label, .question-label, [class*="question-label"], [class*="question-title"], label'
        );
        for (const candidate of candidates) {
            if ((input.type === 'radio' || input.type === 'checkbox') &&
                (candidate === input.parentElement || candidate.contains(input))) continue;
            const text = (candidate.innerText || candidate.textContent || '').replace(/\s+/g, ' ').trim();
            if (text && text.length <= 500) return text;
        }

        const text = (container.innerText || '').replace(/\s+/g, ' ').trim();
        return text.length <= 500 ? text : '';
    }

    findLeverSpecificMatch(input, data) {
        const features = this.extractFeatures(input);
        const nameAttr = (input.name || "").toLowerCase();
        const labelTxt = features.label_text.toLowerCase();
        const placeholder = features.placeholder.toLowerCase();

        const identity = data?.identity || {};
        const contact = data?.contact || {};
        const employment = data?.employment || {};
        const legal = data?.custom_fields?.legal || {};

        if (labelTxt.includes('currently reside') || labelTxt.includes('currently located')) {
            return {
                value: this.isCandidateInUS(data) ? 'Yes' : 'No',
                confidence: 98,
                fieldKey: 'contact.country'
            };
        }

        if (labelTxt.includes('us citizen') && labelTxt.includes('permanent resident') &&
            (labelTxt.includes('opt') || labelTxt.includes('sponsorship'))) {
            const sponsorshipRequired = this.normalizeYesNoDecline(identity.sponsorship_required);
            const visaStatus = String(legal.visa_status || '').toLowerCase();
            let value = '';
            if (sponsorshipRequired === 'yes') value = 'Require Sponsorship';
            else if (visaStatus.includes('citizen')) value = 'US Citizen';
            else if (visaStatus.includes('permanent') || visaStatus.includes('green card')) value = 'Permanent Resident';
            else if (visaStatus.includes('opt')) value = 'OPT';
            if (!value) return null;
            return { value, confidence: 98, fieldKey: 'custom_fields.legal.visa_status' };
        }

        // 1. Basic Identity & Contact
        if (nameAttr === 'name' || labelTxt === 'full name') return { value: identity.full_name, confidence: 95 };
        if (nameAttr === 'email' || labelTxt === 'email') return { value: contact.email, confidence: 95 };
        if (nameAttr === 'phone' || labelTxt === 'phone') return { value: contact.phone, confidence: 95 };
        if (nameAttr === 'org' || labelTxt === 'current company') return { value: employment.current_company, confidence: 90 };

        // 2. Location
        if (nameAttr === 'location' || labelTxt.includes('current location') || placeholder.includes('city')) {
            const loc = contact.city && contact.state ? `${contact.city}, ${contact.state}` : (contact.city || contact.address || "");
            return { value: loc, confidence: 90, fieldKey: 'contact.city' };
        }

        // 3. URLs (LinkedIn, GitHub, Portfolio)
        // Lever uses names like: urls[LinkedIn], urls[GitHub], urls[Portfolio]
        if (nameAttr.includes('url') || labelTxt.includes('linkedin') || labelTxt.includes('github') || labelTxt.includes('portfolio') || labelTxt.includes('website')) {
            if (nameAttr.includes('linkedin') || labelTxt.includes('linkedin'))
                return { value: contact.linkedin, confidence: 95, fieldKey: 'contact.linkedin' };
            if (nameAttr.includes('github') || labelTxt.includes('github'))
                return { value: contact.github, confidence: 95, fieldKey: 'contact.github' };
            if (nameAttr.includes('portfolio') || labelTxt.includes('portfolio') || labelTxt.includes('website'))
                return { value: contact.portfolio, confidence: 95, fieldKey: 'contact.portfolio' };
        }

        // 4. Demographics (Gender, Race)
        // These are often radio buttons or selects. 
        if (labelTxt.includes("gender") || nameAttr.includes("gender")) {
            return { value: identity.gender, confidence: 90, fieldKey: "identity.gender" };
        }
        if (labelTxt.includes("race") || labelTxt.includes("ethnicity") || nameAttr.includes("race") || nameAttr.includes("ethnicity")) {
            return { value: identity.ethnicity, confidence: 90, fieldKey: "identity.ethnicity" };
        }

        return null;
    }
}

// Register with Strategy Registry if available
if (typeof ATSStrategyRegistry !== 'undefined') {
    ATSStrategyRegistry.register(
        (url) => url.includes('lever.co'),
        LeverStrategy
    );
}
