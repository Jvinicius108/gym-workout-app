import { state } from './state.js';
import { showToast, vibrate } from './utils.js';
import { persist } from './db.js';
import { drawer } from './ui.js';

let waterReminderInterval = null;
let waterReminderNextTime = 0;

export function stopWaterReminder() {
  if (waterReminderInterval) {
    clearInterval(waterReminderInterval);
    waterReminderInterval = null;
  }
}

async function showWaterNotification() {
  const remaining = state.waterGoal - state.waterCurrent;
  const body = `Faltam ${remaining}ml para você bater a meta de hoje.`;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification("Hora de beber água! 💧", {
        body,
        icon: "icon-192x192.png",
        badge: "icon-192x192.png",
        tag: "water-reminder",
        renotify: false,
        data: { url: "./" }
      });
      return;
    }
    if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
      new Notification("Hora de beber água! 💧", { body, icon: "icon-192x192.png" });
    }
  } catch (e) {
    console.warn("showWaterNotification falhou:", e);
  }
}

export function startWaterReminderTimer() {
  stopWaterReminder();
  if (typeof Notification === 'undefined' || Notification.permission !== "granted") return;

  const timeInMinutes = state.waterReminderTime || 60;
  const timeInMs = timeInMinutes * 60 * 1000;
  waterReminderNextTime = Date.now() + timeInMs;

  waterReminderInterval = setInterval(async () => {
    if (Date.now() < waterReminderNextTime) return;
    waterReminderNextTime = Date.now() + timeInMs;
    if (!state.P || state.waterCurrent >= state.waterGoal) return;
    vibrate([200, 100, 200]);
    await showWaterNotification();
  }, 15000);
}

export async function toggleWaterReminder() {
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
    stopWaterReminder();
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const pending = await reg.getNotifications({ tag: 'water-reminder' });
        pending.forEach(n => n.close());
      } catch (e) { /* ignora */ }
    }
    showToast("Lembretes desativados.", "info");
  }
  drawer();
}