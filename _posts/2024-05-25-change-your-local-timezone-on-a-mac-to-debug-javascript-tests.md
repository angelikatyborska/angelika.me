---
title: How to change your local timezone on a mac to debug date-related JavaScript tests
excerpt: My date-related JavaScript tests were passing locally, but failing on CI. Changing my local timezone helped me find the bugs.
tags: [JavaScript, testing]
date: 2024-05-25 16:09:00 +0200
---

One of the challenges of working with dates in JavaScript is the fact that [almost every date method in JavaScript gives you a date/time in local time](https://css-tricks.com/everything-you-need-to-know-about-date-in-javascript/).

```js
date = new Date(2024, 04, 25, 0, 0 ,0)
// => Date Sat May 25 2024 00:00:00 GMT+0200 (Central European Summer Time)
```

This is different from most programming languages, which create dates in GMT unless specified otherwise.  

```elixir
# Elixir
DateTime.new(~D(2024-05-25), ~T(00:00:00))
# => {:ok, ~U[2024-05-25 00:00:00Z]}
```

This characteristic of JavaScript can lead to unit tests that pass on one machine, but not the other, if the machines have different local timezones.

If you're running into this issue, you can change your local timezone temporarily to debug and fix your tests.

## How to change your local timezone

To change your timezone to GMT, run:

```bash
sudo systemsetup -settimezone GMT
```

For a list of all available timezones, run:

```bash
sudo systemsetup -listtimezones
```

To find out your current timezone, run:

```bash
sudo systemsetup -gettimezone
```

## In which time zones to debug?

There is no one correct answer to this question. It all depends on your specific situation.

Most likely, your CI server is running in GMT, so you will want to debug your tests in GMT if they're failing on CI but not on your machine.

However, there might be bugs hidden in your code that will not show up when testing either in your actual local timezone or in GMT. Let me give an example.

Let's say I am testing a function that checks if a given date falls on a weekend (Saturday or Sunday), and I mistakenly used `getUTCDay` instead of `getDay`.

```javascript
function isWeekend(date) {
  return date.getUTCDay() === 0 || date.getUTCDay() == 6
}
```

Let's say those are my tests:

```js
expect(
  isWeekend(new Date('2024-05-25T08:00'))
).toBeTrue()

expect(
  isWeekend(new Date('2024-05-25T00:00'))
).toBeTrue()
```

The first assertion would pass both in GMT, and my local timezone GMT+2 (Europe/Berlin), but it would fail for example in GMT-10 (Pacific/Honolulu)

The second assertion would fail in GMT, but pass in my local timezone GMT+2 (Europe/Berlin).
