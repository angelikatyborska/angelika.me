---
 title: That one process that wouldn't stay dead
 excerpt: The discovery of a process that would keep coming back after being killed forced me to find out what's up with that "launchctl load" command many tutorials tell me to run when installing something.
 tags: [OS X, launchd, plist]
 date: 2016-09-08 20:57:00 +0200
---

Two years ago I had to setup Postgres on my laptop for the very first time. I followed [this tutorial](https://www.moncefbelyamani.com/how-to-install-postgresql-on-a-mac-with-homebrew-and-lunchy/). I had no idea what I was doing, but it worked, so I didn't think twice about it.

Two weeks ago I had to update Postgres because I needed support for the [JSONB type](https://wiki.postgresql.org/wiki/What's_new_in_PostgreSQL_9.4#JSONB_Binary_JSON_storage). I&nbsp;ran into a weird issue. The older Postgres version was still running and I didn't know how to stop it. I tried getting the process id by `ps -ef | grep postgres` and passing it to `kill`, but that didn't work. No matter how many times I tried to terminate that process, it just kept coming back. It seems silly and obvious to me now, but at that time the reason for that behavior was a total mystery to me.

I now will solve that mystery by answering these three questions:

1. Why did that happen? [Answer pt. 1](#answer-1-pt-1) & [Answer pt. 2](#answer-1-pt-2)
2. How could I have stopped it? [Answer](#answer-2)
3. How can I make that happen for another program? [Answer](#answer-3)

This post will probably be relevant only to Mac OS X users.

## launchd

The program with PID 1 on OS X is called `launchd`. It's the first program that is started by the kernel when the OS boots. Its equivalent on Linux would be `init` or `systemd`.

```
$ ps -ef | head -n 2
  UID   PID  PPID   C STIME   TTY           TIME CMD
    0     1     0   0  6:30PM ??         0:08.50 /sbin/launchd
```

Let's check out its man page:

```
$ man launchd
(...)
DESCRIPTION
launchd manages processes, both for the system as a whole
and for individual users.

The primary and preferred interface to launchd is via
the launchctl(1) tool which (among other options) allows
the user or administrator to load and unload jobs.
Where possible, it is preferable for jobs to launch on demand
based on criteria specified in their respective
configuration files.

(...)

During boot launchd is invoked by the kernel to run as
the first process on the system and to further
bootstrap the rest of the system.

You cannot invoke launchd directly.
(...)
```

**Lesson nr 1**: `launchd` starts everything else. **Lesson nr 2**: we, the users, cannot run `launchd` directly and should instead use `launchctl` to communicate with `launchd`.

So how does `lauchd` know which programs to start? It looks inside a few specific directories for `.plist` files. Those files describe how to start a program as a daemon or an agent. **Daemons** are background processes that are not tied to a particular user, and **agents** are background processes that are tied to a user - they can access the user's home directory and display GUI elements.

Where are those files located? From `launchd` man pages:

~/Library/LaunchAgents         | Per-user agents provided by the user.
 /Library/LaunchAgents         | Per-user agents provided by the administrator.
 /Library/LaunchDaemons        | System-wide daemons provided by the administrator.
 /System/Library/LaunchAgents  | Per-user agents provided by Apple.
 /System/Library/LaunchDaemons | System-wide daemons provided by Apple.

[When you start the OS](https://developer.apple.com/library/mac/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html#//apple_ref/doc/uid/10000172i-SW7-108425), all of the "system-wide" daemons and agents are will be loaded. When you log in, the "per-user" ones will be loaded as well. Loading does not necessary mean starting a process. Some agents/daemons are run at load, some are run on demand.

If you want to add agents for yourself, just put them in `~/Library/LaunchAgents`. That's exactly what that Postgres installation tutorial told me to do:

```
$ cp /usr/local/Cellar/postgresql/9.2.1/homebrew.mxcl.postgresql.plist ~/Library/LaunchAgents/
```

### Answer 1 (pt. 1)
 
 Postgres was being started (and restarted) by `launchd` because I have copied a special `.plist` file to `~/Library/LaunchAgents`.

Side note: I originally assumed that if the PPID of a process is 1, then it must mean that it was started by `launchd`. That is **not true**! A process whose parent exited (an orphaned process) gets adopted by `launchd` and its PPID will be 1 as well.

## launchctl

`launchctl` is a tool for **c**on**t**ro**l**ling `launchd`. Its most used subcommands are `load` and `unload`. Loading is telling `launchd`: <q>"I know you have started the OS already and all, and you are probably busy right now, but you know, there's this new property list file and it would be really great if you could go ahead and read it right now, so that I don't have to reboot"</q>. Similarly, unloading would be saying: <q>"Remember that job you loaded? Yeah... I don't need it right now. Don't take it personally, just pretend it's not there until reboot, ok?"</q>. Bad news though, those are considered legacy as of OS 10.10. Fortunately "legacy" does not mean "deleted" and we can still use them in 10.11.

Loading an agent is something the tutorial mentioned:

```
$ launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
```

Another useful thing you can do is listing all the loaded agents and daemons:

```
$ launchctl list | head -n 7
PID    	Status 	Label
-      	0      	com.apple.CoreAuthentication.daemon
3629   	0      	com.apple.quicklook
-      	0      	com.apple.parentalcontrols.check
416    	0      	com.apple.Finder
-      	0      	com.apple.PackageKit.InstallStatus
-      	0      	com.apple.FontWorker
```

The first column is the PID if the process is running and `-` otherwise. The second column is the last exit status of that process. The third column is the label defined in a corresponding `.plist` file.

Oh, did I mention that `list` is considered legacy as well? If you want to find out more about the new `launchctl` subcommands, check out [this post](https://babodee.wordpress.com/2016/04/09/launchctl-2-0-syntax/).

### Answer 2

I could have stopped Postgres with:

```
$ lauchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
```

### What's up with lunchy?

What that Postgres installation tutorial actually mentioned about `launchclt load` is **not** using it directly, but rather installing [lunchy](https://github.com/eddiezane/lunchy). Lunchy seems like sorcery at first, but what it really does is just matching a pattern (eg. "postgres") against the list of files from [the directories that `launchd` recognizes](https://github.com/eddiezane/lunchy/blob/v0.10.4/lib/lunchy.rb#L168-L169). No magic, just :sparkles: regular expressions :sparkles:.

## Property list files

Property list files (`.plist`) are special XML files [used for object serialization in the Cocoa framework](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/PropertyLists/AboutPropertyLists/AboutPropertyLists.html#//apple_ref/doc/uid/10000048i-CH3-SW2). OS X apps quite often use them for keeping the user's settings. In this case, `launchd`'s launch agents are described using those `.plist` files.

Let's have a look at the `.plist` file for Postgres:

```xml
$ cat ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>KeepAlive</key>
  <true/>
  <key>Label</key>
  <string>homebrew.mxcl.postgresql</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/opt/postgresql/bin/postgres</string>
    <string>-D</string>
    <string>/usr/local/var/postgres</string>
    <string>-r</string>
    <string>/usr/local/var/postgres/server.log</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>WorkingDirectory</key>
  <string>/usr/local</string>
  <key>StandardErrorPath</key>
  <string>/usr/local/var/postgres/server.log</string>
</dict>
</plist>
```

### Answer 1 (pt. 2)

Those two lines in that `.plist` file are telling `launchd` that Postgres should be restarted when it exits, no matter what.

```xml
<key>KeepAlive</key>
<true/>
```

There are actually other options for `KeepAlive`, more interesting than `true`/`false`. You can keep the process alive only if it exited successfully (`SuccessfulExit`), or when it crashed (`Crashed`), or only if some given paths exist (`PathState`). 

To find out more about launch agents `.plist` files, I recommend the man pages: `man launchd.plist`.

### Scheduled jobs - Java Updater

 `launchd` can be also used to create [jobs that will run periodically](https://developer.apple.com/library/mac/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/ScheduledJobs.html#//apple_ref/doc/uid/10000172i-CH1-SW2). If you have ever heard about `cron` on Linux, `launchd` is supposed to replace it.
 
 Given you have installed Java using the official installer from Oracle, you probably experienced the Java Updater popping up all of the sudden. It's a `launchd` scheduled job.

```
$ launchctl list | grep oracle
-      	0      	com.oracle.java.Java-Updater
```

```xml
$ cat /Library/LaunchAgents/com.oracle.java.Java-Updater.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.oracle.java.Java-Updater</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Resources/Java Updater.app/Contents/MacOS/Java Updater</string>
    <string>-bgcheck</string>
  </array>
  <key>StandardErrorPath</key>
  <string>/dev/null</string>
  <key>StandardOutPath</key>
  <string>/dev/null</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>7</integer>
    <key>Minute</key>
    <integer>11</integer>
    <key>Weekday</key>
    <integer>4</integer>
  </dict>
</dict>
</plist>
```

This part means that the Java Updater will be run at 7:11 on every Thursday:

```xml
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key>
  <integer>7</integer>
  <key>Minute</key>
  <integer>11</integer>
  <key>Weekday</key>
  <integer>4</integer>
</dict>
```

## Let's have some fun

Programming is about solving problems, and one of the problems I have been having recently is feeling disconnected from my team. They're in Berlin and I am working remotely from Poland. To cheer myself up, I threw together a simple script that would simulate the sounds of a German office. Disclaimer: this is what I *imagine* it would sound like - I am not saying that my co-workers really use those phrases.

I created a file called `work` in `/usr/local/bin`:

```bash
#!/usr/bin/env bash

MIN_SLEEP=3
SLEEP_RANGE=10
VOICES=(Anna Markus Petra Yannick)
PHRASES=(
  "Scheiße"
  "Das ist eine gute Frage"
  "Halt die Klappe"
  "Ich weiß nicht"
  "Verpiss dich, sackgesicht"
  "Einen Moment, bitte"
  "Was ist das?"
  "Das ist ja Kinderkacke"
  "Give me compliments. Bitte schnell."
  "Nein!"
  "Das ist nicht auf meinem Mist gewachsen"
)

while true;
do
  VOICE=${VOICES[(RANDOM % ${#VOICES[@]})]};
  SLEEP_TIME=$(((RANDOM % SLEEP_RANGE) + MIN_SLEEP));
  PHRASE=${PHRASES[(RANDOM % ${#PHRASES[@]})]};
  sleep ${SLEEP_TIME};
  say -v ${VOICE} ${PHRASE};
done
```

It's an infinite loop of:

1. Choose a random voice from the list.
2. Choose a random sleep time.
3. Choose a random phrase from the list.
4. Sleep.
5. Say that phrase with that voice.

Anna, Markus, Petra and Yannick are German voices that need to be downloaded first. Check System Preferences -> Dictation & Speech -> Text to Speech -> System Voices -> Customize.

Let's not forget to make it executable:

```
$ chmod +x /usr/local/bin/work
```

Let's run it:

```
$ /usr/local/bin/work
```

Ah, perfect! Just as if I was sitting in a room full of Germans (I guess?).

### Answer 3
 
 I need to create a launch agent for my program. I will call that file `me.angelika.work.plist` and I will put it in `~/Library/LaunchAgents/`.

A little bit of copy & paste from [the Hello World example from Apple's documentation](https://developer.apple.com/library/mac/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html#//apple_ref/doc/uid/10000172i-SW7-SW3) and a few tweaks resulted in such a launch agent:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>me.angelika.work</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/work</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
```

This is what the agent will be listed as when I do `launchctl list`:

```xml
<key>Label</key>
<string>me.angelika.work</string>
```

By convention, the label is written in [reverse domain notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) and it should be identical to the `.plist` file's name.

This is the command to start my script:

```xml
<key>ProgramArguments</key>
<array>
  <string>/usr/local/bin/work</string>
</array>
```

If it had any arguments, they would be represented as additional `<string>` elements in that array.

This means that my program should be started immediately after the agent is loaded:

```xml
<key>RunAtLoad</key>
<true/>
```

This means that regardless of how my program was stopped, it should be restarted:

```xml
<key>KeepAlive</key>
<true/>
```

Because `launchd` loads everything from `~/Library/LaunchAgents` when it boots the OS, I could just restart my computer to start my program. That's, fortunately, unnecessary, I can just load the agent explicitly.

Old command (still works on 10.11):

```
$ launchctl load ~/Library/LaunchAgents/me.angelika.work.plist
```

New command:

```
$ launchctl bootstrap gui/$UID /Users/angelika/Library/LaunchAgents/me.angelika.work.plist
```

:tada: Voila! :tada:

Please note, again, that *loading*/*bootstrapping* usually does not mean *starting*, except that in this case it does - I defined the agent to run at load.

Let's see if the process will be brought back from the dead if I try to kill it.

```
$ ps -ef | grep /usr/local/bin/work
  501 24181     1   0  9:23PM ??         0:00.02 bash /usr/local/bin/work
  501 24411 13678   0  9:25PM ttys001    0:00.00 grep /usr/local/bin/work
  
$ kill 24181

$ ps -ef | grep /usr/local/bin/work
  501 24461     1   0  9:25PM ??         0:00.01 bash /usr/local/bin/work
  501 24472 13678   0  9:25PM ttys001    0:00.00 grep /usr/local/bin/work
```

Yep, it was!

Once I have had enough, I can unload that agent.

Old command:

```
$ launchctl unload ~/Library/LaunchAgents/me.angelika.work.plist
```

New command:

```
$ launchctl bootout gui/$UID/me.angelika.work
```

## Conclusion

The next time your friend leaves their Mac without supervision, you can do something a little bit more interesting than changing their wallpaper to a photo of David Hasselhoff.
