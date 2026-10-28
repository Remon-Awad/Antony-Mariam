/* Preloader (ختم الدعوة) + FX */
(() => {
  const body = document.body;
  const pre = document.getElementById('preloader');
  const pct = document.getElementById('pct');
  const count = document.getElementById('count');
  const openBtn = document.getElementById('openBtn');
  const toAr = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

  let ready = false;

  /* Music */
  /* ===== موسيقى رومانسية (Canon in D) متولّدة بالكامل بـ Web Audio — مفيش ملف مطلوب ===== */
  const Music = (() => {
    let ctx, out, bus, timer, next = 0, step = 0, on = false;
    const E = .4167, hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const CH = [[62,66,69],[57,61,64],[59,62,66],[54,57,61],[55,59,62],[62,66,69],[55,59,62],[57,61,64]];
    const BS = [38,33,35,30,31,38,31,33], MEL = [78,76,74,73,71,69,71,73], AP = [0,1,2,3,2,1,2,1];
    const pluck = (m, t, d, g) => [[1, 'triangle', g], [2, 'sine', g * .25]].forEach(([k, ty, gg]) => {
      const o = ctx.createOscillator(), a = ctx.createGain(); o.type = ty; o.frequency.value = hz(m) * k;
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(gg, t + .012); a.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(a); a.connect(bus); o.start(t); o.stop(t + d + .1);
    });
    const pad = (ms, t, d) => ms.forEach((m) => [-6, 6].forEach((dt) => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), a = ctx.createGain();
      o.type = 'sawtooth'; o.detune.value = dt; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = 700;
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(.02, t + 1.2); a.gain.linearRampToValueAtTime(.0001, t + d + .6);
      o.connect(f); f.connect(a); a.connect(bus); o.start(t); o.stop(t + d + .7);
    }));
    const sched = () => {
      while (next < ctx.currentTime + .9) {
        const c = (step >> 3) % 8, i = step & 7, n = CH[c];
        if (i === 0) { pad(n, next, 8 * E); pluck(BS[c] + 12, next, 3, .12); pluck(MEL[c], next, 3.2, .1); }
        pluck([n[0] + 12, n[1] + 12, n[2] + 12, n[0] + 24][AP[i]], next + Math.random() * .012, 1.4, .075);
        next += E; step++;
      }
    };
    const api = {
      isOn: () => on,
      start() {
        if (on) return; on = true;
        if (!ctx) {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
          bus = ctx.createGain(); bus.connect(out);
          const cv = ctx.createConvolver(), len = ctx.sampleRate * 2.8, buf = ctx.createBuffer(2, len, ctx.sampleRate), w = ctx.createGain();
          for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
          cv.buffer = buf; w.gain.value = .6; bus.connect(cv); cv.connect(w); w.connect(out);
        }
        ctx.resume(); out.gain.setTargetAtTime(.85, ctx.currentTime, 1.4);
        next = Math.max(next, ctx.currentTime + .05); clearInterval(timer); timer = setInterval(sched, 200); sched();
      },
      stop() { on = false; clearInterval(timer); if (ctx) { out.gain.setTargetAtTime(0, ctx.currentTime, .25); setTimeout(() => { if (!on) ctx.suspend(); }, 900); } },
      toggle() { on ? api.stop() : api.start(); }
    };
    document.addEventListener('visibilitychange', () => { if (!ctx || !on) return; document.hidden ? ctx.suspend() : ctx.resume(); });
    return api;
  })();
  const mbtn = document.createElement('button');
  mbtn.className = 'music'; mbtn.setAttribute('aria-label', 'Music');
  mbtn.innerHTML = '<i></i><i></i><i></i>';
  mbtn.onclick = () => { Music.toggle(); mbtn.classList.toggle('on', Music.isOn()); };
  document.body.appendChild(mbtn);

  /* Reveal */
  const reveal = () => {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  };

  /* شريط التقدم + Parallax */
  const bar = document.createElement('div');
  bar.className = 'sbar'; document.body.appendChild(bar);
  addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)})`;
    h.style.setProperty('--sy', h.scrollTop);
  }, { passive: true });

  /* Sparkles */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const cv = document.createElement('canvas');
    cv.id = 'fx'; document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); let W, H;
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
    size(); addEventListener('resize', size);
    const mk = (init) => ({
      x: Math.random() * W, y: init ? Math.random() * H : H + 10,
      r: Math.random() * 2 + .8, v: Math.random() * .5 + .2,
      s: Math.random() * 6.28, a: Math.random() * .4 + .25
    });
    const P = Array.from({ length: 28 }, () => mk(true));
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (const q of P) {
        q.y -= q.v; q.s += .01; q.x += Math.sin(q.s) * .4;
        if (q.y < -10) Object.assign(q, mk(false));
        ctx.globalAlpha = q.a * (.6 + .4 * Math.sin(q.s * 3));
        ctx.fillStyle = '#e8c870';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.28); ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  window.WeddingFX = { appReady() { ready = true; }, reveal, music: Music, mbtn };
})();

/* PREMIUM FX — حطه بعد script.js */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* بتلات واقعية: عمق + رفرفة 3D + رياح */
  if (!still) {
    const cv = document.createElement('canvas'); cv.id = 'petals'; document.body.appendChild(cv);
    const c = cv.getContext('2d'); let W, H;
    const fit = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
    fit(); addEventListener('resize', fit);
    const cols = [['#fbe3e7', '#e8a5b3'], ['#f4c6cf', '#d77f93'], ['#fff1f0', '#f0bfc4'], ['#f8e7b4', '#d9b45a']];
    const mk = (init) => { const z = Math.random(); return { x: rnd(0, W), y: init ? rnd(-H, H) : rnd(-60, -20), z, s: 5 + z * 13, v: .35 + z * 1.1, w: rnd(0, 6.28), r: rnd(0, 6.28), vr: rnd(-.025, .025), f: rnd(0, 6.28), fv: rnd(.02, .05), c: cols[(Math.random() * cols.length) | 0], a: .28 + z * .5 }; };
    const P = Array.from({ length: innerWidth < 700 ? 14 : 26 }, () => mk(true)); let t = 0;
    (function loop() {
      t += .01; const gust = Math.sin(t * .7) * .5 + Math.sin(t * .23) * .5;
      c.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y += p.v; p.w += .012 + p.z * .01; p.x += Math.sin(p.w) * .6 * (.4 + p.z) + gust * (.4 + p.z * 1.2); p.r += p.vr + gust * .004; p.f += p.fv;
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) Object.assign(p, mk(false));
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, .35 + .65 * Math.abs(Math.cos(p.f))); c.globalAlpha = p.a;
        const g = c.createLinearGradient(0, 0, 0, p.s * 1.5); g.addColorStop(0, p.c[0]); g.addColorStop(1, p.c[1]); c.fillStyle = g;
        c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = innerWidth < 700 ? 0 : p.z * 6;
        c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(p.s, -p.s * .6, p.s * 1.5, p.s * .5, 0, p.s * 1.5); c.bezierCurveTo(-p.s * 1.5, p.s * .5, -p.s, -p.s * .6, 0, 0); c.fill(); c.restore();
      }
      requestAnimationFrame(loop);
    })();
  }

  /* Tilt 3D للصورة والكروت */
  if (!still && matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('.card,.arch');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
      el.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 10 + 'deg');
    });
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest && e.target.closest('.card,.arch');
      if (el) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    });
  }

  /* شرارات دهبي عند الضغط */
  const burst = (x, y, n = 10, spread = 46) => {
    if (still) return;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i'); d.className = 'burst';
      d.style.left = x + 'px'; d.style.top = y + 'px';
      document.body.appendChild(d);
      const a = rnd(0, 6.28), k = rnd(spread * .4, spread);
      d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * k}px,${Math.sin(a) * k}px) scale(0)`, opacity: 0 }],
        { duration: rnd(500, 900), easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => d.remove();
    }
  };
  document.addEventListener('pointerdown', (e) => burst(e.clientX, e.clientY, 8, 40));

  /* Confetti عند تأكيد الحضور */
  window.Premium = {
    burst,
    confetti() {
      for (let i = 0; i < 7; i++) setTimeout(() => burst(rnd(.15, .85) * innerWidth, rnd(.25, .6) * innerHeight, 16, 110), i * 90);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };
})();

