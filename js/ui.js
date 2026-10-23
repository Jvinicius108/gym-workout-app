import { state } from './state.js';
import { $, esc, key, pd, mi, LT, getWorkoutForDate, getLabel, showToast, safeRender, Icons } from './utils.js';
import { ready, hydrate, persist } from './db.js';
import { startWorkoutTimer, formatDuration } from './timers.js';
import { DS, DF, AC, TIPOS } from './config.js';
import { quotes } from './quotes.js';
import { initWater, setWaterLevel } from './water.js';
import { mascotQuotes } from './mascot_quotes.js';

import { openEvolution, drawChart } from './ui-evolution.js';
import { renderConfigScreen, renderMascotScreen } from './ui-settings.js';

let lottieAnimation = null;

const dayAnimations = new Map();

const FIRE_FILES = {
  0: 'js/flame_cold.json',
  1: 'js/flame_cold.json',
  2: 'js/flame.json',
  3: 'js/flame_ultra.json'
};
let currentFireFile = null;

function destroyAllDayAnimations() {
  dayAnimations.forEach(anim => {
    try { anim.destroy(); } catch (e) { /* já destruída */ }
  });
  dayAnimations.clear();
}

function destroyDayAnimation(dateKey) {
  const anim = dayAnimations.get(dateKey);
  if (!anim) return;
  try { anim.destroy(); } catch (e) { /* já destruída */ }
  dayAnimations.delete(dateKey);
}

function loadFire(level) {
  const file = FIRE_FILES[level];
  const box = document.getElementById('lottieFire');
  if (!box || file === currentFireFile) return;
  if (!window.lottie) return; 
  currentFireFile = file;
  if (lottieAnimation) lottieAnimation.destroy();
  try {
    lottieAnimation = window.lottie.loadAnimation({
      container: box, renderer: 'svg', loop: true, autoplay: true, path: file
    });
  } catch (e) { console.error("Lottie:", e); lottieAnimation = null; }
}

