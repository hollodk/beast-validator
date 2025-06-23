# 🐾 BeastValidator

![npm](https://img.shields.io/npm/v/beastvalidator)
![minified size](https://img.shields.io/bundlephobia/min/beastvalidator)
![gzip size](https://img.shields.io/bundlephobia/minzip/beastvalidator)
![license](https://img.shields.io/npm/l/beastvalidator)
![GitHub last commit](https://img.shields.io/github/last-commit/hollodk/beast-validator)

> A flexible, no-dependency JavaScript form validator built for modern forms with great UX.
>
> 🔗 **[Live Demo](https://hollodk.github.io/beast-validator/)**
> 📁 **[GitHub Repository](https://github.com/hollodk/beast-validator)**

BeastValidator is built for developers who want clean, dependency-free form validation with a great user experience. Unlike bulky frameworks or config-heavy libraries, BeastValidator works directly with native HTML5 attributes and gives you full control — perfect for landing pages, modals, or dynamic UIs.

---

## ✨ Features

- ✅ Validates required inputs, selects, checkboxes, radios
- 📧 Built-in email format validation
- 🔤 Pattern matching via `pattern`
- 📏 Min/max numeric range support via `data-min` / `data-max`
- 💡 Min/Max length validation via `minlength` and `maxlength`
- 🎂 Age range validation via `data-min-age` and `data-max-age`
- 🤝 Match another field with `data-match`
- 🔐 Password strength enforcement via `data-password-strength="weak|medium|strong"`
- 🔁 Real-time validation (`input`/`change`)
- 🫨 Shake animation for invalid fields
- ⬇️ Scrolls to and focuses first invalid field
- 📡 Optional API submission via `submitTo`
- 🧩 `onFail`, `onSuccess`, `onInit` callbacks
- 🧩 onSuccess(json) gives you a clean JSON object of all form values based on name=""
- 💬 Tooltip support in multiple positions
- 🌍 Multilingual error messages (EN, DA, DE, Pirate)
- ⏳ Delayed validation with `data-sleep`
- 🧪 Async field validation
- 🧩 Step wizard support (`initSteps`, `data-step`, `nextStep`, `prevStep`)
- ⌨️ Enter key triggers step validation and navigation automatically
- 🔄 data-next buttons automatically show "Validating..." and become disabled during step validation or Enter key press
- 🧠 Custom validators via `data-validator`
- 🧩 Error summary with clickable links
- 🔄 Reset method to clear all dirty states and visuals
- ⚙️ Auto-submit toggle
- 🧱 Theme support: `beast`, `bootstrap`, `none`
- 📦 Zero dependencies

---

## 🚦 Quick Start (in 3 steps)

1. **Add your form**
```html
<form id="myForm">
  <input name="email" type="email" required>
  <button>Submit</button>
</form>
```

2. **Initialize BeastValidator**
```js
new BeastValidator('myForm', {
  onSuccess: (json) => console.log(json)
});
```

3. **Enjoy automatic validation!**

---

## 🚀 Installation

### ✅ CDN

```html
<script src="https://cdn.jsdelivr.net/npm/beastvalidator/dist/validate.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/beastvalidator/dist/style.min.css">
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
<script src="/your-path/dist/validate.umd.js"></script>
<link rel="stylesheet" href="/your-path/dist/style.css">
```

### 📦 Module Mapping (for bundlers and CDNs)

If you're using a bundler, `import BeastValidator from 'beastvalidator'` will automatically resolve to the correct ESM build thanks to these fields in `package.json`:

```json
{
  "main": "dist/validate.umd.js",
  "module": "dist/validate.esm.js",
  "unpkg": "dist/validate.min.js",
  "jsdelivr": "dist/validate.min.js"
}
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
  <input type="date" name="birthdate" data-min-age="18" data-max-age="99" required>
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
  onSuccess: (data) => alert('Form successful'),
});
```

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

## 📡 API Submission (Optional)

You can use `submitTo` to automatically post the validated form data to an API endpoint, without writing your own fetch logic.

```js
new BeastValidator('myForm', {
  submitTo: {
    url: 'https://api.example.com/form',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    onResponse(response) {
      console.log('[onResponse]', response);
      alert('🎉 Submission successful!');
      // You can redirect or update the UI here
    },
    onError(error) {
      console.warn('[onError]', error);
      alert('❌ Something went wrong. Please try again.');
      // You can re-enable a button or show server-side messages
    },
  },
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
| `submitTo`            | object | `null`              | Automatically submit to an API endpoint { url, method, headers, debug } |

---

## 📌 Supported `data-*` Attributes

| Attribute                | Example              | Description                                  |
|--------------------------|----------------------|----------------------------------------------|
| `data-min`               | `2`                  | Min checkboxes or min value                  |
| `data-max`               | `6`                  | Max numeric value                            |
| `data-min-age`           | `18`                 | Minimum age in years                         |
| `data-max-age`           | `100`                | Maximum age in years                         |
| `data-password-strength` | `strong`             | Enforce password complexity (`weak`, `medium`, `strong`) |
| `data-sleep`             | `1.5`                | Delay in seconds                             |
| `data-match`             | `password`           | Match field name                             |
| `data-validator`         | `checkUsername`      | Custom validator name                        |
| `data-error-message`     | `Field required`     | Override default message                     |
| `data-error-container`   | `#myErrorBox`        | Place error message in custom container      |

## 📌 Supported Attributes

| Attribute              | Example              | Description                                  |
|------------------------|----------------------|----------------------------------------------|
| `pattern`              | `[A-Z]{2}`           | Custom regex format                          |
| `minlength`            | `6`                  | Min charaters in form                        |
| `maxlength`            | `2`                  | Max characters in form                       |


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

// Extend language support
setMessages(lang, messages)
```

### ✨ Custom Field Validator Example
```html
<input name="username" data-validator="checkUsername">
```

```js
validator.addValidator('checkUsername', async (field) => {
  const value = field.value.trim();
  if (value === 'admin') return 'Username taken';
  return true;
});
```

---

## 🌐 Custom Language Messages

```js
validator.setMessages('fr', {
  required: 'Ce champ est requis',
  email: 'Adresse e-mail invalide'
});
validator.setLanguage('fr');
```

---

## 🧩 Build Variants Overview

| File                    | Format          | Use Case                                                  |
|-------------------------|-----------------|-----------------------------------------------------------|
| `dist/validate.esm.js`  | ESM             | ✅ Modern bundlers like Vite, Webpack, Rollup, etc.       |
| `dist/validate.umd.js`  | UMD             | ✅ For inclusion via `<script>` in a browser (dev mode)   |
| `dist/validate.min.js`  | UMD (minified)  | ✅ Production-ready browser version or CDN like jsDelivr  |

---

## 🧠 When to Use Which

### 1. 🛠 Vite/Webpack/Rollup (Modern JavaScript Apps)

Use: `dist/validate.esm.js`

Why: This is an ES module (ESM) file optimized for modern JavaScript tooling. It supports tree-shaking and integrates cleanly into apps built with frameworks like React, Vue, Svelte, or Alpine.

```js
import BeastValidator from './dist/validate.esm.js';

const validator = new BeastValidator('formId', { ... });
```

- ✅ Works out-of-the-box with Vite, Webpack, Rollup, etc.
- ✅ Enables better build optimization (tree-shaking, minification)
- ✅ Recommended for app development

### 2. 🌐 Browser via &lt;script&gt; (Vanilla Sites or CMS like WordPress)

Use: `dist/validate.min.js`

Why: This is a minified UMD build that exposes BeastValidator globally via window.BeastValidator. Ideal if you're using BeastValidator directly in a browser without any build step.

```html
<link rel="stylesheet" href="style.min.css">
<script src="dist/validate.min.js"></script>
<script>
  const validator = new BeastValidator('myForm', { debug: true });
</script>
```

- ✅ No build step needed
- ✅ Ready for use in HTML pages, WordPress, Laravel Blade, etc.
- ✅ Optimized for production (small size, fast load)
- ✅ Compatible with CDN usage (jsDelivr, unpkg)

### 3. 🤓 For Debugging in Browser Without Build Tools

Use: `dist/validate.umd.js`

Why: This is the non-minified UMD build, useful for debugging or exploring how BeastValidator works in browser developer tools.

```html
<script src="dist/validate.umd.js"></script>
<script>
  const validator = new BeastValidator('myForm', { debug: true });
</script>
```

- ✅ Easier to read and debug in the browser
- 🚫 Not optimized for production (larger file size)

---

## ❓ FAQ

### How do I validate only part of the form?
Use `validateField()` or `validateCurrentStep()`.

### Can I skip auto-submission?
Yes! Set `autoSubmit: false` and handle submission in `onSuccess()`.

### Does it work in React/Vue?
Yes, if you attach BeastValidator to a raw DOM node using `ref`.

### Can I use it in modals or dynamic content?
Yes. Make sure to call `new BeastValidator()` **after** the form appears in the DOM.

### Can I use BeastValidator without defining validation in JavaScript?
Yes! One of BeastValidator’s core strengths is that it leverages native HTML5 attributes like required, pattern, minlength, maxlength, type=email, and custom data-* attributes for validation logic. You don’t need to define a separate JS config.

### Can I delay validation (e.g., to simulate an async check)?
Yes. Use the data-sleep="1" attribute to pause validation for X seconds before checking the value. Useful for async debouncing.

### How can I debug what’s happening?
Set debug: true to get verbose console logging of all key lifecycle events:

```js
new BeastValidator('myForm', { debug: true });
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
- [x] Build files in dist
- [x] Build minified version
- [x] Age filter
- [x] Password strength validator
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

---

## 📄 License

MIT — Free for personal & commercial use

---

## 👨‍💻 Author

Made with 💛 by [@hollodk](https://github.com/hollodk)
🔗 [Demo](https://hollodk.github.io/beast-validator/)
📁 [Repository](https://github.com/hollodk/beast-validator)
