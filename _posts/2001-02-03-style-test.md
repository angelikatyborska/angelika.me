---
title: Style test
excerpt: Test post containing all the possible styles and elements that I use on my blog. Used as a test page.
tags: []
date: 2001-02-03 14:15:16 +0100
hidden: true
---

http://0.0.0.0:5500/2001/02/03/style-test/

Odit `quibusdam` tempore deserunt. _Sapiente magni amet alias_ nostrum et maiores. Dolorum deleniti <mark>dolore fugiat</mark> dolorem quis.

Quam architecto ~~dicta et omnis~~ explicabo deleniti libero nihil. Dolores aut laboriosam provident. **Pariatur fugiat accusamus eos**. Consequuntur sint ratione non vel accusamus voluptatem.

Inventore <a href="#">in porro voluptatem<a/>. Quia quasi aliquam neque velit officia iste autem. Id ex minus deserunt explicabo provident ratione nostrum. Neque `quod velit exercitationem eaque sit sunt nesciunt dolore`. Itaque quia ut excepturi numquam quis.

Eveniet quibusdam nemo eum. Perspiciatis labore et sit necessitatibus. Provident eum aut vel. Laborum dolor dolores doloribus repellendus illum et non. Qui culpa neque excepturi. Sed sint voluptates ipsam in velit possimus molestias.

## Heading 2

Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

### Heading 3

Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

#### Heading 4

Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

##### Heading 5

Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

###### Heading 6

Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

## Quotes

> Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

> Duplicate ID `color`
>
> <code>&lt;div>↩    <mark>&lt;input type="radio" id="color" name="color" value="blue"></mark>↩</code>
>
> The first occurrence of ID `color` was here
>
> <code>&lt;div>↩    <mark>&lt;input type="radio" id="color" name="color" value="red"></mark>↩</code>

Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.

## Lists, short items

- One
- Two
  - Two and 1/4th
  - Two and a half
    - Two and 6/11ths
  - Two and 3/4ths
- Maybe even three
- Possibly four

1. Another list
2. Two
   1. Two and 1/4th
   2. Two and a half
   3. Two and 3/4ths
3. Three
4. ???

## Lists, long items

- Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.
- Quam architecto dicta et omnis explicabo deleniti libero nihil. Dolores aut laboriosam provident. Pariatur fugiat accusamus eos. Consequuntur sint ratione non vel accusamus voluptatem.
- Inventore in porro voluptatem. Quia quasi aliquam neque velit officia iste autem. Id ex minus deserunt explicabo provident ratione nostrum. Neque quod velit exercitationem eaque sit sunt nesciunt dolore. Itaque quia ut excepturi numquam quis.
- Eveniet quibusdam nemo eum. Perspiciatis labore et sit necessitatibus. Provident eum aut vel. Laborum dolor dolores doloribus repellendus illum et non. Qui culpa neque excepturi. Sed sint voluptates ipsam in velit possimus molestias.

Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.

## Figure with caption and link

<figure>
<a href='{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-0 @path %}'>
{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-0 alt="TipTap editor with a paragraph and two images. The two images are black-and-white photos of a desert. The editor's UI does not show us which image has alt text." %}
</a>
<figcaption>One of those images has alt text, the other doesn't. But which one is which? Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.</figcaption>
</figure>

Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.

<figure>
<a href='{% asset posts/colorizing-names/issues-sum @path %}'>
{% asset posts/colorizing-names/issues-sum class='half-width' alt='Problems with summing character codes'%}
</a>
<figcaption>Problems with summing character codes</figcaption>
</figure>

## Code

```html
<header>
    <h1>Style test</h1>
    <div class="post-meta">
      <span class="date"><span class="sr-only">Written on </span>03 February 2001</span>
      <span class="time-estimate">
        
        1 min read
      </span>
      <span class="tags"><span class="sr-only">Topics covered </span></span>
    </div>
  </header>
```

Eveniet quibusdam nemo eum. Perspiciatis labore et sit necessitatibus. Provident eum aut vel. Laborum dolor dolores doloribus repellendus illum et non. Qui culpa neque excepturi. Sed sint voluptates ipsam in velit possimus molestias.

```js
document.addEventListener('DOMContentLoaded', function() {
  var html = document.querySelector('html');
  var input = document.querySelector('.dark-mode-switch-input');
  var label = document.querySelector('.dark-mode-switch-label');
  var savedMode = window.localStorage.getItem('dark');

  if (savedMode === 'true') {
    toggleMode();
  }

  function toggleMode() {
    if (html.hasAttribute('data-dark')) {
      html.removeAttribute('data-dark');
      label.innerHTML = '<span class=\"sr-only\">Dark mode </span>☀️'
      window.localStorage.setItem('dark', 'false')
    } else {
      html.setAttribute('data-dark', 'true');
      label.innerHTML = '<span class=\"sr-only\">Dark mode </span>🌘️'
      window.localStorage.setItem('dark', 'true')
    }
  }

  input.addEventListener('click', toggleMode);
});
```

```elixir
defmodule FileSniffer do
  def type_from_extension("bmp"), do: "image/bmp"
  def type_from_extension("png"), do: "image/png"
  def type_from_extension("jpg"), do: "image/jpg"
  def type_from_extension("gif"), do: "image/gif"
  def type_from_extension("exe"), do: "application/octet-stream"
  def type_from_extension(_file_extension), do: nil

  def type_from_binary(<<0x42, 0x4D, _::binary>>), do: "image/bmp"
  def type_from_binary(<<0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, _::binary>>), do: "image/png"
  def type_from_binary(<<0xFF, 0xD8, 0xFF, _::binary>>), do: "image/jpg"
  def type_from_binary(<<0x47, 0x49, 0x46, _::binary>>), do: "image/gif"
  def type_from_binary(<<0x7F, 0x45, 0x4C, 0x46, _::binary>>), do: "application/octet-stream"
  def type_from_binary(_binary), do: nil

  def verify(binary, extension) do
    binary_type = type_from_binary(binary)
    extension_type = type_from_extension(extension)

    if binary_type == extension_type and not is_nil(binary_type) do
      {:ok, binary_type}
    else
      {:error, "Warning, file format and file extension do not match."}
    end
  end
end
```

## Keyboard shortcuts

Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.
 Press this: <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>c</kbd>. Or maybe this: <kbd>Ctrl</kbd>+<kbd>d</kbd>, <kbd>f</kbd>. Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.

## Tables

| Action | Emacs&nbsp;mode | Vi&nbsp;mode |
|:-------|:---------------:|:------------:|
| Character under the cursor | Ctrl&nbsp;+&nbsp;d | x |
| Character before the cursor | Ctrl&nbsp;+&nbsp;h | X |
| From the current position to the beginning of the line | Ctrl&nbsp;+&nbsp;u |d0|
| From the current position to the end of the line | Ctrl&nbsp;+&nbsp;k | D |
| Line | Ctrl&nbsp;+&nbsp;e, then Ctrl&nbsp;+&nbsp;u | dd |
| From the current position to the beginning of the word | Ctrl&nbsp;+&nbsp;w | db |
| From the current position to the end of the word | Alt&nbsp;+&nbsp;d&nbsp;[(*)](#alt-key) | dw |
| Word around current position | Alt&nbsp;+&nbsp;b, then Alt&nbsp;+&nbsp;d&nbsp;[(*)](#alt-key) | bdw |

| Hello | World |
| ----- |-------|
| :)    | (:    |

Odit quibusdam tempore deserunt. Sapiente magni amet alias nostrum et maiores. Dolorum deleniti dolore fugiat dolorem quis.
