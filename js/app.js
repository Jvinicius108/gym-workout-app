import { auth, db, CONFIGURADO, AC } from './config.js';
import { state, resetState, setState } from './state.js';
import { $, key, pd, mi, LT, getWorkoutForDate, uidg, showToast } from './utils.js';
import { persist, img, putFoto, delFoto, userDoc } from './db.js';
import { startTimer, stopTimer, startWorkoutTimer, stopWorkoutTimer, resetWorkoutTimer } from './timers.js';
import { pauseWater, resumeWater } from './water.js';
import {
    theme, authView, show, onboard, strip, main, drawer,
  openEvolution, drawChart, renderConfigScreen, renderMascotScreen,
  showWelcome, updateWaterUI, updateMascotVisuals, renderWorkoutSelector,
  showMascotSpeech, triggerEvolution,
  pauseMascotFire, resumeMascotFire
} from './ui.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let unsubUser = null, unsubFeitos = null, unsubFotos = null;
let isAppInitialized = false;
let bootRetryCount = 0;
let waterReminderInterval = null;
let waterReminderNextTime = 0;

// ✅ NOVO: Helper para vibração segura
const vibrate = (pattern) => {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch(e) {}
  }
};

window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled Rejection:', e.reason);
  showToast('Erro inesperado no app. Verifique sua conexão.', 'error');
});

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

function isUserTyping() {
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

function scheduleEvolutionFallback() {
  const evoRef = state.pendingEvolution;
  if (!evoRef) return;
  setTimeout(() => {
    if (state.pendingEvolution === evoRef) {
      state.pendingEvolution = null;
      try { updateMascotVisuals(); } catch (e) { console.error(e); }
    }
  }, 15000);
}

/* ============================================================
   Lembretes de Água
   ============================================================ */

async function scheduleNativeTrigger() {
  if (!('showTrigger' in Notification.prototype)) return; 
  try {
    const reg = await navigator.serviceWorker.ready;
    const timeInMs = (state.waterReminderTime || 60) * 60 * 1000;
    
    for (let i = 1; i <= 12; i++) {
      const timestamp = Date.now() + (timeInMs * i);
      const trigger = new TimestampTrigger(timestamp);
      await reg.showNotification("Hora de beber água! 💧", {
        body: "Mantenha sua meta diária em dia.",
        icon: "icon-192x192.png",
        tag: "water-reminder-" + timestamp,
        showTrigger: trigger,
        data: { url: "/" }
      });
    }
  } catch (e) { console.error("Trigger error:", e); }
}

function startWaterReminderTimer() {
  if (waterReminderInterval) clearInterval(waterReminderInterval);
  const timeInMinutes = state.waterReminderTime || 60;
  const timeInMs = timeInMinutes * 60 * 1000;
  
  waterReminderNextTime = Date.now() + timeInMs;

  scheduleNativeTrigger();

  waterReminderInterval = setInterval(() => {
    if (Date.now() >= waterReminderNextTime) {
      waterReminderNextTime = Date.now() + timeInMs;
      
      if (document.visibilityState === 'visible' && state.P && state.waterCurrent < state.waterGoal) {
        if (Notification.permission === "granted") {
          vibrate([200, 100, 200]); // ✅ Vibração no lembrete
          new Notification("Hora de beber água! 💧", {
            body: `Faltam ${state.waterGoal - state.waterCurrent}ml para você bater a meta de hoje.`,
            icon: "icon-192x192.png"
          });
        }
      }
    }
  }, 10000); 
}

async function toggleWaterReminder() {
  if (!("Notification" in window)) {
    showToast("Seu celular não suporta notificações.", "error");
    return;
  }
  if (!state.waterReminder) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      state.waterReminder = true;
      state.P.waterReminder = true;
      persist({ waterReminder: true }); 
      showToast("Lembretes ativados!", "success");
      startWaterReminderTimer();
    } else {
      showToast("Você precisa permitir as notificações nas configurações do celular.", "error");
    }
  } else {
    state.waterReminder = false;
    state.P.waterReminder = false;
    persist({ waterReminder: false });
    if (waterReminderInterval) clearInterval(waterReminderInterval);
    waterReminderInterval = null;
    showToast("Lembretes desativados.", "info");
  }
  drawer();
}

/* ============================================================
   Autenticação
   ============================================================ */

