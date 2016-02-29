---
title: Building a blog with Jekyll
description: A very basic introduction to Jekyll based on my own experience with building this site.
tags: [ruby, blogging, jekyll]
---
When I first got the idea to start blogging, I asked my boyfriend if he could spare me some storage space on his server. He agreed under one condition - no PHP. He swore not to ever install PHP on his server. That meant no WordPress, the only blogging tool I was familiar with. After a few minutes of googling 'ruby blogging' I decided on using [Jekyll](http://jekyllrb.com/). It was completely unfamiliar to me at that time and now I want to share with you what I had to learn to start this blog.

## What is Jekyll?
Jekyll is a command-line tool (distributed as a Ruby gem) for generating static websites. It allows you to divide your static HTML pages into layouts and partials, and to write your content using some other markup language, like Markdown or Textile. Jekyll understands blogging - it creates a static page for your every post and allows you to iterate over all posts, for example, in index.html. Because all your content is static, there is no need for a database and it is very easy to keep your whole blog (with all the content) under version control.

All you need to do is organize your files using a directory structure Jekyll understands.

To work on your site, you want to run `jekyll serve`. This command will create a `_site` directory with your website inside and run a web server on `localhost:4000` that serves everything from `_site`. Since `_site` is an auto-generated directory, you probably want to ignore it in your VCS. When you're ready to deploy, it's as easy as copying everything from `_site` to your server's public directory.

### Basic directory structure example

```
my_blog
  _drafts
    a-post-im-currently-working-on.md
  _includes
    header.html
  _layouts
    default.html
    post.html
  _posts
    2016-02-29-an-example-post.md
  _config.yml
  index.html
  some-other-page.html
```

## Layouts and includes

This is where your HTML will reside. Let's start from the top. Every website needs a HTML file with a root `<html>` element, a `<head>` and a `<body>`. You want to put that file inside `_layouts` and name it whatever you want, I named mine [`default.html`](https://github.com/angelikatyborska/blog/blob/master/_layouts/default.html). 

### Layouts

Every layout should include {% raw %}`{{ content }}`{% endraw %} somewhere. A layout can be used by a page, a post or another layout, and {% raw %}`{{ content }}`{% endraw %} is where a file that uses this layout will be rendered.

```html
<!-- _layouts/default.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>You Blog</title>
</head>
<body>
  {% raw %}{{ content }}{% endraw %}
</body>
</html>
```

### Nested Layouts

Now that we have a default layout, we can create another layout that uses it. 

```html
<!-- _layouts/post.html -->
---
layout: default
---
<article class="post">
  {% raw %}{{ content }}{% endraw %}
</article>
```

### Partials
If you want a snippet of HTML that you can include in many layouts or other snippets, you need to put it in `_includes`. Let's say we want to add a header to our default layout, but we don't want `_layouts/default.html` to get too big too fast, so we define it as a partial:

```html
<!-- _includes/header.html -->
<header>
  Welcome to my blog!
</header>
```

We can then include it in `_layouts/default.html` by adding a line like this:

```html
{% raw %}{% include header.html %}{% endraw %}
```

#### Partials with parameters

We can pass parameters to an include:

```html
{% raw %}{% include heart.html name="Angelika" %}{% endraw %}
```

Partials can use those parameters:

```html
<!-- _includes/heart.html -->
I &hearts; {{ include.name }}!
```

### What's up with {% raw %}`{{ }}`{% endraw %} and {% raw %}`{% %}`{% endraw %}?

Those are [Liquid](https://github.com/Shopify/liquid) tags. Liquid is a templating engine that Jekyll uses. It allows you to print variables in your layouts, partials, posts and pages.

### What's up with `---`?

It's a YAML Front Matter. It has to be a valid YAML preceded and followed by a line of three dashes. It's optional, but if you want to include it, it has to be the first thing in the file. It's where we can specify a layout for a page, a post or a layout, a permalink and tags for a post and even our own variables that we can later use inside Liquid tags.

## Posts and drafts

## Adding custom pages

## Assets
