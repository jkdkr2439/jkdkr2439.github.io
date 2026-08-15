let storedLanguage = 'vi';
try {
  storedLanguage = localStorage.getItem('interfaceLanguage') || 'vi';
} catch (_) {
  // Storage can be blocked by browser privacy settings. Vietnamese remains
  // the safe deterministic default.
}
let interfaceLanguage = storedLanguage === 'en' ? 'en' : 'vi';
let currentBookKey = null;
let currentBookUrl = null;
let currentPostUrl = null;
let readingMode = 'bilingual';
try {
  const storedReadingMode = localStorage.getItem('readingMode');
  if (['vi', 'bilingual', 'en'].includes(storedReadingMode)) readingMode = storedReadingMode;
} catch (_) {}
const MISSING_ENGLISH_MESSAGE =
  'The English version is still missing. What excellent timing to learn Vietnamese.<br>' +
  'Chưa có bản tiếng Anh. Đúng lúc để đi học tiếng Việt rồi đấy.';

const reader = document.getElementById('reader');
const readingInstrument = document.getElementById('reading-instrument');
const readingInstrumentLabel = document.getElementById('reading-instrument-label');
const readingProgressValue = document.getElementById('reading-progress-value');
const readingModeControl = document.getElementById('reading-mode-control');
const readingModeCurrent = document.getElementById('reading-mode-current');

function notifyCompanion(message) {
  try { window.DNHCompanion?.accept(message); } catch (_) {
    // The companion is optional and must never interrupt reading.
  }
}

function setReadingInstrumentVisible(visible) {
  readingInstrument.hidden = !visible;
  if (!visible) {
    reader.style.setProperty('--reading-progress', '0');
    reader.style.setProperty('--reading-dial-angle', '-132deg');
    readingProgressValue.value = '0%';
  }
}

function engageReadingSurface() {
  setReadingInstrumentVisible(true);
  reader.classList.remove('is-engaging');
  requestAnimationFrame(() => {
    reader.classList.add('is-engaging');
    window.setTimeout(() => reader.classList.remove('is-engaging'), 420);
    updateReadingInstrument();
  });
}

function updateReadingInstrument() {
  if (readingInstrument.hidden) return;
  const maximum = Math.max(0, reader.scrollHeight - reader.clientHeight);
  const progress = maximum ? Math.min(1, Math.max(0, reader.scrollTop / maximum)) : 0;
  const percent = Math.round(progress * 100);
  reader.style.setProperty('--reading-progress', progress.toFixed(4));
  reader.style.setProperty('--reading-dial-angle', `${-132 + progress * 264}deg`);
  readingProgressValue.value = `${percent}%`;

  if (!currentBookKey) {
    readingInstrumentLabel.textContent = interfaceLanguage === 'en' ? 'Reading' : 'Bài đọc';
    return;
  }
  const urls = bookManifests[currentBookKey]?.urls.filter(isKnownPostUrl) || [];
  const chapterIndex = Math.max(0, urls.indexOf(currentBookUrl));
  const prefix = interfaceLanguage === 'en' ? 'Chapter' : 'Chương';
  readingInstrumentLabel.textContent = `${prefix} ${String(chapterIndex + 1).padStart(2, '0')} / ${String(urls.length).padStart(2, '0')}`;
}

function currentReadingPost() {
  const url = currentBookUrl || currentPostUrl;
  return url ? posts[url] : null;
}

function commitReadingMode(mode) {
  const post = currentReadingPost();
  const hasEnglish = Boolean(post?.parallelLayout || post?.bodyEn);
  readingMode = ['vi', 'bilingual', 'en'].includes(mode) && (mode === 'vi' || hasEnglish) ? mode : 'vi';
  reader.classList.remove('reading-mode-vi', 'reading-mode-bilingual', 'reading-mode-en');
  reader.classList.add(`reading-mode-${readingMode}`);
  reader.dataset.readingMode = readingMode;
  readingModeControl.hidden = !hasEnglish;
  readingModeCurrent.textContent = readingMode === 'vi' ? 'VI' : readingMode === 'en' ? 'EN' : 'VI · EN';
  document.querySelectorAll('[data-reading-mode]').forEach(button => {
    button.classList.toggle('active', button.dataset.readingMode === readingMode);
    button.setAttribute('aria-pressed', String(button.dataset.readingMode === readingMode));
  });
  const parallelLabel = document.querySelector('.parallel-book-heading .reader-language-label');
  if (parallelLabel) parallelLabel.textContent = readingMode === 'vi' ? 'VI' : readingMode === 'en' ? 'EN' : 'VI · EN';
  try { localStorage.setItem('readingMode', readingMode); } catch (_) {}
}

