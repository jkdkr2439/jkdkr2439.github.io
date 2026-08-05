/**
 * FORTRESS — Particles Module
 * Death bursts, hit sparks, gold pickup animations.
 */

const particles = [];
const MAX_PARTICLES = 500;

/**
 * Create a death burst at enemy position.
 */
export function spawnDeathBurst(x, y, color1, color2) {
  const count = 12 + Math.random() * 8;
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 60 + Math.random() * 120;
    const size = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      maxSize: size,
      color: Math.random() > 0.5 ? color1 : color2,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 0.6 + Math.random() * 0.4,
      type: 'burst',
      gravity: 80,
      alpha: 1
    });
  }
}

/**
 * Create gold pickup animation.
 */
export function spawnGoldPickup(x, y, amount) {
  // Sparkle particles
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const speed = 40 + Math.random() * 30;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      size: 2 + Math.random() * 2,
      maxSize: 3,
      color: '#f0b429',
      life: 0.8,
      maxLife: 0.8,
      type: 'sparkle',
      gravity: -20,
      alpha: 1
    });
  }

  // Rising text particle (handled in render)
  particles.push({
    x,
    y: y - 10,
    vx: 0,
    vy: -50,
    size: 14,
    maxSize: 14,
    color: '#f0b429',
    life: 1.2,
    maxLife: 1.2,
    type: 'text',
    text: `+${amount}g`,
    gravity: 0,
    alpha: 1
  });
}

/**
 * Create hit spark at impact point.
 */
export function spawnHitSpark(x, y, towerType) {
  const colors = {
    arrow: ['#f0b429', '#e8a838'],
    frost: ['#64b5f6', '#42a5f5'],
    cannon: ['#ff7043', '#ef5350']
  };
  const [c1, c2] = colors[towerType] || ['#fff', '#ccc'];

  const count = 5 + Math.random() * 4;
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 60;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5 + Math.random() * 2,
      maxSize: 2.5,
      color: Math.random() > 0.5 ? c1 : c2,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.4,
      type: 'spark',
      gravity: 0,
      alpha: 1
    });
  }
}

/**
 * Create cannon splash ring.
 */
export function spawnSplashRing(x, y, radius) {
  const count = 16;
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = radius * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 2,
      maxSize: 4,
      color: '#ff7043',
      life: 0.4,
      maxLife: 0.4,
      type: 'ring',
      gravity: 0,
      alpha: 0.8
    });
  }
}

/**
 * Update all particles. Remove dead ones.
 */
export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    p.vx *= 0.97;
    p.vy *= 0.97;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const lifeRatio = p.life / p.maxLife;
    p.alpha = lifeRatio;
    p.size = p.maxSize * lifeRatio;
  }
}

/**
 * Render all particles to canvas.
 */
export function renderParticles(ctx) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;

    if (p.type === 'text') {
      ctx.font = `bold ${p.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.type === 'sparkle') {
      // Diamond shape
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size);
      ctx.lineTo(p.x + p.size * 0.6, p.y);
      ctx.lineTo(p.x, p.y + p.size);
      ctx.lineTo(p.x - p.size * 0.6, p.y);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'ring') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
    } else {
      // Regular circle particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.type === 'burst' ? 8 : 4;
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Clear all particles (for game restart).
 */
export function clearParticles() {
  particles.length = 0;
}

/**
 * Get particle count (for debugging).
 */
export function getParticleCount() {
  return particles.length;
}
