---
title: How to prevent yourself from running npm in a yarn project or the other way around?
excerpt: Depending on which project I worked on most recently, my muscle memory causes me to type the wrong command when switching projects.
tags: [JavaScript, npm, yarn]
date: 2023-02-24 16:24:00 +0100
---

Between my employment and hobby coding, I work on many JavaScript projects on a regular basis. Some of them use `npm` as the package manager, some `yarn`. Depending on which project I touched most recently, my muscle memory causes me to type the wrong command after switching projects.

Typing `npm install` when you meant `yarn install` can waste you a lot of time if you only notice it _after_ all of the packages have been installed.

To stop myself from making this mistake, I created a small script. It wraps the `npm` and `yarn` commands in a check - it prevents me from running an `npm` command if there's a `yarn.lock` file in the directory, and it prevents me from running the `yarn` command if there's a `package-lock.json` file in the directory.

To use it, add this to your shell's start-up script (e.g. `.zshrc`):

```zsh
npm() {
  if [ -f yarn.lock ]; then
    echo 'use yarn';
  else
    command npm $*;
  fi
}

yarn() {
  if [ -f package-lock.json ]; then
    echo 'use npm';
  else
    command yarn $*;
  fi
}
```

If you ever need to run `npm` or `yarn` bypassing this check, you can do so by prepending `command` to the command.

Note that I have no experience with other package managers for JavaScript and I have no idea how my solution would interact with them.
