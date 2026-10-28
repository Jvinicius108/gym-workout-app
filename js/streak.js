import { state } from './state.js';
import { pd, key, mi, LT, getWorkoutForDate, showToast, vibrate, isWeekCompensated } from './utils.js';
import { persist, sanitizeName } from './db.js'; // Import adicionado
import { refresh } from './helpers.js';
import { updateMascotVisuals } from './ui.js';
import { db } from './config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function calculateStreakAndMisses() {
  if (!state.P) return;
  if (!state.P.tipo || !state.F_loaded) return;

  const createdAt = state.P.createdAt || 0;
  const today = new Date();
  const k0 = key(today);
  let streak = 0, misses = 0, counting = true;
  
  const evaluatedWeeks = new Set();

  for (let i = 0; i <= 90; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    if (d.getTime() < createdAt) break;
    const k = key(d);
    
    if (state.P.rest.includes(mi(d)) && !state.F[k]) continue; 
    
    const isToday = (k === k0);

    if (state.F[k]) {
      if (counting) streak++;
    } else if (!isToday) {
      if (isWeekCompensated(d)) continue;
      
      const dayOfWeek = (d.getDay() + 6) % 7;
      const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek);
      const weekKey = key(monday);

      if (evaluatedWeeks.has(weekKey)) {
          if (counting) counting = false;
          continue;
      }

      evaluatedWeeks.add(weekKey);
      misses++;
      counting = false;
    }
  }
  state.P.streak = streak;
  state.P.misses = misses;
}

export function scheduleEvolutionFallback() {
  const evoRef = state.pendingEvolution;
  if (!evoRef) return;
  setTimeout(() => {
    if (state.pendingEvolution === evoRef) {
      state.pendingEvolution = null;
      try { updateMascotVisuals(); } catch (e) { console.error(e); }
    }
  }, 15000);
}

export async function finishWorkout(k, photoId) {
  if (!k || !state.P) return;

  const l = (state.F[k] && state.F[k].letter) || state.forcedLetter ||
            getWorkoutForDate(pd(k)) || LT()[0];

  const curWeights = {};
  
  // ✅ CORREÇÃO: Salva a carga do substituto se ele estiver ativo, senão salva do principal
  if (state.P.ex[l]) {
    state.P.ex[l].forEach((e, i) => {
      const swap = state.activeSwaps && state.activeSwaps[i];
      if (swap) {
          if (swap.w) {
              const subId = 'sub_' + sanitizeName(swap.name);
              curWeights[subId] = { v: swap.w, u: swap.wu || "kg", name: swap.name };
          }
      } else {
          if (e.w) curWeights[e.id] = { v: e.w, u: e.wu || "kg" };
      }
    });
  }

  const feito = {
    t: Date.now(),
    letter: l,
    weights: curWeights,
    duration: state.pendDuration || "00:00:00"
  };
  if (photoId) feito.fid = photoId;

  state.F[k] = feito;
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
  vibrate([50, 50, 50]);
  if (!navigator.onLine) {
    showToast("Sem internet. Treino salvo local. Sincroniza depois.", "success");
  }
}