---
title: Hello World web app in Elixir, part&nbsp;3 - Phoenix
excerpt: In the process of learning Elixir I am writing the same simple web app three times, using three different tools. This is the third part - the variant using the web framework Phoenix.
tags: [Elixir, Phoenix]
date: 2016-08-14 17:57:00 +0200
---

This is a continuation of [Hello World web app in Elixir, part&nbsp;2 - Plug]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-2-plug %}).

## Phoenix

[Phoenix](http://www.phoenixframework.org/) is the Elixir web framework of choice.

## Init

I'm initializing the app with Phoenix's `new` task. I opt out of [Ecto](https://github.com/elixir-ecto/ecto) because I won't be using a database, and [Brunch](https://github.com/brunch/brunch), because I won't have any front-end parts.

```bash
$ mix phoenix.new hello_world --no-brunch --no-ecto
```

## Config

I'm changing the port in the development config file:

```elixir
# config/dev.exs
config :hello_world, HelloWorld.Endpoint,
  http: [port: 8003]
```

## HelloWorld.Router

I'm deleting the default routes and adding my own:

```elixir
# web/router.ex
defmodule HelloWorld.Router do
  use HelloWorld.Web, :router

  scope "/", HelloWorld do
    get "/hello", HelloWorldController, :hello
    get "/hello/:name", HelloWorldController, :hello

    get "/*path", HelloWorldController, :goodbye
    post "/*path", HelloWorldController, :goodbye
    put "/*path", HelloWorldController, :goodbye
    patch "/*path", HelloWorldController, :goodbye
    delete "/*path", HelloWorldController, :goodbye
  end
end

```

There is no way to match every method at once ([and that's on purpose](https://github.com/phoenixframework/phoenix/issues/977#issuecomment-114073692)). I have to add routes for each method separately.

## HelloWorld.HelloWorldController

```elixir
# web/controllers/hello_world_controller.ex
defmodule HelloWorld.HelloWorldController do
  use HelloWorld.Web, :controller

  def hello(conn, params) do
    name = params["name"] || "World"
    body = "Hello, #{String.capitalize(name)}!"

    conn
    |> put_status(200)
    |> text(body)
  end

  def goodbye(conn, _params) do
    body = "Goodbye!"

    conn
    |> put_status(404)
    |> text(body)
  end
end
```

[`put_status/2`](https://hexdocs.pm/plug/Plug.Conn.html#put_status/2) is Plug's function for setting the response status without sending a response yet. [`text/2`](https://hexdocs.pm/phoenix/Phoenix.Controller.html#text/2) is a Phoenix's function for responding with plain text. I could have also written it exactly [like in part 2]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-2-plug %}#helloworldrouter):

```elixir
conn
|> put_resp_content_type("text/plain")
|> send_resp(200, body)
```

I don't have to do anything extra to get logging or live reloading - those come with Phoenix by default. Hooray!

## Running the app

I'm starting the app with `mix phoenix.server`:

```bash
$ curl -w "\n%{http_code}\n" http://localhost:8003/hello
Hello, World!
200

$ curl -w "\n%{http_code}\n" http://localhost:8003/hello/moon
Hello, Moon!
200

$ curl -X POST -w "\n%{http_code}\n" http://localhost:8003/hello
Goodbye!
404

$ curl -w "\n%{http_code}\n" http://localhost:8003/
Goodbye!
404
```

If this was a real project, I should probably also delete all that unneeded stuff that `mix phoenix.new` generated. Not to mention all of the tests I **should have** written... let's just skip that for the sake of the length of this post.

## Conclusion

Using only Cowboy to write a web app was hard for me. The official documentation is in Erlang. The examples found on the web are mostly for Cowboy v.1 and I wanted to try out the v.2 prelease, and by doing so I only made the whole process more difficult. Remix doesn't work really well with Cowboy's routing - live reloading didn't work for me in that case. I wouldn't want to develop a bigger bare Cowboy app anytime soon.

Using Plug was comfortable enough. It seems like a good fit for microservices that wouldn't have any front-end parts.

I don't have any opinions on Phoenix yet because I only spent about 30 minutes with it so far. I'm really glad I started with exploring Cowboy and Plug first. Phoenix does not feel like magic from the very beginning (unlike Rails, which I started learning without a solid foundation in Ruby, not to mention any knowledge of Rack). I'm looking forward to developing something more complicated with Phoenix soon.


## Links
- [Source on GitHub](https://github.com/angelikatyborska/hello-world-elixir-web-app-in-3-variants/tree/master/variant-3-phoenix)
- [Part 1 - Cowboy]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-1-cowboy %})
- [Part 2 - Plug]({% post_url 2016-08-14-hello-world-web-app-in-elixir-part-2-plug %})
