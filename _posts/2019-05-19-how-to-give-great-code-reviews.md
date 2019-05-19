---
title: How to give great code reviews
excerpt: If you think the only purpose of a code review is to catch bugs, read this.
tags: [code reviews, teamwork]
date: 2019-05-19 16:44:00 +0200
---

To give great code reviews, you need to know why you are doing code reviews.

## Why do we review code?

We all know what code reviews are important, but why? They can catch some bugs and prevent terrible design decisions from going to production, but is that their only function? 

In my experience, a great code review has three important goals.

1. To keep the team up to date with a changing codebase.
2. To improve the quality of the project.
3. To provide feedback for the developer.

## 1. To be up to date with the codebase

Giving code reviews forces developers to read the parts of the code that they themselves didn't work on. This improves the team's overall knowledge of the codebase. As a result, task planning goes more smoothly and the accuracy of time/complexity estimations increases.

### I. Find out the *why* first

To be able to understand a code change, you must first understand why it was made.

Most of us work with some kind of issue tracking system. Identify the issue/ticket associated with this code change and read it thoroughly, including the comments. Read the description of the pull request if there is any. This will give you context necessary not only to understand the changes themselves, but to judge if the changes fit the requirements.

Without context, for example, hardcoding a dot as the decimal separator for numbers seems reasonable for your US-only app, but if you read the ticket, you would know that your company is expanding to other countries and now the user's locale needs to be involved in [choosing the decimal separator](https://en.wikipedia.org/wiki/Decimal_separator#Arabic_numerals).

If there is no issue/ticket, and no PR description, write down a description of your own and include it as part of the review. If you misunderstood the purpose, the reviewee is likely to point that out.

### II. Read, don't skim

Don't be content with a simple "looks good to me". All well-formatted code looks good when you skim it! You want to read the changes and **really understand them**. Yes, it's difficult. Yes, it will take more time. Yes, it's worth it. It will also increase your chances of catching not-so-obvious project quality issues.

## 2. To improve project quality

Having a second pair of eyes look the code before it goes to production is a good way to catch *some* bugs and ensure the code will be maintainable.

### III. Always run the code

One-line change? Run the code. Just CSS changes? Run the code. Just translations? RUN. THE. CODE.

Do not kid yourself into thinking that everyone always compiles and runs the project after every change they make. We should... but we don't. You know, those times when you have just 5 minutes left before you need to leave the office, and you have just one more trivial change to make, but you don't have the time to verify it.

Ensuring that the project still compiles and runs without throwing exceptions is the least you can do as a reviewer. It's a **simple sanity check**. So you should do it.

If there were any user-visible changes introduced, make sure you see them with your own eyes. Click through the new UI components.

Run the tests. Yes, I know the CI is supposed to do that. But maybe there are flaky tests that will pass on CI by chance? Or maybe there is a bug that only appears on your macOS, but the CI is running Linux? Maybe somebody didn't follow the correct naming pattern for the test file and the test runner ignored the file altogether?

Do the changes include database migrations? End your review process by rolling them back, checking out `master` and checking if the project still runs.

### IV. Do not nitpick

Somebody inserted two empty lines where they were only supposed to insert one? Don't mention it. The reviewee's **patience** to fix problems that you have with their code **is limited** and you don't want to waste it on trivial issues.

Instead, try to find an automated solution that is going to ensure all those trivial details are detected automatically and suggest that your team starts using it.

### V. Focus on readability issues that can't be detected automatically

Once you have your automated tools validating function name length and proper indentation, you can focus on the important stuff that only a human can catch.

Do those function/variable names make sense to you? Do they use the project's vocabulary consistently? Could they be confusing? Are there any ambiguous abbreviations?

Fun story: I once spent 10 minutes believing that our app had a feature where guest users (non-paying users invited by paying users with subscriptions) are allowed to invite more guest users because somebody named a variable `sub_guest` instead of `subscription_guest`.

## 3. To provide feedback for the developer

