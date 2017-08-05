---
title: Docker for dummies
excerpt: Get acquainted with basic Docker concepts while trying to run a simple Guestbook Rails app in a Docker container.
tags: [docker, devops, rails]
date: 2016-03-20 15:28:00 +0100
---
Actually, Docker for *a* dummy. Me. To be honest, I have always been scared of DevOps. Whenever reading a Rails tutorial, I would skip the part about deployment. If it worked on my machine, it was good enough for me and I moved on. *Obviously* this attitude would not hold up in real life. Real life caught up with me quickly and learning Docker was the first thing I had to do on my new job.

## Why Docker?

Picture your typical Rails app that allows users to register (data persistence with, let's say, Postgres) and submit a photo, which is then resized (image manipulation with, let's say, ImageMagick). Picture new developers that need to start working on this app. You can specify the Ruby version your app uses in `.ruby-version`. You can specify the gems and their versions your app depends on in a `Gemfile`. But Bundler can't install everything. You would have to trust your developers to install the specific versions of Postgres and ImageMagick you asked for. They probably will if they haven't already got these installed, but what about a situation where they are currently working on some other app that uses those as well, but some older versions? The point is, developers will run the app on different operating systems, with different versions of external dependencies (like Postres and ImageMagick) and those discrepancies always lead to the infamous "but it works on my machine!". Docker allows all developers to run the app in exactly the same environment. What is more, this can be exactly the same environment as the production environment. Because in the end of the day, your web app doesn't have to run on all the operating systems with all the possible versions of all the dependencies. It just have to run on your web server.

## What is Docker?

Docker is a tool that allows you to pretend there are tiny computers inside your computer. Those tiny computers are called **containers**, and the computer they run on is called a&nbsp;**host&nbsp;OS**. Containers behave like separate operating systems, each having their own independent share of resources (filesystem, CPU, memory). But they are not really separate, they all share the host OS's kernel. 

The host OS has to be Linux, but that doesn't mean you can't use Docker on Mac OS X or Windows. It just means you need another layer of indirection. Docker provides a tool called Docker Machine that allows you to create a VirtualBox virtual machine with Linux to use as the Docker host OS.

<figure>
{% img posts/docker-for-dummies/docker_osx alt:'A diagram showing Docker on Mac OS X'%}
<figcaption>Tiny virtual computers inside a virtual computer inside a real computer.</figcaption>
</figure>

## Step by step example - a Guestbook Rails app

It will be probably easier to understand the difficult concepts of the Docker world if I present them on a familiar ground. Let's say we have a very simple Guestbook Rails app. Anyone can leave a short message that gets persisted in a database (we will use Postgres). Normally we would have both Postgres and the Rails app running on our computer. The goal is to run them both in separate Docker containers. I will assume we are working on OS X. Please notice that this post is about setting up a development environment. What that means is that we need a convenient way to change code and add gems on the go, but we don't have to worry much about security, because the app will only be accessible from our machine.

### Step 1 - a bare Rails app

It has a single `GuestbookEntry` model with a single `body` text field. `GuestbookEntriesController` has two actions, `index` and `create`. The `index.html.erb` view lists all guestbook entries and provides a form to add a new one. 

#### [Source code for step 1](https://github.com/angelikatyborska/docker-rails-example/tree/step-1)

### Step 2 - build a Docker image for our Rails app

Docker **images** are the basis of containers. An image is like a description of the environment you want to run in the container. You specify which operating system you want to start from, which additional tools and libraries to install, which files from your computer to copy to the image and so on.

#### Agenda for step 2

Let's imagine that we have an empty computer. What we need to do before we can setup our Rails app is:

1. Install an operating system
2. Install Ruby
3. Install Bundler
4. Copy our app's source code

#### Docker Hub

