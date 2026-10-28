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
  pendingWater: null,
  waterReminder: false,
  waterReminderTime: 60,
  lastWaterDate: "",
  showWaterSizeInput: false,
  showWaterGoalInput: false,
  pendingEvolution: null,
  
  editingIsCardio: false,
  editSets: "",
  editReps: "",
  editDuration: "",

  linkingExIndex: null,
  hasShownSupersetWarning: false,

  // NOVAS FLAGS PARA SUBSTITUIÇÃO
  inSubstitutesMode: false,
  subsTargetIndex: null,
  activeSwaps: {}, 
  pendingSubstitutePhoto: null,
  editingSubIndex: null,
  globalSubstitutes: {},
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
  state.pendingWater = null;
  state.waterReminder = false;
  state.waterReminderTime = 60;
  state.lastWaterDate = "";
  state.pendingEvolution = null;
  state.isUpdate = false;
  state.ob = { step: 0, tipo: "", freq: 0, qty: 0, days: [] };
  state.timerEndTime = null;
  
  state.editingIsCardio = false;
  state.editSets = "";
  state.editReps = "";
  state.editDuration = "";

  state.linkingExIndex = null;
  state.hasShownSupersetWarning = false;

  state.inSubstitutesMode = false;
  state.subsTargetIndex = null;
  state.activeSwaps = {};
  state.pendingSubstitutePhoto = null;
  state.editingSubIndex = null;
  state.globalSubstitutes = {};
  

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