export function theme() {
  const r = document.documentElement;
  const t = state.P ? state.P.tema : "auto";
  if (t) localStorage.setItem('gym_theme', t);
  
  (!t || t === "auto") ? r.removeAttribute("data-theme") : r.setAttribute("data-theme", t);
  r.style.setProperty("--ac", (state.P && state.P.ac) || AC[0]);

  const isDark = t === 'dark' || ((!t || t === 'auto') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const bgColor = isDark ? '#0f1115' : '#f4f5f7';
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', bgColor);
}

export function show() {
  theme();
  $("auth").hidden = true;
  $("splash").classList.add("hide");
  
  if (!ready() || (state.P && state.P.needRestUpdate)) {
    if (state.P && state.P.needRestUpdate) {
      state.isUpdate = true;
      state.ob = { step: 2, tipo: state.P.tipo, freq: state.P.freq, qty: 0, days: [] };
    } else {
      state.isUpdate = false;
      state.ob = { step: 0, tipo: "", freq: 0, qty: 0, days: [] };
    }
    return onboard();
  }
  $("app").hidden = false;
  
  if (state.inWorkoutMode) {
    $("app-body").classList.remove("centered-y");
    $("app").classList.add("workout-mode");
    startWorkoutTimer();
  } else {
    $("app-body").classList.add("centered-y");
    $("app").classList.remove("workout-mode");
    if (state.workoutTimerInterval) clearInterval(state.workoutTimerInterval);
  }

  strip(); main(); drawer();
  updateWaterUI();
}

let lastWaterAnnounced = 0;

export function updateWaterUI() {
    const txt = $("waterText");
    const btn = $("btnAddWater");
    const announce = $("waterAnnouncement");
    if (!txt || !btn) return;

    initWater($("waterCanvas"));

    const percent = state.waterGoal > 0 ? Math.min(100, (state.waterCurrent / state.waterGoal) * 100) : 0;
    setWaterLevel(percent / 100);

    if (state.waterGoal >= 1000) {
        txt.textContent = `${(state.waterCurrent / 1000).toFixed(1)} / ${(state.waterGoal / 1000).toFixed(1)}L`;
    } else {
        txt.textContent = `${state.waterCurrent} / ${state.waterGoal}ml`;
    }
    btn.textContent = `+ ${state.waterSize}ml`;

    if (announce) {
        if (state.waterCurrent >= state.waterGoal && lastWaterAnnounced !== state.waterGoal) {
            announce.textContent = "Parabéns! Você atingiu a meta de água de hoje.";
            lastWaterAnnounced = state.waterGoal;
        } else if (state.waterCurrent < state.waterGoal) {
            const currentMl = state.waterCurrent;
            if (currentMl >= lastWaterAnnounced + 1000 || (lastWaterAnnounced === 0 && currentMl >= 1000)) {
                announce.textContent = `Você já bebeu ${(currentMl / 1000).toFixed(1)} litros de água.`;
                lastWaterAnnounced = Math.floor(currentMl / 1000) * 1000;
            }
        }
    }
}

export function authView(msg) {
  try {
    const prevU = $("au")?.value || "";
    const prevP = $("ap")?.value || "";

    $("app").hidden = true;
    $("auth").hidden = false;
    $("splash").classList.add("hide");
    theme();
    $("auth").innerHTML =
      '<form id="authForm" class="auth" autocomplete="on">' +
      '<h1>GYM WORKOUT</h1>' +
      '<p>Sinta o prazer em ter o seu treino nas suas mãos.</p>' +
      '<div class="row">' +
        '<button type="button" class="chip' + (state.tab === "in" ? " on" : "") + '" data-tab="in">Entrar</button>' +
        '<button type="button" class="chip' + (state.tab === "up" ? " on" : "") + '" data-tab="up">Criar conta</button>' +
      '</div>' +
      '<input type="text" id="au" name="username" placeholder="Usuário" autocapitalize="none" autocomplete="username" maxlength="20">' +
      '<input type="password" id="ap" name="password" placeholder="Senha (mínimo 6 caracteres)" autocomplete="' + (state.tab === "in" ? "current-password" : "new-password") + '">' +
      '<div class="err" id="ae">' + (msg || "") + '</div>' +
      '<button type="submit" class="btn btn-primary" id="ago">' + (state.tab === "in" ? "Entrar" : "Criar conta") + '</button>' +
      '</form>';

    if ($("au") && prevU) $("au").value = prevU;
    if ($("ap") && prevP) $("ap").value = prevP;
  } catch (e) { console.error("authView:", e); }
}

export function onboard() {
  $("app").hidden = true;
  $("auth").hidden = false;
  $("splash").classList.add("hide");
  
  let h;
  if (state.ob.step === 0) {
    h = '<div class="auth" style="max-width:none;padding-left:0;padding-right:0"><div style="padding:0 8px"><div class="steps">Passo 1 de 4</div><h1>Qual é o seu tipo de treino?</h1><p>Deslize e escolha. Você pode mudar depois nas configurações.</p></div><div class="exs" style="padding:0 8px">' + Object.keys(TIPOS).map(t => '<button class="tp" data-obt="' + t + '"><b>' + t + '</b><span>' + TIPOS[t] + '</span><em>Escolher</em></button>').join("") + '</div></div>';
  } else if (state.ob.step === 1) {
    h = '<div class="auth"><button class="back-btn" data-back="0">' + Icons.arrowLeft + ' Voltar</button><div class="steps" style="text-align:center">Passo 2 de 4</div><h1>QUANTAS VEZES NA SEMANA COSTUMA TREINAR?</h1><p>Isso vira a sua meta semanal.</p><div class="nums">' + [1,2,3,4,5,6].map(n => '<button data-obf="' + n + '">' + n + '</button>').join("") + '</div></div>';
  } else if (state.ob.step === 2) {
    h = '<div class="auth">' + (state.isUpdate ? '' : '<button class="back-btn" data-back="1">' + Icons.arrowLeft + ' Voltar</button>') + '<div class="steps" style="text-align:center">' + (state.isUpdate ? 'Atualização do Aplicativo' : 'Passo 3 de 4') + '</div><h1>QUANTOS DIAS VOCÊ REPOUSA NA SEMANA?</h1><p>Escolha de 1 a 4 dias de descanso.</p><div class="nums">' + [1,2,3,4].map(n => '<button data-obqty="' + n + '">' + n + '</button>').join("") + '</div></div>';
  } else {
    h = '<div class="auth">' + (state.isUpdate ? '' : '<button class="back-btn" data-back="2">' + Icons.arrowLeft + ' Voltar</button>') + '<div class="steps" style="text-align:center">' + (state.isUpdate ? 'Atualização do Aplicativo' : 'Passo 4 de 4') + '</div><h1>QUAIS SÃO SEUS DIAS DE REPOUSO?</h1><p>Selecione exatamente <b>' + state.ob.qty + '</b> dia(s).</p><div class="dg">' + DF.map((n,i) => '<button data-obd="' + i + '" style="' + (state.ob.days.includes(i) ? 'border-color:var(--ac);color:var(--ac)' : '') + '">' + n + '</button>').join("") + '</div><button class="btn btn-primary" id="saveRest" style="margin-top:20px" ' + (state.ob.days.length === state.ob.qty ? '' : 'disabled') + '>Confirmar</button></div>';
  }
  $("auth").innerHTML = h;
}

function dayHtml(d, k0) {
  const k = key(d);
  const createdAt = state.P.createdAt || 0;
  const createdKey = createdAt ? key(new Date(createdAt)) : null;
  
  if (createdKey && k < createdKey) {
      return `<button class="d disabled" disabled aria-disabled="true"
                      aria-label="${DS[mi(d)]} ${d.getDate()} — antes da criação da conta">
                <small>${DS[mi(d)]}</small>
                <b>${d.getDate()}</b>
              </button>`;
  }
  
  const isSel = k === state.sel;
  const isRest = state.P.rest.includes(mi(d));
  const isPast = k < k0;
  const isFuture = k > k0;
  const isToday = k === k0;
  const isDone = !!state.F[k];
  const isFailed = isPast && !isRest && !isDone && state.P.tipo && state.F_loaded &&
                   (d.getTime() >= (state.P.createdAt || 0));

  let l = state.F[k]?.letter || (isRest ? null : getWorkoutForDate(d));
  let displayL = l ? getLabel(l) : '💤';

  let extraClass = "", statusHtml = "", animHtml = "";

  if (isDone) {
    const animPlayed = state.P.animSeen?.[k] === "success";
    if (!animPlayed && isToday) {
      animHtml = `<span class="lottie-day" id="lottie-day-${k}" data-type="success"></span>`;
      extraClass = "animating";
    } else {
      statusHtml = `<span class="static-status success">${Icons.check}</span>`;
      extraClass = "circle-day";
    }
  } else if (isFailed) {
    const daysAgo = Math.floor((Date.now() - pd(k).getTime()) / 86400000);
    const animPlayed = state.P.animSeen?.[k] === "fail";
    if (!animPlayed && daysAgo <= 7) {
      animHtml = `<span class="lottie-day" id="lottie-day-${k}" data-type="fail"></span>`;
      extraClass = "animating";
      document.getElementById('app-body').classList.add('celebrating');
    } else {
      statusHtml = `<span class="static-status fail">${Icons.x}</span>`;
      extraClass = "circle-day";
    }
  }

  if (extraClass === "circle-day") {
    return `<button class="d circle-day ${isSel ? 'sel' : ''} ${isToday ? 'today' : ''}" data-k="${k}">${statusHtml}</button>`;
  } else if (extraClass === "animating") {
    return `<button class="d animating ${isSel ? 'sel' : ''} ${isToday ? 'today' : ''}" data-k="${k}">${animHtml}</button>`;
  } else {
    let h = '<button class="d' + (isSel ? " sel" : "") + (isToday ? " today" : "") + '" data-k="' + k + '">';
    h += '<small>' + DS[mi(d)] + '</small>';
    h += '<b>' + d.getDate() + '</b>';
    h += '<span class="label-txt" style="' + (isSel ? 'color:var(--acx)' : '') + '">' + esc(displayL) + '</span>';
    
    let canStart = true;
    if (!isRest) {
      const letterForDay = state.F[k]?.letter || getWorkoutForDate(d);
      canStart = !!letterForDay && (state.P.ex[letterForDay] || []).length > 0;
    }

    if (isSel && !isDone && !isFailed && !isFuture && canStart) {
      h += '<span class="btn-start-inline" data-start="1">INICIAR ' + Icons.play + '</span>';
    }
    h += '</button>';
    return h;
  }
}

export function strip() {
  let h = "";
  const t = new Date(), k0 = key(t);
  
  for (let i = -14; i <= 30; i++) {
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
    h += dayHtml(d, k0);
  }
  destroyAllDayAnimations();

  $("strip").innerHTML = h;
  $("mes").textContent = pd(state.sel).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  
  const s = $("strip").querySelector(".sel");
  if (s) s.scrollIntoView({ inline: "center", block: "nearest" });

  setTimeout(initDayAnimations, 100);
}

function refreshDay(k) {
  const btn = $("strip").querySelector(`[data-k="${k}"]`);
  if (!btn) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = dayHtml(pd(k), key(new Date()));
  const newBtn = tmp.firstElementChild;
  if (!newBtn) return;
  destroyDayAnimation(k);
  btn.replaceWith(newBtn);
  setTimeout(initDayAnimations, 50);
}

function initDayAnimations() {
  document.querySelectorAll('.lottie-day').forEach(el => {
    if (el.dataset.initialized || el.querySelector('svg')) return;
    el.dataset.initialized = "true";

    const dateKey = el.id.replace('lottie-day-', '');
    const type = el.dataset.type;
    const path = type === 'success' ? 'js/success.json' : 'js/failure.json';

    destroyDayAnimation(dateKey);

    const markSeen = async () => {
      state.P.animSeen = state.P.animSeen || {};
      state.P.animSeen[dateKey] = type;
      persist({ animSeen: state.P.animSeen });
      refreshDay(dateKey);

      if (document.querySelectorAll('.lottie-day').length <= 1) {
        document.getElementById('app-body').classList.remove('celebrating');
      }

      if (type === 'success' && state.pendingEvolution) {
          setTimeout(() => {
              triggerEvolution(state.pendingEvolution);
          }, 500); 
      }
    };

    const fallback = setTimeout(() => {
      if (el.dataset.completed) return;
      el.dataset.completed = "true";
      markSeen();
    }, 6000);

    if (!window.lottie) {
      clearTimeout(fallback);
      markSeen();
      return;
    }

    try {
      const anim = window.lottie.loadAnimation({
        container: el, renderer: 'svg', loop: false, autoplay: true, path
      });
      dayAnimations.set(dateKey, anim);
      anim.addEventListener('complete', () => {
        if (el.dataset.completed) return;
        el.dataset.completed = "true";
        clearTimeout(fallback);
        markSeen();
      });
    } catch (e) {
      console.error("Lottie day:", e);
      clearTimeout(fallback);
      markSeen();
    }
  });
}

export function semana() {
  const d = pd(state.sel), seg = new Date(d.getFullYear(), d.getMonth(), d.getDate() - mi(d));
  let n = 0;
  for (let i = 0; i < 7; i++) if (state.F[key(new Date(seg.getFullYear(), seg.getMonth(), seg.getDate() + i))]) n++;
  return n;
}

function getFireLevel(streak) {
    if (streak >= 10) return 3;
    if (streak >= 5)  return 2;
    if (streak >= 1)  return 1;
    return 0;
}

function buildSparks(btn, level) {
    const old = document.getElementById("sparks-container");
    if (old) old.remove();
    if (level < 2) return;

    const box = document.createElement("div");
    box.id = "sparks-container";
    if (level === 3) box.classList.add("hot");

    const count = level === 3 ? 14 : 6;
    const spread = level === 3 ? 60 : 36;
    for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        s.className = "fire-spark";
        s.style.setProperty("--dx", `${(Math.random() - 0.5) * spread}px`);
        s.style.setProperty("--rise", `${level === 3 ? -110 : -70}px`);
        s.style.setProperty("--dur", `${(level === 3 ? 0.5 : 0.9) + Math.random() * 0.8}s`);
        s.style.setProperty("--delay", `${Math.random() * 1.5}s`);
        box.appendChild(s);
    }
    btn.appendChild(box);
}

