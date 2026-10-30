import { state } from '../state.js';
import { $, esc, key, LT, showToast } from '../utils.js';
import { persist } from '../db.js';
import { open, fechaModal, refresh } from '../helpers.js';
import { theme, main, drawer, openEvolution, renderConfigScreen, renderMascotScreen, showWelcome } from '../ui.js';
import { handleDeleteAccount } from '../auth.js';
import { cleanupSubscriptions } from '../sync.js';
import { stopWaterReminder } from '../water-reminder.js';
import { stopTimer, resetWorkoutTimer } from '../timers.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from '../config.js';
import { resetState } from '../state.js';

export async function handleDrawerAndModals(t, D) {
  try {
    if (t.id === "btnCloseMenu") { open(false); return true; }
    if (t.id === "btn-evolution") { openEvolution(); return true; }
    if (t.id === "evoBack") {
      if ($("evoChartArea").style.display === "block") {
        $("evoChartArea").style.display = "none";
        $("evoList").style.display = "block";
        $("evoTitle").textContent = "Seus Exercícios";
      } else $("evoScreen").classList.remove("on");
      return true;
    }
    if (D.chart) { (await import('../ui-evolution.js')).drawChart(D.chart); return true; }
    if (t.id === "btn-open-config") {
      open(false);
      state.inConfigMode = true;
      state.configDetail = false;
      return true;
    }
    if (t.id === "configBack") {
      if (state.configDetail) { 
        state.configDetail = false;
      } else { 
        state.inConfigMode = false;
      }
      return true;
    }
    if (t.id === "mascotBtn") { state.inMascotMode = true; return true; }
    if (t.id === "mascotBack") { state.inMascotMode = false; return true; }
    if (t.id === "saveMascotData") {
      state.P.mascotName = $("mascotNameInput").value.trim();
      state.P.guardianName = $("guardianNameInput").value.trim();
      persist({ mascotName: state.P.mascotName, guardianName: state.P.guardianName });
      showToast("Dados do mascote salvos!", "success");
      state.inMascotMode = false;
      main(); drawer();
      return true;
    }
    if (t.id === "btnAvatar") {
      if (state.P.avatar) {
        $("btnChangeAvatar").textContent = "Alterar Foto de Perfil";
        $("btnRemoveAvatar").style.display = "block";
      } else {
        $("btnChangeAvatar").textContent = "Adicionar Nova Foto de Perfil";
        $("btnRemoveAvatar").style.display = "none";
      }
      $("ov").classList.add("on");
      $("mdAvatar").classList.add("on");
      return true;
    }
    if (t.id === "btnChangeAvatar") { fechaModal(); $("fiAvatar").click(); return true; }
    if (t.id === "btnRemoveAvatar") {
      state.P.avatar = "";
      persist({ avatar: "" });
      fechaModal(); drawer();
      return true;
    }
    if (t.id === "saveName") {
      const val = $("nameInput").value.trim();
      if (val) {
        state.P.displayName = val;
        state.P.nameSet = true;
        state.P.lastWelcome = key(new Date());
        persist({
          displayName: val,
          nameSet: true,
          lastWelcome: state.P.lastWelcome
        });
        fechaModal();
        drawer();
        showWelcome();
      }
      return true;
    }
    if (t.id === "btnCloseWelcome") { fechaModal(); return true; }
    if (t.id === "saveTitles") {
      const nt = {};
      LT().forEach(l => {
        const v = $(`title_${l}`).value.trim();
        if (v) nt[l] = v;
      });
      state.P.customTitles = nt;
      persist({ customTitles: nt });
      showToast("Nomes dos treinos salvos!", "success");
      renderConfigScreen(); refresh();
      return true;
    }

    if (t.id === "btnDeleteAccount") {
      $("ov").classList.add("on");
      $("mdDeleteAccount").classList.add("on");
      $("deletePasswordInput").value = "";
      return true;
    }
    if (t.id === "btnCancelDelete") {
      fechaModal();
      return true;
    }
    if (t.id === "btnConfirmDelete") {
      handleDeleteAccount();
      return true;
    }
    if (t.id === "out") {
      open(false);
      state.exDetail = false;
      stopTimer();
      resetWorkoutTimer();
      stopWaterReminder();
      cleanupSubscriptions();
      const uidToClean = state.uid;
      if (uidToClean) {
        ["inWorkoutMode_", "sel_", "forcedLetter_", "completedExs_", "workout_start_"].forEach(p =>
          localStorage.removeItem(p + uidToClean)
        );
      }
      resetState();
      state.uid = null;
      state.tab = "in";
      await signOut(auth);
      return true;
    }
    if (t.id === "menu") { open(true); return true; }
    if (t.id === "ov") { open(false); fechaModal(); return true; }
    if (D.th) { state.P.tema = D.th; theme(); drawer(); persist({ tema: D.th }); return true; }
    if (D.ac) { state.P.ac = D.ac; theme(); drawer(); persist({ ac: D.ac }); return true; }
    if (D.rest2 !== undefined) {
      const day = +D.rest2;
      if (!Array.isArray(state.P.rest)) state.P.rest = [];
      if (state.P.rest.includes(day)) {
        if (state.P.rest.length > 1) state.P.rest = state.P.rest.filter(d => d !== day);
        else { showToast("Você precisa ter pelo menos 1 dia de repouso.", "info"); return true; }
      } else {
        const maxRest = 7 - (state.P.freq || 0);
        if (state.P.rest.length >= maxRest) {
          showToast(`Máximo ${maxRest} repouso(s) para ${state.P.freq} treino(s)/semana.`, "info");
          return true;
        }
        state.P.rest.push(day);
        state.P.rest.sort();
      }
      persist({ rest: state.P.rest });
      drawer(); main();
      return true;
    }
    if (D.resttime) {
      state.P.restTime = +D.resttime;
      persist({ restTime: state.P.restTime });
      drawer();
      return true;
    }
    return false;
  } catch (err) {
    console.error("handleDrawerAndModals:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}