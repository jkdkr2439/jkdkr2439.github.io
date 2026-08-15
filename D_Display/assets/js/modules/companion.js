(() => {
  'use strict';
  const host = document.getElementById('companion-host');
  if (!host) return;

  const creature = host.querySelector('.companion-creature');
  const status = host.querySelector('.companion-status');
  const acceptedStates = new Set(['idle', 'reading', 'scrolling', 'chapter-end']);
  let state = 'idle';
  let paused = false;
  let speechTimer = 0;
  let settleTimer = 0;

  try { paused = localStorage.getItem('companionPaused') === 'true'; } catch (_) {}

  function speak(copy, duration = 1400) {
    window.clearTimeout(speechTimer);
    status.textContent = copy;
    host.classList.add('is-speaking');
    speechTimer = window.setTimeout(() => host.classList.remove('is-speaking'), duration);
  }

  function render(nextState) {
    if (!acceptedStates.has(nextState) || paused) return;
    state = nextState;
    host.dataset.state = state;
    window.clearTimeout(settleTimer);
    if (state === 'scrolling') settleTimer = window.setTimeout(() => render('reading'), 520);
    if (state === 'chapter-end') {
      speak('Hết chương rồi.');
      settleTimer = window.setTimeout(() => render('idle'), 1100);
    }
  }

  function accept(message) {
    if (!message || typeof message !== 'object') return false;
    if (message.type === 'route') {
      render(message.surface === 'home' ? 'idle' : 'reading');
      return true;
    }
    if (message.type === 'reader-state' && acceptedStates.has(message.state)) {
      render(message.state);
      return true;
    }
    return false;
  }

  creature.addEventListener('click', () => {
    paused = !paused;
    host.classList.toggle('is-paused', paused);
    creature.setAttribute('aria-pressed', String(paused));
    creature.setAttribute('aria-label', paused ? 'Đánh thức Mọt sách' : 'Cho Mọt sách nghỉ');
    try { localStorage.setItem('companionPaused', String(paused)); } catch (_) {}
    speak(paused ? 'Suỵt, đang ngủ.' : 'Đọc tiếp thôi.');
    if (!paused) render(state);
  });

  host.classList.toggle('is-paused', paused);
  creature.setAttribute('aria-pressed', String(paused));
  host.dataset.state = paused ? 'reading' : state;
  window.DNHCompanion = Object.freeze({accept});
})();
