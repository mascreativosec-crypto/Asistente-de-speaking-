/**
 * 21 completely distinct, continuously animated scenic backdrops tailored to
 * every Adult (12) and Kids (9) conversation scenario in ALLEN Aula.
 * Zero repeated templates: every scenario has its own signature color palette,
 * recognizable visual landmarks, and ambient motion.
 */

export const SUPPORTED_BACKDROP_SCENARIO_IDS = [
  'everyday',
  'new-york',
  'restaurant',
  'airport',
  'job-interview',
  'shopping',
  'new-friends',
  'business',
  'cambridge',
  'pop-culture',
  'health-doctor',
  'sports-hobbies',
  'kids-animals',
  'kids-colors-numbers',
  'kids-family',
  'kids-superheroes',
  'kids-food',
  'kids-school-toys',
  'kids-space-dinos',
  'kids-routine',
  'kids-stories',
] as const;

function fillSkyGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: string,
  mid: string,
  bottom: string
) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawBokehOrbs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  count: number,
  colors: string[],
  speed = 0.25,
  yMin = 0.1,
  yMax = 0.85
) {
  for (let i = 0; i < count; i++) {
    const seed = i * 73.17;
    const xBase =
      ((Math.sin(seed) * 0.5 + 0.5 + t * speed * (0.015 + (i % 4) * 0.004)) % 1.16) - 0.08;
    const yBase =
      yMin +
      (yMax - yMin) *
        (Math.cos(seed * 1.3) * 0.5 + 0.5 + Math.sin(t * (0.4 + (i % 3) * 0.2) + seed) * 0.04);
    const radius = (0.018 + (i % 5) * 0.014) * Math.min(w, h);
    const alpha = 0.12 + 0.1 * Math.sin(t * 1.1 + seed);
    ctx.save();
    ctx.globalAlpha = Math.max(0.04, alpha);
    const rg = ctx.createRadialGradient(xBase * w, yBase * h, 0, xBase * w, yBase * h, radius);
    rg.addColorStop(0, colors[i % colors.length]);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(xBase * w, yBase * h, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawDriftingClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  count: number,
  color: string,
  yRange: [number, number]
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const speed = 0.012 + (i % 3) * 0.006;
    const cx = (((i * 0.27 + t * speed) % 1.35) - 0.18) * w;
    const cy = (yRange[0] + ((i * 0.19) % 1) * (yRange[1] - yRange[0])) * h;
    const scale = (0.048 + (i % 3) * 0.02) * Math.min(w, h);
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 0.65, 0, Math.PI * 2);
    ctx.arc(cx - scale * 0.6, cy + scale * 0.12, scale * 0.48, 0, Math.PI * 2);
    ctx.arc(cx + scale * 0.62, cy + scale * 0.14, scale * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTwinklingStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  count: number,
  maxY = 0.65
) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const sx = (((Math.sin(i * 127.1) * 43758.5453) % 1) + 1) % 1;
    const sy = ((((Math.sin(i * 269.5) * 43758.5453) % 1) + 1) % 1) * maxY;
    const twinkle = 0.35 + 0.65 * Math.sin(t * (1.8 + (i % 4) * 0.7) + i * 2.1);
    const r = (1.1 + (i % 3) * 0.85) * (w > 900 ? 1 : 0.85);
    ctx.globalAlpha = Math.max(0.1, twinkle * 0.85);
    ctx.fillStyle = i % 5 === 0 ? '#fde68a' : '#e0f2fe';
    ctx.beginPath();
    ctx.arc(sx * w, sy * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawManhattanSkyline(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const bldgCount = 15;
  const bw = w / bldgCount;
  ctx.save();
  for (let i = 0; i < bldgCount; i++) {
    const heightFrac = 0.2 + (Math.sin(i * 3.7 + 1.2) * 0.5 + 0.5) * 0.28;
    const bh = h * heightFrac;
    const bx = i * bw - 2;
    const by = h * 0.83 - bh;
    ctx.fillStyle = '#090f24';
    ctx.fillRect(bx, by, bw + 4, bh + h * 0.2);

    // Empire State & Chrysler spires
    if (i === 3 || i === 11) {
      ctx.fillRect(bx + bw * 0.32, by - h * 0.08, bw * 0.36, h * 0.08);
      ctx.fillRect(bx + bw * 0.46, by - h * 0.16, bw * 0.08, h * 0.08);
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(bx + bw * 0.5, by - h * 0.16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const cols = 3;
    const rows = Math.min(8, Math.floor(bh / 22));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.sin(i * 31.7 + r * 17.3 + c * 7.1) > -0.1) {
          const pulse = 0.45 + 0.35 * Math.sin(t * 0.9 + i * 2.1 + r * 1.4 + c);
          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#fbbf24';
          ctx.globalAlpha = pulse * 0.65;
          ctx.fillRect(bx + bw * (0.18 + c * 0.25), by + 12 + r * 18, bw * 0.13, 8);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // Brooklyn Bridge suspension cables sweeping across bottom right
  ctx.strokeStyle = 'rgba(251,191,36,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.83);
  ctx.quadraticCurveTo(w * 0.78, h * 0.58, w * 1.02, h * 0.83);
  ctx.stroke();
  for (let k = 0; k < 7; k++) {
    const cx = w * (0.62 + k * 0.055);
    ctx.strokeStyle = 'rgba(251,191,36,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.78, h * 0.68);
    ctx.lineTo(cx, h * 0.83);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawScenarioBackdrop(
  ctx: CanvasRenderingContext2D,
  scenarioId: string,
  w: number,
  h: number,
  t: number,
  voiceEnergy = 0,
  isLightTheme = false
): void {
  switch (scenarioId) {
    // =========================================================================
    // 12 DISTINCT ADULT SCENARIOS
    // =========================================================================

    case 'everyday': {
      // 1. Cozy Seattle Artisan Coffee Shop: wooden wall tone, hanging Edison pendants, chalkboard menu, rising steam
      fillSkyGradient(ctx, w, h, '#1b1412', '#2d1e19', '#1e1514');
      ctx.save();
      // Subtle vertical warm wood paneling
      ctx.strokeStyle = 'rgba(251,191,36,0.045)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Café chalkboard menu frame on left wall
      ctx.fillStyle = 'rgba(15,23,42,0.58)';
      ctx.strokeStyle = 'rgba(217,119,6,0.38)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(w * 0.06, h * 0.25, w * 0.16, h * 0.28, 8);
      ctx.fill();
      ctx.stroke();
      // Chalk lines
      ctx.strokeStyle = 'rgba(254,243,199,0.22)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.085, h * (0.32 + i * 0.045));
        ctx.lineTo(w * (0.17 + (i % 2) * 0.025), h * (0.32 + i * 0.045));
        ctx.stroke();
      }
      // Hanging warm Edison pendant lamps
      for (const lx of [0.22, 0.78, 0.89]) {
        const px = w * lx;
        const py = h * (lx === 0.89 ? 0.18 : 0.24);
        ctx.strokeStyle = 'rgba(253,224,71,0.34)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, py);
        ctx.stroke();
        const lampGlow = ctx.createRadialGradient(px, py + 6, 2, px, py + 6, 62);
        lampGlow.addColorStop(0, 'rgba(254,240,138,0.85)');
        lampGlow.addColorStop(0.42, 'rgba(251,146,60,0.28)');
        lampGlow.addColorStop(1, 'rgba(251,146,60,0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(px, py + 6, 62, 0, Math.PI * 2);
        ctx.fill();
      }
      // Warm café counter bar + steaming ceramic mug on bottom right
      ctx.fillStyle = '#241712';
      ctx.fillRect(0, h * 0.84, w, h * 0.16);
      const mugX = w * 0.82;
      const mugY = h * 0.8;
      ctx.fillStyle = '#fef3c7';
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.roundRect(mugX - 18, mugY - 12, 36, 30, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      for (let s = 0; s < 3; s++) {
        const baseX = mugX - 8 + s * 8;
        ctx.strokeStyle = 'rgba(255,237,213,0.2)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let y = 0; y < 90; y += 7) {
          const sx = baseX + Math.sin(y * 0.065 - t * 1.9 + s * 1.3) * 9;
          const sy = mugY - 18 - y;
          if (y === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 12, ['#fb923c', '#fde047', '#fcd34d'], 0.14);
      break;
    }

    case 'new-york': {
      // 2. Manhattan & Times Square Twilight: Empire State spire, Brooklyn Bridge cables, neon billboards, yellow cab trails
      fillSkyGradient(ctx, w, h, '#070d24', '#162454', '#2d234a');
      drawTwinklingStars(ctx, w, h, t, 38, 0.45);
      drawManhattanSkyline(ctx, w, h, t);
      ctx.save();
      // Yellow cab & taillight streams across avenue
      for (let i = 0; i < 6; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const px = ((((t * (0.16 + i * 0.03) * dir + i * 0.21) % 1.2) + 1.2) % 1.2 - 0.1) * w;
        const py = h * (0.85 + (i % 3) * 0.04);
        const grad = ctx.createLinearGradient(px - 75 * dir, py, px, py);
        grad.addColorStop(0, 'rgba(251,191,36,0)');
        grad.addColorStop(1, i % 2 === 0 ? 'rgba(251,191,36,0.85)' : 'rgba(248,113,113,0.75)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(px - 75 * dir, py);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'restaurant': {
      // 3. Candlelit Evening Bistro: warm burgundy-velvet ambience, swaying bistro string lights, glowing table candles
      fillSkyGradient(ctx, w, h, '#1a0a16', '#331223', '#1c0c14');
      ctx.save();
      // Soft wine-shelf lines on left & right
      ctx.strokeStyle = 'rgba(253,186,116,0.12)';
      ctx.lineWidth = 2;
      for (const side of [0.05, 0.82]) {
        for (let row = 0; row < 3; row++) {
          const y = h * (0.32 + row * 0.13);
          ctx.beginPath();
          ctx.moveTo(w * side, y);
          ctx.lineTo(w * (side + 0.13), y);
          ctx.stroke();
        }
      }
      // Swaying patio/bistro fairy light garland
      ctx.strokeStyle = 'rgba(253,224,71,0.32)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.13);
      ctx.quadraticCurveTo(w * 0.5, h * (0.24 + Math.sin(t * 0.7) * 0.01), w, h * 0.13);
      ctx.stroke();
      for (let i = 1; i <= 9; i++) {
        const u = i / 10;
        const bx = w * u;
        const by = h * (0.13 + 4 * u * (1 - u) * (0.11 + Math.sin(t * 0.7) * 0.01));
        const glow = ctx.createRadialGradient(bx, by, 1, bx, by, 28);
        glow.addColorStop(0, 'rgba(254,240,138,0.95)');
        glow.addColorStop(0.4, 'rgba(251,146,60,0.34)');
        glow.addColorStop(1, 'rgba(251,146,60,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(bx, by, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      // Flickering candle flames on bottom left & right tables
      for (const cx of [0.15, 0.85]) {
        const fx = w * cx;
        const fy = h * 0.79;
        const flick = 0.85 + 0.15 * Math.sin(t * 11 + cx * 20);
        const cg = ctx.createRadialGradient(fx, fy - 12, 2, fx, fy - 12, 46 * flick);
        cg.addColorStop(0, 'rgba(254,240,138,0.75)');
        cg.addColorStop(0.45, 'rgba(249,115,22,0.22)');
        cg.addColorStop(1, 'rgba(249,115,22,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(fx, fy - 12, 46 * flick, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 14, ['#fb923c', '#fde047', '#f43f5e'], 0.18, 0.25, 0.9);
      break;
    }

    case 'airport': {
      // 4. Sunset Airport Terminal & Runway: angled glass departure windows, gliding jetliner, radar pulse, runway guide lights
      fillSkyGradient(ctx, w, h, '#09142c', '#1e3a6e', '#c96b45');
      drawDriftingClouds(ctx, w, h, t, 6, 'rgba(255,237,213,0.14)', [0.15, 0.5]);
      ctx.save();
      // Angled terminal window mullions
      ctx.strokeStyle = 'rgba(15,23,42,0.35)';
      ctx.lineWidth = 4;
      for (let i = 1; i <= 4; i++) {
        const wx = (w / 5) * i;
        ctx.beginPath();
        ctx.moveTo(wx + 24, 0);
        ctx.lineTo(wx - 24, h * 0.78);
        ctx.stroke();
      }
      // Gliding departing jetliner with contrail & blinking strobe
      const planeX = (((t * 0.05) % 1.32) - 0.16) * w;
      const planeY = h * (0.28 - (planeX / w) * 0.1);
      ctx.save();
      ctx.translate(planeX, planeY);
      ctx.rotate(-0.1);
      ctx.fillStyle = 'rgba(15,23,42,0.88)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-19, -17);
      ctx.lineTo(3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-23, -1);
      ctx.lineTo(-30, -11);
      ctx.lineTo(-17, -2);
      ctx.closePath();
      ctx.fill();
      const trail = ctx.createLinearGradient(-160, 0, -26, 0);
      trail.addColorStop(0, 'rgba(255,255,255,0)');
      trail.addColorStop(1, 'rgba(255,255,255,0.34)');
      ctx.strokeStyle = trail;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-160, 1);
      ctx.lineTo(-27, 0);
      ctx.stroke();
      if (Math.sin(t * 6.5) > 0.35) {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(4, -3, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // Tarmac & animated sequential blue/amber runway lights
      ctx.fillStyle = '#090f1d';
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      for (let i = 0; i < 14; i++) {
        const lx = (i + 0.5) * (w / 14);
        const pulse = 0.35 + 0.65 * Math.sin(t * 3 - i * 0.6);
        ctx.fillStyle = i % 3 === 0 ? `rgba(251,191,36,${pulse * 0.7})` : `rgba(56,189,248,${pulse * 0.7})`;
        ctx.beginPath();
        ctx.arc(lx, h * 0.85, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'job-interview': {
      // 5. Modern Minimalist Glass Boardroom: architectural steel/teal studio, framed artwork, swaying indoor plants (NO city skyline!)
      fillSkyGradient(ctx, w, h, '#0f1c2e', '#1a324a', '#16283a');
      ctx.save();
      // Clean architectural glass panels with frosted reflection sheen
      ctx.strokeStyle = 'rgba(226,232,240,0.12)';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 5; i++) {
        const gx = (w / 6) * i;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.lineTo(w, h * 0.62);
      ctx.stroke();
      // Framed modern geometric wall art on left & right
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = 'rgba(148,163,184,0.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.08, h * 0.22, w * 0.14, h * 0.28);
      ctx.fillRect(w * 0.08, h * 0.22, w * 0.14, h * 0.28);
      ctx.fillStyle = 'rgba(56,189,248,0.16)';
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.36, Math.min(w, h) * 0.045, 0, Math.PI * 2);
      ctx.fill();
      // Gently swaying indoor office greenery leaves on bottom-left & right
      for (const px of [0.1, 0.9]) {
        const baseX = w * px;
        const sway = Math.sin(t * 0.8 + px * 10) * 6;
        ctx.fillStyle = 'rgba(16,185,129,0.24)';
        for (let leaf = -2; leaf <= 2; leaf++) {
          ctx.save();
          ctx.translate(baseX, h * 0.88);
          ctx.rotate(leaf * 0.32 + sway * 0.01);
          ctx.beginPath();
          ctx.ellipse(0, -48, 12, 42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      // Diagonal soft studio daylight shaft
      const sunGrad = ctx.createLinearGradient(0, 0, w * 0.6, h * 0.72);
      sunGrad.addColorStop(0, 'rgba(186,230,253,0.14)');
      sunGrad.addColorStop(1, 'rgba(186,230,253,0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }

    case 'shopping': {
      // 6. Contemporary Fashion Boutique: rose-gold display pedestals, sweeping runway spotlights, hanger silhouettes
      fillSkyGradient(ctx, w, h, '#200f2c', '#3b1847', '#1c1736');
      ctx.save();
      // Sleek illuminated fashion display niches & golden rails
      ctx.strokeStyle = 'rgba(251,207,232,0.22)';
      ctx.lineWidth = 2;
      for (const rx of [0.06, 0.78]) {
        ctx.beginPath();
        ctx.roundRect(w * rx, h * 0.2, w * 0.16, h * 0.56, 14);
        ctx.stroke();
        // Horizontal clothing rail
        ctx.beginPath();
        ctx.moveTo(w * (rx + 0.02), h * 0.36);
        ctx.lineTo(w * (rx + 0.14), h * 0.36);
        ctx.stroke();
        // Minimal geometric hanger items
        for (let k = 0; k < 3; k++) {
          const hx = w * (rx + 0.045 + k * 0.035);
          ctx.fillStyle = k % 2 === 0 ? 'rgba(244,114,182,0.22)' : 'rgba(253,224,71,0.18)';
          ctx.beginPath();
          ctx.roundRect(hx - 8, h * 0.38, 16, h * 0.14, 4);
          ctx.fill();
        }
      }
      // Sweeping boutique spotlights
      for (let i = 0; i < 3; i++) {
        const sx = w * (0.22 + i * 0.28);
        const sway = Math.sin(t * 0.65 + i * 1.9) * w * 0.08;
        const grad = ctx.createLinearGradient(sx, 0, sx + sway, h * 0.85);
        grad.addColorStop(0, 'rgba(244,114,182,0.2)');
        grad.addColorStop(1, 'rgba(244,114,182,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx - 22, 0);
        ctx.lineTo(sx + 22, 0);
        ctx.lineTo(sx + sway + 125, h * 0.85);
        ctx.lineTo(sx + sway - 125, h * 0.85);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 14, ['#f472b6', '#fde047', '#c084fc'], 0.22);
      break;
    }

    case 'new-friends': {
      // 7. Sunset Outdoor Terrace & Festival Lantern Lounge: coral-violet twilight sky, swaying palm fronds, glowing lanterns (NO skyline!)
      fillSkyGradient(ctx, w, h, '#1b1438', '#4c2659', '#9c4355');
      drawTwinklingStars(ctx, w, h, t, 28, 0.42);
      ctx.save();
      // Gently swaying palm fronds framing left & right edges
      for (const side of [0, 1]) {
        const ox = side === 0 ? 0 : w;
        const dir = side === 0 ? 1 : -1;
        ctx.fillStyle = 'rgba(15,10,30,0.52)';
        for (let f = 0; f < 4; f++) {
          const angle = (0.15 + f * 0.24) * dir + Math.sin(t * 0.9 + f) * 0.03;
          ctx.save();
          ctx.translate(ox, h * 0.22);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(dir * 75, 0, 82, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      // Floating glowing paper lanterns drifting upward
      for (let i = 0; i < 8; i++) {
        const lx = w * (0.1 + i * 0.115) + Math.sin(t * 0.7 + i * 1.4) * 18;
        const ly = (1.1 - ((t * (0.03 + (i % 3) * 0.01) + i * 0.16) % 1.25)) * h;
        const lg = ctx.createRadialGradient(lx, ly, 2, lx, ly, 24);
        lg.addColorStop(0, 'rgba(254,240,138,0.92)');
        lg.addColorStop(0.5, 'rgba(251,146,60,0.42)');
        lg.addColorStop(1, 'rgba(251,146,60,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(lx, ly, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(254,215,170,0.85)';
        ctx.beginPath();
        ctx.roundRect(lx - 7, ly - 9, 14, 18, 4);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'business': {
      // 8. Global Tech & Executive Strategy Studio: deep teal-navy isometric grid floor, animated trend bars & orbiting globe wireframe
      fillSkyGradient(ctx, w, h, '#061221', '#0b2238', '#091829');
      ctx.save();
      // Subtle isometric perspective grid near bottom
      ctx.strokeStyle = 'rgba(56,189,248,0.12)';
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + i * 45, h * 0.64);
        ctx.lineTo(w * 0.5 + i * 135, h);
        ctx.stroke();
      }
      for (let r = 0; r < 5; r++) {
        const y = h * (0.68 + r * 0.075);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // Subtle animated strategy bar chart on left
      for (let b = 0; b < 5; b++) {
        const bh = (34 + b * 14 + Math.sin(t * 1.4 + b) * 12) * (h / 640);
        ctx.fillStyle = b === 4 ? 'rgba(16,185,129,0.28)' : 'rgba(56,189,248,0.18)';
        ctx.beginPath();
        ctx.roundRect(w * (0.07 + b * 0.032), h * 0.62 - bh, w * 0.02, bh, 4);
        ctx.fill();
      }
      // Rotating wireframe globe motif on right
      const gx = w * 0.84;
      const gy = h * 0.36;
      const gr = Math.min(w, h) * 0.13;
      ctx.strokeStyle = 'rgba(56,189,248,0.22)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.stroke();
      for (let m = 0; m < 3; m++) {
        const rx = Math.abs(Math.cos(t * 0.35 + m * 1.05)) * gr;
        ctx.beginPath();
        ctx.ellipse(gx, gy, Math.max(4, rx), gr, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(gx, gy, gr, gr * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Rising trend curve pulsing subtly with voice
      ctx.strokeStyle = 'rgba(52,211,153,0.34)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 24) {
        const y = h * 0.54 - (x / w) * h * 0.12 + Math.sin(x * 0.008 + t * 0.9) * (12 + voiceEnergy * 14);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'cambridge': {
      // 9. Classic University Library Hall: rich mahogany bookshelves with book spines on sides, warm sunlit vaulted beams & emerald banker's lamps
      fillSkyGradient(ctx, w, h, '#14111b', '#261c22', '#191418');
      ctx.save();
      // Left and right classic library bookshelves with book-spine texture
      for (const side of [0, 1]) {
        const sx = side === 0 ? 0 : w * 0.8;
        const sw = w * 0.2;
        ctx.fillStyle = 'rgba(42,24,18,0.72)';
        ctx.fillRect(sx, h * 0.12, sw, h * 0.82);
        for (let shelf = 0; shelf < 5; shelf++) {
          const sy = h * (0.24 + shelf * 0.14);
          ctx.fillStyle = 'rgba(120,70,40,0.45)';
          ctx.fillRect(sx, sy, sw, 5);
          // Colorful muted book spines
          for (let bk = 0; bk < 8; bk++) {
            const bkx = sx + 8 + bk * ((sw - 16) / 8);
            const bkh = 28 + ((bk * 13 + shelf * 7) % 18);
            ctx.fillStyle = [
              'rgba(180,83,9,0.42)',
              'rgba(16,185,129,0.28)',
              'rgba(59,130,246,0.3)',
              'rgba(190,18,60,0.34)',
            ][(bk + shelf) % 4];
            ctx.fillRect(bkx, sy - bkh, (sw - 26) / 9, bkh);
          }
        }
      }
      // Diagonal warm library sunlight shafts
      for (let i = 0; i < 3; i++) {
        const bx = w * (0.22 + i * 0.22) + Math.sin(t * 0.18 + i) * 14;
        const g = ctx.createLinearGradient(bx, 0, bx + 150, h);
        g.addColorStop(0, 'rgba(253,230,138,0.13)');
        g.addColorStop(1, 'rgba(253,230,138,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx + 76, 0);
        ctx.lineTo(bx + 230, h);
        ctx.lineTo(bx + 135, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 10, ['#fde68a', '#34d399'], 0.1);
      break;
    }

    case 'pop-culture': {
      // 10. Cinema & Vinyl Music Lounge: marquee bulbs along sides, spinning vinyl grooves, floating music notes & voice-reactive rings
      fillSkyGradient(ctx, w, h, '#140624', '#2c0d4d', '#0b1938');
      ctx.save();
      // Slowly spinning vinyl record peeking from top-right
      const vx = w * 0.84;
      const vy = h * 0.28;
      const vr = Math.min(w, h) * 0.15;
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(t * 0.6);
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, vr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(236,72,153,0.32)';
      ctx.lineWidth = 1.4;
      for (let g = 0.45; g <= 0.9; g += 0.14) {
        ctx.beginPath();
        ctx.arc(0, 0, vr * g, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, 0, vr * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Retro theater marquee chase bulbs on left vertical strip
      for (let b = 0; b < 9; b++) {
        const by = h * (0.14 + b * 0.085);
        const lit = Math.sin(t * 4.5 - b * 0.8) > 0;
        ctx.fillStyle = lit ? 'rgba(253,224,71,0.85)' : 'rgba(253,224,71,0.2)';
        ctx.beginPath();
        ctx.arc(w * 0.05, by, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Voice-reactive neon soundwave rings
      for (let i = 0; i < 4; i++) {
        const r = ((t * 50 + i * 95) % (Math.max(w, h) * 0.5)) + 52;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(236,72,153,0.2)' : 'rgba(56,189,248,0.2)';
        ctx.lineWidth = 2.4 + voiceEnergy * 3.2;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.48, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 12, ['#ec4899', '#38bdf8', '#a855f7'], 0.28);
      break;
    }

    case 'health-doctor': {
      // 11. Serene Botanical Wellness Clinic: eucalyptus/teal light, calm animated heartbeat/breath pulse line, floating botanical leaves
      fillSkyGradient(ctx, w, h, '#062026', '#0d3d47', '#0a2933');
      ctx.save();
      // Subtle clean medical cross watermark emblem on top-right
      const cx = w * 0.84;
      const cy = h * 0.24;
      ctx.fillStyle = 'rgba(94,234,212,0.14)';
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy - 30, 20, 60, 5);
      ctx.roundRect(cx - 30, cy - 10, 60, 20, 5);
      ctx.fill();

      // Smooth calming wellness heartbeat / breathing wave across mid-frame
      ctx.strokeStyle = 'rgba(94,234,212,0.36)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const pulseCenter = ((t * 0.22) % 1.2) - 0.1;
      for (let x = 0; x <= w; x += 6) {
        const u = x / w;
        const dist = u - pulseCenter;
        let spike = 0;
        if (Math.abs(dist) < 0.05) {
          spike = Math.sin((dist / 0.05) * Math.PI * 2) * Math.exp(-Math.pow(dist / 0.025, 2)) * 34;
        }
        const y = h * 0.68 - spike + Math.sin(x * 0.008 + t) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Gently drifting translucent eucalyptus leaves
      for (let i = 0; i < 8; i++) {
        const lx = (((i * 0.14 + t * 0.016) % 1.15) - 0.07) * w;
        const ly = h * (0.2 + (i % 4) * 0.17) + Math.sin(t * 1.2 + i) * 14;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(Math.sin(t * 0.7 + i) * 0.4 + 0.5);
        ctx.fillStyle = 'rgba(153,246,228,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 10, ['#2dd4bf', '#67e8f9', '#a7f3d0'], 0.14);
      break;
    }

    case 'sports-hobbies': {
      // 12. Floodlit Night Sports Stadium & Gaming Arena: stadium floodlight towers, sweeping arena beams, glowing field arcs
      fillSkyGradient(ctx, w, h, '#051524', '#0f3047', '#08332c');
      ctx.save();
      // Stadium bowl arc & crisp white pitch midfield circle at bottom
      ctx.strokeStyle = 'rgba(52,211,153,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.94, w * 0.46, h * 0.16, 0, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.94, w * 0.14, h * 0.055, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Twin stadium floodlight towers + sweeping stadium beams
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? w * 0.08 : w * 0.92;
        const targetX = w * 0.5 + Math.sin(t * 0.8 + i * 2.5) * w * 0.2;
        const g = ctx.createLinearGradient(side, h * 0.12, targetX, h);
        g.addColorStop(0, 'rgba(224,242,254,0.28)');
        g.addColorStop(0.45, 'rgba(52,211,153,0.14)');
        g.addColorStop(1, 'rgba(52,211,153,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(side - 16, h * 0.12);
        ctx.lineTo(side + 16, h * 0.12);
        ctx.lineTo(targetX + 130, h);
        ctx.lineTo(targetX - 130, h);
        ctx.closePath();
        ctx.fill();
        // Floodlight bank glow
        ctx.fillStyle = 'rgba(240,249,255,0.85)';
        ctx.beginPath();
        ctx.roundRect(side - 18, h * 0.1, 36, 12, 4);
        ctx.fill();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 12, ['#34d399', '#38bdf8', '#fde047'], 0.3);
      break;
    }

    // =========================================================================
    // 9 DISTINCT KIDS (5–9 AÑOS) PLAYFUL ANIMATED WORLDS
    // =========================================================================

    case 'kids-animals': {
      // 13. Sunny Safari & Pet Park: warm golden meadow, wooden ranch fence, safari acacia trees, fluttering butterflies & paw prints
      fillSkyGradient(ctx, w, h, '#0284c7', '#38bdf8', '#fef08a');
      drawDriftingClouds(ctx, w, h, t, 4, 'rgba(255,255,255,0.52)', [0.09, 0.28]);
      ctx.save();
      // Warm sunny meadow ground
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 24) {
        ctx.lineTo(x, h * 0.76 + Math.sin(x * 0.005 + t * 0.12) * 14);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      // Cute wooden park fence along horizon
      ctx.fillStyle = 'rgba(180,83,9,0.55)';
      ctx.fillRect(0, h * 0.76, w, 5);
      ctx.fillRect(0, h * 0.81, w, 5);
      for (let px = 24; px < w; px += 72) {
        ctx.fillRect(px, h * 0.73, 8, 36);
      }
      // Subtle floating playful paw prints
      for (let p = 0; p < 4; p++) {
        const px = w * (0.14 + p * 0.24);
        const py = h * (0.36 + (p % 2) * 0.14) + Math.sin(t * 1.4 + p) * 8;
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.arc(px - 10, py - 10, 4, 0, Math.PI * 2);
        ctx.arc(px, py - 14, 4, 0, Math.PI * 2);
        ctx.arc(px + 10, py - 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Fluttering butterflies
      for (let i = 0; i < 6; i++) {
        const bx = (((i * 0.2 + t * (0.045 + (i % 3) * 0.01)) % 1.2) - 0.1) * w;
        const by = h * (0.28 + (i % 3) * 0.15) + Math.sin(t * 3.5 + i * 2) * 18;
        const flap = Math.abs(Math.sin(t * 9 + i));
        ctx.fillStyle = ['#fde047', '#f472b6', '#fb923c', '#a855f7'][i % 4];
        ctx.beginPath();
        ctx.ellipse(bx - 5, by, 7 * flap + 2, 5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(bx + 5, by, 7 * flap + 2, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'kids-colors-numbers': {
      // 14. Rainbow Art Studio & Balloon Sky: vivid rainbow arc, rising colorful balloons, floating geometric shapes (stars, triangles, circles)
      fillSkyGradient(ctx, w, h, '#1e3a8a', '#3b82f6', '#7dd3fc');
      ctx.save();
      const rainbow = ['#fb7185', '#fb923c', '#fde047', '#4ade80', '#38bdf8', '#a78bfa'];
      const rBase = Math.min(w, h) * 0.68;
      for (let i = 0; i < rainbow.length; i++) {
        ctx.strokeStyle = rainbow[i];
        ctx.globalAlpha = 0.34;
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.88, rBase - i * 12, Math.PI, 0);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Floating geometric shapes (triangles & circles)
      for (let s = 0; s < 6; s++) {
        const sx = w * (0.1 + s * 0.16);
        const sy = h * (0.24 + (s % 2) * 0.32) + Math.sin(t * 1.5 + s) * 12;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(t * 0.4 + s);
        ctx.strokeStyle = rainbow[s % rainbow.length];
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = 3;
        if (s % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(13, 11);
          ctx.lineTo(-13, 11);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.strokeRect(-11, -11, 22, 22);
        }
        ctx.restore();
      }
      // Gently rising balloons
      for (let i = 0; i < 8; i++) {
        const bx = w * (0.1 + i * 0.115) + Math.sin(t * 1.2 + i) * 14;
        const by = (1.15 - ((t * (0.055 + (i % 3) * 0.015) + i * 0.17) % 1.3)) * h;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = rainbow[i % rainbow.length];
        ctx.beginPath();
        ctx.ellipse(bx, by, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx, by + 18);
        ctx.quadraticCurveTo(bx + Math.sin(t * 3 + i) * 6, by + 34, bx, by + 46);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'kids-family': {
      // 15. Cozy Family Living Room & Sunny Window: warm coral/amber home wall, sunlit framed window, picture frames, floating warm hearts!
      fillSkyGradient(ctx, w, h, '#7c2d12', '#c2410c', '#fb923c');
      ctx.save();
      // Subtle cozy wallpaper dots
      ctx.fillStyle = 'rgba(255,237,213,0.08)';
      for (let x = 28; x < w; x += 56) {
        for (let y = 28; y < h; y += 56) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Sunny family home window on left with blue sky & clouds inside
      const winX = w * 0.06;
      const winY = h * 0.22;
      const winW = w * 0.18;
      const winH = h * 0.34;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(winX, winY, winW, winH, 10);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(winX + winW * 0.45 + Math.sin(t * 0.6) * 8, winY + winH * 0.45, 16, 0, Math.PI * 2);
      ctx.arc(winX + winW * 0.62 + Math.sin(t * 0.6) * 8, winY + winH * 0.48, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 5;
      ctx.strokeRect(winX, winY, winW, winH);
      ctx.beginPath();
      ctx.moveTo(winX + winW * 0.5, winY);
      ctx.lineTo(winX + winW * 0.5, winY + winH);
      ctx.moveTo(winX, winY + winH * 0.5);
      ctx.lineTo(winX + winW, winY + winH * 0.5);
      ctx.stroke();

      // Framed family photos on right wall
      ctx.fillStyle = 'rgba(254,243,199,0.22)';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 3;
      ctx.strokeRect(w * 0.78, h * 0.24, w * 0.11, h * 0.18);
      ctx.fillRect(w * 0.78, h * 0.24, w * 0.11, h * 0.18);
      ctx.strokeRect(w * 0.84, h * 0.46, w * 0.09, h * 0.15);
      ctx.fillRect(w * 0.84, h * 0.46, w * 0.09, h * 0.15);

      // Gently floating warm hearts
      for (let i = 0; i < 7; i++) {
        const hx = w * (0.12 + i * 0.13) + Math.sin(t + i * 1.7) * 14;
        const hy = (1.08 - ((t * 0.04 + i * 0.18) % 1.2)) * h;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(254,205,211,0.52)' : 'rgba(254,240,138,0.45)';
        ctx.beginPath();
        ctx.arc(hx - 5, hy, 5.5, 0, Math.PI * 2);
        ctx.arc(hx + 5, hy, 5.5, 0, Math.PI * 2);
        ctx.moveTo(hx - 10.2, hy + 2);
        ctx.lineTo(hx, hy + 13);
        ctx.lineTo(hx + 10.2, hy + 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'kids-superheroes': {
      // 16. Comic-Book Hero Sky: vibrant cobalt sky, rotating comic action starburst behind the Dot, golden lightning bolts & rushing clouds
      fillSkyGradient(ctx, w, h, '#0b1540', '#1d4ed8', '#0284c7');
      ctx.save();
      // Rotating comic-book radial action burst beams
      ctx.translate(w * 0.5, h * 0.48);
      ctx.rotate(t * 0.12);
      const rays = 14;
      for (let i = 0; i < rays; i++) {
        const a0 = (i * Math.PI * 2) / rays;
        const a1 = a0 + Math.PI / rays * 0.45;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(253,224,71,0.09)' : 'rgba(56,189,248,0.08)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(w, h), a0, a1);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      // Golden comic lightning bolts on sides
      ctx.save();
      for (const [lx, ly] of [
        [w * 0.14, h * 0.3],
        [w * 0.86, h * 0.34],
      ]) {
        const pulse = 0.75 + 0.25 * Math.sin(t * 5 + lx);
        ctx.fillStyle = `rgba(253,224,71,${0.55 * pulse})`;
        ctx.beginPath();
        ctx.moveTo(lx + 6, ly - 28);
        ctx.lineTo(lx - 14, ly + 2);
        ctx.lineTo(lx, ly + 2);
        ctx.lineTo(lx - 8, ly + 30);
        ctx.lineTo(lx + 16, ly - 4);
        ctx.lineTo(lx + 2, ly - 4);
        ctx.closePath();
        ctx.fill();
      }
      // Hero speed streaks
      for (let i = 0; i < 8; i++) {
        const sx = (((t * 0.58 + i * 0.21) % 1.4) - 0.2) * w;
        const sy = h * (0.14 + (i * 0.095) % 0.72);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(253,224,71,0.42)' : 'rgba(186,230,253,0.35)';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 74, sy);
        ctx.stroke();
      }
      ctx.restore();
      drawDriftingClouds(ctx, w, h, t * 2.1, 4, 'rgba(255,255,255,0.24)', [0.64, 0.9]);
      break;
    }

    case 'kids-food': {
      // 17. Candy & Ice-Cream Parlor: cheerful pink-berry gradient, striped shop awning, floating sprinkles & cute pastel donut/ice-cream icons
      fillSkyGradient(ctx, w, h, '#581c87', '#db2777', '#fb923c');
      ctx.save();
      const stripes = 14;
      const sw = w / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(253,224,71,0.18)';
        ctx.beginPath();
        ctx.moveTo(i * sw, 0);
        ctx.lineTo((i + 1) * sw, 0);
        ctx.lineTo((i + 1) * sw, h * 0.09);
        ctx.arc(i * sw + sw * 0.5, h * 0.09, sw * 0.5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
      }
      // Floating sprinkles
      for (let i = 0; i < 18; i++) {
        const sx = (((i * 0.071 + Math.sin(t * 0.5 + i) * 0.03) + 1) % 1) * w;
        const sy = (((i * 0.13 + t * 0.04) % 1.1) - 0.05) * h;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(t * 0.7 + i);
        ctx.fillStyle = ['#fde047', '#67e8f9', '#fda4af', '#a7f3d0'][i % 4];
        ctx.globalAlpha = 0.68;
        ctx.beginPath();
        ctx.roundRect(-6, -2.5, 12, 5, 2.5);
        ctx.fill();
        ctx.restore();
      }
      // Subtle floating donut rings on left & right
      for (const [dx, dy, col] of [
        [w * 0.14, h * 0.42, '#fda4af'],
        [w * 0.86, h * 0.36, '#67e8f9'],
      ] as const) {
        const bob = Math.sin(t * 1.4 + dx) * 8;
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(dx, dy + bob, 20, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 14, ['#fde047', '#f472b6', '#67e8f9', '#86efac'], 0.22);
      break;
    }

    case 'kids-school-toys': {
      // 18. Playful Classroom Chalkboard & Toy Workshop: rich chalkboard green, chalk doodles (ABC/stars), wooden blocks & gliding paper airplanes
      fillSkyGradient(ctx, w, h, '#0f3d3e', '#115e59', '#134e4a');
      ctx.save();
      // Subtle wooden chalkboard tray along bottom
      ctx.fillStyle = 'rgba(180,83,9,0.52)';
      ctx.fillRect(0, h * 0.88, w, h * 0.12);
      // Friendly chalk grid & corner doodles ("A B C", "1 2 3", stars)
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.font = '700 28px Outfit, sans-serif';
      ctx.fillText('A B C', w * 0.07, h * 0.28);
      ctx.fillText('1 2 3', w * 0.82, h * 0.3);
      ctx.strokeStyle = 'rgba(253,224,71,0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.06, h * 0.62, 34, 34);
      ctx.strokeStyle = 'rgba(103,232,249,0.28)';
      ctx.strokeRect(w * 0.095, h * 0.56, 30, 30);

      // Gliding white paper airplanes
      for (let i = 0; i < 3; i++) {
        const px = (((t * (0.075 + i * 0.02) + i * 0.35) % 1.3) - 0.15) * w;
        const py = h * (0.22 + i * 0.2) + Math.sin(t * 2 + i) * 20;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.cos(t * 2 + i) * 0.12);
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-14, -10);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-14, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 10, ['#fde047', '#67e8f9', '#fda4af'], 0.16);
      break;
    }

    case 'kids-space-dinos': {
      // 19. Outer Space Galaxy & Rocket Adventure: deep cosmic starfield, ringed Saturn, flying rocket with flame, shooting star
      fillSkyGradient(ctx, w, h, '#05081a', '#1e1b4b', '#312e81');
      drawTwinklingStars(ctx, w, h, t, 68, 0.92);
      ctx.save();
      // Slowly bobbing ringed pastel planet
      const px = w * 0.8;
      const py = h * 0.25 + Math.sin(t * 0.8) * 8;
      const pr = Math.min(w, h) * 0.075;
      const pg = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 4, px, py, pr);
      pg.addColorStop(0, '#fde68a');
      pg.addColorStop(0.6, '#fb923c');
      pg.addColorStop(1, '#9a3412');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125,211,252,0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(px, py, pr * 1.75, pr * 0.42, -0.25, 0, Math.PI * 2);
      ctx.stroke();

      // Cute flying rocket on left ascending gently
      const rx = w * 0.16 + Math.sin(t * 0.9) * 14;
      const ry = h * 0.56 + Math.cos(t * 1.1) * 18;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(-0.45);
      // Flame
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(-7, 18);
      ctx.lineTo(7, 18);
      ctx.lineTo(0, 32 + Math.sin(t * 18) * 5);
      ctx.closePath();
      ctx.fill();
      // Rocket hull
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-9, -8);
      ctx.lineTo(0, -24);
      ctx.lineTo(9, -8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shooting star
      const shootPhase = (t * 0.35) % 1;
      if (shootPhase < 0.22) {
        const p = shootPhase / 0.22;
        const sx = w * (0.1 + p * 0.45);
        const sy = h * (0.12 + p * 0.22);
        const sg = ctx.createLinearGradient(sx - 75, sy - 35, sx, sy);
        sg.addColorStop(0, 'rgba(255,255,255,0)');
        sg.addColorStop(1, 'rgba(253,224,71,0.95)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx - 75, sy - 35);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'kids-routine': {
      // 20. Day-to-Night Fun Routine Sky: horizontal sunrise-gold (left) transitioning to dreamy twilight-lavender (right) with rotating sun & crescent moon!
      const dg = ctx.createLinearGradient(0, 0, w, 0);
      dg.addColorStop(0, '#f59e0b');
      dg.addColorStop(0.32, '#38bdf8');
      dg.addColorStop(0.68, '#6366f1');
      dg.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = dg;
      ctx.fillRect(0, 0, w, h);

      // Rotating cheerful morning sun on left
      ctx.save();
      ctx.translate(w * 0.15, h * 0.24);
      ctx.rotate(t * 0.24);
      ctx.strokeStyle = 'rgba(254,240,138,0.6)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32);
        ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
        ctx.stroke();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Glowing bedtime crescent moon & stars on right
      ctx.save();
      const mx = w * 0.85;
      const my = h * 0.24 + Math.sin(t * 0.9) * 5;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(mx, my, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2b2768';
      ctx.beginPath();
      ctx.arc(mx + 10, my - 5, 21, 0, Math.PI * 2);
      ctx.fill();
      for (let s = 0; s < 14; s++) {
        const sx = w * (0.62 + ((s * 0.083) % 0.35));
        const sy = h * (0.12 + ((s * 0.17) % 0.55));
        ctx.fillStyle = '#fef9c3';
        ctx.globalAlpha = 0.4 + 0.55 * Math.sin(t * 2.5 + s);
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      drawDriftingClouds(ctx, w, h, t, 4, 'rgba(255,255,255,0.34)', [0.55, 0.82]);
      break;
    }

    case 'kids-stories': {
      // 21. Enchanted Fairy-Tale Castle & Glowing Pine Forest: twilight aurora, tall pine trees, sparkling storybook castle & golden fireflies
      fillSkyGradient(ctx, w, h, '#0f172a', '#3b0764', '#164e63');
      drawTwinklingStars(ctx, w, h, t, 48, 0.68);
      ctx.save();
      // Fairy-tale castle silhouette on right hill
      const cx = w * 0.82;
      const cy = h * 0.74;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(cx - 34, cy - 36, 68, 52);
      ctx.fillRect(cx - 44, cy - 54, 16, 70);
      ctx.fillRect(cx + 28, cy - 54, 16, 70);
      ctx.fillRect(cx - 10, cy - 76, 20, 92);
      ctx.fillStyle = '#7e22ce';
      for (const [tx, ty, tw] of [
        [cx - 36, cy - 54, 22],
        [cx + 36, cy - 54, 22],
        [cx, cy - 76, 28],
      ]) {
        ctx.beginPath();
        ctx.moveTo(tx - tw * 0.55, ty);
        ctx.lineTo(tx, ty - 26);
        ctx.lineTo(tx + tw * 0.55, ty);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 4, cy - 56, 8, 12);
      ctx.fillRect(cx - 40, cy - 36, 7, 10);
      ctx.fillRect(cx + 33, cy - 36, 7, 10);

      // Enchanted tall pine trees on left
      ctx.fillStyle = '#0f293a';
      for (const [tx, scale] of [
        [w * 0.08, 1.0],
        [w * 0.16, 0.82],
        [w * 0.23, 0.65],
      ]) {
        const ty = h * 0.82;
        ctx.beginPath();
        ctx.moveTo(tx, ty - 95 * scale);
        ctx.lineTo(tx + 30 * scale, ty);
        ctx.lineTo(tx - 30 * scale, ty);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      drawBokehOrbs(ctx, w, h, t, 20, ['#fde047', '#34d399', '#e879f9'], 0.22, 0.18, 0.86);
      break;
    }

    default: {
      fillSkyGradient(ctx, w, h, '#0c1222', '#1d253d', '#281d22');
      drawBokehOrbs(ctx, w, h, t, 12, ['#60a5fa', '#fbbf24'], 0.16);
      break;
    }
  }

  // Soft studio edge vignette (softer in Light Mode so the scene feels bright and airy)
  ctx.save();
  const vig = ctx.createRadialGradient(
    w * 0.5,
    h * 0.48,
    Math.min(w, h) * 0.22,
    w * 0.5,
    h * 0.48,
    Math.max(w, h) * 0.74
  );
  vig.addColorStop(0, isLightTheme ? 'rgba(15,23,42,0.01)' : 'rgba(7,11,22,0.04)');
  vig.addColorStop(1, isLightTheme ? 'rgba(15,23,42,0.28)' : 'rgba(7,11,22,0.52)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
