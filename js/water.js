// =========================================
//  ÁGUA DO COPO (canvas)
//  - nível real: a altura da água acompanha a porcentagem
//  - a cada aumento cai uma gota, que gera ondulação, respingos e bolhas
//  - o nível sobe com uma mola (leve balanço ao chegar)
// =========================================

const TAU = Math.PI * 2;
const PAD = 14; // folga acima/abaixo para as ondas não aparecerem com o copo vazio/cheio

const REDUCE = typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

let canvas = null, ctx = null;
let W = 0, H = 0, dpr = 1;
let raf = 0, last = 0, time = 0;

let level = 0, vel = 0, target = 0;     // 0..1
let energy = 0, sloshDir = 1;           // energia das ondas (decai sozinha)
let seeded = false;

const drops = [], ripples = [], splashes = [], bubbles = [];

const LAYERS = [
  { k: 0.8,  wl: 1.05, sp: 1.5,  ph: 0.0, top: "rgba(120,225,255,.38)", bot: "rgba(0,150,225,.38)" },
  { k: 1.0,  wl: 0.78, sp: -2.0, ph: 2.1, top: "rgba(60,205,255,.60)",  bot: "rgba(0,125,215,.62)" },
  { k: 1.15, wl: 0.62, sp: 2.5,  ph: 4.2, top: "#3fd3ff", mid: "#12aef2", bot: "#0072c4", front: true }
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- API ---------- */

let resizeObserver = null; // ✅ NOVO: Variável para observar o tamanho

export function initWater(el) {
  if (!el || canvas === el) return;          // idempotente
  canvas = el;
  ctx = canvas.getContext("2d");
  resize();
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);

  // ✅ CORREÇÃO: Usa ResizeObserver para atualizar o tamanho apenas quando necessário
  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas);

}
// p: 0..1. Chame sempre que o nível mudar (chamadas repetidas com o mesmo valor são ignoradas).
export function setWaterLevel(p) {
  p = clamp(p, 0, 1);

  if (!seeded) {                              // primeira vez: a água sobe suave desde o fundo
    seeded = true;
    target = p;
    if (REDUCE) { level = p; vel = 0; }
    else energy = 0.5;
    return;
  }

  const pending = drops.length ? drops[drops.length - 1].target : target;
  if (Math.abs(p - pending) < 1e-6) return;

  if (REDUCE) { drops.length = 0; level = target = p; vel = 0; return; }

  if (p > pending) {
    // aumento: solta uma gota; o nível só sobe quando ela encosta na água
    drops.push({ x: W * (0.36 + Math.random() * 0.28), y: -8, vy: 0, target: p });
  } else {
    // diminuição (meta alterada, novo dia): desce direto, sem gota
    drops.length = 0;
    target = p;
    energy = Math.max(energy, 0.3);
  }
}

/* ---------- geometria ---------- */

function resize() {
  if (!canvas) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  W = w; H = h;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function baseY() {
  return (H + PAD) - clamp(level, 0, 1.02) * (H + PAD * 2);
}

function surfaceY(x, L, base) {
  const amp = (1.8 + energy * 7.5) * L.k;
  const k1 = TAU / (W * L.wl);
  let y = base
    + Math.sin(x * k1 + time * L.sp + L.ph) * amp
    + Math.sin(x * k1 * 2.1 - time * L.sp * 1.3 + L.ph * 2) * amp * 0.35;

  // balanço de um lado para o outro logo depois de uma gota
  y += Math.sin(time * 5.5) * energy * sloshDir * (x / W - 0.5) * 16 * L.k;

  // ondas circulares do ponto onde a gota caiu
  for (const r of ripples) {
    const a = 4.2 * Math.exp(-r.age * 1.7);
    const u = Math.abs(x - r.x) - r.age * 95;
    y -= a * Math.cos(u * 0.19) * Math.exp(-(u * u) / 1352) * L.k;
  }
  return y;
}

/* ---------- efeitos ---------- */

function impact(d, base) {
  target = d.target;
  energy = Math.min(1.3, energy + 0.7);
  sloshDir = Math.random() < 0.5 ? -1 : 1;
  ripples.push({ x: d.x, age: 0 });

  for (let i = 0; i < 7; i++) {               // respingos
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
    const sp = 70 + Math.random() * 110;
    splashes.push({
      x: d.x, y: base,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
      r: 1 + Math.random() * 1.8, life: 0
    });
  }
  for (let i = 0; i < 8; i++) spawnBubble(d.x + (Math.random() - 0.5) * 26, base + 6 + Math.random() * 14);
}

function spawnBubble(x, y) {
  bubbles.push({
    x, y,
    r: 1.2 + Math.random() * 2.6,
    vy: 18 + Math.random() * 30,
    ph: Math.random() * TAU,
    sw: 4 + Math.random() * 6
  });
}

/* ---------- loop ---------- */

function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!canvas || !canvas.isConnected) return;
  
  if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;

  if (!W || !H) return;

  update(dt);
  draw();
}

