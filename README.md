# 🐾 BeastValidator

> A flexible, lightweight JavaScript form validator with no dependencies.
>
> 🔗 **[Live Demo](https://hollodk.github.io/beast-validator/)**
> 📁 **[GitHub Repository](https://github.com/hollodk/beast-validator)**

BeastValidator helps validate HTML forms with native semantics (`required`, `type="email"`, `pattern`, etc.), while enhancing UX through tooltips, helper messages, shake animations, and scroll-to-error functionality.

---

## ✨ Features

- ✅ Validates required inputs, selects, checkboxes, and radios
- 📬 Built-in email format checker
- 🎯 Custom pattern matching via `data-pattern`
- 🧠 Tooltips and inline error messages
- 🔄 Realtime validation on input/change
- 💥 Shake animation on error
- ⬇️ Scrolls and focuses the first invalid field
- 🧩 `onFail` callback returns all failed fields
- 💡 Zero dependencies — pure JS!

---

## 🚀 Installation

### Option 1: CDN (Fastest)

```html
<script src="https://hollodk.github.io/beast-validator/beast-validator.js"></script>
<link rel="stylesheet" href="https://hollodk.github.io/beast-validator/beast-validator.css">
```

---

### Option 2: NPM (For modern JavaScript projects)

```bash
npm install beastvalidator
```

```js
import BeastValidator from 'beastvalidator';
```

> 🔗 NPM package: [https://www.npmjs.com/package/beastvalidator](https://www.npmjs.com/package/beastvalidator)

---

### Option 3: Composer / Packagist (For PHP-based projects)

```bash
composer require hollodk/beastvalidator
```

> 🔗 Packagist package: [https://packagist.org/packages/hollodk/beastvalidator](https://packagist.org/packages/hollodk/beastvalidator)

---

### Option 4: Manual Download

```bash
git clone https://github.com/hollodk/beast-validator.git
```

Include the files manually:

```html
<script src="/your-path/beast-validator.js"></script>
<link rel="stylesheet" href="/your-path/beast-validator.css">
```

---

## 🧪 Usage Example

### Sample Form Markup

```html
<form id="myForm">
  <label>Email</label>
  <input type="email" name="email" required>

  <label>Choose a value</label>
  <select name="choice" required>
    <option value="">-- Select --</option>
    <option value="1">One</option>
    <option value="2">Two</option>
  </select>

  <label>
    <input type="checkbox" name="terms" required>
    I agree to the terms
  </label>

  <button type="submit">Submit</button>
</form>
```

### Initialization

```js
new BeastValidator('myForm', {
  tooltips: true,
  shakeInput: true,
  focusFirst: true,
  onFail: (fields) => {
    console.warn('Validation failed for:', fields);
  }
});
```
---

## ⚙️ Options

```js
{
  errorContainerClass: 'beast-error-msg',  // Class used for inline error display
  tooltipClass: 'beast-tooltip',           // Class used for floating tooltips
  focusFirst: true,                        // Automatically scroll to first error
  validateOnChange: true,                  // Trigger validation on input/change
  tooltips: true,                          // Enable tooltip messages
  helperText: true,                        // Show error message below field
  shakeInput: true,                        // Apply shake animation on error
  onFail: (fields) => {}                   // Callback with array of invalid fields
}
```
---

## 🧷 Supported `data-` Attributes

| Attribute              | Usage Example                          | Description                                      |
|------------------------|----------------------------------------|--------------------------------------------------|
| `data-pattern`         | `data-pattern="^[A-Z]{2}$"`            | Regex pattern for custom validation              |
| `data-min`             | `data-min="2"`                         | Minimum checkboxes selected in a group           |
| `data-error` _(todo)_  | `data-error="Your name is required"`   | Custom error message for the field _(planned)_   |
| `data-error-container` | `data-error-container="customId"`      | Custom element to display error message          |

These attributes extend native validation without writing JS logic.

---

## ✅ Validation Rules

BeastValidator respects and extends:

- `required`: Fields must not be empty
- `type="email"`: Built-in email validation
- `data-pattern`: Validates against custom RegEx
- `data-min`: Applies to checkbox groups
- `radio` buttons: Automatically grouped by `name` and validated

---

## 🎨 Styling

Customize or override styles easily with CSS.

### Tooltip

```css
.beast-tooltip {
  background-color: #f44336;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  position: absolute;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transform: translateY(-5px);
  transition: opacity 0.2s ease-in-out;
}
```

### Inline Error

```css
.beast-error-msg {
  color: red;
  text-decoration: underline;
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
  animation: shake 0.5s ease-in-out;
}
```

---

## 🧩 Extendability

Hook into failed validations with `onFail`:

```js
new BeastValidator('myForm', {
  onFail: (invalidFields) => {
    alert(`You must fix ${invalidFields.length} fields.`);
  }
});
```

You can also manually call `validateField(field)` or `validate()` if needed.

---

## 🔭 Planned Features

- [x] Scroll to first invalid field
- [x] `data-error-container` for custom error placement
- [ ] `data-error` for per-field messages
- [ ] Visual success indicators
- [ ] Async/remote validation (e.g. unique email)
- [ ] TypeScript types
- [x] NPM + Composer package
- [ ] `reset()` method to clear validation state

---

## 🤝 Contributing

We welcome contributions!

```bash
# Clone and work locally
git clone https://github.com/hollodk/beast-validator.git
```

1. Fork this repo
2. Create a feature branch
3. Follow the simple architecture (vanilla JS)
4. Submit a pull request

Please keep dependencies at zero.

---

## 🌐 Browser Support

BeastValidator supports all modern browsers:

- ✅ Chrome, Edge, Firefox, Safari, Brave, Opera
- ⚠️ IE not supported

---

## 📄 License

MIT License — Free for personal and commercial use.

---

## 🙌 Author

Made with 💛 by [@hollodk](https://github.com/hollodk)
🔗 Demo: [https://hollodk.github.io/beast-validator/](https://hollodk.github.io/beast-validator/)
📁 Repo: [https://github.com/hollodk/beast-validator](https://github.com/hollodk/beast-validator)

