import { state } from '../state.js';
import { $, key, vibrate } from '../utils.js';
import { persist } from '../db.js';
import { updateWaterUI, drawer } from '../ui.js';
import { toggleWaterReminder, startWaterReminderTimer } from '../water-reminder.js';

export async function handleWaterClicks(t, D) {
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
    vibrate(10);
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