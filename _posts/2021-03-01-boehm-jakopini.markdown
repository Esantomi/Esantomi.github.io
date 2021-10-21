---
title: "뵘-야코피니 정리(Böhm–Jacopini theorem)란?"
layout: post
date: 2021-03-01 20:00
image: /assets/images/markdown.jpg
headerImage: false
tag:
- computer science
- programming language theory
star: false
category: blog
author: haechanji
description: The three of control structure. Sequence, Selection, Iteration
---

<strong>뵘 야코피니 정리(Böhm–Jacopini theorem)</strong>는 간단히 말해, 컴퓨터로 해결 가능한 문제는 모두 'Sequence', 'Selection', 'Iteration'의 3가지 제어 구조(control structure)로 나타낼 수 있다는 정리다.  

다르게는 <strong>[구조적 프로그램 정리(Structured program theorem)][1]</strong>라고도 부르며 3가지 제어 구조는 아래와 같다.  

<p align="center">
  <img src="https://user-images.githubusercontent.com/61646760/129692096-ebbde7d5-9411-44b3-9827-30026346b0c8.png" />
</p>

- **순차(sequence)** : Executing one subprogram, and then another subprogram
- **선택(selection)** : Executing one of two subprograms according to the value of a boolean expression
- **반복(Iteration)** : Repeatedly executing a subprogram as long as a boolean expression is true

[1]: https://en.wikipedia.org/wiki/Structured_program_theorem