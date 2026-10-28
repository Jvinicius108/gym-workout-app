import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore, persistentLocalCache } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// ✅ NOVAS CORES PREMIUM ADICIONADAS (Ouro, Esmeralda, Safira, Rubi)
export const AC = [
  "#ff5a36", // Laranja
  "#2f7cf6", // Azul
  "#22a35a", // Verde
  "#9b5cf6", // Roxo
  "#e6397a", // Rosa
  "#e5484d", // Vermelho
  "#f59e0b", // Amarelo
  "#06b6d4", // Ciano
  "#6366f1", // Índigo
  "#d4af37", // Ouro (Novo)
  "#0f9b58", // Esmeralda (Novo)
  "#0f52ba", // Safira (Novo)
  "#9b111e"  // Rubi (Novo)
];

export const TIPOS = {
  ABC:"3 treinos: A, B e C, repetidos ao longo da semana.",
  ABCD:"4 treinos: A, B, C e D, repetidos ao longo da semana.",
  ABCDE:"5 treinos: A, B, C, D e E, repetidos ao longo da semana."
};