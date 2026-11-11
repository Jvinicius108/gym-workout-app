import { state } from './state.js';
import { showToast, vibrate, key, pd } from './utils.js';
import { persist } from './db.js';
import { drawer } from './ui.js';
import { quotes } from './quotes.js';

let notificationTimer = null;
let waterReminderNextTime = 0;

export function stopNotificationTimers() {
  if (notificationTimer) {
    clearInterval(notificationTimer);
    notificationTimer = null;
  }
}

export function stopWaterReminder() {
  stopNotificationTimers();
}

export async function requestDeviceNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("Seu dispositivo não suporta notificações web.", "error");
    return false;
  }
  if (Notification.permission === "granted") return true;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      showToast("Notificações permitidas no dispositivo!", "success");
      return true;
    } else if (permission === "denied") {
      showToast("Permissão negada. Ative nas configurações do navegador/celular.", "error");
      return false;
    }
  } catch (e) {
    console.warn("Erro ao pedir permissão de notificação:", e);
  }
  return false;
}

export async function sendDeviceNotification(title, options = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;

  const defaultOpts = {
    icon: "icon-192x192.png",
    badge: "icon-192x192.png",
    vibrate: [200, 100, 200],
    data: { url: "./" },
    ...options
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, defaultOpts);
      return true;
    }
    new Notification(title, defaultOpts);
    return true;
  } catch (e) {
    console.warn("sendDeviceNotification falhou:", e);
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: defaultOpts
        });
        return true;
      }
    } catch (err2) {
      console.warn("postMessage fallback falhou:", err2);
    }
  }
  return false;
}

export async function checkWaterNotification() {
  if (!state.waterReminder || !state.P) return;
  if (state.waterCurrent >= state.waterGoal) return;

  const remaining = state.waterGoal - state.waterCurrent;
  const body = `Faltam ${remaining}ml para bater sua meta diária de hidratação. Beba água!`;

  vibrate([200, 100, 200]);
  await sendDeviceNotification("Hora de beber água! 💧", {
    body,
    tag: "water-reminder",
    renotify: true
  });
}

export async function checkWorkoutInactivityNotification() {
  if (!state.notifyWorkout || !state.P) return;
  const today = new Date();
  const todayKey = key(today);

  const lastNotified = localStorage.getItem("notif_inactivity_last_date");
  if (lastNotified === todayKey) return;

  const workoutKeys = Object.keys(state.F || {}).filter(k => state.F[k] && k < todayKey).sort();
  let daysWithoutWorkout = 0;

  if (workoutKeys.length > 0) {
    const lastWorkoutKey = workoutKeys[workoutKeys.length - 1];
    const lastWorkoutDate = pd(lastWorkoutKey);
    daysWithoutWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / 86400000);
  } else if (state.P.createdAt) {
    daysWithoutWorkout = Math.floor((today.getTime() - state.P.createdAt) / 86400000);
  }

  if (daysWithoutWorkout > 1) {
    vibrate([200, 150, 200]);
    await sendDeviceNotification("VOLTE A TREINAR! 🔥", {
      body: "VOLTE A TREINAR, SEU MASCOTE PRECISA DE VOCÊ! Mantenha o foco para que ele sobreviva.",
      tag: "mascot-inactivity",
      renotify: true
    });
    localStorage.setItem("notif_inactivity_last_date", todayKey);
  }
}

export async function checkMotivationalQuoteNotification() {
  if (!state.notifyMotivation || !state.P) return;
  const todayKey = key(new Date());

  const lastNotified = localStorage.getItem("notif_quote_last_date");
  if (lastNotified === todayKey) return;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  vibrate([150, 100, 150]);
  await sendDeviceNotification("💡 Motivação do Dia", {
    body: `"${quote}"`,
    tag: "daily-quote",
    renotify: false
  });
  localStorage.setItem("notif_quote_last_date", todayKey);
}

export function initNotifications() {
  stopNotificationTimers();

  if (typeof Notification === 'undefined' || Notification.permission !== "granted") return;

  const timeInMinutes = state.waterReminderTime || 60;
  const timeInMs = timeInMinutes * 60 * 1000;
  waterReminderNextTime = Date.now() + timeInMs;

  setTimeout(() => {
    checkWorkoutInactivityNotification();
    checkMotivationalQuoteNotification();
  }, 3500);

  notificationTimer = setInterval(async () => {
    const now = Date.now();

    if (state.waterReminder && now >= waterReminderNextTime) {
      waterReminderNextTime = now + timeInMs;
      await checkWaterNotification();
    }

    await checkWorkoutInactivityNotification();
    await checkMotivationalQuoteNotification();
  }, 30000);
}

export const startWaterReminderTimer = initNotifications;

export async function toggleWaterReminder() {
  if (!state.waterReminder) {
    const granted = await requestDeviceNotificationPermission();
    if (granted) {
      state.waterReminder = true;
      state.P.waterReminder = true;
      persist({ waterReminder: true });
      localStorage.setItem("waterReminder_" + (state.uid || "local"), "true");
      showToast("Lembretes de água ativados!", "success");
      initNotifications();
    }
  } else {
    state.waterReminder = false;
    state.P.waterReminder = false;
    persist({ waterReminder: false });
    localStorage.setItem("waterReminder_" + (state.uid || "local"), "false");
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const pending = await reg.getNotifications({ tag: 'water-reminder' });
        pending.forEach(n => n.close());
      } catch (e) {}
    }
    showToast("Lembretes de água desativados.", "info");
  }
  drawer();
}

export async function toggleWorkoutReminder() {
  if (!state.notifyWorkout) {
    const granted = await requestDeviceNotificationPermission();
    if (granted) {
      state.notifyWorkout = true;
      state.P.notifyWorkout = true;
      persist({ notifyWorkout: true });
      localStorage.setItem("notifyWorkout_" + (state.uid || "local"), "true");
      showToast("Alertas do mascote ativados!", "success");
      initNotifications();
    }
  } else {
    state.notifyWorkout = false;
    state.P.notifyWorkout = false;
    persist({ notifyWorkout: false });
    localStorage.setItem("notifyWorkout_" + (state.uid || "local"), "false");
    showToast("Alertas do mascote desativados.", "info");
  }
  drawer();
}

export async function toggleMotivationReminder() {
  if (!state.notifyMotivation) {
    const granted = await requestDeviceNotificationPermission();
    if (granted) {
      state.notifyMotivation = true;
      state.P.notifyMotivation = true;
      persist({ notifyMotivation: true });
      localStorage.setItem("notifyMotivation_" + (state.uid || "local"), "true");
      showToast("Frases motivacionais ativadas!", "success");
      initNotifications();
    }
  } else {
    state.notifyMotivation = false;
    state.P.notifyMotivation = false;
    persist({ notifyMotivation: false });
    localStorage.setItem("notifyMotivation_" + (state.uid || "local"), "false");
    showToast("Frases motivacionais desativadas.", "info");
  }
  drawer();
}

export async function sendTestNotification() {
  const granted = await requestDeviceNotificationPermission();
  if (!granted) return;

  const success = await sendDeviceNotification("🔔 Notificação no Dispositivo", {
    body: "Parabéns! Suas notificações PWA estão ativas e funcionando perfeitamente.",
    tag: "test-notification"
  });

  if (success) {
    showToast("Notificação enviada! Verifique a central de notificações do aparelho.", "success");
  } else {
    showToast("Não foi possível disparar a notificação. Verifique as permissões.", "error");
  }
}