/* ===================== ENVELOPE PRELOADER + THREAD + FIREWORKS ===================== */
/* Envelope preloader (satin ribbon) + scroll thread + fireworks */
(() => {
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pre = $("#wpre"), envelope = $("#envelope"), cvs = $("#ribbon"), ctx = cvs.getContext("2d"), openBtn = $("#open");
const ds = document.body.dataset;
$("#n1").textContent = ds.n1 || "Antony"; $("#n2").textContent = ds.n2 || "Mariam";
let opened = false;
function reveal() {
  if (opened) return; opened = true;
  envelope.classList.add("is-open"); openBtn.tabIndex = -1;
  const FX = window.WeddingFX || {};
  if (FX.music) { FX.music.start(); FX.mbtn && FX.mbtn.classList.add("on"); }   // the first pull is the tap that unlocks sound
  setTimeout(() => {
    document.body.classList.remove("is-loading"); scrollTo(0, 0);
    pre.classList.add("out");
    setTimeout(() => FX.reveal && FX.reveal(), 350);
    setTimeout(() => pre.remove(), 1300);
  }, reduced ? 200 : 1250);
}
let audioCtx = null;

function audio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch (e) {
    audioCtx = null;
  }
  return audioCtx;
}

// short burst of filtered noise with a fast decay
function noise(c, when, dur, hp, gain) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start(when);
}

// fingers taking hold of the satin
function tugSound() {
  const c = audio();
  if (!c) return;
  noise(c, c.currentTime, 0.05, 2200, 0.05);
  noise(c, c.currentTime + 0.03, 0.08, 900, 0.03);
}

// the knot letting go
function untieSound() {
  const c = audio();
  if (!c) return;
  [0, 55, 120].forEach((ms, i) => noise(c, c.currentTime + ms / 1000, 0.02 + i * 0.008, 2500 + i * 700, 0.05));
}

// the ribbon slipping around the envelope: a swell of filtered noise sweeping upward
function silkSound() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const dur = 0.9;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const x = i / len;
    d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.pow(x, 0.65));
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(700, t);
  bp.frequency.exponentialRampToValueAtTime(4200, t + dur * 0.85);
  const g = c.createGain();
  g.gain.value = 0.2;
  src.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  src.start(t);
}

// ---------------------------------------------------------------------------
// Ribbon: a satin band around the envelope, tied in a bow.
//   - the two tails are little ropes (Verlet integration, fixed time step)
//   - `pd` is how far the knot has come undone (0 tied, 1 untied), on a spring
//   - pull past the threshold, or tap, and the band slips off the envelope
// ---------------------------------------------------------------------------
const TIP = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tip")) || 62) / 100;
const N = 14;            // points per tail
const G = 2300;          // gravity, px/s²
const STEP = 1 / 120;    // physics step, seconds
const SLIDE_T = 0.9;     // how long the band takes to slip away

let W = 0, H = 0, DPR = 1, cx = 0, tipY = 0;
let U = 40;              // one "unit": everything on the ribbon scales from this
let tailLen = 120, bandH = 38, PAD = 400;
let kx = 0, ky = 0;      // knot position (kx moves while the band slips away)

const tails = [-1, 1].map((side) => ({
  side,
  n: Array.from({ length: N }, () => ({ x: 0, y: 0, px: 0, py: 0 }))
}));

let state = "idle";      // idle | drag | auto | back | finish | slide | done
let pd = 0, pdv = 0, pTarget = 0;
let held = null;         // the tail being pulled
let ptr = { x: 0, y: 0 }, ptr0 = { x: 0, y: 0 }, autoTo = { x: 0, y: 0 };
let autoT = 0, finT = 0, slideT = 0, sOff = 0, dir = 1, revealed = false;
let time = 0, acc = 0, last = 0, gustX = 0, lean = 0;   // lean: how far the bow is being tugged sideways
let downAt = { x: 0, y: 0 }, downTime = 0, moved = 0;

const anchor = (t) => ({ x: kx + t.side * U * 0.16, y: ky + U * 0.32 });

function rest(t, i) {
  const a = anchor(t);
  const ang = t.side * 0.3;
  const s = (i * tailLen) / (N - 1);
  return { x: a.x + Math.sin(ang) * s + t.side * Math.sin((s / tailLen) * Math.PI) * U * 0.1, y: a.y + Math.cos(ang) * s };
}