But don't worry! We won't *really* have to install an operating system on our own. Every Docker image can (and has to) have a base image. That means that there are images with operating systems like Ubuntu or Debian already installed, waiting for us to use them. They live in the [Docker Hub](https://hub.docker.com/). Check out [the most popular Docker images](https://hub.docker.com/explore/) that we can use. The image that interests us is [Ruby](https://hub.docker.com/_/ruby/). I will use `ruby:2.3.0`. It is based on Debian Jessie and has Ruby v2.3.0 and Bundler installed. 

#### Dockerfile

A file that specifies the steps necessary to build a Docker image is called a `Dockerfile`. The format of the `Dockerfile` is simple:

```
# comment
INSTRUCTION arguments
```

All the possible instructions can be found in the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/).

#### 1. an OS, 2. Ruby & 3. Bundler all in one

Let's start building our `docker-rails-example/guestbook/Dockerfile` step by step.

```
FROM ruby:2.3.0
```

We specify the base image for our Rails app image.

```
RUN apt-get update && apt-get -y install nodejs
```

We install NodeJS, because it is needed by the gem Uglifier which Rails uses to compress JavaScript files. APT is a package manager for Debian Linux (like Homebrew for OS X).

#### 4. The rest

```
COPY . /guestbook
```

 We copy the current directory (the directory the Dockerfile is in), that is `docker-rails-example/guestbook`, from our machine to `/guestbook` on the Docker container.
 
 There is one little problem. Using the `COPY` command we copy everything from `docker-rails-example/guestbook/`, including unnecessary (for our app to run) files like `.gitignore` or `Dockerfile` itself. Fortunately, there is a quick solution to ignore some files completely and that is creating a `.dockerignore` file. It works just as `.gitignore` does:
 
```
# docker-rails-example/guestbook/.dockerignore
Dockerfile
.dockerignore
.gitignore
tmp/*
log/*
```

Going back to the `Dockerfile`:

```
WORKDIR /guestbook
```

We change the working directory to the directory where the source code for our app lives.

```
CMD bin/rails s
```

We specify the default command that will be executed when we run a container from our image. Whatever string is after `CMD` will be used as an argument to `/bin/sh -c`. This simply means that Docker will run the Bourne shell telling it to run the command specified after the `-c` flag. As a reasonable default, we want to run the Rails server. But that doesn't mean we won't be able to do anything else!

#### The whole `Dockerfile`

Putting all of this together:

```
FROM ruby:2.3.0

RUN apt-get update && apt-get -y install nodejs

COPY . /guestbook
WORKDIR /guestbook

CMD bin/rails s
```

We're now ready to build and run the image! But be aware, this is not the end of our work. Our app will not start, because it will not connect to the database just yet. Still, let's learn how to build the image.

#### Building the image

```
$ docker build -t guestbook guestbook
```

The `-t guestbook` part means that we will call the image `guestbook`, and the second `guestbook` is a path to the directory with the `Dockerfile`. This command assumes that it is run inside `docker-rails-example`.

Let's list all the images to make sure we have indeed built it:

```bash
$ docker images
REPOSITORY  TAG       IMAGE ID        CREATED         SIZE
guestbook   latest    294781cb78ac    5 seconds ago   725.6 MB
ruby        2.3.0     cc0ac307dc6d    2 days ago      725.5 MB
```

#### Running a container from the image

And now the glorious moment we have been waiting for! Let's run our image:

```bash
$ docker run guestbook
(...)/bundler/spec_set.rb:94:in `block in materialize':
Could not find rake-11.1.1
in any of the sources (Bundler::GemNotFound)
# (...) a long stack trace
```

Well, not so glorious. But this is good, this makes sense. We tried to run our default command `bin/rails s` without setting up the app first. Let's run `bin/setup` instead:

```bash
$ docker run guestbook bin/setup
== Installing dependencies ==
The following gems are missing
(...)
Fetching gem metadata from https://rubygems.org/...........
(...)
Bundled gems are installed into /usr/local/bundle.
(...)
== Preparing database ==
Running via Spring preloader in process 18820
could not connect to server: No such file or directory
        Is the server running locally and accepting
        connections on Unix domain socket 
        "/var/run/postgresql/.s.PGSQL.5432"?
