import { auth, CONFIGURADO } from './config.js';
import { state, setState, resetState } from './state.js';
import { $, key, mi, pd, getWorkoutForDate, showToast } from './utils.js';
import { img, putFoto } from './db.js';
import { finishWorkout } from './streak.js';
import { refresh, fechaModal } from './helpers.js';
import {
  authView, drawer, renderWorkoutSelector,
  pauseMascotFire, resumeMascotFire
} from './ui.js';
import { renderConfigScreen } from './ui-settings.js';
import { boot } from './sync.js';
import { startWorkoutTimer } from './timers.js';
import { pauseWater, resumeWater } from './water.js';
import { handleWaterClicks } from './handlers/water.js';
import { handleDrawerAndModals } from './handlers/drawer.js';
import { handleWorkoutAndConfig } from './handlers/workout.js';
import { handleOnboardingAndAuth } from './handlers/onboarding.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled Rejection:', e.reason);
  showToast('Erro inesperado no app. Verifique sua conexão.', 'error');
});

window.addEventListener('error', e => {
  console.error('JS Error:', e.error || e.message, e.filename, e.lineno);
});

document.addEventListener("click", async e => {
  const waterWidget = e.target.closest("#waterWidget");
  if (waterWidget && !e.target.closest("#btnAddWater")) {
    e.stopPropagation();
    $("dr").dataset.view = "water";
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
    const { open } = await import('./helpers.js');
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
    const f = t.files[0], m = t.dataset.m;
    t.value = "";
    img(f, async u => {
      if (m === "ex") {
        state.draft = u;
        renderConfigScreen();
        return;
      }
      const k = state.pend;
      if (!k) return;
      fechaModal();
      try {
        const id = await putFoto(u);
        await finishWorkout(k, id);
      } catch (x) {
        console.error(x);
        showToast("Erro ao salvar a foto de prova.", "error");
      }
    });
  }
});

document.addEventListener("submit", e => {
  if (e.target.id === "authForm") {
    e.preventDefault();
    import('./auth.js').then(({ go }) => go());
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
  const hadControllerAtLoad = !!navigator.serviceWorker.controller;
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtLoad) return;
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  navigator.serviceWorker.register('./sw.js').then(reg => {
    let toastShown = false;

    const showUpdateToast = () => {
      if (toastShown) return;
      toastShown = true;
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast info';
      toast.setAttribute('role', 'status');
      toast.style.cssText = 'pointer-events:auto;align-items:center;';

      const icon = document.createElement('span');
      icon.style.fontSize = '18px';
      icon.textContent = '🔄';

      const text = document.createElement('span');
      text.style.flex = '1';
      text.textContent = 'Nova versão disponível';

      const btn = document.createElement('button');
      btn.textContent = 'Atualizar';
      btn.style.cssText = 'background:var(--ac);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-weight:700;font-size:0.8125rem;cursor:pointer;flex-shrink:0;';
      btn.onclick = () => {
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        toast.remove();
      };

      toast.appendChild(icon);
      toast.appendChild(text);
      toast.appendChild(btn);
      container.appendChild(toast);
    };

    if (reg.waiting) showUpdateToast();

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast();
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

window.addEventListener('online', async () => {
  showToast("Conexão restaurada! Sincronizando dados...", "success");
  try {
    const { processPhotoUploadQueue } = await import('./db.js');
    await processPhotoUploadQueue();
  } catch (e) { /* ignora */ }
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