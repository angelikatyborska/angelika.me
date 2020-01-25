---
title: Hello World web app in Elixir, part&nbsp;2 - Plug
excerpt: In the process of learning Elixir I am writing the same simple web app three times, using three different tools. This is the second part - the variant using Plug.
tags: [Elixir, Plug]
date: 2016-08-14 17:56:00 +0200
---

This is a continuation of [Hello World web app in Elixir, part&nbsp;1 - Cowboy]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-1-cowboy %}). I am going to reference that post a few times because there are many similarities between the two apps, so you should probably read that first.

## Plug

[Plug](https://github.com/elixir-lang/plug) is a little bit like Ruby's Rack. It provides adapters for different web servers, similar to Rack handlers. It also provides a specification for writing composable modules, similar to Rack middleware. A nice introduction to Plug can be found [here](http://www.brianstorti.com/getting-started-with-plug-elixir/).

## Mixfile

It's very similar to [the first one]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-1-cowboy %}#mixfile). I added Plug to both `deps` and `applications`. I am also using a stable older version of Cowboy, as advised in Plug's docs.

```elixir
# mix.exs
defmodule HelloWorld.Mixfile do
  use Mix.Project

  def project do
    [app: :hello_world,
     version: "0.1.0",
     elixir: "~> 1.3",
     deps: deps()]
  end

  def application do
    [
      mod: {HelloWorld, []},
      applications: applications(Mix.env)
    ]
  end

  defp applications(:dev), do: applications(:all) ++ [:remix]
  defp applications(_), do: [:cowboy, :plug]

  defp deps do
    [
      {:cowboy, "~> 1.0.0"},
      {:plug, "~> 1.0"},
      {:remix, "~> 0.0.1", only: :dev}
    ]
  end
end
```

## Config

Again, almost identical as [the first one]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-1-cowboy %}#config) except for a different port number (`8001 -> 8002`), to be able to run both apps at the same time.

```elixir
# config/config.exs
use Mix.Config
config :hello_world, port: 8002
```

## HelloWorld

```elixir
# lib/hello_world.ex
defmodule HelloWorld do
  use Application

  def start(_type, _args) do
    port = Application.get_env(:hello_world, :port)
    Plug.Adapters.Cowboy.http(HelloWorld.Router, [],
      [port: port])
  end
end
```

I am [starting the Cowboy's HTTP server via the Plug's adapter](https://hexdocs.pm/plug/Plug.Adapters.Cowboy.html#http/3).
 
```elixir
 Plug.Adapters.Cowboy.http(HelloWorld.Router, [], [port: port]) 
```

The first argument, `HelloWorld.Router`, is a module that adheres to the [Plug's specification](https://hexdocs.pm/plug/Plug.html). The second argument, `[]`, is a list of options that will be passed to the module's `init` function. The third argument is a list of options for the Cowboy's HTTP server.

I will not write a plug module from scratch myself. There already are a lot of plugs ready to be used. I will use the [Plug.Router](https://hexdocs.pm/plug/Plug.Router.html) to match paths to responses.

## HelloWorld.Router

```elixir
# lib/hello_world/router.ex
defmodule HelloWorld.Router do
  use Plug.Router

  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/hello" do
    hello(conn)
  end

  get "/hello/:name" do
    hello(conn, name)
  end

  match _ do
    goodbye(conn)
  end

  defp hello(conn, name \\ "World") do
    body = "Hello, #{String.capitalize(name)}!"

    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, body)
  end

  defp goodbye(conn) do
    body = "Goodbye!"

    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(404, body)
  end
end
```

The router is a plug itself, but also has its own plug pipeline. This one line takes care of [logging](https://hexdocs.pm/plug/Plug.Logger.html):

```elixir
plug Plug.Logger
```

Those two plugs are necessary to be able to use the Plug's router DSL:

```elixir
plug :match
plug :dispatch
```

I'm using the [`get` macro](https://hexdocs.pm/plug/Plug.Router.html#get/3) to match `GET` requests:

```elixir
get "/hello" do
  hello(conn)
end

get "/hello/:name" do
  hello(conn, name)
end
```

As far as I know there is no way to define an optional segment in the path, so I need to match the two paths separately and use a `hello` function with an argument with a default value to [respond](https://hexdocs.pm/plug/Plug.Conn.html#send_resp/3) to the requests [with plain text](https://hexdocs.pm/plug/Plug.Conn.html#put_resp_content_type/3):

```elixir
defp hello(conn, name \\ "World") do
  body = "Hello, #{String.capitalize(name)}!"

  conn
  |> put_resp_content_type("text/plain")
  |> send_resp(200, body)
ene
```

Here I'm using the `match` macro to match all the other paths and methods:

```elixir
match _ do
  goodbye(conn)
end
```

## Running the app

I am starting the app with `mix run --no-halt` and trying it out:

```bash
$ curl -w "\n%{http_code}\n" http://localhost:8002/hello
Hello, World!
200

$ curl -w "\n%{http_code}\n" http://localhost:8002/hello/john
Hello, John!
200

$ curl -X POST -w "\n%{http_code}\n" http://localhost:8002/hello
Goodbye!
404

$ curl -w "\n%{http_code}\n" http://localhost:8002/hi
Goodbye!
404
```

## Links
- [Source on GitHub](https://github.com/angelikatyborska/hello-world-elixir-web-app-in-3-variants/tree/master/variant-2-plug)
- [Part 1 - Cowboy]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-1-cowboy %})
- [Part 3 - Phoenix]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-3-phoenix %})