export function updateMascotVisuals() {
  try {
    const btn = $("mascotBtn");
    const fire = $("lottieFire");
    const fill = $("mascotHealthFill");
    if (!btn || !state.P || !fire) return;

    if (state.inWorkoutMode || state.inSelectorMode) { 
      btn.style.display = "none"; 
      if (lottieAnimation) {
        try { lottieAnimation.pause(); } catch(e){}
      }
      return; 
    }

    if (lottieAnimation) {
      try { lottieAnimation.play(); } catch(e){}
    }
    let level;
    let streak = state.P.streak || 0;
    
    if (state.pendingEvolution) {
        level = state.pendingEvolution.oldLevel;
        streak = level === 0 ? 0 : level === 1 ? 4 : level === 2 ? 9 : 10;
    } else {
        level = getFireLevel(streak);
    }
    loadFire(level);

    btn.style.display = "flex";
    const newClass = `fire-lvl${level}`;
    if (!fire.classList.contains(newClass)) {
      fire.classList.remove("fire-lvl0","fire-lvl1","fire-lvl2","fire-lvl3");
      fire.classList.add(newClass);
      buildSparks(btn, level);
    }
    if (lottieAnimation) {
      const speeds = [0.35, 0.5 + (Math.min(streak,4)/4)*0.3, 1.1, 1.9];
      try { lottieAnimation.setSpeed(speeds[level]); } catch(e){}
    }
    if (fill) fill.style.width = Math.min(100, (streak / 10) * 100) + "%";
  } catch (e) { console.error("updateMascotVisuals:", e); }
}

