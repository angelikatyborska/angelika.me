---
title: Building a blog with Jekyll
description: A basic introduction to Jekyll based on my own experience with building this blog.
tags: [ruby, blogging, jekyll]
---
When I first got the idea to start blogging, I asked my boyfriend if he could spare me some storage space on his server. He agreed under one condition - no PHP. He swore not to ever install PHP on his server. That meant no WordPress, the only blogging tool I was familiar with. After a few minutes of googling 'ruby blogging' I decided on using [Jekyll](http://jekyllrb.com/). It was completely unfamiliar to me at that time and now I want to share with you what I had to learn to start this blog.

Disclaimer: At the time of writing this post, the latest version of Jekyll is 3.1.2.

## What is Jekyll?

Jekyll is a command-line tool (distributed as a Ruby gem) for generating static websites. It allows you to divide your static HTML pages into layouts and partials, and to write your content using your favorite markup language. Jekyll understands blogging - it creates a static page for your every post and allows you to display all posts on a single page. Jekyll is awesome for programming-related blogs, because it has [syntax highlighting](https://github.com/jneen/rouge) built-in. Because all your content is static, there is no need for a database and it is very easy to keep your whole blog (with all the content) under version control.

All you need to do is organize your files using a directory structure Jekyll understands.

To work on your site, you want to run `jekyll serve`. This command will create a `_site` directory with your website, watch for changes, and run a web server on `http://localhost:4000` that serves everything from `_site`. Since `_site` is an auto-generated directory, you probably want to ignore it in your VCS. When you're ready to deploy, it's as easy as copying everything from `_site` to your server's public directory.

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

This is where your HTML will reside. Let's start from the top. Every website needs a HTML file with a root `<html>` element, a `<head>` and a `<body>`. You want to put that file inside `_layouts` and name it whatever you want. I named mine [`default.html`](https://github.com/angelikatyborska/blog/blob/master/_layouts/default.html). 

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
If you want a partial HTML file that you can include in many layouts or other partials, you need to put it in `_includes`. Let's say we want to add a header to our default layout, but we don't want `_layouts/default.html` to get too big too fast, so we define it as a partial:

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
I &hearts; {% raw %}{{ include.name }}{% endraw %}!
```

### What's up with {% raw %}`{{ }}`{% endraw %} and {% raw %}`{% %}`{% endraw %}?

Those are [Liquid](https://github.com/Shopify/liquid) tags. Liquid is a templating engine that Jekyll uses. It allows you to print variables in your layouts, partials, posts and pages.

### What's up with `---`?

It's a [Front Matter](https://jekyllrb.com/docs/frontmatter/). It has to be a valid YAML preceded and followed by a line of three dashes. It's optional, but if you want to include it, it has to be the first thing in the file. It's where we can specify a layout for a page, a post or a layout, a permalink and tags for a post and even our own variables that we can later use inside Liquid tags.

## Posts and drafts

That's the heart of your blog. Every file inside `_posts` has to follow this naming convention:

```
yyy-mm-dd-title.md
```

The extension `.md` means it's a Markdown file (like a typical README file in a GitHub repository). You can write posts in plain HTML as well. To use some other markup language, you have to install an appropriate plugin.

Jekyll will create this directory structure with your posts:

```
_site
  yyyy
    mm
      dd
        title.html
```

Files inside `_drafts` are posts without a date (since you're currently working on them and you don't know when they will be finished):

```
a-post-im-currently-working-on.md
```

By default, drafts will not be included in `_site`. To see drafts on your blog, run `jekyll serve --drafts`.

A post will look something like this:

```md
---
layout: post
title: Building a blog with Jekyll
tags: [ruby, blogging, jekyll]
---
# This is a header

This is a paragraph
```

Every post must begin with the YAML Front Matter. 

## Adding pages

By default, Jekyll copies all non-Jekyll files and directories whose names do not begin with a dot to `_site`, so adding pages is as simple as adding a HTML file to the root directory of your blog:

```html
<!-- about.html -->
---
layout: default
---
<h1>About this blog</h1>
```

## Configuration

`_config.yml` is where all kinds of configuration is held. All kinds. For example:

### Stop Jekyll from copying specific files to `_site`

```yml
exclude: [Gemfile, bower.json, Rakefile]
```

### Specify a default layout for all posts

```yml
defaults:
  -
    scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
```

Now you don't have to specify a layout in a post's YAML Front Matter.

### Anything you want

```yml
favorites:
  color: pink
```

You can use it in a post, a page or a layout like this:

```
My favorite color is {% raw %}{{ site.favorites.color }}{% endraw %}.
```

## Assets

Now that you're done with markup, you need some color. There are several ways to add stylesheets, images and javascript to your blog.

### 1. Copying

As you already know, Jekyll copies (almost) everything from your root directory to `_site`, so you can just use that. Create any directory structure for your assets that you want (do not prefix directory names with a dot or an underscore) and use them in your default layout like you would with any static site:

```
my_blog
  assets
    css
      screen.css
    images
      my_logo.png
```

```html
<!-- _layouts/default.html -->
<link href='assets/css/screen.css' rel='stylesheet' type='text/css'>
```

```html
<!-- _includes/header.html -->
<img src='assets/images/my_logo.png' alt='My Logo>
```

This way you can use your favorite front-end tools just like you would for any static page.

### 2. Jekyll's build-in Sass support

If you want to use Sass for your stylesheets (and you should!), you can use Jekyll's build-in support for Sass. Firstly, your main Sass file can go into any directory you want (again, do not prefix its name with a dot or an underscore) and should look something like this:

```scss
// css/screen.scss 
---
---
@import
'utils/colors',
'components/header';

```

Those two lines of triple dashes are necessary and they should be the first thing in the file! The comments with the filenames are here only to make it easier to read this blog, you don't want to include them in your code.

The files you want to import in your main Sass file should be inside `_sass`:

```
_sass
  utils
    _colors.scss
  components
    _header.scss
```

You can include the main Sass stylesheet in your layout just like before:

```html
<!-- _layouts/default.html -->
<link href='css/screen.css' rel='stylesheet' type='text/css'>
```

### 3. `jekyll-assets`

## How can I get this cool syntax highlighting?

## Comments