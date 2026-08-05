/**
 * FORTRESS — Renderer Module
 * Canvas drawing with textures, gradients, glow effects, and polish.
 */

import { COLS, ROWS, TILE_PATH } from './map.js';
import { TOWER_TYPES } from './towers.js';
import { ENEMY_TYPES } from './enemies.js';
import { renderParticles } from './particles.js';

let grassPattern = null;
let noiseData = null;

/**
 * Generate noise texture for grass.
 */
function generateNoiseData(width, height) {
  const data = new Float32Array(width * height);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random();
  }
  return data;
}

/**
 * Initialize renderer (generate patterns).
 */
export function initRenderer(tileSize) {
  noiseData = generateNoiseData(COLS * 4, ROWS * 4);
}

/**
 * Draw the complete game frame.
 */
export function render(ctx, state) {
  const { grid, towers, enemies, projectiles, economy, tileSize, selectedTower, hoverCell, waveState } = state;
  const width = COLS * tileSize;
  const height = ROWS * tileSize;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Draw layers
  drawGrass(ctx, grid, tileSize);
  drawPath(ctx, grid, tileSize);
  drawGrid(ctx, tileSize);

  if (selectedTower && hoverCell) {
    drawPlacementPreview(ctx, hoverCell, selectedTower, tileSize, state.canPlace);
  }

  drawTowers(ctx, towers, tileSize);
  drawEnemies(ctx, enemies, tileSize);
  drawProjectiles(ctx, projectiles, tileSize);
  renderParticles(ctx);
  drawGoldPopups(ctx, economy.goldPopups);
}

/**
 * Draw textured grass background.
 */
