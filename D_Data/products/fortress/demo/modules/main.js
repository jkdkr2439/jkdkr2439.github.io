/**
 * FORTRESS — Main Module
 * Game loop, state management, initialization.
 */

import { COLS, ROWS, generatePath, buildPathCells, createGrid, waypointsToPixels, isBuildable } from './map.js';
import { TOWER_TYPES, createTower, findTarget, updateTowerRotation, tryFire } from './towers.js';
import { createEnemy, moveEnemy, updateEnemyVisuals, ENEMY_TYPES } from './enemies.js';
import { updateProjectiles } from './combat.js';
import { createEconomy, canAfford, spend, addGold, removeLives, updatePopups, isGameOver } from './economy.js';
import { createWaveState, startWave, updateWaveSpawns, notifyKill, notifyLeak, isWaveComplete, endWave } from './waves.js';
import { initRenderer, render } from './renderer.js';
import { initInput, updateTowerButtons, updateStartButton, getSelectedTower, setTileSize, deselectTower } from './input.js';
import { spawnDeathBurst, spawnGoldPickup, spawnHitSpark, spawnSplashRing, updateParticles, clearParticles } from './particles.js';

/* ═══════════════════════ STATE ═══════════════════════ */

let state = null;
let canvas = null;
let ctx = null;
let lastTime = 0;
let running = false;
let tileSize = 48;

function createState() {
  const waypoints = generatePath();
  const pathCells = buildPathCells(waypoints);
  const grid = createGrid(pathCells);
  const pixelWaypoints = waypointsToPixels(waypoints, tileSize);

  return {
    grid,
    waypoints,
    pathCells,
    pixelWaypoints,
    towers: [],
    enemies: [],
    projectiles: [],
    economy: createEconomy(200, 20),
    waveState: createWaveState(),
    tileSize,
    selectedTower: null,
    hoverCell: null,
    canPlace: false,
    gameOver: false,
    waveAnnounceTimer: 0
  };
}

/* ═══════════════════════ GAME LOOP ═══════════════════════ */

function gameLoop(timestamp) {
  if (!running) return;

  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = timestamp;

  if (!state.gameOver) {
    update(dt);
  }

  renderFrame();
  updateHUD();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Spawn enemies from wave
  const toSpawn = updateWaveSpawns(state.waveState, dt);
  for (const typeId of toSpawn) {
    const enemy = createEnemy(typeId, state.pixelWaypoints, state.waveState.currentWave);
    if (enemy) state.enemies.push(enemy);
  }

  // Move enemies
  for (const enemy of state.enemies) {
    const reachedEnd = moveEnemy(enemy, state.pixelWaypoints, dt, tileSize);
    updateEnemyVisuals(enemy, dt);

    if (reachedEnd) {
      const type = ENEMY_TYPES[enemy.typeId];
      const gameIsOver = removeLives(state.economy, type.livesStolen);
      notifyLeak(state.waveState);
      if (gameIsOver) {
        triggerGameOver();
        return;
      }
    }
  }

  // Tower targeting and firing
  for (const tower of state.towers) {
    const target = findTarget(tower, state.enemies, tileSize);
    updateTowerRotation(tower, target, dt);

    const projectile = tryFire(tower, target, dt, tileSize);
    if (projectile) {
      state.projectiles.push(projectile);
    }
  }

  // Update projectiles and handle hits
  const { allKills, allDamageEvents, hitPositions } = updateProjectiles(state.projectiles, state.enemies, dt);

  // Process kills
  for (const killed of allKills) {
    const type = ENEMY_TYPES[killed.typeId];
    addGold(state.economy, type.reward, killed.x, killed.y);
    notifyKill(state.waveState);
    spawnDeathBurst(killed.x, killed.y, type.color1, type.color2);
    spawnGoldPickup(killed.x, killed.y, type.reward);

    // Credit kill to tower that fired
    for (const tower of state.towers) {
      if (tower.id === killed.lastHitBy) {
        tower.kills++;
        break;
      }
    }
  }

  // Hit effects
  for (const hit of hitPositions) {
    spawnHitSpark(hit.x, hit.y, hit.type);
    if (hit.type === 'cannon') {
      const cannonType = TOWER_TYPES.cannon;
      spawnSplashRing(hit.x, hit.y, cannonType.splashRadius * tileSize);
    }
  }

  // Remove dead enemies
  state.enemies = state.enemies.filter(e => e.alive && !e.reachedEnd);

  // Check wave complete
  if (isWaveComplete(state.waveState)) {
    const bonus = endWave(state.waveState);
    addGold(state.economy, bonus);
  }

  // Update economy popups
  updatePopups(state.economy, dt);

  // Update particles
  updateParticles(dt);

  // Update wave announce timer
  if (state.waveAnnounceTimer > 0) {
    state.waveAnnounceTimer -= dt;
    if (state.waveAnnounceTimer <= 0) {
      const announceEl = document.getElementById('wave-announce');
      if (announceEl) announceEl.classList.remove('visible');
    }
  }

  // Update input state
  state.selectedTower = getSelectedTower();
  updateTowerButtons(state.economy.gold);
  updateStartButton(state.waveState.waveActive);
}