export function main() {
  if (!state.P) return;
  try { updateMascotVisuals(); } catch(e) { console.error("mascot:", e); }
  const createdAt = state.P.createdAt || 0;
  const createdKey = createdAt ? key(new Date(createdAt)) : null;
  if (createdKey && state.sel < createdKey) {
    $("main").innerHTML = `<div class="panel"><div class="fail-card" style="opacity: 0.55;">
      <div style="color: var(--mu); font-size: 48px;">🔒</div>
      <h2 style="color: var(--mu); margin-top: 16px;">Antes do início</h2>
      <p class="s" style="color: var(--mu);">Este dia é anterior à criação da sua conta.</p>
    </div></div>`;
    return;
  }

  const d = pd(state.sel);
  const isRest = state.P.rest.includes(mi(d));
  const l = state.F[state.sel]?.letter || state.forcedLetter || (isRest ? null : getWorkoutForDate(d));
  const k0 = key(new Date());
  const isPast = state.sel < k0;
  const isFuture = state.sel > k0;
  const isFailed = isPast && !isRest && !state.F[state.sel] && state.P.tipo &&
                   (d.getTime() >= (state.P.createdAt || 0));

  let h = '';
  const dn = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const meta = '<div class="goal">Meta da semana: ' + semana() + ' de ' + state.P.freq + ' treino' + (state.P.freq > 1 ? "s" : "") + '</div>';

  if (!state.inWorkoutMode) {
    h += '<div class="panel">';

    if (isFailed) {
      h += `<div class="fail-card">
              <div class="fail-icon-container"><div class="fail-icon">${Icons.x}</div></div>
              <h2 class="fail-title">Dia Perdido</h2>
              <p class="s" style="margin-bottom: 24px;">${dn}</p>
              <div class="fail-message">"Poxa, você falhou hoje.<br>
                Cuidado, o seu mascote precisa que você mantenha o foco para que ele sobreviva!"</div>
            </div>`;
    } else if (state.F[state.sel]) {
      h += '<h2 style="color:var(--success);">Treino Concluído ' + Icons.check + '</h2>';
      h += '<p class="s">' + dn + '</p>';
      let proofImg = state.F[state.sel].fid ? (state.cache[state.F[state.sel].fid] ? '<img class="proof" src="' + state.cache[state.F[state.sel].fid] + '" alt="">' : '<img class="proof" data-f="' + state.F[state.sel].fid + '" alt="">') : '';
      h += proofImg;
      if (state.F[state.sel].duration) h += '<div class="duration-text">' + Icons.clock + ' Você treinou por ' + esc(state.F[state.sel].duration) + '</div>';
      h += '<button class="btn btn-ghost" id="undo" style="display:block; margin:16px auto;">Desfazer Treino</button>';
    } else if (isRest && !state.forcedLetter) {
      const quoteIdx = Math.abs(Math.floor(d.getTime() / 86400000)) % quotes.length;
      const randomQuote = quotes[quoteIdx];
      h += '<h2>Descanso ' + Icons.moon + '</h2>';
      h += '<p class="s">' + dn + '</p>';
      h += meta;
      h += '<div class="preview-list" style="text-align:center; font-style:italic; color:var(--mu); border:none; background:transparent; padding: 10px 20px; font-size: 16px; line-height: 1.6;">"' + randomQuote + '"</div>';
      if (isFuture) {
        h += '<div style="text-align:center; color:var(--mu); padding:16px 20px; font-style:italic; font-size:14px;">Você só pode iniciar treinos a partir de hoje.</div>';
      } else {
        h += `<div class="card-btns"><button class="btn btn-primary" id="btn-workout-rest" style="display: flex; align-items: center; justify-content: center; gap: 8px;">INICIAR TREINO ${Icons.play}</button></div>`;
      }
    } else {
      h += '<h2>Treino ' + esc(getLabel(l)) + '</h2>';
      h += '<p class="s">' + dn + '</p>';
      h += meta;

      const exs = state.P.ex[l] || [];

      if (isFuture) {
        h += `<div style="text-align:center; color:var(--mu); padding:32px 20px; font-style:italic;">Você só pode iniciar treinos a partir de hoje.</div>`;
      } else if (exs.length === 0) {
        h += `<div class="empty" style="padding:32px 20px;">
                <p style="margin:0 0 12px; font-size:16px; color:var(--tx);">Nenhum exercício no Treino ${esc(getLabel(l))}.</p>
                <p style="margin:0 0 20px; color:var(--mu); font-size:14px;">Adicione exercícios nas configurações.</p>
              </div>`;
        h += `<div class="card-btns"><button class="btn btn-primary" id="btn-open-config" style="width:100%;">ADICIONAR EXERCÍCIOS</button></div>`;
      } else {
        let carouselHTML = '';
        [...exs, ...exs].forEach((e) => {
          let imgHtml = e.f ? (state.cache[e.f] ? `<img src="${state.cache[e.f]}" alt="">` : `<img data-f="${e.f}" alt="">`) : `<div class="ph">${Icons.dumbbellLarge}</div>`;
          carouselHTML += `<div class="carousel-item">${imgHtml}<span>${esc(e.name)}</span></div>`;
        });
        h += `<div class="preview-carousel"><div class="carousel-track">${carouselHTML}</div></div>`;
        h += '<div style="text-align:center; color:var(--mu); font-size:14px; margin-top:16px; font-weight: 500;">Toque na data acima e no botão <span style="color:var(--ac);font-weight:800;">▶</span> para iniciar.</div>';
        h += `<div class="card-btns"><button class="btn btn-secondary" id="btn-change-workout" style="display: flex; align-items: center; justify-content: center; gap: 8px;">MUDAR TREINO</button></div>`;
      }
    }
    h += '</div>';
  } else {
    h += '<div style="width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column;">';
    h += '<div class="wk-head">';
    h += '<button class="wk-back" data-exit="1">' + Icons.arrowLeft + ' Voltar</button>';
    h += '<h2>Treino ' + esc(getLabel(l)) + '</h2>';
    h += '<div></div>';
    h += '</div>';
    h += '<div style="text-align:center; color:var(--mu); font-size:14px; margin-bottom:12px; font-weight: 500;">' + dn + '</div>';
    h += '<div id="workoutTimerDisplay">' + (state.workoutStartTime ? formatDuration(Date.now() - state.workoutStartTime) : "00:00:00") + '</div>';

    const ex = state.P.ex[l] || [];
    if (ex.length) {
      h += '<div class="exs vertical" style="margin-bottom: 20px;">' + ex.map((e, i) => {
        let imgHtml = e.f ? (state.cache[e.f] ? '<img class="im" src="' + state.cache[e.f] + '" alt="">' : '<img class="im" data-f="' + e.f + '" alt="">') : '<div class="im" style="display:flex;align-items:center;justify-content:center">' + Icons.dumbbellLarge + '</div>';
        const isDone = state.completedExs.has(i);
        const textStyle = isDone ? 'text-decoration: line-through; opacity: 0.5;' : '';
        return '<div class="ex">' + imgHtml +
          '<div class="ex-info">' +
            '<div style="display:flex; align-items:center; gap:12px; margin-bottom: 6px;">' +
              '<button class="chk-btn '+(isDone?'done':'')+'" data-chk="'+i+'" aria-label="Concluir '+esc(e.name)+'" aria-pressed="'+isDone+'">' + Icons.check + '</button>' +
              '<div style="flex:1; min-width:0; '+textStyle+'"><b>'+esc(e.name)+'</b></div>' +
            '</div>' +
            '<div style="'+textStyle+'">' +
              (e.sets?'<span>'+esc(e.sets)+'</span>':'') +
              (e.w?'<span style="color:var(--ac);font-weight:600;">Carga: '+esc(e.w)+' '+esc(e.wu || 'kg')+'</span>':'') +
            '</div>' +
            '<div class="ex-actions">' +
              '<button class="btn-carga btn-weight" data-weight="'+i+'">' + Icons.scale + ' Carga</button>' +
              '<button class="btn-carga btn-rest" data-timer="1">' + Icons.clock + ' Descanso</button>' +
            '</div>' +
          '</div></div>';
      }).join("") + '</div>';

      const f = state.F[state.sel];
      if (f) {
        let proofImg = f.fid ? (state.cache[f.fid] ? '<img class="proof" src="' + state.cache[f.fid] + '" alt="">' : '<img class="proof" data-f="' + f.fid + '" alt="">') : '';
        h += '<button class="btn btn-secondary" disabled style="margin-top: 10px; padding: 18px; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px;">' + Icons.check + ' CONCLUÍDO</button>' + proofImg;
        if (f.duration) h += '<div class="duration-text">' + Icons.clock + ' Você treinou por ' + esc(f.duration) + '</div>';
        h += '<button class="btn btn-ghost" id="undo" style="margin-bottom: 0;">Desfazer</button>';
      } else {
        h += '<button class="btn btn-primary" id="done" data-letter="' + l + '" style="margin-top: 16px; margin-bottom: 0; padding: 18px; font-size: 1rem;">CONCLUÍDO</button>';
      }
    } else {
      h += `<div class="empty" style="padding:32px 20px; text-align:center;">
              <p style="margin:0 0 8px; font-size:16px; color:var(--tx); font-weight:700;">Este treino está vazio.</p>
              <p style="margin:0 0 20px; color:var(--mu); font-size:14px;">Adicione exercícios nas configurações.</p>
            </div>`;
      h += `<button class="btn btn-secondary" data-exit="1">VOLTAR</button>`;
    }
    h += '</div>'; 
  }
  $("main").innerHTML = h;
  hydrate();
}

