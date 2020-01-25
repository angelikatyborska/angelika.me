---
title: CSRF protection in Phoenix
excerpt: If your Phoenix app uses basic authentication or cookies for authentication, you need to protect it from cross-site request forgery.
tags: [Elixir, Phoenix, security]
date: 2019-12-31 23:23:00 +0100
---

Cross-site request forgery is a type of attack that takes advantage of the fact that browsers automatically send cookies and basic auth credentials stored for a specific domain with every request made to that domain.

Many websites use session-based authentication. Once you log in on such a website by providing your password, all the requests made to the website will be automatically authenticated as coming from you based on a session id stored in the cookies.

The problem with this approach is that you can be tricked into making a request to some website you previously logged in, without realizing it.

An attacker could, for example, lead you to a malicious website with an invisible self-submitting form that does a destructive request to another website.

## How to protect your Phoenix app from CSRF

If your Phoenix app uses basic authentication or cookies for authentication, you need to protect it from cross-site request forgery.

### Safe `GET` requests

Design your application so that all requests using the `GET` method do not modify the user's state. 

`GET` requests are easiest to trick users into making unknowingly. `GET` requests are also not protected by the `CSRFProtection` plug <sup>[source](https://github.com/elixir-plug/plug/blob/00c54991e53060d04bb518f91ccea8afd22a3e86/lib/plug/csrf_protection.ex#L14-L15)</sup>.

### Limit Cross-Origin Resource Sharing

If possible, design your application in a way that doesn't require you to allow cross-origin requests from unknown origins. 

By default, cross-origin requests initiated by scripts (e.g. using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)) *do not* have access to cookies or basic authentication credentials. However, if your app relies on cookies and the client and server use different domains, it's possible you need to get around that limitation. It can be achieved by having the server respond with a header `Access-Control-Allow-Credentials` set to `true`, and using either [`Request.credentials`](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials) or [`XMLHttpRequest.withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) when making the request.

If `Access-Control-Allow-Credentials` is set to `true`, and the value of `Access-Control-Allow-Origin` includes some domains that are not under your control, your app might become vulnerable to CSRF.

<figure>
<a href='{% asset_path posts/csrf-protection-in-phoenix/credentials-not-supported-if %}'>
{% img posts/csrf-protection-in-phoenix/credentials-not-supported-if alt:'A screenshot of a dev console in Firefox demonstrating an error when trying to use fetch with credentials '%}
</a>
<figcaption>Technically, browsers won't allow a cross-origin request with credentials if <code>Access-Control-Allow-Origin</code> is set to <code>*</code> <sup><a href="https://fetch.spec.whatwg.org/#cors-protocol-and-credentials">source</a></sup>, but that's not the only value that might make your app vulnerable.
</figcaption>
</figure>

Keep in mind that limiting CORS does not protect your app from requests done in other ways where the same-origin policy does not apply, like submitting a form or inserting an image tag.

### `CSRFProtection` plug

A Phoenix app created with `mix phx.new` comes with CSRF protection in the form of the `CSRFProtection` plug. The plug itself is not part of Phoenix, so it might be used in any Elixir web application that uses `Plug`.

If you open up `my_app/lib/my_app_web/router.ex`, you'll see something like this:
```elixir
defmodule MyAppWeb.Router do
  use MyAppWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

   # more code ...

  scope "/", MyAppWeb do
    pipe_through :browser

    get "/", PageController, :index
  end
end
```

