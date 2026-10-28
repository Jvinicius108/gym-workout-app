import { db } from './config.js';
import { state } from './state.js';
import { uidg, showToast, Icons } from './utils.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const ready = () => state.P && state.P.tipo && state.P.freq &&
  Array.isArray(state.P.rest) && state.P.rest.length > 0;

export const userDoc = () => doc(db, "users", state.uid);

const MAX_CACHE = 50;
const cacheOrder = [];          
const pendingPhotos = new Set(); 

export function addToCache(id, d) {
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
    tipo: state.P.tipo, freq: state.P.freq, rest: state.P.rest, ex: state.P.ex, exImages: state.P.exImages || {},
    tema: state.P.tema, ac: state.P.ac, restTime: state.P.restTime, displayName: state.P.displayName,
    nameSet: state.P.nameSet || false, avatar: state.P.avatar || "", customTitles: state.P.customTitles || {},
    mascotName: state.P.mascotName || "", guardianName: state.P.guardianName || "", streak: state.P.streak || 0,
    misses: state.P.misses || 0, waterGoal: state.P.waterGoal ?? state.waterGoal ?? 3000,
    waterCurrent: state.P.waterCurrent ?? state.waterCurrent ?? 0, waterSize: state.P.waterSize ?? state.waterSize ?? 250,
    waterType: state.P.waterType ?? state.waterType ?? "copo", lastWaterDate: state.P.lastWaterDate || state.lastWaterDate || "",
    animSeen: state.P.animSeen || {}, lastWelcome: state.P.lastWelcome || "", createdAt: state.P.createdAt || Date.now()
  };
  return updateDoc(userDoc(), data).catch(e => { console.error("persist:", e); });
}

export function sanitizeName(name) {
  if (!name) return "";
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

export async function putGlobalFoto(name, d) {
  const id = sanitizeName(name);
  const globalId = 'global_' + id;
  addToCache(globalId, d);
  try {
    await setDoc(doc(db, "global_fotos", id), { d, name });
  } catch (e) {
    console.error("putGlobalFoto:", e);
    showToast("Erro ao salvar no Banco Global.", "error");
    throw e; 
  }
  return globalId;
}

export async function getGlobalFoto(name) {
  const id = sanitizeName(name);
  const globalId = 'global_' + id;
  if (state.cache[globalId]) return state.cache[globalId];
  try {
    const snap = await getDoc(doc(db, "global_fotos", id));
    if (snap.exists()) {
      const d = snap.data().d;
      if (d) {
        addToCache(globalId, d);
        return d;
      }
    }
  } catch (e) {
    console.error("getGlobalFoto:", e);
  }
  return null;
}

export function hydrate() {
  const toFetch = new Set();
  document.querySelectorAll("img[data-f]").forEach(im => {
    const id = im.dataset.f;
    
    if (!id || id === 'null' || id === 'undefined' || typeof id !== 'string') return; 
    
    if (state.cache[id]) { im.src = state.cache[id]; return; }
    if (!pendingPhotos.has(id)) toFetch.add(id);
  });


  document.querySelectorAll("img[data-global]").forEach(im => {
    const name = im.dataset.global;
    const id = 'global_' + sanitizeName(name);
    if (state.cache[id]) { im.src = state.cache[id]; return; }
    if (!pendingPhotos.has(id)) toFetch.add(id);
  });

  toFetch.forEach(id => {
    pendingPhotos.add(id);
    let promise;
    if (id.startsWith('global_')) {
        const realId = id.replace('global_', '');
        promise = getDoc(doc(db, "global_fotos", realId));
    } else {
        promise = getDoc(doc(db, "users", state.uid, "fotos", id));
    }

    promise.then(snap => {
      pendingPhotos.delete(id);
      
      // ✅ SE NÃO ENCONTRAR, COLOCA O PLACEHOLDER PARA NÃO FICAR IMAGEM QUEBRADA
      if (!snap.exists() || !snap.data().d) {
          document.querySelectorAll(`img[data-f="${CSS.escape(id)}"]`).forEach(im => {
              const parent = im.parentElement;
              if (parent) {
                  parent.innerHTML = `<div class="ph">${Icons.dumbbellLarge}</div>`;
              }
          });
          return;
      }
      
      const d = snap.data().d;
      addToCache(id, d);

      if (id.startsWith('global_')) {
          document.querySelectorAll(`img[data-f="${CSS.escape(id)}"]`).forEach(im => im.src = d);
      } else {
          document.querySelectorAll(`img[data-f="${CSS.escape(id)}"]`).forEach(im => im.src = d);
      }
    }).catch(err => {
      pendingPhotos.delete(id);
      console.error("getPhoto:", err);
    });
  });
}

export function img(f, cb) {
  if (f.type === 'image/gif') {
    if (f.size > 800 * 1024) { showToast("GIF muito grande (máx 800KB).", "error"); return; }
    const r = new FileReader();
    r.onload = () => cb(r.result);
    r.readAsDataURL(f);
    return;
  }
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = () => {
      const m = 420, s = Math.min(1, m / Math.max(i.width, i.height));
      const c = document.createElement("canvas");
      c.width = i.width * s; c.height = i.height * s;
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", .65));
    };
    i.src = r.result;
  };
  r.readAsDataURL(f);
}

const UPLOAD_QUEUE_KEY = "photoUploadQueue_";
export async function processPhotoUploadQueue() {
  if (!state.uid) return;
  const key = UPLOAD_QUEUE_KEY + state.uid;
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(key) || "[]"); } catch(e) { return; }
  if (queue.length === 0) return;
  const remaining = [];
  for (const item of queue) {
    try { await setDoc(doc(db, "users", state.uid, "fotos", item.id), { d: item.d }); addToCache(item.id, item.d); }
    catch (e) { remaining.push(item); }
  }
  try { localStorage.setItem(key, JSON.stringify(remaining)); } catch (e) {}
}

export async function putFoto(d) {
  const id = uidg();
  addToCache(id, d);
  try { await setDoc(doc(db, "users", state.uid, "fotos", id), { d }); }
  catch (e) { console.error("putFoto:", e); showToast("Foto salva local.", "info"); }
  return id;
}

export const delFoto = id => {
  if (!id) return;
  delete state.cache[id];
  const idx = cacheOrder.indexOf(id);
  if (idx !== -1) cacheOrder.splice(idx, 1);
  deleteDoc(doc(db, "users", state.uid, "fotos", id)).catch(err => {});
};