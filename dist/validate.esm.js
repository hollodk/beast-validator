class BeastValidator {
    constructor(form, {
        errorContainerClass = 'beast-error-msg',
        tooltipClass = 'beast-tooltip',
        focusFirst = true,
        validateOnChange = true,
        tooltips = 'none',
        helperText = true,
        shakeInput = true,
        waitForDom = true,
        setNoValidate = true,
        autoSubmit = true,
        initSteps = false,
        debug = false,
        onFail = null,
        onSuccess = null,
        onInit = null,
        onStepChange = null,
        language = 'en',
        theme = 'beast',
        submitTo = null,
        errorSummaryTarget = null,
    } = {}) {
        this.errorContainerClass = errorContainerClass;
        this.tooltipClass = tooltipClass;
        this.focusFirst = focusFirst;
        this.validateOnChange = validateOnChange;
        this.tooltips = tooltips;
        this.helperText = helperText;
        this.shakeInput = shakeInput;
        this.waitForDom = waitForDom;
        this.setNoValidate = setNoValidate;
        this.autoSubmit = autoSubmit;
        this.initSteps = initSteps;
        this.debug = debug;
        this.onFail = onFail;
        this.onSuccess = onSuccess;
        this.onInit = onInit;
        this.onStepChange = onStepChange;
        this.language = language;
        this.theme = theme;
        this.submitTo = submitTo;
        this.errorSummaryTarget = errorSummaryTarget;

        this.form = null;
        this.customValidators = {};

        this.log('[INIT] BeastValidator instantiated');

        if (this.waitForDom === true) {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize(form);
            });
        } else {
            this.initialize(form);
        }
    }

    // lifecycle methods
    initialize(form) {
        this.log('[INIT] Initializing validator');

        this.form = typeof form === 'string' ? document.getElementById(form) : form;
        if (!this.form) {
            this.log('[INIT] No form found. Initialization aborted.', 'error');
            return;
        }

        if (this.setNoValidate) {
            this.form.setAttribute('novalidate', 'true');
        }

        this.initLanguage();
        this.attachListener();

        const allFields = this.getAllFields();
        this.log(`[INIT] Found ${allFields.length} fields`);

        allFields.forEach(field => {
            if (field.name) {
                field.dataset.beastId = field.name;
            } else {
                field.dataset.beastId = this.randomString(8);
            }
        });

        if (this.errorSummaryTarget) {
            this.setErrorSummaryTarget(this.errorSummaryTarget, {
                icon: '⚠️',
                heading: 'Errors found:',
                scrollTo: true
            });
        }

        if (this.initSteps === true) {
            this.currentStep = 1;
            this.showStep(this.currentStep);
            this.log('[INIT] Step flow initialized');
        }

        if (typeof this.onInit === 'function') {
            this.log('[INIT] onInit callback triggered');
            this.onInit();
        }
    }

    initLanguage() {
        this.messages = {
            en: {
                required: 'This field is required',
                email: 'Please enter a valid email address',
                minlength: (n) => `Minimum length is ${n} characters`,
                maxlength: (n) => `Maximum length is ${n} characters`,
                minValue: (n) => `Must be at least ${n}`,
                maxValue: (n) => `Must be at most ${n}`,
                minAge: (n) => `You must be at least ${n} years old`,
                maxAge: (n) => `You must be no older than ${n} years old`,
                passwordStrength_weak: 'Password must be at least 6 characters',
                passwordStrength_medium: 'Password must be at least 8 characters and include a number',
                passwordStrength_strong: 'Password must be at least 10 characters and include uppercase, lowercase, number, and symbol',
                match: 'Values do not match',
                invalidFormat: 'Invalid format'
            },
            da: {
                required: 'Dette felt er påkrævet',
                email: 'Indtast en gyldig e-mailadresse',
                minlength: (n) => `Minimumslængde er ${n} tegn`,
                maxlength: (n) => `Maksimallængde er ${n} tegn`,
                minValue: (n) => `Skal være mindst ${n}`,
                maxValue: (n) => `Må højst være ${n}`,
                minAge: (n) => `Du skal være mindst ${n} år gammel`,
                maxAge: (n) => `Du må højst være ${n} år gammel`,
                passwordStrength_weak: 'Adgangskoden skal være mindst 6 tegn lang',
                passwordStrength_medium: 'Mindst 8 tegn og ét tal kræves',
                passwordStrength_strong: 'Mindst 10 tegn med stort, småt, tal og symbol kræves',
                match: 'Værdierne stemmer ikke overens',
                invalidFormat: 'Ugyldigt format'
            },
            de: {
                required: 'Dieses Feld ist erforderlich',
                email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                minlength: (n) => `Mindestens ${n} Zeichen erforderlich`,
                maxlength: (n) => `Maximal ${n} Zeichen erlaubt`,
                minValue: (n) => `Mindestens ${n} erforderlich`,
                maxValue: (n) => `Höchstens ${n} erlaubt`,
                minAge: (n) => `Du musst mindestens ${n} Jahre alt sein`,
                maxAge: (n) => `Du darfst höchstens ${n} Jahre alt sein`,
                passwordStrength_weak: 'Das Passwort muss mindestens 6 Zeichen lang sein',
                passwordStrength_medium: 'Mindestens 8 Zeichen und eine Zahl erforderlich',
                passwordStrength_strong: 'Mindestens 10 Zeichen, Groß-/Kleinbuchstaben, Zahl und Symbol erforderlich',
                match: 'Die Werte stimmen nicht überein',
                invalidFormat: 'Ungültiges Format'
            },
            pirate: {
                required: 'Ye gotta fill this in, matey!',
                email: 'That be no proper sea-mail address!',
                minlength: (n) => `Ye need at least ${n} scraggly letters`,
                maxlength: (n) => `Whoa! No more than ${n} runes, ye scallywag!`,
                minValue: (n) => `Ye need at least ${n} doubloons`,
                maxValue: (n) => `No more than ${n}, or ye’ll walk the plank!`,
                minAge: (n) => `Ye need to be at least ${n} summers old, ye wee swabbie`,
                maxAge: (n) => `Over ${n}? That’s ancient, ye barnacle!`,
                passwordStrength_weak: 'Yer secret be too short — at least 6 runes!',
                passwordStrength_medium: 'Needs 8 runes and at least one shiny number, ye dog!',
                passwordStrength_strong: 'A proper pirate pass be 10+ runes, big letters, small letters, cursed symbols, and digits!',
                match: 'These don’t be matchin’, ye landlubber!',
                invalidFormat: 'That be a cursed format, it is!'
            },
        };
    }

    reset() {
        this.log('[RESET] Clearing form state and errors');

        this.clearErrors();

        this.form.querySelectorAll('[data-dirty="dirty"]').forEach((field) => {
            delete field.dataset.dirty;
        });
    }

    attachListener() {
        const allFields = this.getAllFields();

        this.form.addEventListener('submit', async (e) => {
            this.log('[EVENT] Submit triggered');
            e.preventDefault();

            const submitBtn = this.form.querySelector('button[type="submit"]');
            if (submitBtn) {
                this.deactivateButton(submitBtn);
            }

            this.log('[VALIDATION] Starting form validation');
            const result = await this.validate();
            this.log(`[VALIDATION] Validation result: ${result}`);

            if (result) {
                this.log('[EVENT] Form valid. Proceeding to submission.');
                if (this.autoSubmit) {
                    this.form.submit();
                } else {
                    this.activateButton(submitBtn);
                }
            } else {
                this.log('[EVENT] Form invalid. Submission aborted.');
                this.activateButton(submitBtn);
            }
        });

        if (this.validateOnChange) {
            allFields.forEach(field => {
                field.addEventListener('change', () => {
                    this.log(`[EVENT] Change detected on "${field.name}"`);
                    this.validateField(field);
                });
                field.addEventListener('input', () => {
                    if (field.dataset.dirty === 'dirty') {
                        this.log(`[EVENT] Input on dirty field "${field.name}"`);
                        this.validateField(field);
                    }
                });
            });
        }

        this.form.querySelectorAll('[data-next]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const currentStepSection = this.form.querySelector(`[data-step="${this.currentStep}"]`);
                const forceFullValidation = currentStepSection && currentStepSection.hasAttribute('data-validate');

                this.log(`[STEP] Next button clicked. Full validation? ${forceFullValidation}`);

                this.deactivateButton(btn);
                await new Promise(resolve => setTimeout(resolve, 300)); // simulate loading animation

                const valid = forceFullValidation
                    ? await this.validate()
                    : await this.validateCurrentStep();

                if (valid) this.nextStep();

                this.activateButton(btn);
            });
        });

        this.form.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const currentStepSection = this.form.querySelector(`[data-step="${this.currentStep}"]`);
                if (!currentStepSection) return;

                const isTextInput = ['INPUT'].includes(e.target.tagName);
                const isSubmitType = e.target.type === 'submit';

                if (isTextInput && !isSubmitType) {
                    const btn = currentStepSection.querySelector('[data-next]');
                    if (btn) {
                        this.deactivateButton(btn);
                        await new Promise(resolve => setTimeout(resolve, 300)); // simulate loading animation
                    }

                    const forceFullValidation = currentStepSection.hasAttribute('data-validate');
                    const valid = forceFullValidation
                        ? await this.validate()
                        : await this.validateCurrentStep();

                    this.log(`[STEP] Enter clicked. Full validation? ${forceFullValidation}`);

                    if (btn) {
                        this.activateButton(btn);
                    }

                    if (valid) this.nextStep();
                }
            }
        });

        this.form.querySelectorAll('[data-prev]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                this.deactivateButton(btn);
                await new Promise(resolve => setTimeout(resolve, 300)); // simulate loading animation

                this.prevStep();
                this.activateButton(btn);
            });
        });
    }

    // validate methods
    async validate() {
        this.log('[VALIDATION] Running validate()');
        this.log(`[VALIDATION] Using language "${this.language}"`);

        const allFields = this.getAllFields();
        const seenRadioGroups = new Set();
        let isValid = true;
        let firstInvalid = null;
        const failedFields = [];

        this.clearErrors();

        const validations = Array.from(allFields).map(async (field) => {
            const type = field.type;
            const name = field.name;

            if (type === 'radio' && seenRadioGroups.has(name)) return;
            if (type === 'radio') seenRadioGroups.add(name);

            const valid = await this.validateField(field);
            this.log(`[VALIDATION] Field "${name}" valid: ${valid}`);

            if (!valid) {
                failedFields.push(field);
                if (!firstInvalid) firstInvalid = field;
                isValid = false;
            }
        });

        await Promise.all(validations);

        if (!isValid && firstInvalid) {
            this.log('[VALIDATION] Invalid fields detected');
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus({ preventScroll: true });

            if (typeof this.onFail === 'function') {
                this.onFail(failedFields);
            }

            if (this.errorSummaryTarget) {
                this.renderErrorSummary(failedFields);
            }

        } else if (isValid) {
            if (this.errorSummaryTarget) {
                this.errorSummaryTarget.innerHTML = '';
            }

            const formData = this.getFormDataAsObject();
            if (typeof this.onSuccess === 'function') {
                this.onSuccess(formData);
            }

            if (this.submitTo?.url) {
                this.submitForm(formData);
            }
        }

        return isValid;
    }

    submitForm(formData) {
        const url = this.submitTo.url;
        const method = this.submitTo.method || 'POST';
        const headers = {
            'Content-Type': 'application/json',
            ...(this.submitTo.headers || {})
        };

        const body = JSON.stringify(
            typeof this.submitTo.transform === 'function'
            ? this.submitTo.transform(formData)
            : formData
        );

        this.log(`[API] Submitting to ${url} with method ${method}`);

        fetch(url, { method, headers, body })
            .then(async (res) => {
                const isJson = res.headers.get('content-type')?.includes('application/json');
                const data = isJson ? await res.json() : await res.text();

                this.log(`[API] Response status: ${res.status}`);
                this.log(`[API] Response body: ${JSON.stringify(data)}`);

                if (res.ok) {
                    this.submitTo.onResponse?.(data, res);
                } else {
                    this.log(`[API] Submission failed: ${JSON.stringify(err)}`, 'error');

                    throw { status: res.status, data };
                }
            })
            .catch((err) => {
                this.submitTo.onError?.(err);
            });
    }

    getFormDataAsObject() {
        const formData = {};

        this.getAllFields().forEach(field => {
            if (field.name && !field.disabled) {
                if (field.type === 'radio') {
                    if (field.checked) formData[field.name] = field.value;
                } else if (field.type === 'checkbox') {
                    if (!formData[field.name]) formData[field.name] = [];
                    if (field.checked) formData[field.name].push(field.value);
                } else {
                    formData[field.name] = field.value;
                }
            }
        });

        return formData;
    }

    async validateField(field) {
        this.log(`[VALIDATION] Validating field "${field.name}", type "${field.type}"`);
        this.clearErrorsFor(field);
        field.classList.add('validating');

        const sleep = parseFloat(field.dataset.sleep || '0');
        if (sleep > 0 && field.value !== '') {
            this.log(`[ASYNC] Sleeping for ${sleep}s`);
            await new Promise(resolve => setTimeout(resolve, sleep * 1000));
        }

        const { valid, errorMessage, errorTarget } = await this.runValidationRules(field);

        field.classList.remove('validating');
        this.clearThemeClasses(field);

        if (!valid) {
            field.dataset.dirty = 'dirty';
            this.renderError(field, errorMessage, errorTarget);
            this.applyThemeClass(field, 'invalid');
        } else {
            delete field.dataset.dirty;
            this.applyThemeClass(field, 'valid');
            this.log(`[VALIDATION] Field "${field.name}" passed`);
        }

        return valid;
    }

    async runValidationRules(field) {
        field.name;
        const type = field.type;
        this.form;
        const messages = this.messages[this.language] || {};
        let valid = true;
        let errorMessage = '';
        let errorTarget = field;

        // Required
        if (!await this.checkRequired(field)) {
            valid = false;
            errorMessage = field.dataset.errorMessage || messages.required || 'This field is required';
        }

        // Checkbox group min
        if (valid && type === 'checkbox' && field.dataset.min) {
            const minResult = this.checkCheckboxGroupMin(field);
            if (!minResult.valid) {
                valid = false;
                errorMessage = minResult.message;
                errorTarget = minResult.errorTarget;
            }
        }

        // Match
        if (valid && field.dataset.match && field.value) {
            if (!this.checkMatch(field)) {
                valid = false;
                errorMessage = messages.match || 'Values do not match';
            }
        }

        // Min length
        if (valid && field.hasAttribute('minlength') && field.value) {
            const minLength = parseInt(field.getAttribute('minlength'), 10);
            if (field.value.length < minLength) {
                valid = false;
                errorMessage = messages.minlength?.(minLength) || `Minimum length is ${minLength}`;
            }
        }

        // Numeric range (data-min / data-max)
        if (valid && (field.dataset.min || field.dataset.max) && field.value) {
            const rangeCheck = this.checkNumericRange(field);
            if (!rangeCheck.valid) {
                valid = false;
                errorMessage = rangeCheck.message;
            }
        }

        // Pattern
        if (valid && field.hasAttribute('pattern') && field.value) {
            if (!this.checkPattern(field)) {
                valid = false;
                errorMessage = messages.invalidFormat || 'Invalid format';
            }
        }

        // Max length
        if (valid && field.hasAttribute('maxlength') && field.value) {
            const maxLength = parseInt(field.getAttribute('maxlength'), 10);
            if (field.value.length > maxLength) {
                valid = false;
                errorMessage = messages.maxlength?.(maxLength) || `Maximum length is ${maxLength}`;
            }
        }

        // Email
        if (valid && type === 'email' && field.value) {
            if (!this.checkEmail(field.value)) {
                valid = false;
                errorMessage = messages.email || 'Please enter a valid email address';
            }
        }

        // Age check
        if (valid && (field.dataset.minAge || field.dataset.maxAge) && field.value) {
            const ageCheck = this.checkAge(field);
            if (!ageCheck.valid) {
                valid = false;
                errorMessage = ageCheck.message;
            }
        }

        // Password strength
        if (valid && field.dataset.passwordStrength && field.value) {
            const result = this.checkPasswordStrength(field);
            if (!result.valid) {
                valid = false;
                errorMessage = result.message;
            }
        }

        // Custom validator
        if (valid && field.dataset.validator) {
            const result = await this.checkCustomValidator(field);
            if (result !== true) {
                valid = false;
                errorMessage = typeof result === 'string' ? result : 'Invalid value';
            }
        }

        return { valid, errorMessage, errorTarget };
    }

    renderError(field, message, target) {
        this.log(`[VALIDATION] Field "${field.name}" failed: ${message}`);
        this.createTooltip(field, target, message);

        if (this.helperText) {
            const containerId = field.dataset.errorContainer;
            const container = containerId ? document.getElementById(containerId) : null;

            if (container) {
                container.textContent = message;
                container.dataset.referenceId = field.dataset.beastId;
            } else {
                this.clearErrorsFor(field);
                const error = document.createElement('div');
                error.className = this.errorContainerClass;
                error.dataset.referenceId = field.dataset.beastId;
                error.textContent = message;
                target.insertAdjacentElement('afterend', error);
            }
        }

        if (this.shakeInput) {
            field.classList.add('shake');
            field.addEventListener('animationend', () => {
                field.classList.remove('shake');
            }, { once: true });
        }
    }

    validateCurrentStep() {
        const currentStep = this.currentStep;

        const fields = this.form.querySelectorAll(`[data-step="${currentStep}"] input, [data-step="${currentStep}"] select, [data-step="${currentStep}"] textarea`);

        let isValid = true;
        let firstInvalid = null;
        const failedFields = [];

        this.clearErrors();

        const validations = Array.from(fields).map(async (field) => {
            const valid = await this.validateField(field);
            if (!valid) {
                if (!firstInvalid) firstInvalid = field;
                isValid = false;
                failedFields.push(field);
            }
        });

        return Promise.all(validations).then(() => {
            if (!isValid && firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus({ preventScroll: true });

                if (typeof this.onFail === 'function') {
                    this.onFail(failedFields);
                }

                if (this.errorSummaryTarget) {
                    this.renderErrorSummary(failedFields);
                }
            }

            return isValid;
        });
    }

    clearErrors() {
        this.log('[VALIDATION] Clearing all error messages');

        this.getAllFields().forEach(field => {
            this.clearErrorsFor(field);
        });
    }

    clearErrorsFor(field) {
        const beastId = field.dataset.beastId;
        const related = document.querySelectorAll(`[data-reference-id="${beastId}"]`);

        this.log(`[UI] Clearing errors for field "${field.name || '[unnamed]'}"`);

        related.forEach(el => {
            if (el.classList.contains(this.tooltipClass)) {
                el.remove();
            } else if (el.id) {
                el.innerHTML = '';
            } else {
                el.remove();
            }
        });

        this.clearThemeClasses(field);
    }

    // utility methods
    log(msg, level = 'debug') {
        if (!this.debug) return;
        if (level === 'warn') console.warn(msg);
        else if (level === 'error') console.error(msg);
        else console.log(`[${new Date().toISOString()}] ${msg}`);
    }

    randomString(length = 8) {
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length }, () =>
            letters.charAt(Math.floor(Math.random() * letters.length))
        ).join('');
    }

    // UI helpers
    createTooltip(field, target, message) {
        if (this.tooltips == 'none') return;

        const position = this.tooltips;

        this.log(`[UI] Showing tooltip for "${field.name || '[unnamed]'}" at ${position}`);

        const container = target.parentElement;
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        const tooltip = document.createElement('div');
        tooltip.className = this.tooltipClass;
        tooltip.textContent = message;
        tooltip.dataset.referenceId = field.dataset.beastId;

        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '9999';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.visibility = 'hidden';

        container.appendChild(tooltip);

        const { top, left } = this.getTooltipCoordinates(target, tooltip, position);
        this.log(`[UI] Tooltip coordinates: top=${top}, left=${left}`);

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';
    }

    renderErrorSummary(fields) {
        if (!this.errorSummaryTarget) return;

        this.log(`[SUMMARY] Rendering error summary for ${fields.length} fields`);

        this.errorSummaryOptions = {
            scrollTo: true,
            heading: 'Please fix the following:',
            icon: '❌',
        };

        const { scrollTo, heading, icon } = this.errorSummaryOptions;

        const container = this.errorSummaryTarget;
        container.innerHTML = ''; // clear old

        const wrapper = document.createElement('div');
        wrapper.className = 'beast-summary-box';

        if (heading) {
            const title = document.createElement('strong');
            title.textContent = `${icon} ${heading}`;
            wrapper.appendChild(title);
        }

        const list = document.createElement('ul');
        list.className = 'beast-summary-list';

        fields.forEach(field => {
            const label =
                field.getAttribute('aria-label') ||
                field.getAttribute('placeholder') ||
                field.dataset.label ||
                field.name ||
                '[unnamed]';

            const messageElement = document.querySelector(`[data-reference-id="${field.dataset.beastId}"]`);
            const message = messageElement?.textContent || 'Invalid field';

            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = `${label}: ${message}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (scrollTo) {
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    field.focus({ preventScroll: true });
                }
            });

            item.appendChild(link);
            list.appendChild(item);
        });

        wrapper.appendChild(list);
        container.appendChild(wrapper);
    }

    getTooltipCoordinates(target, tooltip, position = 'top-center') {
        const tooltipRect = tooltip.getBoundingClientRect();
        target.getBoundingClientRect();
        const offsetLeft = target.offsetLeft;
        const offsetTop = target.offsetTop;

        let left, top;

        switch (position) {
            case 'top-left':
                left = offsetLeft;
                break;
            case 'top-right':
                left = offsetLeft + target.offsetWidth - tooltipRect.width;
                break;
            case 'top-center':
            default:
                left = offsetLeft + (target.offsetWidth / 2) - (tooltipRect.width / 2);
                break;
        }

        top = offsetTop - tooltipRect.height - 8;

        return { top, left };
    }

    deactivateButton(btn) {
        if (btn) {
            btn.disabled = true;
            btn.dataset.originalText = btn.innerHTML;
            btn.textContent = 'Validating...';
        }
    }

    activateButton(btn) {
        if (btn) {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText;
        }
    }

    applyThemeClass(field, type) {
        if (this.theme === 'none') return;

        const map = {
            beast: { valid: 'valid', invalid: 'invalid' },
            bootstrap: { valid: 'is-valid', invalid: 'is-invalid' },
        };

        const cls = map[this.theme]?.[type];
        if (cls) field.classList.add(cls);
    }

    setTheme(theme) {
        this.theme = theme;
        this.log(`[THEME] Theme set to "${theme}"`);
    }

    setLanguage(lang) {
        if (this.messages[lang]) {
            this.language = lang;
            this.log(`[LANG] Language set to "${lang}"`);
        } else {
            this.log(`[WARN] Language "${lang}" not found`);
        }
    }

    setMessages(lang, map) {
        this.messages[lang] = {
            ...this.messages[lang] || {},
            ...map
        };
    }

    addMessage(lang, key, message) {
        if (!this.messages[lang]) this.messages[lang] = {};
        this.messages[lang][key] = message;
    }

    getAllFields() {
        return this.form.querySelectorAll('input, textarea, select');
    }

    clearThemeClasses(field) {
        if (this.theme === 'none') return;

        const classes = {
            beast: ['valid', 'invalid'],
            bootstrap: ['is-valid', 'is-invalid'],
        };

        (classes[this.theme] || []).forEach(cls => field.classList.remove(cls));
    }

    showStep(stepNumber) {
        const sections = document.querySelectorAll('[data-step]');
        sections.forEach(section => {
            const step = parseInt(section.dataset.step, 10);
            section.style.display = step === stepNumber ? 'block' : 'none';
        });
        this.currentStep = stepNumber;
        this.log(`[STEP] Showing step ${stepNumber}`);

        if (typeof this.onStepChange === 'function') {
            this.onStepChange(stepNumber);
        }
    }

    nextStep() {
        if (this.currentStep < document.querySelectorAll('[data-step]').length) {
            const nextNumber = this.currentStep + 1;
            this.log(`[STEP] Switching from step ${this.currentStep} to ${nextNumber}`);

            this.showStep(nextNumber);
        } else {
            this.log('[STEP] Already at last step, cannot go forward');
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            const nextNumber = this.currentStep - 1;
            this.log(`[STEP] Switching from step ${this.currentStep} to ${nextNumber}`);

            this.showStep(nextNumber);
        } else {
            this.log('[STEP] Already at first step, cannot go backward');
        }
    }

    addValidator(name, fn) {
        this.log(`[CUSTOM] Adding custom validator "${name}"`);

        this.customValidators[name] = fn;
    }

    setErrorSummaryTarget(selector, options = {}) {
        const el = document.querySelector(selector);
        if (!el) {
            this.log(`[SUMMARY] Target "${selector}" not found`);
            return;
        }

        this.errorSummaryTarget = el;
        this.errorSummaryOptions = {
            ...this.errorSummaryOptions,
            ...options
        };

        this.log(`[SUMMARY] Bound to ${selector}`);
    }

    checkRequired(field) {
        const type = field.type;
        const name = field.name;
        const form = this.form;

        if (!field.hasAttribute('required')) return true;

        if (type === 'checkbox') return field.checked;
        if (type === 'radio') return !!form.querySelector(`input[type="radio"][name="${name}"]:checked`);
        if (type === 'file') return field.files.length > 0;
        return field.value.trim() !== '';
    }

    checkCheckboxGroupMin(field) {
        const name = field.name;
        const min = parseInt(field.dataset.min, 10);
        const boxes = this.form.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
        const checkedCount = Array.from(boxes).filter(b => b.checked).length;

        if (checkedCount < min) {
            return {
                valid: false,
                message: `Select at least ${min}`,
                errorTarget: boxes[boxes.length - 1]
            };
        }
        return { valid: true };
    }

    checkPattern(field) {
        const pattern = field.pattern;
        const regex = new RegExp(`^(?:${pattern})$`);
        return regex.test(field.value);
    }

    checkMatch(field) {
        const matchName = field.dataset.match;
        const other = this.form.querySelector(`[name="${matchName}"]`);
        return other && other.value === field.value;
    }

    checkEmail(value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value);
    }

    checkNumericRange(field) {
        const value = parseFloat(field.value);
        if (isNaN(value)) return { valid: true };

        const min = parseFloat(field.dataset.min);
        const max = parseFloat(field.dataset.max);

        if (!isNaN(min) && value < min) {
            return {
                valid: false,
                message: this.messages[this.language]?.minValue?.(min) || `Must be at least ${min}`,

            };
        }

        if (!isNaN(max) && value > max) {
            return {
                valid: false,
                message: this.messages[this.language]?.maxValue?.(max) || `Must be at most ${min}`,
            };
        }

        return { valid: true };
    }

    checkAge(field) {
        const value = field.value;
        if (!value) return { valid: true };

        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        const exactAge = age - (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? 1 : 0);

        const minAge = parseInt(field.dataset.minAge, 10);
        const maxAge = parseInt(field.dataset.maxAge, 10);
        const messages = this.messages[this.language] || {};

        if (!isNaN(minAge) && exactAge < minAge) {
            return {
                valid: false,
                message: messages.minAge?.(minAge) || `You must be at least ${minAge} years old`,
            };
        }

        if (!isNaN(maxAge) && exactAge > maxAge) {
            return {
                valid: false,
                message: messages.maxAge?.(maxAge) || `You must be no older than ${maxAge} years old`,
            };
        }

        return { valid: true };
    }

    checkPasswordStrength(field) {
        const level = field.dataset.passwordStrength;
        const value = field.value;
        const messages = this.messages[this.language] || {};
        let valid = true;

        const rules = {
            weak: /.{6,}/,
            medium: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
            strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/,
        };

        const rule = rules[level] || rules.medium;

        valid = rule.test(value);

        if (!valid) {
            const msgKey = `passwordStrength_${level}`;
            return {
                valid: false,
                message: messages[msgKey] || `Password is not ${level} enough`,
            };
        }

        return { valid: true };
    }

    async checkCustomValidator(field) {
        const validatorName = field.dataset.validator;
        const validatorFn = this.customValidators[validatorName];
        if (typeof validatorFn === 'function') {
            const result = await validatorFn(field);
            this.log(`[CUSTOM] Validator "${validatorName}" returned: ${result}`);
            return result;
        } else {
            this.log(`[WARN] Custom validator "${validatorName}" not found`);
            return true;
        }
    }
}

if (typeof window !== 'undefined') {
    window.BeastValidator = BeastValidator; // for CDN/global use
}

export { BeastValidator as default };
//# sourceMappingURL=validate.esm.js.map
