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
import { boot, cleanupSubscriptions } from './sync.js';
import { startWorkoutTimer } from './timers.js';
import { pauseWater, resumeWater } from './water.js';
import { handleWaterClicks } from './handlers/water.js';
import { handleDrawerAndModals } from './handlers/drawer.js';
import { handleWorkoutAndConfig } from './handlers/workout.js';
import { handleOnboardingAndAuth } from './handlers/onboarding.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { renderAdminScreen } from './ui-admin.js';

window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled Rejection:', e.reason);
  showToast('Erro inesperado no app. Verifique sua conexão.', 'error');
});

window.addEventListener('error', e => {
  console.error('JS Error:', e.error || e.message, e.filename, e.lineno);
});

// ✅ ARRAY PARA AS ANIMAÇÕES DE NEVE
let snowAnims = [];

// ✅ FUNÇÃO PARA INICIAR OS CHAPÉUS DE NATAL
function initSantaHats() {
    if (!document.body.classList.contains('theme-christmas')) return;
    if (!window.lottie) return;

    document.querySelectorAll('.santa-hat').forEach(hat => {
        if (hat.dataset.loaded) return;
        hat.dataset.loaded = 'true';
        
        window.lottie.loadAnimation({
            container: hat,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'js/christmas_hat.json'
        });
    });
}
// ✅ TUNER DA NEVE — aplicado antes de carregar no Lottie
function tuneSnowflakes(data, opts = {}) {
  const {
    scale = 0.5,          // multiplicador de tamanho (<1 = menores)
    flakesPerGroup = 6,   // quantos flocos manter por grupo (original: 16)
    groups = 2            // quantos grupos na cena (original: 3)
  } = opts;

  const comp = data.assets?.find(a => a.id === 'comp_0');

  // 1) Reduzir flocos por grupo
  if (comp && comp.layers.length > flakesPerGroup) {
    comp.layers = comp.layers.slice(0, flakesPerGroup);
  }

  // 2) Reduzir grupos (instâncias de comp_0 no layer raiz)
  if (Array.isArray(data.layers) && data.layers.length > groups) {
    data.layers = data.layers.slice(0, groups);
  }

  // 3) Reduzir escala de cada floco
  if (comp) {
    comp.layers.forEach(layer => {
      const s = layer.ks?.s?.k;
      if (Array.isArray(s)) {
        s[0] *= scale;
        s[1] *= scale;
      }
    });
  }

  return data;
}