function drawGrass(ctx, grid, tileSize) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === TILE_PATH) continue;

      const x = c * tileSize;
      const y = r * tileSize;

      // Base grass gradient per tile (subtle variation)
      const noiseIdx = (r * 4 + (c % 4)) * COLS * 4 + (c * 4 + (r % 4));
      const nv = noiseData ? noiseData[noiseIdx % noiseData.length] : 0.5;

      const baseGreen = 27 + Math.floor(nv * 18);
      const baseSat = 58 + Math.floor(nv * 20);

      const grad = ctx.createRadialGradient(
        x + tileSize * 0.5, y + tileSize * 0.5, 0,
        x + tileSize * 0.5, y + tileSize * 0.5, tileSize * 0.7
      );
      grad.addColorStop(0, `hsl(${130 + nv * 15}, ${baseSat}%, ${baseGreen}%)`);
      grad.addColorStop(1, `hsl(${125 + nv * 10}, ${baseSat - 10}%, ${baseGreen - 6}%)`);

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Subtle noise dots for texture
      ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + nv * 0.02})`;
      const dotCount = 3;
      for (let d = 0; d < dotCount; d++) {
        const dx = x + ((c * 7 + d * 13 + r * 3) % tileSize);
        const dy = y + ((r * 11 + d * 7 + c * 5) % tileSize);
        ctx.fillRect(dx, dy, 1, 1);
      }
    }
  }
}

/**
 * Draw stone-textured path.
 */
function drawPath(ctx, grid, tileSize) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== TILE_PATH) continue;

      const x = c * tileSize;
      const y = r * tileSize;

      // Stone base gradient
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      grad.addColorStop(0, '#3d4450');
      grad.addColorStop(0.3, '#4a5060');
      grad.addColorStop(0.7, '#3a3f4a');
      grad.addColorStop(1, '#2e333c');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Stone texture - subtle crack lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 0.5;
      const seed = c * 17 + r * 31;
      ctx.beginPath();
      ctx.moveTo(x + (seed % tileSize), y);
      ctx.lineTo(x + ((seed * 3) % tileSize), y + tileSize);
      ctx.stroke();

      // Highlight edge (top-left light source)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(x, y, tileSize, 1);
      ctx.fillRect(x, y, 1, tileSize);

      // Shadow edge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(x, y + tileSize - 1, tileSize, 1);
      ctx.fillRect(x + tileSize - 1, y, 1, tileSize);

      // Inner glow for path continuity
      const hasLeft = c > 0 && grid[r][c - 1] === TILE_PATH;
      const hasRight = c < COLS - 1 && grid[r][c + 1] === TILE_PATH;
      const hasUp = r > 0 && grid[r - 1][c] === TILE_PATH;
      const hasDown = r < ROWS - 1 && grid[r + 1][c] === TILE_PATH;

      // Softer edges where path meets grass
      if (!hasLeft) {
        const edgeGrad = ctx.createLinearGradient(x, y, x + 4, y);
        edgeGrad.addColorStop(0, 'rgba(18, 41, 18, 0.6)');
        edgeGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(x, y, 4, tileSize);
      }
      if (!hasRight) {
        const edgeGrad = ctx.createLinearGradient(x + tileSize - 4, y, x + tileSize, y);
        edgeGrad.addColorStop(0, 'transparent');
        edgeGrad.addColorStop(1, 'rgba(18, 41, 18, 0.6)');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(x + tileSize - 4, y, 4, tileSize);
      }
      if (!hasUp) {
        const edgeGrad = ctx.createLinearGradient(x, y, x, y + 4);
        edgeGrad.addColorStop(0, 'rgba(18, 41, 18, 0.6)');
        edgeGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(x, y, tileSize, 4);
      }
      if (!hasDown) {
        const edgeGrad = ctx.createLinearGradient(x, y + tileSize - 4, x, y + tileSize);
        edgeGrad.addColorStop(0, 'transparent');
        edgeGrad.addColorStop(1, 'rgba(18, 41, 18, 0.6)');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(x, y + tileSize - 4, tileSize, 4);
      }
    }
  }
}

/**
 * Draw subtle grid lines.
 */
function drawGrid(ctx, tileSize) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 0.5;

  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * tileSize, 0);
    ctx.lineTo(c * tileSize, ROWS * tileSize);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * tileSize);
    ctx.lineTo(COLS * tileSize, r * tileSize);
    ctx.stroke();
  }
}

/**
 * Draw placement preview ghost.
 */
function drawPlacementPreview(ctx, cell, towerId, tileSize, canPlace) {
  const x = cell.col * tileSize;
  const y = cell.row * tileSize;
  const type = TOWER_TYPES[towerId];

  // Highlight cell
  ctx.fillStyle = canPlace
    ? 'rgba(102, 187, 106, 0.25)'
    : 'rgba(239, 83, 80, 0.25)';
  ctx.fillRect(x, y, tileSize, tileSize);

  ctx.strokeStyle = canPlace
    ? 'rgba(102, 187, 106, 0.6)'
    : 'rgba(239, 83, 80, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

  // Range preview
  if (canPlace && type) {
    const cx = x + tileSize / 2;
    const cy = y + tileSize / 2;
    const rangePx = type.range * tileSize;
    ctx.beginPath();
    ctx.arc(cx, cy, rangePx, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240, 180, 41, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 180, 41, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/**
 * Draw all towers with glow and rotation.
 */
function drawTowers(ctx, towers, tileSize) {
  for (const tower of towers) {
    const type = TOWER_TYPES[tower.typeId];
    const cx = tower.x;
    const cy = tower.y;
    const radius = tileSize * 0.35;

    ctx.save();

    // Glow halo when firing
    if (tower.fireFlash > 0) {
      const glowRadius = radius * (1.8 + tower.fireFlash * 0.5);
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, glowRadius);
      glow.addColorStop(0, `rgba(${hexToRgb(type.glowColor)}, ${tower.fireFlash * 0.4})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tower base (platform)
    const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.2);
    baseGrad.addColorStop(0, '#2a3040');
    baseGrad.addColorStop(1, '#1a2030');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Tower body
    const bodyGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius);
    bodyGrad.addColorStop(0, lightenColor(type.color, 30));
    bodyGrad.addColorStop(0.7, type.color);
    bodyGrad.addColorStop(1, darkenColor(type.color, 30));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Tower ring (border)
    ctx.strokeStyle = lightenColor(type.color, 50);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Tower barrel (rotated toward target)
    ctx.translate(cx, cy);
    ctx.rotate(tower.angle);

    const barrelLen = radius * 1.3;
    const barrelWidth = radius * 0.3;
    const barrelGrad = ctx.createLinearGradient(0, -barrelWidth, barrelLen, 0);
    barrelGrad.addColorStop(0, '#556677');
    barrelGrad.addColorStop(1, '#334455');
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(0, -barrelWidth / 2, barrelLen, barrelWidth);

    // Barrel tip glow on fire
    if (tower.fireFlash > 0.3) {
      ctx.beginPath();
      ctx.arc(barrelLen, 0, barrelWidth, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(type.glowColor)}, ${tower.fireFlash})`;
      ctx.shadowColor = type.glowColor;
      ctx.shadowBlur = 10 * tower.fireFlash;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

/**
 * Draw all enemies with gradients, shadows, HP bars.
 */
function drawEnemies(ctx, enemies, tileSize) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const type = ENEMY_TYPES[enemy.typeId];
    const radius = type.size * tileSize;

    ctx.save();

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Enemy body with gradient
    const bodyGrad = ctx.createRadialGradient(
      enemy.x - radius * 0.3, enemy.y - radius * 0.3, 0,
      enemy.x, enemy.y, radius
    );
    bodyGrad.addColorStop(0, type.color1);
    bodyGrad.addColorStop(1, type.color2);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Inner highlight
    ctx.beginPath();
    ctx.arc(enemy.x - radius * 0.25, enemy.y - radius * 0.25, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    // Slow effect indicator
    if (enemy.slowTimer > 0) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 181, 246, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // HP Bar
    const hpRatio = enemy.hp / enemy.maxHp;
    const barWidth = radius * 2.5;
    const barHeight = 4;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - radius - 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, 2);
    ctx.fill();

    // HP fill with color gradient (green → yellow → red)
    let hpColor;
    if (hpRatio > 0.6) hpColor = '#66bb6a';
    else if (hpRatio > 0.3) hpColor = '#ffa726';
    else hpColor = '#ef5350';

    const hpGrad = ctx.createLinearGradient(barX, barY, barX + barWidth * hpRatio, barY);
    hpGrad.addColorStop(0, hpColor);
    hpGrad.addColorStop(1, darkenColor(hpColor, 20));
    ctx.fillStyle = hpGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * hpRatio, barHeight, 2);
    ctx.fill();

    // Flash on damage
    if (enemy.hpBarFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${enemy.hpBarFlash * 0.4})`;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * hpRatio, barHeight, 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draw projectiles with trails and glow.
 */
