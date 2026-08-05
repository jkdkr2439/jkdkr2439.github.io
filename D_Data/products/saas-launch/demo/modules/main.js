/**
 * main.js — Progressive enhancement for Clearline LAUNCH landing page
 * ES module. No dependencies. Core content is fully rendered without JS.
 * Enhancements: smooth scroll, theme toggle, pricing toggle (monthly/annual).
 */

import { getStoredTheme, setStoredTheme } from './store.js';

// === Theme Toggle ===
const themeToggle = document.querySelector('.theme-toggle');

function getPreferredTheme() {
  return getStoredTheme();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    themeToggle.textContent = theme === 'dark' ? '☀' : '◐';
  }
}

// Initialize theme
applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setStoredTheme(next);
    applyTheme(next);
  });
}

// === Pricing Toggle (Monthly / Annual) ===
const pricingToggle = document.getElementById('pricing-annual-toggle');

function updatePricing(isAnnual) {
  const priceEls = document.querySelectorAll('[data-monthly]');

  priceEls.forEach(el => {
    if (el.dataset.monthly && el.dataset.annual) {
      el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
    }
  });
}

if (pricingToggle) {
  // Ensure monthly is shown by default (checkbox unchecked = monthly)
  pricingToggle.checked = false;
  updatePricing(false);

  pricingToggle.addEventListener('change', () => {
    updatePricing(pricingToggle.checked);
  });
}

// === Smooth Scroll Enhancement ===
// Only enhance if user has not requested reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Move focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
}
