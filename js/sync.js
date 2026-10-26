import { db, AC } from './config.js';
import { state } from './state.js';
import { $, key, pd, getWorkoutForDate } from './utils.js';
import { persist, userDoc, processPhotoUploadQueue, resetPhotoCache } from './db.js';
import { calculateStreakAndMisses } from './streak.js';
import { scheduleRender } from './helpers.js';
import { show, showWelcome, theme, strip, main, drawer, updateWaterUI, updateMascotVisuals, showMascotSpeech } from './ui.js';
import { startWaterReminderTimer } from './water-reminder.js';
import { collection, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let unsubUser = null, unsubFeitos = null;
let isAppInitialized = false;
let bootRetryCount = 0;

function pCalSig(p) {
  if (!p) return null;
  return JSON.stringify({ t: p.tipo, f: p.freq, r: p.rest, ct: p.customTitles });
}

function pMainSig(p) {
  if (!p) return null;
  return JSON.stringify({
    te: p.tema, a: p.ac, rt: p.restTime, d: p.displayName, av: p.avatar,
    mn: p.mascotName, gn: p.guardianName,
    cr: p.createdAt, lw: p.lastWelcome, ns: p.nameSet,
    ex: Object.keys(p.ex || {}).sort().map(l =>
      l + ':' + (p.ex[l] || []).map(e => `${e.id}|${e.name}|${e.sets}|${e.f}|${e.w}|${e.wu}`).join(',')
    ).join(';')
  });
}

function pWaterSig(p) {
  if (!p) return null;
  return JSON.stringify({ wc: p.waterCurrent, wg: p.waterGoal, ws: p.waterSize, wt: p.waterType, wr: p.waterReminder, wrt: p.waterReminderTime });
}

function fSig(f) {
  if (!f) return null;
  return Object.keys(f).sort().map(k => `${k}|${f[k].letter}|${f[k].t}`).join(';');
}

function isUserTypingInternal() {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
}

function ensureCreatedAt() {
  if (!state.P || state.P.createdAt || !state.F_loaded) return;
  const keys = Object.keys(state.F).sort();
  const ts = keys.length ? pd(keys[0]).getTime() : Date.now();
  state.P.createdAt = ts;
  persist({ createdAt: ts });
}

async function ensureUserDoc(user) {
  const snap = await getDoc(userDoc());
  if (!snap.exists()) {
    const todayStr = key(new Date());
    await setDoc(userDoc(), {
      nome: (user.email || "").split("@")[0],
      displayName: "",
      nameSet: false,
      avatar: "", tipo: "", freq: 0, rest: null,
      ex: { A: [], B: [], C: [], D: [], E: [] },
      tema: "auto", ac: AC[0], restTime: 60, customTitles: {},
      streak: 0, misses: 0, mascotName: "", guardianName: "",
      waterGoal: 3000, waterCurrent: 0, waterSize: 250, waterType: "copo",
      waterReminder: false,
      waterReminderTime: 60,
      lastWaterDate: todayStr, animSeen: {}, lastWelcome: "",
      createdAt: Date.now()
    });
  }
}

function tryShowApp() {
  if (!state.P || !state.F_loaded) return false;
  if (isAppInitialized) return true;

  isAppInitialized = true;
  const todayStr = key(new Date());

  if (state.P.tipo) calculateStreakAndMisses();

  const savedSel = localStorage.getItem("sel_" + state.uid);
  let initialSel = savedSel || todayStr;
  const _createdKey = state.P.createdAt ? key(new Date(state.P.createdAt)) : null;
  if (_createdKey && initialSel < _createdKey) initialSel = todayStr;
  state.sel = initialSel;

  const savedInWorkout = localStorage.getItem("inWorkoutMode_" + state.uid);
  if (savedInWorkout === "true") {
    state.inWorkoutMode = true;
    const savedChecks = JSON.parse(localStorage.getItem("completedExs_" + state.uid) || "[]");
    state.completedExs = new Set(savedChecks);
    const savedForced = localStorage.getItem("forcedLetter_" + state.uid);
    if (savedForced) state.forcedLetter = savedForced;
  } else {
    state.inWorkoutMode = false;
    state.completedExs.clear();
  }

  state.forcedLetter = state.forcedLetter || null;
  state.showLetterSelector = false;
  state.letter = state.F[state.sel]?.letter || state.forcedLetter || getWorkoutForDate(pd(state.sel));
  state.exDetail = false;
  state.editingExIndex = null;

  show();
  $("splash").classList.add("hide");
  setTimeout(showMascotSpeech, 2500);

  if (!state.P.nameSet) {
    $("mdName").classList.add("on");
    $("ov").classList.add("on");
    $("nameInput").value = state.P.displayName || "";
  } else if (state.P.lastWelcome !== todayStr) {
    showWelcome();
    state.P.lastWelcome = todayStr;
    persist({ lastWelcome: todayStr });
  }
  return true;
}

// 🔥 FUNÇÃO CIRÚRGICA PARA EVITAR PISCAR A TELA
function checkIfCanRenderBackground() {
  // Se estiver em Configurações, Evolução, Mascote ou Seletor, NÃO re-renderiza o fundo!
  if (state.inConfigMode || state.inMascotMode || state.inSelectorMode) return false;
  if ($("evoScreen") && $("evoScreen").classList.contains("on")) return false;
  return true;
}

export async function boot(user) {
  try {
    state.uid = user.uid;

    $("splash")?.classList.remove("hide");
    $("auth").hidden = true;
    $("app").hidden = true;

    await ensureUserDoc(user);
    bootRetryCount = 0;

    if (unsubUser) unsubUser();
    if (unsubFeitos) unsubFeitos();
    isAppInitialized = false;
    state.P = null;
    state.F = {};
    state.F_loaded = false;
    resetPhotoCache();

    processPhotoUploadQueue().catch(() => {});

    unsubUser = onSnapshot(userDoc(), async (s) => {
      if (!s.exists()) return;

      const prevCal = pCalSig(state.P);
      const prevMain = pMainSig(state.P);
      const prevWater = pWaterSig(state.P);

      const serverData = s.data();
      const localAnimSeen = state.P ? state.P.animSeen : {};

      state.P = serverData;
      state.P.animSeen = { ...localAnimSeen, ...(state.P.animSeen || {}) };

      state.waterGoal = state.P.waterGoal || 3000;
      state.waterSize = state.P.waterSize || 250;
      state.waterType = state.P.waterType || "copo";
      state.waterReminder = state.P.waterReminder || false;
      state.waterReminderTime = state.P.waterReminderTime || 60;
      state.lastWaterDate = state.P.lastWaterDate || "";

      const todayKey = key(new Date());

      if (state.lastWaterDate !== todayKey) {
        state.waterCurrent = 0;
        state.lastWaterDate = todayKey;
        state.P.waterCurrent = 0;
        state.P.lastWaterDate = todayKey;
        state.pendingWater = null;
        persist({ waterCurrent: 0, lastWaterDate: todayKey });
      } else {
        const serverWater = state.P.waterCurrent || 0;
        if (state.pendingWater != null && state.pendingWater > serverWater) {
          state.waterCurrent = state.pendingWater;
          state.P.waterCurrent = state.pendingWater;
        } else {
          state.pendingWater = null;
          state.waterCurrent = serverWater;
        }
      }

      if (state.P.waterReminder) startWaterReminderTimer();

      state.P.ex = state.P.ex || {};
      ["A", "B", "C", "D", "E"].forEach(l => state.P.ex[l] = state.P.ex[l] || []);
      state.P.tema = state.P.tema || "auto";
      state.P.ac = state.P.ac || AC[0];
      state.P.restTime = state.P.restTime || 60;
      state.P.avatar = state.P.avatar || "";
      state.P.customTitles = state.P.customTitles || {};
      state.P.displayName = state.P.displayName || "";

      if (state.P.nameSet === undefined) {
        state.P.nameSet = !!(state.P.displayName && state.P.displayName !== state.P.nome);
        if (state.P.nameSet) persist({ nameSet: true });
      }
      state.P.nameSet = !!state.P.nameSet;
      state.P.streak = state.P.streak || 0;
      state.P.misses = state.P.misses || 0;
      state.P.mascotName = state.P.mascotName || "";
      state.P.guardianName = state.P.guardianName || "";
      state.P.animSeen = state.P.animSeen || {};
      state.P.lastWelcome = state.P.lastWelcome || "";

      state.P.needRestUpdate = false;
      if (typeof state.P.rest === 'number') { state.P.rest = [state.P.rest]; state.P.needRestUpdate = true; }
      else if (!Array.isArray(state.P.rest)) { state.P.rest = []; if (state.P.tipo) state.P.needRestUpdate = true; }

      ensureCreatedAt();
      calculateStreakAndMisses();

      if (!tryShowApp()) return;

      const newCal = pCalSig(state.P);
      const newMain = pMainSig(state.P);
      const newWater = pWaterSig(state.P);

      scheduleRender(() => {
        // Atualiza a água na tela (sempre pode, é rápido)
        if (prevWater !== newWater) updateWaterUI();

        // Atualiza o mascote na tela
        if (prevMain !== newMain) updateMascotVisuals();

        // Se o usuário estiver digitando, aborta a renderização pesada!
        if (isUserTypingInternal()) return;

        // Só renderiza o fundo se não estivermos em uma tela secundária
        if (checkIfCanRenderBackground()) {
          if (prevCal !== newCal) {
            theme(); strip(); main();
          } else if (prevMain !== newMain) {
            theme(); main();
          }
        }
        
        // Atualiza o menu lateral se ele estiver aberto
        if ($("dr").classList.contains("on") && $("dr").dataset.view === "main") {
          drawer();
        }
      });
    });

    unsubFeitos = onSnapshot(collection(db, "users", state.uid, "feitos"), (snap) => {
      const prevFSig = fSig(state.F);
      state.F = {};
      snap.forEach(x => state.F[x.id] = x.data());
      state.F_loaded = true;
      ensureCreatedAt();

      if (!tryShowApp()) return;

      const newFSig = fSig(state.F);
      if (prevFSig !== newFSig) {
        calculateStreakAndMisses();
        
        // Só atualiza o fundo se o usuário não estiver numa tela secundária
        if (checkIfCanRenderBackground() && !isUserTypingInternal()) {
          if (!document.querySelector('.animating')) strip();
          main();
        }
        updateMascotVisuals();
      }
    });

  } catch (error) {
    console.error("boot:", error);
    bootRetryCount++;
    if (bootRetryCount >= 3) {
      if (typeof window !== 'undefined') window.__skipToast = true;
      const { showToast } = await import('./utils.js');
      showToast("Não foi possível sincronizar. Recarregue o app.", "error");
      const splash = $("splash");
      if (splash) splash.classList.add("hide");
      return;
    }
    if (navigator.onLine) {
      setTimeout(() => boot(user).catch(() => {}), 3000);
    } else {
      window.addEventListener('online', () => boot(user).catch(() => {}), { once: true });
    }
  }
}

export function cleanupSubscriptions() {
  if (unsubUser) { unsubUser(); unsubUser = null; }
  if (unsubFeitos) { unsubFeitos(); unsubFeitos = null; }
  isAppInitialized = false;
}