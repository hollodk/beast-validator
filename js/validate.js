class BeastFormValidator {
    constructor(formId, opt = {}) {
        this.form = document.getElementById(formId);

        this.opt = opt;
        this.errorContainerClass = 'beast-error-msg';
        this.tooltipClass = 'beast-tooltip';
        this.focusFirst = true;
        this.validateOnChange = true;
        this.tooltips = false;
        this.helperText = true;
        this.shakeInput = true;

        if (typeof(opt.errorContainerClass) != 'undefined') {
            this.errorContainerClass = opt.errorContainerClass;
        }

        if (typeof(opt.focusFirst) != 'undefined') {
            this.focusFirst = opt.focusFirst;
        }

        if (typeof(opt.validateOnChange) != 'undefined') {
            this.validateOnChange = opt.validateOnChange;
        }

        if (typeof(opt.tooltips) != 'undefined') {
            this.tooltips = opt.tooltips;
        }

        if (typeof(opt.helperText) != 'undefined') {
            this.helperText = opt.helperText;
        }

        if (typeof(opt.shakeInput) != 'undefined') {
            this.shakeInput = opt.shakeInput;
        }

        this.attachListener();

        this.getAllFields().forEach(field => {
            field.dataset.beastId = this.randomString(8);
        });


        if (this.validateOnChange === true) {
            this.getAllFields().forEach(field => {
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
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
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

        document.querySelectorAll('.'+this.beastTooltipClass).forEach(el => el.remove());
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

    validate() {
        const allFields = this.getAllFields();
        let isValid = true;
        let firstInvalid = null;

        this.clearErrors();
        const seenRadioGroups = new Set();

        allFields.forEach(field => {
            const type = field.type;
            const name = field.name;

            if (type === 'radio' && seenRadioGroups.has(name)) return;
            if (type === 'radio') seenRadioGroups.add(name);

            const valid = this.validateField(field);
            if (!valid && !firstInvalid) {
                firstInvalid = field;
                isValid = false;
            }
        });

        if (!isValid && firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus({ preventScroll: true });
        }

        return isValid;
    }

    validateField(field) {
        const type = field.type;
        const name = field.name;
        const isRequired = field.hasAttribute('required');
        const customContainer = field.dataset.errorContainer;
        const errorClass = this.errorContainerClass;
        const form = this.form;

        let valid = true;
        let errorMessage = 'This field is required';
        let errorTarget = field;

        this.clearErrorsFor(field);

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
                setTimeout(function() {
                    field.classList.remove('shake');
                }, 3000);
            }
        } else {
            delete field.dataset.dirty;
        }

        return valid;
    }

    clearErrorsFor(field) {
        const items = document.querySelectorAll('[name="'+field.name+'"]');

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
}