async function go() {
  const u = $("au").value.trim().toLowerCase();
  const p = $("ap").value;
  const e = $("ae");
  e.textContent = "";

  if (!/^[a-z0-9_]{3,20}$/.test(u)) return e.textContent = "Usuário: 3 a 20 letras minúsculas, números ou _.";
  if (p.length < 6) return e.textContent = "A senha precisa de pelo menos 6 caracteres.";

  const em = u + "@meutreino.app";
  const btn = $("ago");
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Entrando...';
  }

  try {
    if (state.tab === "up") {
      await createUserWithEmailAndPassword(auth, em, p);
    } else {
      await signInWithEmailAndPassword(auth, em, p);
    }
    vibrate(50); // ✅ Vibração no login
  } catch (x) {
    const c = x.code || "";
    e.textContent =
      c.includes("email-already") ? "Esse usuário já existe." :
      c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") ? "Usuário ou senha incorretos." :
      c.includes("network") ? "Sem conexão. Tente de novo." :
      "Erro: " + c;
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalText || "Entrar"; }
  } finally {
    if (btn && btn.disabled && auth.currentUser) {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || "Entrar";
    }
  }
}

function calculateStreakAndMisses() {
  if (!state.P) return;
  if (!state.P.tipo || !state.F_loaded) return;

  const createdAt = state.P.createdAt || 0;
  const today = new Date();
  const k0 = key(today);
  let streak = 0, misses = 0, counting = true;

  for (let i = 0; i <= 90; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    if (d.getTime() < createdAt) break;
    const k = key(d);
    if (state.P.rest.includes(mi(d)) && !state.F[k]) continue; 
    const isToday = (k === k0);

    if (state.F[k]) {
      if (counting) streak++;
    } else if (!isToday) {
      misses++;
      counting = false;
    }
  }
  state.P.streak = streak;
  state.P.misses = misses;
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

async function boot(user) {
  try {
    state.uid = user.uid;
  
    $("splash")?.classList.remove("hide");
    $("auth").hidden = true;
    $("app").hidden = true;

    await ensureUserDoc(user);
    bootRetryCount = 0;

    if (unsubUser) unsubUser();
    if (unsubFeitos) unsubFeitos();
    if (unsubFotos) unsubFotos();
    isAppInitialized = false;
    state.P = null;
    state.F = {};
    state.F_loaded = false;

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

      if (state.P.waterReminder && !waterReminderInterval) {
        startWaterReminderTimer();
      }

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

      if (isUserTyping()) {
        if (prevWater !== newWater) updateWaterUI();
        if (prevMain !== newMain) updateMascotVisuals();
      } else {
        if (prevCal !== newCal) {
          theme(); strip(); main();
          if ($("dr").classList.contains("on") && $("dr").dataset.view === "main") drawer();
        } else if (prevMain !== newMain) {
          theme(); main();
          if ($("dr").classList.contains("on") && $("dr").dataset.view === "main") drawer();
        }
        if (prevWater !== newWater) updateWaterUI();
        if (prevMain !== newMain) updateMascotVisuals();
      }
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
        if (!document.querySelector('.animating')) strip();
        main();
        updateMascotVisuals();
      }
    });

    unsubFotos = onSnapshot(collection(db, "users", state.uid, "fotos"), (snap) => {
      const prevKeys = Object.keys(state.cache).sort().join(',');
      state.cache = {};
      snap.forEach(p => state.cache[p.id] = p.data().d);
      const newKeys = Object.keys(state.cache).sort().join(',');
      if (isAppInitialized && prevKeys !== newKeys) {
        document.querySelectorAll("img[data-f]").forEach(im => {
          const d = state.cache[im.dataset.f];
          if (d) im.src = d;
        });
      }
    });

  } catch (error) {
    console.error("boot:", error);
    bootRetryCount++;
    if (bootRetryCount >= 3) {
      showToast("Não foi possível sincronizar. Recarregue o app.", "error");
      const splash = $("splash");
      if (splash) splash.classList.add("hide");
      return;
    }
    showToast("Erro ao carregar. Tentando novamente...", "error");
    if (navigator.onLine) {
      setTimeout(() => boot(user).catch(() => {}), 3000);
    } else {
      window.addEventListener('online', () => boot(user).catch(() => {}), { once: true });
    }
  }
}

const open = o => {
  $("dr").classList.toggle("on", o);
  $("ov").classList.toggle("on", o);
  $("dr").inert = !o;
  $("ov").inert = !o;
  if (!o) {
    state.draft = "";
    state.exDetail = false;
    state.editingExIndex = null;
    $("dr").dataset.view = "main";
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
  }
};

const refresh = () => {
  if (isUserTyping()) {
    updateWaterUI();
    updateMascotVisuals();
    return;
  }
  theme(); strip();
  const d = pd(state.sel);
  state.letter = state.F[state.sel]?.letter || state.forcedLetter || getWorkoutForDate(d);
  if (state.inWorkoutMode) {
    $("app").classList.add("workout-mode");
    const balloon = document.getElementById('mascotBalloon');
    if (balloon) balloon.classList.remove('show');
    document.getElementById('app-body').style.overflowY = 'auto';
  } else {
    $("app").classList.remove("workout-mode");
    document.getElementById('app-body').style.overflowY = '';
    if (state.workoutTimerInterval) { clearInterval(state.workoutTimerInterval); state.workoutTimerInterval = null; }
  }
  main();
  if ($("dr").classList.contains("on") && $("dr").dataset.view === "main") drawer();
  updateWaterUI();
};

