---
title: Dependencies vs. devDependencies for JavaScript apps
excerpt: "Whenever I'm adding a new dependency to a JavaScript app, or setting up the build process of a new app, I ask myself: what exactly are devDependencies? It's time to answer that question in depth."
tags: [JavaScript]
date: 2024-11-11 19:25:00 +0100
---

Whenever I'm adding a new dependency to a JavaScript app, or setting up the build process of a new app, I ask myself: what exactly are devDependencies? How do I decide whether to add a new dependency as a regular dependency or a dev dependency?

The [official NPM documentation](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#devdependencies) advises:

> If someone is planning on downloading and using your module in their program, then they probably don't want or need to download and build the external test or documentation framework that you use.

This is very true, but it's aimed at library authors. I'm not writing JavaScript libraries, I'm writing apps. Nobody will be installing my app as their dependency.

Searching for [other people's takes about this problem](https://medium.com/@ckekula/understanding-dependencies-devdependencies-and-peerdependencies-in-node-js-e8eeb9c858e7), I find definitions like:

> Dependencies are the packages that your project needs to run in production, (...) devDependencies are the packages that are only needed during development and testing.

But what does it mean to "run in production" if I'm building a static website?

⚠️ ATTENTION: Let me reiterate - this blog post is about building apps and not libraries. ⚠️ 

## What does it mean to "run in production"?

JavaScript can be used to create many different kinds of apps. For example:

1. Running a Node.js HTTP server. This includes projects made with e.g. Express.js, Redwood, and meta-frameworks like Next/Nuxt/Astro in SSR mode.
2. Producing static HTML, CSS, and JS files and serving them with a non-JS HTTP server. This includes projects made with e.g. static site generators like Eleventy or Docusaurus, meta-frameworks like Next/Nuxt/Astro used in SSG mode, Create React App etc.
3. Desktop apps.
4. Mobile apps.

All of those "run" in different ways.

A Node.js HTTP server (software) is a Node.js system-level process on some server (hardware). Module resolution happens when the app boots, so you can identify _regular_ dependencies as dependencies that are necessary for the app to boot and run. 

But a static website doesn't "run" on the server. It's made up of static files that get sent to an end-user, whose browser parses and executes them on that user's computer, in the browser's JS engine (not Node.js). Module resolution happened a long time ago, during the build process, and all the dependencies got bundled into a single file. To create the bundle, you need all the _regular_ dependencies that will be put into the bundle, but you also need the bundler. So... is the bundler a regular dependency too?

(I'm not even going to pretend that I know how JavaScript desktop or mobile apps "run". I'm a web developer, ok?)

### Are build tools regular dependencies or development dependencies?

I'm not sure if our industry agrees on one answer to that question. As "build tools", I would count bundlers, transpilers, and static site generators.

Here's what I found trying to research the approach to dev dependencies of some popular build tools:

- Vue CLI (*) puts vue/cli-service as a **dev** dependency
- Create React App (*) puts react-scripts as a **regular** dependency, but
- Vite React and Vue templates puts Vite as a **dev** dependency, but
- Eleventy tells you to install it as a **regular** dependency, but
- Webpack tells you to install it as a **dev** dependency, but
- Docusaurus' scaffolding script puts docusaurus/core as a **regular** dependency, but
- esbuild tells you to install it as a **dev** dependency.

(*) Those ways of bootstrapping new apps are deprecated but used to be very popular.

(**) I'm not considering Next/Nuxt/Astro because those tools allow you to switch between SSR and SSG, which encourages them to define themselves as regular dependencies because they can either be a build tool or a server.

## Practical differences between a regular dependency and a dev dependency

Regular dependencies will always be installed. Dev dependencies will only be installed using specific install commands.

As far as I know, there are no other practical differences. Dev dependencies can be `import`ed or `require`d from your app code. Regular dependencies can be imported Anything that's inside of `node_modules` can, even if it's not listed in your `package.json`.

Below is an overview of different install commands and which dependencies they install.

### Install commands overview

| Command                                              | Regular deps | Dev deps | 
|------------------------------------------------------|--------------|----------|
| `npm install`                                        | ✅ yes        | ✅ yes    |
| `NODE_ENV=test npm install`                          | ✅ yes        | ✅ yes    |
| `NODE_ENV=production npm install`                    | ✅ yes        | ❌ no     |
| `npm install --production`                           | ✅ yes        | ❌ no     |
| `NODE_ENV=production npm install --production=false` | ✅ yes        | ✅ yes    |
| `npm install --omit=dev`                             | ✅ yes        | ❌ no     |
| `NODE_ENV=development npm install --omit=dev`        | ✅ yes        | ❌ no     |
| `NODE_ENV=production npm install --include=dev`      | ✅ yes        | ✅ yes    |

Note that replacing `npm install` with `npm ci` does not change the results. You should [run `npm ci` on CI and when preparing a deployment](https://docs.npmjs.com/cli/v10/commands/npm-ci).

Also note that a `.npmrc` file can set some of those flags for you, so look out for its presence.

We can see that setting `NODE_ENV` affects which dependencies get installed. This can additionally be controlled by passing either [`--omit`](https://docs.npmjs.com/cli/v10/using-npm/config#omit) or [`--include`](https://docs.npmjs.com/cli/v10/using-npm/config#include) flags (which btw. do modify the value of `process.env.NODE_ENV`).

### If `NODE_ENV` matters for devDependencies, what else does it matter for?

`NODE_ENV` is an [environment variable that doesn't mean anything in Node.js itself](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production), but can change the behavior of various JavaScript libraries.

You have to check for yourself how `NODE_ENV` affects your project. Here are some examples:

- Are you using `.env` files? Are you loading different `.env` files depending on the `NODE_ENV` variable? For example, [Next.js does](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#environment-variable-load-order).
- Does your framework provide a `build` command? Does this command automatically set `NODE_ENV` to `production`? For example, [Nuxt.js does](https://nuxt.com/docs/api/commands/build).
- Are you using Express.js? [In Express.js, it turns on caching and makes logging less verbose](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production).
- Are you yourself reading `process.env.NODE_ENV` to decide which scripts to load in your app? For example, maybe you're only including an error tracker or analytics in production.

## How do I decide what is a dev dependency?

I'm afraid there is no single correct answer to this question. I'd like to propose 3 different approaches.

Choose one and stick with it. And whatever you choose, don't forget to modify the app template your favorite tools generated for you because they're likely to have a different opinion about this.

### A. Nihilistic approach

**It doesn't matter**. Define everything as a regular dependency and be done with it. Or define everything as a dev dependency and always include `--include=dev` in your `npm install` command. It's all fine.

As an app author, not a library author, you're not going to inconvenience any third-parties with this choice.

Just make sure to set `NODE_ENV=production` for production builds / running in production, that matters (depending on your framework).

**Why you might want to choose this approach?** It requires the least effort.

### B. Idealistic approach

**It matters because words have a specific meaning**. _Development_ dependencies are used by _developers_ to _develop_ the app. This means build tools are dev dependencies because the _development_ process isn't finished until the app is fully deployed and serving users.

You will need to carefully consider each dependency when adding it, and you will not gain any automated assurances from this kind of approach. You'll have to run `npm install --include=dev` on your build servers (SSG) or deployment servers (SSR). 

**Why you might want to choose this approach?** It will help you understand which code runs on the users' computers or your deployment server, and which code only ever runs on the developers' machines or build servers. You can use this split to decide which dependencies need more attention: more thorough security reviews, more often updates, and so on.

### C. Pragmatic approach

**It matters because there is a practical difference**. The one practical difference between regular and dev dependencies is that you can choose to omit to install dev dependencies in specific scenarios. This can be controlled via `NODE_ENV`, so you can define the term "dev dependency" as a dependency that is NOT needed to run any of you app's commands that run with `NODE_ENV` set to `production`. This defines build tools as a regular dependency because you need them to generate a production build.

**Why you might want to choose this approach?** It will help you limit the number of dependencies installed on your build servers (SSG) or deployment servers (SSR).

#### Why it might matter to limit the number of installed dependencies?

##### 1. Each dependency is a potential attack vector

A NPM package could potentially [install malware and steal your private data](https://arstechnica.com/information-technology/2021/12/malicious-packages-sneaked-into-npm-repository-stole-discord-tokens/). If such a vulnerability is found in your development dependency, you're going to be in a lot more trouble if you're also installing development dependencies on your production servers or build servers.

##### 2. Each dependency takes time to install

Nobody likes waiting hours for a deployment to finish. The more dependencies that need to be installed during a deployment, the longer it takes.

##### 3. Each dependency takes storage space

Are you caching your dependencies somewhere during the deployment process? Maybe directly using your CI's cache, or inside a Docker image? Are you maybe paying for that storage space?

## Conclusion

TL;DR: devDependencies are tied to `NODE_ENV`, but you can control that by passing `--omit` or `--include` flags to the install command. You can declare everything as a regular dependency and be fine ([a nihilistic approach](#a-nihilistic-approach)), or you can take the time to split regular dependencies from dev dependencies for architectural clarity ([an idealistic approach](#b-idealistic-approach)) or for a gain in speed and security ([a pragmatic approach](#c-pragmatic-approach)).
