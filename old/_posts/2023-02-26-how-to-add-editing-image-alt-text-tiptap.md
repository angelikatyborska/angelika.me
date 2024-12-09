---
title: How to allow editing image alt text in TipTap?
excerpt: Image alt text is a crucial accessibility and SEO feature that every rich text editor should support.
tags: [JavaScript, TipTap]
date: 2023-02-26 19:30:00 +0100
---

[TipTap](https://tiptap.dev/) is a headless framework for creating rich text editors, based on [ProseMirror](https://prosemirror.net/). TipTap comes with pre-built extensions which allow you to pick and choose which text editing features you want in your editor. This makes creating custom editors fitting your needs fast and easy.

But because TipTap is headless (doesn't have a UI), some of its extensions are missing some features that are tightly coupled to having a UI.

For example, editing alt text for images.

**TL;DR: Here's the [repository with the full example](https://github.com/angelikatyborska/tiptap-image-alt-text)** from this blog post. 

## Starting point

Here's our starting point: a simple editor using the image extension and the drop cursor for dragging images around. TipTap's [image extension](https://tiptap.dev/api/nodes/image) supports alt attributes for images, but doesn't have a way to edit them out of the box.

Note: this blog post uses an example in React, but TipTap itself is framework-agnostic.

```jsx
// App.jsx
import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'
import './App.css'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image,
      Dropcursor,
    ],
    content: `
    <p>There are two images below. One with alt text, and one without.</p>
    <img
      src="https://source.unsplash.com/8xznAGy4HcY/400x200"
      alt="Sandy hills with a foggy background"
    />
    <img src="https://source.unsplash.com/K9QHL52rE2k/400x200" />
  `,
  })

  if (!editor) { return null }

  return (
    <div className="editorWrapper">
      <h1>TipTap Image Alt Text demo</h1>
      <EditorContent editor={editor} />
    </div>
  )
}
```

See [this code on GitHub](https://github.com/angelikatyborska/tiptap-image-alt-text/blob/97f41bbad40a26c4eaae43ee077c99e38e58fb1e/src/App.tsx).


<figure>
<a href='{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-0 @path %}'>
{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-0 alt="TipTap editor with a paragraph and two images. The two images are black-and-white photos of a desert. The editor's UI does not show us which image has alt text." %}
</a>
<figcaption>One of those images has alt text, the other doesn't. But which one is which?</figcaption>
</figure>

## Step 1 - node view

To be able to add custom UI elements to the image, we need to use a [node view](https://tiptap.dev/guide/custom-extensions/#node-views). Thankfully we don't need to rewrite the image extension provided by TipTap - we can simply _extend_ it.

Let's create a separate file for our custom image component.

In the node view component, we can access the attributes of the image under `props.node.attrs`. We're adding a custom `image` class to the component to allow for some styling which will be necessary for the custom UI components that we add to the image later.

The class `ProseMirror-selectednode` gets added to nodes by default when the node is selected. For nodes that have a custom node view, we need to add the class explicitly.

TipTap images are draggable by default. For nodes that have a custom node view, we need to add the data attribute `data-drag-handle` somewhere in the component to make it draggable again.

```jsx
// Image.jsx
import Image from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import './Image.css'

function ImageNode(props) {
  const { src, alt } = props.node.attrs

  let className = 'image'
  if (props.selected) { className += ' ProseMirror-selectednode'}

  return (
    <NodeViewWrapper className={className} data-drag-handle>
      <img src={src} alt={alt} />
    </NodeViewWrapper>
  )
}

export default Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode)
  }
})
```

```jsx
// App.jsx
// Replace `import Image from '@tiptap/extension-image'` with:
import CustomImage from './Image'

// and pass it to useEditor:
const editor = useEditor({
  extensions: [
    // ...,
    CustomImage
  ]
})
```

See [this code as a commit on GitHub](https://github.com/angelikatyborska/tiptap-image-alt-text/commit/afa4824265e753b6bbe607789693c0f23c9fcef7), including some extra CSS changes.

## Step 2 - alt text indicator

With a node view in place, we're ready to add new UI components to the image node. It is entirely up to you how you want the UI of this feature to look like. I'm doing a quick demo here, so it's not very beautiful :wink:.

The first UI component that we would like to see is some sort of indication whether an image has alt text already, and if it does, what it is.

```jsx
// Image.jsx
return (
  <NodeViewWrapper className={className} data-drag-handle>
    <img src={src} alt={alt} />
    <span className="alt-text-indicator">
      { alt ?
          <span className="symbol symbol-positive">✔</span> :
          <span className="symbol symbol-negative">!</span>
      }
      { alt ?
        <span className="text">Alt text: "{alt}".</span>:
        <span className="text">Alt text missing.</span>
      }
    </span>
  </NodeViewWrapper>
)
```

See [this code as a commit on GitHub](https://github.com/angelikatyborska/tiptap-image-alt-text/commit/d8ce09cc98a634744297ebadb3c7971ff805ebf5), including some extra CSS changes.

<figure>
<a href='{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-2 @path %}'>
{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-2 alt='TipTap editor with a paragraph and two images, the same as the previous image. This time, each image has a small overlapping rectangle in the left bottom corner. On the first image, the rectangle reads: "Alt text: Sandy hills with a foggy background" and has a green checkmark. On the other image, the rectangle reads: "Alt text missing" and has a red exclamation mark.'%}
</a>
<figcaption>Now we can see the alt text that was in the document from the very beginning.</figcaption>
</figure>

## Step 3 - edit button

The last step is to allow editing the alt text in the editor. Let's add an "edit" button somewhere after the alt text indicator. When the button is clicked, we need some sort of input, prefilled with the current alt text, that will allow us to set a new alt text. In this demo, I will achieve this by using [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) but you probably want something nicer that will fit your application's design.

The custom node view's props have a `updateAttributes` function that allows us to update this node's attributes, which is exactly what we need to change the image's alt text.

```jsx
// Image.jsx
const { updateAttributes } = props

const onEditAlt = () => {
  const newAlt = prompt('Set alt text:', alt || '')
  updateAttributes({ alt: newAlt })
}

return (
  <NodeViewWrapper className={className} data-drag-handle>
    <img src={src} alt={alt} />
    <span className="alt-text-indicator">
      {/* ... code omitted */}
      <button className="edit" type="button" onClick={onEditAlt}>
        Edit
      </button>
    </span>
  </NodeViewWrapper>
)
```

See [this code as a commit on GitHub](https://github.com/angelikatyborska/tiptap-image-alt-text/commit/a43da103c01e88e305d30eeda55eb07bd531b02d), including some extra CSS changes.

<figure>
<a href='{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-3-gif @path %}'>
{% asset posts/how-to-add-editing-image-alt-text-tiptap/step-3-gif alt='TipTap editor with a paragraph and two images, the same as the previous image. This time, the two images have an "edit" button that allows changing their alt text by opening a window prompt.'%}
</a>
<figcaption>The alt editing feature in action.</figcaption>
</figure>