function resetTails() {
  tails.forEach((t) =>
    t.n.forEach((p, i) => {
      const r = rest(t, i);
      p.x = p.px = r.x;
      p.y = p.py = r.y;
    })
  );
}

function layout() {
  W = envelope.clientWidth;
  H = envelope.clientHeight;
  DPR = Math.min(1.5, window.devicePixelRatio || 1);   // capped at 1.5 to keep the ribbon light on phones
  cvs.width = Math.round(W * DPR);
  cvs.height = Math.round(H * DPR);
  cx = W / 2;
  tipY = H * TIP;
  U = clamp(Math.min(W * 0.11, H * 0.075), 30, 62);
  bandH = U * 0.95;
  tailLen = clamp(U * 3.2, 90, 190);
  PAD = W * 0.5 + 240;
  kx = cx;
  ky = tipY;
  if (state === "idle") resetTails();
}

// --- physics ---------------------------------------------------------------
function stepTail(t, h) {
  const nodes = t.n;
  const a0 = anchor(t);
  const ls = (tailLen * (1 + 1.3 * clamp(pd, 0, 1))) / (N - 1);  // ribbon is drawn out of the knot as it loosens
  const free = state === "slide" || state === "done";
  const stiff = free ? 0 : 1 - clamp(pd, 0, 1);
  const isHeld = held === t;

  nodes[0].x = nodes[0].px = a0.x;
  nodes[0].y = nodes[0].py = a0.y;

  for (let i = 1; i < N; i++) {
    const nd = nodes[i];
    const f = i / (N - 1);
    if (isHeld && i === N - 1) {
      // the end follows the finger, with a little lag so it feels like it has weight
      const ox = nd.x, oy = nd.y;
      const k = 1 - Math.exp(-h * 26);
      nd.x += (ptr.x - nd.x) * k;
      nd.y += (ptr.y - nd.y) * k;
      nd.px = ox;
      nd.py = oy;
      continue;
    }
    const vx = (nd.x - nd.px) * 0.988;
    const vy = (nd.y - nd.py) * 0.988;
    nd.px = nd.x;
    nd.py = nd.y;
    let ax = (Math.sin(time * 1.7 + t.side * 1.3 + i * 0.35) * 38 + gustX * t.side) * f;
    let ay = G;
    if (stiff > 0.001) {
      // satin is stiff near the knot and floppy at the end
      const r = rest(t, i);
      const w = Math.pow(1 - f, 1.4) * stiff * 420;
      ax += (r.x - nd.x) * w;
      ay += (r.y - nd.y) * w;
    }
    nd.x += vx + ax * h * h;
    nd.y += vy + ay * h * h;
  }

  const iters = free ? 14 : 8;
  for (let k = 0; k < iters; k++) {
    for (let i = 0; i < N - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      const diff = (d - ls) / d;
      const wa = i === 0 ? 0 : 1;
      const wb = isHeld && i + 1 === N - 1 ? 0 : 1;
      const s = wa + wb;
      if (!s) continue;
      a.x += (dx * diff * wa) / s;
      a.y += (dy * diff * wa) / s;
      b.x -= (dx * diff * wb) / s;
      b.y -= (dy * diff * wb) / s;
    }
  }
}

// how undone the knot is, from where the finger is
function pFromPtr() {
  const d = Math.hypot(ptr.x - cx, ptr.y - (ky + U * 0.3));
  return clamp((d - 0.55 * tailLen) / (1.3 * tailLen), 0, 1);
}

// --- states ----------------------------------------------------------------
function startAuto(tail) {
  if (state !== "idle" && state !== "back") return;
  audio();
  held = tail;
  dir = tail.side;
  state = "auto";
  autoT = 0;
  const e = tail.n[N - 1];
  ptr0 = { x: e.x, y: e.y };
  ptr = { x: e.x, y: e.y };
  autoTo = { x: cx + tail.side * tailLen * 1.6, y: ky + U * 0.3 + tailLen };
  tugSound();
}

function beginFinish() {
  if (state === "finish" || state === "slide" || state === "done") return;
  dir = Math.abs(ptr.x - cx) > U * 0.3 ? (ptr.x > cx ? 1 : -1) : held.side;
  state = "finish";
  finT = 0;
  pTarget = 1;
  untieSound();
  if (navigator.vibrate) navigator.vibrate(12);
}

function startSlide() {
  state = "slide";
  slideT = 0;
  held = null;
  pTarget = 1;
  silkSound();
}

const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function updateState(dt) {
  // a little flutter now and then invites a pull
  gustX = state === "idle" && !reduced ? ((time + 3.6) % 5.5 < 1.2 ? Math.sin((((time + 3.6) % 5.5) / 1.2) * Math.PI) * 240 : 0) : 0;

  switch (state) {
    case "drag":
      pTarget = pFromPtr();
      if (pTarget >= 0.995) beginFinish();
      break;
    case "auto": {
      autoT += dt;
      const u = clamp(autoT / 0.6, 0, 1);
      const e = 1 - Math.pow(1 - u, 3);
      ptr.x = ptr0.x + (autoTo.x - ptr0.x) * e;
      ptr.y = ptr0.y + (autoTo.y - ptr0.y) * e;
      pTarget = pFromPtr();
      if (u >= 1) beginFinish();
      break;
    }
    case "back":
      pTarget = 0;
      if (Math.abs(pd) < 0.02 && Math.abs(pdv) < 0.15) {
        pd = pdv = 0;
        state = "idle";
      }
      break;
    case "finish":
      finT += dt;
      pTarget = 1;
      if (finT > 0.18) startSlide();
      break;
    case "slide": {
      slideT += dt;
      const u = clamp(slideT / SLIDE_T, 0, 1);
      sOff = dir * (W + PAD + 80) * easeInOut(u);
      kx = cx + sOff;
      if (!revealed && slideT > 0.13) {
        revealed = true;
        reveal();
      }
      if (u >= 1) {
        state = "done";
        cvs.hidden = true;
      }
      break;
    }
    default:
      pTarget = 0;
  }
}

