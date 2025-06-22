# 🐾 BeastValidator

> A flexible, no-dependency JavaScript form validator built for modern forms with great UX.
>
> 🔗 **[Live Demo](https://hollodk.github.io/beast-validator/)**
> 📁 **[GitHub Repository](https://github.com/hollodk/beast-validator)**

---

## ✨ Features

- ✅ Validates required inputs, selects, checkboxes, radios
- 📧 Built-in email format validation
- 🔤 Pattern matching via `data-pattern`
- 🧠 Inline errors & tooltips
- 🔁 Real-time validation (`input`/`change`)
- 🫨 Shake animation for invalid fields
- ⬇️ Scrolls to and focuses first invalid field
- 🧩 `onFail`, `onSuccess`, `onInit` callbacks
- ⏳ Delayed validation with `data-sleep`
- 🧪 Async field validation (simulated)
- 🪄 Step wizard support (`initSteps`, `nextStep`, `prevStep`)
- ⚙️ Auto submit (`autoSubmit`)
- 💡 Min/Max length validation via `minlength` and `maxlength`
- 🤝 Match another field with `data-match`
- 🧩 Custom validators via `data-validator`
- 🧹 `reset()` method to clear dirty state and errors
- 📦 Zero dependencies

---

## 🚀 Installation

### ✅ CDN

```html
<script src="https://hollodk.github.io/beast-validator/beast-validator.js"></script>
<link rel="stylesheet" href="https://hollodk.github.io/beast-validator/beast-validator.css">
```

---

### 📦 NPM

```bash
npm install beastvalidator
```

```js
import BeastValidator from 'beastvalidator';
```

🔗 [NPM Package](https://www.npmjs.com/package/beastvalidator)

---

### 🐘 Composer (for PHP-based projects)

```bash
composer require hollodk/beastvalidator
```

🔗 [Packagist Package](https://packagist.org/packages/hollodk/beastvalidator)

---

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

### ✅ Sample Form

```html
<form id="myForm">
  <label>Email</label>
  <input type="email" name="email" required>

  <label>Password</label>
  <input type="password" name="password" required minlength="6" maxlength="20">

  <label>Confirm Password</label>
  <input type="password" name="confirm" required data-match="password">

  <label>Country Code</label>
  <input type="text" name="country" data-pattern="^[A-Z]{2}$" required>

  <label>
    <input type="checkbox" name="terms" required>
    Accept Terms
  </label>

  <button type="submit">Submit</button>
</form>
```

---

### 🚀 Initialize Validator

```js
new BeastValidator('myForm', {
  tooltips: 'top-center',
  shakeInput: true,
  focusFirst: true,
  autoSubmit: false,
  debug: true,
  initSteps: false,
  onInit: () => console.log('BeastValidator initialized'),
  onFail: (fields) => console.warn('Validation failed:', fields),
  onSuccess: () => alert('Form is valid!')
});
```

---

## ⚙️ Options

| Option                | Type   | Default               | Description                                      |
|------------------------|--------|------------------------|--------------------------------------------------|
| `errorContainerClass` | string | `'beast-error-msg'`    | Class name for inline errors                     |
| `tooltipClass`        | string | `'beast-tooltip'`      | Class name for tooltips                          |
| `focusFirst`          | bool   | `true`                 | Scroll to first invalid field                    |
| `validateOnChange`    | bool   | `true`                 | Validate on input/change                         |
| `tooltips`            | string | `'none'`               | Accept `none`, `top-left`, `top-center`, `top-right` |
| `helperText`          | bool   | `true`                 | Show error message below field                   |
| `shakeInput`          | bool   | `true`                 | Shake animation on invalid fields                |
| `waitForDom`          | bool   | `true`                 | Wait for DOM ready                               |
| `setNoValidate`       | bool   | `true`                 | Disable native browser validation                |
| `autoSubmit`          | bool   | `true`                 | Submit automatically if form is valid            |
| `initSteps`           | bool   | `false`                | Activate step wizard                             |
| `debug`               | bool   | `false`                | Console debug logs                               |
| `onInit`              | func   | `null`                 | Called when validator initializes                |
| `onFail`              | func   | `null`                 | Called with array of invalid fields              |
| `onSuccess`           | func   | `null`                 | Called on successful validation                  |

---

## 🧷 Supported `data-*` Attributes

| Attribute              | Example              | Description                                      |
|------------------------|----------------------|--------------------------------------------------|
| `data-pattern`         | `^[A-Z]{2}$`         | Custom RegEx pattern                             |
| `data-min`             | `2`                  | Minimum checkboxes selected                      |
| `data-sleep`           | `1.5`                | Delay before validation (in seconds)             |
| `data-match`           | `password`           | Match another field value                        |
| `data-validator`       | `checkUsername`      | Custom validator callback                        |
| `data-error-message`   | `Your name is required` | Custom error message                           |
| `data-error-container` | `myErrorBox`         | Custom container for inline message              |

---

## 🧭 Step Wizard

Enable multi-step flow with `initSteps: true`. Sections are shown via `data-step`.

### HTML Example

```html
<section data-step="1">Step 1</section>
<section data-step="2">Step 2</section>
```

### JavaScript

```js
validator.nextStep();
validator.prevStep();
```

---

## 🎨 Styling

### Tooltip

```css
.beast-tooltip {
  background: #f44336;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
```

### Inline Error

```css
.beast-error-msg {
  color: red;
  font-size: 0.85em;
  margin-top: 5px;
}
```

### Shake Animation

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.shake {
  animation: shake 0.3s ease-in-out;
}
```

---

## 🔧 Manual API

```js
const validator = new BeastValidator('myForm');

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
  if (field.value === 'admin') return 'Username taken';
  return true;
});
```

---

## 📌 Roadmap

- [x] Scroll-to-first-invalid-field
- [x] Custom error containers
- [x] `data-error-message`
- [x] Async field validation (simulated)
- [x] Step-by-step wizard
- [x] CDN / NPM / Composer support
- [x] Visual success indicators
- [x] `reset()` method
- [x] Localization & i18n
- [ ] TypeScript types
- [ ] Error summary container

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
