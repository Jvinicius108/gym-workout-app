import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyANjtatf0Vdx7j4v0ejsp39nsGWGJ1M5mw",
  authDomain: "meu-treino---app.firebaseapp.com",
  projectId: "meu-treino---app",
  storageBucket: "meu-treino---app.firebasestorage.app",
  messagingSenderId: "53988791323",
  appId: "1:53988791323:web:09b418743e2849ddfd94be"
};

export const CONFIGURADO = !String(firebaseConfig.apiKey).startsWith("COLE");
export const fb = CONFIGURADO ? initializeApp(firebaseConfig) : null;
export const auth = fb && getAuth(fb);

// 👇 Inicializando o Firestore com cache local (fila offline)
export const db = fb && initializeFirestore(fb, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const DS = ["seg","ter","qua","qui","sex","sáb","dom"];
export const DF = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];
export const AC = ["#ff5a36", "#2f7cf6", "#22a35a", "#9b5cf6", "#e6397a", "#e5484d", "#f59e0b", "#06b6d4", "#6366f1"];
export const TIPOS = {ABC:"3 treinos: A, B e C, repetidos ao longo da semana.",ABCD:"4 treinos: A, B, C e D, repetidos ao longo da semana.",ABCDE:"5 treinos: A, B, C, D e E, repetidos ao longo da semana."};