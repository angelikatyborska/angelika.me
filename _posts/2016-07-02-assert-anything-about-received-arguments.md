---
title: Assert anything about received arguments
excerpt: Advanced argument matching in RSpec.
tags: [ruby, rspec, testing]
date: 2016-07-02 18:46:00 +0200
---

Chances are you have never read RSpec's documentation from A to Z. I know I haven't. I picked up on some fancy matchers here and there and never felt compelled to discover more. I have only ever matched the arguments received by a spy or a double with literals, like in the example below.

## Spying 101

```ruby
it 'knows my every move'
  nsa = spy('NSA')
  nsa.download_movies('Finding Dory 1080p')
  
  expect(nsa).to have_received(:download_movies)
    .with('Finding Dory 1080p')
end
```

This has recently proven not to be enough.

## My problem

I needed to assert that a logger would receive a call to `log_error` with an argument that was an error with a very specific message. The error was created inside the method under test and I didn't care what its class would be. I just wanted to make sure it had the right message.

[This beautiful table](https://relishapp.com/rspec/rspec-mocks/v/3-5/docs/setting-constraints/matching-arguments) holds the answer to my problem. Before I get to the last entry, `with(<matcher>)`, which is the "anything" part of this post and my solution, let's review some of the other interesting options first.

## Fancy argument matching

### Match with a regular expression

```ruby
nsa.download_movies('Finding Dory 1080p')

expect(nsa).to have_received(:download_movies)
  .with(/Finding Dory/)
```

### Care only about the nth argument

```ruby
nsa.download_movies('Toy Story 720p', 'Finding Dory 1080p')

expect(nsa).to have_received(:download_movies)
  .with(anything, 'Finding Dory 1080p')
```

### Care only about the last argument

```ruby
nsa.download_movies(
  'Toy Story 720p',
  'Monsters, Inc. 720p',
  'Finding Nemo 1080p',
  'Finding Dory 1080p'
)

expect(nsa).to have_received(:download_movies)
  .with(any_args, 'Finding Dory 1080p')
```


### Expect no arguments at all

```ruby
nsa.download_movies

expect(nsa).to have_received(:download_movies)
  .with(no_args)
```

### Expect a certain interface

```ruby
nsa.download_movies('Finding Dory 1080p')

expect(nsa).to have_received(:download_movies)
  .with(duck_type(:upcase))
```

### Expect an instance of a certain class

```ruby
nsa.download_movies('Finding Dory 1080p')

expect(nsa).to have_received(:download_movies)
  .with(instance_of(String))
```

### Check the ancestors list

```ruby
nsa.download_movies('Finding Dory 1080p')

expect(nsa).to have_received(:download_movies)
  .with(kind_of(Comparable))
```

## Satisfy - the solution to my problem

Since `with` can be called with any matchers (those things that go after `expect(sth).to`), I can use the flexible matcher [`satisfy`](https://www.relishapp.com/rspec/rspec-expectations/v/3-5/docs/built-in-matchers/satisfy-matcher). It takes a block and calls it with the argument received by the spy. Inside that block, you can do whatever you please with the argument, like calling its methods. The matcher will pass if the block returns a truthy value. 

```ruby
logger = spy()

# some code that uses the spying logger

expect(logger).to have_received(:log_error)
  .with(satisfy { |error| error.message == 'Ooops' })
```