export function renderWorkoutSelector() {
    if (!state.inSelectorMode) { $("workoutSelectorScreen").classList.remove("on"); return; }
    $("workoutSelectorScreen").classList.add("on");
    
    let h = "";
    LT().forEach(l => {
        const exs = state.P.ex[l] || [];
        let carouselHTML = '';
        if (exs.length > 0) {
            exs.forEach((e) => {
                let imgHtml = e.f ? (state.cache[e.f] ? `<img src="${state.cache[e.f]}" alt="">` : `<img data-f="${e.f}" alt="">`) : `<div class="ph">${Icons.dumbbellLarge}</div>`;
                carouselHTML += `
                    <div class="carousel-item">
                        ${imgHtml}
                        <span>${esc(e.name)}</span>
                    </div>`;
            });
        }
        
        h += `
          <button class="workout-choice-card" data-select-workout="${l}">
            <div class="workout-choice-header">
                <small>Treino ${l}</small>
                <h3>${esc(getLabel(l))}</h3>
            </div>
            ${carouselHTML ? `<div class="preview-carousel" style="margin:0; padding: 16px 0;"><div class="carousel-track">${carouselHTML}</div></div>` : `<p style="text-align:center; padding: 24px; color: var(--mu); font-weight: 500;">Nenhum exercício cadastrado.</p>`}
          </button>
        `;
    });
    $("selectorContent").innerHTML = h;
    hydrate();
}

