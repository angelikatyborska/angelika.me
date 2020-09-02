---
title: Speed up the compilation of Elixir projects that use Gettext
excerpt: With those two small configuration fixes, we managed to make our Phoenix project compile 3 times faster.
tags: [Elixir, Phoenix, Gettext]
date: 2020-09-02 16:55:00 +0200
---

I have been working in a team on a big Phoenix project for over a year. As the project grew, it took longer and longer to compile it.

Because the decrease in compilation speed happened gradually over many months, we weren't entirely sure why it happened and how to fix it.

At its worst, it took almost 3 minutes to recompile the application (without dependencies). That's 3 minutes we had to wait every time we would change something in the config, update a dependency, add a new string via Gettext, or switch between git branches that did one of those things!

Something else that happened gradually over many months? **The number of locales that our app supports went from 2 to 10**. As we recently realized, that caused the slow compilation.

Thankfully, [Gettext has some configuration options](https://hexdocs.pm/gettext/Gettext.html#module-backend-configuration) that helped us get the compilation speed up.

## Fix 1: bundle each locale into its own module

> `:one_module_per_locale` - instead of bundling all locales into a single module, this option makes Gettext build one internal module per locale. This reduces compilation times and beam file sizes for large projects. This option requires Elixir v1.6.

In `config/config.exs`:

```elixir
 config :my_app, MyAppWeb.Gettext, one_module_per_locale: true
```

## Fix 2: limit the number of bundled locales

> `:allowed_locales` - a list of locales to bundle in the backend. Defaults to all the locales discovered in the `:priv` directory. This option can be useful in development to reduce compile-time by compiling only a subset of all available locales.

In `config/dev.exs` and `config/test.exs`:

```elixir
 config :my_app, MyAppWeb.Gettext, allowed_locales: ["de", "en"]
```

## Before and after

The first fix alone decreased the compilation time of our project from ~2:45 minutes to ~1:10 minutes (**~2,5 times faster**). The second fix decreased it even further down to ~45 seconds (~3,5 times faster), but only in the dev and test environments.

```
# before
mix compile  322.20s user 24.87s system 207% cpu 2:47.60 total

# after
mix compile  252.72s user 18.37s system 615% cpu 44.039 total
```
