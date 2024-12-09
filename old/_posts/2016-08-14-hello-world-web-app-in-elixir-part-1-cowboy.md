---
title: Hello World web app in Elixir, part&nbsp;1 - Cowboy
excerpt: In the process of learning Elixir I am writing the same simple web app three times, using three different tools. This is the first part - the variant using only the Cowboy web server.
tags: [Elixir, Cowboy]
date: 2016-08-14 17:55:00 +0200
---

A software developer, like any other social animal, wants to feel accepted by its herd. Among many ways of achieving that, [keeping up with the trends in an ever-changing industry](http://www.commitstrip.com/en/2016/04/26/the-just-got-back-from-a-conference-effect/) is essential. In an attempt at being a *trendy* Ruby dev, I decided to learn Elixir, and because I am a web developer, I want to know how to build web apps.

But before I dive into the high-level web framework Phoenix, I want to get to know the lower-level parts first. Hence I will build three identical apps in three different variants - each using a set of tools that extends the previous one.

## Specifications

Not to overcomplicate matters, my Hello World app will respond with plain text and will have those endpoints:

- `GET /hello` returns a `200` plain text response `"Hello, World!"`
- `GET /hello/:name` returns a `200` plain text response `"Hello, #{name}!"`
- Anything else returns a `404` plain text response `"Goodbye!"`

## Cowboy

[Cowboy](https://github.com/ninenines/cowboy) is an Erlang HTTP server. Which won't stop us from using it because "[Elixir provides excellent interoperability with Erlang libraries](http://elixir-lang.org/getting-started/erlang-libraries.html)". In fact, it is **the** web server that [Plug](https://github.com/elixir-lang/plug) and, by extension, [Phoenix](http://www.phoenixframework.org/) use.

## Mixfile

I am going to use the newest version of Cowboy. Currently, it's `2.0.0-pre.3`. It hasn't been published to [Hex](https://hex.pm/packages/cowboy) yet, so I need to fetch it from GitHub. I am also adding [Remix](https://github.com/AgilionApps/remix) which is a little tool that will recompile my code on any changes to the source files.

```elixir
# mix.exs
defmodule HelloWorld.Mixfile do
  use Mix.Project

  def project do
    [
      app: :hello_world,
      version: "0.1.0",
      elixir: "~> 1.3",
      deps: deps
    ]
  end

  def application do
    [
      mod: {HelloWorld, []},
      applications: applications(Mix.env)
    ]
  end

  defp applications(:dev), do: applications(:all) ++ [:remix]
  defp applications(_), do: [:cowboy]

  defp deps do
    [
      {:cowboy, tag: "2.0.0-pre.3",
        git: "https://github.com/ninenines/cowboy"},
      {:remix, "~> 0.0.1", only: :dev}
    ]
  end
end
```

This line means that a `HelloWorld` module is going to be the entry point to my project, and [it needs](http://elixir-lang.org/docs/stable/elixir/Application.html#module-application-module-callback) to define a [`start/2` function](http://elixir-lang.org/docs/stable/elixir/Application.html#start/2):

```elixir
mod: {HelloWorld, []}
```

I only want to use Remix in the development environment, so I need to define my application's applications in an environment-aware way:

```elixir
def application do
  [applications: applications(Mix.env)]
end
  
defp applications(:dev), do: applications(:all) ++ [:remix]
defp applications(_), do: [:cowboy]
```

## Config

I do not want to hardcode the port number in the source code, so I am adding it to the config file.

```elixir
# config/config.exs
use Mix.Config

config :hello_world, port: 8001
```

## HelloWorld

I am going to follow the Cowboy's guide on how to [listen for connections](http://ninenines.eu/docs/en/cowboy/2.0/guide/getting_started/#_listening_for_connections). That's not exactly trivial, because the guide is in Erlang, and I do not know Erlang. Luckily I had some assistance from a helpful and more skilled co-worker of mine.

```elixir
defmodule HelloWorld do
  require Logger
  use Application

  def start(_type, _args) do
    port = Application.get_env(:hello_world, :port)

    path_list = [
      {"/hello/[:name]", HelloWorld.HelloHandler, []},
      {"/[...]", HelloWorld.GoodbyeHandler, []},
    ]

    routes = [{:_, path_list}]
    dispatch = :cowboy_router.compile(routes)
    opts = [port: port]
    env = [dispatch: dispatch]
    onresponse = fn(status, _headers, _body, request) ->
      method = :cowboy_req.method(request)
      path = :cowboy_req.path(request)
      Logger.info("#{method} #{path} - #{status}")
      request
    end

    :cowboy.start_http(:http, 100, opts,
      [env: env, onresponse: onresponse])
  end
end
```

This is how to read values form the config files:

```elixir
port = Application.get_env(:hello_world, :port)
```

Cowboy needs a [mapping of host/path matches to modules that handle the request](http://ninenines.eu/docs/en/cowboy/2.0/guide/routing/). This will match the paths in `path_list` for all host names:

```elixir
routes = [{:_, path_list}]
```

The path list is a list of 3-tuples:

```elixir
path_list = [
 {"/hello/[:name]", HelloWorld.HelloHandler, []},
 {"/[...]", HelloWorld.GoodbyeHandler, []},
]
```

The first element in the tuple is a path matcher. `:name` will capture a segment and store it under the key `:name`. A segment is a part of the path between two slashes. Surrounding `:name` with `[]` makes it optional. `[...]` will match everything to the end of the path.

The second element is the name of the module that will handle the request. The handler [has to implement a `init/2` function](http://ninenines.eu/docs/en/cowboy/2.0/guide/handlers/) which responds to requests. This function has to return a 3-tuple, where the first element is the atom `:ok`, the second is the request, and the third is a state that would be passed to subsequent callbacks, except that usually [plain HTTP handlers do not have callbacks other than `init`](http://ninenines.eu/docs/en/cowboy/2.0/guide/handlers/#_plain_http_handlers).

The third element is a list of options that will be passed to the handler's `init` function as the second argument.

Notice that there is no matching on request methods anywhere. I will have to check the request's method in `HelloHandler` myself because I only want to allow `GET` requests.

To log responses, I'm defining a [`onresponse` hook](http://ninenines.eu/docs/en/cowboy/2.0/guide/hooks/#_onresponse). It has to return the request.

```elixir
onresponse = fn(status, _headers, _body, request) ->
  method = :cowboy_req.method(request)
  path = :cowboy_req.path(request)
  Logger.info("#{method} #{path} - #{status}")
  request
end
```

Then I'm finally starting the HTTP server:

```elixir
:cowboy.start_http(:http, 100, opts,
  [env: env, onresponse: onresponse])
```

The second argument here is [the number of acceptor processes](http://ninenines.eu/docs/en/cowboy/2.0/manual/cowboy/#_start_http_ref_nbacceptors_transopts_protoopts_8594_ok_pid) - processes that will wait for connections only to spawn a new process that will handle the connection.

## HelloHandler

```elixir
defmodule HelloWorld.HelloHandler do
  def init(request, options) do
    if (:cowboy_req.method(request) == "GET") do
      name = :cowboy_req.binding(:name, request, "World")
      headers = [{"content-type", "text/plain"}]
      body = "Hello, #{String.capitalize(name)}!"

      request2 = :cowboy_req.reply(200, headers, body, request)
      {:ok, request2, options}
    else
      HelloWorld.GoodbyeHandler.init(request, options)
    end
  end
end
```

I'm "redirecting" the request to the other handler if it's not a `GET` request:

```elixir
    if (:cowboy_req.method(request) == "GET") do
     # code ommited
    else
      HelloWorld.GoodbyeHandler.init(request, options)
    end
```

This line reads the value under the key `:name` captured from the path. If it does not exist, it returns the default value "World":

```elixir
name = :cowboy_req.binding(:name, request, "World")
```

`:cowboy_req.reply` returns a modified request object that I have to return in my handler's `init` function.

## GoodbyeHandler

```elixir
defmodule HelloWorld.GoodbyeHandler do
  def init(request, options) do
    headers = [{"content-type", "text/plain"}]
    body = "Goodbye!"

    request2 = :cowboy_req.reply(404, headers, body, request)
    {:ok, request2, options}
  end
end
```

## Running the app

I am starting the app with `mix run --no-halt` and trying it out:

```bash
$ curl -w "\n%{http_code}\n" http://localhost:8001/hello
Hello, World!
200

$ curl -w "\n%{http_code}\n" http://localhost:8001/hello/reader
Hello, Reader!
200

$ curl -X PUT -w "\n%{http_code}\n" http://localhost:8001/hello
Goodbye!
404

$ curl -w "\n%{http_code}\n" http://localhost:8001/banana
Goodbye!
404
```

Works as expected!

### Observer

For debugging purposes, it's useful to know about a tool called [Observer](http://erlang.org/doc/man/observer.html). If I start my app with `iex -S mix` instead, I can observe it.

```
iex(1)> :observer.start
```

This command should open a window where I can see, among many other things, my app's process tree:

<figure>
{% asset posts/hello-world-web-app-in-elixir-part-1-cowboy/hello-world alt:"The app's process tree"%}
<figcaption>Not much here, huh?</figcaption>
</figure>

But wait, that's all? Where are those acceptor processes I have presumably run? Double-clicking on the process `<0.142.0>` reveals its details. It has a link to `<0.143.0>`.

<figure>
{% asset posts/hello-world-web-app-in-elixir-part-1-cowboy/process-information alt='Process information'%}
<figcaption>I don't know who you are, <0.143.0>, but I will find you and I will inspect your tree.</figcaption>
</figure>

It turns out `<0.143.0>` is a part of an application used internally by Cowboy - [Ranch](https://github.com/ninenines/ranch). I can see that there are in fact 100 acceptor processes there, waiting for connections.

<figure>
{% asset posts/hello-world-web-app-in-elixir-part-1-cowboy/ranch-100 alt:"Ranch's process tree"%}
<figcaption>Here they are! All 100 of them (notice the long scrollbar).</figcaption>
</figure>

It's not exactly important at the moment, it's just a little trick that might come in handy once I start building more complex apps.

## Links
- [Source on GitHub](https://github.com/angelikatyborska/hello-world-elixir-web-app-in-3-variants/tree/master/variant-1-cowboy)
- [Part 2 - Plug]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-2-plug %})
- [Part 3 - Phoenix]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-3-phoenix %})
