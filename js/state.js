export const state = {
  uid: null,
  P: null,
  F: {},
  F_loaded: false,
  cache: {},
  sel: null,
  letter: "A",
  draft: "",
  pend: null,
  tab: "in",
  exDetail: false,
  ob: { step: 0, tipo: "", freq: 0, qty: 0, days: [] },
  isUpdate: false,
  forcedLetter: null,
  showLetterSelector: false,
  curExIndex: null,
  curExLetter: null,
  myChart: null,
  editingExIndex: null,
  completedExs: new Set(),
  inWorkoutMode: false,
  timerEndTime: null,
  timerInterval: null,
  audioCtx: null,
  workoutStartTime: null,
  workoutTimerInterval: null,
  pendDuration: null,
  inConfigMode: false,
  configDetail: false,
  inMascotMode: false,
  inSelectorMode: false,
  waterCurrent: 0,
  waterGoal: 3000,
  waterSize: 250,
  waterType: "copo",
  // ✅ NOVO: valor local otimista enquanto o write do Firestore está em trânsito.
  // Serve para evitar flicker quando o usuário clica +250ml rapidamente — sem
  // recorrer a Math.max, que bloqueava qualquer diminuição vinda do servidor.
  pendingWater: null,
  waterReminder: false,
  waterReminderTime: 60,
  lastWaterDate: "",
  showWaterSizeInput: false,
  showWaterGoalInput: false,
  pendingEvolution: null
};

export function resetState() {
  state.P = null;
  state.F = {};
  state.F_loaded = false;
  state.cache = {};
  state.sel = null;
  state.letter = "A";
  state.draft = "";
  state.pend = null;
  state.forcedLetter = null;
  state.showLetterSelector = false;
  state.curExIndex = null;
  state.curExLetter = null;
  state.editingExIndex = null;
  state.completedExs.clear();
  state.inWorkoutMode = false;
  state.workoutStartTime = null;
  state.workoutTimerInterval = null;
  state.pendDuration = null;
  state.inConfigMode = false;
  state.configDetail = false;
  state.inMascotMode = false;
  state.inSelectorMode = false;
  state.waterCurrent = 0;
  state.waterGoal = 3000;
  state.waterSize = 250;
  state.waterType = "copo";
  state.pendingWater = null; // ✅ NOVO
  state.waterReminder = false;
  state.waterReminderTime = 60;
  state.lastWaterDate = "";
  state.pendingEvolution = null;

  state.isUpdate = false;
  state.ob = { step: 0, tipo: "", freq: 0, qty: 0, days: [] };
  state.timerEndTime = null;

  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  if (state.myChart) {
    try { state.myChart.destroy(); } catch (e) { console.error(e); }
    state.myChart = null;
  }

  if (state.audioCtx) {
    try { state.audioCtx.close(); } catch (e) { console.error(e); }
    state.audioCtx = null;
  }
}

export function setState(patch, shouldPersist = false) {
  if (!state.P) return;

  Object.assign(state, patch);
  Object.assign(state.P, patch);

  if (shouldPersist) {
    window.dispatchEvent(new CustomEvent('state:persist', { detail: patch }));
  }
}