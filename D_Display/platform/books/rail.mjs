const node = (tag, cls, value = '') => { const item = document.createElement(tag); item.className = cls; item.textContent = value; return item; };

export function createBooksRail(root) {
  return {
    render(model, language) {
      const header = node('header', 'books-header');
      const headingCopy = node('div', 'books-heading-copy');
      headingCopy.append(node('span', 'books-label', model.label[language]), node('h2', 'books-title', model.heading[language]));
      const count = node('span', 'books-count', String(model.books.length).padStart(2, '0'));
      header.append(headingCopy, count);

      const list = node('div', 'books-list');
      list.setAttribute('role', 'list');
      for (const book of model.books) {
        const item = node('article', 'book-rail-item');
        item.setAttribute('role', 'listitem');
        const image = document.createElement('img');
        image.className = 'book-cover';
        image.src = `/canvas/${book.cover}`;
        image.alt = book.title[language];
        image.width = 48;
        image.height = 72;
        image.loading = 'lazy';
        image.decoding = 'async';
        const copy = node('div', 'book-rail-copy');
        copy.append(node('h3', 'book-rail-title', book.title[language]), node('p', 'book-rail-summary', book.summary[language]), node('span', 'book-price', book.price_label[language]));
        item.append(image, copy);
        list.append(item);
      }

      const contact = document.createElement('aside');
      contact.className = 'books-contact';
      contact.setAttribute('aria-label', language === 'vi' ? 'Liên hệ' : 'Contact');
      contact.append(node('span', 'books-contact-label', language === 'vi' ? 'Liên hệ' : 'Contact'));

      const contactLinks = node('div', 'books-contact-links');
      const email = document.createElement('a');
      email.className = 'books-contact-email';
      email.href = 'mailto:jkdkr2439@gmail.com';
      email.append(node('span', 'books-contact-icon', '@'), node('span', 'books-contact-address', 'jkdkr2439@gmail.com'));

      const facebook = document.createElement('a');
      facebook.className = 'books-contact-facebook';
      facebook.href = 'https://www.facebook.com/profile.php?id=61579333393862';
      facebook.target = '_blank';
      facebook.rel = 'noopener noreferrer';
      facebook.setAttribute('aria-label', language === 'vi' ? 'Mở Facebook của Kevin T.N' : 'Open Kevin T.N on Facebook');
      facebook.title = 'Facebook · Kevin T.N';
      facebook.textContent = 'f';
      contactLinks.append(email, facebook);
      contact.append(contactLinks);

      root.replaceChildren(header, list, contact);
      root.hidden = false;
    },
    showFailure(code) { root.hidden = false; root.replaceChildren(node('p', 'module-failure', code)); },
    clear() { root.replaceChildren(); root.hidden = true; }
  };
}
