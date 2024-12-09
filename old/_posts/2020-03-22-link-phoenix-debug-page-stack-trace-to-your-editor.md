---
title: Link Phoenix debug page stack trace to your editor
excerpt: You can configure Plug.Debugger to generate links that open the line that caused the error in your editor.
tags: [Phoenix, Plug, Elixir]
date: 2020-03-22 16:28:00 +0100
---

If you ever worked on a Phoenix app, you might have seen this debug page when an error is raised:

<figure>
<a href='{% asset posts/link-phoenix-debug-page-stack-trace-to-your-editor/error-page.png @path %}'>
  {% asset posts/link-phoenix-debug-page-stack-trace-to-your-editor/error-page.png alt='A debug page of a Phoenix app' %}
</a>
</figure>

Generating those debug pages when an error happens is a feature turned on by setting `config :my_app, MyAppWeb.Endpoint, debug_errors: true`, which can be found in `config/dev.exs` of a freshly-created Phoenix app. It actually comes from `Plug.Debugger`, not Phoenix itself <sup>([source](https://github.com/phoenixframework/phoenix/blob/c0269e3768bc1de7826698ed202ac739cc1d45ca/lib/phoenix/endpoint.ex#L419-L421))</sup>.

```elixir
# phoenixframework/phoenix - lib/phoenix/endpoint.ex#L419-L421
if var!(config)[:debug_errors] do
  use Plug.Debugger,
    otp_app: @otp_app,
```

`Plug.Debugger` offers an option to generate links in the stack trace directly to your editor <sup>([source](https://github.com/elixir-plug/plug/blob/45165d978e59d18df8b8085e4e158997dcac19a3/lib/plug/debugger.ex#L80-L89))</sup>.

```elixir
# elixir-plug/plug - lib/plug/debugger.ex#L80-L89
"""
If a `PLUG_EDITOR` environment variable is set, `Plug.Debugger` will
use it to generate links to your text editor. The variable should be
set with `__FILE__` and `__LINE__` placeholders which will be correctly
replaced. For example (with the [TextMate](http://macromates.com) editor):

  txmt://open/?url=file://__FILE__&line=__LINE__

Or, using Visual Studio Code:

  vscode://file/__FILE__:__LINE__
"""
```

You will need to find out if your editor supports a custom URL scheme that will open files in it. In `Plug.Debugger`'s code, there are examples for **TextMate** (`txmt://open/?url=file://__FILE__&line=__LINE__`) and **Visual Studio Code** (`vscode://file/__FILE__:__LINE__`).

I personally use **RubyMine**, which supports the scheme `x-mine`, which means I can build URLs like this: `x-mine://open?file=__FILE__&line=__LINE__`.

You can always try out if the custom scheme works for you by trying to open in your browser a link to a file that exists on your machine, e.g. `x-mine://open?file=/Users/angelika/.gitignore&line=3`

Once you figure out your editor's custom URL scheme and how to pass the file name and line number in that URL, you need to set the environment variable `PLUG_EDITOR` to that URL. Make sure to use `__FILE__` as the file name placeholder and `__LINE__` as the line number placeholder.

How to achieve that depends on your operating system and shell. On macOS, using bash as my shell, I needed to add this line to my `~/.bash_profile`:

```bash
# ~/.bash_profile
export PLUG_EDITOR='x-mine://open?file=__FILE__&line=__LINE__'
```

Before restarting your Phoenix server to see the results, do not forget to reload the file (`. ~/.bash_profile`) in an existing shell session or just open a new session.

## Result

<figure>
<a href='{% asset posts/link-phoenix-debug-page-stack-trace-to-your-editor/link-stack-trace.gif @path %}'>
  {% asset posts/link-phoenix-debug-page-stack-trace-to-your-editor/link-stack-trace.gif alt='A gif showing a debug page in Phoenix and how clicking on a file name opens that file in RubyMine' %}
</a>
<figcaption>When I click on the file name in the stack trace, that file opens in RubyMine, on the line that caused the error.</figcaption>
</figure>
