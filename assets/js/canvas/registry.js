---
---
// IPOD — Input: Jekyll canvas/books/posts data. Process: bounded registry.
// Output: immutable browser manifest. Dependencies: _data only.
(function () {
  const domains = [
    {% for domain in site.data.canvas.domains %}{
      key: {{ domain.key | jsonify }},
      labelVi: {{ domain.label_vi | jsonify }},
      labelEn: {{ domain.label_en | jsonify }},
      sourceType: {{ domain.source.type | jsonify }},
      sourceValue: {{ domain.source.value | jsonify }},
      books: Object.freeze([{% for book_key in domain.books %}{{ book_key | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}])
    }{% unless forloop.last %},{% endunless %}{% endfor %}
  ].map(domain => Object.freeze(domain));

  const bookDomains = Object.create(null);
  domains.forEach(domain => domain.books.forEach(bookKey => { bookDomains[bookKey] = domain.key; }));

  const postDomains = Object.create(null);
  {% for post in site.posts %}
    {% assign post_domain = "" %}
    {% if post.tag == "Nhận thức luận căn bản" %}{% assign post_domain = "basic-epistemology" %}
    {% elsif post.library_collection == "Nghịch văn" %}{% assign post_domain = "literary-mischief" %}
    {% elsif post.tag == "Quyền lực" %}{% assign post_domain = "power" %}
    {% elsif post.tag == "Phản biện" %}{% assign post_domain = "criticism" %}
    {% elsif post.tag == "Trí năng máy" %}{% assign post_domain = "machine-intelligence" %}
    {% elsif post.tag == "Hiện sinh" %}{% assign post_domain = "existential" %}
    {% elsif post.tag == "Nhận thức luận" %}{% assign post_domain = "epistemology" %}
    {% elsif post.tag == "Tự sự" %}{% assign post_domain = "self-narrative" %}
    {% elsif post.tag == "Dịch thuật" %}{% assign post_domain = "translation" %}
    {% endif %}
    {% if post_domain != "" %}postDomains[{{ post.url | jsonify }}] = {{ post_domain | jsonify }};{% endif %}
  {% endfor %}

  window.DNHCanvasRegistry = Object.freeze({
    defaultDomain: {{ site.data.canvas.default_domain | jsonify }},
    domains: Object.freeze(domains),
    domainKeys: Object.freeze(domains.map(domain => domain.key)),
    bookDomains: Object.freeze(bookDomains),
    postDomains: Object.freeze(postDomains)
  });
})();
