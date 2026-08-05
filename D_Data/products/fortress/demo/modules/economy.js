/**
 * FORTRESS - Economy Module
 * Gold management, purchasing, and rewards.
 * Pure logic — no DOM access.
 */

/**
 * Create an economy state.
 */
export function createEconomy(startingGold = 200, startingLives = 20) {
  return {
    gold: startingGold,
    lives: startingLives,
    maxLives: startingLives,
    totalEarned: 0,
    totalSpent: 0,
    goldPopups: []  // { x, y, amount, timer }
  };
}

/**
 * Check if player can afford a purchase.
 */
export function canAfford(economy, cost) {
  return economy.gold >= cost;
}

/**
 * Spend gold. Returns true if successful.
 */
export function spend(economy, amount) {
  if (economy.gold < amount) return false;
  economy.gold -= amount;
  economy.totalSpent += amount;
  return true;
}

/**
 * Add gold reward (from kill or wave bonus).
 */
export function addGold(economy, amount, x, y) {
  economy.gold += amount;
  economy.totalEarned += amount;

  if (x !== undefined && y !== undefined) {
    economy.goldPopups.push({
      x,
      y,
      amount,
      timer: 1.5,
      vy: -40 // pixels per second upward
    });
  }
}

/**
 * Remove lives. Returns true if game over.
 */
export function removeLives(economy, amount) {
  economy.lives -= amount;
  if (economy.lives <= 0) {
    economy.lives = 0;
    return true; // game over
  }
  return false;
}

/**
 * Update gold popups (for rendering).
 */
export function updatePopups(economy, dt) {
  for (let i = economy.goldPopups.length - 1; i >= 0; i--) {
    const popup = economy.goldPopups[i];
    popup.timer -= dt;
    popup.y += popup.vy * dt;
    if (popup.timer <= 0) {
      economy.goldPopups.splice(i, 1);
    }
  }
}

/**
 * Check if game is over.
 */
export function isGameOver(economy) {
  return economy.lives <= 0;
}