// --- drawing ---------------------------------------------------------------
// Satin gold, drawn to read as real fabric: soft broad highlights, a fine
// woven grain, folded selvedge edges and contact shadows, with no hard outlines.
const GOLD = { dark: [82, 56, 16], mid: [196, 160, 84], light: [242, 224, 168], spec: [255, 250, 232] };

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const shade = (l) => (l < 0.5 ? mix(GOLD.dark, GOLD.mid, l * 2) : mix(GOLD.mid, GOLD.light, (l - 0.5) * 2));
const lerpP = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });

// tiny tile of alternating light / dark threads, repeated over the satin
const weave = (() => {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 3;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(255,248,220,.55)";
  g.fillRect(0, 0, 4, 1);
  g.fillStyle = "rgba(70,45,8,.55)";
  g.fillRect(0, 1, 4, 1);
  return c;
})();

function bandPath(xl, xr, y0, y1) {
  const nt = bandH * 0.5;   // swallow-tail cut on the free ends
  const ym = (y0 + y1) / 2;
  ctx.beginPath();
  ctx.moveTo(xl, y0);
  ctx.lineTo(xr, y0);
  ctx.lineTo(xr - nt, ym);
  ctx.lineTo(xr, y1);
  ctx.lineTo(xl, y1);
  ctx.lineTo(xl + nt, ym);
  ctx.closePath();
}

