import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore, persistentLocalCache } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";

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

export const db = fb && initializeFirestore(fb, {
  localCache: persistentLocalCache()
});

export const DS = ["seg","ter","qua","qui","sex","sáb","dom"];
export const DF = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];

export const COLOR_OPTIONS = [
  { c: "#ff5a36", name: "Laranja" },
  { c: "#2f7cf6", name: "Azul" },
  { c: "#22a35a", name: "Verde" },
  { c: "#9b5cf6", name: "Roxo" },
  { c: "#e6397a", name: "Rosa" },
  { c: "#e5484d", name: "Vermelho" },
  { c: "#f59e0b", name: "Amarelo" },
  { c: "#06b6d4", name: "Ciano" },
  { c: "#6366f1", name: "Índigo" },
  { c: "#d4af37", name: "Ouro" },
  { c: "#0f9b58", name: "Esmeralda" },
  { c: "#0f52ba", name: "Safira" },
  { c: "#9b111e", name: "Rubi" },
  { c: "#84cc16", name: "Lima" },
  { c: "#14b8a6", name: "Turquesa" },
  { c: "#a855f7", name: "Lilás" },
  { c: "#f97316", name: "Tangerina" },
  { c: "#ec4899", name: "Pink Neon" },
  { c: "#64748b", name: "Titânio" }
];

export const AC = COLOR_OPTIONS.map(o => o.c);

export const TIPOS = {
  ABC:"3 treinos: A, B e C, repetidos ao longo da semana.",
  ABCD:"4 treinos: A, B, C e D, repetidos ao longo da semana.",
  ABCDE:"5 treinos: A, B, C, D e E, repetidos ao longo da semana."
};