Good feedback is feedback that **reinforces somebody's good habits** and helps notice and remove bad habits. For your feedback to have any impact at all, you need to **ensure that you are being listened to**.

### VI. Always say something nice

I don't care how trivial the code changes are. You can always say something positive. The more specific the positive feedback is, the better.

It might be hard to come up with something if you never did this before, so here are some generic examples for inspiration:

> Good job! I tried my best to find bugs in your code, but couldn't.

> Thanks for fixing that typo, I wasn't aware this is the correct spelling of that word.

> I love how you named this function. It's immediately obvious what it does.

> Wow, that's neat. I wasn't aware of this feature of our programming language / this framework / this library.

> I like that you added all of this new code in a new file. It was tempting to put it in the existing file, but that would make the existing file way too big.

If you are afraid to sound silly for appreciating trivial things, ask yourself how you feel when you receive a code review. Are you excited? Or are you dreading it because you know that in the best case, it will be neutral silent approval, but in the worst case, it will be full of harsh criticism? Do you really want your coworkers to dread receiving reviews from you just because you are afraid of sounding silly?

Another important role of **positive feedback** is that it **makes the reviewee more open to your negative feedback**.

Do you have that one family member that uses every chance they see you to complain about you? You gained weight again, your sibling makes more money than you do, and you should smile more... How likely are you to actually consider their complaints as valid points that will inspire you to improve yourself? Not at all? Well, receiving only negative feedback from the same coworker for months feels the same.

### VII. Avoid judgemental and bossy language

The easiest way to stop sounding judgemental and bossy is to **assume you are wrong**, and the reviewee is right. **Then ask questions** that will help you realize why you are wrong. After all, they probably spent much more time working on this code than you spent on reviewing it. They are more likely to understand the details.

Do not say *"~~don't do this, do that~~"*. You don't want to cultivate in your coworkers the ability to follow orders. You want them to think creatively and critically. Besides, nobody likes to be bossed around.

Instead, say *"what would you think about..."*. Signal that you are open to a conversation. People are more motivated to do something if they were involved in making the decision.

Do not say *"~~why don't you just...~~"*. This phrase suggests that your solution is the obvious choice and the reviewee is stupid for not using it. It might trigger a defensive reaction that will make otherwise smart and reasonable people passionately defend a flawed position.

Instead, say *"have you considered...?"*, explain why your solution would be advantageous in this situation and follow up with a friendly invitation to prove you wrong, e.g. *"...or did I miss something?"*.

Now, I am not saying you are actually always wrong. But **you are definitely not always right**. This approach will make it easier for both you and the reviewee to admit when either of you is wrong **without losing face**.

#### GitHub PR reviews

GitHub has a feature that allows you to mark your pull request review as *comment*, *accept*, or *request changes*.

I tend to avoid *requesting changes* unless I am absolutely certain something needs to be changed. *Requesting changes* is bossy language and doesn't leave much room for debate. I will make *comment* reviews until all my questions have been addressed, and then *accept*.

## Summary

Great code reviews take time to do, but they will improve not only your project but your knowledge of the project and **your relationship with your team**.

Remember: 

- [1. To be up to date with the codebase](#1-to-be-up-to-date-with-the-codebase)
  - [I. Find out the *why* first](#i-find-out-the-why-first)
  - [II. Read, don't skim](#ii-read-dont-skim)
- [2. To improve project quality](#2-to-improve-project-quality)
  - [III. Always run the code](#iii-always-run-the-code)
  - [IV. Do not nitpick](#iv-do-not-nitpick)
  - [V. Focus on readability issues that can't be detected automatically](#v-focus-on-readability-issues-that-cant-be-detected-automatically)
- [3. To provide feedback for the developer](#3-to-provide-feedback-for-the-developer)
  - [VI. Always say something nice](#vi-always-say-something-nice)
  - [VII. Avoid judgemental and bossy language](#vii-avoid-judgemental-and-bossy-language)