function drawBand(k) {
  const y0 = tipY - bandH / 2, y1 = tipY + bandH / 2;
  const xl = -PAD + sOff, xr = W + PAD + sOff, w = xr - xl;

  // soft contact shadow on the envelope
  ctx.save();
  ctx.shadowColor = "rgba(2,4,14,.32)";
  ctx.shadowBlur = U * 0.95;
  ctx.shadowOffsetY = U * 0.3;
  bandPath(xl, xr, y0, y1);
  ctx.fillStyle = "#b8965a";
  ctx.fill();
  ctx.shadowColor = "rgba(2,4,14,.5)";   // tight shadow right where the satin touches the paper
  ctx.shadowBlur = U * 0.14;
  ctx.shadowOffsetY = U * 0.05;
  ctx.fill();
  ctx.restore();

  ctx.save();
  bandPath(xl, xr, y0, y1);
  ctx.clip();

  // cross-section: flat satin with slightly rolled edges
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  [[0, "#7c5d24"], [0.07, "#a98847"], [0.22, "#d2b46f"], [0.46, "#ead79f"], [0.52, "#f1e2b0"],
  [0.6, "#e2cb8e"], [0.82, "#c1a05a"], [0.94, "#98783a"], [1, "#70531f"]].forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(xl, y0, w, bandH);

  // broad soft light and shade drifting along the fabric (moves with the band)
  const fx = ctx.createLinearGradient(sOff, 0, sOff + W, 0);
  [[0, "rgba(255,244,205,0)"], [0.1, "rgba(255,244,205,.16)"], [0.22, "rgba(50,28,4,.1)"], [0.36, "rgba(255,244,205,.22)"],
  [0.5, "rgba(50,28,4,.06)"], [0.64, "rgba(255,244,205,.2)"], [0.78, "rgba(50,28,4,.12)"], [0.9, "rgba(255,244,205,.16)"],
  [1, "rgba(255,244,205,0)"]].forEach(([o, c]) => fx.addColorStop(o, c));
  ctx.fillStyle = fx;
  ctx.fillRect(xl, y0, w, bandH);

  // the band curves around the envelope: darker toward the sides
  const wrap = ctx.createLinearGradient(0, 0, W, 0);
  wrap.addColorStop(0, "rgba(4,8,24,.4)");
  wrap.addColorStop(0.17, "rgba(4,8,24,0)");
  wrap.addColorStop(0.83, "rgba(4,8,24,0)");
  wrap.addColorStop(1, "rgba(4,8,24,.4)");
  ctx.fillStyle = wrap;
  ctx.fillRect(xl, y0, w, bandH);

  // a slow sheen sweeping along the satin
  const sx = (((time * 0.2) % 1.8) - 0.4) * W;
  const sh = ctx.createLinearGradient(sx - W * 0.18, 0, sx + W * 0.18, 0);
  sh.addColorStop(0, "rgba(255,250,228,0)");
  sh.addColorStop(0.5, "rgba(255,250,228,.26)");
  sh.addColorStop(1, "rgba(255,250,228,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(xl, y0, w, bandH);

  // woven thread grain
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = ctx.createPattern(weave, "repeat");
  ctx.fillRect(xl, y0, w, bandH);
  ctx.globalAlpha = 1;

  // folded selvedge edges
  ctx.lineWidth = 1;
  [[0.09, "rgba(255,242,200,.5)"], [0.12, "rgba(80,52,10,.28)"], [0.88, "rgba(255,242,200,.3)"], [0.91, "rgba(80,52,10,.3)"]].forEach(([f, c]) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(xl, y0 + bandH * f);
    ctx.lineTo(xr, y0 + bandH * f);
    ctx.stroke();
  });

  // the shiny satin picks up its surroundings: wine from the flap above, cream from the paper below
  const rt = ctx.createLinearGradient(0, y0, 0, y0 + bandH * 0.34);
  rt.addColorStop(0, "rgba(70,90,170,.07)");
  rt.addColorStop(1, "rgba(70,90,170,0)");
  ctx.fillStyle = rt;
  ctx.fillRect(xl, y0, w, bandH * 0.34);
  const rc = ctx.createRadialGradient(cx, y0, 0, cx, y0, W * 0.22);
  rc.addColorStop(0, "rgba(70,90,170,.22)");
  rc.addColorStop(1, "rgba(70,90,170,0)");
  ctx.fillStyle = rc;
  ctx.fillRect(xl, y0, w, bandH * 0.5);
  const rb = ctx.createLinearGradient(0, y1, 0, y1 - bandH * 0.28);
  rb.addColorStop(0, "rgba(238,230,210,.3)");
  rb.addColorStop(1, "rgba(238,230,210,0)");
  ctx.fillStyle = rb;
  ctx.fillRect(xl, y1 - bandH * 0.28, w, bandH * 0.28);

  if (k > 0.02) {
    // shadow where the knot pinches the band, plus fine gathers either side
    const r = U * 1.5;
    const ao = ctx.createRadialGradient(kx, tipY, U * 0.2, kx, tipY, r);
    ao.addColorStop(0, `rgba(30,14,0,${0.5 * k})`);
    ao.addColorStop(1, "rgba(30,14,0,0)");
    ctx.fillStyle = ao;
    ctx.fillRect(kx - r, y0, 2 * r, bandH);
    [-1, 1].forEach((s) => {
      for (let j = 1; j <= 3; j++) {
        const x = kx + s * U * (0.62 + j * 0.26);
        ctx.strokeStyle = `rgba(70,44,8,${0.1 * k * (1 - j * 0.24)})`;
        ctx.beginPath();
        ctx.moveTo(x, y0 + bandH * 0.08);
        ctx.quadraticCurveTo(x - s * U * 0.16, tipY, x, y1 - bandH * 0.08);
        ctx.stroke();
      }
    });
  }
  ctx.restore();

  bandPath(xl, xr, y0, y1);
  ctx.strokeStyle = "rgba(70,45,10,.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawTail(t) {
  // light smoothing so the ribbon bends in curves instead of sharp corners
  const n = t.n.map((q, i, a) =>
    i === 0 || i === N - 1 ? q : { x: (a[i - 1].x + 2 * q.x + a[i + 1].x) / 4, y: (a[i - 1].y + 2 * q.y + a[i + 1].y) / 4 }
  );
  const wT = U * 0.5;
  const L = [], R = [], lit = [];
  for (let i = 0; i < N; i++) {
    const a = n[Math.max(0, i - 1)], b = n[Math.min(N - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y;
    const d = Math.hypot(tx, ty) || 1;
    tx /= d;
    ty /= d;
    const wi = wT * (1 - 0.06 * (i / (N - 1))) * (0.84 + 0.16 * Math.cos(i * 0.5 + t.side * 1.1 + time * 0.8));
    L.push({ x: n[i].x - ty * wi / 2, y: n[i].y + tx * wi / 2 });
    R.push({ x: n[i].x + ty * wi / 2, y: n[i].y - tx * wi / 2 });
    // brightness follows the direction of the ribbon, so bends catch the light
    lit.push(clamp(0.5 + 0.5 * Math.cos(Math.atan2(ty, tx * t.side) - 0.8 + i * 0.3), 0, 1));
  }
  // swallow-tail cut at the end
  const e = n[N - 1], p = n[N - 2];
  const ex = e.x - p.x, ey = e.y - p.y;
  const ed = Math.hypot(ex, ey) || 1;
  const notch = { x: e.x - (ex / ed) * wT * 0.6, y: e.y - (ey / ed) * wT * 0.6 };

  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(L[0].x, L[0].y);
    for (let i = 1; i < N; i++) ctx.lineTo(L[i].x, L[i].y);
    ctx.lineTo(notch.x, notch.y);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(R[i].x, R[i].y);
    ctx.closePath();
  };

  // shadow underneath
  ctx.save();
  ctx.shadowColor = "rgba(2,4,14,.45)";
  ctx.shadowBlur = U * 0.3;
  ctx.shadowOffsetY = U * 0.1;
  outline();
  ctx.fillStyle = rgb(GOLD.mid);
  ctx.fill();
  ctx.restore();

  // satin: each piece is split in three and shaded across its width (dark rolled edges, bright core)
  const S = 3;
  for (let i = 0; i < N - 1; i++) {
    for (let s = 0; s < S; s++) {
      const u0 = s / S, u1 = (s + 1) / S;
      const l0 = lerpP(L[i], L[i + 1], u0), l1 = lerpP(L[i], L[i + 1], u1);
      const r0 = lerpP(R[i], R[i + 1], u0), r1 = lerpP(R[i], R[i + 1], u1);
      const lt = lit[i] + (lit[i + 1] - lit[i]) * ((u0 + u1) / 2);
      const base = shade(lt);
      const g = ctx.createLinearGradient((l0.x + l1.x) / 2, (l0.y + l1.y) / 2, (r0.x + r1.x) / 2, (r0.y + r1.y) / 2);
      g.addColorStop(0, rgb(mix(GOLD.dark, base, 0.35)));
      g.addColorStop(0.14, rgb(mix(GOLD.dark, base, 0.75)));
      g.addColorStop(0.5, rgb(mix(base, GOLD.spec, Math.pow(lt, 4) * 0.55)));
      g.addColorStop(0.86, rgb(mix(GOLD.dark, base, 0.75)));
      g.addColorStop(1, rgb(mix(GOLD.dark, base, 0.35)));
      ctx.beginPath();
      ctx.moveTo(l0.x, l0.y);
      ctx.lineTo(l1.x, l1.y);
      if (i === N - 2 && s === S - 1) ctx.lineTo(notch.x, notch.y);
      ctx.lineTo(r1.x, r1.y);
      ctx.lineTo(r0.x, r0.y);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle = g;
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();
    }
  }

  // selvedge lines along both edges, then a very soft outline
  [[0.1, "rgba(255,244,205,.38)"], [0.16, "rgba(80,52,10,.22)"], [0.9, "rgba(80,52,10,.28)"]].forEach(([f, c]) => {
    ctx.beginPath();
    for (let i = 1; i < N - 1; i++) {
      const q = lerpP(L[i], R[i], f);
      i === 1 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y);
    }
    ctx.strokeStyle = c;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  outline();
  ctx.strokeStyle = "rgba(84,58,16,.32)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// the loop's centre line (two bezier halves out to the tip and back to the knot)
function loopPts(len, hh, M) {
  const b = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };
  const pts = [];
  for (let i = 0; i <= 2 * M; i++) {
    if (i <= M) { const t = i / M; pts.push({ x: b(0, len * 0.25, len * 0.98, len, t), y: b(0, -hh * 1.15, -hh * 0.95, 0, t) }); }
    else { const t = i / M - 1; pts.push({ x: b(len, len * 0.98, len * 0.25, 0, t), y: b(0, hh * 0.95, hh * 1.15, 0, t) }); }
  }
  return pts;
}

// A loop is a real flat ribbon: gathered (narrow) at the knot, full width in the
// curve, with a little twist at the tip that shows the darker back of the satin.
function drawLoop(side, rot, len, hh, wid, dark, tilt = 0) {
  const M = 28, n = 2 * M + 1;   // fewer segments than before: lighter on phones, still smooth
  const c = Math.cos(rot * side + tilt), s = Math.sin(rot * side + tilt);
  const P = loopPts(len, hh, M).map((q) => {
    const x = q.x * side;
    return { x: kx + x * c - q.y * s, y: ky + x * s + q.y * c };
  });
  const L = [], R = [], lit = [], tw = [], gsA = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), e = Math.min(u, 1 - u) * 2;
    const gth = Math.min(1, e * 2), gs = gth * gth * (3 - 2 * gth);
    const twist = Math.exp(-Math.pow((u - 0.5) / 0.07, 2));
    const wi = wid * 1.1 * (0.42 + 0.58 * gs) * (1 - 0.5 * twist);
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y;
    const d = Math.hypot(tx, ty) || 1;
    tx /= d; ty /= d;
    L.push({ x: P[i].x - ty * wi / 2, y: P[i].y + tx * wi / 2 });
    R.push({ x: P[i].x + ty * wi / 2, y: P[i].y - tx * wi / 2 });
    // satin ripples along the ribbon; darker where it gathers into the knot
    // mirrored so the left and right loops are lit the same way
    lit.push(0.5 + 0.5 * Math.cos(Math.atan2(ty, tx * side) - 0.8 + u * 4) + 0.05 * Math.sin(u * 9 + (dark ? 2 : 0)));
    gsA.push(gs);
    tw.push(twist);
  }
  for (let k = 0; k < 6; k++) for (let i = 1; i < n - 1; i++) lit[i] = (lit[i - 1] + 2 * lit[i] + lit[i + 1]) / 4;   // no visible steps
  for (let i = 0; i < n; i++) lit[i] = clamp(lit[i] * (dark ? 0.86 : 1) * (0.72 + 0.28 * gsA[i]), 0, 1);
  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(L[0].x, L[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(L[i].x, L[i].y);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i].x, R[i].y);
    ctx.closePath();
  };

  ctx.save();
  ctx.shadowColor = dark ? "rgba(2,4,14,.3)" : "rgba(2,4,14,.62)";
  ctx.shadowBlur = U * (dark ? 0.28 : 0.4);
  ctx.shadowOffsetY = U * (dark ? 0.1 : 0.16);
  outline();
  ctx.fillStyle = rgb(GOLD.mid);
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < n - 1; i++) {
    const lt = (lit[i] + lit[i + 1]) / 2, t2 = (tw[i] + tw[i + 1]) / 2;
    const base = mix(shade(lt), GOLD.dark, 0.45 * t2);
    const g = ctx.createLinearGradient((L[i].x + L[i + 1].x) / 2, (L[i].y + L[i + 1].y) / 2, (R[i].x + R[i + 1].x) / 2, (R[i].y + R[i + 1].y) / 2);
    g.addColorStop(0, rgb(mix(GOLD.dark, base, 0.3)));
    g.addColorStop(0.14, rgb(mix(GOLD.dark, base, 0.72)));
    g.addColorStop(0.5, rgb(mix(base, GOLD.spec, Math.pow(lt, 3) * 0.7)));
    g.addColorStop(0.86, rgb(mix(GOLD.dark, base, 0.72)));
    g.addColorStop(1, rgb(mix(GOLD.dark, base, 0.3)));
    // each piece runs a little under the next one, so no seams show
    const j = Math.min(n - 1, i + 2), e1 = lerpP(L[i + 1], L[j], 0.6), e2 = lerpP(R[i + 1], R[j], 0.6);
    ctx.beginPath();
    ctx.moveTo(L[i].x, L[i].y);
    ctx.lineTo(e1.x, e1.y);
    ctx.lineTo(e2.x, e2.y);
    ctx.lineTo(R[i].x, R[i].y);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle = g;
    ctx.lineWidth = 1.2;
    ctx.fill();
    ctx.stroke();
  }

  // selvedge lines and a very soft outline
  [[0.12, "rgba(255,244,205,.4)"], [0.18, "rgba(80,52,10,.2)"], [0.88, "rgba(80,52,10,.28)"]].forEach(([f, col]) => {
    ctx.beginPath();
    for (let i = 1; i < n - 1; i++) {
      const q = lerpP(L[i], R[i], f);
      i === 1 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y);
    }
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  outline();
  ctx.strokeStyle = "rgba(84,58,16,.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawKnot(sc, tilt = 0) {
  if (sc < 0.03) return;
  const hw = U * 0.3 * sc, hh = U * 0.41 * sc, w = hw * 2, h = hh * 2;
  ctx.save();
  ctx.translate(kx, ky);
  ctx.rotate(tilt * 0.6);
  ctx.lineJoin = "round";

  // a strip of satin wrapped round the loops: puckered edges, pinched sides
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-hw, -hh * 0.92);
    ctx.bezierCurveTo(-hw * 0.5, -hh * 1.08, -hw * 0.15, -hh * 0.86, hw * 0.2, -hh * 1.02);
    ctx.bezierCurveTo(hw * 0.6, -hh * 1.1, hw * 0.9, -hh * 0.9, hw, -hh * 0.95);
    ctx.bezierCurveTo(hw * 0.86, -hh * 0.3, hw * 0.9, hh * 0.3, hw, hh * 0.92);
    ctx.bezierCurveTo(hw * 0.55, hh * 1.06, hw * 0.1, hh * 0.88, -hw * 0.25, hh * 1.04);
    ctx.bezierCurveTo(-hw * 0.6, hh * 1.1, -hw * 0.9, hh * 0.95, -hw, hh * 0.9);
    ctx.bezierCurveTo(-hw * 0.88, hh * 0.3, -hw * 0.9, -hh * 0.3, -hw, -hh * 0.92);
    ctx.closePath();
  };

  shape();
  ctx.shadowColor = "rgba(2,4,14,.5)";
  ctx.shadowBlur = U * 0.2;
  ctx.shadowOffsetY = U * 0.08;
  const g = ctx.createLinearGradient(-hw, -hh, hw, hh);
  [[0, "#f3e4b2"], [0.3, "#e4cb8a"], [0.55, "#bf9d55"], [0.8, "#96763a"], [1, "#6c5020"]].forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = ctx.strokeStyle = g;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.save();
  shape();
  ctx.clip();

  // the end of the strip laid over itself: a lighter diagonal flap with a shadowed edge
  ctx.beginPath();
  ctx.moveTo(hw * 0.1, -hh * 1.1);
  ctx.lineTo(hw * 0.5, -hh * 1.1);
  ctx.lineTo(hw * 0.15, hh * 1.1);
  ctx.lineTo(-hw * 0.2, hh * 1.1);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,246,214,.18)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hw * 0.5, -hh * 1.1);
  ctx.lineTo(hw * 0.15, hh * 1.1);
  ctx.strokeStyle = "rgba(60,36,6,.4)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.translate(-1.4, 0);
  ctx.strokeStyle = "rgba(255,246,214,.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.translate(1.4, 0);

  // creases fanning out as the fabric is gathered toward the bottom
  [-0.6, -0.3, 0, 0.3, 0.6].forEach((j, k) => {
    const bow = (k % 2 ? 1 : -1) * w * 0.07;
    [["rgba(70,44,8,.3)", 0], ["rgba(255,244,205,.35)", 1.5]].forEach(([col, off]) => {
      ctx.beginPath();
      ctx.moveTo(j * hw + off, -hh * 1.1);
      ctx.quadraticCurveTo(j * hw * 0.8 + bow + off, 0, j * hw * 0.55 + off, hh * 1.1);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });

  // cylinder shading toward the sides, fabric turning away top and bottom
  const cyl = ctx.createLinearGradient(-hw, 0, hw, 0);
  cyl.addColorStop(0, "rgba(50,28,4,.4)");
  cyl.addColorStop(0.22, "rgba(50,28,4,0)");
  cyl.addColorStop(0.75, "rgba(50,28,4,0)");
  cyl.addColorStop(1, "rgba(50,28,4,.45)");
  ctx.fillStyle = cyl;
  ctx.fillRect(-hw, -hh * 1.2, w, h * 1.2);
  const v = ctx.createLinearGradient(0, -hh, 0, hh);
  v.addColorStop(0, "rgba(50,28,4,.35)");
  v.addColorStop(0.25, "rgba(50,28,4,0)");
  v.addColorStop(0.75, "rgba(50,28,4,0)");
  v.addColorStop(1, "rgba(50,28,4,.4)");
  ctx.fillStyle = v;
  ctx.fillRect(-hw, -hh * 1.2, w, h * 1.2);
  // faint wine-colored reflection from the flap on the top edge
  const wr = ctx.createLinearGradient(0, -hh, 0, -hh + h * 0.28);
  wr.addColorStop(0, "rgba(70,90,170,.3)");
  wr.addColorStop(1, "rgba(70,90,170,0)");
  ctx.fillStyle = wr;
  ctx.fillRect(-hw, -hh * 1.2, w, h * 0.5);
  ctx.restore();

  shape();
  ctx.strokeStyle = "rgba(80,54,14,.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // the bow shrinks as the knot comes undone (and bounces back if you let go early)
  const vanish = state === "slide" ? clamp(1 - slideT * 7, 0, 1) : state === "done" ? 0 : 1;
  const sc = clamp(1 - 0.92 * pd, 0, 1.12) * vanish * (1 + 0.018 * Math.sin(time * 1.6));

  drawBand(clamp(sc, 0, 1));
  tails.forEach(drawTail);

  if (sc > 0.03) {
    const len = 2.55 * U * sc, hh = 0.92 * U * sc, wid = 0.5 * U * (0.55 + 0.45 * sc);
    // each loop breathes on its own rhythm; the whole bow leans when tugged and sways in a gust
    const b1 = Math.sin(time * 1.3) * 0.02, b2 = Math.sin(time * 1.05 + 1.9) * 0.024;
    const tilt = lean * 0.1 + clamp(gustX / 240, -1, 1) * 0.035;
    // 4) back loops sit further out, smaller and narrower, so they read as behind the front ones
    [-1, 1].forEach((s, i) => drawLoop(s, 0.74 + 0.3 * pd + (i ? b1 : b2), len * 0.82, hh * 0.88, wid * 0.86, true, tilt));
    [-1, 1].forEach((s, i) => drawLoop(s, 0.04 + 0.35 * pd - (i ? b2 : b1), len * (1 + 0.012 * Math.sin(time * 1.7 + i * 2)), hh, wid, false, tilt));
    drawKnot(clamp(1 - pd * 1.05, 0, 1.05) * vanish, tilt);
  }
}

// --- loop ------------------------------------------------------------------
let idleSkip = false;   // while the bow just rests, draw every other frame (about 30 fps) to save battery

function frame(now) {
  if (state === "idle" && !reduced) {
    idleSkip = !idleSkip;
    if (idleSkip) {
      requestAnimationFrame(frame);
      return;
    }
  }
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  time += dt;
  updateState(dt);
  lean += ((held ? clamp((ptr.x - cx) / (tailLen * 1.6), -1, 1) : 0) - lean) * (1 - Math.exp(-dt * 7));

  acc = Math.min(acc + dt, 0.1);
  while (acc >= STEP) {
    acc -= STEP;
    // the knot loosens on a spring: it overshoots a little when it snaps back
    pdv += (200 * (pTarget - pd) - 16 * pdv) * STEP;
    pd += pdv * STEP;
    tails.forEach((t) => stepTail(t, STEP));
  }
  draw();
  if (state !== "done") requestAnimationFrame(frame);
}

// --- input -----------------------------------------------------------------
const local = (e) => {
  const r = envelope.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};

// is the pointer on the bow or its tails?
const hit = (p) => Math.abs(p.x - cx) < U * 3 && p.y > tipY - U * 1.5 && p.y < tipY + tailLen + U * 1.2;

function nearestTail(p) {
  let best = tails[1], bd = Infinity;
  tails.forEach((t) =>
    t.n.forEach((q) => {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bd) { bd = d; best = t; }
    })
  );
  // near the loops, choose by side
  if (p.y < tipY + U) best = p.x < cx ? tails[0] : tails[1];
  return best;
}

