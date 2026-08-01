---
---
// Post data injected by Jekyll
const injectedPosts = {
  {% for post in site.posts %}
  {% assign english_document = site.english | where: "slug_key", post.slug | first %}
  {% assign credit_name = post.credit_name | default: site.author_credit %}
  {% capture credit_vi %}{% if post.tag == "Dịch thuật" %}Bản dịch: {% else %}Tác giả: {% endif %}{{ credit_name }}{% endcapture %}
  {% capture credit_en %}{% if post.tag == "Dịch thuật" %}Translated by: {% else %}By: {% endif %}{{ credit_name }}{% endcapture %}
  {{ post.url | jsonify }}: {
    titleVi: {{ post.title | jsonify }},
    titleEn: {{ post.title_en | default: post.title | jsonify }},
    date: "{{ post.date | date: '%-d tháng %-m, %Y' }}",
    tagVi: {{ post.tag | default: "" | jsonify }},
    tagEn: {{ post.tag_en | default: post.tag | default: "" | jsonify }},
    creditVi: {{ credit_vi | strip | jsonify }},
    creditEn: {{ credit_en | strip | jsonify }},
    bodyVi: {{ post.content | jsonify }},
    bodyEn: {% if english_document %}{{ english_document.content | markdownify | jsonify }}{% else %}null{% endif %},
    bookEdition: {{ post.book_edition | default: "" | jsonify }},
    chapterNumber: {{ post.chapter_number | default: 0 | jsonify }},
    bookLanding: {{ post.book_landing | default: false | jsonify }}
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
};

// A null-prototype registry prevents inherited keys such as __proto__ and
// constructor from ever becoming valid article addresses.
const posts = Object.freeze(Object.assign(Object.create(null), injectedPosts));

// Book membership is explicit. Tags and descriptive front matter cannot add
// an article to a book; only _data/books.json can do that.
const bookManifests = Object.freeze({
  {% for book_pair in site.data.books %}
  {{ book_pair[0] | jsonify }}: Object.freeze({
    titleVi: {{ book_pair[1].title_vi | jsonify }},
    titleEn: {{ book_pair[1].title_en | jsonify }},
    urls: Object.freeze([
      {{ book_pair[1].landing | prepend: "/" | append: "/" | jsonify }}{% for slug in book_pair[1].chapters %},
      {{ slug | prepend: "/" | append: "/" | jsonify }}{% endfor %}
    ])
  }){% unless forloop.last %},{% endunless %}
  {% endfor %}
});
const MAX_POST_URL_LENGTH = 180;
const POST_URL_PATTERN = /^\/[a-z0-9-]+\/$/;

function isKnownPostUrl(url) {
  return typeof url === 'string'
    && url.length <= MAX_POST_URL_LENGTH
    && POST_URL_PATTERN.test(url)
    && Object.prototype.hasOwnProperty.call(posts, url);
}