const fechaModal = () => {
  const modais = ["md", "mdW", "mdName", "mdAvatar", "mdWelcome", "mdDeleteAccount"];
  modais.forEach(id => {
    const el = $(id);
    if (el) el.classList.remove("on");
  });
  const ov = $("ov");
  if (ov) ov.classList.remove("on");
};

async function handleWaterClicks(t, D) {
  if (t.id === "btnAddWater") {
    const todayKey = key(new Date());
    if (state.lastWaterDate !== todayKey) {
      state.waterCurrent = 0;
      state.lastWaterDate = todayKey;
      state.P.waterCurrent = 0;
      state.P.lastWaterDate = todayKey;
      state.pendingWater = null;
    }

    let newCurrent = state.waterCurrent + state.waterSize;
    if (newCurrent > state.waterGoal) newCurrent = state.waterGoal;
    state.waterCurrent = newCurrent;
    state.P.waterCurrent = newCurrent;
    state.pendingWater = newCurrent; 
    persist({ waterCurrent: newCurrent, waterGoal: state.waterGoal, lastWaterDate: state.lastWaterDate });
    updateWaterUI();
    vibrate(10); // ✅ Vibração sutil na água
    return true;
  }
  if (t.id === "btnWaterSettings") {
    $("dr").dataset.view = "water";
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
    drawer();
    return true;
  }
  if (t.id === "btnWaterBack") {
    $("dr").dataset.view = "main";
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
    drawer();
    return true;
  }
  if (t.id === "btnWaterCopo") {
    state.waterType = 'copo';
    state.showWaterSizeInput = true;
    state.showWaterGoalInput = false;
    drawer();
    return true;
  }
  if (t.id === "btnWaterGarrafa") {
    state.waterType = 'garrafa';
    state.showWaterSizeInput = true;
    state.showWaterGoalInput = false;
    drawer();
    return true;
  }
  if (t.id === "btnEditWaterMode") {
    state.showWaterGoalInput = true;
    state.showWaterSizeInput = false;
    drawer();
    return true;
  }
  if (t.id === "btnToggleReminder") {
    toggleWaterReminder();
    return true;
  }
   if (D.reminderTime) {
    state.waterReminderTime = +D.reminderTime;
    state.P.waterReminderTime = +D.reminderTime;
    persist({ waterReminderTime: +D.reminderTime, waterReminder: state.waterReminder });
    startWaterReminderTimer();
    drawer();
    return true;
  }
  if (t.id === "saveWaterDrawer") {
    let newGoal = state.waterGoal, newSize = state.waterSize;
    if ($("waterGoalInput")) {
      const v = parseFloat($("waterGoalInput").value.replace(',', '.'));
      if (v > 0) newGoal = state.waterType === 'copo' ? v : v * 1000;
    }
    if ($("waterSizeInput")) {
      const v = parseFloat($("waterSizeInput").value.replace(',', '.'));
      if (v > 0) newSize = state.waterType === 'copo' ? v : v * 1000;
    }
    state.waterGoal = newGoal;
    state.waterSize = newSize;
    state.P.waterGoal = newGoal;
    state.P.waterSize = newSize;
    state.P.waterType = state.waterType;
    if (state.waterCurrent > state.waterGoal) state.waterCurrent = state.waterGoal;
    state.P.waterCurrent = state.waterCurrent;
    state.pendingWater = state.waterCurrent;
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
    drawer(); updateWaterUI();
    persist({
      waterGoal: newGoal,
      waterSize: newSize,
      waterType: state.waterType,
      waterCurrent: state.waterCurrent
    });
    return true;
  }
  return false;
}

async function handleDeleteAccount() {
  if (!state.uid || !auth.currentUser) return;
  const btn = $("btnConfirmDelete");
  const pass = $("deletePasswordInput").value;
  if (!pass) {
    showToast("Digite sua senha para confirmar.", "error");
    return;
  }
  btn.textContent = "Verificando...";
  btn.disabled = true;
  try {
    const uid = state.uid;
    const credential = EmailAuthProvider.credential(auth.currentUser.email, pass);
    await reauthenticateWithCredential(auth.currentUser, credential);
    btn.textContent = "Excluindo...";
    const fotosSnap = await getDocs(collection(db, "users", uid, "fotos"));
    await Promise.all(fotosSnap.docs.map(d => deleteDoc(doc(db, "users", uid, "fotos", d.id))));
    const feitosSnap = await getDocs(collection(db, "users", uid, "feitos"));
    await Promise.all(feitosSnap.docs.map(d => deleteDoc(doc(db, "users", uid, "feitos", d.id))));
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(auth.currentUser);
    fechaModal();
    showToast("Sua conta foi excluída com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      showToast("Senha incorreta. A conta NÃO foi excluída.", "error");
    } else {
      showToast("Erro ao excluir conta. Tente novamente.", "error");
    }
    btn.textContent = "SIM, EXCLUIR TUDO";
    btn.disabled = false;
  }
}

