---
title: Command line keyboard shortcuts
excerpt: Navigate the command line using Emacs or Vi keyboard shortcuts.
tags: [command line, keyboard shortcuts]
date: 2016-03-12 16:15:00 +0100
---
You're about to run a command only to notice a typo at the beginning. Looks familiar?

<figure>
{% asset posts/command-line-keyboard-shortcuts/no-shortcuts alt='Navigating to a typo without shortcuts'%}
<figcaption>Navigating to a typo without shortcuts.</figcaption>
</figure>

There is a better way!

<figure>
{% asset posts/command-line-keyboard-shortcuts/emacs-mode alt='Navigating to a typo with shortcuts.' %}
<figcaption>Navigating to a typo with shortcuts.</figcaption>
</figure>

Had it not been for [Learn Enough Command Line to Be Dangerous](https://www.learnenough.com/command-line-tutorial) by Michael Hartl (I&nbsp;highly recommend this book if you feel uncomfortable working with the command line), I&nbsp;still wouldn't know that there are any command line keyboard shortcuts other than `Ctrl + c`, `Ctrl + d` and `Tab`.

Please note that this post is about Bash. If you're using some other shell, I have no idea if any of this will work for you. If you don't know what your shell is, it's probably Bash (at least on Mac OS X and Ubuntu). Keep reading (and check by running `ps -p $$`).

## Emacs mode vs Vi mode

By default, Bash uses Emacs shortcuts. If you prefer using Vi shortcuts, switch to Vi mode:

```
$ set -o vi
```

To go back to Emacs mode:

```
$ set -o emacs
```

Setting editing mode this way works only for the current shell session, so if you close the Terminal window, it will reset. To persist this setting, add it to your `.inputrc`. There are many things concerning both Emacs and Vi mode you can set in this file, but it's a topic for another blog post. I will only mention the one I&nbsp;can't imagine using Vi without:

```bash
# ~/.inputrc
# use Vi mode
set editing-mode vi

$if mode=vi
  set keymap vi-insert
  # use "jk" to exit insert mode
  "jk": vi-movement-mode 
$endif
```

If you have no previous experience with neither Emacs nor Vi, I suggest you stick to the default Emacs shortcuts for Bash, simply because it's more probable that if you have to work on someone else's computer, it will use the default settings. Vi shortcuts might seem more appealing, because they're shorter and easier to remember, but keep in mind that using a Vi shortcut when typing a command requires you to go into Vi's command mode, using the shortcut and then going back to Vi's insert mode to keep typing. If you have no idea what I'm talking about, make sure you learn the basics of Vi(m) before trying out Vi mode for command line navigation.

## Cursor movement

| Action | Emacs&nbsp;mode | Vi&nbsp;mode |
|:-------|:---------------:|:------------:|
| Beginning of the line | Ctrl&nbsp;+&nbsp;a | 0 |
| End of the line | Ctrl&nbsp;+&nbsp;e | $ |
| Previous word | Alt&nbsp;+&nbsp;b&nbsp;[(*)](#alt-key)  | b |
| Next word | Alt&nbsp;+&nbsp;f&nbsp;[(*)](#alt-key) | w |
| Previous character | Ctrl&nbsp;+&nbsp;b | h |
| Next character | Ctrl&nbsp;+&nbsp;f | l |

### Option&nbsp;+&nbsp;Click

Move cursor anywhere inside the command by clicking. Works only on OS X.

## Deleting

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

## Other editing actions

| Action | Emacs&nbsp;mode | Vi&nbsp;mode |
|:-------|:---------------:|:------------:|
| Undo | Ctrl&nbsp;+&nbsp;_ | u |
| Clear screen (leaves the prompt and current command) | Ctrl&nbsp;+&nbsp;l | Ctrl&nbsp;+&nbsp;l |
| Autocompletion | Tab | Tab |

## Command history

| Action | Emacs&nbsp;mode | Vi&nbsp;mode |
|:-------|:---------------:|:------------:|
| Previous command | Ctrl&nbsp;+&nbsp;p | j |
| Next command | Ctrl&nbsp;+&nbsp;n | k |
| Search | Ctrl&nbsp;+&nbsp;r | Ctrl&nbsp;+&nbsp;r |

Command history is shell-specific and can be found in `~/.bash_history`. It means that if you're using more than one terminal emulator (like Terminal and iTerm), they share the same command history.

## Process control

| Action | Emacs&nbsp;mode | Vi&nbsp;mode |
|:-------|:---------------:|:------------:|
| Send SIGINT to current process | Ctrl&nbsp;+&nbsp;c | Ctrl&nbsp;+&nbsp;c |
| Send EOT character to current process | Ctrl&nbsp;+&nbsp;d | Ctrl&nbsp;+&nbsp;d |
| Send SIGSTP to current process | Ctrl&nbsp;+&nbsp;z | Ctrl&nbsp;+&nbsp;z |

## (*) Alt key {#alt-key}

Some Emacs shortcuts using the `Alt` key are already mapped to something else on many operating systems and might not work as expected. To enable those shortcuts in OS X's Terminal, look for 'use Option as Meta key' in its settings.
