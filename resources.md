---
title: Reference
permalink: /resources/
---

### Resources
저술(Publication) 외 기타 자료들을 모아 둔 페이지입니다.

<details>
  <summary style="font-family: 'SimKyungha', cursive; font-size: 19px">Click here to view my CV</summary>
  <figure>
    <center>
      <embed src="/documents/Haein_cv.pdf" width="100%" height=1000 type='application/pdf'>
    </center>
  </figure>
</details>

<br />

#### **Lectures**
- <a href="https://youtube.com/playlist?list=PLGbGeqRyCIocRIHfc33WCC7yLvcoNgvEq" target="_blank">시각적 인문학(Visual Humanities) - YouTube</a>

<hr>

#### **Talk**

<div class="content list">
  {% for post in site.posts %}
    {% if post.categories contains 'talk' %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">- {{ post.title }}</a> (<small>{{post.date | date: "%m/%d/%y" }}</small>)
      </p>
    </div>
    {% endif %}
  {% endfor %}
</div>

<hr>

#### **Teaching**

<div class="content list">
  {% for post in site.posts %}
    {% if post.categories contains 'teaching' %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">- {{ post.title }}</a> (<small>{{post.date | date: "%m/%d/%y" }}</small>)
      </p>
    </div>
    {% endif %}
  {% endfor %}
</div>

<hr>

<!-- {% assign reference_types = "scholars|public" | split: "|" %}

{% for type in reference_types %}

{% if type == 'scholars' %}

### **For scholars**
 {% elsif type == 'public' %}

### **For public**
{% endif %}

<div class="content list">
  {% for post in site.posts %}
    {% if post.categories contains type %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">- {{ post.title }}</a>
      </p>
    </div>
    {% endif %}
  {% endfor %}
</div>

<hr>
{% endfor %} -->