envelope.addEventListener("pointerdown", (e) => {
  if (state !== "idle" && state !== "back") return;
  const p = local(e);
  if (!hit(p)) return;
  if (reduced) {
    state = "done";
    cvs.hidden = true;
    reveal();
    return;
  }
  e.preventDefault();
  audio();
  held = nearestTail(p);
  state = "drag";
  ptr = p;
  downAt = p;
  downTime = performance.now();
  moved = 0;
  envelope.style.cursor = "grabbing";
  try { envelope.setPointerCapture(e.pointerId); } catch (_) { }
  tugSound();
  if (navigator.vibrate) navigator.vibrate(6);
});

envelope.addEventListener("pointermove", (e) => {
  const p = local(e);
  if (state === "drag") {
    ptr = p;
    moved = Math.max(moved, Math.hypot(p.x - downAt.x, p.y - downAt.y));
  } else if (e.pointerType === "mouse" && (state === "idle" || state === "back")) {
    envelope.style.cursor = hit(p) ? "grab" : "";
  }
});

function release() {
  if (state !== "drag") return;
  envelope.style.cursor = "";
  const tap = moved < 8 && performance.now() - downTime < 450;
  if (tap) {
    const t = held;
    held = null;
    state = "idle";
    startAuto(t);
  } else if (pTarget >= 0.42) {
    beginFinish();
  } else {
    state = "back";
    held = null;   // let go: the tail swings and the bow springs back
  }
}
envelope.addEventListener("pointerup", release);
envelope.addEventListener("pointercancel", release);

