---
title: How to format Elixir doctests?
excerpt: I wrote a doctest formatter plugin to help you with that.
tags: [Elixir]
date: 2024-03-02 15:33:00 +0100
---

After I gave a lighting talk about my previous formatter plugin, [Markdown Code Block Formatter](https://angelika.me/2024/01/27/format-elixir-code-blocks-in-markdown/), a person from the audience (hi Tobi!) asked me whether they could use it to format doctests. The answers was no... so I wrote another plugin that could do it!

It's called **[Doctest Formatter](https://hex.pm/packages/doctest_formatter)**. Check out [its documentation on HexDocs](https://hexdocs.pm/doctest_formatter/readme.html) and [its source on GitHub](https://github.com/angelikatyborska/doctest_formatter/).

## Installation

The package can be installed by adding `doctest_formatter` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:doctest_formatter, "~> 0.2.0", runtime: false}
  ]
end
```

Then, extend your `.formatter.exs` config file by adding the plugin.

```elixir
# .formatter.exs
[
  plugins: [DoctestFormatter],
  inputs: [
    # your usual inputs ...
  ]
]
```

Elixir 1.13.2 or up is required. Versions lower than 1.13 do not support formatter plugins, and versions 1.13.0 and 1.13.1 do not support formatter plugins for `.ex` files.

## Usage

Run `mix format`. Now, this command will not only format your `.ex` files but also the Elixir code in your doctests, inside your `@doc` and `@moduledoc` attributes.

In addition to formatting the Elixir code, it will also format your `iex>` prompts. Every `iex>` prompt that is not the first line of the test, will get changed to `...>`. This is not strictly necessary, but [it's recommended in the docs](https://hexdocs.pm/ex_unit/ExUnit.DocTest.html#module-syntax).

It should work for every possible valid syntax of doctests, as long as it's a static value ([see known limitations](https://hexdocs.pm/doctest_formatter/readme.html#known-limitations)). [Please open an issue](https://github.com/angelikatyborska/doctest_formatter/issues) if you find any bugs.

<figure>
<a href='{% asset posts/format-elixir-doctests/mix-format @path %}'>
{% asset posts/format-elixir-doctests/mix-format alt="Running mix format in the terminal formats doctests inside @doc and @moduledoc attributes" %}
</a>
<figcaption>The formatter in action.</figcaption>
</figure>
