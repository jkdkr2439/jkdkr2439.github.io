/**
 * SPECIMEN — Taste Switcher
 * Swaps stylesheet + body class. URL sync via ?taste= param.
 */

const TASTES = ['tufte','rams','rand','vignelli','lupton','kare','ideo','norman','govuk','nielsen','wcag'];

function getCurrentTaste() {
  const params = new URLSearchParams(location.search);
  const t = params.get('taste');
  return TASTES.includes(t) ? t : 'tufte';
}

function applyTaste(taste) {
  const link = document.getElementById('taste-stylesheet');
  link.href = `styles/tastes/${taste}.css`;
  document.body.className = `taste-${taste}`;
  document.querySelectorAll('.taste-btn').forEach(btn => {
    btn.classList.toggle('taste-btn--active', btn.dataset.taste === taste);
  });
  const label = document.getElementById('current-taste-label');
  if (label) label.textContent = taste.charAt(0).toUpperCase() + taste.slice(1);
  // Update URL without reload
  const url = new URL(location);
  url.searchParams.set('taste', taste);
  history.replaceState(null, '', url);
  // Save preference
  try { localStorage.setItem('specimen-taste', taste); } catch {}
}

function boot() {
  const taste = getCurrentTaste();
  applyTaste(taste);
  // Wire buttons
  document.querySelectorAll('.taste-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTaste(btn.dataset.taste));
  });
  // Compare button
  document.getElementById('compare-btn')?.addEventListener('click', () => {
    window.open('compare.html', '_blank');
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
