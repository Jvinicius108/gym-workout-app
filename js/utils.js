import { state } from './state.js';

export const $ = i => document.getElementById(i);

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

export const key = d => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
export const pd = k => { const p = k.split("-"); return new Date(+p[0], p[1]-1, +p[2]); };
export const uidg = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
export const mi = d => (d.getDay() + 6) % 7;
export const LT = () => (state.P && state.P.tipo ? state.P.tipo : "ABC").split("");

export function getLabel(letter) {
  if (state.P && state.P.customTitles && state.P.customTitles[letter]) {
    return state.P.customTitles[letter];
  }
  return letter;
}

export function getWorkoutForDate(d) {
  if (!state.P) return "";
  const dateStr = key(d);
  const isRest = state.P.rest.includes(mi(d));
  if (isRest) return "";

  let lastF = null, lastFDate = null;
  Object.keys(state.F).forEach(k => {
    if (k < dateStr) { if (!lastFDate || k > lastFDate) { lastFDate = k; lastF = state.F[k]; } }
  });

  const LTs = LT();
  if (!LTs.length) return "";

  if (lastF) {
    let lastL = lastF.letter;
    if (!lastL) {
      let idx = 0;
      const oldD = pd(lastFDate);
      if (!state.P.rest.includes(mi(oldD))) {
        const dias = [0,1,2,3,4,5,6].filter(x => !state.P.rest.includes(x));
        idx = dias.indexOf(mi(oldD));
      }
      if (idx === -1) idx = 0;
      lastL = LTs[idx % LTs.length];
    }

    if (lastL) {
      const lastIdx = LTs.indexOf(lastL);
      if (lastIdx === -1) return LTs[0];

      let scheduledDays = 0;
      let tempD = pd(lastFDate);
      while (key(tempD) < dateStr) {
        tempD.setDate(tempD.getDate() + 1);
        if (!state.P.rest.includes(mi(tempD))) scheduledDays++;
      }
      return LTs[(lastIdx + scheduledDays) % LTs.length];
    }
  }

  const dias = [0,1,2,3,4,5,6].filter(x => !state.P.rest.includes(x));
  const idx = dias.indexOf(mi(d));
  return LTs[idx % LTs.length];
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) { console.log(`[${type.toUpperCase()}] ${message}`); return; }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('span');
  icon.style.fontSize = '18px';
  icon.textContent = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ✅ NOVO: Função para não perder o foco e o cursor ao re-renderizar
export function safeRender(targetId, html) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const active = document.activeElement;
  const activeId = active ? active.id : null;
  const start = active ? active.selectionStart : null;
  const end = active ? active.selectionEnd : null;

  el.innerHTML = html;

  if (activeId) {
    const newActive = document.getElementById(activeId);
    if (newActive) {
      newActive.focus();
      if (start != null && end != null && typeof newActive.setSelectionRange === "function") {
        try { newActive.setSelectionRange(start, end); } catch (e) {}
      }
    }
  }
}

// ✅ NOVO: Ícones centralizados
export const Icons = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
  water: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="32" height="32"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 3v18"></path><path d="M5 8h14"></path><path d="M8 21h8"></path><path d="M6 3h12l2 5H4z"></path></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
  down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h1.5M3 14.5h1.5M19.5 9.5H21M19.5 14.5H21M6.5 6.5V17.5M17.5 6.5V17.5"></path></svg>`,
  dumbbellLarge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="32" height="32"><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h1.5M3 14.5h1.5M19.5 9.5H21M19.5 14.5H21M6.5 6.5V17.5M17.5 6.5V17.5"></path></svg>`
};