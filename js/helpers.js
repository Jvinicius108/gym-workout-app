import { state } from './state.js';
import { $, pd, getWorkoutForDate } from './utils.js';
import { theme, strip, main, drawer, updateWaterUI, updateMascotVisuals } from './ui.js';

export function isUserTyping() {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
}

let renderTimer = null;
export function scheduleRender(fn) {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderTimer = null;
    fn();
  }, 150);
}

export const open = o => {
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

export const refresh = () => {
  if (!state.P) return;
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

export const fechaModal = () => {
  // ✅ AQUI ESTÁ A CORREÇÃO: Adicionado o "mdTicket" na lista!
  const modais = ["md", "mdW", "mdName", "mdAvatar", "mdWelcome", "mdDeleteAccount", "mdLinkExercise", "mdSupersetWarning", "mdSwapExercise", "mdAddSubstitute", "mdAdminAddSub", "mdTicket"];
  modais.forEach(id => {
    const el = $(id);
    if (el) el.classList.remove("on");
  });
  const ov = $("ov");
  if (ov) ov.classList.remove("on");
};