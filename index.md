---
layout: default
title: Home
---

<div class="posts-list {% if site.studio.layout == 'magazine' %}posts-grid{% endif %}">
{% for post in paginator.posts %}
  <article class="post-card">
    <h2 class="post-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="meta">
      {% if site.studio.show_date %}<span>{{ post.date | date: "%B %d, %Y" }}</span><span class="dot"></span>{% endif %}
      {% if site.studio.show_author and post.author %}<span>{{ post.author }}</span>{% endif %}
    </div>
    <div class="excerpt">{{ post.excerpt | strip_html | truncate: 180 }}</div>
    {% if site.studio.show_labels and post.categories %}
    <div class="labels">
      {% for cat in post.categories %}<span class="label-pill">{{ cat }}</span>{% endfor %}
    </div>
    {% endif %}
  </article>
{% endfor %}
</div>

{% if paginator.total_pages > 1 %}
<div style="display:flex; justify-content:center; gap:10px; margin-top:22px">
  {% if paginator.previous_page %}<a class="btn" href="{{ paginator.previous_page_path | relative_url }}">Newer</a>{% endif %}
  {% if paginator.next_page %}<a class="btn" href="{{ paginator.next_page_path | relative_url }}">Older →</a>{% endif %}
</div>
{% endif %}
