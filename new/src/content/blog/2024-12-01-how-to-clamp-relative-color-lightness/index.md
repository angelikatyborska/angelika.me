---
title: How to clamp the lightness of a relative color in CSS
description: Let's say we have a color in a CSS variable and want to modify its lightness, but only if it's too dark or too light.
tags: [CSS]
pubDate: 2024-12-01 18:55:00 +0100
---

Let's say we have a color in a CSS variable.

```css
--custom-color: #226622;
```

Let's say we don't have any control over this color (maybe it came from user input?), but we'd like to use it.

But we only want to use it if it's not too dark or too light. If it's too dark or too light, we would rather modify the color so it's less dark or less light.

This can be achieved with the [relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors), the [`hsl()` function](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl) and [`clamp() function`](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp).

Let's say we want to keep the color lightness between 40% and 80%:

To clamp the lightness of our custom color between those values, do this:

```css
--custom-color: #226622;
--min-lightness: 40;
--max-lightness: 80;

background-color: hsl(from var(--custom-color) h s clamp(var(--min-lightness), l, var(--max-lightness)));

/* Use @supports to add in support for old syntax that requires % units to
 be specified in lightness calculations. This is required for
 Safari >= 16.4+ and < 18.0 */
@supports (color: hsl(from red h s calc(l - 20%))) {
  background-color: hsl(from var(--custom-color) h s clamp(calc(var(--min-lightness) * 1%), l, calc(var(--max-lightness) * 1%)));
}
```

(Thanks to [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl) for giving us the right `@support` rule to make this work in Safari.)

## Demo

Check out the [demo on CodePen](https://codepen.io/angelikatyborska/pen/emONWWz).

## Disclaimer

I'm not saying it's necessarily a good idea to use this technique in your project. The "lightness" in the HSL coordinates of a color in the RGB color space is not a perfect representation of a perceived color lightness. But maybe it's good enough for your use case?

I just wanted to show off a cool CSS feature.
