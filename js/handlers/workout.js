import { state } from '../state.js';
import { $, key, pd, mi, LT, getWorkoutForDate, uidg, showToast, vibrate, esc, Icons } from '../utils.js';
import { persist, putFoto, delFoto, putGlobalFoto, getGlobalFoto, sanitizeName } from '../db.js';
import { refresh, fechaModal } from '../helpers.js';
import { main, drawer, renderWorkoutSelector, renderConfigScreen } from '../ui.js';
import { renderSubstitutesScreen, renderAllSubsScreen } from '../ui-settings.js';
import { finishWorkout } from '../streak.js';
import { startTimer, stopTimer, startWorkoutTimer, stopWorkoutTimer, resetWorkoutTimer } from '../timers.js';
import { db } from '../config.js';
import { doc, deleteDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getSubstitutosPara } from '../substitutions.js';

export async function handleWorkoutAndConfig(t, D) {
  try {
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
      state.activeSwaps = {};
      localStorage.setItem("inWorkoutMode_" + state.uid, "true");
      localStorage.setItem("sel_" + state.uid, state.sel);
      localStorage.setItem("forcedLetter_" + state.uid, state.forcedLetter);
      localStorage.setItem("completedExs_" + state.uid, "[]");
      
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
      state.activeSwaps = {};
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
      state.activeSwaps = {};
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
      const idx = +D.weight;
      state.curExIndex = idx;
      state.curExLetter = state.letter;
      
      const ex = state.P.ex[state.curExLetter][state.curExIndex];
      const swapped = state.activeSwaps && state.activeSwaps[idx];

      if (swapped) {
          $("wName").textContent = swapped.name + " (Substituto)";
          $("wInput").value = swapped.w || "";
          $("wUnit").value = swapped.wu || "kg";
      } else {
          $("wName").textContent = ex.name;
          $("wInput").value = ex.w || "";
          $("wUnit").value = ex.wu || "kg";
      }
      
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
            <span>${isSameGroup ? '❌ Desvincular' : `${Icons.link} Linkar`}</span>
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

    if (D.subs !== undefined) {
      state.subsTargetIndex = +D.subs;
      state.inSubstitutesMode = true;
      renderSubstitutesScreen();
      return true;
    }

    if (t.id === "subsBack") {
      state.inSubstitutesMode = false;
      state.subsTargetIndex = null;
      $("substitutesScreen").classList.remove("on");
      $("configScreen").classList.add("on");
      renderConfigScreen();
      return true;
    }

    if (D.delDictSub !== undefined) {
      const idx = +D.delDictSub;
      const ex = state.P.ex[state.letter][state.subsTargetIndex];
      if (ex.substitutes && ex.substitutes[idx]) {
        const removed = ex.substitutes.splice(idx, 1)[0];
        if (removed.f) delFoto(removed.f);
        persist({ ex: state.P.ex });
        if ($("allSubsScreen").classList.contains("on")) renderAllSubsScreen(); else renderSubstitutesScreen();
      }
      return true;
    }

    if (D.allSubs) { renderAllSubsScreen(); return true; }
    if (t.id === "allSubsBack") { $("allSubsScreen").classList.remove("on"); $("allSubsScreen").style.display = "none"; return true; }
    if (D.filterSubs) { renderAllSubsScreen(D.filterSubs); return true; }

    if (t.id === "btnOpenTicketFooter") {
      $("ticketBaseEx").value = "";
      $("ticketMessage").value = "";
      $("ov").classList.add("on");
      $("mdTicket").classList.add("on");
      return true;
    }

    if (t.id === "btnCancelTicket") { fechaModal(); return true; }

    if (t.id === "btnSubmitTicket") {
      const baseEx = $("ticketBaseEx").value.trim();
      const msg = $("ticketMessage").value.trim();
      if (!baseEx) { showToast("Informe o nome do exercício.", "error"); return true; }

      const btn = $("btnSubmitTicket");
      btn.textContent = "Enviando...";
      btn.disabled = true;

      try {
        await addDoc(collection(db, "chamados"), {
            uid: state.uid,
            userName: state.P.displayName || state.P.nome,
            baseExercise: baseEx,
            message: msg || "Sem observações.",
            createdAt: Date.now()
        });
        showToast("Chamado enviado com sucesso!", "success");
        fechaModal();
      } catch (e) {
        console.error(e);
        showToast("Erro ao enviar chamado.", "error");
      } finally {
        btn.textContent = "Enviar Chamado";
        btn.disabled = false;
      }
      return true;
    }

    if (t.id === "btnSubPhoto") { $("fiSubstitute").click(); return true; }
    if (t.id === "btnCancelSubstitute") { state.pendingSubstitutePhoto = null; state.editingSubIndex = null; fechaModal(); return true; }

    if (D.addDictSub) {
      let sub;
      try { sub = JSON.parse(D.addDictSub); } catch (e) { return true; }

      state.pendingSubstitutePhoto = null;
      state.editingSubIndex = null;
      if ($("subNameInput")) $("subNameInput").value = sub.name;
      if ($("subSetsInput")) $("subSetsInput").value = "3x12";
      if ($("subIsCardio")) $("subIsCardio").checked = false;
      if ($("subStrengthFields")) $("subStrengthFields").style.display = 'flex';
      if ($("subCardioFields")) $("subCardioFields").style.display = 'none';
      if ($("subPhotoPreview")) {
        $("subPhotoPreview").style.display = "none";
        $("subPhotoPreview").src = "";
        $("subPhotoPreview").removeAttribute("data-f");
      }

      const globalId = 'global_' + sanitizeName(sub.name);
      if (state.cache[globalId]) {
        $("subPhotoPreview").src = state.cache[globalId];
        $("subPhotoPreview").style.display = "block";
        state.pendingSubstitutePhoto = state.cache[globalId];
      } else {
        getGlobalFoto(sub.name).then(d => {
          if (d) {
            $("subPhotoPreview").src = d;
            $("subPhotoPreview").style.display = "block";
            state.pendingSubstitutePhoto = d;
          }
        });
      }

      $("subBaseExerciseArea").style.display = 'none';
      $("ov").classList.add("on");
      $("mdAddSubstitute").classList.add("on");
      return true;
    }

    if (D.editSub !== undefined) {
      state.editingSubIndex = +D.editSub;
      let baseEx = null;
      if (state.subsTargetIndex !== null && state.letter) baseEx = state.P.ex[state.letter][state.subsTargetIndex];
      else {
          const sub = D.subBaseFound ? JSON.parse(decodeURIComponent(D.subBaseFound)) : null;
          if (sub) { baseEx = state.P.ex[sub.letter][sub.index]; state.subsTargetIndex = sub.index; state.letter = sub.letter; }
      }
      if (!baseEx) return true;
      
      const sub = baseEx.substitutes[state.editingSubIndex];
      if (!sub) return true;

      state.pendingSubstitutePhoto = sub.f ? state.cache[sub.f] : null;
      
      if ($("subNameInput")) $("subNameInput").value = sub.name;
      if ($("subIsCardio")) $("subIsCardio").checked = (sub.type === 'cardio');
      
      if (sub.type === 'cardio') {
          if ($("subStrengthFields")) $("subStrengthFields").style.display = 'none';
          if ($("subCardioFields")) $("subCardioFields").style.display = 'block';
          if ($("subDurationInput")) $("subDurationInput").value = sub.sets.replace(/[^\d]/g, '');
      } else {
          if ($("subStrengthFields")) $("subStrengthFields").style.display = 'flex';
          if ($("subCardioFields")) $("subCardioFields").style.display = 'none';
          if ($("subSetsInput")) $("subSetsInput").value = sub.sets;
      }
      
      if ($("subPhotoPreview")) {
          if (sub.f && state.cache[sub.f]) {
              $("subPhotoPreview").src = state.cache[sub.f];
              $("subPhotoPreview").style.display = "block";
              $("subPhotoPreview").removeAttribute("data-f");
          } else if (sub.f) {
              $("subPhotoPreview").src = "";
              $("subPhotoPreview").setAttribute("data-f", sub.f);
              $("subPhotoPreview").style.display = "block";
              import('../db.js').then(({ hydrate }) => hydrate());
          } else {
              $("subPhotoPreview").style.display = "none";
              $("subPhotoPreview").removeAttribute("data-f");
          }
      }
      
      if ($("subBaseExerciseArea")) $("subBaseExerciseArea").style.display = 'none';
      $("ov").classList.add("on");
      $("mdAddSubstitute").classList.add("on");
      return true;
    }

    if (t.id === "btnSaveSubstitute") {
      const name = $("subNameInput").value.trim();
      if (!name) { showToast("Informe o nome do exercício.", "error"); return true; }

      let baseEx = null;
      let letter = null;
      let index = null;

      if (state.subsTargetIndex !== null && state.letter) {
        baseEx = state.P.ex[state.letter][state.subsTargetIndex];
        letter = state.letter; index = state.subsTargetIndex;
      } else {
        const select = $("subBaseExerciseSelect");
        if (select && select.value) {
          const parts = select.value.split('|');
          letter = parts[0]; index = +parts[1];
          baseEx = state.P.ex[letter][index];
        }
      }

      const isCardio = $("subIsCardio").checked;
      let setsStr = "";
      if (isCardio) {
        const dur = $("subDurationInput").value.trim();
        if (!dur) { showToast("Informe o tempo em minutos.", "error"); return true; }
        setsStr = dur + " min";
      } else {
        const s = $("subSetsInput").value.trim();
        if (!s) { showToast("Informe séries e repetições.", "error"); return true; }
        setsStr = s;
      }

      if (state.pendingSubstitutePhoto) {
        if (baseEx) {
            const fotoId = await putFoto(state.pendingSubstitutePhoto);
            if (!baseEx.substitutes) baseEx.substitutes = [];
            if (state.editingSubIndex !== null) {
                const oldSub = baseEx.substitutes[state.editingSubIndex];
                if (oldSub.f && oldSub.f !== fotoId) delFoto(oldSub.f);
                baseEx.substitutes[state.editingSubIndex] = { id: oldSub.id, name, sets: setsStr, f: fotoId, type: isCardio ? 'cardio' : 'strength' };
                state.editingSubIndex = null;
            } else {
                baseEx.substitutes.push({ id: uidg(), name, sets: setsStr, f: fotoId, type: isCardio ? 'cardio' : 'strength' });
            }
        } else {
            try {
                await putGlobalFoto(name, state.pendingSubstitutePhoto);
                if (!state.P.exImages) state.P.exImages = {};
                state.P.exImages[name] = 'global_' + sanitizeName(name);
                persist({ exImages: state.P.exImages });
            } catch (error) {
                showToast("Não foi possível salvar no Banco Global. Verifique sua conexão.", "error");
                return true;
            }
        }
      } else {
        if (baseEx) {
            if (!baseEx.substitutes) baseEx.substitutes = [];
            if (state.editingSubIndex !== null) {
                const oldSub = baseEx.substitutes[state.editingSubIndex];
                baseEx.substitutes[state.editingSubIndex] = { id: oldSub.id, name, sets: setsStr, f: oldSub.f, type: isCardio ? 'cardio' : 'strength' };
                state.editingSubIndex = null;
            } else {
                baseEx.substitutes.push({ id: uidg(), name, sets: setsStr, f: "", type: isCardio ? 'cardio' : 'strength' });
            }
        }
      }
      
      persist({ ex: state.P.ex });
      state.pendingSubstitutePhoto = null;
      fechaModal();
      
      if ($("allSubsScreen").classList.contains("on")) renderAllSubsScreen();
      else if (state.inSubstitutesMode) renderSubstitutesScreen();
      else renderConfigScreen();
      
      showToast("Salvo com sucesso!", "success");
      return true;
    }

    if (D.swapEx !== undefined) {
      const idx = +D.swapEx;
      const ex = state.P.ex[state.letter][idx];
      
      const dicSubs = getSubstitutosPara(ex.name);
      let allSubs = [];
      
      if (ex.substitutes) ex.substitutes.forEach(s => allSubs.push(s));
      
      const key = String(ex.name).trim().toLowerCase();
      const globalSubs = state.globalSubstitutes ? (state.globalSubstitutes[key] || []) : [];
      globalSubs.forEach(g => {
          if (!allSubs.find(s => s.name === g.name)) allSubs.push({ name: g.name, sets: g.sets, type: 'strength', f: g.f });
      });

      if (dicSubs.principais) dicSubs.principais.forEach(p => { if (!allSubs.find(s => s.name === p.name)) allSubs.push({ name: p.name, sets: ex.sets || '3x12', type: 'strength', f: '' }); });
      if (dicSubs.secundarios) dicSubs.secundarios.forEach(p => { if (!allSubs.find(s => s.name === p.name)) allSubs.push({ name: p.name, sets: ex.sets || '3x12', type: 'strength', f: '' }); });
      
      if (allSubs.length === 0) { showToast("Nenhum substituto cadastrado.", "info"); return true; }
      
      let listHtml = "";
      allSubs.forEach((sub, subIdx) => {
        listHtml += `<button class="link-choice-btn" data-do-swap="${idx}|${subIdx}"><span>${esc(sub.name)} <small style="color:var(--mu);">(${esc(sub.sets)})</small></span><span style="color:var(--water);">${Icons.swap}</span></button>`;
      });
      if (state.activeSwaps[idx]) {
        listHtml += `<button class="link-choice-btn" data-do-swap="${idx}|-1" style="border-color:var(--success);"><span style="color:var(--success);">${Icons.arrowLeft} Voltar ao original (${esc(ex.name)})</span></button>`;
      }
      $("swapExerciseList").innerHTML = listHtml;
      $("ov").classList.add("on");
      $("mdSwapExercise").classList.add("on");

      return true;
    }

    if (D.doSwap) {
      const parts = D.doSwap.split('|');
      const idx = +parts[0];
      const subIdx = +parts[1];
      const ex = state.P.ex[state.letter][idx];
      
      if (subIdx === -1) { delete state.activeSwaps[idx]; } 
      else { 
          const dicSubs = getSubstitutosPara(ex.name);
          let allSubs = [];
          if (ex.substitutes) ex.substitutes.forEach(s => allSubs.push(s));
          
          const key = String(ex.name).trim().toLowerCase();
          const globalSubs = state.globalSubstitutes ? (state.globalSubstitutes[key] || []) : [];
          globalSubs.forEach(g => { if (!allSubs.find(s => s.name === g.name)) allSubs.push({ name: g.name, sets: g.sets, type: 'strength', f: g.f }); });

          if (dicSubs.principais) dicSubs.principais.forEach(p => { if (!allSubs.find(s => s.name === p.name)) allSubs.push({ name: p.name, sets: ex.sets || '3x12', type: 'strength', f: '' }); });
          if (dicSubs.secundarios) dicSubs.secundarios.forEach(p => { if (!allSubs.find(s => s.name === p.name)) allSubs.push({ name: p.name, sets: ex.sets || '3x12', type: 'strength', f: '' }); });
          
          const sub = allSubs[subIdx];
          if (sub) {
              state.activeSwaps[idx] = sub;
              if (!sub.f) {
                  const globalId = 'global_' + sanitizeName(sub.name);
                  if (state.cache[globalId]) sub.f = globalId;
                  else {
                      getGlobalFoto(sub.name).then(d => {
                          if (d) { sub.f = globalId; main(); }
                      });
                  }
              }
          }
      }
      fechaModal();
      main();
      return true;
    }

    if (t.id === "cancelSwap") { fechaModal(); return true; }

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
      state.editingIsCardio = false; state.editSets = ""; state.editReps = ""; state.editDuration = "";
      if (setsText.toLowerCase().includes("min")) {
          state.editingIsCardio = true; state.editDuration = setsText.replace(/[^\d]/g, ''); 
      } else {
          const match = setsText.match(/(\d+)\s*[xX]\s*(\d+)/);
          if (match) { state.editSets = match[1]; state.editReps = match[2]; } else if (setsText) { state.editSets = setsText; }
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
      if (x && x.substitutes) { x.substitutes.forEach(s => { if (s.f) delFoto(s.f); }); }
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
      if (state.P.rest.length > maxRest) { showToast(`Máximo ${maxRest} repouso(s).`, "info"); return true; }
      state.P.freq = newFreq;
      persist({ freq: newFreq });
      renderConfigScreen();
      refresh();
      return true;
    }

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
      "selectorBack": async () => { state.inSelectorMode = false; renderWorkoutSelector(); },
      "btn-change": async () => { state.showLetterSelector = !state.showLetterSelector; main(); },
      "btnStopTimer": async () => { stopTimer(); },
      "btnDismissAlarm": async () => { $("alarmOverlay").classList.remove("on"); },
      "wSave": async () => {
        if (state.curExLetter && state.curExIndex !== null) {
          const idx = state.curExIndex;
          const swapped = state.activeSwaps && state.activeSwaps[idx];
          const weightVal = $("wInput").value.trim();
          const unitVal = $("wUnit").value;

          if (swapped) { swapped.w = weightVal; swapped.wu = unitVal; } 
          else { const ex = state.P.ex[state.curExLetter][idx]; ex.w = weightVal; ex.wu = unitVal; }
          
          persist({ ex: state.P.ex });
          fechaModal();
          refresh();
        }
      },
      "configDetailBack": async () => {
        state.configDetail = false;
        state.editingExIndex = null;
        state.editingIsCardio = false;
        state.editSets = ""; state.editReps = ""; state.editDuration = "";
        renderConfigScreen();
      },
      "cancel-edit": async () => {
        state.editingExIndex = null; state.editingIsCardio = false;
        state.editSets = ""; state.editReps = ""; state.editDuration = "";
        state.draft = "";
        renderConfigScreen();
      },
      "cancelLink": async () => { state.linkingExIndex = null; fechaModal(); },
      "btnCloseSupersetWarning": async () => { fechaModal(); },
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
        if (state.P.animSeen && state.P.animSeen[state.sel]) { delete state.P.animSeen[state.sel]; persist({ animSeen: state.P.animSeen }); }
        state.forcedLetter = null; state.showLetterSelector = false; state.completedExs.clear(); state.activeSwaps = {};
        state.inWorkoutMode = false; state.pendDuration = null; resetWorkoutTimer();
        localStorage.removeItem("inWorkoutMode_" + state.uid);
        localStorage.removeItem("forcedLetter_" + state.uid);
        localStorage.removeItem("completedExs_" + state.uid);
        refresh();
        deleteDoc(doc(db, "users", state.uid, "feitos", state.sel)).catch(err => { showToast("Erro ao desfazer.", "error"); });
        if (o && o.fid) delFoto(o.fid);
      },
      "mSave": async () => {
        const k = state.pend;
        if (!k) return;
        fechaModal();
        await finishWorkout(k);
      },
      "mFoto": async () => { $("fi").dataset.m = "done"; $("fi").click(); },
      "np": async () => { $("fi").dataset.m = "ex"; $("fi").click(); },
      "na": async () => {
        const n = $("nn").value.trim();
        if (!n) { $("nn").focus(); return; }
        const isCardio = $("exIsCardio").checked;
        let setsStr = "";
        if (isCardio) {
            const dur = $("exDuration").value.trim();
            if (!dur) { showToast("Informe o tempo.", "error"); return; }
            setsStr = dur + " min";
        } else {
            const s = $("exSets").value.trim();
            const r = $("exReps").value.trim();
            if (!s || !r) { showToast("Informe séries e repetições.", "error"); return; }
            setsStr = s + "x" + r;
        }
        if (state.editingExIndex !== null) {
          const ex = state.P.ex[state.letter][state.editingExIndex];
          const oldName = ex.name;
          if (oldName.toLowerCase() !== n.toLowerCase()) {
              if (!ex.substitutes) ex.substitutes = [];
              if (!ex.substitutes.find(s => s.name === oldName)) ex.substitutes.push({ id: uidg(), name: oldName, sets: ex.sets, f: ex.f || "", type: ex.type || 'strength' });
          }
          ex.name = n; ex.sets = setsStr;
          if (state.draft) {
            const oldF = ex.f;
            try { ex.f = await putFoto(state.draft); if (oldF) delFoto(oldF); } catch (e) { showToast("Erro na foto.", "error"); }
            state.draft = "";
          }
          state.editingExIndex = null; state.editingIsCardio = false; state.editSets = ""; state.editReps = ""; state.editDuration = "";
          persist({ ex: state.P.ex });
          renderConfigScreen();
        } else {
          let fid = "";
          if (state.draft) { try { fid = await putFoto(state.draft); } catch (x) { showToast("Erro na foto.", "error"); } }
          state.P.ex[state.letter].push({ id: uidg(), name: n, sets: setsStr, f: fid });
          state.draft = ""; $("nn").value = ""; $("exSets").value = ""; $("exReps").value = ""; $("exDuration").value = ""; $("exIsCardio").checked = false;
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