// keyboard / screen reader / label: same thing as a tap on the bow
openBtn.addEventListener("click", () => {
  if (reduced) {
    state = "done";
    cvs.hidden = true;
    reveal();
    return;
  }
  startAuto(tails[1]);
});

window.addEventListener("resize", () => {
  layout();
  if (state === "idle") draw();
});

layout();
resetTails();
requestAnimationFrame((t) => {
  last = t;
  frame(t);
});


const sprite = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, "rgba(255,244,205,1)");
  gr.addColorStop(0.25, "rgba(241,223,174,.55)");
  gr.addColorStop(1, "rgba(216,189,126,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 32, 32);
  return c;
})();
const fwCv = $("#fw");
const fctx = fwCv.getContext("2d");
let fwItems = [], fwOn = false, fwW = 0, fwH = 0;

function fwSize() {
  const r = Math.min(2, window.devicePixelRatio || 1);
  fwW = innerWidth;
  fwH = innerHeight;
  fwCv.width = fwW * r;
  fwCv.height = fwH * r;
  fctx.setTransform(r, 0, 0, r, 0, 0);
}

function fwLaunch(x, y, delay) {
  fwItems.push({
    k: "r", x, y, x0: x, y0: y,
    tx: fwW * (0.18 + Math.random() * 0.64), ty: fwH * (0.12 + Math.random() * 0.38),
    t: -delay, dur: 0.85 + Math.random() * 0.3
  });
}