(...)
```

Exactly what we have been excepting. `bin/rake db:setup` fails, because there is no Postgres running on our container.

There is another major problem here. Notice that Bundler installed the gems to `/usr/local/bundle`. That of course is a directory on the container. But the container stops whenever the `bin/setup` command is done. If we run another container from the guestbook image, it won't have anything inside `/usr/local/bundle` and we will have to install the gems all over again before doing anything else! What is more, currently we are copying our code when building the image. That means that if we want to change anything in the code, we would have to rebuilt the image, run a container from that image doing the setup all over again. This is awful. We will fix that in step 3 before moving on to running Progres.

#### [Source code for step 2](https://github.com/angelikatyborska/docker-rails-example/tree/step-2)

### Step 3 - make our lifes easier with volumes
  
Containers run from the same image do not share filesystems. Whatever was copied to the image in the `Dockerfile` will be accessible to all containers run from that image, but if a container creates files, they will not be added neither to the image nor to other containers run from the same image.

It would be awesome if we could keep the code and the gems on our machine (OS X) and have the containers read from that. There is a way to achieve this. It's called **data volumes**. Well, data volumes allow us to mount a directory from the host OS (Linux VM in our case) on the container. The part where we mount a directory from OS X on the host OS is done by VirtualBox via shared folders. When Docker Machine created the default Linux host machine, it added `/Users` from OS X as a shared folder.

<figure>
{% img posts/docker-for-dummies/docker_osx_folder alt:'A diagram showing Docker containers sharing files with Mac OS X'%}
<figcaption>Tiny virtual computers sharing files with a a virtual computer sharing files with a real computer.</figcaption>
</figure>

Whenever you're in doubt about what's actually happening on the Linux VM, you can always open it via VirtualBox and talk to it.

<figure>
{% img posts/docker-for-dummies/vm_shell alt:'A screen from Docker default machine'%}
<figcaption>Checking that the Linux VM in fact has access to my OS X home directory</figcaption>
</figure>

#### Agenda for step 3

Back to our Rails app. What we will do is:

1. Do not copy the source code while building the image
2. Tell Bundler not to install gems in `/usr/local/bundle`, but rather somewhere that will be shared between OS X and the container, like `docker-rails-example/guestbook/.bundle`
3. Mount the directory with the source code `docker-rails-example/guestbook` at `/guestbook`

#### 1. Do not copy & 2. Set environment variables for Bundler

Our `Dockerfile` modified:

```
FROM ruby:2.3.0

RUN apt-get update && apt-get -y install nodejs

ENV GEM_HOME /guestbook/.bundle
ENV BUNDLE_PATH="$GEM_HOME" \
  BUNDLE_BIN="$GEM_HOME/bin" \
  BUNDLE_APP_CONFIG="$GEM_HOME"
ENV PATH $BUNDLE_BIN:$PATH

COPY . /guestbook
WORKDIR /guestbook

CMD bin/rails s
```

Now we have to build the image again:

```
$ docker build -t guestbook guestbook
```

#### 3. Run a container with mounted volumes

Let's run `bin/setup` again:

```
$ docker run -v `pwd`/guestbook:/guestbook guestbook bin/setup
```

The ``-v `pwd`/guestbook:/guestbook`` part tells Docker to mount `docker-rails-example/guestbook` from the host OS at `/guestbook` on the container, and as we have established before,`docker-rails-example/guestbook` on the host OS is the same as `docker-rails-example/guestbook` on OS X via VirtualBox shared folder.

Obviously, `bin/setup` failed again because it still can't connect to Postgres. We will take care of that in the next step. Try running this command again. You will see that this time Bundler is happy, because Gemfile's dependencies are satisfied. All the gems are now on OS X inside `docker-rails-example/guestbook/.bundle`.

#### [Source code for step 3](https://github.com/angelikatyborska/docker-rails-example/tree/step-3)

### Step 4 - linking our app to Postgres

We want to run another container, with Postgres. And we want our current Rails app container to know about it. 

#### Agenda for step 4

1. Run two containers, one with Postgres, another with the Rails app
2. The container with the app has to know about the container with Postgres and it needs to be able to connect to it

#### 1. Composing containers

It's time we start **composing** our containers. We need to create a `docker-compose.yml` file. It will define which containers to run and how they are linked together. It will then allow us to run all the containers with one command.

```yaml
# docker-rails-example/docker-compose.yml
version: "2"

