---
title: Resources
permalink: /resources/
---

### <i class="xi-folder-open"></i> Resources
저술(Publication) 외 기타 자료들을 모아 둔 페이지입니다.

<details>
  <summary style="font-family: 'SimKyungha', cursive; font-size: 19px"><i class="xi-document"></i> Click here to view my CV</summary>
  <figure>
    <center>
      <embed src="/documents/Haein_cv.pdf" width="100%" height=1000 type='application/pdf'>
    </center>
  </figure>
</details>

<div style="line-height:170%;">
  <br />
</div>

#### <i class="xi-browser-text"></i> Article
<div class="content list">
    <div class="list-item">
      <p class="list-post-title">
        <a href="https://www.aks.ac.kr/webzine/2205/sub08.jsp" target="_blank"><i class="xi-check-min"></i> 시습재 일기, 「인문정보학 : 구름 속 세계, 환상적이고 어렴풋한」</a> (<small>2022/05/22</small>)
      </p>
    </div>
</div>

<hr>

#### <i class="xi-presentation"></i> Presentation

<div class="content list">
  {% for post in site.posts %}
    {% if post.categories contains 'talk' %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}"><i class="xi-check-min"></i> {{ post.title }}</a> (<small>{{post.date | date: "20%y/%m/%d" }}</small>)
      </p>
    </div>
    {% endif %}
  {% endfor %}
</div>

<hr>

#### <i class="xi-lightbulb-o"></i> Teaching

<div class="content list">
  {% for post in site.posts %}
    {% if post.categories contains 'teaching' %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}"><i class="xi-check-min"></i> {{ post.title }}</a> (<small>{{post.date | date: "20%y/%m/%d" }}</small>)
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
