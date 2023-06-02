---
title: Reference
permalink: /resources/
---

### Resources
저술(Publication) 외 기타 자료들을 모아 둔 페이지입니다.

<details>
  <summary>▶ 제 CV를 보고 싶으시다면 클릭해 주세요.</summary>
  <figure>
    <center>
      <embed src="/documents/Haein_CV.pdf" width="100%" height=1000 type='application/pdf'>
    </center>
  </figure>
</details>

<br />

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
