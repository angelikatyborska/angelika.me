---
title: Providing custom error messages for built-in HTML5 form validation
excerpt: Did you know that you can change the error messages displayed by the browser when using HTML5 form validation features?
tags: [HTML, JavaScript]
date: 2020-02-01 16:53:00 +0100
---

Let's say we have a form with a required input, like this:

```html
<form>
  <label>Name</label>
  <input type="text" name="name" required />
  <button type="submit">Submit</submit>
</form>
```

If you try to submit such a form without filling out the required field, you would be stopped by the browser with an error message, like this: 
<figure>
{% img posts/custom-error-messages-for-html5-form-validation/please-fill-out-this-field.gif alt:''%}
<figcaption>A required input with built-in validation has a generic "Please fill out this field" error message in Firefox.</figcaption>
</figure>

That's a very generic message. It has different text and different look between different browsers. It will be in the language of the user's system or browser, not the language of your website.

For those reasons, you might want to change those error messages. And you can!

## How to customize built-in form validation error messages

1. Grab the input element(s) with a `querySelector`/`querySelectorAll`.
2. Add an event listener for the [`invalid` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/invalid_event).
    1. When handling the event, under `event.target.validity`, you'll get the [validity state](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) of the input. For example, for a required input that was not filled out, `event.target.validity.valueMissing` will be `true`.
    2. You can call [`setCustomValidity`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity) on the input element to provide a custom error message.
3. Add an event listener for the `change` event to reset the custom error when the input value changes.

### Example code

See this [GitHub gist for a full `index.html` file](https://gist.github.com/angelikatyborska/d6dc425700d9c0d53c5fd19ed1683e31).

```javascript
const input = document.querySelector('input[name="name"');

input.addEventListener('invalid', function (event) {
  if (event.target.validity.valueMissing) {
    event.target.setCustomValidity('Please tell us how we should address you.');
  }
})

input.addEventListener('change', function (event) {
  event.target.setCustomValidity('');
})
```

On line 4, there's no need to check if the input is required because `event.target.validity.valueMissing` is only going to be set to `true` for required inputs.

Explicitly resetting custom validity to an empty string when the input value changes is necessary. Without it, if a mistake has been made once, you wouldn't be able to submit the form at all.

<figure>
{% img posts/custom-error-messages-for-html5-form-validation/please-tell-us-how-we-should-address-you.gif alt:''%}
<figcaption>A required input with built-in validation with a custom "Please tell us how we should address you" error message.</figcaption>
</figure>

### Validity state

The `event.target.validity` object looks like this:
```javascript
{
  valueMissing: true,
  typeMismatch: false,
  patternMismatch: false,
  tooLong: false,
  tooShort: false,
  rangeUnderflow: false,
  rangeOverflow: false,
  stepMismatch: false,
  badInput: false,
  customError: false
}
```

Check out the [MDN docs about `ValidityState`](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) to learn how the keys in `event.target.validity` map to specific validation features.