services:
  postgres:
    image: postgres:9.5
```

Firstly, we specify the version of the compose file format, [version 2 is recommended](https://docs.docker.com/compose/compose-file/#versioning). Secondly, we define a container called `postgres` to be run from the image `postgres:9.5` that will be downloaded from the Docker Hub. That's all. Seriously, it's that easy to run Postgres. Let run the container. When composing containers, we will be using a slightly different command to build and run everything. Since Postgres is an already built image, we just need to run it:

```
$ docker-compose up -d
Creating network "dockerrailsexample_default" with the default driver
Creating dockerrailsexample_postgres_1
```

The `-d` flag means that the process will be detached. If we didn't include it, we would be getting logs in the terminal.

Ok, how do we know anything is happening? We can list all containers currently running:

```
$ docker ps
(...)  IMAGE         (...)  STATUS              PORTS      (...)
(...)  postgres:9.5  (...)  Up About a minute   5432/tcp   (...)
```

It's definitely running. Let's stop it with `docker-compose down` and add the Rails app.


#### 2. Linking containers

Adding the Guestbook app to `docker-compose.yml`:

```yaml
version: "2"

services:
  postgres:
    image: postgres:9.5

  guestbook:
    build: ./guestbook
    volumes:
      - ./guestbook:/guestbook
    links:
      - postgres
    ports:
      - 3000:3000
```

Let's break it down:

1. `build` tells `docker-compose` where to look for the `Dockerfile` for this container
2. `volumes` is a list of data volumes to be mounted on this container, it works just as the `-v` flag with `docker run`
3. `links` is a list of services that will be know to the `guestbook` service
4. `ports` is a list of exposed ports. By adding `3000:3000` we specify that port `3000` on the host OS (the first one) is mapped to port `3000` on the container (the second one)

#### Rails database config

But that's not enough. Notice that Rails reads the database configuration form `config/database.yml`. We need to change it as well. 

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: 5
  username: postgres
  password:
  host: postgres
```

