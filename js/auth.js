import { auth } from './config.js';
import { state, resetState } from './state.js';
import { $, vibrate, showToast } from './utils.js';
import { fechaModal } from './helpers.js';
import { db } from './config.js';
import { doc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export async function go() {
  const u = $("au").value.trim().toLowerCase();
  const p = $("ap").value;
  const e = $("ae");
  e.textContent = "";

  if (!/^[a-z0-9_]{3,20}$/.test(u)) return e.textContent = "Usuário: 3 a 20 letras minúsculas, números ou _.";
  if (p.length < 6) return e.textContent = "A senha precisa de pelo menos 6 caracteres.";

  const em = u + "@meutreino.app";
  const btn = $("ago");
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Entrando...';
  }

  try {
    if (state.tab === "up") {
      await createUserWithEmailAndPassword(auth, em, p);
    } else {
      await signInWithEmailAndPassword(auth, em, p);
    }
    vibrate(50);
  } catch (x) {
    const c = x.code || "";
    e.textContent =
      c.includes("email-already") ? "Esse usuário já existe." :
      c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") ? "Usuário ou senha incorretos." :
      c.includes("network") ? "Sem conexão. Tente de novo." :
      "Erro: " + c;
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalText || "Entrar"; }
  } finally {
    if (btn && btn.disabled && auth.currentUser) {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || "Entrar";
    }
  }
}

export async function handleDeleteAccount() {
  if (!state.uid || !auth.currentUser) return;
  const btn = $("btnConfirmDelete");
  const pass = $("deletePasswordInput").value;
  if (!pass) {
    showToast("Digite sua senha para confirmar.", "error");
    return;
  }
  btn.textContent = "Verificando...";
  btn.disabled = true;
  try {
    const uid = state.uid;
    const credential = EmailAuthProvider.credential(auth.currentUser.email, pass);
    await reauthenticateWithCredential(auth.currentUser, credential);
    btn.textContent = "Excluindo...";
    const fotosSnap = await getDocs(collection(db, "users", uid, "fotos"));
    await Promise.all(fotosSnap.docs.map(d => deleteDoc(doc(db, "users", uid, "fotos", d.id))));
    const feitosSnap = await getDocs(collection(db, "users", uid, "feitos"));
    await Promise.all(feitosSnap.docs.map(d => deleteDoc(doc(db, "users", uid, "feitos", d.id))));
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(auth.currentUser);
    fechaModal();
    showToast("Sua conta foi excluída com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      showToast("Senha incorreta. A conta NÃO foi excluída.", "error");
    } else {
      showToast("Erro ao excluir conta. Tente novamente.", "error");
    }
    btn.textContent = "SIM, EXCLUIR TUDO";
    btn.disabled = false;
  }
}