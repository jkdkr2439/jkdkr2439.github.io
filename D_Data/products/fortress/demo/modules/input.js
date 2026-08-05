/**
 * FORTRESS — Input Module
 * Tower selection, canvas click for placement, button wiring.
 */

import { TOWER_TYPES } from './towers.js';

let selectedTower = null;
let onPlaceCallback = null;
let onStartWaveCallback = null;
let onRestartCallback = null;
let canvasEl = null;
let containerEl = null;
let tileSize = 0;

/**
 * Initialize input handlers.
 */
export function initInput(canvas, container, tileSz, callbacks) {
  canvasEl = canvas;
  containerEl = container;
  tileSize = tileSz;
  onPlaceCallback = callbacks.onPlace;
  onStartWaveCallback = callbacks.onStartWave;
  onRestartCallback = callbacks.onRestart;

  // Tower selection buttons
  const towerButtons = document.querySelectorAll('.tower-btn');
  towerButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const towerId = btn.dataset.tower;
      if (selectedTower === towerId) {
        deselectTower();
      } else {
        selectTower(towerId);
      }
    });
  });

  // Canvas click for placement
  canvasEl.addEventListener('click', handleCanvasClick);

  // Start wave button
  const startBtn = document.getElementById('btn-start-wave');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onStartWaveCallback) onStartWaveCallback();
    });
  }

  // Restart button
  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onRestartCallback) onRestartCallback();
    });
  }

  // ESC to deselect
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      deselectTower();
    }
  });
}

/**
 * Select a tower type for placement.
 */
export function selectTower(towerId) {
  selectedTower = towerId;

  // Update button states
  const towerButtons = document.querySelectorAll('.tower-btn');
  towerButtons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.tower === towerId);
  });

  // Update cursor
  containerEl.classList.add('placing');
}

/**
 * Deselect current tower.
 */
export function deselectTower() {
  selectedTower = null;

  const towerButtons = document.querySelectorAll('.tower-btn');
  towerButtons.forEach(btn => {
    btn.classList.remove('selected');
  });

  containerEl.classList.remove('placing');
}

/**
 * Handle canvas click for tower placement.
 */
function handleCanvasClick(e) {
  if (!selectedTower) return;

  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;

  const pixelX = (e.clientX - rect.left) * scaleX;
  const pixelY = (e.clientY - rect.top) * scaleY;

  const col = Math.floor(pixelX / tileSize);
  const row = Math.floor(pixelY / tileSize);

  if (onPlaceCallback) {
    const success = onPlaceCallback(selectedTower, col, row);
    if (success) {
      // Keep selection for rapid placement
      // User can ESC or click button again to deselect
    }
  }
}

/**
 * Update tower button enabled/disabled state based on gold.
 */
export function updateTowerButtons(gold) {
  const towerButtons = document.querySelectorAll('.tower-btn');
  towerButtons.forEach(btn => {
    const towerId = btn.dataset.tower;
    const type = TOWER_TYPES[towerId];
    btn.disabled = gold < type.cost;
  });
}

/**
 * Update start wave button state.
 */
export function updateStartButton(waveActive) {
  const btn = document.getElementById('btn-start-wave');
  if (btn) {
    btn.disabled = waveActive;
    btn.textContent = waveActive ? '⏳ In Progress' : '▶ Start Wave';
  }
}

/**
 * Get current selected tower ID.
 */
export function getSelectedTower() {
  return selectedTower;
}

/**
 * Update tile size (for responsive resize).
 */
export function setTileSize(newSize) {
  tileSize = newSize;
}