export function drawer() {
  const dr = $("dr");
  let h = "";

  if (dr.dataset.view === 'water') {
    const isCopo = state.waterType === 'copo';
    const currentLabel = state.waterGoal >= 1000 ? (state.waterGoal/1000).toFixed(1).replace('.0', '')+'L' : state.waterGoal+'ml';

    h = `
      <div style="display:flex; align-items:center; margin-bottom: 24px; gap: 12px;">
         <button class="ic" id="btnWaterBack" style="border:none; background:transparent; padding:0;" aria-label="Voltar">${Icons.arrowLeft}</button>
         <h2 style="margin:0; font-size:22px;">Meta de Água</h2>
      </div>

      <div class="config-section">
        <h3>O que você usa para medir?</h3>
        <div style="display:flex; gap:12px; margin-bottom: 20px;">
          <button class="btn ${isCopo ? 'btn-primary' : 'btn-secondary'}" id="btnWaterCopo" style="flex:1; font-size:16px;">Copo</button>
          <button class="btn ${!isCopo ? 'btn-primary' : 'btn-secondary'}" id="btnWaterGarrafa" style="flex:1; font-size:16px;">Garrafa</button>
        </div>
    `;

    if (state.showWaterSizeInput) {
        const valSize = isCopo ? state.waterSize : (state.waterSize / 1000).toFixed(2).replace(/\.?0+$/, "");
        h += `
            <h3>${isCopo ? 'QUANTAS MLs?' : 'QUANTOS LITROS?'}</h3>
            <input type="number" id="waterSizeInput" value="${valSize}" placeholder="${isCopo ? 'Ex: 250' : 'Ex: 0.25'}" style="font-size: 18px; padding: 16px; margin-bottom: 16px;">
        `;
    }

    h += `
        <button class="btn btn-secondary" id="btnEditWaterMode" style="margin-top: 16px; padding: 18px; font-size: 15px; font-weight: 700; color: var(--water); border-color: var(--water);">ALTERAR META DIÁRIA (ATUAL: ${currentLabel})</button>
        
        <div style="margin-top: 24px; border-top: 1px solid var(--bd); padding-top: 20px;">
            <h3>🔔 Lembrete de Água</h3>
            <button class="btn btn-secondary" id="btnToggleReminder" style="padding: 18px; font-size: 15px; font-weight: 700; color: ${state.waterReminder ? 'var(--success)' : 'var(--mu)'}; border-color: ${state.waterReminder ? 'var(--success)' : 'var(--bd)'};">
                ${state.waterReminder ? '✅ Ativado' : '🔕 Ativar Lembrete'}
            </button>
            
            ${state.waterReminder ? `
                <p style="font-size: 12px; color: var(--mu); margin-top: 16px; text-align: center;">Avisar a cada:</p>
                <div class="row" style="justify-content: center; margin-top: 8px;">
                    ${[30, 60, 120, 180].map(m => `<button class="chip${state.waterReminderTime === m ? ' on' : ''}" data-reminder-time="${m}">${m >= 60 ? (m/60)+'h' : m+'min'}</button>`).join('')}
                </div>
            ` : ''}
        </div>
    `;

    if (state.showWaterGoalInput) {
        const valGoal = isCopo ? state.waterGoal : (state.waterGoal / 1000).toFixed(2).replace(/\.?0+$/, "");
        h += `
            <h3 style="margin-top: 20px;">META DIÁRIA (${isCopo ? 'MLs' : 'Litros'})</h3>
            <input type="number" id="waterGoalInput" value="${valGoal}" placeholder="${isCopo ? 'Ex: 3000' : 'Ex: 3.0'}" style="font-size: 18px; padding: 16px;">
        `;
    }

    h += `
        <button class="btn btn-primary" id="saveWaterDrawer" style="margin-top:24px; padding: 18px; font-size: 16px;">SALVAR</button>
      </div>
    `;
    safeRender("dr", h);
    return;
  }

  let displayName = state.P.displayName || state.P.nome;
  let username = state.P.nome;

  let avatarHtml = state.P.avatar 
    ? `<button class="avatar-btn" id="btnAvatar"><img src="${state.P.avatar}" alt="Avatar"></button>` 
    : `<button class="avatar-btn" id="btnAvatar">${Icons.user}</button>`;

  h = `
    <div style="display:flex; justify-content:flex-end; margin-bottom: 8px;">
       <button class="ic" id="btnCloseMenu" style="border:none; background:transparent; padding:0;" aria-label="Fechar menu">${Icons.x}</button>
    </div>

    <div class="menu-header" style="margin-top:-24px;">
      ${avatarHtml}
      <div>
        <div class="menu-name">${esc(displayName)}</div>
        <div class="menu-username">@${esc(username)}</div>
      </div>
    </div>
    
    <button class="btn-menu" id="btn-evolution">
      <span style="display: flex; align-items: center; gap: 12px;">${Icons.chart} Ver Evolução</span> <span style="color: var(--mu);">›</span>
    </button>
    
    <button class="btn-menu" id="btn-open-config">
      <span style="display: flex; align-items: center; gap: 12px;">${Icons.settings} Configurar Treinos</span> <span style="color: var(--mu);">›</span>
    </button>

    <button class="btn-menu" id="btnWaterSettings">
      <span style="display: flex; align-items: center; gap: 12px;">${Icons.water} Meta de Água Diária</span> <span style="color: var(--mu);">›</span>
    </button>
    
    <h3>Dias de repouso</h3>
    <div class="row">${DS.map((n, i) => `<button class="chip${state.P.rest.includes(i) ? " on" : ""}" data-rest2="${i}">${n}</button>`).join("")}</div>
    
    <h3>Tempo de descanso (s)</h3>
    <div class="row">${[30,45,60,90,120].map(n => `<button class="chip${state.P.restTime === n ? " on" : ""}" data-resttime="${n}">${n}s</button>`).join("")}</div>

    <h3>Tema</h3>
    <div class="row">${[["auto","Automático"],["light","Claro"],["dark","Escuro"]].map(t => `<button class="chip${state.P.tema === t[0] ? " on" : ""}" data-th="${t[0]}">${t[1]}</button>`).join("")}</div>
    <div class="row" style="margin-top:16px">${["Laranja","Azul","Verde","Roxo","Rosa","Vermelho","Amarelo","Ciano","Índigo"].map((name, i) => { const c = AC[i]; return `<button class="sw${state.P.ac === c ? " on" : ""}" style="background:${c}" data-ac="${c}" aria-label="Cor ${name}"></button>`; }).join("")}</div>
    
       <div style="flex:1"></div>
    <button class="btn btn-danger" id="out" style="margin-top:40px;">Sair da Conta</button>
    <button class="btn btn-ghost" id="btnDeleteAccount" style="margin-top:12px; font-size:12px;">Excluir Conta Permanentemente</button>
  `;

  safeRender("dr", h);
}

