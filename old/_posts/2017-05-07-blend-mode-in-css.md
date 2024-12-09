---
title: Blend mode in CSS
excerpt: Yes, you can set a blend mode for your HTML elements!
tags: [CSS]
date: 2017-05-07 15:39:00 +0200
---

I have been working recently on a web app that included Photoshop-like layer editing. One of the basic features of layers is that the selected layer has a [bounding box](https://helpx.adobe.com/photoshop/key-concepts/bounding-box.html). 

That bounding box needs to be visible over all backgrounds. In my case, the background was a `<canvas>` displaying a lot of different images.
 
Initially, I went for a plain boring black-and-white dashed rectangle, which is fairly easy to get with two `<rect>`s in an inline SVG, but I didn't like it. If only it was possible to use different blend modes to do something cooler...

And it is!

## `mix-blend-mode`

You can set a blend mode for any arbitrary HTML element. The CSS property is called [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode).

Its possible values are:

- `normal`
- `multiply`
- `screen`
- `overlay`
- `darken`
- `lighten`
- `color-dodge`
- `color-burn`
- `hard-light`
- `soft-light`
- `difference`
- `exclusion`
- `hue`
- `saturation`
- `color`
- `luminosity`

### Support

Browser support at the moment is [rather limited](https://caniuse.com/#search=mix-blend-mode). There are no problems in Chrome and Firefox, Safari does not implement a few blend modes, and IE/Edge does not implement them at all.

## Demo - a simple text

This is a simple black text with the blend mode `overlay` over a yellow-orange gradient.

<p data-height="265" data-theme-id="0" data-slug-hash="NjwXRx" data-default-tab="css,result" data-user="angelikatyborska" data-embed-version="2" data-pen-title="NjwXRx" class="codepen">See the Pen <a href="https://codepen.io/angelikatyborska/pen/NjwXRx/">NjwXRx</a> by Angelika Tyborska (<a href="http://codepen.io/angelikatyborska">@angelikatyborska</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Demo - Rainbow

[A rainbow gradient over an `iframe`](http://angelika.me/rainbow/#/?blendMode=screen&url=http://angelika.me). Change the blend mode in the select box in the right top corner. Change the `iframe`'s source in the URL (please note some websites will not load in an `iframe`).

Source code available [here](https://github.com/angelikatyborska/rainbow).

## My Bounding Box

I am sure Photoshop's algorithm for choosing the color of the bounding box over any given pixel is probably very complicated, to be sure that the bounding box is always visible. My bounding box did not need to be perfect. I created two identical rectangles, one above the other:

1. a rectangle with a white border with the blend mode `difference` 
2. a rectangle with a white border with the blend mode `color`.
 
That combination would only be invisible on big areas of plain colors similar to `#808080` which is very unlikely for my use case.

The final effect ended up looking something like this:

<figure>
{% asset posts/blend-mode-in-css/my-bounding-box alt='My bounding box'%}
<figcaption>A Photoshop-like bounding box made up of two inline SVGs over a canvas displaying a photo of my unamused cat</figcaption>
</figure>

A demo of a simplified version (without the small squares in the corners):

<p data-height="265" data-theme-id="0" data-slug-hash="RVjxBb" data-default-tab="css,result" data-user="angelikatyborska" data-embed-version="2" data-pen-title="RVjxBb" class="codepen">See the Pen <a href="https://codepen.io/angelikatyborska/pen/RVjxBb/">RVjxBb</a> by Angelika Tyborska (<a href="http://codepen.io/angelikatyborska">@angelikatyborska</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

