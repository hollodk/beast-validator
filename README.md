# 🧠 BeastFormValidator

**BeastFormValidator** is a lightweight, extensible JavaScript form validator with zero dependencies.

It works on all `<input>`, `<textarea>`, and `<select>` fields and supports advanced validation logic using native HTML5 attributes (`required`) and `data-*` attributes for additional control.

---

## 🚀 Features

- ✅ Validates all `input`, `textarea`, and `select` elements
- 📌 Built-in logic for:
  - `required` fields
  - **Radio button groups** (only one error per group)
  - **Checkbox groups** with `data-min` selection logic
  - Pattern matching via `data-pattern`
- 🧠 Automatically injects error messages either:
  - Directly after the field
  - Or inside a custom container using `data-error-container`
- 🎨 Uses a consistent CSS class: `.beast-error-msg`
- 🔁 Clears all existing errors before each validation
- 📦 No external libraries required

---

## 📦 Installation

Just include the JavaScript class in your project and instantiate it on any form:

```js
const form = document.querySelector('#myForm');
new BeastFormValidator(form);
