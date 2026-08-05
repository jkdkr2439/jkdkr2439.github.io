/**
 * store.js — Theme + pricing preference localStorage adapter.
 * Extracted from main.js for scalable pipeline architecture.
 * No dependencies. Works in any browser with localStorage support.
 */

const THEME_KEY = 'clearline-theme';
const PRICING_KEY = 'clearline-pricing-annual';

/**
 * Get the stored theme preference, or detect from system.
 * @returns {'light'|'dark'}
 */
export function getStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Persist the user's theme choice.
 * @param {'light'|'dark'} theme
 */
export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Get the stored pricing preference.
 * @returns {boolean} true if annual pricing was last selected
 */
export function getStoredPricingAnnual() {
  return localStorage.getItem(PRICING_KEY) === 'true';
}

/**
 * Persist the user's pricing toggle choice.
 * @param {boolean} isAnnual
 */
export function setStoredPricingAnnual(isAnnual) {
  localStorage.setItem(PRICING_KEY, String(isAnnual));
}
