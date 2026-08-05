/**
 * FORTRESS - Enemies Module
 * Enemy types, spawning, movement along path.
 * Pure logic — no DOM access.
 */

export const ENEMY_TYPES = {
  runner: {
    id: 'runner',
    name: 'Runner',
    hp: 60,
    speed: 2.0,      // tiles per second
    reward: 15,
    size: 0.35,      // radius in tiles
    color1: '#66bb6a',
    color2: '#2e7d32',
    livesStolen: 1
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    hp: 200,
    speed: 0.8,
    reward: 40,
    size: 0.5,
    color1: '#7e57c2',
    color2: '#4527a0',
    livesStolen: 2
  },
  swarm: {
    id: 'swarm',
    name: 'Swarm',
    hp: 30,
    speed: 2.5,
    reward: 8,
    size: 0.25,
    color1: '#ffa726',
    color2: '#e65100',
    livesStolen: 1
  },
  boss: {
    id: 'boss',
    name: 'Boss',
    hp: 800,
    speed: 0.5,
    reward: 150,
    size: 0.6,
    color1: '#ef5350',
    color2: '#b71c1c',
    livesStolen: 5
  }
};

let enemyCounter = 0;

/**
 * Create an enemy instance at the path start.
 */
export function createEnemy(typeId, pixelWaypoints, waveNumber) {
  const type = ENEMY_TYPES[typeId];
  if (!type) return null;

  // Scale HP with wave number
  const hpScale = 1 + (waveNumber - 1) * 0.15;
  const maxHp = Math.round(type.hp * hpScale);

  enemyCounter++;

  return {
    id: `enemy_${enemyCounter}_${Date.now()}`,
    typeId,
    x: pixelWaypoints[0].x,
    y: pixelWaypoints[0].y,
    hp: maxHp,
    maxHp: maxHp,
    speed: type.speed,
    baseSpeed: type.speed,
    reward: type.reward,
    size: type.size,
    livesStolen: type.livesStolen,
    waypointIndex: 0,       // current target waypoint
    pathProgress: 0,        // 0-1 how far along total path
    slowTimer: 0,           // remaining slow duration
    slowFactor: 0,          // current slow multiplier
    alive: true,
    reachedEnd: false,
    hpBarFlash: 0,          // flash on damage
    deathAnimTimer: 0       // for death burst trigger
  };
}

/**
 * Move an enemy along the pixel waypoints.
 * Returns true if enemy reached the end.
 */
export function moveEnemy(enemy, pixelWaypoints, dt, tileSize) {
  if (!enemy.alive || enemy.reachedEnd) return false;

  // Apply slow effect
  let currentSpeed = enemy.baseSpeed;
  if (enemy.slowTimer > 0) {
    enemy.slowTimer -= dt;
    currentSpeed *= (1 - enemy.slowFactor);
  } else {
    enemy.slowFactor = 0;
  }

  const speedPx = currentSpeed * tileSize;
  let remaining = speedPx * dt;

  while (remaining > 0 && enemy.waypointIndex < pixelWaypoints.length - 1) {
    const target = pixelWaypoints[enemy.waypointIndex + 1];
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= remaining) {
      enemy.x = target.x;
      enemy.y = target.y;
      enemy.waypointIndex++;
      remaining -= dist;
    } else {
      const ratio = remaining / dist;
      enemy.x += dx * ratio;
      enemy.y += dy * ratio;
      remaining = 0;
    }
  }

  // Update progress
  enemy.pathProgress = enemy.waypointIndex / (pixelWaypoints.length - 1);

  // Check if reached end
  if (enemy.waypointIndex >= pixelWaypoints.length - 1) {
    enemy.reachedEnd = true;
    enemy.alive = false;
    return true;
  }

  return false;
}

/**
 * Apply damage to an enemy.
 */
export function damageEnemy(enemy, damage) {
  if (!enemy.alive) return false;

  enemy.hp -= damage;
  enemy.hpBarFlash = 1.0;

  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;
    return true; // died
  }
  return false;
}

/**
 * Apply slow effect to an enemy.
 */
export function applySlow(enemy, factor, duration) {
  // Take the stronger slow
  if (factor > enemy.slowFactor || enemy.slowTimer <= 0) {
    enemy.slowFactor = factor;
    enemy.slowTimer = duration;
  }
}

/**
 * Update enemy visual timers.
 */
export function updateEnemyVisuals(enemy, dt) {
  enemy.hpBarFlash = Math.max(0, enemy.hpBarFlash - dt * 3);
}