function drawProjectiles(ctx, projectiles, tileSize) {
  for (const proj of projectiles) {
    ctx.save();

    const towerType = TOWER_TYPES[proj.towerType];
    const color = towerType ? towerType.glowColor : '#fff';

    // Draw trail
    if (proj.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(proj.trail[0].x, proj.trail[0].y);
      for (let i = 1; i < proj.trail.length; i++) {
        ctx.lineTo(proj.trail[i].x, proj.trail[i].y);
      }
      ctx.lineTo(proj.x, proj.y);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Projectile glow
    const projRadius = proj.towerType === 'cannon' ? 5 : 3;
    const glowGrad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, projRadius * 3);
    glowGrad.addColorStop(0, `rgba(${hexToRgb(color)}, 0.6)`);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, projRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Projectile core
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, projRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fill();

    // Bright center
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, projRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Draw gold popup text.
 */
function drawGoldPopups(ctx, popups) {
  for (const popup of popups) {
    ctx.save();
    const alpha = Math.min(1, popup.timer / 0.5);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0b429';
    ctx.shadowColor = '#f0b429';
    ctx.shadowBlur = 4;
    ctx.fillText(`+${popup.amount}g`, popup.x, popup.y);
    ctx.restore();
  }
}

/* ═══════════════════════ HELPER FUNCTIONS ═══════════════════════ */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function lightenColor(hex, amount) {
  const h = hex.replace('#', '');
  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex, amount) {
  const h = hex.replace('#', '');
  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return `rgb(${r}, ${g}, ${b})`;
}
