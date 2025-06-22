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
                match: 'Values do not match',
                invalidFormat: 'Invalid format'
            },
            da: {
                required: 'Dette felt er påkrævet',
                email: 'Indtast en gyldig e-mailadresse',
                minlength: (n) => `Minimumslængde er ${n} tegn`,
                maxlength: (n) => `Maksimallængde er ${n} tegn`,
                match: 'Værdierne stemmer ikke overens',
                invalidFormat: 'Ugyldigt format'
            },
            de: {
                required: 'Dieses Feld ist erforderlich',
                email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                minlength: (n) => `Mindestens ${n} Zeichen erforderlich`,
                maxlength: (n) => `Maximal ${n} Zeichen erlaubt`,
                match: 'Die Werte stimmen nicht überein',
                invalidFormat: 'Ungültiges Format'
            },
            pirate: {
                required: 'Ye gotta fill this in, matey!',
                email: 'That be no proper sea-mail address!',
                minlength: (n) => `Ye need at least ${n} scraggly letters`,
                maxlength: (n) => `Whoa! No more than ${n} runes, ye scallywag!`,
                match: 'These don’t be matchin’, ye landlubber!',
                invalidFormat: 'That be a cursed format, it is!'
            },
        };

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

    activateButton(submitBtn) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
        }
    }

    getAllFields() {
        return this.form.querySelectorAll('input, textarea, select');
    }

    clearErrors() {
        this.log('[VALIDATION] Clearing all error messages');
        this.form.querySelectorAll(`.${this.errorContainerClass}`).forEach(el => {
            el.id ? el.innerHTML = '' : el.remove();
        });

        document.querySelectorAll('.' + this.tooltipClass).forEach(el => el.remove());
    }

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

        const tooltipRect = tooltip.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        let left;
        if (position === 'top-left') {
            left = target.offsetLeft;
        } else if (position === 'top-right') {
            left = target.offsetLeft + target.offsetWidth - tooltipRect.width;
        } else {
            left = target.offsetLeft + (target.offsetWidth / 2) - (tooltipRect.width / 2);
        }

        const top = target.offsetTop - tooltipRect.height - 8;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';
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
            }

            return isValid;
        });
    }

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
        } else if (isValid && typeof this.onSuccess === 'function') {
            this.onSuccess();
        }

        return isValid;
    }

    async validateField(field) {
        const name = field.name;
        const type = field.type;
        const isRequired = field.hasAttribute('required');
        const form = this.form;
        const messages = this.messages[this.language] || {};
        let valid = true;
        let errorMessage = '';
        let errorTarget = field;

        this.log(`[VALIDATION] Validating field "${name}", type "${type}"`);
        this.clearErrorsFor(field);
        field.classList.add('validating');

        const sleep = parseFloat(field.dataset.sleep || '0');
        if (sleep > 0) {
            this.log(`[ASYNC] Sleeping for ${sleep}s`);
            await new Promise(resolve => setTimeout(resolve, sleep * 1000));
        }

        // 🔴 Required
        if (isRequired) {
            if (type === 'checkbox') {
                valid = field.checked;
            } else if (type === 'radio') {
                valid = !!form.querySelector(`input[type="radio"][name="${name}"]:checked`);
                const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
                errorTarget = radios[radios.length - 1];
            } else if (type === 'file') {
                valid = field.files.length > 0;
            } else {
                valid = field.value.trim() !== '';
            }
            if (!valid) {
                errorMessage = field.dataset.errorMessage || messages.required || 'This field is required';
            }
        }

        // 🟠 Checkbox group min
        if (type === 'checkbox' && field.dataset.min) {
            const boxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
            const checkedCount = Array.from(boxes).filter(b => b.checked).length;
            const min = parseInt(field.dataset.min, 10);
            if (checkedCount < min) {
                valid = false;
                errorMessage = `Select at least ${min}`;
                errorTarget = boxes[boxes.length - 1];
            }
        }

        // 🔵 Pattern check
        if (field.dataset.pattern && field.value) {
            const regex = new RegExp(field.dataset.pattern);
            if (!regex.test(field.value)) {
                valid = false;
                errorMessage = messages.invalidFormat || 'Invalid format';
            }
        }

        // 🔁 Match check
        if (field.dataset.match && field.value) {
            const otherField = form.querySelector(`[name="${field.dataset.match}"]`);
            if (otherField && otherField.value !== field.value) {
                valid = false;
                errorMessage = messages.match || 'Values do not match';
            }
        }

        // 📏 Min length
        if (field.hasAttribute('minlength') && field.value) {
            const minLength = parseInt(field.getAttribute('minlength'), 10);
            if (field.value.length < minLength) {
                valid = false;
                errorMessage = messages.minlength?.(minLength) || `Minimum length is ${minLength} characters`;
            }
        }

        // 📏 Max length
        if (field.hasAttribute('maxlength') && field.value) {
            const maxLength = parseInt(field.getAttribute('maxlength'), 10);
            if (field.value.length > maxLength) {
                valid = false;
                errorMessage = messages.maxlength?.(maxLength) || `Maximum length is ${maxLength} characters`;
            }
        }

        // 📧 Email pattern
        if (type === 'email' && field.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                valid = false;
                errorMessage = messages.email || 'Please enter a valid email address';
            }
        }

        // 🧠 Custom validator
        if (field.dataset.validator) {
            const validatorName = field.dataset.validator;
            const validatorFn = this.customValidators[validatorName];
            if (typeof validatorFn === 'function') {
                const result = await validatorFn(field);
                if (result !== true) {
                    valid = false;
                    errorMessage = typeof result === 'string' ? result : 'Invalid value';
                }
            } else {
                this.log(`[WARN] Custom validator "${validatorName}" not found`);
            }
        }

        // 🧼 Handle invalid
        this.clearThemeClasses(field);
        field.classList.remove('validating');

        if (!valid) {
            this.log(`[VALIDATION] Field "${name}" failed: ${errorMessage}`);

            field.dataset.dirty = 'dirty';
            this.createTooltip(field, errorTarget, errorMessage);

            if (this.helperText) {
                const containerId = field.dataset.errorContainer;
                if (containerId && document.getElementById(containerId)) {
                    const container = document.getElementById(containerId);
                    container.textContent = errorMessage;
                    container.dataset.referenceId = field.dataset.beastId;
                } else {
                    this.clearErrorsFor(field);
                    const error = document.createElement('div');
                    error.className = this.errorContainerClass;
                    error.dataset.referenceId = field.dataset.beastId;
                    error.textContent = errorMessage;
                    errorTarget.insertAdjacentElement('afterend', error);
                }
            }

            if (this.shakeInput) {
                field.classList.add('shake');
                field.addEventListener('animationend', () => {
                    field.classList.remove('shake');
                }, { once: true });
            }

            this.applyThemeClass(field, 'invalid');
        } else {
            delete field.dataset.dirty;
            this.applyThemeClass(field, 'valid');
            this.log(`[VALIDATION] Field "${name}" passed`);
        }

        return valid;
    }

    clearThemeClasses(field) {
        if (this.theme === 'none') return;

        const classes = {
            beast: ['valid', 'invalid'],
            bootstrap: ['is-valid', 'is-invalid'],
        };

        (classes[this.theme] || []).forEach(cls => field.classList.remove(cls));
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
    }

    randomString(length = 8) {
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Array.from({ length }, () =>
            letters.charAt(Math.floor(Math.random() * letters.length))
        ).join('');
    }

    log(message, level = 'DEBUG') {
        if (this.debug === true) {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            console.log(`[${timestamp}] [${level}] ${message}`);
        }
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

    reset() {
        this.log('[ACTION] Form reset called, clearing all dirty fields and errors');

        this.clearErrors();

        this.form.querySelectorAll('[data-dirty="dirty"]').forEach((field) => {
            delete field.dataset.dirty;
        });
    }

    addValidator(name, fn) {
        this.log(`[CUSTOM] Adding custom validator "${name}"`);

        this.customValidators[name] = fn;
    }
}
