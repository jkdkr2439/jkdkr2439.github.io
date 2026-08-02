let storedLanguage = 'vi';
try {
  storedLanguage = localStorage.getItem('interfaceLanguage') || 'vi';
} catch (_) {
  // Storage can be blocked by browser privacy settings. Vietnamese remains
  // the safe deterministic default.
}
let interfaceLanguage = storedLanguage === 'en' ? 'en' : 'vi';
let currentBookKey = null;
const MISSING_ENGLISH_MESSAGE =
  'The English version is still missing. What excellent timing to learn Vietnamese.<br>' +
  'Chưa có bản tiếng Anh. Đúng lúc để đi học tiếng Việt rồi đấy.';

function setInterfaceLanguage(language) {
  interfaceLanguage = language === 'en' ? 'en' : 'vi';
  try {
    localStorage.setItem('interfaceLanguage', interfaceLanguage);
  } catch (_) {}
  document.documentElement.lang = interfaceLanguage;
  document.querySelectorAll('[data-vi][data-en]').forEach(el => {
    el.innerHTML = el.dataset[interfaceLanguage];
  });
  document.querySelectorAll('[data-ui-language]').forEach(button => {
    button.classList.toggle('active', button.dataset.uiLanguage === interfaceLanguage);
  });
  document.querySelectorAll('[data-vi-label][data-en-label]').forEach(control => {
    const label = control.dataset[`${interfaceLanguage}Label`];
    control.setAttribute('aria-label', label);
    control.setAttribute('title', label);
  });

  const activeItem = document.querySelector('.tree-item.active');
  if (currentBookKey) showBook(currentBookKey, activeItem?.dataset.url || null, false);
  else if (activeItem) showPost(activeItem.dataset.url, activeItem, false);
}

const ALLOWED_ACTIONS = new Set([
  'set-language',
  'refresh-library',
  'toggle-folder',
  'show-home',
  'show-book',
  'show-post',
  'show-about'
]);

function dispatchAllowedAction(control) {
  if (!(control instanceof HTMLElement)) return;
  if (!document.querySelector('.app').contains(control)) return;

  const action = control.dataset.action;
  if (!ALLOWED_ACTIONS.has(action)) return;

  if (action === 'set-language') {
    setInterfaceLanguage(control.dataset.uiLanguage);
    return;
  }
  if (action === 'refresh-library') {
    control.classList.add('is-refreshing');
    control.setAttribute('aria-busy', 'true');
    location.reload();
    return;
  }
  if (action === 'toggle-folder') {
    toggleFolder(control);
    return;
  }
  if (action === 'show-home') {
    showHome();
    return;
  }
  if (action === 'show-book') {
    showBook(control.dataset.book);
    return;
  }
  if (action === 'show-post') {
    const bookKey = getBookKeyForPost(control.dataset.url);
    if (bookKey) showBook(bookKey, control.dataset.url);
    else showPost(control.dataset.url, control);
    return;
  }
  if (action === 'show-about') {
    showAbout();
  }
}

// One guarded input gate for the whole application. Internal actions accept
// only a trusted primary click with no modifier keys.
document.querySelector('.app').addEventListener('click', event => {
  if (!event.isTrusted || event.button !== 0) return;
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
  if (!(event.target instanceof Element)) return;

  const control = event.target.closest('[data-action]');
  if (!control) return;
  event.preventDefault();
  dispatchAllowedAction(control);
});

// The custom folder control is a div, so give it the same keyboard contract
// as a native button. Native anchors and buttons already generate clicks.
document.querySelector('.app').addEventListener('keydown', event => {
  if (!event.isTrusted || (event.key !== 'Enter' && event.key !== ' ')) return;
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest('[data-action="toggle-folder"]');
  if (!control) return;
  event.preventDefault();
  dispatchAllowedAction(control);
});

function toggleFolder(el) {
  const section = el.closest('.tree-section');
  section.classList.toggle('open');
  el.classList.toggle('open');
}

function getBookKeyForPost(url) {
  if (!isKnownPostUrl(url)) return null;
  return Object.keys(bookManifests).find(key => bookManifests[key].urls.includes(url)) || null;
}

function bookChapterId(url) {
  return `book-${url.replaceAll('/', '')}`;
}

function renderBookChapter(url) {
  const p = posts[url];
  const englishBody = p.bodyEn || `<p class="translation-pending">${MISSING_ENGLISH_MESSAGE}</p>`;
  return `<article class="book-chapter" id="${bookChapterId(url)}" data-url="${url}">
    <div class="reader-meta"><span>${p.date}</span><span style="color:var(--red)">${interfaceLanguage === 'en' ? p.tagEn : p.tagVi}</span><span class="reader-credit">${interfaceLanguage === 'en' ? p.creditEn : p.creditVi}</span></div>
    <div class="reader-columns">
      <section class="reader-language-panel" lang="vi"><span class="reader-language-label">VI</span><h1 class="reader-title">${p.titleVi}</h1><div class="reader-body">${p.bodyVi}</div></section>
      <section class="reader-language-panel${p.bodyEn ? '' : ' is-missing'}" lang="en"><span class="reader-language-label">EN</span><h1 class="reader-title">${p.titleEn}</h1><div class="reader-body">${englishBody}</div></section>
    </div>
  </article>`;
}

