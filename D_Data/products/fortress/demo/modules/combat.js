/**
 * FORTRESS - Combat Module
 * Projectile movement, hit detection, damage application.
 * Pure logic — no DOM access.
 */

import { damageEnemy, applySlow } from './enemies.js';

/**
 * Move a projectile toward its target.
 * Returns true if hit target.
 */
export function moveProjectile(projectile, enemies, dt) {
  if (!projectile.alive) return false;

  // Store trail position
  projectile.trail.push({ x: projectile.x, y: projectile.y });
  if (projectile.trail.length > 8) {
    projectile.trail.shift();
  }

  // Find current target position (target might be moving)
  const target = enemies.find(e => e.id === projectile.targetId && e.alive);

  let targetX, targetY;
  if (target) {
    targetX = target.x;
    targetY = target.y;
    projectile.targetX = targetX;
    projectile.targetY = targetY;
  } else {
    // Target died — continue to last known position
    targetX = projectile.targetX;
    targetY = projectile.targetY;
  }

  const dx = targetX - projectile.x;
  const dy = targetY - projectile.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const moveDist = projectile.speed * dt;

  if (dist <= moveDist) {
    // Hit!
    projectile.x = targetX;
    projectile.y = targetY;
    projectile.alive = false;
    return true;
  }

  const ratio = moveDist / dist;
  projectile.x += dx * ratio;
  projectile.y += dy * ratio;
  return false;
}

/**
 * Apply projectile hit effects.
 * Returns { kills: [...], damageEvents: [...] }
 */
export function applyHit(projectile, enemies) {
  const results = { kills: [], damageEvents: [] };

  if (projectile.splashRadius > 0) {
    // Splash damage — hit all enemies in radius
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= projectile.splashRadius) {
        // Damage falls off with distance
        const falloff = 1 - (dist / projectile.splashRadius) * 0.5;
        const dmg = Math.round(projectile.damage * falloff);
        const killed = damageEnemy(enemy, dmg);
        results.damageEvents.push({ enemyId: enemy.id, damage: dmg, x: enemy.x, y: enemy.y });
        if (killed) results.kills.push(enemy);
      }
    }
  } else {
    // Single target
    const target = enemies.find(e => e.id === projectile.targetId);
    if (target && target.alive) {
      const killed = damageEnemy(target, projectile.damage);
      results.damageEvents.push({ enemyId: target.id, damage: projectile.damage, x: target.x, y: target.y });
      if (killed) results.kills.push(target);

      // Apply slow if frost tower
      if (projectile.slowFactor > 0) {
        applySlow(target, projectile.slowFactor, projectile.slowDuration);
      }
    }
  }

  return results;
}

/**
 * Process all projectiles for one frame.
 * Returns { allKills: [...], allDamageEvents: [...], hitPositions: [...] }
 */
export function updateProjectiles(projectiles, enemies, dt) {
  const allKills = [];
  const allDamageEvents = [];
  const hitPositions = [];

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    const hit = moveProjectile(proj, enemies, dt);

    if (hit) {
      const results = applyHit(proj, enemies);
      allKills.push(...results.kills);
      allDamageEvents.push(...results.damageEvents);
      hitPositions.push({ x: proj.x, y: proj.y, type: proj.towerType });
      projectiles.splice(i, 1);
    } else if (!proj.alive) {
      projectiles.splice(i, 1);
    }
  }

  // Remove projectiles that went off-screen
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (p.x < -100 || p.x > 2000 || p.y < -100 || p.y > 2000) {
      projectiles.splice(i, 1);
    }
  }

  return { allKills, allDamageEvents, hitPositions };
}
