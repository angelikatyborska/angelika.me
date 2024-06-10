---
title: Automated accessibility testing for Elixir web applications
excerpt: Integrate Axe into your Elixir browser tests with my new library, A11yAudit.
tags: [Elixir, accessibility, testing]
date: 2024-06-10 06:15:00 +0200
---

[Axe](https://github.com/dequelabs/axe-core) is an accessibility testing engine for websites and other HTML-based user interfaces. You can use it as a [Chrome extension](https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd), [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/), [VSCode extension](https://marketplace.visualstudio.com/items?itemName=deque-systems.vscode-axe-linter), as part of Google Lighthouse, and in [many other ways](https://github.com/dequelabs/axe-core/blob/develop/doc/projects.md).

All of those methods are good, but you need to remember to use them, and also all of your teammates need to remember to use them. **Wouldn't it be great if accessibility checks could run automatically on CI?**

To achieve that, I wrote an Elixir library called [**A11yAudit**](https://github.com/angelikatyborska/a11y-audit-elixir
) that integrates [axe-core](https://github.com/dequelabs/axe-core) into ExUnit assertions, which you can use in your browser-based tests.

## Installation

The library can be installed by adding `a11y_audit` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:a11y_audit, "~> 0.1.0", only: :test}
  ]
end
```

## Usage

A11yAudit provides assertions for browser-based tests. It has no-setup-required assertions for the two most popular browser testing tools in Elixir, [Wallaby](https://github.com/elixir-wallaby/wallaby) and [Hound](https://github.com/HashNuke/hound).

A11yAudit does not crawl your website. Instead, it relies on you adding the assertions to your tests in the right places. Ideally, you would run the assertion on each page at least once. On pages that can be modified by user interaction with JavaScript or LiveView, you might want to run the assertion more than once.

<figure>
<a href='{% asset posts/automated-accessibility-testing-for-elixir-web-apps/critical-issue @path %}'>
{% asset posts/automated-accessibility-testing-for-elixir-web-apps/critical-issue alt="Expected page to have no accessibility violations, but got 1 violation. Form elements must have labels." %}
</a>
<figcaption>Accessibility violations will cause your tests to fail, printing all violations sorted by severity.</figcaption>
</figure>

### Usage with Wallaby

Call `A11yAudit.Wallaby.assert_no_violations/1` in your [Wallaby](https://github.com/elixir-wallaby/wallaby) tests.

```elixir
defmodule MyAppWeb.HomeTest do
  use ExUnit.Case, async: true
  use Wallaby.Feature

  feature "home page", %{session: session} do
    session
    |> visit("/")
    |> assert_has(Query.css("h1", text: "My App"))
    |> A11yAudit.Wallaby.assert_no_violations()
  end
end
```

### Usage with Hound

Call `A11yAudit.Hound.assert_no_violations/0` in your [Hound](https://github.com/HashNuke/hound) tests.

```elixir
defmodule MyAppWeb.HomeTest do
  use ExUnit.Case
  use Hound.Helpers

  test "home page" do
    navigate_to("#{MyAppWeb.Endpoint.url()}/")

    heading = find_element(:css, "h1")
    assert inner_text(heading) == "My App"

    A11yAudit.Hound.assert_no_violations()
  end
end
```

### For other environments

If you're running browser-based tests in Elixir without using Wallaby or Hound, you can still use A11yAudit. You will need a way to execute JavaScript snippets, and to get their return values back into your Elixir code. Assuming you have an `execute_script` function that can do that, you can use the test assertions like so:

```elixir
get_audit_result =
  fn ->
    execute_script(A11yAudit.JS.axe_core())
    axe_result_map = execute_script(A11yAudit.JS.await_audit_results())
    A11yAudit.Results.from_json(axe_result_map)
  end

A11yAudit.Assertions.assert_no_violations(get_audit_result.())
```

## Feedback welcome

Please [create a GitHub issue](https://github.com/angelikatyborska/a11y-audit-elixir/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) if you're having trouble with using this library, found a bug, or have suggestions for improvements. I'm looking forward to your feedback! 

## Disclaimer

[There are two kinds of accessibility issues, objective and subjective](https://www.a11yproject.com/posts/should-i-use-an-accessibility-overlay/#quality), and automated testing can only detect the first kind. Thus, it should always be used together with manual testing. 

## Need more?

If you're looking for more automated quality assurance for your Elixir web apps, check out my [Elixir client for the W3C HTML validator](https://github.com/angelikatyborska/vnu-elixir/).

If you're looking for more high-quality information about web accessibility, check out [The A11y Project](https://www.a11yproject.com/).
