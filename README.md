# 🐾 BeastValidator

> A flexible, no-dependency JavaScript form validator built for modern forms with great UX.
>
> 🔗 **[Live Demo](https://hollodk.github.io/beast-validator/)**
> 📁 **[GitHub Repository](https://github.com/hollodk/beast-validator)**

---

## ✨ Features

- ✅ Validates required inputs, selects, checkboxes, radios
- 📧 Built-in email format validation
- 🔤 Pattern matching via `pattern`
- 📏 Min/max numeric range support via `data-min` / `data-max`
- 💡 Min/Max length validation via `minlength` and `maxlength`
- 🤝 Match another field with `data-match`
- 🔁 Real-time validation (`input`/`change`)
- 🫨 Shake animation for invalid fields
- ⬇️ Scrolls to and focuses first invalid field
- 🧩 `onFail`, `onSuccess`, `onInit` callbacks
- 💬 Tooltip support in multiple positions
- 🌍 Multilingual error messages (EN, DA, DE, Pirate)
- ⏳ Delayed validation with `data-sleep`
- 🧪 Async field validation
- 🧩 Step wizard support (`initSteps`, `data-step`, `nextStep`, `prevStep`)
- 🧠 Custom validators via `data-validator`
- 🧩 Error summary with clickable links
- 🔄 Reset method to clear all dirty states and visuals
- ⚙️ Auto-submit toggle
- 🧱 Theme support: `beast`, `bootstrap`, `none`
- 📦 Zero dependencies

---

## 🚀 Installation

### ✅ CDN

```html
<script src="https://hollodk.github.io/beast-validator/beast-validator.js"></script>
<link rel="stylesheet" href="https://hollodk.github.io/beast-validator/beast-validator.css">
```

### 📦 NPM

```bash
npm install beastvalidator
```

```js
import BeastValidator from 'beastvalidator';
```

🔗 [NPM Package](https://www.npmjs.com/package/beastvalidator)


### 🐘 Composer (PHP Projects)

```bash
composer require hollodk/beastvalidator
```

🔗 [Packagist Package](https://packagist.org/packages/hollodk/beastvalidator)

### 🧾 Manual Download

```bash
git clone https://github.com/hollodk/beast-validator.git
```

```html
<script src="/your-path/beast-validator.js"></script>
<link rel="stylesheet" href="/your-path/beast-validator.css">
```

---

## 🧪 Example Usage

### ✅ HTML Form

```html
<form id="myForm">
  <input type="email" name="email" required>
  <input type="password" name="password" minlength="6" maxlength="20" required>
  <input type="password" name="confirm" data-match="password" required>
  <input type="text" name="code" pattern="^[A-Z]{2}$" required>
  <input type="number" name="guests" data-min="1" data-max="5" required>
  <button type="submit">Submit</button>
</form>
```

### ✅ JavaScript Initialization

```js
new BeastValidator('myForm', {
  tooltips: 'top-center',
  autoSubmit: false,
  debug: true,
  initSteps: false,
  onFail: (fields) => console.warn('Invalid fields:', fields),
  onSuccess: () => alert('Form valid!')
});
```

---

## ⚙️ Options

| Option              | Type    | Default             | Description                                        |
|---------------------|---------|----------------------|----------------------------------------------------|
| `errorContainerClass` | string | `'beast-error-msg'` | Class name for inline errors                      |
| `tooltipClass`        | string | `'beast-tooltip'`   | Class name for tooltips                           |
| `focusFirst`          | bool   | `true`              | Scroll/focus first invalid field                  |
| `validateOnChange`    | bool   | `true`              | Validate on `input` and `change` events           |
| `tooltips`            | string | `'none'`            | Tooltip position (`top-left`, `top-right`, `top-center`) |
| `helperText`          | bool   | `true`              | Show inline error below fields                    |
| `shakeInput`          | bool   | `true`              | Shake animation for invalid fields                |
| `waitForDom`          | bool   | `true`              | Delay init until DOM is ready                     |
| `setNoValidate`       | bool   | `true`              | Disable native browser validation                 |
| `autoSubmit`          | bool   | `true`              | Auto submit form if valid                         |
| `initSteps`           | bool   | `false`             | Enable step/wizard mode                           |
| `debug`               | bool   | `false`             | Enable console logging                            |
| `language`            | string | `'en'`              | Language key from `messages`                      |
| `theme`               | string | `'beast'`           | `beast`, `bootstrap`, or `none`                   |
| `errorSummaryTarget`  | string | `null`              | CSS selector for error summary                    |
| `onInit`              | func   | `null`              | Callback after init                               |
| `onFail`              | func   | `null`              | Callback with invalid fields                      |
| `onSuccess`           | func   | `null`              | Callback on valid form                            |

---

## 📌 Supported `data-*` Attributes

| Attribute              | Example              | Description                                  |
|------------------------|----------------------|----------------------------------------------|
| `data-min`             | `2`                  | Min checkboxes or min value                  |
| `data-max`             | `6`                  | Max numeric value                            |
| `data-sleep`           | `1.5`                | Delay in seconds                             |
| `data-match`           | `password`           | Match field name                             |
| `data-validator`       | `checkUsername`      | Custom validator name                        |
| `data-error-message`   | `Field required`     | Override default message                     |
| `data-error-container` | `#myErrorBox`        | Place error message in custom container      |

## 📌 Supported Attributes

| Attribute              | Example              | Description                                  |
|------------------------|----------------------|----------------------------------------------|
| `pattern`              | `[A-Z]{2}`           | Custom regex format                          |
| `minlength`            | `6`                  | Min charaters in form                        |
| `maxlength`            | `2`                  | Max characters in form                       |


---

## 🧭 Step Wizard

Enable multi-step flow with `initSteps: true`. Sections are shown via `data-step`.

Add `[data-next]` and `[data-prev]` buttons to control flow. Enable with `initSteps: true`.

Wrap form sections with `data-step="1"`, `data-step="2"`, etc. Use:


### HTML
```html
<section data-step="1">
  <p>Step 1</p>
  <input type="email" name="email" required>
  <button type="button" data-next>Next</button>
</section>
<section data-step="2" data-validate="all">
  <p>Step 2</p>
  <input type="text" name="name" required>
  <button type="button" data-prev>Back</button>
  <button type="button" data-next>Submit</button>
</section>
<section data-step="3">
  <p>Step 3 / Thank you</p>
</section>
```

### JavaScript

```js
validator.nextStep();
validator.prevStep();
```

---

## 🎨 Styling

Add your own styles or override defaults:

```css
.beast-tooltip {
  background: #f44336;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
}
.beast-error-msg {
  color: red;
  font-size: 0.85em;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.shake { animation: shake 0.3s ease-in-out; }
```

---

## 📚 Public API

```js
const validator = new BeastValidator('form');

// Validate the whole form
validator.validate();

// Validate a single field
validator.validateField(document.querySelector('[name="email"]'));

// Control step wizard
validator.nextStep();
validator.prevStep();

// Reset form
validator.reset();

// Add custom validator
validator.addValidator('checkUsername', async (field) => {
  return field.value === 'admin' ? 'Username taken' : true;
});

// Extend language support
setMessages(lang, messages)
```

---

## ✅ Roadmap

- [x] Custom tooltips
- [x] Step-by-step wizard
- [x] Pattern and length validation
- [x] Custom error containers and messages
- [x] Multilingual support
- [x] Shake animation
- [x] Error summary rendering
- [ ] TypeScript types
- [ ] Accessibility improvements

---

## 🤝 Contributing

We love contributions!

1. Fork the repo
2. Create a new branch
3. Write clean vanilla JS
4. Submit a PR 🚀

```bash
git clone https://github.com/hollodk/beast-validator.git
```

---

## 🌍 Browser Support

- ✅ Chrome, Firefox, Safari, Edge, Opera
- ❌ Internet Explorer not supported

---

## 📄 License

MIT — Free for personal & commercial use

---

## 👨‍💻 Author

Made with 💛 by [@hollodk](https://github.com/hollodk)
🔗 [Demo](https://hollodk.github.io/beast-validator/)
📁 [Repository](https://github.com/hollodk/beast-validator)
