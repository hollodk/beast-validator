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

---

## ✨ Supported Attributes

| Attribute               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `required`              | Standard HTML5 required attribute                                           |
| `data-error-container`  | ID of an element where the error message will be inserted                  |
| `data-pattern`          | Regex string (without slashes) to validate against                         |
| `data-min`              | For checkboxes: minimum number that must be checked (uses `name` to group) |

You can use these attributes directly on your form fields to control how validation behaves. No additional configuration is needed — just decorate your HTML elements and let the validator handle the rest.

---

## 🧪 Example Usage

### HTML Form

```html
<form id="myForm">
  <label>
    Name:
    <input type="text" name="name" required data-error-container="nameErrorBox">
  </label>
  <div id="nameErrorBox"></div>

  <label>
    Email:
    <input type="text" name="email" required data-pattern="^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" data-error-container="emailErrorBox">
  </label>
  <div id="emailErrorBox"></div>

  <fieldset>
    <legend>Gender</legend>
    <input type="radio" name="gender" value="male" required>
    <input type="radio" name="gender" value="female">
    <div id="genderErrorBox"></div>
  </fieldset>

  <fieldset>
    <legend>Interests (select at least 2)</legend>
    <input type="checkbox" name="interests" value="sports" data-min="2" required>
    <input type="checkbox" name="interests" value="music" required>
    <input type="checkbox" name="interests" value="travel" required>
    <div id="interestsErrorBox"></div>
  </fieldset>

  <button type="submit">Submit</button>
</form>

---

### JavaScript

```js
const form = document.querySelector('#myForm');
new BeastFormValidator(form);

---

## 🎨 Styling Errors

BeastFormValidator displays error messages using the CSS class `.beast-error-msg`. You can customize this class in your stylesheet to match your branding or user interface.

### Default CSS example:

```css
.beast-error-msg {
  color: red;
  font-size: 0.85em;
  margin-top: 4px;
}

---

## 🔧 Extendability Ideas

BeastFormValidator is built to be easily extendable and customizable.

Here are some ideas for how you might enhance the core functionality to fit more advanced use cases:

- **Custom data types**  
  Add support for `data-type="email"`, `"number"`, `"url"`, etc. for specialized format validation.

- **Length validation**  
  Use `data-minlength` and `data-maxlength` for character limits on text inputs and textareas.

- **Range validation**  
  Add `data-min` and `data-max` attributes for numeric or date inputs.

- **Live validation**  
  Trigger validation on `input`, `change`, or `blur` events for real-time feedback rather than just on submit.

- **Custom error messages**  
  Support `data-error-message` to let users override the default "This field is required" text.

- **Multilingual support**  
  Integrate language packs or dynamic translations for internationalized error messaging.

- **Scroll to first error**  
  Automatically scroll the page to the first invalid field on submit.

- **Plugin architecture**  
  Allow validators to be registered dynamically, enabling enterprise-level validation extensions.

- **Field dependencies**  
  Implement conditional validation based on the values of other fields (e.g., only required if another checkbox is checked).

---

## ✅ Test Checklist

Before launching, make sure to test the following scenarios to ensure full coverage:

- [x] Required text fields
- [x] Required `<textarea>` fields
- [x] Required `<select>` dropdowns
- [x] Single checkbox validation
- [x] Checkbox groups using `data-min`
- [x] Radio button groups with single error handling
- [x] Pattern validation via `data-pattern`
- [x] File inputs with `required`
- [x] Custom error container placement via `data-error-container`
- [x] Ignoring hidden or disabled fields automatically

---

## 📄 License

This project is licensed under the **MIT License**.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software in both private and commercial projects.

---

## 🙌 Contributing

Contributions are welcome and appreciated!

### Ways to contribute:

- 🐞 Report bugs or issues via [GitHub Issues](https://github.com/your-username/beastformvalidator/issues)
- 💡 Suggest new features or improvements
- 🤝 Submit a pull request with enhancements
- 🌍 Share the project with others who might find it useful

Let's build better, more user-friendly forms — together.

---

## 🌐 Live Demo

Coming soon: [https://your-demo-url.com](https://your-demo-url.com)

Want to contribute a CodePen, JSFiddle, or full demo site? Open a PR and let’s make it easier for others to try it out instantly!

---
