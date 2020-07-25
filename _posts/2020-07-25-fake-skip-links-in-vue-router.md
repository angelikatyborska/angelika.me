---
title: Fake skip links in Vue Router
excerpt: How to allow users to skip chunks of content in your Vue app when the hash part of the URL is hijacked by Vue Router.
tags: [JavaScript, Vue, Accessibility]
date: 2020-07-25 16:53:00 +0200
---

_This article is inspired by Marcus Herrmann's article [Improved accessible routing in Vue.js](https://marcus.io/blog/improved-accessible-routing-vuejs). You should read it because it mentions other accessibility issues with Vue Router._

[Skip links](https://www.a11yproject.com/posts/2013-05-11-skip-nav-links/) are shortcut links that take you to a section within the same webpage, allowing you to _skip_ big chunks of content that don't interest you. They are an important accessibility feature for users that navigate the web by means that would otherwise require them to go through all of the content in the order it appears in the DOM, for example when using keyboard navigation (tabbing through a page). Skip links are usually hidden until focused but can also be always visible. Think of a long Wikipedia article with a table of contents at the beginning, that can take you straight to the section that you're looking for <sup>[[1]](#note-1)</sup>.

<figure>
<a href='{% asset posts/fake-skip-links-in-vue-router/wikipedia_table_of_contents.gif @path %}'>
  {% asset posts/fake-skip-links-in-vue-router/wikipedia_table_of_contents.gif alt:'A gif showing navigating a Wikipedia article with its table of contents' %}
</a>
<figcaption>You can use the table of contents on Wikipedia to jump straight to the section that interests you the most.</figcaption>
</figure>

<figure>
<a href='{% asset posts/fake-skip-links-in-vue-router/wikipedia_hidden_skip_link.gif @path %}'>
  {% asset posts/fake-skip-links-in-vue-router/wikipedia_hidden_skip_link.gif alt:'A gif showing a skip link on Wikipedia' %}
</a>
<figcaption>Wikipedia also has some hidden skip links, for example to jump straight to the search.</figcaption>
</figure>

Skip links are normally implemented by changing the hash part of the URL (also called an _anchor_ or _[a fragment identifier](https://en.wikipedia.org/wiki/URI_fragment)_.

```html
<a href="#Contact">Contact</a>
<!-- more content here -->
<h3 id="Contact">Contact</h3>"
```

When clicking on such a link, the browser would scroll the page so that the element with `id="Contact"` is at the top. But more importantly for accessibility, it would also cause the next tab keypress to focus the next focusable element after that element. Meaning, it allowed you to _skip_ all the focusable elements that were between the link itself and the element with `id="Contact"`. When using a screen reader, the behavior would be similar, but additionally, the content of the skip link target would be read out loud.

## The problem with Vue Router

Single Page Applications, as their name suggest, work on a single page. If they cannot use page changes to decide which components to render, they need something else. Vue Router hijacks the URL's hash location for that purpose.

This means that we can no longer have conventional skip links. You could try to override Vue Router hash location changes with your own, but that will break the router's functionality. If you override the hash location, the app won't recognize the route after you reload the page.

## The solution

Skip links have two distinct parts to their functionality - scrolling the page so that the target is visible and telling assistive technology to jump to that location. To fake skip links in a Vue app that uses Vue Router, you need to make those two things happen explicitly, in response to Vue Router path changes.

Fortunately, [Vue Router has its own concept of route hashes](https://router.vuejs.org/api/#route-object-properties). Assuming your Vue app is mounted on the page `/some-page-with-a-vue-app`, a path like this one (note the two hashes): 

```
/some-page-with-a-vue-app#/vue-router-page#vue-router-hash
```

Would produce a Vue Router route of:
```js
{ path: 'vue-router-page', hash: '#vue-router-hash' }
```

Let's use that to recreate the functionality of skip links.

I created a [GitHub repository](https://github.com/angelikatyborska/fake-skip-links-in-vue-router) with an example of a Vue app that implements this solution.

### 1. Scroll

Vue Router makes it easy to scroll the page to a skip link target by using its [scroll behavior](https://router.vuejs.org/guide/advanced/scroll-behavior.html).

Add the `scrollBehavior` option to your router:

```javascript
const router = new VueRouter({
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
  }
})
```

This will cause Vue Router to look for an element with id `to.hash` and scroll it into view whenever the route changes.

[Reference commit in the example repository](https://github.com/angelikatyborska/fake-skip-links-in-vue-router/commit/a4e249c6136c598d5013d594ceb310d8ce6157d9).

### 2. Move focus

Scrolling the element into view by itself will not cause assistive technology to jump to that location. We need to do that explicitly.

There are two ways to make the browser tell assistive technology to jump to a location: change the hash location or focus an element <sup>[[2]](#note-2)</sup>. We have this problem in the first place because changing the hash location is not an option. That means we have to focus the element.

#### 2.1 Make skip link target focusable

Most HTML elements are not focusable by default, e.g. `main`, `section`, `div`, `p`, `h1`, `h2`. Those are the elements that are usually the target of a skip link.

To make an element focusable, add a [`tabindex` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex) with value `-1` to the element:
```html
<h3 id="Contact" tabindex="-1">Contact</h3>"
```

The attribute `tabindex` with any value makes the element focusable. We want a negative value because an element with a negative `tabindex` can only be focused with JavaScript, and not by clicking or navigating with the keyboard when pressing the tab key. 

#### 2.2 Focus skip link target on route change

Now that the targets of our skip links can be focused, we need to focus them. This needs to happen first when a component is **mounted**, and then **every time the route changes**. The element should only be focused if its id matches the Vue Router route hash.

We can call a component method when the Vue Router route changes by using a [watcher](https://vuejs.org/v2/guide/computed.html#Watchers):
```js
watch: {
  $route: 'onRouteChange'
},
mounted () {
  this.focusSkipLinkTarget(this.$route)
},
methods: {
  onRouteChange (to, from) {
    this.focusSkipLinkTarget(to)
  }
}
```

Elements can be focused by calling [focus()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus) on them. Vue allows you to grab an element by adding a special [`ref` attribute](https://vuejs.org/v2/api/#ref):

```html
<h3 ref="contact" id="Contact" tabindex="-1">Contact</h3>"
```

This will make the element available in our Vue component as `this.$refs.contact`.

As we will likely have a lot of skip targets inside a single component, let's make the code more generic by assuming that every referenced element with an id is meant to be a skip link target.

```js
methods: {
  // onRouteChange etc. ...
  focusSkipLinkTarget (route) {
    const potentialSkipLinkTargets =
      Object.values(this.$refs).filter(el => el.id)

    if (route.hash) {
      const skipLinkTarget =
        potentialSkipLinkTargets.find(el => route.hash === `#${el.id}`)

      if (skipLinkTarget) {
        skipLinkTarget.focus()
      }
    }
  }
}
```

If you want to reuse this code in many Vue components, you can extract it into a [mixin](https://vuejs.org/v2/guide/mixins.html).

<figure>
<a href='{% asset posts/fake-skip-links-in-vue-router/solution.gif @path %}'>
  {% asset posts/fake-skip-links-in-vue-router/solution.gif alt:'A gif showing using keyboard navigation on an example Vue app with a lot of text that has a table of contents.' %}
</a>
<figcaption>Our solution in action.</figcaption>
</figure>

[Reference commit in the example repository](https://github.com/angelikatyborska/fake-skip-links-in-vue-router/commit/35fc256560963c994a31651db3467daf54efb19e).

#### 2.3 The outline dilemma

The focused element **needs** to stand out so that the user can clearly see where they currently are on the page. In Chrome and Safari, it has a blue outline <sup>[[3]](#note-3)</sup>. In Firefox, it has a thin dotted border.

Because clicking on an element makes it focused, this outline is very often visible to users that navigate with a mouse and might not know anything about _focus_ and _keyboard navigation_. These users might get annoyed by the seemingly unnecessary outline. For this reason, product designers and product managers very often [want to get rid of it](https://www.a11yproject.com/posts/2013-01-25-never-remove-css-outlines/).

When we added `tabindex="-1"` to a heading, we added fuel to this fire because now the heading will receive the outline whenever it's clicked. That's something that headings usually do not do.

A reasonable compromise might be to use [`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible). It's a pseudo-class added to a focused element (on top of `:focus`) if the user agent, using its own logic, decided that the user needs to clearly see which element is focused. For example in a browser, the user needs to see that an element is focused if it was focused using keyboard navigation, but probably doesn't if the element was clicked.

Sounds like an excellent solution to the outline dilemma, but it's only a proposal and doesn't work in all browsers. However, there is a [polyfill](https://github.com/WICG/focus-visible) available. Let's use it to remove the outline from focused elements when it's not needed.

```html
<script>
import 'focus-visible'
export default {}
</script>

<style lang="scss">
[data-js-focus-visible] :focus:not([data-focus-visible-added]) {
  outline: none;
}
</style>
```

[Reference commit in the example repository](https://github.com/angelikatyborska/fake-skip-links-in-vue-router/commit/45c0060ecc76a65bb7872d1d228f6478552c0c3a).

Note that a regular skip link would not cause its target to be focused if that target was a `div` or a heading, which could mean that it *might* be acceptable to remove the outline completely from our fake skip link targets. 

## Notes

<ul class="notes">
  <li id="note-1">
    Some people might not call a table of contents a good example of <em>skip links</em>. Some people might call it <em>anchor links</em> instead, or <em>same-page navigation</em>. For the purpose of this article, this distinction is irrelevant. I am using the term <em>skip links</em> to literally mean <em>links that skip part of the content</em>, and I chose to use it so that the article is easier to discover when looking for accessibility-related content.
  </li>
  <li id="note-2">
    Changing the hash part of the URL in itself moves the focus to the element whose id matches the hash, but <em>only</em> when that element is focusable. Regardless of whether the focus was moved, assistive technology makes the jump to the new location.
  </li>
  <li id="note-3">
    The color of the outlines might actually depend on your system settings. Mine are purple!
  </li>
</ul>