function applyHolidayTheme() {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const dia = hoje.getDate();
    const snowContainer = document.getElementById('snow-container');
    
    // Limpa temas anteriores
    document.body.classList.remove('theme-halloween', 'theme-christmas', 'theme-newyear');
    
    const clearSnow = () => {
        snowAnims.forEach(anim => { try { anim.destroy(); } catch(e){} });
        snowAnims = [];
        if (snowContainer) snowContainer.innerHTML = '';
    };

     // Em app.js, dentro de applyHolidayTheme():
    // 🎅 NATAL (01 a 26 de Dezembro)
    if (mes === 12 && dia >= 1 && dia <= 26) { 
        document.body.classList.add('theme-christmas'); 
        clearSnow();
        
        // ✅ ALTERAÇÃO AQUI: Passa o nome do usuário para o tema de Natal
        const nomeUsuario = (state.P && (state.P.displayName || state.P.nome)) ? (state.P.displayName || state.P.nome) : "Atleta";
        
        if (typeof initChristmasTheme === 'function') {
            initChristmasTheme(snowContainer, nomeUsuario);
        }
    } 
    // 🎃 HALLOWEEN (20 a 31 de Outubro)
    else if (mes === 10 && dia >= 20 && dia <= 31) { 
        document.body.classList.add('theme-halloween'); 
        clearSnow();
        if (typeof initHalloweenTheme === 'function') initHalloweenTheme(snowContainer);
    } 
    // 🥂 ANO NOVO (01 a 10 de Janeiro)
    else if (mes === 1 && dia >= 1 && dia <= 10) { 
        document.body.classList.add('theme-newyear'); 
        clearSnow();
        if (typeof initNewYearTheme === 'function') initNewYearTheme(snowContainer);
    } 
    // DIAS NORMAIS
    else {
        clearSnow();
    }
}
document.addEventListener("click", async e => {
  const target = e.target;

  if (target.id === "gifLightbox" || (target.closest("#gifLightbox") && target.tagName !== "IMG")) {
    $("gifLightbox").classList.remove("on");
    setTimeout(() => { $("gifLightboxImg").src = ""; }, 300);
    return;
  }

  const elementoClicado = target.closest('button, .ov, [data-start], [data-zoom="true"], #waterWidget');
  
  if (!elementoClicado) return;

  if (elementoClicado.dataset.zoom === "true") {
    const src = elementoClicado.src || elementoClicado.dataset.src;
    if (src) {
      $("gifLightboxImg").src = src;
      $("gifLightbox").classList.add("on");
    }
    return;
  }

  if (elementoClicado.id === "waterWidget") {
    e.stopPropagation();
    $("dr").dataset.view = "water";
    state.showWaterSizeInput = false;
    state.showWaterGoalInput = false;
    const { open } = await import('./helpers.js');
    open(true);
    drawer();
    return;
  }

  // C) Botão de Iniciar Treino
  if (elementoClicado.dataset.start) {
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

  // D) SE FOR UM BOTÃO NORMAL OU OVERLAY (.ov), REPASSA PARA OS HANDLERS
  const D = elementoClicado.dataset;

  if (await handleWaterClicks(elementoClicado, D)) return;
  if (await handleDrawerAndModals(elementoClicado, D)) return;
  if (await handleWorkoutAndConfig(elementoClicado, D)) return;
  if (await handleOnboardingAndAuth(elementoClicado, D)) return;
});

document.addEventListener("change", e => {
  const t = e.target;

  if (t.id === "exIsCardio") {
    const isCardio = t.checked;
    if ($("exStrengthFields")) $("exStrengthFields").style.display = isCardio ? 'none' : 'flex';
    if ($("exCardioFields")) $("exCardioFields").style.display = isCardio ? 'block' : 'none';
    return;
  }

  if (t.id === "subIsCardio") {
    const isCardio = t.checked;
    if ($("subStrengthFields")) $("subStrengthFields").style.display = isCardio ? 'none' : 'flex';
    if ($("subCardioFields")) $("subCardioFields").style.display = isCardio ? 'block' : 'none';
    return;
  }

  if (t.id === "fiSubstitute" && t.files[0]) {
    const f = t.files[0];
    t.value = "";
    img(f, (base64) => {
      state.pendingSubstitutePhoto = base64;
      const preview = $("subPhotoPreview");
      if (preview) {
        preview.src = base64;
        preview.style.display = "block";
      }
    });
    return;
  }

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

if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  let refreshing = false;
  let userRequestedUpdate = false; // ✅ VARIÁVEL DECLARADA AQUI NO TOPO

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Só recarrega se o usuário tiver clicado no botão de atualizar
    if (!userRequestedUpdate) return;
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
      text.style.marginLeft = '10px';

      const btn = document.createElement('button');
      btn.textContent = 'Atualizar';
      btn.style.cssText = 'background:var(--ac);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-weight:700;font-size:0.8125rem;cursor:pointer;flex-shrink:0;';
      
      btn.onclick = () => {
        userRequestedUpdate = true; // ✅ AVISA QUE O USUÁRIO PEDIU A ATUALIZAÇÃO
        btn.textContent = 'Atualizando...';
        btn.disabled = true;
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
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
    applyHolidayTheme(); // ✅ Aplica o tema comemorativo assim que o app carrega
    
    if (u) {
      if (u.uid === "Y5WAFq09SZfYoA0kz0Uk5Q71o8p1") {
        $("splash").classList.add("hide");
        await renderAdminScreen();
      } else {
        await boot(u);
      }
    } else {
      // ✅ Limpeza forçada quando o usuário sai ou o token expira
      const adminScreen = document.getElementById("adminScreen");
      if (adminScreen) adminScreen.remove();

      cleanupSubscriptions();
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
    document.querySelector('#mdDeleteAccount.on') !== null ||
    document.querySelector('#mdAddSubstitute.on') !== null;

  if (isBlocked && !animationsPaused) {
    animationsPaused = true;
    pauseWater();
    pauseMascotFire();
    // ✅ A NEVE NÃO É PAUSADA AQUI, ELA CONTINUA FLUIDA
  } else if (!isBlocked && animationsPaused) {
    animationsPaused = false;
    resumeWater();
    resumeMascotFire();
    // ✅ A NEVE NÃO É RETOMADA AQUI, POIS NUNCA FOI PAUSADA
  }
}

const uiElementsToObserve = [
  'dr', 'ov', 'configScreen', 'evoScreen', 'mascotScreen', 'workoutSelectorScreen',
  'md', 'mdW', 'mdName', 'mdAvatar', 'mdWelcome', 'mdDeleteAccount', 'mdAddSubstitute'
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

// ===== REATIVIDADE DO STATE (Ouvinte Global) =====
window.addEventListener('state:changed', async (e) => {
  const { property, value } = e.detail;
  
  // Importamos os dois arquivos necessários
  const ui = await import('./ui.js');
  const helpers = await import('./helpers.js');

  // 1. ÁGUA
  if (property === 'waterCurrent' || property === 'waterGoal') {
    ui.updateWaterUI();
  }

  // 2. MODO TREINO (Ativar/Desativar tela de treino)
  if (property === 'inWorkoutMode') {
    helpers.refresh(); // <-- CORREÇÃO: Agora chamamos do helpers.js!
  }

  // 3. SELETOR DE TREINOS (Modal de descanso/troca)
  if (property === 'inSelectorMode') {
    ui.renderWorkoutSelector();
  }

  // 4. MODO CONFIGURAÇÃO E DETALHES DO EXERCÍCIO
  if (property === 'inConfigMode' || property === 'configDetail' || property === 'editingExIndex') {
    ui.renderConfigScreen();
  }

  // 5. MODO SUBSTITUTOS
  if (property === 'inSubstitutesMode') {
    ui.renderSubstitutesScreen();
  }

  // 6. MODO MASCOTE
  if (property === 'inMascotMode') {
    ui.renderMascotScreen();
  }
});
