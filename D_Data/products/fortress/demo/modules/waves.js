/**
 * FORTRESS - Waves Module
 * Wave composition, timing, and escalation.
 * Pure logic — no DOM access.
 */

/**
 * Generate the composition for a given wave number.
 * Escalates difficulty infinitely.
 */
export function generateWave(waveNumber) {
  const enemies = [];

  if (waveNumber <= 3) {
    // Early waves: mostly runners
    const count = 4 + waveNumber * 2;
    for (let i = 0; i < count; i++) {
      enemies.push({ typeId: 'runner', delay: i * 0.8 });
    }
    if (waveNumber >= 3) {
      enemies.push({ typeId: 'tank', delay: count * 0.8 + 1 });
    }
  } else if (waveNumber <= 6) {
    // Mid-early: mix
    const runners = 3 + waveNumber;
    const tanks = Math.floor(waveNumber / 2);
    const swarms = waveNumber * 2;
    let t = 0;
    for (let i = 0; i < runners; i++) { enemies.push({ typeId: 'runner', delay: t }); t += 0.7; }
    t += 1.5;
    for (let i = 0; i < tanks; i++) { enemies.push({ typeId: 'tank', delay: t }); t += 2; }
    t += 1;
    for (let i = 0; i < swarms; i++) { enemies.push({ typeId: 'swarm', delay: t }); t += 0.3; }
  } else if (waveNumber <= 10) {
    // Mid: introduce bosses
    const runners = waveNumber + 2;
    const tanks = waveNumber - 2;
    const swarms = waveNumber * 3;
    let t = 0;
    for (let i = 0; i < swarms; i++) { enemies.push({ typeId: 'swarm', delay: t }); t += 0.25; }
    t += 2;
    for (let i = 0; i < runners; i++) { enemies.push({ typeId: 'runner', delay: t }); t += 0.5; }
    t += 2;
    for (let i = 0; i < tanks; i++) { enemies.push({ typeId: 'tank', delay: t }); t += 1.5; }
    if (waveNumber >= 8) {
      t += 3;
      enemies.push({ typeId: 'boss', delay: t });
    }
  } else {
    // Late game: escalating madness
    const baseCount = 10 + (waveNumber - 10) * 3;
    let t = 0;

    // Swarm burst
    const swarms = Math.min(baseCount, 30 + waveNumber);
    for (let i = 0; i < swarms; i++) { enemies.push({ typeId: 'swarm', delay: t }); t += 0.2; }
    t += 1.5;

    // Runner wave
    const runners = Math.floor(baseCount * 0.5);
    for (let i = 0; i < runners; i++) { enemies.push({ typeId: 'runner', delay: t }); t += 0.4; }
    t += 2;

    // Tank squad
    const tanks = Math.floor(waveNumber / 3);
    for (let i = 0; i < tanks; i++) { enemies.push({ typeId: 'tank', delay: t }); t += 1.2; }
    t += 3;

    // Boss(es)
    const bosses = Math.floor((waveNumber - 5) / 5);
    for (let i = 0; i < bosses; i++) { enemies.push({ typeId: 'boss', delay: t }); t += 4; }
  }

  return {
    waveNumber,
    enemies,
    totalEnemies: enemies.length,
    bonus: 20 + waveNumber * 10
  };
}

/**
 * Create wave state manager.
 */
export function createWaveState() {
  return {
    currentWave: 0,
    waveActive: false,
    waveData: null,
    spawnIndex: 0,
    spawnTimer: 0,
    enemiesRemaining: 0,
    betweenWaves: true,
    totalKills: 0
  };
}

/**
 * Start the next wave. Returns wave data.
 */
export function startWave(waveState) {
  waveState.currentWave++;
  waveState.waveData = generateWave(waveState.currentWave);
  waveState.spawnIndex = 0;
  waveState.spawnTimer = 0;
  waveState.enemiesRemaining = waveState.waveData.totalEnemies;
  waveState.waveActive = true;
  waveState.betweenWaves = false;
  return waveState.waveData;
}

/**
 * Update spawn timer and return any enemies to spawn this frame.
 * Returns array of typeIds to spawn.
 */
export function updateWaveSpawns(waveState, dt) {
  if (!waveState.waveActive || !waveState.waveData) return [];

  const toSpawn = [];
  waveState.spawnTimer += dt;

  while (
    waveState.spawnIndex < waveState.waveData.enemies.length &&
    waveState.spawnTimer >= waveState.waveData.enemies[waveState.spawnIndex].delay
  ) {
    toSpawn.push(waveState.waveData.enemies[waveState.spawnIndex].typeId);
    waveState.spawnIndex++;
  }

  return toSpawn;
}

/**
 * Notify a kill happened — decrements remaining.
 */
export function notifyKill(waveState) {
  waveState.enemiesRemaining--;
  waveState.totalKills++;
}

/**
 * Notify enemy reached end (still reduce count).
 */
export function notifyLeak(waveState) {
  waveState.enemiesRemaining--;
}

/**
 * Check if wave is complete (all spawned and all dead/leaked).
 */
export function isWaveComplete(waveState) {
  if (!waveState.waveActive) return false;
  return (
    waveState.spawnIndex >= waveState.waveData.enemies.length &&
    waveState.enemiesRemaining <= 0
  );
}

/**
 * End the current wave.
 */
export function endWave(waveState) {
  waveState.waveActive = false;
  waveState.betweenWaves = true;
  return waveState.waveData.bonus;
}
