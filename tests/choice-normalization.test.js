const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const ResumeProcessor = require('../src/core/resumeProcessor.js');

function loadStrategies() {
    const context = vm.createContext({
        console,
        Event: class Event { constructor(type) { this.type = type; } },
        ResumeProcessor,
        window: {}
    });
    const read = relativePath => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
    vm.runInContext(read('src/content/atsStrategies/genericStrategy.js'), context);
    context.GenericStrategy = context.window.GenericStrategy;
    vm.runInContext(read('src/content/atsStrategies/leverStrategy.js'), context);
    return {
        GenericStrategy: vm.runInContext('GenericStrategy', context),
        LeverStrategy: vm.runInContext('LeverStrategy', context)
    };
}

test('resume normalization preserves explicit false and leaves missing legal answers unknown', () => {
    const explicit = ResumeProcessor.normalize({
        basics: { name: 'Test Candidate' },
        custom_fields: { legal: {
            work_auth_us: false,
            sponsorship_required_now: false,
            sponsorship_required_future: false
        } }
    });
    assert.equal(explicit.identity.authorized_to_work, 'No');
    assert.equal(explicit.identity.sponsorship_required, false);

    const unknown = ResumeProcessor.normalize({ basics: { name: 'Test Candidate' } });
    assert.equal(unknown.identity.authorized_to_work, '');
    assert.equal(unknown.identity.sponsorship_required, '');
    assert.equal(unknown.custom_fields.legal.visa_status, '');
});

test('generic strategy treats false as No for a non-Lever radio group', () => {
    const { GenericStrategy } = loadStrategies();
    const strategy = new GenericStrategy();
    strategy.findValueForInput = () => ({ value: false, fieldKey: 'identity.sponsorship_required' });
    strategy.getLabelText = () => 'No';
    const input = {
        type: 'radio',
        checked: false,
        dataset: {},
        click() { this.checked = true; },
        dispatchEvent() {}
    };

    strategy.handleRadioCheckbox(input, {});

    assert.equal(strategy.normalizeYesNoDecline(false), 'no');
    assert.equal(strategy.normalizeYesNoDecline(null), '');
    assert.equal(input.checked, true);
    assert.equal(input.dataset.afStatus, 'filled');
});

test('Lever combined citizenship choice requires an explicit visa or sponsorship answer', () => {
    const { LeverStrategy } = loadStrategies();
    const strategy = new LeverStrategy();
    strategy.extractFeatures = () => ({
        label_text: 'Are you a US citizen, permanent resident, on OPT, or do you require sponsorship?',
        placeholder: ''
    });
    const input = { name: '' };

    assert.equal(strategy.findLeverSpecificMatch(input, {
        identity: { sponsorship_required: false },
        custom_fields: { legal: { visa_status: '' } }
    }), null);
    assert.equal(strategy.findLeverSpecificMatch(input, {
        identity: { sponsorship_required: true },
        custom_fields: { legal: { visa_status: '' } }
    }).value, 'Require Sponsorship');
    assert.equal(strategy.findLeverSpecificMatch(input, {
        identity: { sponsorship_required: false },
        custom_fields: { legal: { visa_status: 'US Citizen' } }
    }).value, 'US Citizen');
});
