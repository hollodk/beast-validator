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

        if (this.setNoValidate) {
            this.form.setAttribute('novalidate', 'true');
        }

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

                const valid = forceFullValidation
                    ? await this.validate()
                    : await this.validateCurrentStep();

                if (valid) this.nextStep();
            });
        });

        this.form.querySelectorAll('[data-prev]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.prevStep();
            });
        });

        this.messages = {
            en: {
                required: 'This field is required',
                email: 'Please enter a valid email address',
                minlength: (n) => `Minimum length is ${n} characters`,
                maxlength: (n) => `Maximum length is ${n} characters`,
                minValue: (n) => `Must be at least ${n}`,
                maxValue: (n) => `Must be at most ${n}`,
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
                match: 'These don’t be matchin’, ye landlubber!',
                invalidFormat: 'That be a cursed format, it is!'
            },
        };

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

    reset() {
        this.log('[ACTION] Form reset called, clearing all dirty fields and errors');

        this.clearErrors();

        this.form.querySelectorAll('[data-dirty="dirty"]').forEach((field) => {
            delete field.dataset.dirty;
        });
    }

    attachListener() {
        this.form.addEventListener('submit', async (e) => {
            this.log('[EVENT] Submit triggered');
            e.preventDefault();

            const submitBtn = this.form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                submitBtn.textContent = 'Validating...';
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

            if (typeof this.onSuccess === 'function') {
                this.onSuccess();
            }
        }

        return isValid;
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
        const name = field.name;
        const type = field.type;
        const form = this.form;
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

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';
    }

    renderErrorSummary(fields) {
        if (!this.errorSummaryTarget) return;

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
        const targetRect = target.getBoundingClientRect();
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

    activateButton(submitBtn) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
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
            this.showStep(this.currentStep + 1);
        } else {
            this.log('[STEP] Already at last step, cannot go forward');
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
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

    async checkCustomValidator(field) {
        const validatorName = field.dataset.validator;
        const validatorFn = this.customValidators[validatorName];
        if (typeof validatorFn === 'function') {
            return await validatorFn(field);
        } else {
            this.log(`[WARN] Custom validator "${validatorName}" not found`);
            return true;
        }
    }

}
