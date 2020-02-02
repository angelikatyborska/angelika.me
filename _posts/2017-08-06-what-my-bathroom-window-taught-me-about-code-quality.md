---
title: What my bathroom window taught me about code quality
excerpt: When bad code is not that bad...
tags: [shower thoughts]
date: 2017-08-06 20:13:00 +0200
---

When my boyfriend moved into our current apartment, he realized there is a small flaw in the bathroom - only the bottom part of the window was made from frosted glass. The top half was crystal clear and would expose everything that happens in the bathroom to the neighbors on upper floors.

He needed to cover the window to have some privacy.

The proper solutions to covering a window are curtains, shutters, roller blinds, or frosted window film. The first three have the advantage of having two states, the window can be either covered or uncovered without dismantling the thing, but they also block the sunlight. The last one covers the window all the time but lets the sunlight in.

All of them require planning and money, and are not doable on a single evening, especially when the shops had already closed for the day.

My boyfriend needed to take a shower in that bathroom that evening.

His solution - tape a piece of cardboard to the window.

<figure>
<a href='{% asset posts/what-my-bathroom-window-taught-me-about-code-quality/the-window @path %}'>
{% asset posts/what-my-bathroom-window-taught-me-about-code-quality/the-window class='half-width' alt:'Cardboard stuck to the window to block view'%}
</a>
</figure>

Almost a year later, that window is still covered by the same piece of cardboard. Why? Because it was the solution with the highest ratio of value to cost.

- It was quick and cheap. The required materials, tape and cardboard, were already in the apartment.
- It is effective. It completely stops the neighbors from seeing what they should not see.
- It is not a problem that the cardboard stops sunlight. The bathroom already gets plenty of sunlight from the bottom window.
- It is not a problem that the window cannot be easily covered and uncovered without tearing down the cardboard. The window is too high to reach without a ladder.
- It is not a problem that the cardboard is ugly. We do not really care.
- There are no young and impressionable interior designers coming over to our apartment, looking at that window and thinking that a cardboard stuck to the window is a good design pattern.

## So... what's the point?

This is just a silly example, but it made me think about how I approach the quality of the code I write and the code I expect from others.

I suffer from perfectionism. My coworkers complain that I can be too demanding of them (but also of myself). Sometimes I catch myself being really stubborn during a code review (sincere apologies to everyone that was ever affected). If that happens, I try to stop and ask myself - what is this code for?

The value of the code is the usability it brings to the user, not its cleanliness or beauty.

The price of the code is the time and the energy spent to develop it.

Usually, bad code is expensive. Bad code is hard to understand. Bad code is hard to debug. Bad code is hard to extend. Because of all of these reasons, bad code also decreases the value that can be delivered in the future.

But sometimes, just sometimes, you know you are writing code that will never again be read, and will never be modified. You know it will be used, maybe just once or twice, and then it will be thrown away. That is when bad code is cheap.

I understand now that a good software developer is not somebody who delivers good, clean code all the time, but somebody that is able to assess the situation and deliver a solution with the highest ratio of value to (**long-term**) cost. Even if that means writing a quick dirty hack once in a while.

Oh, but try to make sure no young and impressionable junior developers will come over to your code base, look at that bad code and think it's a good design pattern since a respected developer like yourself wrote it. Maybe leave a word of warning in a comment?

```ruby
# Here be dragons!
```

or

```ruby
# Forgive me, Father, for I have sinned...
```

or

```ruby
# ~~~ POLICE LINE DO NOT CROSS ~~~ POLICE LINE DO NOT CROSS ~~~
```

or

```ruby
# I was young and I needed the money.
```
