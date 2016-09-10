---
 title: How to ORDER BY the result of SELECT COUNT in Ecto
 excerpt: "Spoiler: by using fragments to set an alias."
 tags: [elixir, ecto, sql]
 date: 2016-09-10 21:06:00 +0200
---

I have been recently using Ecto to write an app that would generate complex business reports. The query I put together was really big, joining four different tables, lots of aggregation. One of the requirements was that it was up to the frontend to send the names of the columns by which the results were supposed to be ordered. Those columns were not part of any of the schemas of those four tables, but rather the result of using `select` with aggregate functions. Sorting the list after executing the query was out of the question because I needed to do pagination in that query as well.

It took me some time to figure out how to do that because I couldn't find any good examples. In case somebody else is having the same problem and can't figure it out either, here is my solution.

## The problem

Let's assume we have a very simple `posts` table.

```elixir
defmodule Post do
  use Ecto.Schema

  schema "posts" do
    field :user_id
    timestamps
  end
end
```

From that table, we can get the post count per user (to be exact, only for those users that have at least one post):

```elixir
Post
|> group_by(:user_id)
|> select([post], %{
  post_count: count(post.id),
  user_id: post.user_id,
})
|> Repo.all
```

That code generates this SQL query:

```sql
SELECT count(p0."id"), p0."user_id"
FROM "posts" AS p0
GROUP BY p0."user_id"
```

Well, great, but how do we order those results now? `:post_count` is **not** a field in the `posts` schema, so this:

```elixir
Post
|> group_by(:user_id)
|> select([post], %{
  post_count: count(post.id),
  user_id: post.user_id,
})
|> order_by(:post_count)
|> Repo.all
```

Results in this error:

```
** (Postgrex.Error) ERROR (undefined_column): column p0.post_count does not exist
```

## Select with an alias

The answer is to use an alias. Ecto does not support aliases, but it provides a [`fragment`](https://hexdocs.pm/ecto/Ecto.Query.API.html#fragment/1) function to write SQL directly for all those edge cases where Ecto's other functions are just not enough.

With `fragment`, we can set an alias and use it in `order_by`:

```elixir
Post
|> group_by(:user_id)
|> select([post], %{
  post_count: fragment("count(?) as post_count", post.id),
  user_id: post.user_id,
})
|> order_by(fragment("post_count"))
|> Repo.all
```

That code generates this SQL query:

```sql
SELECT count(p0."id") AS post_count, p0."user_id"
FROM "posts" AS p0
GROUP BY post_count
```

## DateTime and fragment

Pay attention when using `fragment` to select datetimes.

This will return them as `%Ecto.DateTime{}`:

```elixir
Post
|> select([post], %{
  inserted_at: post.inserted_at,
})
|> Repo.all
```

Whereas this will return them as datetime tuples:

```elixir
Post
|> select([post], %{
  inserted_at: fragment("(?)", post.inserted_at),
})
|> Repo.all
```
