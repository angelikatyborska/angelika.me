---
title: 5 bugs that HTML validation caught for me
excerpt: Are you running your website through an HTML validator? No? Here's a list of 5 bugs that HTML validation caught for me before I released them to production.
tags: [HTML]
date: 2023-09-15 17:18:00 +0200
---

Browsers are extremely forgiving when it comes to invalid HTML. As a result, most web developers don't bother with validating the HTML that they write. **Don't lie to me. I know you don't. I have run your website's source through a validator 👀**.

The traditional way of validating HTML is to pass the URL of your website or copy-paste its source directly into the [W3C HTML validator](https://validator.w3.org/nu/). This is not convenient. It's manual, slow, and nobody will remember to do it for every pull request.

That's why I wrote an [Elixir library that provides ExUnit assertions for HTML validation](https://github.com/angelikatyborska/vnu-elixir/). If the HTML produced by my Phoenix Controller action is invalid, the unit test will fail. It's automatic, fast, and I only need to remember to write the right test assertion once 🚀.

In this post, I want to share with you the types of HTML bugs that I managed to catch with HTML validation, to convince you to give HTML validation a try. Note that I am not claiming that those kinds of bugs are always caused by invalid HTML, only that that was the case for me.

## 1. Styling ends unexpectedly

[Demo on CodePen](https://codepen.io/angelikatyborska/pen/BavRVZL).

Given the markup below, you might expect all three phrases, "Text before a list", "List item", and "Text after a list" to be styled with red text.

```html
<style>
  p { color: #dd0000; }
</style>

<p>
  Text before a list. 

  <ul>
    <li>List item.</li>
  </ul>

  Text after a list.
</p>
```

In reality, only the first phrase is red.

<figure>
<a href='{% asset posts/5-bugs-caused-by-invalid-html/styling-ends-unexpectedly @path %}'>
{% asset posts/5-bugs-caused-by-invalid-html/styling-ends-unexpectedly alt='Expectations: All text is red. Reality: text before a list is red, all the other text is black.'%}
</a>
<figcaption>We wanted all the text to be red. It's not.</figcaption>
</figure>

### HTML validation error

> No `p` element in scope but a `p` end tag seen
> 
> <code>r a list.↩<mark>&lt;/p></mark>↩&lt;/bod</code>

List elements cannot be nested inside paragraphs. Opening a list element implicitly closes the paragraph, which in turn causes our explicit `</p>` closing tag to be invalid. To achieve the expected result, we would need to wrap the first and last phrase in their own paragraphs, and also apply the text color style to the list.

## 2. Clicking on a label selects the wrong input

[Demo on CodePen](https://codepen.io/angelikatyborska/pen/wvRdxgm).

When a label is correctly assigned to an input, clicking the label should select that input. Sometimes, we copy-paste some markup and forget to update all the necessary attributes, leading to something like this:

```html
<fieldset>
  <legend>Select T-Shirt color:</legend>

  <div>
    <input type="radio" id="color" name="color" value="red">
    <label for="color">Red</label>
  </div>

  <div>
    <input type="radio" id="color" name="color" value="blue">
    <label for="color">Blue</label>
  </div>
</fieldset>
```

<figure>
<a href='{% asset posts/5-bugs-caused-by-invalid-html/clicking-on-label-selects-wrong-input.gif @path %}'>
{% asset posts/5-bugs-caused-by-invalid-html/clicking-on-label-selects-wrong-input.gif alt='Expectations: clicking a radio input's label selects that radio input. Reality: clicking a radio input's label selects another radio input.'%}
</a>
<figcaption>Clicking the "blue" label selects the "red" option. Oops!</figcaption>
</figure>

### HTML validation error

> Duplicate ID `color`
> 
> <code>&lt;div>↩    <mark>&lt;input type="radio" id="color" name="color" value="blue"></mark>↩</code>
>
> The first occurrence of ID `color` was here
> 
> <code>&lt;div>↩    <mark>&lt;input type="radio" id="color" name="color" value="red"></mark>↩</code>

All `id`s in a document must be unique. When a label's `for` attribute refers to a non-unique `id`, clicking the label will select the first occurrence of an input with that id.

## 3. Autocomplete does not work

[Demo on CodePen](https://codepen.io/angelikatyborska/pen/yLGXodV).

Autocomplete is very convenient for filling out long forms. But it's easy to get it wrong - there are a lot of possible values for the `autocomplete` attribute. Can you spot what's wrong with the one below? 

```html
<div>
  <label for="user-fn">Vorname</label>
  <input
    id="user-fn"
    name="name[first]"
    type="text"
    autocomplete="first-name"
  >
</div>
```

<figure>
<a href='{% asset posts/5-bugs-caused-by-invalid-html/autocomplete-does-not-work.gif @path %}'>
{% asset posts/5-bugs-caused-by-invalid-html/autocomplete-does-not-work.gif alt="Expectations: focusing a first name input triggers my password manager's personal data autocomplete. Reality: focusing a first name input does not offer any kind of autocomplete." %}
</a>
<figcaption>My password manager helps me fill out my personal data fast even when the browser doesn't have any data saved for autocomplete. Except when the input wasn't correctly marked to be autocompleted with a "given name".</figcaption>
</figure>

### HTML validation error

> Bad value `first-name` for attribute `autocomplete` on element `input`: The string `first-name` is not a valid autofill field name
> 
> <code>/label>↩  <mark>&lt;input id="user-fn" name="name[first]" type="text" autocomplete="first-name"></mark>↩&lt;/div</code>

The correct `autocomplete` value would be `given-name`. Similarly, it's not `last-name`, but `family-name`. I never remember that!

## 4. Images are gibberish to screen reader users

[Demo on CodePen](https://codepen.io/angelikatyborska/pen/abPWjKN).

An innocent little image. Or is it?

```html
<img
  width="500"
  height="373"
  src="https://angelika.me/assets/posts/blend-mode-in-css/my-bounding-box-89443a5b911b743881cde37a81f7ba63cb6cd59b8b92b5e96c61b29f888158b7.png"
>
```

Not for screen reader users. For them, it's _my bounding box eighty-nine thousand four hundred forty-three A five B nine hundred eleven B seven hundred forty-three thousand eight hundred eighty-one C D E thirty-seven A eighty-one F seven B A sixty-three C D fifty-nine B eight B ninety-two B five E sixty-nine C sixty-one B twenty-nine F eight hundred eighty-eight thousand one hundred fifty-eight B seven image_.

<figure>
<a href='{% asset posts/5-bugs-caused-by-invalid-html/images-are-gibberish-to-screen-reader-users.gif @path %}'>
{% asset posts/5-bugs-caused-by-invalid-html/images-are-gibberish-to-screen-reader-users.gif alt='Expectations: a screen reader announces an image of a cat with a caption. Reality: a screen reader reads out loud the image file name, which is a bunch of random characters.'%}
</a>
<figcaption>A screen reader announcing the same image twice: once with alt text, and once without it. I paused the recording before it finished reading the long file name.</figcaption>
</figure>

### HTML validation error

> An `img` element must have an `alt` attribute, except under certain conditions. For details, <a href="https://www.w3.org/WAI/tutorials/images/">consult guidance on providing text alternatives for images</a>
> 
> <code>d>↩&lt;body>↩<mark>&lt;img width="500" height="373" src="https://angelika.me/assets/posts/blend-mode-in-css/my-bounding-box-89443a5b911b743881cde37a81f7ba63cb6cd59b8b92b5e96c61b29f888158b7.png"></mark>↩&lt;/bod</code>

Every image tag needs to have an alternative text that will be displayed or spoken when the image cannot be visually perceived by the user (when using a text-based browser, a screen reader, or even in case of network errors, or users blocking remote content in emails).

When alt text is not provided, the file name is used instead. Often, the file name is autogenerated gibberish, producing a terrible experience.

Make sure the alt text briefly and accurately describes the image in the current context, or hide it completely if it's purely decorative by providing empty alt text.

## 5. List not announced by screen readers

[Demo on CodePen](https://codepen.io/angelikatyborska/pen/yLGXzZK).

When a screen reader announces a list, it also announces its length, for example "list, 5 items". This is useful information to screen reader users because it helps them know how much content to expect in the list. In the below scenario, the list will not be announced, nor its length.

```html
<div class="tabs">
  <div role="tablist" aria-label="Sample Tabs">
    <button
      role="tab"
      aria-selected="true"
      aria-controls="panel-1"
      id="tab-1"
      tabindex="0">
      First Tab
    </button>
    <!-- some code omitted -->
  </div>

  <ul id="panel-1" role="tabpanel" tabindex="0" aria-labelledby="tab-1">
    <li>Content for the first panel</li>
  </ul>
  <!-- csome code omitted -->
</div>
```

<figure>
<a href='{% asset posts/5-bugs-caused-by-invalid-html/list-not-announced-by-screen-readers.gif @path %}'>
{% asset posts/5-bugs-caused-by-invalid-html/list-not-announced-by-screen-readers.gif alt='Expectations: a screen reader announces a list with one item inside of a tab panel. Reality: the list is not announced because it was given the role of a tabpanel, which overrides its list role.'%}
</a>
<figcaption>A screen reader announcing the same list twice: once when the list is inside of a tabpanel, and once when the list is the tabpanel. In the second scenario, the list and its length are not announced.</figcaption>
</figure>

### HTML validation error

> Bad value `tabpanel` for attribute `role` on element `ul`
> 
> <code>&lt;/div>↩  <mark>&lt;ul id="panel-1" role="tabpanel" tabindex="0" aria-labelledby="tab-1"></mark>↩</code>

The mistake, in this case, was applying the `tabpanel` role directly on the list. The correct implementation would be to wrap the list with an extra `div` and give that `div` the `tabpanel` role and the other related attributes.