To find out the username and the password, we had to look at the Postgres [image's docs](https://hub.docker.com/_/postgres/). They can be easily found in the Docker Hub. The user is specified by the environment variable `POSTGRES_USER`, and the password by `POSTGRES_PASSWORD`. It defaults to user `postgres` with no password. Notice that `host` has to match the name of the service we defined as a link for our app.

#### Rails server tweak

One more tweak to the `Dockerfile`:

```
CMD rm -f tmp/pids/* && bin/rails s -p 3000 -b '0.0.0.0'
```

We have to bind Rails server to ip `0.0.0.0.` and make sure that it always runs on port `3000`, because that's the port we exposed. Unfortunately, we also have to remove the file with Rails server's process id, because for some reason it can't do it properly by itself when run on a Docker container. 

#### Run all composed containers together

We changed the `Dockerfile` for the Rails app, so let's rebuild first.

```
$ docker-compose build
```

Let's run everything with `docker-compose up -d`. We have to wait a while for the server to start, but when it does, we can visit `http://192.168.99.100:3000/` in the web browser. We will see a pretty `FATAL: database "guestbook_development" does not exist` error.

<figure>
{% img posts/docker-for-dummies/browser_nodatabase alt:'Rails app showing a ActiveRecord\:\:NoDatabaseError error'%}
</figure>

Let's set up the database by running `docker-compose run guestbook bin/setup`. Please notice that we are using the tool `docker-compose` instead of `docker` now, even to run single containers.

Let's visit `http://192.168.99.100:3000/` again. It works!

<figure>
{% img posts/docker-for-dummies/browser_success alt:'Rails app working correctly'%}
</figure>

But does it really persist? Let's add an entry, stop everything and try again.

```
$ docker-compose down
$ docker-machine restart
$ docker-compose up -d
```

`FATAL: database "guestbook_development" does not exist` again?! That means all the databases are gone! That makes sense. Everything that was created by Postgres in the container disappeared with the container. We will fix it in the next step.

#### [Source code for step 4](https://github.com/angelikatyborska/docker-rails-example/tree/step-4)

### Step 5 - REALLY persist data with Postgres

The problem is: Postgres run in the container saves its data in that container's filesystem. When the container is stopped, this data can't be accessed again. When a new container with Postgres is run, it has no recollection of the previous Postgres container's files.

The solution is: trick Postgres into saving its data to the host OS.

#### Agenda for step 5

1. Find out to which directory Postgres from the `postgres:9.5` image saves its data.
2. Mount a named volume at that directory

#### 1. Read `postgres:9.5`'s docs.

We need to consult [the docs](https://hub.docker.com/_/postgres/) again. It's easy to find that Postgres stores its data where the `PGDATA` environment variable points to, the default value is `/var/lib/postgresql/data`.

#### 2. Named volumes

Whenever we mount a directory from the host OS to a Docker volume, a new directory inside `/var/lib/docker/volumes` on the host OS gets created. It has a random name. We can create a volume that has a name, hence it will always be in the same directory inside `/var/lib/docker/volumes`, with the same data. 

You might wonder why we won't simply mount `/var/lib/postgresql/data` from the host OS. It's because whenever the Docker Machine is restarted, **it resets its filesystem** (at least on OS X). As far as we're concerned, everything outside `/var/lib/docker/` is not persisted. That's why a named volume will survive a Docker Machine restart.

Let's tweak our `docker-compose.yml` to look like this:

```yaml
version: "2"

volumes:
  postgres_data:

services:
  postgres:
    image: postgres:9.5
    volumes:
      - postgres_data:/var/lib/postgresql/data

  guestbook:
    build: ./guestbook
    volumes:
      - ./guestbook:/guestbook
    links:
      - postgres
    ports:
      - 3000:3000
```

All that is left now is to run the containers again, setup the app, check that it works, restart everything and check again.

```
$ docker-compose up -d
$ docker-compose run guestbook bin/setup
# Check 192.168.99.100:3000 in the web browser
$ docker-compose down
$ docker-machine rest
$ docker-compose up -d
# Check 192.168.99.100:3000 in the web browser again
```

Everything should be fine now. Change something in the code and refresh the browser. It works! You can run all the typical commands like so `docker-compose run guestbook bin/rake db:seed`. However, in the rare occasion of adding a new gem, you will have to restart the containers.

#### [Source code for step 5](https://github.com/angelikatyborska/docker-rails-example/tree/step-5)

### Useful tips

#### Read containers logs
```
$ docker-compose logs
```

Or even better, use the GUI app - Kitematic. 

#### Read the build log

Not everything will show up in the terminal when building. Redirect the output of the build command to a file to get a more detailed log:

```
$ docker-compose build > buildlog.txt
```

#### Clean up the mess

Running all these containers left quite a mess behind. Every time we have run a container, it didn't remove itself after stopping.

##### List all containers (both running and stopped)
```
$ docker ps -a
```

##### Remove all containers (both running and stopped)
```
$ docker rm $(docker ps -aq)
```

##### List all the images
```
$ docker images
```

##### Remove all images
```
$ docker rmi $(docker images -q)
```

##### Run everything with the `---rm` flag

```
$ docker-compose run --rm bin/rake db:seed
```

Now when the container stops, it will remove itself.

#### Where did the `192.168.99.100` come from?

It's the IP of the Linux VM. You can check it by running `docker-machine env`.

If you don't want to type the IP address every time, you can map a nice hostname to it:

```
# /etc/hosts
192.168.99.100 dockermachine
```