function showBook(bookKey, targetUrl = null, updateAddress = true) {
  const manifest = bookManifests[bookKey];
  if (!manifest) return false;
  const urls = manifest.urls.filter(isKnownPostUrl);
  if (!urls.length) return false;
  currentBookKey = bookKey;

  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('home-content').style.display = 'none';
  document.getElementById('about-content').style.display = 'none';
  document.getElementById('reader-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'block';
  document.getElementById('book-reader-intro').textContent = interfaceLanguage === 'en'
    ? 'Read continuously, or use the table of contents on the left to jump to a chapter.'
    : 'Cuộn để đọc liên tục, hoặc dùng mục lục bên trái để nhảy thẳng tới một chương.';
  document.getElementById('book-reader-chapters').innerHTML = urls.map(renderBookChapter).join('');

  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  const activeUrl = targetUrl && urls.includes(targetUrl) ? targetUrl : urls[0];
  const activeBookmark = document.querySelector(`.tree-item[data-url="${activeUrl}"]`);
  activeBookmark?.classList.add('active');
  activeBookmark?.closest('.book-volume')?.setAttribute('open', '');
  activeBookmark?.closest('.pinned-book-tree')?.setAttribute('open', '');
  const reader = document.getElementById('reader');
  reader.scrollTop = 0;
  if (targetUrl) requestAnimationFrame(() => document.getElementById(bookChapterId(activeUrl))?.scrollIntoView({behavior: 'smooth', block: 'start'}));
  if (updateAddress) history.replaceState({book: bookKey}, '', `${location.pathname}?book=${bookKey}`);
  return false;
}

function showPost(url, sourceEl, updateAddress = true) {
  if (!isKnownPostUrl(url)) return false;
  const p = posts[url];
  currentBookKey = null;

  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('home-content').style.display = 'none';
  document.getElementById('about-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'none';
  document.getElementById('reader-content').style.display = 'block';

  document.getElementById('reader-meta').innerHTML =
    `<span>${p.date}</span>` +
    `<span style="color:var(--red)">${interfaceLanguage === 'en' ? p.tagEn : p.tagVi}</span>` +
    `<span class="reader-credit">${interfaceLanguage === 'en' ? p.creditEn : p.creditVi}</span>`;
  document.getElementById('reader-title-vi').textContent = p.titleVi;
  document.getElementById('reader-title-en').textContent = p.titleEn;
  document.getElementById('reader-body-vi').innerHTML = p.bodyVi;

  const englishPanel = document.getElementById('reader-panel-en');
  if (p.bodyEn) {
    englishPanel.classList.remove('is-missing');
    document.getElementById('reader-body-en').innerHTML = p.bodyEn;
  } else {
    englishPanel.classList.add('is-missing');
    document.getElementById('reader-body-en').innerHTML =
      `<p class="translation-pending">${MISSING_ENGLISH_MESSAGE}</p>`;
  }

  // Active state
  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  (sourceEl || document.querySelector(`.tree-item[data-url="${url}"]`))?.classList.add('active');

  document.getElementById('reader').scrollTop = 0;
  if (updateAddress) {
    const nextAddress = `${location.pathname}?post=${encodeURIComponent(url)}`;
    history.replaceState({post: url}, '', nextAddress);
  }
  return false;
}

function showAbout() {
  currentBookKey = null;
  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('home-content').style.display = 'none';
  document.getElementById('reader-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'none';
  document.getElementById('about-content').style.display = 'block';
  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  document.getElementById('reader').scrollTop = 0;
}

function showHome(updateAddress = true) {
  currentBookKey = null;
  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('reader-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'none';
  document.getElementById('about-content').style.display = 'none';
  document.getElementById('home-content').style.removeProperty('display');
  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  document.getElementById('reader').scrollTop = 0;
  if (updateAddress) history.replaceState({home: true}, '', location.pathname);
}

let bookScrollFrame = 0;
document.getElementById('reader').addEventListener('scroll', () => {
  if (!currentBookKey || bookScrollFrame) return;
  bookScrollFrame = requestAnimationFrame(() => {
    bookScrollFrame = 0;
    const chapters = [...document.querySelectorAll('.book-chapter')];
    const current = chapters.reduce((best, chapter) => {
      const top = chapter.getBoundingClientRect().top;
      return top <= 110 ? chapter : best;
    }, chapters[0]);
    if (!current) return;
    document.querySelectorAll('.tree-item').forEach(item => item.classList.toggle('active', item.dataset.url === current.dataset.url));
  });
}, {passive: true});

setInterfaceLanguage(interfaceLanguage);

// Restore a directly linked article while keeping the library visible.
// Refuse oversized or structurally invalid query input before it reaches the
// reader logic. The site has no reason to compute over arbitrary payloads.
const queryIsReasonable = location.search.length <= 512;
const requestedUrl = queryIsReasonable
  ? new URLSearchParams(location.search).get('post')
  : null;
const requestedBook = queryIsReasonable
  ? new URLSearchParams(location.search).get('book')
  : null;
if (!queryIsReasonable) {
  history.replaceState({}, '', location.pathname);
}
if (bookManifests[requestedBook]) {
  showBook(requestedBook, null, false);
} else if (isKnownPostUrl(requestedUrl)) {
  const requestedBookKey = getBookKeyForPost(requestedUrl);
  if (requestedBookKey) showBook(requestedBookKey, requestedUrl, false);
  else showPost(requestedUrl, null, false);
} else {
  showHome(false);
}
