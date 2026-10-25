import { db } from './config.js';
import { state } from './state.js';
import { uidg, showToast } from './utils.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const ready = () => state.P && state.P.tipo && state.P.freq &&
  Array.isArray(state.P.rest) && state.P.rest.length > 0;

export const userDoc = () => doc(db, "users", state.uid);

/* ============================================================
   LRU de fotos: mantém só as N mais recentes em memória.
   Antes: o onSnapshot(fotos) baixava TODAS as fotos (base64)
   em todo boot e colocava tudo em state.cache. Com 100 fotos
   × 50 KB = 5 MB de RAM permanente + 100 reads por boot.
   Agora: cache limitado a 50 fotos, carregamento sob demanda.
   ============================================================ */
const MAX_CACHE = 50;
const cacheOrder = [];          // ordem FIFO de IDs em cache
const pendingPhotos = new Set(); // IDs com getDoc em andamento

function addToCache(id, d) {
  state.cache[id] = d;
  const idx = cacheOrder.indexOf(id);
  if (idx !== -1) cacheOrder.splice(idx, 1);
  cacheOrder.push(id);
  while (cacheOrder.length > MAX_CACHE) {
    const old = cacheOrder.shift();
    delete state.cache[old];
  }
}

export function resetPhotoCache() {
  cacheOrder.length = 0;
  pendingPhotos.clear();
  state.cache = {};
}

export function persist(fields) {
  if (!state.P) return Promise.resolve();

  const data = fields || {
    tipo: state.P.tipo,
    freq: state.P.freq,
    rest: state.P.rest,
    ex: state.P.ex,
    tema: state.P.tema,
    ac: state.P.ac,
    restTime: state.P.restTime,
    displayName: state.P.displayName,
    nameSet: state.P.nameSet || false,
    avatar: state.P.avatar || "",
    customTitles: state.P.customTitles || {},
    mascotName: state.P.mascotName || "",
    guardianName: state.P.guardianName || "",
    streak: state.P.streak || 0,
    misses: state.P.misses || 0,
    waterGoal: state.P.waterGoal ?? state.waterGoal ?? 3000,
    waterCurrent: state.P.waterCurrent ?? state.waterCurrent ?? 0,
    waterSize: state.P.waterSize ?? state.waterSize ?? 250,
    waterType: state.P.waterType ?? state.waterType ?? "copo",
    lastWaterDate: state.P.lastWaterDate || state.lastWaterDate || "",
    animSeen: state.P.animSeen || {},
    lastWelcome: state.P.lastWelcome || "",
    createdAt: state.P.createdAt || Date.now()
  };

  return updateDoc(userDoc(), data).catch(e => {
    console.error("persist:", e);
    showToast("Erro de conexão. Vamos sincronizar quando a rede voltar.", "error");
  });
}

/**
 * ✅ REESCRITO: hydrate agora é LAZY.
 * Para cada <img data-f>, verifica o cache. Se não está, dispara
 * getDoc individual. O resultado é guardado no cache LRU e
 * aplicado a TODAS as <img> com aquele data-f (mesma foto em vários lugares).
 *
 * Custou: perder o "real-time sync" de fotos entre devices.
 * Ganho: 1 read por foto visível (em vez de N fotos por boot).
 */
export function hydrate() {
  const toFetch = new Set();
  document.querySelectorAll("img[data-f]").forEach(im => {
    const id = im.dataset.f;
    if (!id) return;
    if (state.cache[id]) { im.src = state.cache[id]; return; }
    if (!pendingPhotos.has(id)) toFetch.add(id);
  });

  toFetch.forEach(id => {
    pendingPhotos.add(id);
    getDoc(doc(db, "users", state.uid, "fotos", id)).then(snap => {
      pendingPhotos.delete(id);
      if (!snap.exists()) return;
      const d = snap.data().d;
      if (!d) return;
      addToCache(id, d);
      document.querySelectorAll(`img[data-f="${CSS.escape(id)}"]`).forEach(im => {
        im.src = d;
      });
    }).catch(err => {
      pendingPhotos.delete(id);
      console.error("getPhoto:", err);
    });
  });
}

export function img(f, cb) {
  // Se for GIF, salva direto (para manter a animação)
  if (f.type === 'image/gif') {
    if (f.size > 800 * 1024) { // 800KB
      showToast("GIF muito grande (máx 800KB).", "error");
      return;
    }
    const r = new FileReader();
    r.onload = () => cb(r.result);
    r.readAsDataURL(f);
    return;
  }

  // Se for imagem normal, redimensiona para economizar espaço
  const r = new FileReader();
  r.onerror = () => showToast("Erro ao ler o arquivo.", "error");
  r.onload = () => {
    const i = new Image();
    i.onerror = () => showToast("Arquivo inválido.", "error");
    i.onload = () => {
      const m = 420, s = Math.min(1, m / Math.max(i.width, i.height));
      const c = document.createElement("canvas");
      c.width = i.width * s;
      c.height = i.height * s;
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", .65));
    };
    i.src = r.result;
  };
  r.readAsDataURL(f);
}

/* ============================================================
   ✅ NOVO: fila de retry para fotos que falharam no setDoc.
   Antes: setDoc falhava em rede ruim, putFoto retornava o id
   de qualquer jeito, treino era salvo com fid apontando para
   foto inexistente = foto perdida para sempre.
   Agora: entra numa fila em localStorage (máx 20 fotos) e é
   sincronizada quando a rede volta ou no próximo boot.
   ============================================================ */
const UPLOAD_QUEUE_KEY = "photoUploadQueue_";

function enqueuePhotoUpload(id, d) {
  if (!state.uid) return;
  const key = UPLOAD_QUEUE_KEY + state.uid;
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(key) || "[]"); } catch(e) {}
  queue.push({ id, d, t: Date.now() });
  while (queue.length > 20) queue.shift();
  try {
    localStorage.setItem(key, JSON.stringify(queue));
  } catch (e) {
    console.error("enqueuePhotoUpload:", e);
    showToast("Memória cheia. Foto não será sincronizada offline.", "error");
  }
}

export async function processPhotoUploadQueue() {
  if (!state.uid) return;
  const key = UPLOAD_QUEUE_KEY + state.uid;
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(key) || "[]"); } catch(e) { return; }
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    try {
      await setDoc(doc(db, "users", state.uid, "fotos", item.id), { d: item.d });
      addToCache(item.id, item.d);
    } catch (e) {
      remaining.push(item);
    }
  }
  try {
    localStorage.setItem(key, JSON.stringify(remaining));
  } catch (e) {}

  if (remaining.length === 0) {
    showToast(`${queue.length} foto(s) sincronizada(s).`, "success");
  }
}

export async function putFoto(d) {
  const id = uidg();
  addToCache(id, d);
  try {
    await setDoc(doc(db, "users", state.uid, "fotos", id), { d });
  } catch (e) {
    console.error("putFoto:", e);
    enqueuePhotoUpload(id, d);
    showToast("Foto salva localmente. Sincroniza quando a rede voltar.", "info");
  }
  return id;
}

export const delFoto = id => {
  if (!id) return;
  delete state.cache[id];
  const idx = cacheOrder.indexOf(id);
  if (idx !== -1) cacheOrder.splice(idx, 1);
  deleteDoc(doc(db, "users", state.uid, "fotos", id)).catch(err => {
    console.error("delFoto:", err);
    // Foto órfã não é crítica — fica no Firestore mas não é referenciada.
  });
};