import { state } from './state.js';
import { $, esc, LT, getLabel, safeRender, Icons } from './utils.js';
import { hydrate } from './db.js';
import { TIPOS } from './config.js';

export function renderConfigScreen() {
  if (!state.inConfigMode) { $("configScreen").classList.remove("on"); return; }
  $("configScreen").classList.add("on");

  const prevName = $("nn")?.value || "";
  const prevSets = $("ns")?.value || "";

  let h = "";
  if (!state.configDetail) {
    $("configTitle").textContent = "Configurar Treinos";
    h += `<div class="config-section">`;
    h += `<h3>Tipo de Treino</h3><div class="row">${Object.keys(TIPOS).map(t => `<button class="chip${state.P.tipo === t ? " on" : ""}" data-tipo2="${t}">${t}</button>`).join("")}</div>`;
    h += `<h3 style="margin-top:20px">Treinos por semana</h3><div class="row">${[1,2,3,4,5,6].map(n => `<button class="chip${state.P.freq === n ? " on" : ""}" data-freq2="${n}">${n}</button>`).join("")}</div>`;
    h += `<h3 style="margin-top:20px">Nomes dos Treinos (Opcional)</h3>`;
    h += `<div style="display:flex; flex-direction:column; gap:12px;">`;
    LT().forEach(l => {
      h += `<div style="display:flex; align-items:center; gap:12px;">
              <span style="font-weight:800; width:24px; font-family: var(--font-head);">${l}</span>
              <input type="text" id="title_${l}" placeholder="Ex: Peito e Tríceps" value="${state.P.customTitles && state.P.customTitles[l] ? esc(state.P.customTitles[l]) : ''}" style="margin:0;">
            </div>`;
    });
    h += `</div><button class="btn btn-secondary" id="saveTitles" style="margin-top:16px;">Salvar Nomes</button></div>`;
    h += `<div class="config-section"><h3>Meus Exercícios</h3>`;
    h += `<div class="wgrid">${LT().map(l => {
      const n = (state.P.ex[l] || []).length;
      return `<button class="wcard" data-open="${l}"><b>Treino ${esc(getLabel(l))}</b><span>${n} exercício${n === 1 ? "" : "s"}</span></button>`;
    }).join("")}</div></div>`;
  } else {
    $("configTitle").textContent = "Treino " + getLabel(state.letter);
    h += `<button class="btn btn-secondary" id="configDetailBack" style="margin-bottom:16px; display: flex; align-items: center; justify-content: center; gap: 8px;">${Icons.arrowLeft} Voltar aos Treinos</button>`;
    h += `<div class="config-section">`;
    const exs = state.P.ex[state.letter] || [];
    if (!exs.length) h += `<div class="empty">Nenhum exercício cadastrado ainda.</div>`;
    else h += exs.map((e, i) => {
      let img = e.f ? (state.cache[e.f] ? `<img src="${state.cache[e.f]}" alt="">` : `<img data-f="${e.f}" alt="">`) : `<div class="ph">${Icons.dumbbell}</div>`;
      return `<div class="li">${img}<div style="flex:1;"><b>${esc(e.name)}</b><br><small>${esc(e.sets || "")}</small></div><div style="display:flex; gap:4px; align-items:center;">
        <button data-up="${i}" style="padding:6px;" aria-label="Mover ${esc(e.name)} para cima">${Icons.up}</button>
        <button data-down="${i}" style="padding:6px;" aria-label="Mover ${esc(e.name)} para baixo">${Icons.down}</button>
        <button data-edit="${i}" style="padding:6px;" aria-label="Editar ${esc(e.name)}">${Icons.edit}</button>
        <button data-del="${i}" style="padding:6px; color: var(--danger);" aria-label="Apagar ${esc(e.name)}">${Icons.trash}</button>
      </div></div>`;
    }).join("");
    h += `<div class="add"><b>${state.editingExIndex !== null ? 'Editando exercício' : 'Adicionar exercício'}</b><input type="text" id="nn" placeholder="Nome (ex: Supino reto)"><input type="text" id="ns" placeholder="Séries x repetições (ex: 4x12)"><div class="row">${state.draft ? `<img src="${state.draft}" style="width:64px;height:64px;border-radius:12px;object-fit:contain;background:var(--bg);margin-top:12px" alt="">` : ''}<button class="btn btn-secondary" id="np" style="flex: 1; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">${Icons.camera} ${state.draft ? "Trocar foto" : "Foto do exercício"}</button></div>`;
    h += `<div style="display:flex; gap:12px; margin-top:12px;">`;
    if (state.editingExIndex !== null) h += `<button class="btn btn-danger" id="cancel-edit" style="flex:1;">Cancelar</button>`;
    h += `<button class="btn btn-primary" id="na" style="flex:2; margin:0;">${state.editingExIndex !== null ? 'Salvar Alterações' : 'Adicionar'}</button>`;
    h += `</div></div></div>`;
  }

  safeRender("configContent", h);

  if ($("nn")) {
    if (state.editingExIndex !== null && state.P.ex[state.letter]?.[state.editingExIndex]) {
      $("nn").value = prevName || state.P.ex[state.letter][state.editingExIndex].name;
    } else {
      $("nn").value = prevName;
    }
  }
  if ($("ns")) {
    if (state.editingExIndex !== null && state.P.ex[state.letter]?.[state.editingExIndex]) {
      $("ns").value = prevSets || state.P.ex[state.letter][state.editingExIndex].sets || "";
    } else {
      $("ns").value = prevSets;
    }
  }
  hydrate();
}

export function renderMascotScreen() {
    if (!state.inMascotMode) { $("mascotScreen").classList.remove("on"); return; }
    $("mascotScreen").classList.add("on");

    $("mascotNameInput").value = state.P.mascotName || "";
    $("guardianNameInput").value = state.P.guardianName || "";
    
    const streak = state.P.streak || 0;
    const misses = state.P.misses || 0;
    
    $("mascotStreakDisplay").textContent = streak + (streak === 1 ? " dia" : " dias");
    $("mascotMissesDisplay").textContent = misses + (misses === 1 ? " dia" : " dias");

    const percent = Math.min(100, (streak / 10) * 100);
    $("mascotProfileBar").style.width = percent + "%";

    if (streak >= 10) {
        $("mascotStatusText").textContent = "Saudável e Fervendo!";
        $("mascotStatusText").style.color = "#ff4500";
    } else if (streak >= 5) {
        $("mascotStatusText").textContent = "Aquecendo...";
        $("mascotStatusText").style.color = "#ffa500";
    } else {
        $("mascotStatusText").textContent = "Me ajude até ficar saudável!";
        $("mascotStatusText").style.color = "var(--mu)";
    }
}