export function showWelcome() {
    const name = state.P.displayName || state.P.nome;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    $("welcomeName").textContent = name;
    $("welcomeQuote").textContent = `"${randomQuote}"`;
    $("mdWelcome").classList.add("on");
    $("ov").classList.add("on");
}

export function showMascotSpeech() {
  if (state.inWorkoutMode || state.inSelectorMode) return; 
    const balloon = $("mascotBalloon");
    const textEl = $("mascotSpeechText");
    if (!balloon || !textEl || !state.P) return;

    const lastSpeak = localStorage.getItem("mascot_last_speak_" + state.uid);
    const now = Date.now();
    
    if (lastSpeak && (now - parseInt(lastSpeak)) < 1800000) return;

    let category = "persistence";
    const streak = state.P.streak || 0;
    const waterPercent = state.waterGoal > 0 ? (state.waterCurrent / state.waterGoal) : 1;
    const isLate = new Date().getHours() >= 18;

    if (waterPercent < 0.5 && isLate) {
        category = "water";
    } else if (streak >= 10) {
        category = "hot";
    } else if (streak >= 5) {
        category = "warming";
    } else {
        category = "cold";
    }

    const quotesList = mascotQuotes[category];
    const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];

    textEl.textContent = randomQuote;
    balloon.classList.add("show");

    localStorage.setItem("mascot_last_speak_" + state.uid, now.toString());

    setTimeout(() => {
        balloon.classList.remove("show");
    }, 6000);
}

