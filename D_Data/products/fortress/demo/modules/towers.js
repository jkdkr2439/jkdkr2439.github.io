/**
 * FORTRESS - Towers Module
 * Tower definitions, creation, targeting, and firing logic.
 * Pure logic — no DOM access.
 */

export const TOWER_TYPES = {
  arrow: {
    id: 'arrow',
    name: 'Arrow',
    cost: 50,
    damage: 15,
    range: 3.5,       // in tiles
    fireRate: 0.4,    // seconds between shots
    projectileSpeed: 8, // tiles per second
    color: '#e8a838',
    glowColor: '#f0b429',
    description: 'Fast single-target damage'
  },
  frost: {
    id: 'frost',
    name: 'Frost',
    cost: 75,
    damage: 8,
    range: 3.0,
    fireRate: 0.8,
    projectileSpeed: 5,
    slowFactor: 0.4,   // reduce speed by 40%
    slowDuration: 2.0,  // seconds
    color: '#64b5f6',
    glowColor: '#42a5f5',
    description: 'Slows enemies on hit'
  },
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    cost: 120,
    damage: 40,
    range: 2.5,
    fireRate: 1.5,
    projectileSpeed: 4,
    splashRadius: 1.2,  // tiles
    color: '#ef5350',
    glowColor: '#f44336',
    description: 'Area splash damage'
  }
};

/**
 * Create a tower instance at a grid position.
 */
export function createTower(typeId, col, row, tileSize) {
  const type = TOWER_TYPES[typeId];
  if (!type) return null;

  return {
    id: `tower_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    typeId,
    col,
    row,
    x: col * tileSize + tileSize / 2,
    y: row * tileSize + tileSize / 2,
    angle: 0,          // current rotation in radians
    targetAngle: 0,    // desired rotation
    cooldown: 0,       // time until next shot
    target: null,      // current target enemy id
    isFiring: false,   // true during fire animation
    fireFlash: 0,      // flash intensity [0-1]
    kills: 0
  };
}

/**
 * Find the best target for a tower from a list of enemies.
 * Prioritizes: closest to exit (furthest along path).
 */
export function findTarget(tower, enemies, tileSize) {
  const type = TOWER_TYPES[tower.typeId];
  const rangePx = type.range * tileSize;
  let best = null;
  let bestProgress = -1;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dx = enemy.x - tower.x;
    const dy = enemy.y - tower.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= rangePx && enemy.pathProgress > bestProgress) {
      best = enemy;
      bestProgress = enemy.pathProgress;
    }
  }

  return best;
}

/**
 * Update tower rotation toward target.
 */
export function updateTowerRotation(tower, target, dt) {
  if (!target) return;

  const dx = target.x - tower.x;
  const dy = target.y - tower.y;
  const desired = Math.atan2(dy, dx);

  // Smooth rotation
  let diff = desired - tower.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const rotSpeed = 8; // radians per second
  if (Math.abs(diff) < rotSpeed * dt) {
    tower.angle = desired;
  } else {
    tower.angle += Math.sign(diff) * rotSpeed * dt;
  }
}

/**
 * Attempt to fire at target. Returns projectile data or null.
 */
export function tryFire(tower, target, dt, tileSize) {
  tower.cooldown -= dt;
  tower.fireFlash = Math.max(0, tower.fireFlash - dt * 4);

  if (!target || tower.cooldown > 0) {
    tower.isFiring = false;
    return null;
  }

  const type = TOWER_TYPES[tower.typeId];
  tower.cooldown = type.fireRate;
  tower.isFiring = true;
  tower.fireFlash = 1.0;

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    towerId: tower.id,
    towerType: tower.typeId,
    x: tower.x,
    y: tower.y,
    targetId: target.id,
    targetX: target.x,
    targetY: target.y,
    speed: type.projectileSpeed * tileSize,
    damage: type.damage,
    splashRadius: type.splashRadius ? type.splashRadius * tileSize : 0,
    slowFactor: type.slowFactor || 0,
    slowDuration: type.slowDuration || 0,
    trail: [],       // positions for trail rendering
    alive: true
  };
}
