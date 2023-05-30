---
title: Reference
permalink: /resources/
---

### Upcoming lab teachings

저술(Publication) 외 기타 자료들을 모아 둔 페이지입니다.

### **Talk**

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

### **Teaching**

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

