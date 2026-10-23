import { db } from './config.js';
import { state } from './state.js';
import { uidg, showToast } from './utils.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const ready = () => state.P && state.P.tipo && state.P.freq &&
  Array.isArray(state.P.rest) && state.P.rest.length > 0;

export const userDoc = () => doc(db, "users", state.uid);

/**
 * Persiste no servidor SEM BLOQUEAR A UI.
 * - Retorna uma promise que NUNCA rejeita (erros tratados com toast).
 * - Aceita `fields` para atualização parcial (economiza banda + evita
 *   sobrescrever campos alterados em outro aparelho).
 */
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
    // ?? em vez de || — zero legítimo não cai em fallback
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

export function hydrate() {
  document.querySelectorAll("img[data-f]").forEach(im => {
    const id = im.dataset.f;
    if (state.cache[id]) { im.src = state.cache[id]; return; }
    getDoc(doc(db, "users", state.uid, "fotos", id)).then(s => {
      if (s.exists()) { state.cache[id] = s.data().d; im.src = state.cache[id]; }
    }).catch(err => console.error("hydrate:", err));
  });
}

export function img(f, cb) {
  const r = new FileReader();
  
  // ✅ Se o navegador não conseguir ler o arquivo, avisa o usuário
  r.onerror = () => {
    showToast("Erro ao ler o arquivo. Tente outra imagem.", "error");
  };

  r.onload = () => {
    const i = new Image();
    
    // ✅ Se o arquivo não for uma imagem válida, avisa o usuário
    i.onerror = () => {
      showToast("Arquivo inválido. Por favor, escolha uma imagem.", "error");
    };

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

export async function putFoto(d) {
  const id = uidg();
  state.cache[id] = d;
  try {
    await setDoc(doc(db, "users", state.uid, "fotos", id), { d });
  } catch (e) {
    console.error("putFoto:", e);
    showToast("Foto não sincronizada. Nova tentativa ao reconectar.", "info");
  }
  return id;
}

export const delFoto = id => {
  if (id) deleteDoc(doc(db, "users", state.uid, "fotos", id)).catch(err => console.error("delFoto:", err));
};