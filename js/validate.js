class BeastValidator {
    constructor(form, {
        errorContainerClass = 'beast-error-msg',
        tooltipClass = 'beast-tooltip',
        focusFirst = true,
        validateOnChange = true,
        tooltips = false,
        helperText = true,
        shakeInput = true,
        waitForDom = true,
        setNoValidate = true,
        debug = false,
        onFail = null,
    } = {}) {
        this.errorContainerClass = errorContainerClass;
        this.tooltipClass = tooltipClass;
        this.focusFirst = focusFirst;
        this.validateOnChange = validateOnChange;
        this.tooltips = tooltips;
        this.helperText = helperText;
        this.shakeInput = shakeInput;
        this.waitForDom = waitForDom;
        this.setNoValidate = setNoValidate,
        this.debug = debug,
        this.onFail = onFail;

        this.form = null;

        if (this.waitForDom == true) {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize(form);
            });
        } else {
            this.initialize(form);
        }
    }

    initialize(form) {
        if (typeof form === 'string') {
            this.form = document.getElementById(form);
        } else {
            this.form = form;
        }

        this.form.setAttribute('novalidate', 'true');

        this.attachListener();

        const allFields = this.getAllFields();

        allFields.forEach(field => {
            field.dataset.beastId = this.randomString(8);
        });

        if (this.validateOnChange === true) {
            allFields.forEach(field => {
                field.addEventListener('change', () => {
                    this.validateField(field);
                });
                field.addEventListener('input', () => {
                    if (field.dataset.dirty == 'dirty') {
                        this.validateField(field);
                    }
                });
            });
        }
    }

    attachListener() {
        this.form.addEventListener('submit', async (e) => {
            this.log('submit start');
            e.preventDefault();

            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.innerHTML;
            submitBtn.textContent = 'Validating...';

            this.log('validation process');
            const result = await this.validate();
            this.log('got a result');

            if (result) {
                this.log('form is valid, submitting manually');
                this.form.submit();
            } else {
                this.log('form is invalid');
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.dataset.originalText;
            }

            this.log('submit end');
        });
    }

    getAllFields() {
        return this.form.querySelectorAll('input, textarea, select');
    }

    clearErrors() {
        this.form.querySelectorAll(`.${this.errorContainerClass}`).forEach(el => {
            if (el.id) {
                el.innerHTML = '';
            } else {
                el.remove();
            }
        });

        document.querySelectorAll('.'+this.tooltipClass).forEach(el => el.remove());
    }

    createTooltip(field, target, message) {
        if (this.tooltips == false) {
            return;
        }

        const container = target.parentElement;
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        const tooltip = document.createElement('div');
        tooltip.className = this.tooltipClass;
        tooltip.textContent = message;
        tooltip.dataset.referenceId = field.dataset.beastId;

        const rect = target.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = '0';
        tooltip.style.top = '-30px';

        tooltip.style.zIndex = '9999';
        tooltip.style.pointerEvents = 'none';

        container.appendChild(tooltip);
    }

    async validate() {
        this.log('start validation');

        const allFields = this.getAllFields();
        let isValid = true;
        let firstInvalid = null;
        const failedFields = [];

        this.clearErrors();
        const seenRadioGroups = new Set();

        const validations = Array.from(allFields).map(async (field) => {
            const type = field.type;
            const name = field.name;

            this.log('validating '+name+', type: '+type);

            if (type === 'radio' && seenRadioGroups.has(name)) return;
            if (type === 'radio') seenRadioGroups.add(name);

            const valid = await this.validateField(field);
            if (!valid) {
                failedFields.push(field);
                if (!firstInvalid) firstInvalid = field;
                isValid = false;
            }
        });

        this.log('starting to run validations');
        await Promise.all(validations);
        this.log('done running validations');

        if (!isValid && firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus({ preventScroll: true });

            if (typeof this.onFail === 'function') {
                this.onFail(failedFields);
            }
        }

        return isValid;
    }

    async validateField(field) {
        const type = field.type;
        const name = field.name;
        const isRequired = field.hasAttribute('required');
        const customContainer = field.dataset.errorContainer;
        const errorClass = this.errorContainerClass;
        const form = this.form;

        this.log('validate field: '+name);

        let valid = true;
        let errorMessage = field.dataset.errorMessage || 'This field is required';
        let errorTarget = field;

        this.clearErrorsFor(field);
        field.classList.add('validating');

        const sleep = parseFloat(field.dataset.sleep || '0');
        if (sleep > 0) {
            this.log('start sleep for seconds: '+sleep);
            await new Promise(resolve => setTimeout(resolve, sleep * 1000));
            this.log('done sleeping');
        }

        // Required checks
        if (isRequired) {
            if (type === 'checkbox') {
                valid = field.checked;
            } else if (type === 'radio') {
                const checked = !!form.querySelector(`input[type="radio"][name="${name}"]:checked`);
                valid = checked;
                const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
                errorTarget = radios[radios.length - 1];
            } else if (type === 'file') {
                valid = field.files.length > 0;
            } else {
                valid = field.value.trim() !== '';
            }

            if (!valid) errorMessage = 'This field is required';
        }

        // Min checkbox group count
        if (type === 'checkbox' && field.dataset.min) {
            const boxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
            const count = Array.from(boxes).filter(c => c.checked).length;
            const min = parseInt(field.dataset.min, 10);
            valid = count >= min;
            if (!valid) {
                errorTarget = boxes[boxes.length - 1];
                errorMessage = `Select at least ${min}`;
            }
        }

        // Pattern matching
        if (field.dataset.pattern && field.value) {
            const regex = new RegExp(field.dataset.pattern);
            if (!regex.test(field.value)) {
                valid = false;
                errorMessage = 'Invalid format';
            }
        }

        // Email matching
        if (type === 'email' && field.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                valid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        if (field.dataset.async === 'true') {
            const value = field.value;
            const isFakeValid = value !== 'taken'; // Simulate server call
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            if (!isFakeValid) {
                errorMessage = 'Value is already taken';
                valid = false;
            }
        }

        if (field.dataset.errorMessage) {
            errorMessage = field.dataset.errorMessage;
        }

        // Show errors
        if (!valid) {
            if (this.helperText == true) {
                if (customContainer && document.getElementById(customContainer)) {
                    document.getElementById(customContainer).textContent = errorMessage;
                    document.getElementById(customContainer).dataset.referenceId = field.dataset.beastId;

                } else {
                    const error = document.createElement('div');
                    error.dataset.referenceId = field.dataset.beastId;
                    error.className = errorClass;
                    error.textContent = errorMessage;
                    errorTarget.insertAdjacentElement('afterend', error);
                }
            }

            field.dataset.dirty = 'dirty';
            this.createTooltip(field, errorTarget, errorMessage);

            if (this.shakeInput == true) {
                field.classList.add('shake');
                field.addEventListener('animationend', () => {
                    field.classList.remove('shake');
                }, { once: true });
            }
        } else {
            delete field.dataset.dirty;
        }

        field.classList.remove('validating');

        return valid;
    }

    clearErrorsFor(field) {
        let items = [];
        if (field.name) {
            items = document.querySelectorAll('[name="'+field.name+'"]');
        } else {
            items.push(field);
        }

        items.forEach((item) => {
            const beastId = item.dataset.beastId;
            const tooltips = document.querySelectorAll('[data-reference-id="'+beastId+'"]');

            tooltips.forEach(tooltip => {
                if (tooltip.classList.contains(this.tooltipClass)) {
                    tooltip.remove();
                } else {
                    if (tooltip.id) {
                        tooltip.innerHTML = '';
                    } else {
                        tooltip.remove();
                    }
                }
            });
        });
    }

    randomString(length = 8) {
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return result;
    }

    log(message) {
        if (this.debug == true) {
            console.log(message);
        }
    }
}