function renderFrame() {
  render(ctx, state);
}

/* ═══════════════════════ HUD UPDATE ═══════════════════════ */

function updateHUD() {
  document.getElementById('hud-gold').textContent = state.economy.gold;
  document.getElementById('hud-lives').textContent = state.economy.lives;
  document.getElementById('hud-wave').textContent = state.waveState.currentWave;
  document.getElementById('hud-kills').textContent = state.waveState.totalKills;
}

/* ═══════════════════════ GAME OVER ═══════════════════════ */

function triggerGameOver() {
  state.gameOver = true;

  document.getElementById('final-wave').textContent = state.waveState.currentWave;
  document.getElementById('final-kills').textContent = state.waveState.totalKills;
  document.getElementById('final-gold').textContent = state.economy.totalEarned;

  const overlay = document.getElementById('game-over-overlay');
  overlay.classList.add('visible');
}

/* ═══════════════════════ CALLBACKS ═══════════════════════ */

function handlePlace(towerId, col, row) {
  const type = TOWER_TYPES[towerId];
  if (!type) return false;
  if (!canAfford(state.economy, type.cost)) return false;
  if (!isBuildable(state.grid, col, row, state.towers)) return false;

  spend(state.economy, type.cost);
  const tower = createTower(towerId, col, row, tileSize);
  state.towers.push(tower);

  updateTowerButtons(state.economy.gold);
  return true;
}

function handleStartWave() {
  if (state.waveState.waveActive || state.gameOver) return;

  const waveData = startWave(state.waveState);

  // Announce wave
  const announceEl = document.getElementById('wave-announce');
  if (announceEl) {
    announceEl.textContent = `WAVE ${state.waveState.currentWave}`;
    announceEl.classList.remove('visible');
    // Force reflow for re-triggering animation
    void announceEl.offsetWidth;
    announceEl.classList.add('visible');
    state.waveAnnounceTimer = 2.0;
  }
}

function handleRestart() {
  const overlay = document.getElementById('game-over-overlay');
  overlay.classList.remove('visible');
  clearParticles();
  deselectTower();
  state = createState();
  updateHUD();
  updateTowerButtons(state.economy.gold);
  updateStartButton(false);
}

/* ═══════════════════════ CANVAS SETUP ═══════════════════════ */

function setupCanvas() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  const container = document.getElementById('canvas-container');

  // Calculate tile size to fit container
  resizeCanvas(container);

  // Resize observer for responsive
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas(container);
  });
  resizeObserver.observe(container);

  // Track hover cell for placement preview
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(px / tileSize);
    const row = Math.floor(py / tileSize);

    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      state.hoverCell = { col, row };
      state.canPlace = state.selectedTower
        ? isBuildable(state.grid, col, row, state.towers) && canAfford(state.economy, TOWER_TYPES[state.selectedTower].cost)
        : false;
    } else {
      state.hoverCell = null;
      state.canPlace = false;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    state.hoverCell = null;
    state.canPlace = false;
  });
}

function resizeCanvas(container) {
  const rect = container.getBoundingClientRect();
  const maxTileW = Math.floor(rect.width / COLS);
  const maxTileH = Math.floor(rect.height / ROWS);
  tileSize = Math.max(24, Math.min(maxTileW, maxTileH, 60));

  canvas.width = COLS * tileSize;
  canvas.height = ROWS * tileSize;

  // Scale display size to fill container
  const displayW = COLS * tileSize;
  const displayH = ROWS * tileSize;
  const scale = Math.min(rect.width / displayW, rect.height / displayH);
  canvas.style.width = `${displayW * scale}px`;
  canvas.style.height = `${displayH * scale}px`;

  // Update state and modules
  if (state) {
    state.tileSize = tileSize;
    state.pixelWaypoints = waypointsToPixels(state.waypoints, tileSize);

    // Recompute tower pixel positions
    for (const tower of state.towers) {
      tower.x = tower.col * tileSize + tileSize / 2;
      tower.y = tower.row * tileSize + tileSize / 2;
    }
  }

  setTileSize(tileSize);
}

/* ═══════════════════════ BOOT ═══════════════════════ */

function boot() {
  setupCanvas();
  state = createState();
  initRenderer(tileSize);

  const container = document.getElementById('canvas-container');
  initInput(canvas, container, tileSize, {
    onPlace: handlePlace,
    onStartWave: handleStartWave,
    onRestart: handleRestart
  });

  updateHUD();
  updateTowerButtons(state.economy.gold);
  updateStartButton(false);

  // Expose for testing
  window.__FORTRESS__ = {
    getState: () => ({
      gold: state.economy.gold,
      lives: state.economy.lives,
      wave: state.waveState.currentWave,
      kills: state.waveState.totalKills,
      towers: state.towers.length,
      enemies: state.enemies.length,
      gameOver: state.gameOver,
      waveActive: state.waveState.waveActive
    })
  };

  // Start game loop
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);

  // Auto-play if hash is #autoplay
  if (window.location.hash === '#autoplay') {
    setTimeout(() => handleStartWave(), 500);
  }
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
