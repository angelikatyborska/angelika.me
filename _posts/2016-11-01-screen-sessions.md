---
title: Screen Sessions
excerpt: How not to panic when someone tells you to use the screen command.
tags: [devops, screen, command line]
date: 2016-11-01 22:01:00 +0100
---

My first contact with screen sessions was accidental, and in turn really terrifying. I mindlessly copied a few commands given to me by a senior developer and found myself in a place that was weird to me at that time. I started a time-consuming task running in the background, but inside a screen session - something I didn't understand at that time.

I wanted out, so my first instinct was to <kbd>Ctrl</kbd>+<kbd>c</kbd>. That didn't do anything, so I tried <kbd>Ctrl</kbd>+<kbd>d</kbd>. That terminated the screen session, stopping the work that was happening in the background at that time (copying a lot of files).

After it was more-or-less explained to me what I have done, I tried to recreate that session and restart the copying. I was secretly supervised by another developer. When he noticed that I still have no idea what I am doing, he attached to the same session and started typing. I almost fell down from my chair because I got so spooked seeing that commands were appearing in my terminal window, but it wasn't me who was typing them.

Motivated my that embarrassing story, I decided I really need to dive into the topic of screen sessions.

## What is a screen session?

Screen session is a session from which you can **detach** - break the ssh connection, quit the terminal application etc. - and the session won't terminate. When you **reattach** to that session, you will see it in the same state as when you have left it, all of the processes in still running.

It's a very useful tool for doing tasks that are time-consuming and/or need to happen in one go "or else". For example: `docker-compose build` of a big set of containers, `scp`ing huge files, updating a lot of gems etc.

<figure>
<a href='{% asset posts/screen-sessions/start-detach-attach @path %}'>
{% asset posts/screen-sessions/start-detach-attach alt:'Screen session does not terminate when you detach'%}
</a>
<figcaption>Create a screen session, detach <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>d</kbd> and attach again - loop still running</figcaption>
</figure>

## Starting a new screen session

This command will start a new screen session with the default name matching the pattern `<pid>.<tty>.<host>` and immediately attach to that session:

```
$ screen
```

## Detaching from a screen session

You can detach from a screen session by pressing <kbd>Ctrl</kbd>+<kbd>a</kbd> and then <kbd>d</kbd>.

Keep in mind that pressing <kbd>Ctrl</kbd>+<kbd>c</kbd> sends the `INT` signal to the current process running inside the screen session and not to the screen process itself. My first instinct to get out of an unfamiliar situation in the terminal is to press <kbd>Ctrl</kbd>+<kbd>c</kbd> and that did not work it this case.

## Naming a screen session

Because you need to use the session's name to attach to it if there is more than one session running, you might want to give it a name that is easy to remember.

Creating a screen session with a custom name:

```
$ screen -S banana
```

The `banana` part will substitute the `<tty>.<host>` part in the name, but the name will still start with the screen session's PID.

## Listing screen sessions

```
$ screen -ls
  25575.ttys013.mac-mini  (Detached)
  25615.banana       (Detached)
4 Sockets in /var/folders/64/lwm9gns128b2566zskl84p8m0000gn/T/.screen.
```

### Screen sessions are created per user

Keep in mind that by default screen sessions are accessible only by the user that created them.

```
$ sudo screen
[detached]

$ screen -ls
No Sockets found in /var/folders/x0/ksn3sdrs4rb9tskrs8w5j5l40000gn/T/.screen.

$ sudo screen -ls
There is a screen on:
	21380.ttys002.mac-mini	(Detached)
1 Socket in /var/folders/zz/zyxvpxvq6csfxvn_n0000000000000/T/.screen.
```

## Attaching to a detached screen session

If there is only one detached session present, you can attach to it simply with:

```
$ screen -r
```

Otherwise, you have to use at least a part of the session name that allows for unambiguous recognition.  

```
$ screen -ls
There are screens on:
  25575.ttys013.mac-mini  (Detached)
  25596.ttys013.mac-mini  (Detached)
  25615.banana       (Detached)
  25826.ttys010.mac-mini  (Detached)
```

Having those four screen sessions running, I can attach to `25615.banana` with `screen -r banana` and to `25826.ttys010.mac-mini` with `screen -r ttys010`, but to attach to `25575.ttys013.mac-mini`, I need to use its full name.

## Terminating a screen session

### From inside the session

Type `exit`, press <kbd>Ctrl</kbd>+<kbd>d</kbd> or press <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>k</kbd>.

### From outside the session

Find out the session's PID with `screen -ls` and `kill` it.

### Kill all detached screen sessions

```
$  screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}' | xargs kill
```

## Attaching to an attached screen session

It is also possible to attach to a session to which someone is already attached. That is called **multi display mode**.

```
$ session -x [name]
```

When providing the name of the sessions, the same rules apply as when using `session -r`.

<figure>
<a href='{% asset posts/screen-sessions/multi-display-mode @path %}'>
{% asset posts/screen-sessions/multi-display-mode alt:'Screen session does not terminate when you detach'%}
</a>
<figcaption>Multi display mode</figcaption>
</figure>

## Windows

For multitasking inside a single screen session, you can create windows. While inside a screen session, try those keyboard shortcuts.

--------------------------------------------|------------------------------
<kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>c</kbd>  | Create a new window
<kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>w</kbd>  | List all windows
<kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>n</kbd>  | Next window
<kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>p</kbd>  | Previous window
<kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>"</kbd>  | Choose a window to switch to


<figure>
<a href='{% asset posts/screen-sessions/windows @path %}'>
{% asset posts/screen-sessions/windows alt:'Multiple windows in a single session'%}
</a>
<figcaption>Create a screen session, type, create a new window in that session <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>c</kbd>, type, switch windows <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>"</kbd>, exit both windows.</figcaption>
</figure>

If you ever forget any of those shortcuts or want to explore more, you can always refer to the man pages or press <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>?</kbd> inside a screen session.

<figure>
<a href='{% asset posts/screen-sessions/ctrl-a-question-mark @path %}'>
{% asset posts/screen-sessions/ctrl-a-question-mark alt:'screen key bindings'%}
</a>
<figcaption>Screen key bindings - show by pressing <kbd>Ctrl</kbd>+<kbd>a</kbd>, <kbd>?</kbd></figcaption>
</figure>
