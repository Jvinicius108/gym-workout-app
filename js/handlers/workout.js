import { state } from '../state.js';
import { $, key, pd, mi, LT, getWorkoutForDate, uidg, showToast, vibrate } from '../utils.js';
import { persist, putFoto, delFoto } from '../db.js';
import { refresh, fechaModal } from '../helpers.js';
import { main, drawer, renderWorkoutSelector, renderConfigScreen } from '../ui.js';
import { finishWorkout } from '../streak.js';
import { startTimer, stopTimer, startWorkoutTimer, stopWorkoutTimer, resetWorkoutTimer } from '../timers.js';
import { db } from '../config.js';
import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { esc } from '../utils.js'; // Importando esc para o modal

export async function handleWorkoutAndConfig(t, D) {
  try {
    /* ============================================================
       1) AÇÕES BASEADAS EM DATASET (D.xxx) 
       ============================================================ */
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
      
      // DISPARA O AVISO DE SUPERSET
      state.hasShownSupersetWarning = false;
      const temSuperset = (state.P.ex[letter] || []).some(e => e.supersetId);
      if (temSuperset) {
        setTimeout(() => {
          $("ov").classList.add("on");
          $("mdSupersetWarning").classList.add("on");
        }, 500);
      }

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

    if (D.chk) {
      const idx = +D.chk;
      const isNowDone = !state.completedExs.has(idx);
      
      if (isNowDone) state.completedExs.add(idx);
      else state.completedExs.delete(idx);

      // Lógica do SUPERSET
      if (isNowDone) {
          const ex = state.P.ex[state.letter][idx];
          const nextEx = state.P.ex[state.letter][idx + 1];
          
          if (ex.supersetId && nextEx && nextEx.supersetId === ex.supersetId) {
              showToast("Sem descanso! Vá direto para o próximo exercício.", "info");
              vibrate([50, 100, 50]);
          }
      }

      localStorage.setItem("completedExs_" + state.uid, JSON.stringify([...state.completedExs]));
      main();
      return true;
    }

    if (D.link !== undefined) {
      state.linkingExIndex = +D.link;
      const baseEx = state.P.ex[state.letter][state.linkingExIndex];
      $("linkBaseName").textContent = baseEx.name;
      
      let listHtml = "";
      const arr = state.P.ex[state.letter];
      
      arr.forEach((ex, i) => {
        if (i === state.linkingExIndex) return;
        
        const isSameGroup = baseEx.supersetId && ex.supersetId === baseEx.supersetId;
        
        listHtml += `
          <button class="link-choice-btn ${isSameGroup ? 'selected' : ''}" data-link-to="${i}">
            <span>${esc(ex.name)}</span>
            <span>${isSameGroup ? '❌ Desvincular' : '🔗 Linkar'}</span>
          </button>
        `;
      });
      
      $("linkExerciseList").innerHTML = listHtml;
      $("ov").classList.add("on");
      $("mdLinkExercise").classList.add("on");
      return true;
    }

    if (D.linkTo !== undefined) {
      const targetIdx = +D.linkTo;
      const baseIdx = state.linkingExIndex;
      const arr = state.P.ex[state.letter];
      
      const baseEx = arr[baseIdx];
      const targetEx = arr[targetIdx];

      if (baseEx.supersetId && targetEx.supersetId === baseEx.supersetId) {
        delete baseEx.supersetId;
        delete targetEx.supersetId;
        arr.forEach(e => { if (e.supersetId === baseEx.supersetId) delete e.supersetId; });
      } else {
        const groupId = baseEx.supersetId || uidg();
        baseEx.supersetId = groupId;
        targetEx.supersetId = groupId;

        arr.splice(targetIdx, 1);
        const newBaseIdx = arr.indexOf(baseEx);
        arr.splice(newBaseIdx + 1, 0, targetEx);
      }

      persist({ ex: state.P.ex });
      state.linkingExIndex = null;
      fechaModal();
      renderConfigScreen();
      showToast("Superset atualizado!", "success");
      return true;
    }

    if (D.open) {
      state.letter = D.open;
      state.configDetail = true;
      state.editingExIndex = null;
      state.editingIsCardio = false;
      state.editSets = "";
      state.editReps = "";
      state.editDuration = "";
      state.draft = "";
      renderConfigScreen();
      return true;
    }

    if (D.edit !== undefined) {
      state.editingExIndex = +D.edit;
      const ex = state.P.ex[state.letter][state.editingExIndex];
      const setsText = ex.sets || "";

      state.editingIsCardio = false;
      state.editSets = "";
      state.editReps = "";
      state.editDuration = "";

      if (setsText.toLowerCase().includes("min")) {
          state.editingIsCardio = true;
          state.editDuration = setsText.replace(/[^\d]/g, ''); 
      } else {
          const match = setsText.match(/(\d+)\s*[xX]\s*(\d+)/);
          if (match) {
              state.editSets = match[1];
              state.editReps = match[2];
          } else if (setsText) {
              state.editSets = setsText;
          }
      }
      renderConfigScreen();
      return true;
    }

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

    if (D.del !== undefined) {
      const x = state.P.ex[state.letter].splice(+D.del, 1)[0];
      delFoto(x && x.f);
      persist({ ex: state.P.ex });
      renderConfigScreen();
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

    /* ============================================================
       2) O DICIONÁRIO DE AÇÕES
       ============================================================ */
    const acoes = {
      "btn-workout-rest": async () => {
        if (state.sel > key(new Date())) { showToast("Você só pode iniciar treinos a partir de hoje.", "info"); return; }
        state.inSelectorMode = true;
        renderWorkoutSelector();
      },

      "btn-change-workout": async () => {
        if (state.sel > key(new Date())) { showToast("Você só pode iniciar treinos a partir de hoje.", "info"); return; }
        state.inSelectorMode = true;
        renderWorkoutSelector();
      },

      "selectorBack": async () => {
        state.inSelectorMode = false;
        renderWorkoutSelector();
      },

      "btn-change": async () => {
        state.showLetterSelector = !state.showLetterSelector;
        main();
      },

      "btnStopTimer": async () => {
        stopTimer();
      },

      "btnDismissAlarm": async () => {
        $("alarmOverlay").classList.remove("on");
      },

      "wSave": async () => {
        if (state.curExLetter && state.curExIndex !== null) {
          const ex = state.P.ex[state.curExLetter][state.curExIndex];
          ex.w = $("wInput").value.trim();
          ex.wu = $("wUnit").value;
          persist({ ex: state.P.ex });
          fechaModal();
          refresh();
        }
      },

      "configDetailBack": async () => {
        state.configDetail = false;
        state.editingExIndex = null;
        state.editingIsCardio = false;
        state.editSets = "";
        state.editReps = "";
        state.editDuration = "";
        renderConfigScreen();
      },

      "cancel-edit": async () => {
        state.editingExIndex = null;
        state.editingIsCardio = false;
        state.editSets = "";
        state.editReps = "";
        state.editDuration = "";
        state.draft = "";
        renderConfigScreen();
      },

      "cancelLink": async () => {
        state.linkingExIndex = null;
        fechaModal();
      },

      "btnCloseSupersetWarning": async () => {
        fechaModal();
      },

      "done": async () => {
        if (state.workoutStartTime || state.workoutTimerInterval) state.pendDuration = stopWorkoutTimer();
        else if (!state.pendDuration) state.pendDuration = "00:00:00";
        state.pend = state.sel;
        state.forcedLetter = t.dataset.letter;
        state.showLetterSelector = false;
        $("ov").classList.add("on");
        $("md").classList.add("on");
      },

      "undo": async () => {
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
      },

      "mSave": async () => {
        const k = state.pend;
        if (!k) return;
        fechaModal();
        await finishWorkout(k);
      },

      "mFoto": async () => {
        $("fi").dataset.m = "done";
        $("fi").click();
      },

      "np": async () => {
        $("fi").dataset.m = "ex";
        $("fi").click();
      },

      "na": async () => {
        const n = $("nn").value.trim();
        if (!n) { $("nn").focus(); return; }
        
        const isCardio = $("exIsCardio").checked;
        let setsStr = "";

        if (isCardio) {
            const dur = $("exDuration").value.trim();
            if (!dur) { showToast("Informe o tempo em minutos.", "error"); return; }
            setsStr = dur + " min";
        } else {
            const s = $("exSets").value.trim();
            const r = $("exReps").value.trim();
            if (!s || !r) { showToast("Informe séries e repetições.", "error"); return; }
            setsStr = s + "x" + r;
        }

        if (state.editingExIndex !== null) {
          const ex = state.P.ex[state.letter][state.editingExIndex];
          ex.name = n;
          ex.sets = setsStr;
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
          state.editingIsCardio = false;
          state.editSets = "";
          state.editReps = "";
          state.editDuration = "";
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
          state.P.ex[state.letter].push({ id: uidg(), name: n, sets: setsStr, f: fid });
          state.draft = "";
          $("nn").value = "";
          $("exSets").value = "";
          $("exReps").value = "";
          $("exDuration").value = "";
          $("exIsCardio").checked = false;
          persist({ ex: state.P.ex });
          renderConfigScreen();
        }
      }
    };

    if (t.id && acoes[t.id]) {
      await acoes[t.id]();
      return true;
    }

    return false;
  } catch (err) {
    console.error("handleWorkoutAndConfig:", err);
    showToast("Ocorreu um erro.", "error");
    return true;
  }
}