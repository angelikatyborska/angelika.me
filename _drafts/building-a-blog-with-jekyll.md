---
title: Building a blog with Jekyll
excerpt: A basic introduction to Jekyll based on my own experience with building this blog.
tags: [gem, blogging, jekyll]
---
When I first got the idea to start blogging, I asked my boyfriend if he could spare me some storage space on his server. He agreed under one condition - no PHP. He swore to himself not to ever install PHP on his server. That meant no WordPress, the only blogging tool I was familiar with. After a few minutes of googling 'ruby blogging' I decided on using [Jekyll](http://jekyllrb.com/). It was completely unfamiliar to me at that time and now I want to share with you what I had to learn to start this blog.

Please note that at the time of writing this post, the latest version of Jekyll is 3.1.2.

## What is Jekyll?

Jekyll is a command-line tool (distributed as a Ruby gem) for generating static websites. It allows you to divide your static HTML pages into layouts and partials, and to write your content using your favorite markup language. Jekyll understands blogging - it creates a static page for every post and allows you to display all posts on a single page. Jekyll is awesome for programming-related blogs, because it has syntax highlighting built-in. Because the site content is static, there is no need for a database and it is very easy to keep your blog (along with the content) under version control.

All you need to do is organize your files using a directory structure Jekyll understands and run Jekyll in the root directory. To generate your website, run `jekyll build`. This command will create a `_site` directory, with all the files your website needs. To watch for changes, add a `--watch` flag. To build, watch for changes and serve the contents of `_site` on `http://localhost:4000` simultaneously, run `jekyll serve`.

Since `_site` is an auto-generated directory, you probably want to ignore it in your VCS. When you're ready to deploy, it's as easy as copying everything from `_site` to your server's public directory.

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
  Gemfile
  index.html
  some-other-page.html
```

## Layouts and includes

This is where your HTML will reside.

### Layouts

A layout can be used by a page, a post or another layout. Every layout should include the tag {% raw %}`{{ content }}`{% endraw %}, this is where a file that uses this layout will be rendered. Every website needs at least one layout with `<html>`, `<head>` and `<body>` elements. I will call that layout a default one (you can call it whatever you want).

```html
<!-- _layouts/default.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Blog</title>
</head>
<body>
  {% raw %}{{ content }}{% endraw %}
</body>
</html>
```

#### Nested Layouts

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

It's a [Front Matter](https://jekyllrb.com/docs/frontmatter/). It has to be a valid YAML preceded and followed by a line of three dashes. It's optional, but if you want to include it, it has to be the first thing in the file. It's where we can specify a layout for a page, a permalink and tags for a post and even our own variables that we can later use inside Liquid tags.

## Posts and drafts

That's the heart of your blog. Every file inside `_posts` has to follow this naming convention:

```
yyy-mm-dd-title.md
```

The extension `.md` means it's a Markdown file (like a typical README file in a GitHub repository). You can write posts in plain HTML as well. To use some other markup language, you have to install an appropriate plugin.

Jekyll, when building your site, will create this directory structure for your posts:

```
my_blog
  _site
    yyyy
      mm
        dd
          title
            index.html
```

Files inside `_drafts` are posts without a date (since you're currently working on them and you don't know when they will be finished):

```
a-post-im-currently-working-on.md
```

By default, drafts will not be included in `_site`. To see drafts on your blog, run `serve` or `build` with the flag `--drafts`.

A post will look something like this:

```html
<!-- _posts/building-a-blog-with-jekyll.md -->
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

By default, Jekyll copies all files and directories whose names do not begin with a dot or an underscore to `_site`, so adding pages is as simple as adding a HTML file to the root directory of your blog:

```html
<!-- about.html -->
---
layout: default
---
<h1>About this blog</h1>
```

## Configuration

`_config.yml` is where all kinds of configuration is held. For example:

### Stop Jekyll from copying certain files

```yml
exclude: [Gemfile, Rakefile]
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

Now you can skip specifying a layout in a post's YAML Front Matter.

### URLs without `.html`

```yml
permalink: pretty
```

### Anything you want

```yml
favorites:
  color: pink
```

You can use it in a post, a page or a layout like this:

```
My favorite color is {% raw %}{{ site.favorites.color }}{% endraw %}.
```

Remember that every time you edit configuration, you have to restart Jekyll's server.

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
<img src='assets/images/my_logo.png' alt='My Logo'>
```

This way you can use your favorite front-end tools in a Jekyll agnostic way.

### 2. Jekyll's built-in Sass support

If you want to use Sass for your stylesheets (and you should!), you can use Jekyll's built-in support for Sass. Firstly, your main Sass file can go into any directory you want (again, do not prefix its name with a dot or an underscore) and should look something like this:

```scss
// css/screen.scss 
---
---
@import
'utils/colors',
'components/header';

```

Those two lines of triple dashes are necessary and they should be the first thing in the file! The comments with the filenames are here only to make it easier to read this post, you don't want to include them in your code.

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

[`jekyll-assets`](https://github.com/jekyll/jekyll-assets) is an asset pipeline for Jekyll. I decided on using it because I wanted to pass my stylesheet through [Autoprefixer](https://github.com/postcss/autoprefixer). Remember that if you're using Bootstrap's or Foundation's source files (scss/less files instead of css files), you should use Autoprefixer. You can always set it up with your front-end build tool of choice (like Grunt, Gulp, Broccoli or even npm scripts), but `jekyll-assets` will do it for you automagically. 

To use the asset pipeline, add `jekyll-assets` to your blog's Gemfile:

```ruby
# Gemfile
source 'https://rubygems.org'

gem 'jekyll'

group :jekyll_plugins do
  gem 'jekyll-assets'
  gem 'sass' # add only if you're using sass for your stylesheets
  gem 'autoprefixer-rails' # add only if you want it
  gem 'uglifier' # add only if you want to compress your js files
end
```

In order to play nice with `jekyll-assets`, your assets directory structure should look like this:

```
my_blog
  _assets
    fonts
    images
      my_logo.png
    javascripts
      tooltip.js
    stylesheets
      components
        _header.scss
      screen.scss
```

To include a stylesheet in your layout use:

```html
{% raw %}{% stylesheet screen %}{% endraw %}
```

To include a JavaScript file use:

```html
{% raw %}{% javscript tooltip %}{% endraw %}
```

To include an image use:

```html
{% raw %}{% img my_logo alt:'My Logo' class:'logo' %}{% endraw %}
```

By default, Jekyll will only copy those assets that have been included with the tags above. If you wish to copy some other files, let's say all fonts, you have to add this to your configuration:

```yml
# _config.yml
assets:
  assets:
    - "*.otf"
    - "*.eot"
    - "*.svg"
    - "*.ttf"
    - "*.woff"
    - "*.woff2"
```

If you are using a front-end package manager, you will want to change its target directory to something inside `_assets`, and then add that directory as a source for Jekyll's assets:

```yml
# _config.yml
assets:
  sources:
    - _assets/packages
```

Now you can include anything inside `_assets/packages` just like all the other assets.

## How can I get this cool syntax highlighting?

Syntax highlighting is not a part of Markdown, but Jekyll uses [Rogue](https://github.com/jneen/rouge) to get it done. In your post, include a code block (specifying the desired language) like this:

````md
```ruby
puts 'Hello, World!'
```
````

If you inspect the HTML generated from your Markdown source, you will notice that this code block is surrounded with a `pre.highlight` element, and separate expressions are surrounded with `span` elements with weird classes like `nb` and `s1`. This is the doing of Rogue, and Rogue's HTML output is compatible with [Pygments](http://pygments.org/). Just google `pygments stylesheet [your favorite color scheme]` and you will find what you're looking for.

## Comments

Even though Jekyll is for building static sites, it's possible to include a comments section in your blog. I added comments to my posts using [Disqus](https://disqus.com/). It's really simple. All you need to do is create a Disqus account and add a new site to it. You will be given a snippet of HTML and JavaScript ([Universal Embeded Code](https://disqus.com/admin/universalcode/)) that you have to append to `_layouts/post.html`. There will be some JavaScript variables to configure, one of them being an unique identifier of a post.

```html
<!-- _layouts/post.html -->
<div id="disqus_thread"></div>
<script>
  /**
   *  RECOMMENDED CONFIGURATION VARIABLES: 
   *  EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT
   *  DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
   *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT:
   *  https://disqus.com/admin/universalcode/#configuration-variables
   */

  var disqus_config = function () {
    this.page.url = "{% raw %}{{ site.url }}{{ page.url }}{% endraw %}";
    this.page.identifier = "{% raw %}{{ page.id }}{% endraw %}";
  };

  (function() {  // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = '//YOUR-DISQUS-SITE.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
</script>
<noscript>
Please enable JavaScript to view the
<a href="https://disqus.com/?ref_noscript" rel="nofollow">
  comments powered by Disqus.
</a>
</noscript>
```

```yml
# _config.yml
site:
  url: http://your-blog.com
```

## Conclusion

I hope I convinced you that Jekyll is really simple to use and there is no need for WordPress when it comes to small personal blogs. Remember, whenever you're in doubt, take a look at the [official Jekyll documentation](http://jekyllrb.com/docs/home/). You can also search for Github repositories with sites developed using Jekyll. Mine is [here]({{ site.about.repo }}).