async function handleDrawerAndModals(t, D) {
  try {
    if (t.id === "btnCloseMenu") { open(false); return true; }
    if (t.id === "btn-evolution") { openEvolution(); return true; }
    if (t.id === "evoBack") {
      if ($("evoChartArea").style.display === "block") {
        $("evoChartArea").style.display = "none";
        $("evoList").style.display = "block";
        $("evoTitle").textContent = "Seus Exercícios";
      } else $("evoScreen").classList.remove("on");
      return true;
    }
    if (D.chart) { drawChart(D.chart); return true; }
    if (t.id === "btn-open-config") {
      open(false);
      state.inConfigMode = true;
      state.configDetail = false;
      renderConfigScreen();
      return true;
    }
    if (t.id === "configBack") {
      if (state.configDetail) { state.configDetail = false; renderConfigScreen(); }
      else { state.inConfigMode = false; renderConfigScreen(); refresh(); }
      return true;
    }
    if (t.id === "mascotBtn") { state.inMascotMode = true; renderMascotScreen(); return true; }
    if (t.id === "mascotBack") { state.inMascotMode = false; renderMascotScreen(); return true; }
    if (t.id === "saveMascotData") {
      state.P.mascotName = $("mascotNameInput").value.trim();
      state.P.guardianName = $("guardianNameInput").value.trim();
      persist({ mascotName: state.P.mascotName, guardianName: state.P.guardianName });
      showToast("Dados do mascote salvos!", "success");
      state.inMascotMode = false;
      renderMascotScreen();
      main(); drawer();
      return true;
    }
    if (t.id === "btnAvatar") {
      if (state.P.avatar) {
        $("btnChangeAvatar").textContent = "Alterar Foto de Perfil";
        $("btnRemoveAvatar").style.display = "block";
      } else {
        $("btnChangeAvatar").textContent = "Adicionar Nova Foto de Perfil";
        $("btnRemoveAvatar").style.display = "none";
      }
      $("ov").classList.add("on");
      $("mdAvatar").classList.add("on");
      return true;
    }
    if (t.id === "btnChangeAvatar") { fechaModal(); $("fiAvatar").click(); return true; }
    if (t.id === "btnRemoveAvatar") {
      state.P.avatar = "";
      persist({ avatar: "" });
      fechaModal(); drawer();
      return true;
    }
    if (t.id === "saveName") {
      const val = $("nameInput").value.trim();
      if (val) {
        state.P.displayName = val;
        state.P.nameSet = true;
        state.P.lastWelcome = key(new Date());
        persist({
          displayName: val,
          nameSet: true,
          lastWelcome: state.P.lastWelcome
        });
        fechaModal();
        drawer();
        showWelcome();
      }
      return true;
    }
    if (t.id === "btnCloseWelcome") { fechaModal(); return true; }
    if (t.id === "saveTitles") {
      const nt = {};
      LT().forEach(l => {
        const v = $(`title_${l}`).value.trim();
        if (v) nt[l] = v;
      });
      state.P.customTitles = nt;
      persist({ customTitles: nt });
      showToast("Nomes dos treinos salvos!", "success");
      renderConfigScreen(); refresh();
      return true;
    }
    
    if (t.id === "btnDeleteAccount") {
      $("ov").classList.add("on");
      $("mdDeleteAccount").classList.add("on");
      $("deletePasswordInput").value = "";
      return true;
    }
    if (t.id === "btnCancelDelete") {
      fechaModal();
      return true;
    }
    if (t.id === "btnConfirmDelete") {
      handleDeleteAccount();
      return true;
    }
    if (t.id === "out") {
      open(false);
      state.exDetail = false;
      stopTimer();
      resetWorkoutTimer();
      if (waterReminderInterval) { clearInterval(waterReminderInterval); waterReminderInterval = null; }
      if (unsubUser) unsubUser();
      if (unsubFeitos) unsubFeitos();
      if (unsubFotos) unsubFotos();
      isAppInitialized = false;
      const uidToClean = state.uid;
      if (uidToClean) {
        ["inWorkoutMode_", "sel_", "forcedLetter_", "completedExs_", "workout_start_"].forEach(p =>
          localStorage.removeItem(p + uidToClean)
        );
      }
      resetState();
      state.uid = null;
      state.tab = "in";
      await signOut(auth);
      return true;
    }
    if (t.id === "menu") { open(true); return true; }
    if (t.id === "ov") { open(false); fechaModal(); return true; }
    if (D.th) { state.P.tema = D.th; theme(); drawer(); persist({ tema: D.th }); return true; }
    if (D.ac) { state.P.ac = D.ac; theme(); drawer(); persist({ ac: D.ac }); return true; }
    if (D.rest2 !== undefined) {
      const day = +D.rest2;
      if (!Array.isArray(state.P.rest)) state.P.rest = [];
      if (state.P.rest.includes(day)) {
        if (state.P.rest.length > 1) state.P.rest = state.P.rest.filter(d => d !== day);
        else { showToast("Você precisa ter pelo menos 1 dia de repouso.", "info"); return true; }
      } else {
        const maxRest = 7 - (state.P.freq || 0);
        if (state.P.rest.length >= maxRest) {
          showToast(`Máximo ${maxRest} repouso(s) para ${state.P.freq} treino(s)/semana.`, "info");
          return true;
        }
        state.P.rest.push(day);
        state.P.rest.sort();
      }
      persist({ rest: state.P.rest });
      drawer(); main();
      return true;
    }
    if (D.resttime) {
      state.P.restTime = +D.resttime;
      persist({ restTime: state.P.restTime });
      drawer();
      return true;
    }
    return false;
  } catch (err) {
    console.error("handleDrawerAndModals:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}

async function handleWorkoutAndConfig(t, D) {
  try {
    if (t.id === "btn-workout-rest" || t.id === "btn-change-workout") {
      if (state.sel > key(new Date())) {
        showToast("Você só pode iniciar treinos a partir de hoje.", "info");
        return true;
      }
      state.inSelectorMode = true;
      renderWorkoutSelector();
      return true;
    }
    if (t.id === "selectorBack") { state.inSelectorMode = false; renderWorkoutSelector(); return true; }
    if (D.selectWorkout) {
      const letter = D.selectWorkout;
      if ((state.P.ex[letter] || []).length === 0) {
        showToast(`O Treino ${letter} está vazio. Adicione exercícios antes.`, "info");
        return true;
      }
      state.inSelectorMode = false;
      renderWorkoutSelector();
      state.forcedLetter = letter;
      state.inWorkoutMode = true;
      state.completedExs.clear();
      localStorage.setItem("inWorkoutMode_" + state.uid, "true");
      localStorage.setItem("sel_" + state.uid, state.sel);
      localStorage.setItem("forcedLetter_" + state.uid, state.forcedLetter);
      localStorage.setItem("completedExs_" + state.uid, "[]");
      startWorkoutTimer();
      refresh();
      return true;
    }
    if (D.k) {
      const _ck = state.P.createdAt ? key(new Date(state.P.createdAt)) : null;
      if (_ck && D.k < _ck) return true;
      state.sel = D.k;
      state.forcedLetter = null;
      state.showLetterSelector = false;
      state.completedExs.clear();
      state.inWorkoutMode = false;
      state.pendDuration = null;
      resetWorkoutTimer();
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);
      localStorage.setItem("sel_" + state.uid, state.sel);
      refresh();
      return true;
    }
    if (D.exit) {
      state.inWorkoutMode = false;
      state.forcedLetter = null;
      state.completedExs.clear();
      resetWorkoutTimer();
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);
      refresh();
      return true;
    }
    if (t.id === "btn-change") { state.showLetterSelector = !state.showLetterSelector; main(); return true; }
    if (D.setLetter) {
      state.forcedLetter = D.setLetter;
      state.showLetterSelector = false;
      state.completedExs.clear();
      refresh();
      return true;
    }
    if (D.weight) {
      state.curExIndex = +D.weight;
      state.curExLetter = state.letter;
      const ex = state.P.ex[state.curExLetter][state.curExIndex];
      $("wName").textContent = ex.name;
      $("wInput").value = ex.w || "";
      $("wUnit").value = ex.wu || "kg";
      $("ov").classList.add("on");
      $("mdW").classList.add("on");
      return true;
    }
    if (D.timer) { startTimer(); return true; }
    if (t.id === "btnStopTimer") { stopTimer(); return true; }
    if (t.id === "btnDismissAlarm") { $("alarmOverlay").classList.remove("on"); return true; }
    if (D.chk) {
      const idx = +D.chk;
      if (state.completedExs.has(idx)) state.completedExs.delete(idx);
      else { state.completedExs.add(idx); vibrate(20); } // ✅ Vibração ao concluir exercício
      localStorage.setItem("completedExs_" + state.uid, JSON.stringify([...state.completedExs]));
      main();
      return true;
    }
    if (t.id === "wSave") {
      if (state.curExLetter && state.curExIndex !== null) {
        const ex = state.P.ex[state.curExLetter][state.curExIndex];
        ex.w = $("wInput").value.trim();
        ex.wu = $("wUnit").value;
        persist({ ex: state.P.ex });
        fechaModal();
        refresh();
      }
      return true;
    }
    if (D.open) {
      state.letter = D.open;
      state.configDetail = true;
      state.editingExIndex = null;
      state.draft = "";
      renderConfigScreen();
      return true;
    }
    if (t.id === "configDetailBack") {
      state.configDetail = false;
      state.editingExIndex = null;
      renderConfigScreen();
      return true;
    }
    if (D.edit !== undefined) { state.editingExIndex = +D.edit; renderConfigScreen(); return true; }
    if (t.id === "cancel-edit") { state.editingExIndex = null; state.draft = ""; renderConfigScreen(); return true; }
    if (D.up !== undefined) {
      const idx = +D.up;
      if (idx > 0) {
        const arr = state.P.ex[state.letter];
        [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
        persist({ ex: state.P.ex });
        renderConfigScreen();
      }
      return true;
    }
    if (D.down !== undefined) {
      const idx = +D.down;
      const arr = state.P.ex[state.letter];
      if (idx < arr.length - 1) {
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
        persist({ ex: state.P.ex });
        renderConfigScreen();
      }
      return true;
    }
    if (t.id === "done") {
      if (state.workoutStartTime || state.workoutTimerInterval) state.pendDuration = stopWorkoutTimer();
      else if (!state.pendDuration) state.pendDuration = "00:00:00";
      state.pend = state.sel;
      state.forcedLetter = t.dataset.letter;
      state.showLetterSelector = false;
      $("ov").classList.add("on");
      $("md").classList.add("on");
      return true;
    }
    if (t.id === "undo") {
      const o = state.F[state.sel];
      delete state.F[state.sel];
      if (state.P.animSeen && state.P.animSeen[state.sel]) {
        delete state.P.animSeen[state.sel];
        persist({ animSeen: state.P.animSeen });
      }
      state.forcedLetter = null;
      state.showLetterSelector = false;
      state.completedExs.clear();
      state.inWorkoutMode = false;
      state.pendDuration = null;
      resetWorkoutTimer();
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);
      refresh();
      deleteDoc(doc(db, "users", state.uid, "feitos", state.sel)).catch(err => {
        console.error(err);
        showToast("Erro ao desfazer treino no servidor.", "error");
      });
      if (o && o.fid) delFoto(o.fid);
      return true;
    }
    if (t.id === "mSave") {
      const k = state.pend;
      const l = (state.F[k] && state.F[k].letter) || state.forcedLetter ||
                getWorkoutForDate(pd(k)) || LT()[0];
      const curWeights = {};
      if (state.P.ex[l]) state.P.ex[l].forEach(e => {
        if (e.w) curWeights[e.id] = { v: e.w, u: e.wu || "kg" };
      });
      fechaModal();
      state.F[k] = { t: Date.now(), letter: l, weights: curWeights, duration: state.pendDuration || "00:00:00" };
      state.forcedLetter = null;
      state.completedExs.clear();
      state.inWorkoutMode = false;
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);

      const getLevel = (s) => s >= 10 ? 3 : s >= 5 ? 2 : s >= 1 ? 1 : 0;
      const oldStreak = state.P.streak || 0;
      const oldLevel = getLevel(oldStreak);
      calculateStreakAndMisses();
      const newStreak = state.P.streak || 0;
      const newLevel = getLevel(newStreak);

      if (newLevel > oldLevel) {
          state.pendingEvolution = { oldLevel, newLevel };
          scheduleEvolutionFallback();
      }
      refresh();
      setDoc(doc(db, "users", state.uid, "feitos", k), state.F[k]).catch(err => {
        console.error(err);
        showToast("Treino salvo localmente, sincroniza quando a rede voltar.", "error");
      });
      persist();
      vibrate([50, 50, 50]); // ✅ Vibração ao finalizar treino
      if (!navigator.onLine) showToast("Sem internet. Treino salvo local. Sincroniza depois.", "success");
      return true;
    }
    if (t.id === "mFoto") { $("fi").dataset.m = "done"; $("fi").click(); return true; }
    if (t.id === "np") { $("fi").dataset.m = "ex"; $("fi").click(); return true; }
    if (D.del !== undefined) {
      const x = state.P.ex[state.letter].splice(+D.del, 1)[0];
      delFoto(x && x.f);
      persist({ ex: state.P.ex });
      renderConfigScreen();
      return true;
    }
    if (t.id === "na") {
      const n = $("nn").value.trim();
      if (!n) { $("nn").focus(); return true; }
      const sets = $("ns").value.trim();
      if (state.editingExIndex !== null) {
        const ex = state.P.ex[state.letter][state.editingExIndex];
        ex.name = n;
        ex.sets = sets;
        if (state.draft) {
          const oldF = ex.f;
          try {
            ex.f = await putFoto(state.draft);
            if (oldF) delFoto(oldF);
          } catch (e) {
            console.error(e);
            showToast("Erro ao enviar foto.", "error");
          }
          state.draft = "";
        }
        state.editingExIndex = null;
        persist({ ex: state.P.ex });
        renderConfigScreen();
      } else {
        let fid = "";
        if (state.draft) {
          try { fid = await putFoto(state.draft); }
          catch (x) {
            console.error(x);
            showToast("Erro ao enviar foto. Tente uma imagem menor.", "error");
          }
        }
        state.P.ex[state.letter].push({ id: uidg(), name: n, sets, f: fid });
        state.draft = "";
        $("nn").value = "";
        $("ns").value = "";
        persist({ ex: state.P.ex });
        renderConfigScreen();
      }
      return true;
    }
    if (D.tipo2) {
      state.P.tipo = D.tipo2;
      state.letter = LT()[0];
      state.exDetail = false;
      persist({ tipo: state.P.tipo });
      renderConfigScreen();
      refresh();
      return true;
    }
    if (D.freq2) {
      const newFreq = +D.freq2;
      const maxRest = 7 - newFreq;
      if (state.P.rest.length > maxRest) {
        showToast(`Com ${newFreq} treinos/semana, máximo ${maxRest} repouso(s).`, "info");
        return true;
      }
      state.P.freq = newFreq;
      persist({ freq: newFreq });
      renderConfigScreen();
      refresh();
      return true;
    }
    return false;
  } catch (err) {
    console.error("handleWorkoutAndConfig:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}

async function handleOnboardingAndAuth(t, D) {
  try {
    if (D.tab) { state.tab = D.tab; authView(); return true; }
    if (t.id === "ago") { go(); return true; }
    if (D.back !== undefined) { state.ob.step = +D.back; onboard(); return true; }
    if (D.obt) { state.ob.tipo = D.obt; state.ob.step = 1; onboard(); return true; }
    if (D.obf) { state.ob.freq = +D.obf; state.ob.step = 2; onboard(); return true; }
    if (D.obqty) { state.ob.qty = +D.obqty; state.ob.days = []; state.ob.step = 3; onboard(); return true; }
    if (D.obd !== undefined) {
      const day = +D.obd;
      if (state.ob.days.includes(day)) state.ob.days = state.ob.days.filter(d => d !== day);
      else if (state.ob.days.length < state.ob.qty) state.ob.days.push(day);
      onboard();
      return true;
    }
    if (t.id === "saveRest") {
      if (state.ob.days.length === state.ob.qty) {
        if (state.isUpdate) {
          state.P.rest = [...state.ob.days].sort();
          persist({ rest: state.P.rest });
          state.isUpdate = false;
          state.P.needRestUpdate = false;
          show();
        } else {
          state.P.tipo = state.ob.tipo;
          state.P.freq = state.ob.freq;
          state.P.rest = [...state.ob.days].sort();
          state.letter = LT()[0];
          persist();
          show();
        }
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("handleOnboardingAndAuth:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}

document.addEventListener("click", async e => {
  const waterWidget = e.target.closest("#waterWidget");
  if (waterWidget && !e.target.closest("#btnAddWater")) {
    e.stopPropagation();
    $("dr").dataset.view = "water";
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
    open(true);
    drawer();
    return;
  }

  const startBtn = e.target.closest("[data-start]");
  if (startBtn) {
    e.stopPropagation();
    if (state.sel > key(new Date())) {
      showToast("Você só pode iniciar treinos a partir de hoje.", "info");
      return;
    }
    const isRest = state.P.rest.includes(mi(pd(state.sel)));
    if (isRest && !state.forcedLetter) {
      state.inSelectorMode = true;
      renderWorkoutSelector();
      return;
    }

    let letterToUse = state.forcedLetter ||
      (state.F[state.sel] && state.F[state.sel].letter) ||
      (isRest ? null : getWorkoutForDate(pd(state.sel)));

    if (!letterToUse || (state.P.ex[letterToUse] || []).length === 0) {
      showToast("Esse treino está vazio. Adicione exercícios antes de iniciar.", "info");
      return;
    }

    if (isRest) state.forcedLetter = letterToUse;
    state.inWorkoutMode = true;
    state.completedExs.clear();
    localStorage.setItem("inWorkoutMode_" + state.uid, "true");
    localStorage.setItem("sel_" + state.uid, state.sel);
    if (state.forcedLetter) localStorage.setItem("forcedLetter_" + state.uid, state.forcedLetter);
    else localStorage.removeItem("forcedLetter_" + state.uid);
    localStorage.setItem("completedExs_" + state.uid, "[]");
    startWorkoutTimer();
    refresh();
    return;
  }

  const t = e.target.closest("button,.ov");
  if (!t) return;
  const D = t.dataset;

  if (await handleWaterClicks(t, D)) return;
  if (await handleDrawerAndModals(t, D)) return;
  if (await handleWorkoutAndConfig(t, D)) return;
  if (await handleOnboardingAndAuth(t, D)) return;
});

document.addEventListener("change", e => {
  const t = e.target;

  if (t.id === "fiAvatar" && t.files[0]) {
    const file = t.files[0];
    t.value = ""; 
    img(file, async base64 => {
      setState({ avatar: base64 }, true);
      drawer();
    });
    return;
  }

  if (t.id === "fi" && t.files[0]) {
    const f = t.files[0], m = t.dataset.m; t.value = "";
    img(f, async u => {
      if (m === "ex") {
        state.draft = u;
        renderConfigScreen();
        return;
      }
      const k = state.pend;
      const l = (state.F[k] && state.F[k].letter) || state.forcedLetter ||
                getWorkoutForDate(pd(k)) || LT()[0];
      const curWeights = {};
      if (state.P.ex[l]) state.P.ex[l].forEach(ex => {
        if (ex.w) curWeights[ex.id] = { v: ex.w, u: ex.wu || "kg" };
      });
      fechaModal();
      try {
        const id = await putFoto(u);
        state.F[k] = {
          t: Date.now(),
          fid: id,
          letter: l,
          weights: curWeights,
          duration: state.pendDuration || "00:00:00"
        };
        state.forcedLetter = null;
        state.completedExs.clear();
        state.inWorkoutMode = false;
        localStorage.removeItem("inWorkoutMode_" + state.uid);
        localStorage.removeItem("forcedLetter_" + state.uid);
        localStorage.removeItem("completedExs_" + state.uid);

        const getLevel = (s) => s >= 10 ? 3 : s >= 5 ? 2 : s >= 1 ? 1 : 0;
        const oldStreak = state.P.streak || 0;
        const oldLevel = getLevel(oldStreak);
        calculateStreakAndMisses();
        const newStreak = state.P.streak || 0;
        const newLevel = getLevel(newStreak);

        if (newLevel > oldLevel) {
            state.pendingEvolution = { oldLevel, newLevel };
            scheduleEvolutionFallback();
        }
        await setDoc(doc(db, "users", state.uid, "feitos", k), state.F[k]);
        persist();
        vibrate([50, 50, 50]); // ✅ Vibração ao finalizar com foto
      } catch (x) {
        console.error(x);
        showToast("Erro ao salvar a foto de prova.", "error");
      }
      refresh();
    });
  }
});

document.addEventListener("submit", e => {
  if (e.target.id === "authForm") {
    e.preventDefault();
    go();
  }
});

document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.closest("#waterWidget")) {
    if (e.target.closest("#btnAddWater")) return;
    e.preventDefault();
    e.target.closest("#waterWidget").click();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    if (reg.waiting) {
      showToast("Nova versão pronta! Feche e abra o app para atualizar.", "success");
    }
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showToast("Nova versão baixada! Feche e abra o app.", "success");
        }
      });
    });
  }).catch(err => console.log('SW:', err));
}

