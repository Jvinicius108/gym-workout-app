import { state } from './state.js';
import { $ } from './utils.js';

let wakeLock = null;

const vibrate = (pattern) => {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch(e) {}
  }
};

export function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  let s = totalSeconds % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export function startWorkoutTimer() {
  if (!state.workoutStartTime) {
    const saved = localStorage.getItem("workout_start_" + state.uid);
    if (saved) state.workoutStartTime = parseInt(saved, 10);
    else {
      state.workoutStartTime = Date.now();
      localStorage.setItem("workout_start_" + state.uid, state.workoutStartTime);
    }
  }
  if (state.workoutTimerInterval) clearInterval(state.workoutTimerInterval);
  updateWorkoutTimerUI();
  state.workoutTimerInterval = setInterval(updateWorkoutTimerUI, 1000);
  requestWakeLock();
}

export function updateWorkoutTimerUI() {
  const el = document.getElementById("workoutTimerDisplay");
  if (!el || !state.workoutStartTime) return;
  el.textContent = formatDuration(Date.now() - state.workoutStartTime);
}

export function stopWorkoutTimer() {
  if (state.workoutTimerInterval) clearInterval(state.workoutTimerInterval);
  state.workoutTimerInterval = null;
  releaseWakeLock();
  if (!state.workoutStartTime) return "00:00:00";
  const formatted = formatDuration(Date.now() - state.workoutStartTime);
  state.workoutStartTime = null;
  localStorage.removeItem("workout_start_" + state.uid);
  return formatted;
}

export function resetWorkoutTimer() {
  if (state.workoutTimerInterval) clearInterval(state.workoutTimerInterval);
  state.workoutTimerInterval = null;
  state.workoutStartTime = null;
  if (state.uid) localStorage.removeItem("workout_start_" + state.uid);
  releaseWakeLock();
}

async function requestWakeLock() {
  if (!('wakeLock' in navigator) || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) { /* silencioso */ }
}

function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.workoutStartTime && !wakeLock) requestWakeLock();
});

export function initAudio() {
  if (!state.audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AC();
  }
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
}

export function playAlarm() {
  if (!state.audioCtx) return;
  let time = state.audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = state.audioCtx.createOscillator(), gain = state.audioCtx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(880, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.connect(gain); gain.connect(state.audioCtx.destination);
    osc.start(time); osc.stop(time + 0.5); time += 0.6;
  }
}

export function startTimer() {
  stopTimer();
  initAudio();
  const seconds = state.P.restTime || 60;
  state.timerEndTime = Date.now() + (seconds * 1000);
  $("restTimerUI").classList.add("on");
  updateTimerDisplay();
  state.timerInterval = setInterval(updateTimerDisplay, 250);
}

export function updateTimerDisplay() {
  if (!state.timerEndTime) return;
  const diff = state.timerEndTime - Date.now();
  if (diff <= 0) { stopTimer(); triggerAlarmScreen(); return; }
  const remainingSeconds = Math.ceil(diff / 1000);
  const m = Math.floor(remainingSeconds / 60).toString().padStart(2,'0');
  const s = (remainingSeconds % 60).toString().padStart(2,'0');
  $("timerDisplay").textContent = `${m}:${s}`;
}

export function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.timerEndTime = null;
  $("restTimerUI").classList.remove("on");
}

export function triggerAlarmScreen() {
  playAlarm();
  $("alarmOverlay").classList.add("on");
  vibrate([500, 200, 500, 200, 500]); // ✅ Vibração no alarme
  setTimeout(() => $("btnDismissAlarm").focus(), 100);
}