function update(dt) {
  if (!REDUCE) time += dt * (1 + energy * 1.4);

  // mola do nível (leve overshoot, dá o "balanço" de água chegando)
  vel += ((target - level) * 38 - vel * 8.5) * dt;
  level += vel * dt;
  energy *= Math.exp(-dt * 1.5);

  const base = baseY();

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.vy += 1500 * dt;
    d.y += d.vy * dt;
    if (d.y >= Math.min(base, H * 0.85)) { impact(d, Math.min(base, H * 0.85)); drops.splice(i, 1); }
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].age += dt;
    if (ripples[i].age > 2.2) ripples.splice(i, 1);
  }

  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    s.vy += 600 * dt;
    s.x += s.vx * dt; s.y += s.vy * dt; s.life += dt;
    if (s.life > 0.8 || s.y > base + 4) splashes.splice(i, 1);
  }

  if (level > 0.06 && bubbles.length < 10 && Math.random() < dt * 1.3) {
    spawnBubble(10 + Math.random() * (W - 20), H - 4);
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.y -= b.vy * dt;
    b.x += Math.sin(time * 3 + b.ph) * b.sw * dt;
    if (b.y < base + b.r + 4) bubbles.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const base = baseY();
  if (base > H + PAD - 1 && !drops.length && !splashes.length) { drawDrops(); return; }

  for (const L of LAYERS) {
    const ys = [];
    for (let x = 0; x <= W + 3; x += 3) ys.push(surfaceY(Math.min(x, W), L, base));

    ctx.beginPath();
    ctx.moveTo(0, ys[0]);
    for (let i = 1; i < ys.length; i++) ctx.lineTo(Math.min(i * 3, W), ys[i]);
    ctx.lineTo(W, H + 2);
    ctx.lineTo(0, H + 2);
    ctx.closePath();

    const g = ctx.createLinearGradient(0, base - 12, 0, H);
    g.addColorStop(0, L.top);
    if (L.mid) g.addColorStop(0.45, L.mid);
    g.addColorStop(1, L.bot);
    ctx.fillStyle = g;
    ctx.fill();

    if (L.front) {                             // brilho na linha da superfície
      ctx.beginPath();
      ctx.moveTo(0, ys[0]);
      for (let i = 1; i < ys.length; i++) ctx.lineTo(Math.min(i * 3, W), ys[i]);
      ctx.strokeStyle = "rgba(255,255,255,.6)";
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }

  // bolhas
  ctx.lineWidth = 1;
  for (const b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, TAU);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fill();
  }

  // respingos
  for (const s of splashes) {
    ctx.globalAlpha = clamp(1 - s.life / 0.8, 0, 1);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fillStyle = "#9fe6ff";
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawDrops();
}

function drawDrops() {
  for (const d of drops) {
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, 3.6, 5.4, 0, 0, TAU);
    ctx.fillStyle = "#4fd6ff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(d.x - 1, d.y - 1.5, 1.1, 0, TAU);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fill();
  }
}
export function pauseWater() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

export function resumeWater() {
  if (!raf && canvas) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}