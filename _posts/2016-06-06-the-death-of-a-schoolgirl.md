---
title: The death of a schoolgirl
excerpt: What I have come to realize during my first 3 months as a Junior Ruby Developer.
tags: [first job]
date: 2016-06-06 21:46:00 +0200
---

Sorry about that grim click-baity title, but that's how I feel about my change of attitude towards software development in the past few months. 

I have always been a straight-A student. I believed that studying hard and getting a university diploma is the way to a good life. I ended up dropping out of university. Twice. Not because I couldn't get passing grades, but because I felt like it's not getting me where I wanted to be. But that's a story for another long blog post.

The story for this post is the attitude that many straight-A students have. It boils down to the strong belief that there always is a single correct answer. Or maybe there are many correct answers, but one of them is the preferred one. And the teacher knows that one answer along with all the questions.

## Teacher, tell me the right way to do this

Ever since I first started learning about software development, I have had exactly this attitude. I expected every problem to have one correct solution, and I was convinced that if I read enough books, I would know all the solutions needed to build something useful.

Studying computer science at the university fulfilled those expectations. It was a bunch of teachers asking questions about stuff they knew all about expecting to hear all the correct answers. If I didn't know the answers, they would just tell me and I would learn that way. Just like in high school, and middle school, and primary school (I don't remember much of my life before that).

When I was learning something at home, beyond the curriculum, I needed to know all the *best practices* and *conventions*. I was terrified to make a fool out of myself by breaking a rule that I didn't know existed. It didn't help that I started learning backend development with Rails. Because of Rails, I had an expectation that every framework and every library would make all the decisions for me. And I was frustrated when it didn't. What do you mean *I* have to come up with the directory structure of *my* project *myself*? Surely there must be a *convention* for that. Teacher, what am I supposed to do? Oh, wait...

Well, working as a software developer (fortunately!) is nothing like being a student. Here is a brief reality check for a 3 months younger me:

## Reality check

### Senior developers are not your teachers

Sure, you can learn a lot from them, but they're more like your older siblings. They are not omnipotent, just more experienced. They do feel responsible for you and they will help you if you ask nicely, but most of the time they just wished you did what you were told without being too stupid.

In a healthy team helping each other is encouraged, but **you** have to differentiate between situations when you really need help and when you just need to read more on the subject yourself.

### Senior developers do not know the APIs of all libraries by heart

They google stuff all the time too. You can do that yourself. Not sure how an external library works? Read the docs. Don't understand the docs? Read them again. Then read the source code. It's Ruby, you have the source code of every gem you're using on your computer. Navigating to the relevant line of code in a blink of an eye is one of the many reasons I love RubyMine. 

<figure>
<a href='{% asset posts/the-death-of-a-schoolgirl/go-to-declaration @path %}'>
{% asset posts/the-death-of-a-schoolgirl/go-to-declaration alt='Go To Declaration in RubyMine'%}
</a>
<figcaption>What would I do without you, RubyMine?</figcaption>
</figure>


### There is no "doing it by *the* book"

There are many books, and blog posts, and Stack Overflow answers. And they sometimes contradict each other. Some problems are well known and there is indeed "the correct answer" for those. Most problems are however totally unique to you, your team and your domain. You have to consider all the options, how they apply to your situation and then **you** have to choose which one is the best. Yes, **it is hard**. Other people, not involved in your project, won't help you that much. You might be a junior, but you're still an employee. You get paid to make decisions. At least the less significant ones.

### *Good practices* matter only if you *practice* at all

It's awesome that you want to keep your work tidy and well-structured, the world needs more juniors like you, but the fear of failure is not an excuse to refrain from writing code at all! You will make mistakes. Your code will make somebody cringe at some point. Most importantly, you code will make you cringe in just a few months, of that I am 100% sure. Now stop worrying about that so much and write something. Learning good practices makes the most sense when you have actually encountered (and probably caused) the problems with badly structured code that the practices aim to solve.

That being said, I still can't help but be super excited about [Katrina Owen and Sandi Metz witting a book together](http://signup.99bottlesbook.com/)!

## Conclusion

Real life is more complicated than school, *duh*. Coding is hard work, *duh*. Everyone not suffering from perfectionism knows this already.