if (!CONFIGURADO) {
  authView("Falta colar a configuração do Firebase no arquivo (veja o trecho firebaseConfig).");
} else {
  onAuthStateChanged(auth, async u => {
    if (u) {
      await boot(u);
    } else {
      $("splash").classList.add("hide");
      resetState();
      state.uid = null;
      state.tab = "in";
      authView();
    }
  });
}

window.addEventListener('online', () => {
  showToast("Conexão restaurada! Sincronizando dados...", "success");
});
window.addEventListener('offline', () => {
  showToast("Você está offline. O app continua salvando no celular.", "info");
});

let animationsPaused = false;

function updateAnimationPauseState() {
  const isBlocked = document.hidden ||
    document.querySelector('#dr.on') !== null ||
    document.querySelector('#ov.on') !== null ||
    document.querySelector('#configScreen.on') !== null ||
    document.querySelector('#evoScreen.on') !== null ||
    document.querySelector('#mascotScreen.on') !== null ||
    document.querySelector('#workoutSelectorScreen.on') !== null ||
    document.querySelector('#md.on') !== null ||
    document.querySelector('#mdW.on') !== null ||
    document.querySelector('#mdName.on') !== null ||
    document.querySelector('#mdAvatar.on') !== null ||
    document.querySelector('#mdWelcome.on') !== null ||
    document.querySelector('#mdDeleteAccount.on') !== null;

  if (isBlocked && !animationsPaused) {
    animationsPaused = true;
    pauseWater();
    pauseMascotFire();
  } else if (!isBlocked && animationsPaused) {
    animationsPaused = false;
    resumeWater();
    resumeMascotFire();
  }
}

const uiElementsToObserve = [
  'dr', 'ov', 'configScreen', 'evoScreen', 'mascotScreen', 'workoutSelectorScreen',
  'md', 'mdW', 'mdName', 'mdAvatar', 'mdWelcome', 'mdDeleteAccount'
];

const uiObserver = new MutationObserver(() => {
  updateAnimationPauseState();
});

uiElementsToObserve.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    uiObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
  }
});

document.addEventListener('visibilitychange', () => {
  updateAnimationPauseState();
});