The line `plug :protect_from_forgery` calls the `CSRFProtection` plug <sup>[source](https://github.com/phoenixframework/phoenix/blob/7dbb51037c809ca5daf3d4606187ed4b285382e8/lib/phoenix/controller.ex#L1020-L1031)</sup> for all requests that go through the `:browser` pipeline. If you're writing a classic web app that responds to requests with HTML documents, you want to use the `:browser` pipeline for all of your routes. 

With this plug, all requests will require a valid CSRF token, except for `GET`, `HEAD`, and `OPTIONS` <sup>[source](https://github.com/elixir-plug/plug/blob/00c54991e53060d04bb518f91ccea8afd22a3e86/lib/plug/csrf_protection.ex#L108)</sup>.

A token can be added to the request either by a `_csrf_token` request param, or a `x-csrf-token` header <sup>[source](https://github.com/elixir-plug/plug/blob/00c54991e53060d04bb518f91ccea8afd22a3e86/lib/plug/csrf_protection.ex#L11-L12), [source](https://github.com/elixir-plug/plug/blob/00c54991e53060d04bb518f91ccea8afd22a3e86/lib/plug/csrf_protection.ex#L318-L319)</sup>.

When a token gets generated, it gets stored on the server in a session. For every request that requires a valid CSRF token, not only the token itself must be sent but also the cookie with the session id. The token from the session has to match the token sent in the request.

There are a few different ways to generate and send a token.

#### Forms

Use [`Phoenix.HTML.Form.form_for`](https://hexdocs.pm/phoenix_html/Phoenix.HTML.Form.html#form_for/2) when adding a form to your app. For example:

```elixir
<%= form_for @changeset, @action, fn f -> %>
  <%= label f, :name %>
  <%= text_input f, :name %>
  <%= error_tag f, :name %>

  <div>
    <%= submit "Save" %>
  </div>
<% end %>
```

The generated form will include a hidden input with a CSRF token <sup>[source](https://github.com/phoenixframework/phoenix_html/blob/d41e2f530560af0dbbbc0a2997cbc43b17e7d0c9/lib/phoenix_html/tag.ex#L196-L208)</sup>. Its value will be submitted together with the rest of the data.

<figure>
<a href='{% asset_path posts/csrf-protection-in-phoenix/hidden-input-in-form %}'>
{% img posts/csrf-protection-in-phoenix/hidden-input-in-form alt:'A screenshot of a simple Phoenix app with a form, showing the dev tools open to reveal a hidden input with the CSRF token in the form. '%}
</a>
<figcaption>Forms generated with <code>form_for</code> have a hidden input with the CSRF token.</figcaption>
</figure>

#### Links and buttons

When you need a link to a destructive action, use [`Phoenix.HTML.Link.link`](https://hexdocs.pm/phoenix_html/Phoenix.HTML.Link.html#link/2) or [`Phoenix.HTML.Link.button`](https://hexdocs.pm/phoenix_html/Phoenix.HTML.Link.html#button/2). For example:

```elixir
<%= link "Delete", to: Routes.user_path(@conn, :delete, user),
                   method: :delete,
                   data: [confirm: "Are you sure?"] %>
```

Links to routes with methods other than `GET` are implemented by creating and submitting a form when the link is clicked <sup>[source](https://github.com/phoenixframework/phoenix_html/blob/d41e2f530560af0dbbbc0a2997cbc43b17e7d0c9/priv/static/phoenix_html.js#L30-L43)</sup>. The generated link has a CSRF token in a `data-csrf` attribute. This token submitted with the ad-hoc form. 

<figure>
<a href='{% asset_path posts/csrf-protection-in-phoenix/data-csrf-on-a-link %}'>
{% img posts/csrf-protection-in-phoenix/data-csrf-on-a-link alt:'A screenshot of a simple Phoenix app with a list of users and links to delete them, showing the dev tools open to reveal a data-csrf attribute on the links. '%}
</a>
<figcaption>Links generated with <code>link</code> have a <code>data-csrf</code> attribute with the CSRF token.</figcaption>
</figure>


#### Other use cases

In case you need more control over the request than `form_for` or `link` allow for, you need to generate and send the token on your own.

You can use [`Phoenix.HTML.Tag.csrf_meta_tag`](https://hexdocs.pm/phoenix_html/Phoenix.HTML.Tag.html#csrf_meta_tag/0) to put a CSRF token in the `<head>` of your document as a meta tag.

Use it in your layout (e.g. `lib/my_app_web/templates/layout/app.html.eex`), for example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>MyApp · Phoenix Framework</title>
    <%= csrf_meta_tag() %>
    <link rel="stylesheet" href="<%= Routes.static_path(@conn, "/css/app.css") %>"/>
  </head>
<!-- more HTML... -->
```

<figure>
<a href='{% asset_path posts/csrf-protection-in-phoenix/csrf-meta-tag %}'>
{% img posts/csrf-protection-in-phoenix/csrf-meta-tag alt:'A screenshot of a simple Phoenix app, showing the dev tools open to reveal a meta tag in the head containing a CSRF token. '%}
</a>
<figcaption>A <code>meta</code> tag with a CSRF token.</figcaption>
</figure>

You can access this token from every page that uses the layout you added it to. The token is valid for every route of your app.

In your JavaScript, you can read and use the token with:
```javascript
const meta = document.querySelector('meta[name="csrf-token"]');
const token = meta.content;
const method = ''; // e.g. 'POST', 'DElETE'
const url = '';

fetch(url, { method: method, headers: { 'x-csrf-token': token } });
```

Alternatively, if you don't want to put the token in the `<head>` of every page, you can put it in a data attribute of a specific element that needs it. Use [Phoenix.Controller.get_csrf_token](https://hexdocs.pm/phoenix/Phoenix.Controller.html#get_csrf_token/0) or [Plug.CSRFProtection.get_csrf_token_for](https://hexdocs.pm/plug/Plug.CSRFProtection.html#get_csrf_token_for/1) to generate the token. This method of including the token on the page might be necessary if you're using JavaScript to follow links by replacing page fragments and cannot rely on the `<head>` (e.g. [Unpoly](https://unpoly.com/up.link)).
