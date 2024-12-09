---
title: 9 signs your frontend code has quality issues that affect your users
excerpt: Check if your project is displaying any of them.
tags: [HTML, CSS, accessibility]
date: 2024-04-13 18:47:00 +0200
---

A lot of different people write frontend code. Frontend web developers write frontend code, obviously. But so do fullstack web developers. Some web designers write frontend code too. Even backend web developers write frontend code, in certain circumstances.

This might give you the wrong impression that writing frontends must be easy because "everyone does it". If your manager is one of the people that [devalue frontend work](https://joshcollinsworth.com/blog/devaluing-frontend), you might be on a project that's lacking frontend experts.

The experiences users have with such projects are usually... mixed.

Below I've compiled a list of **9 common signs that I see in projects with poor frontend code quality**. I've focused only on issues that have a negative impact on your project's users.

All the signs can appear in your project regardless of your technology choice. Static HTML files, classic server-side rendered multipage apps with Ruby on Rails/Django/Phoenix, real-time server-side pages updated over websockets with Phoenix LiveView, SPAs with React/Vue/Angular/Svelte... doesn't matter, **you can write bad frontend code in any technology** 💩.

If you're an inexperienced frontend developer, I hope this post provides you with a list of relevant topics to learn about. If you're a backend developer or an engineering manager, I hope this post helps you develop an appreciation for what frontend developers do (so you don't have to).

## 1. Missing alt attributes

The most common of all HTML mistakes, missing alt text on images. It might seem benign on its own, but if your project has a lot if images with missing alt text, it's almost certain to have other problems as well. Why? **Missing alt texts mean that you didn't test your project with a screen reader, you didn't run an automated accessibility check of any kind, and you didn't even run an HTML validator**. All of those tools would have caught this common problem.

```html
<!-- missing alt attribute, don't do this ❌ -->
<img
  src="/assets/portrait.png"
  width="300"
  height="300"
>
```

<h3 class="no_toc">Why does this matter?</h3>

Alt text is necessary for visually impaired users to know what is on the image. It is also useful for sighted users in case the image does not load (for example due to temporary network problems), as well as for SEO.

<h3 class="no_toc">Learn more</h3>

- Read [Joshua Hardwick's "Alt Text for SEO"](https://ahrefs.com/blog/alt-text/).
- Read [Harvard's accessibility guide about alt text](https://accessibility.huit.harvard.edu/describe-content-images).
- Watch videos by blind folks explaining how they use their devices, for example, this [video comparing an accessible and an inaccessible online shop](https://www.youtube.com/watch?v=OOvXuz6ejuw).
- Find out which screen reader software is available for your operating system and learn how to use it. **This is one of the most important things you can do to really understand web accessibility**.
- Download the [WAVE browser extension](https://wave.webaim.org/extension/) and run automated checks on your website.

## 2. Clickable divs

Another sure sign that frontend expertise is lacking somewhere is attaching a click handler to an HTML element that isn't interactive by default, like a div, a span, or a list item.  

```jsx
<!-- a clickable div in React, don't do this ❌ -->
<div onClick={handleIncrement}>
  +1
</div>
```

```html
<!-- a clickable div in Phoenix LiveView, don't do this ❌ -->
<div phx-click="increment">
  +1
</div>
```

<h3 class="no_toc">Why does this matter?</h3>

Clickable divs can only be activated with [a pointing device](https://en.wikipedia.org/wiki/Pointing_device) like a mouse or a touchscreen. However not everyone is able to use a pointing device. Some people navigate exclusively with a keyboard or a special [switch](https://en.wikipedia.org/wiki/Switch_access). They won't be able to use your website.

<h3 class="no_toc">Learn more</h3>

- Read [Ben Myers's "How (Not) to Build a Button"](https://benmyers.dev/blog/clickable-divs/) to find out, why it's a bad idea to create clickable divs, what's the problem driving people to use a div instead a button, and how to solve that problem.
- Watch [Rob Dodson's "Just use button"](https://www.youtube.com/watch?v=CZGqnp06DnI) for similar information as the article above but in a video form.
- Read [WebAIM's keyboard testing shortcut reference](https://webaim.org/techniques/keyboard#testing) to learn how to test keyboard navigation on your websites.

## 3. Mixing up buttons and links

The designs we're told to implement as web developers often contain elements that look like buttons but behave like links. This can sometimes lead a developer to poorly reimplement a link's functionality with a button's click handler.

```html
<!-- don't do this ❌ -->
<button onclick="document.location.pathname='/products'">
  Discover our products
</button>
```

Or to nest a button inside a link.

```html
<!-- don't do this either ❌ -->
<a href="/products">
  <button>
    Discover our products
  </button>
</a>
```

<h3 class="no_toc">Why does this matter?</h3>

A button is not a link: it is missing a lot of important link functions. You cannot middle-click it to open in a new tab. You cannot right-click it to see the contextual menu that allows you to open it in a new window, save it as a bookmark, or copy the link's URL. Screen readers will not announce this element as a link, and they will not include it in the list of links available on the page. Browsing through all links and headings available on the page is a common way screen reader users skim web pages to find what they need.

A button nested inside a link for styling purposes is not only invalid HTML, but it doesn't work for users navigating with a keyboard. Both the link and the button can be focused separately, and the button will not do anything when activated, giving the user the impression that your website is broken.

<h3 class="no_toc">Learn more</h3>

- Read [Eric Eggert's "Buttons vs. Links"](https://yatil.net/blog/buttons-vs-links/) to find out what's the difference between a button and a link, and why it matters that you use the correct element.
- Read [Chris Coyier's "Complete Guide to Links and Buttons"](https://css-tricks.com/a-complete-guide-to-links-and-buttons/) for a comprehensive list of everything you need to know about links and buttons.

## 4. Hiding content the wrong way

There are many different HTML and CSS techniques for hiding content. Each technique has different side effects when it comes to interacting with the hidden content.

**Example 1**: custom styling of checkboxes and radio buttons. It can be achieved by hiding the input itself and styling its label with additional elements that emulate a checkbox or radio button.

Those form controls should be visually hidden, but physically present. Yet lack of awareness often leads developers to completely hide the input instead because `display: none;` was the first answer in that one Stack Overflow question that they read.

```css
/* don't do this ❌ */
.checkbox {
  display: none; 
}

.checkbox-label {
  /* some fancy styles that render a check in a box [✔] */
}
```

**Example 2**: hamburger menu content. A common requirement is for a hamburger menu to have an opening animation. You cannot animate from `display: none` to `display: block` without extra steps, so devs who don't know better choose to only visually hide the menu content instead, to make implementing the animation easier.

```css
/* don't do this ❌ */
.menu.menu--closed {
  position: absolute;
  left: -100%;
  transition: left ease 300ms;
}

.menu.menu--opened {
  left: 0;
}
```

<h3 class="no_toc">Why does this matter?</h3>

A checkbox that has been completely hidden cannot be activated by using the keyboard, even if its label is visible. Users who navigate with a keyboard only won't be able to accept your terms of service and create an account.

A hamburger menu content that has been only visually hidden will receive focus when navigating with a keyboard but remain invisible. The user will not see where the focus currently is and might activate menu items by accident, or just get frustrated and leave your website.

<h3 class="no_toc">Learn more</h3>

- Read [Sara Soueidan's "Inclusively Hiding & Styling Checkboxes and Radio Buttons"](https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/).
- Read [Kitty Giraudel's "Hiding content responsibly"](https://kittygiraudel.com/2021/02/17/hiding-content-responsibly/).

## 5. Using the title attribute

This problem is often a symptom of a lack of a proper design process. Sometimes, you need a tooltip component, but it doesn't exist in your project. Sometimes, you need to explain why an action is currently not available, but there's no room in the existing UI to add that explanation. If you lack the design skills to do it the right way, you might reach out for the `title` attribute.

```html
<!-- don't do this ❌ -->
<button
  type="submit"
  title="Report account"
>
  <i class="fa-solid fa-flag" />
</button>
```

<h3 class="no_toc">Why does this matter?</h3>

The title attribute can only be perceived by mouse users, and they have to really try to discover it. It takes a few seconds of hovering over an element before the title shows up. The title attribute cannot be perceived when using a touch screen, keyboard navigation, or a screen reader.

<h3 class="no_toc">Learn more</h3>

- Read [Steve Faulkner's "Using the HTML title attribute"](https://www.tpgi.com/using-the-html-title-attribute-updated/).
- Read [Dave Rupert's "Use title attributes"](https://www.a11yproject.com/posts/title-attributes/).

## 6. Removing button outlines

Did this ever happen to you? A product owner or a designer on your project tested the project in Chrome, and they saw an "ugly blue outline" on buttons that "doesn't fit the company branding". So they told you to remove it. And none of you knew better, so you did.

In the past, [Chrome used to apply default focus styles to buttons on mouse click](https://zellwk.com/blog/inconsistent-button-behavior/). No other browser did it, only Chrome. It was wrong, and they fixed it by now, but it did a lot of damage to web accessibility in the meantime, influencing many web developers to make this mistake.

```css
/* don't do this ❌ */
button {
  outline: 0;
}
```

<h3 class="no_toc">Why does this matter?</h3>

To navigate your website with a keyboard successfully, the user must be able to see which element is currently focused.

<h3 class="no_toc">Learn more</h3>

- Read [Guilherme Simões' "Never remove CSS outlines"](https://www.a11yproject.com/posts/never-remove-css-outlines/).
- Read [Andy Adams's focus-visible guide](https://css-tricks.com/almanac/selectors/f/focus-visible/).
- Read [WebAIM's keyboard testing shortcut reference](https://webaim.org/techniques/keyboard#testing) to learn how to test keyboard navigation on your websites.

## 7. Tiny clickable areas

Padding, margin, gap - same thing, right? Wrong. Choosing the right technique of adding whitespace around elements can impact their usability. Compare the clickable areas of the two sets of icon buttons. The buttons look identical if you don't interact with them. 

<figure>
<a href='{% asset posts/9-signs-your-frontend-code-has-quality-issues/clickable-area-small @path %}'>
{% asset posts/9-signs-your-frontend-code-has-quality-issues/clickable-area-small alt="Three icon buttons in a row, with some margin in between them. Cursor moving from button to button only triggers hover state over the button when it\'s exactly over the icon." %}
</a>
<figcaption>Margin vs...</figcaption>
</figure>

<figure>
<a href='{% asset posts/9-signs-your-frontend-code-has-quality-issues/clickable-area-big @path %}'>
{% asset posts/9-signs-your-frontend-code-has-quality-issues/clickable-area-big alt="Three icon buttons in a row, with some padding inside each button. Cursor moving from button to button triggers hover state of the closest button." %}
</a>
<figcaption>...padding</figcaption>
</figure>


<h3 class="no_toc">Why does this matter?</h3>

Tiny clickable areas will make it harder for your users to click or tap the links and buttons that they want to activate, leading to misclicks and frustration. [Clickable area size also affects your search engine rankings](https://developer.chrome.com/docs/lighthouse/seo/tap-targets/), as websites with tiny clickable areas are deemed not mobile-friendly and do not rank as high.

<h3 class="no_toc">Learn more</h3>

- Read [Ahmad Shadeed's "Designing better target sizes"](https://ishadeed.com/article/target-size/) for a comprehensive and interactive guide about clickable areas. 
- Read [Ahmad Shadeed's "Enhancing The Clickable Area Size"](https://ishadeed.com/article/clickable-area/) for a slightly shorter explanation.

## 8. HTML validation errors

If you hired a professional copywriter, would you be content with their work if it contained grammar mistakes? I don't think so. 

Yet, somehow it's completely normal for "professional" web developers to produce HTML like this:

```html
/* there are 3 HTML validation errors in this short snippet ❌ */
<a href="/home" id="home">
  <button class="btn btn--primary">
    <img src="/icons/home.svg" id="home">
  </button>
</a>
```

<h3 class="no_toc">Why does this matter?</h3>

Invalid HTML can often signal the existence of bugs - duplicate IDs, tags not closed, misspelled attributes, and so on. It is also less likely to work correctly with all the software that parses HTML that is not the browser: search engine crawlers, browser extensions, screen readers, braille displays, and many more. Invalid HTML is less future-prone - browsers promise to support web standards so old web pages still work, but you can't count on this if your code does not adhere to the standards.

<h3 class="no_toc">Learn more</h3>

- Read [W3C's "Why validate?"](https://validator.w3.org/docs/why.html).
- Read [my "5 bugs that HTML validation caught for me"](https://angelika.me/2023/09/15/5-bugs-caused-by-invalid-html/).
- A fun way to test if you can recognize _bad HTML_ is to read [Manuel Matuzović' HTML Hell](https://www.htmhell.dev/).

## 9. Poor Core Web Vitals

Web performance is a complex topic. External dependency choices, implementation mistakes, intentional trade-offs, imperfect deployment strategies, and many other details can all add up and cause performance problems. Google gave us a useful shorthand for web performance: Core Web Vitals. Is your website passing the assessment?

<figure>
<a href='{% asset posts/9-signs-your-frontend-code-has-quality-issues/core-web-vitals @path %}'>
{% asset posts/9-signs-your-frontend-code-has-quality-issues/core-web-vitals alt='Core web vitals assessment failed. Largest contentful paint red, 8.6 seconds. Interaction to next paint yellow, 413 ms. Cumulative layout shift yellow, 0.23'%}
</a>
<figcaption>Core web vitals assessment from <a href="https://pagespeed.web.dev/">pagespeed.web.dev</a> for a certain (in)famous social media website.</figcaption>
</figure>

<h3 class="no_toc">Why does this matter?</h3>

The Core Web Vitals assessment reported by <a href="https://pagespeed.web.dev/">pagespeed.web.dev</a> is based on real visitor data. If you're failing the assessment, it means your visitors are actually having a less-than-ideal experience, and it also hurts your page's search engine rankings.

<h3 class="no_toc">Learn more</h3>

- Check your website's Core Web Vitals on [pagespeed.web.dev](https://pagespeed.web.dev/).
- Watch [Sematext's "What are Core Web Vitals?"](https://www.youtube.com/watch?v=pTswmgVWSH8) for a normal-paced overview.
- Watch [Fireship's "The ultimate guide to web performance"](https://www.youtube.com/watch?v=0fONene3OIA) for a fast-paced overview.
- Read [Philip Walton's (web.dev) "Web Vitals"](https://web.dev/articles/vitals) for a detailed explanation.

Note that in 2024, "First Input Delay" was replaced by "Interaction to Next Paint" as one of the 3 Core Web Vitals.
