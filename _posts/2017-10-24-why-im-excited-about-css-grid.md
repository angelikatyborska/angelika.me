---
title: Why I'm excited about CSS Grid
excerpt: I just got myself familiar with the specification of CSS Grid and cried a single tear of joy. Here's why.
tags: [css]
date: 2017-10-24 13:03:00 +0200
---

I started learning CSS as a kid in the early '00s, in the dark times of laying out content with tables. Today, in October 2017, we arrived at the situation where 70% of used browsers support CSS Grid, including the newest versions of all major desktop browsers.

<figure>
<a href='{% asset_path posts/why-im-excited-about-css-grid/caniuse-css-grid-2017-10-24 %}'>
{% img posts/why-im-excited-about-css-grid/caniuse-css-grid-2017-10-24 alt:'A screenshot of CSS Grid support on caniuse.com'%}
</a>
<figcaption>CSS Grid support according to <a href="https://caniuse.com/#feat=css-grid">caniuse.com</a> on 24 Oct 2017.</figcaption>
</figure>

Here are 3 reasons why I am excited about CSS Grid.

## 1. Equal-height columns

With just those two rules, I can create three equal-height equal-width columns whose heights depends on their content.

```css
main {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```

```html
<main>
  <article id="article1">...</article>
  <article id="article2">...</article>
  <article id="article3">...</article>
</main>
```

<figure>
<a href='{% asset_path posts/why-im-excited-about-css-grid/grid-equal-heights.html %}'>
{% img posts/why-im-excited-about-css-grid/grid-equal-heights.png alt:'A three column grid layout'%}
</a>
<figcaption>Click image for the HTML file</figcaption>
</figure>


No JavaScript, no hardcoded heights, no gradient backgrounds on `main`, no hacks.

## 2. Reordering of content with CSS

```css
main {
  display: grid;
  grid: "C D"
        "B A"
        "B E";
}

@media (min-width: 1000px) {
  main {
    grid: "A B C"
          "D B E";
  }
}

#article1 { grid-area: A; }
#article2 { grid-area: B; }
#article3 { grid-area: C; }
#article4 { grid-area: D; }
#article5 { grid-area: E; }
```

<figure>
<a href='{% asset_path posts/why-im-excited-about-css-grid/grid-reordering.html %}'>
{% img posts/why-im-excited-about-css-grid/grid-reordering.gif alt:'A gif of a two row three column grid layout changing order on window resolution change'%}
</a>
<figcaption>Click image for the HTML file</figcaption>
</figure>

No JavaScript, no negative margins, no hacks.

## 3. Creative possibilities

The simplicity of defining a grid together with the power of it will allow everyone to spend more time coming up with creative designs and less time implementing those designs.

<figure>
<a href='{% asset_path posts/why-im-excited-about-css-grid/grid-creative.html %}'>
{% img posts/why-im-excited-about-css-grid/grid-creative.png alt:'A screenshot of a website with CSS grid that forms the content to look like the letter A'%}
</a>
<figcaption>A-shaped layout. Click image for the HTML file.</figcaption>
</figure>
