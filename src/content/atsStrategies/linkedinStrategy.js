/**
 * linkedinStrategy.js
 * Strategy for LinkedIn job application forms (Easy Apply).
 */
class LinkedinStrategy extends GenericStrategy {
    constructor() {
        super();
        this.CONFIDENCE_THRESHOLD = 70;
    }

    getEasyApplyRoot() {
        return document.querySelector(
            '.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"], .artdeco-modal[role="dialog"]'
        );
    }

    findEasyApplyButton() {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        return buttons.find((b) => {
            if (b.offsetParent === null || b.disabled) return false;
            const text = (b.innerText || b.getAttribute('aria-label') || '').toLowerCase();
            return text.includes('easy apply');
        }) || null;
    }

    handleInitialEntry() {
        if (!this.isManual) return false;
        if (this.getEasyApplyRoot()) return false;
        const btn = this.findEasyApplyButton();
        if (!btn) return false;
        btn.click();
        return true;
    }

    findProgessionButton(manualSubmit = false) {
        const root = this.getEasyApplyRoot() || document;
        const selectors = ['button:not([style*="display: none"])', '[role="button"]'];
        const buttons = Array.from(root.querySelectorAll(selectors.join(', ')))
            .filter((b) => b.offsetParent !== null && !b.disabled);

        const patterns = manualSubmit || this.isManual
            ? ['submit application', 'submit', 'review', 'next', 'continue']
            : ['next', 'continue', 'review'];

        return buttons.find((b) => {
            const text = (b.innerText || b.getAttribute('aria-label') || '').toLowerCase().trim();
            if (text.includes('cancel') || text.includes('back') || text.includes('discard')) return false;
            return patterns.some((p) => text.includes(p));
        }) || null;
    }

    async execute(normalizedData, resumeFile = null) {
        if (this.isManual && !this.getEasyApplyRoot()) {
            const btn = this.findEasyApplyButton();
            if (btn) {
                btn.click();
                await this.sleep(2200);
            }
        }
        const origEntry = this.handleInitialEntry;
        this.handleInitialEntry = () => false;
        const result = await super.execute(normalizedData, resumeFile);
        this.handleInitialEntry = origEntry;
        return result;
    }

    async attemptManualSubmitFlow() {
        if (!this.isManual) return;
        if (!this.getEasyApplyRoot()) {
            const btn = this.findEasyApplyButton();
            if (btn) {
                btn.click();
                await this.sleep(2200);
            }
        }
        await super.attemptManualSubmitFlow();
    }
}

if (typeof ATSStrategyRegistry !== 'undefined') {
    ATSStrategyRegistry.register(
        (url) => url.includes('linkedin.com/jobs'),
        LinkedinStrategy
    );
}
