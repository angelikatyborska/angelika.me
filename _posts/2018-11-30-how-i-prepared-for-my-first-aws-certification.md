---
title: How I prepared for my first AWS certification
excerpt: Here's how I went from knowing exactly zero about AWS to getting the Solutions Architect - Associate certification.
tags: [AWS, career]
date: 2018-11-30 19:33:00 +0100
---

<figure>
{% img posts/how-i-prepared-for-my-first-aws-certification/logo-color alt:'AWS Certified'%}
{% img posts/how-i-prepared-for-my-first-aws-certification/tag-color alt:'Solutions Architect - Associate'%}
</figure>

On 28 November 2018, I passed my _AWS Certified Solutions Architect - Associate_ exam. Here's how I went from knowing exactly zero about AWS to getting the certification.

## Timeline

### March (8 months before)

I worked for a small company with a single AWS specialist and a few back-end web developers. The AWS specialists decided to quit, and the company decided not to look for a replacement because the tasks did not add up to 8h of work a day. They suggested that I could be trained to take over his responsibilities. I gladly agreed.

Over the next 3 months (his termination period), we worked closely together on adding new AWS components to our system and refactoring our existing Terraform configuration. During this time, I learned all the basics of EC2, RDS, S3, Elastic Beanstalk, VPC, Lambda, API Gateway, CloudFront, IAM, Route 53, CloudWatch, SNS, and SQS. That was a huge portion of new knowledge for me.

### June (5 months before)

I was left alone with all AWS-related responsibilities at work. It felt a bit overwhelming at first, but the official AWS documentation and Terraform AWS provider documentation became my new best friends at work and I could manage.

I was taking care of a 13-app system that needs to be replicated for every new client, and as soon as a second client needed to be added (the first "client" being our staging environment), I quickly realized that Elastic Beanstalk and per-client git branches with identical code, but slightly different Elastic Beanstalk config files and deployment scripts, will not scale.

Over the next few months, I taught myself Kubernetes, tried out EKS, decide to use kops instead, and started migrating our apps from Elastic Beanstalk into a Kubernetes cluster.

This process forced me to understand our current system and the way it was deployed on AWS, especially Elastic Beanstalk and VPC, even more deeply.

### October (2 months before)

I started reading AWS Certified Solutions Architect Official Study Guide: Associate Exam. It was a version from 2017.

It was going pretty slowly, and I skipped the exercises because I was lazy and most of them seemed too easy. Most of the contents of the book I already knew from my day-to-day tasks.

As I was reading, I was marking a lot of highlights in the book. I highlighted everything that I thought was important, but I felt that I am likely to forget soon.

I was also practicing exam questions with some course I bought on Udemy but the course had very badly phrased questions (missing words, grammar mistakes). I won't mention it by name because I do not recommend it.

### 24 October (1 month before)

I booked an exam for 28 November 2018.

### 21 November (1 week before)

I finally finished reading AWS Certified Solutions Architect Official Study Guide: Associate Exam. The last chapters ("Security on AWS" and "AWS Risk and Compliance") were particularly dry and hard to get through.

### 26 November (2 days before)

I reviewed all of my highlights in the book, and I looked up anything that I felt like I do not know well yet (eg. EC2 instance families other than "c" and "t").

### 28 November (the exam)

The exam had 65 questions and took 130 minutes. When I was finished, there was still 40 minutes left ( and I did double-check my answers).

The exam was a piece of software, not paper, so immediately after finishing I got a confirmation that I passed, but without a specific score.

I had to sign an NDA about the questions. I can only say that the questions were similar to the more advanced questions from the book, and a lot of them were about using the different services together. There were no questions that required remembering arbitrary numbers, eg. what is the default limit of VPCs in a region.

### 29 November (1 day after)

The certification and the exact score I got were available online. I got 905/1000 (720 was necessary to pass), but I don't know which questions I got wrong.

## But... why?

I did not have any specific reasons to do the certification. Nobody asked me to. I don't know if it will prove to be useful.

So why did I do it?

- To see if I could.
- To force myself to patch some gaps in my knowledge.
- To have a nice entry on the CV. 
