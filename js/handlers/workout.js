import { state } from '../state.js';
import { $, key, pd, mi, LT, getWorkoutForDate, uidg, showToast, vibrate } from '../utils.js';
import { persist, putFoto, delFoto } from '../db.js';
import { refresh, fechaModal } from '../helpers.js';
import { main, drawer, renderWorkoutSelector, renderConfigScreen } from '../ui.js';
import { finishWorkout } from '../streak.js';
import { startTimer, stopTimer, startWorkoutTimer, stopWorkoutTimer, resetWorkoutTimer } from '../timers.js';
import { db } from '../config.js';
import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function handleWorkoutAndConfig(t, D) {
  try {
    if (t.id === "btn-workout-rest" || t.id === "btn-change-workout") {
      if (state.sel > key(new Date())) {
        showToast("Você só pode iniciar treinos a partir de hoje.", "info");
        return true;
      }
      state.inSelectorMode = true;
      renderWorkoutSelector();
      return true;
    }
    if (t.id === "selectorBack") { state.inSelectorMode = false; renderWorkoutSelector(); return true; }
    if (D.selectWorkout) {
      const letter = D.selectWorkout;
      if ((state.P.ex[letter] || []).length === 0) {
        showToast(`O Treino ${letter} está vazio. Adicione exercícios antes.`, "info");
        return true;
      }
      state.inSelectorMode = false;
      renderWorkoutSelector();
      state.forcedLetter = letter;
      state.inWorkoutMode = true;
      state.completedExs.clear();
      localStorage.setItem("inWorkoutMode_" + state.uid, "true");
      localStorage.setItem("sel_" + state.uid, state.sel);
      localStorage.setItem("forcedLetter_" + state.uid, state.forcedLetter);
      localStorage.setItem("completedExs_" + state.uid, "[]");
      startWorkoutTimer();
      refresh();
      return true;
    }
    if (D.k) {
      const _ck = state.P.createdAt ? key(new Date(state.P.createdAt)) : null;
      if (_ck && D.k < _ck) return true;
      state.sel = D.k;
      state.forcedLetter = null;
      state.showLetterSelector = false;
      state.completedExs.clear();
      state.inWorkoutMode = false;
      state.pendDuration = null;
      resetWorkoutTimer();
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);
      localStorage.setItem("sel_" + state.uid, state.sel);
      refresh();
      return true;
    }
    if (D.exit) {
      state.inWorkoutMode = false;
      state.forcedLetter = null;
      state.completedExs.clear();
      resetWorkoutTimer();
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);
      refresh();
      return true;
    }
    if (t.id === "btn-change") { state.showLetterSelector = !state.showLetterSelector; main(); return true; }
    if (D.setLetter) {
      state.forcedLetter = D.setLetter;
      state.showLetterSelector = false;
      state.completedExs.clear();
      refresh();
      return true;
    }
    if (D.weight) {
      state.curExIndex = +D.weight;
      state.curExLetter = state.letter;
      const ex = state.P.ex[state.curExLetter][state.curExIndex];
      $("wName").textContent = ex.name;
      $("wInput").value = ex.w || "";
      $("wUnit").value = ex.wu || "kg";
      $("ov").classList.add("on");
      $("mdW").classList.add("on");
      return true;
    }
    if (D.timer) { startTimer(); return true; }
    if (t.id === "btnStopTimer") { stopTimer(); return true; }
    if (t.id === "btnDismissAlarm") { $("alarmOverlay").classList.remove("on"); return true; }
    if (D.chk) {
      const idx = +D.chk;
      if (state.completedExs.has(idx)) state.completedExs.delete(idx);
      else { state.completedExs.add(idx); vibrate(20); }
      localStorage.setItem("completedExs_" + state.uid, JSON.stringify([...state.completedExs]));
      main();
      return true;
    }
    if (t.id === "wSave") {
      if (state.curExLetter && state.curExIndex !== null) {
        const ex = state.P.ex[state.curExLetter][state.curExIndex];
        ex.w = $("wInput").value.trim();
        ex.wu = $("wUnit").value;
        persist({ ex: state.P.ex });
        fechaModal();
        refresh();
      }
      return true;
    }
    if (D.open) {
      state.letter = D.open;
      state.configDetail = true;
      state.editingExIndex = null;
      state.draft = "";
      renderConfigScreen();
      return true;
    }
    if (t.id === "configDetailBack") {
      state.configDetail = false;
      state.editingExIndex = null;
      renderConfigScreen();
      return true;
    }
    if (D.edit !== undefined) { state.editingExIndex = +D.edit; renderConfigScreen(); return true; }
    if (t.id === "cancel-edit") { state.editingExIndex = null; state.draft = ""; renderConfigScreen(); return true; }
    if (D.up !== undefined) {
      const idx = +D.up;
      if (idx > 0) {
        const arr = state.P.ex[state.letter];
        [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
        persist({ ex: state.P.ex });
        renderConfigScreen();
      }
      return true;
    }
    if (D.down !== undefined) {
      const idx = +D.down;
      const arr = state.P.ex[state.letter];
      if (idx < arr.length - 1) {
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
        persist({ ex: state.P.ex });
        renderConfigScreen();
      }
      return true;
    }
    if (t.id === "done") {
      if (state.workoutStartTime || state.workoutTimerInterval) state.pendDuration = stopWorkoutTimer();
      else if (!state.pendDuration) state.pendDuration = "00:00:00";
      state.pend = state.sel;
      state.forcedLetter = t.dataset.letter;
      state.showLetterSelector = false;
      $("ov").classList.add("on");
      $("md").classList.add("on");
      return true;
    }
    if (t.id === "undo") {
      const o = state.F[state.sel];
      delete state.F[state.sel];
      if (state.P.animSeen && state.P.animSeen[state.sel]) {
        delete state.P.animSeen[state.sel];
        persist({ animSeen: state.P.animSeen });
      }
      state.forcedLetter = null;
      state.showLetterSelector = false;
      state.completedExs.clear();
      state.inWorkoutMode = false;
      state.pendDuration = null;
      resetWorkoutTimer();
      localStorage.removeItem("inWorkoutMode_" + state.uid);
      localStorage.removeItem("forcedLetter_" + state.uid);
      localStorage.removeItem("completedExs_" + state.uid);
      refresh();
      deleteDoc(doc(db, "users", state.uid, "feitos", state.sel)).catch(err => {
        console.error(err);
        showToast("Erro ao desfazer treino no servidor.", "error");
      });
      if (o && o.fid) delFoto(o.fid);
      return true;
    }
    if (t.id === "mSave") {
      const k = state.pend;
      if (!k) return true;
      fechaModal();
      await finishWorkout(k);
      return true;
    }
    if (t.id === "mFoto") { $("fi").dataset.m = "done"; $("fi").click(); return true; }
    if (t.id === "np") { $("fi").dataset.m = "ex"; $("fi").click(); return true; }
    if (D.del !== undefined) {
      const x = state.P.ex[state.letter].splice(+D.del, 1)[0];
      delFoto(x && x.f);
      persist({ ex: state.P.ex });
      renderConfigScreen();
      return true;
    }
    if (t.id === "na") {
      const n = $("nn").value.trim();
      if (!n) { $("nn").focus(); return true; }
      const sets = $("ns").value.trim();
      if (state.editingExIndex !== null) {
        const ex = state.P.ex[state.letter][state.editingExIndex];
        ex.name = n;
        ex.sets = sets;
        if (state.draft) {
          const oldF = ex.f;
          try {
            ex.f = await putFoto(state.draft);
            if (oldF) delFoto(oldF);
          } catch (e) {
            console.error(e);
            showToast("Erro ao enviar foto.", "error");
          }
          state.draft = "";
        }
        state.editingExIndex = null;
        persist({ ex: state.P.ex });
        renderConfigScreen();
      } else {
        let fid = "";
        if (state.draft) {
          try { fid = await putFoto(state.draft); }
          catch (x) {
            console.error(x);
            showToast("Erro ao enviar foto. Tente uma imagem menor.", "error");
          }
        }
        state.P.ex[state.letter].push({ id: uidg(), name: n, sets, f: fid });
        state.draft = "";
        $("nn").value = "";
        $("ns").value = "";
        persist({ ex: state.P.ex });
        renderConfigScreen();
      }
      return true;
    }
    if (D.tipo2) {
      state.P.tipo = D.tipo2;
      state.letter = LT()[0];
      state.exDetail = false;
      persist({ tipo: state.P.tipo });
      renderConfigScreen();
      refresh();
      return true;
    }
    if (D.freq2) {
      const newFreq = +D.freq2;
      const maxRest = 7 - newFreq;
      if (state.P.rest.length > maxRest) {
        showToast(`Com ${newFreq} treinos/semana, máximo ${maxRest} repouso(s).`, "info");
        return true;
      }
      state.P.freq = newFreq;
      persist({ freq: newFreq });
      renderConfigScreen();
      refresh();
      return true;
    }
    return false;
  } catch (err) {
    console.error("handleWorkoutAndConfig:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}