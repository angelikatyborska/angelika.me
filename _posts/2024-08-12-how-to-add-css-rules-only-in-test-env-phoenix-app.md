---
title: How to add CSS rules only in the test env in your Phoenix app
excerpt: Certain CSS styles might cause problems in your browser-based tests, so you might want to add some CSS rules that turn off those styles, but only in the test environment.
tags: [Elixir, Phoenix]
date: 2024-08-12 17:29:00 +0200
---

Certain CSS styles in your Phoenix app might cause problems in your browser-based tests. For example, smooth scrolling might cause elements to not be in view when the test is trying to click them, and CSS transitions of text and background colors might cause false-positive reports of insufficient color contrast in an [automated accessibility check](https://hexdocs.pm/a11y_audit/).

For this reason, you might want to add some CSS rules that turn off those problematic styles, which should only apply in the test environment,

To achieve this, I recommend adding one special CSS class to the body of your app and using that class to add the styles you need.

## What not to do

You might feel tempted to call `Mix.env/0` to get the current environment and put it in a CSS class like so:

```html
<% # ⚠️ do not do this %>
<body class={"env-#{Mix.env()}"}>
  <%= @inner_content %>
</body>
```

It will work... until you try to run your app in production using a release. **Mix is not available in releases**.

## What to do instead

Instead of calling `Mix` directly in the app code, use your app's configuration files. Add a new config key in your `test.exs` config file:

```elixir
# test.exs
config :my_app, body_class: "env-test"
# alternatively:
# config :my_app, body_class: "env-#{config_env()}"
```

Then, create a helper function in your layout module that will read this new key:

```elixir
defmodule MyAppWeb.Layouts do
  defp body_class() do
    Application.get_env(:my_app, :body_class, nil)
  end
end
```

And use it in your template:

```html
<body class={body_class()}>
  <%= @inner_content %>
</body>
```

Now, you can add new CSS rules that apply only in the test environment.

```css
.env-test {
  *, *::before, *::after {
    transition: unset !important;
  }
}
```
