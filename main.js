import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './src/css/style.css';
import BeastValidator from './src/js/validate.js';

const basicForm = new BeastValidator('basicForm', {
    debug: true,
    autoSubmit: false,
    theme: 'bootstrap',
    onSuccess: (json) => {
        alert("✅ Basic form submitted!");
        console.log(json);
    },
});

const stepForm = new BeastValidator('stepForm', {
    debug: true,
    initSteps: true,
    autoSubmit: false,
    tooltips: 'top-center',
    helperText: false,
    onSuccess: (json) => alert("✅ Step form submitted!"),
    onStepChange: (step) => console.log('You are by step '+step),
});

const advancedForm = new BeastValidator(document.getElementById('advancedForm'), {
    debug: true,
    autoSubmit: false,
    onSuccess: (json) => alert("✅ Advanced form submitted!"),
});

advancedForm.addValidator("checkUsername", async (field) => {
    await new Promise(res => setTimeout(res, 500));
    if (['admin', 'test'].includes(field.value.toLowerCase())) {
        return "Username is already taken";
    }
    return true;
});

function resetAdvancedForm() {
    advancedForm.reset();
}

const customValidatorForm = new BeastValidator('customValidatorForm', {
    debug: true,
    autoSubmit: false,
    onSuccess: (json) => alert("✅ Custom validator passed!"),
});

customValidatorForm.addValidator('containsBeast', (field) => {
    const value = field.value.trim().toLowerCase();
    return value.includes('beast') ? true : 'The word "beast" must be included.';
});

const summaryForm = new BeastValidator('summaryForm', {
    debug: true,
    autoSubmit: false,
    errorSummaryTarget: '#summaryOutput',
    focusFirst: true,
    onSuccess: (json) => alert("✅ All fields passed!"),
});

const submitToForm = new BeastValidator('submitToForm', {
    debug: true,
    autoSubmit: false,
    submitTo: {
        url: 'https://httpbin.org/post',
        method: 'POST',
        headers: {
            'X-Custom-Header': 'beast-mode'
        },
        transform: (data) => ({
            ...data,
            sentFrom: 'beast-demo-page'
        }),
        onResponse: (data, res) => {
            console.log('✅ Response:', data);
            alert('✅ Form submitted to API!');
        },
        onError: (err) => {
            console.error('❌ API Error:', err);
            alert('❌ Failed to send form.');
        }
    }
});

const playgroundValidator = new BeastValidator('playgroundForm', {
    language: 'en',
    theme: 'beast',
    debug: true,
    autoSubmit: false,
    onSuccess: (json) => alert("✅ Playground form submitted!"),
});

document.getElementById('languageSelect').addEventListener('change', (e) => {
    playgroundValidator.setLanguage(e.target.value);
    playgroundValidator.validate();
});

document.getElementById('themeSelect').addEventListener('change', (e) => {
    playgroundValidator.reset();
    playgroundValidator.setTheme(e.target.value);
    playgroundValidator.validate();
});
