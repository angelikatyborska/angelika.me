---
title: How to require the document to start with an h1 in TipTap?
excerpt: If we're writing a blog post editor, something that we might need is to require the blog post to start with a title. That's something that TipTap can do for us.
tags: [JavaScript, TipTap]
date: 2023-03-07 10:22:00 +0100
---

[TipTap](https://tiptap.dev/) is a headless framework for creating rich text editors, based on [ProseMirror](https://prosemirror.net/). TipTap's high-level abstractions make it fast and easy to get a basic editor up and running.

If we're writing a blog post editor, something that we might need is to require the blog post to start with a title (`h1`). We could implement a title as a separate field, completely outside of TipTap.

But it's also possible to configure TipTap to require each document to start with an `h1`. This blog post will show you how to achieve that.

**TL;DR**: Here's the [demo](https://angelikatyborska.github.io/tiptap-require-h1/) and the [repository with the full example](https://github.com/angelikatyborska/tiptap-require-h1) from this blog post. 

Before following this tutorial, **I highly recommend reading about [TipTap's schema](https://tiptap.dev/api/schema)**.

Note that if you have existing user content that you want to load in the editor after making the changes described in this tutorial, you will need a data migration (not covered here) that prepends `h1`s to the content. If you don't do it, the editor will automatically turn the first node in the content to an `h1` when it loads.

## Starting point

Our starting point is a simple editor using the heading, bold, italic, and placeholder extensions.

Note: this blog post uses an example in React, but TipTap itself is framework-agnostic.

```jsx
// App.jsx
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";
import "./App.css";

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      History,
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    content: `<p></p>`,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="editorWrapper">
      <h1>TipTap Require H1 Demo</h1>
      <div className="editorControls">
        {([1, 2, 3, 4, 5, 6]).map((level) => {
          return (
            <button
              key={`h${level}`}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level }).run()
              }
              className={
                editor.isActive("heading", { level }) ? "is-active" : ""
              }
              disabled={
                (!editor.isActive("heading", { level }) &&
                  !editor.can().setHeading({ level })) ||
                (editor.isActive("heading", { level }) &&
                  !editor.can().toggleHeading({ level }))
              }
            >
              h{level}
            </button>
          );
        })}

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          disabled={
            (!editor.isActive("bold") && !editor.can().setBold()) ||
            (editor.isActive("bold") && !editor.can().unsetBold())
          }
        >
          bold
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          disabled={
            (!editor.isActive("italic") && !editor.can().setItalic()) ||
            (editor.isActive("italic") && !editor.can().unsetItalic())
          }
        >
          italic
        </button>
      </div>
      <EditorContent editor={editor} />
      <h2>HTML Output</h2>
      <pre>{editor.getHTML()}</pre>
    </div>
  );
}
```

```css
/* App.css */
.ProseMirror p.is-editor-empty:first-of-type::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
```

See [this code on GitHub](https://github.com/angelikatyborska/tiptap-require-h1/tree/00adce381d0685edbbfa9e4d9e51328d2594d442/src).

<figure>
<a href='{% asset posts/how-to-require-document-to-start-with-h1-tiptap/step-0 @path %}'>
{% asset posts/how-to-require-document-to-start-with-h1-tiptap/step-0 alt="TipTap editor with formatting buttons: h1 to h6, bold, italic. The editing area is empty, with a placeholder text: what's on your mind?" %}
</a>
<figcaption>Starting point: empty paragraph with a placeholder.</figcaption>
</figure>

## Step 1 - document content

TipTap's editor content contains a single root node, it's the `Document` extension. To change what kind of nodes and marks are allowed in the editor content at which position, we need to modify the `Document`'s schema.

The default schema of `Document` defines its content as `"block*"`, which means it can contain any number of blocks (nodes belonging to the `"block"` group). Let's create a new `"title"` group and tell the editor that every document needs to start with a title. "Creating a group" doesn't require any special function calls - we can just come up with a group name and start using it in node schemas.

```js
const DocumentWithTitle = Document.extend({
  content: "title block+",
});

// ...

useEditor({
  extensions: [
    // Replace `Document` with `DocumentWithTitle` here
    DocumentWithTitle,
    // ...
  ]
})
```

Note that you can also use `"title block*"` instead of `"title block+"`, which will allow the user to write documents that contain the title only.

## Step 2 - custom title node

Now we need to create a node that belongs to the `"title"` group. For simplicity, we'll also use `"title"` as the node name.

We can use the `Heading` extension for this. Our title is after all a level 1 heading. But our `Title` extension doesn't replace the `Heading` extension completely. We still need the `Heading` extension to handle headings that are further down in the document.

Note the `parseHTML` property. It tells TipTap that `Title` is only an `h1` that is the first child in the document. This detail is necessary if we want other `h1`s in the document to be parsed as instances of the `Heading` node.

```jsx
const Title = Heading.extend({
  name: "title",
  group: "title",
  parseHTML: () => [{ tag: "h1:first-child" }],
}).configure({ levels: [1] });

// ...

useEditor({
  extensions: [
    DocumentWithTitle,
    // Use both:
    Title,
    Heading,
    // ...
  ],
  content: '<h1></h1><p></p>'
})
```

## Step 3 - title placeholder

It's already working, the document now always starts with an `h1` that cannot be removed. But we're missing one more detail. We want the user to notice that the empty heading is there, and it needs to be filled out.

We need a new placeholder for the title. We can configure the `Placeholder` extension to return different texts for different nodes.

```jsx
Placeholder.configure({
  showOnlyCurrent: false,
  placeholder: ({ node }) => {
    if (node.type.name === "title") {
      return "What's the title?";
    }

    return "What's the story?";
  },
}),
```

Note the `showOnlyCurrent` option needs to be set to `false` so that both the title placeholder and the paragraph placeholder can be visible at the same time.

We also need a small tweak to the styles. Previously, we used the `is-editor-emtpy` class to reveal the placeholder. This will no longer work as the editor is not considered "empty" if it contains an `h1`. We need to use the `is-empty` class that refers to the node instead, and we need `nth-child` selectors to ensure we only show the placeholder on the first `h1` and the first `p` in the document. We also want to use the `last-child` selector to hide the empty paragraph placeholder if the user added more nodes.

```css
.ProseMirror h1.is-empty:nth-child(1)::before,
.ProseMirror p.is-empty:nth-child(2):last-child::before { /* ... */ }
```

### Empty title check

If we need to detect whether the required `h1` has any content (for example to prevent the user from saving the document if it doesn't), we can do it like this:

```js
const isTitleEmpty =
  editor?.view.state.doc.firstChild?.textContent.trim() === ''
```

## Demo

Here's the working [demo](https://angelikatyborska.github.io/tiptap-require-h1/) and its [code on GitHub](https://github.com/angelikatyborska/tiptap-require-h1/tree/cd2526f2e954058908a886bff0b12e678b88a3bc/src).

<figure>
<a href='{% asset posts/how-to-require-document-to-start-with-h1-tiptap/step-3 @path %}'>
{% asset posts/how-to-require-document-to-start-with-h1-tiptap/step-3 alt="TipTap editor with formatting buttons: h1 to h6, bold, italic. The h1 to h6 buttons are disabled. The editing area is empty, with a two placeholder texts, a big one and a small one. The big one says: what's the title?, and the small one says: what's on your mind?" %}
</a>
<figcaption>End goal: empty editor with two placeholders, one for the required title, and one for the empty paragraph.</figcaption>
</figure>

## Extra step - what about other `h1`s?

At this point, we should consider what should happen with other `h1`s in the document:

1. Should there be no limitations on the number of `h1`s in the document, or
2. Should it be impossible to insert more `h1`s than the first required h1?
   1. Should all other `h1`s automatically turn into paragraphs, or
   2. Should all other `h1`s automatically turn into h2s?

Considering the pros and the cons of each approach is outside of the scope of this blog post. If we choose option 1, we're done. The other two options require a bit of extra work.

The below advice is heavily based on the [implementation of the Heading extension](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/src/heading.ts) at the time of writing. This extension adds markdown input rules (`# `) and keyboard shortcuts (`Mod-Alt-[number]`) that we need to tweak to fit our needs.

### Turn all `h1`s into paragraphs

If we want all attempts of inserting an `h1` to be impossible and result in plain paragraphs, we need to do the following:

1. Remove the `h1` button from the UI.
2. Configure the `Heading` extension not to allow level 1 headings. This will get rid of the `Mod-Alt-1` keyboard shortcut and make all `h1`s other than the title to be invalid nodes, which will automatically turn them into paragraphs when input HTML is parsed.
    ```jsx
    Heading.configure({ levels: [2, 3, 4, 5, 6] })
    ```
3. The `Heading` extension doesn't use the minimum allowed level to limit the markdown input rules. If we don't do anything, it will turn `# ` inputs into `h2`s. We need to overwrite the input rule to instead not react to `# ` input (but still react to `## ` and so on).
    ```jsx
    import { textblockTypeInputRule } from "@tiptap/react";
    // ...
    Heading.extend({
      addInputRules() {
        // this code was copied from the Heading extension
        // and modified by one character, 1 -> 2, in the RegExp 
        return this.options.levels.map((level) => {
          return textblockTypeInputRule({
            find: new RegExp(`^(#{2,${level}})\\s$`),
            type: this.type,
            getAttributes: {
              level,
            },
          });
        });
      },
    }).configure({ levels: [2, 3, 4, 5, 6] }),
    ```

### Turn all `h1`s into h2s

If we want all attempts of inserting an `h1` to be impossible and result in `h2`s instead, we need to do the following:

1. Remove the `h1` button from the UI.
2. Keep the `Heading` configuration to allow all heading levels.
3. Extend the `Heading` extension to "adjust" the heading level from 1 to 2 when the HTML is initially parsed, for keyboard shortcuts, and for markdown input rules.
    ```jsx
    import { textblockTypeInputRule } from "@tiptap/react";
   
    const adjustLevel = (level) => (level == 1 ? 2 : level);

    const CustomHeading = Heading.extend({
      // this code was copied from the Heading extension
      // and modified to turn all `h1`s into `h2`s
      parseHTML() {
        return this.options.levels.map((level) => ({
          tag: `h${level}`,
          attrs: { level: adjustLevel(level) },
        }));
      },
      addKeyboardShortcuts() {
        return this.options.levels.reduce(
          (items, level) => ({
            ...items,
            ...{
              [`Mod-Alt-${level}`]: () =>
                this.editor.commands.toggleHeading({
                  level: adjustLevel(level)
                }),
            },
          }),
          {}
        );
      },
      addInputRules() {
        return this.options.levels.map((level) => {
          return textblockTypeInputRule({
            find: new RegExp(`^(#{1,${level}})\\s$`),
            type: this.type,
            getAttributes: {
              level: adjustLevel(level),
            },
          });
        });
      },
    });
    ```

Note: with this solution, when copy-pasting HTML from another page into the editor, `h1`s will still get turned into paragraphs. I couldn't figure out how to handle that case. If you have any ideas, let me know in the comments.

See [this code as a commit on GitHub](https://github.com/angelikatyborska/tiptap-require-h1/commit/1a91db959852878935c319c1c94d24c0bb1ed9ed).
