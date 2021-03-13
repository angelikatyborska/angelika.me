---
title: The problem with Task.await/2 and timeouts
excerpt: It's a common pattern to start many asynchronous tasks at once and then await each task using Task.await/2. But did you know that the timeouts can add up?

tags: [Elixir, tasks, async]
date: 2021-03-13 16:05:00 +0100
---

It's a common pattern to start many asynchronous tasks at once and then await each task using [`Task.await/2`][task-await] in `Enum.map/2` like so:

```elixir
inputs
|> Enum.map(&Task.async(fn -> function.(&1) end))
|> Enum.map(&Task.await(&1, 1_000))
```

At a first glance, it might look like this snippet of code will never execute for longer than 1 second (1000 milliseconds) but that's not the case!

It's important to be aware that `Task.await` is synchronous, and every time it is called, it starts its timeout clock from 0. That means that when it's used in this way, sequentially, **the timeouts add up**.

The first task that is awaited will run no longer than the timeout, but the second task that is awaited will get to run for however long the first task ran, plus the timeout.

Consider a situation where each task takes a little bit longer to run than the previous one, but the difference in task run duration is smaller than the await timeout.

```elixir
inputs = 1..10
function = fn n -> :timer.sleep(n * 900) && n end
```

We can use [`:timer.tc/1`][erlang-timer-tc], an Erlang function, to measure how long those tasks will run, in **micro**seconds.

```elixir
:timer.tc(fn ->
  inputs
  |> Enum.map(&Task.async(fn -> function.(&1) end))
  |> Enum.map(&Task.await(&1, 1_000))
end)

# => {9004517, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
```

9004517 microseconds is 9 seconds, much more than the given timeout of 1 second (1000 milliseconds).

If this is the behavior you want - great, go for it! If not, the alternative is to use either [`Task.async_stream/3`][task-async-stream] or [`Task.await_many/2`][task-await-many].

## `Task.async_stream/3`

[`Task.async_stream/3`][task-async-stream] allows you to run the same function for many different inputs, each in its own task. The tasks are linked to the current process, just like when run with `Task.async/1`. It returns a stream.

It accepts a timeout that applies to every task separately. Consider the same inputs and the same function used with `Task.async_stream/3`:

```elixir
inputs
|> Task.async_stream(function, timeout: 1_000)
|> Enum.to_list()
# => ** (exit) exited in: Task.Supervised.stream(1000)
#       ** (EXIT) time out
#       (elixir 1.11.3) lib/task/supervised.ex:304: Task.Supervised.stream_reduce/7
#       (elixir 1.11.3) lib/enum.ex:3473: Enum.reverse/1
#       (elixir 1.11.3) lib/enum.ex:3066: Enum.to_list/1
```

And with an appropriate timeout to allow the slowest task to finish:

```elixir
inputs
|> Task.async_stream(function, timeout: 10_000)
|> Enum.to_list()
# => [ok: 1, ok: 2, ok: 3, ok: 4, ok: 5, ok: 6, ok: 7, ok: 8, ok: 9, ok: 10]
```

`Task.async_stream/3` is great if you have a single function to run with different inputs. It provides a lot of control by accepting other useful options, like how many tasks to run at the same time and what to do on task timeout.

If you need to run tasks that perform different operations, you might need `Task.await_many/2` instead.

## `Task.await_many/2`

[`Task.await_many/2`][task-await-many] was introduced in Elixir 1.11. It allows you to await many tasks with a shared timeout. Consider the same inputs and the same function used with `Task.await_many/2`:

```elixir
inputs
|> Enum.map(&Task.async(fn -> function.(&1) end))
|> Task.await_many(1_000)
# => ** (exit) exited in: Task.await_many([...], 1000)
#        ** (EXIT) time out
#        (elixir 1.11.3) lib/task.ex:725: Task.await_many/5
#        (elixir 1.11.3) lib/task.ex:709: Task.await_many/2
```

And with an appropriate timeout to allow the slowest task to finish:

```elixir
inputs
|> Enum.map(&Task.async(fn -> function.(&1) end))
|> Task.await_many(10_000)
# => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

_This content was originally written for [the Elixir track on Exercism][exercism-elixir-track-task-about]._

[erlang-timer-tc]: https://erlang.org/doc/man/timer.html#tc-1
[task-await]: https://hexdocs.pm/elixir/Task.html#await/2
[task-await-many]: https://hexdocs.pm/elixir/Task.html#await_many/2
[task-async-stream]: https://hexdocs.pm/elixir/Task.html#async_stream/3
[exercism-elixir-track-task-about]: https://github.com/exercism/elixir/blob/4842aa5f70942590a9f50f47072151347512402e/concepts/tasks/about.md