export async function triggerEvolution(evolutionData) {
    const overlay = document.getElementById('celebrationOverlay');
    const mascotContainer = document.getElementById('celebrationMascotContainer');
    const lottieContainer = document.getElementById('celebrationLottieContainer');
    const arcText = document.getElementById('arcText');

    const btn = document.getElementById('mascotBtn');
    if (btn) btn.style.display = "none";
    
    mascotContainer.innerHTML = '';
    lottieContainer.innerHTML = '';
    mascotContainer.classList.remove('fade-out', 'fade-in');
    arcText.classList.remove('on');

    const spawnedAnimations = new Set();
    
    const loadLottie = async (path, container, loop = true) => {
        try {
            if (!window.lottie) throw new Error("Biblioteca Lottie não carregada.");
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Erro ${response.status} ao carregar ${path}`);
            const data = await response.json();
            const anim = window.lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: loop,
                autoplay: true,
                animationData: data
            });
            spawnedAnimations.add(anim);
            return anim;
        } catch (e) {
            console.error("Erro no Lottie:", e);
            return null;
        }
    };

    const destroySpawned = () => {
        spawnedAnimations.forEach(anim => {
            try { anim.destroy(); } catch (e) {}
        });
        spawnedAnimations.clear();
    };

    const destroyOne = (anim) => {
        if (!anim) return;
        try { anim.destroy(); } catch (e) {}
        spawnedAnimations.delete(anim);
    };

    overlay.classList.add('on');

    const oldFireFile = FIRE_FILES[evolutionData.oldLevel];
    const oldMascotAnim = await loadLottie(oldFireFile, mascotContainer, true);
    
    await loadLottie('js/congratulations.json', lottieContainer, false);

    setTimeout(() => {
        mascotContainer.classList.add('fade-out');
        
        setTimeout(async () => {
            destroyOne(oldMascotAnim);
            mascotContainer.innerHTML = '';
            
            const newFireFile = FIRE_FILES[evolutionData.newLevel];
            const newMascotAnim = await loadLottie(newFireFile, mascotContainer, true);
            
            if (newMascotAnim) {
                if (evolutionData.newLevel === 3) newMascotAnim.setSpeed(2.0); 
                else if (evolutionData.newLevel === 2) newMascotAnim.setSpeed(1.5);
            }

            mascotContainer.classList.remove('fade-out');
            mascotContainer.classList.add('fade-in');

            lottieContainer.innerHTML = '';
            await loadLottie('js/celebration_confetti.json', lottieContainer, false);
            
            arcText.classList.add('on');

            setTimeout(() => {
                mascotContainer.classList.remove('fade-in');
            }, 50);

        }, 500); 
    }, 2000); 

    setTimeout(() => {
        arcText.classList.remove('on');
        
        setTimeout(() => {
            overlay.classList.remove('on');
            setTimeout(() => {
                destroySpawned();
                mascotContainer.innerHTML = '';
                lottieContainer.innerHTML = '';
                
                state.pendingEvolution = null;
                updateMascotVisuals();
            }, 800); 
        }, 500);
    }, 6000); 
}

export function pauseMascotFire() {
  if (lottieAnimation) {
    try { lottieAnimation.pause(); } catch(e) {}
  }
}

export function resumeMascotFire() {
  if (lottieAnimation) {
    try { lottieAnimation.play(); } catch(e) {}
  }
}

export { openEvolution, drawChart, renderConfigScreen, renderMascotScreen };