function fwBurst(x, y, out) {
  for (let i = 0; i < 54; i++) {
    const a = (i / 54) * Math.PI * 2 + Math.random() * 0.2, v = 90 + Math.random() * 190;
    out.push({ k: "p", x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 1.2 + Math.random() * 0.9, s: 2 + Math.random() * 3 });
  }
  const c = audio();
  if (c) {
    noise(c, c.currentTime, 0.16, 500, 0.09);
    noise(c, c.currentTime + 0.05, 0.3, 2500, 0.04);
  }
}

function fwStart() {
  if (fwOn) return;
  fwOn = true;
  fwSize();
  let t0 = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    fctx.globalCompositeOperation = "destination-out";   // fade the old frame, so everything leaves a trail
    fctx.fillStyle = "rgba(0,0,0,.24)";
    fctx.fillRect(0, 0, fwW, fwH);
    fctx.globalCompositeOperation = "lighter";
    const born = [];
    fwItems = fwItems.filter((o) => {
      if (o.k === "r") {
        o.t += dt;
        if (o.t < 0) return true;
        const u = clamp(o.t / o.dur, 0, 1), e = 1 - Math.pow(1 - u, 3);
        o.x = o.x0 + (o.tx - o.x0) * e;
        o.y = o.y0 + (o.ty - o.y0) * e;
        fctx.globalAlpha = 1;
        fctx.drawImage(sprite, o.x - 7, o.y - 7, 14, 14);
        if (u >= 1) { fwBurst(o.x, o.y, born); return false; }
        return true;
      }
      o.life += dt;
      if (o.life >= o.max) return false;
      o.vy += 140 * dt;
      o.vx *= 1 - 0.9 * dt;
      o.vy *= 1 - 0.9 * dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      const a = 1 - o.life / o.max, s = o.s * 2.5 * (0.6 + 0.4 * a);
      fctx.globalAlpha = a;
      fctx.drawImage(sprite, o.x - s, o.y - s, s * 2, s * 2);
      return true;
    }).concat(born);
    if (!fwItems.length) {
      fctx.globalCompositeOperation = "source-over";
      fctx.clearRect(0, 0, fwW, fwH);
      fwOn = false;
      return;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

$("#bowBtn").addEventListener("click", () => {
  if (reduced) return;
  const r = $("#bowBtn").getBoundingClientRect();
  fwSize();
  [0, 0.3, 0.6, 0.9].forEach((d) => fwLaunch(r.left + r.width / 2, r.top, d));
  fwStart();
  if (navigator.vibrate) navigator.vibrate(15);
});



/* scroll thread: fills as you scroll, ends in a bow that fires the fireworks */
const thread = $("#thread");
const onScroll = () => {
  const h = document.documentElement, max = h.scrollHeight - innerHeight, p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
  thread.style.setProperty("--p", p.toFixed(4));
  thread.style.setProperty("--bow", clamp((p - 0.9) / 0.1, 0, 1).toFixed(3));
  thread.classList.toggle("is-end", p > 0.9);
};
addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });

/* rockets: Celebrate() is called when the countdown reaches zero (you can also run Celebrate() in the console to test) */
window.Celebrate = (secs = 14) => {
  if (reduced) return;
  fwSize();
  const end = performance.now() + secs * 1000;
  const shoot = () => {
    if (performance.now() > end) return;
    const n = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) fwLaunch(fwW * (0.08 + Math.random() * 0.84), fwH + 10, i * 0.18);
    fwStart();
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(shoot, 600 + Math.random() * 500);
  };
  shoot();
};
})();

/* signature in the console (for the curious devs) */
console.log("%c♥ Made with all my love by Remon", "color:#f0d68e;background:#0e1224;font:600 15px Georgia,serif;padding:10px 16px;border-radius:8px;border:1px solid #c9a24b");