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

export const vibrate = (pattern) => {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch(e) {}
  }
};

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
  icon.innerHTML = type === 'error' ? Icons.alertCircle : type === 'success' ? Icons.checkCircle : Icons.info;

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

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

// ✅ NOVA BIBLIOTECA DE ÍCONES (LUCIDE ICONS)
const svg = (content, size=20) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}">${content}</svg>`;

export const Icons = {
  play: svg('<polygon points="6 3 20 12 6 21 6 3"></polygon>'),
  arrowLeft: svg('<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>'),
  x: svg('<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>', 24),
  fire: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'),
  water: svg('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>'),
  settings: svg('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'),
  chart: svg('<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>'),
  user: svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', 32),
  check: svg('<polyline points="20 6 9 17 4 12"></polyline>', 16),
  scale: svg('<path d="M12 3v18"></path><path d="M5 8h14"></path><path d="M8 21h8"></path><path d="M6 3h12l2 5H4z"></path>', 18),
  clock: svg('<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', 18),
  moon: svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'),
  camera: svg('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>', 18),
  trash: svg('<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>', 18),
  edit: svg('<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>', 18),
  up: svg('<polyline points="18 15 12 9 6 15"></polyline>', 18),
  down: svg('<polyline points="6 9 12 15 18 9"></polyline>', 18),
  dumbbell: svg('<path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h1.5M3 14.5h1.5M19.5 9.5H21M19.5 14.5H21M6.5 6.5V17.5M17.5 6.5V17.5"></path>', 24),
  dumbbellLarge: svg('<path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h1.5M3 14.5h1.5M19.5 9.5H21M19.5 14.5H21M6.5 6.5V17.5M17.5 6.5V17.5"></path>', 32),
  
  // ✅ NOVOS ÍCONES PROFISSIONAIS ADICIONADOS
  swap: svg('<path d="m16 3 4 4-4 4"></path><path d="M20 7H4"></path><path d="m8 21-4-4 4-4"></path><path d="M4 17h16"></path>', 18),
  link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>', 18),
  book: svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>', 18),
  plus: svg('<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>', 18),
  minus: svg('<line x1="5" y1="12" x2="19" y2="12"></line>', 18),
  menu: svg('<line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line>', 24),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>', 18),
  alertCircle: svg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>', 18),
  checkCircle: svg('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>', 18),
  info: svg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>', 18),
  trophy: svg('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>', 24),
  target: svg('<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>', 24),
  calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>', 24)
};

export function isWeekCompensated(date) {
    if (!state.P || !state.P.freq || state.P.freq === 0) return false;
    const dayOfWeek = (date.getDay() + 6) % 7;
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
    const today = new Date();
    const todayMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
    if (monday.getTime() === todayMonday.getTime()) return true;
    let count = 0;
    for (let i = 0; i <= 6; i++) {
        const temp = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        if (state.F[key(temp)]) count++;
    }
    return count >= state.P.freq;
}