function setReadingMode(mode, animate = true) {
  if (mode === readingMode || !currentReadingPost()) return;
  const order = {vi: 0, bilingual: 1, en: 2};
  const oldMaximum = Math.max(1, reader.scrollHeight - reader.clientHeight);
  const progress = reader.scrollTop / oldMaximum;
  const direction = order[mode] > order[readingMode] ? 'forward' : 'backward';
  const apply = () => {
    commitReadingMode(mode);
    const nextMaximum = Math.max(0, reader.scrollHeight - reader.clientHeight);
    reader.scrollTop = progress * nextMaximum;
  };
  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { apply(); return; }
  reader.classList.remove('is-page-turning-forward', 'is-page-turning-backward');
  reader.classList.add(`is-page-turning-${direction}`);
  window.setTimeout(apply, 115);
  window.setTimeout(() => reader.classList.remove(`is-page-turning-${direction}`), 270);
}

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
  window.DNHCanvas?.setLanguage(interfaceLanguage);

  const activeItem = document.querySelector('.tree-item.active');
  if (currentBookKey) showBook(currentBookKey, currentBookUrl || activeItem?.dataset.url || null, false);
  else if (activeItem) showPost(activeItem.dataset.url, activeItem, false);
  updateReadingInstrument();
}

const ALLOWED_ACTIONS = new Set([
  'set-language',
  'refresh-library',
  'toggle-folder',
  'show-home',
  'show-book',
  'show-post',
  'show-about',
  'set-reading-mode'
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
  if (action === 'set-reading-mode') {
    setReadingMode(control.dataset.readingMode);
    control.closest('.reading-mode-menu')?.removeAttribute('open');
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
  if (p.parallelLayout) {
    return `<article class="book-chapter parallel-book-chapter" id="${bookChapterId(url)}" data-url="${url}">
      <div class="reader-meta"><span>${p.date}</span><span style="color:var(--red)">${interfaceLanguage === 'en' ? p.tagEn : p.tagVi}</span><span class="reader-credit">${interfaceLanguage === 'en' ? p.creditEn : p.creditVi}</span></div>
      <div class="parallel-book-heading"><span class="reader-language-label">VI · EN</span><h1 class="reader-title">${interfaceLanguage === 'en' ? p.titleEn : p.titleVi}</h1></div>
      <div class="reader-body parallel-reader-body">${p.bodyVi}</div>
    </article>`;
  }
  const englishBody = p.bodyEn || `<p class="translation-pending">${MISSING_ENGLISH_MESSAGE}</p>`;
  return `<article class="book-chapter" id="${bookChapterId(url)}" data-url="${url}">
    <div class="reader-meta"><span>${p.date}</span><span style="color:var(--red)">${interfaceLanguage === 'en' ? p.tagEn : p.tagVi}</span><span class="reader-credit">${interfaceLanguage === 'en' ? p.creditEn : p.creditVi}</span></div>
    <div class="reader-columns">
      <section class="reader-language-panel" lang="vi"><span class="reader-language-label">VI</span><h1 class="reader-title">${p.titleVi}</h1><div class="reader-body">${p.bodyVi}</div></section>
      <section class="reader-language-panel${p.bodyEn ? '' : ' is-missing'}" lang="en"><span class="reader-language-label">EN</span><h1 class="reader-title">${p.titleEn}</h1><div class="reader-body">${englishBody}</div></section>
    </div>
  </article>`;
}

function renderBookNavigation(bookKey, urls, activeIndex) {
  const link = (url, direction) => {
    if (!url) return '<span class="book-reader-nav-spacer"></span>';
    const post = posts[url];
    const label = direction === 'previous'
      ? (interfaceLanguage === 'en' ? 'Previous chapter' : 'Chương trước')
      : (interfaceLanguage === 'en' ? 'Next chapter' : 'Chương sau');
    const title = interfaceLanguage === 'en' && post.titleEn ? post.titleEn : post.titleVi;
    const arrow = direction === 'previous' ? '←' : '→';
    const copy = direction === 'previous' ? `${arrow} ${title}` : `${title} ${arrow}`;
    return `<a class="book-reader-nav-link book-reader-nav-link--${direction}" href="${routeAddress({post:url})}" data-action="show-post" data-url="${url}"><span>${label}</span><strong>${copy}</strong></a>`;
  };
  return `<nav class="book-reader-nav" aria-label="${interfaceLanguage === 'en' ? 'Chapter navigation' : 'Điều hướng chương'}" data-book="${bookKey}">${link(urls[activeIndex - 1], 'previous')}${link(urls[activeIndex + 1], 'next')}</nav>`;
}

function collapseContextForReading() {
  if (!window.matchMedia('(max-width: 768px)').matches) return;
  if (!window.DNHCanvas?.getState().contextCollapsed) window.DNHCanvas.toggleContext();
}

function showBook(bookKey, targetUrl = null, updateAddress = true) {
  const manifest = bookManifests[bookKey];
  if (!manifest) return false;
  const urls = manifest.urls.filter(isKnownPostUrl);
  if (!urls.length) return false;
  currentBookKey = bookKey;
  const activeUrl = targetUrl && urls.includes(targetUrl) ? targetUrl : urls[0];
  currentBookUrl = activeUrl;
  currentPostUrl = null;
  window.DNHCanvas?.syncRoute({type: 'book', key: bookKey});

  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('home-content').style.display = 'none';
  document.getElementById('about-content').style.display = 'none';
  document.getElementById('reader-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'block';
  document.getElementById('book-reader-intro').textContent = interfaceLanguage === 'en'
    ? 'One chapter at a time. Use the table of contents or chapter navigation to continue.'
    : 'Mỗi lần một chương. Dùng mục lục hoặc điều hướng cuối bài để đọc tiếp.';
  const activeIndex = urls.indexOf(activeUrl);
  document.getElementById('book-reader-chapters').innerHTML = renderBookChapter(activeUrl) + renderBookNavigation(bookKey, urls, activeIndex);

  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  const activeBookmark = document.querySelector(`.tree-item[data-url="${activeUrl}"]`);
  activeBookmark?.classList.add('active');
  activeBookmark?.closest('.book-volume')?.setAttribute('open', '');
  activeBookmark?.closest('.pinned-book-tree')?.setAttribute('open', '');
  const reader = document.getElementById('reader');
  reader.scrollTop = 0;
  commitReadingMode(readingMode);
  engageReadingSurface();
  notifyCompanion({type: 'route', surface: 'book'});
  collapseContextForReading();
  if (updateAddress) {
    const state = targetUrl ? {post: activeUrl} : {book: bookKey};
    history.replaceState(state, '', routeAddress(state));
  }
  return false;
}

function showPost(url, sourceEl, updateAddress = true) {
  if (!isKnownPostUrl(url)) return false;
  const p = posts[url];
  currentBookKey = null;
  currentBookUrl = null;
  currentPostUrl = url;
  window.DNHCanvas?.syncRoute({type: 'post', url});

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
  const vietnamesePanel = document.getElementById('reader-body-vi').closest('.reader-language-panel');
  document.querySelector('.reader-columns').classList.toggle('is-parallel-layout', Boolean(p.parallelLayout));
  vietnamesePanel.classList.toggle('is-parallel-layout', Boolean(p.parallelLayout));
  if (p.parallelLayout) {
    document.getElementById('reader-title-vi').textContent = interfaceLanguage === 'en' ? p.titleEn : p.titleVi;
    englishPanel.classList.add('is-parallel-hidden');
  } else if (p.bodyEn) {
    englishPanel.classList.remove('is-parallel-hidden');
    englishPanel.classList.remove('is-missing');
    document.getElementById('reader-body-en').innerHTML = p.bodyEn;
  } else {
    englishPanel.classList.remove('is-parallel-hidden');
    englishPanel.classList.add('is-missing');
    document.getElementById('reader-body-en').innerHTML =
      `<p class="translation-pending">${MISSING_ENGLISH_MESSAGE}</p>`;
  }

  // Active state
  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  (sourceEl || document.querySelector(`.tree-item[data-url="${url}"]`))?.classList.add('active');

  document.getElementById('reader').scrollTop = 0;
  commitReadingMode(readingMode);
  engageReadingSurface();
  notifyCompanion({type: 'route', surface: 'post'});
  collapseContextForReading();
  if (updateAddress) {
    const nextAddress = routeAddress({post: url});
    history.replaceState({post: url}, '', nextAddress);
  }
  return false;
}

function routeAddress(params = {}) {
  const search = new URLSearchParams(params);
  const domain = window.DNHCanvas?.getState()?.domain;
  if (domain) search.set('domain', domain);
  const query = search.toString();
  return `${location.pathname}${query ? `?${query}` : ''}`;
}

function showAbout() {
  currentBookKey = null;
  currentBookUrl = null;
  currentPostUrl = null;
  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('home-content').style.display = 'none';
  document.getElementById('reader-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'none';
  document.getElementById('about-content').style.display = 'block';
  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  document.getElementById('reader').scrollTop = 0;
  setReadingInstrumentVisible(false);
  notifyCompanion({type: 'route', surface: 'about'});
}

function showHome(updateAddress = true) {
  currentBookKey = null;
  currentBookUrl = null;
  currentPostUrl = null;
  document.getElementById('reader-empty').style.display = 'none';
  document.getElementById('reader-content').style.display = 'none';
  document.getElementById('book-reader').style.display = 'none';
  document.getElementById('about-content').style.display = 'none';
  document.getElementById('home-content').style.removeProperty('display');
  document.querySelectorAll('.tree-item').forEach(e => e.classList.remove('active'));
  document.getElementById('reader').scrollTop = 0;
  setReadingInstrumentVisible(false);
  notifyCompanion({type: 'route', surface: 'home'});
  if (updateAddress) history.replaceState({home: true}, '', location.pathname);
}

let readingScrollFrame = 0;
reader.addEventListener('scroll', () => {
  if (readingScrollFrame) return;
  readingScrollFrame = requestAnimationFrame(() => {
    readingScrollFrame = 0;
    updateReadingInstrument();
    const maximum = Math.max(0, reader.scrollHeight - reader.clientHeight);
    const state = maximum > 0 && reader.scrollTop / maximum >= .985 ? 'chapter-end' : 'scrolling';
    notifyCompanion({type: 'reader-state', state});
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
