import { state } from './state.js';
import { $, esc, LT, getLabel, safeRender, Icons } from './utils.js';
import { hydrate } from './db.js';
import { TIPOS } from './config.js';
import { getSubstitutosPara, FAMILIAS } from './substitutions.js';

export function renderConfigScreen() {
  if (!state.inConfigMode) { $("configScreen").classList.remove("on"); return; }
  if (state.inSubstitutesMode) { renderSubstitutesScreen(); return; }
  $("configScreen").classList.add("on");

  const prevName = $("nn")?.value || "";
  const prevSets = $("exSets")?.value || state.editSets || "";
  const prevReps = $("exReps")?.value || state.editReps || "";
  const prevDur = $("exDuration")?.value || state.editDuration || "";

  let h = "";
  if (!state.configDetail) {
    $("configTitle").textContent = "Configurar Treinos";
    h += `<div class="config-section">`;
    h += `<h3>Tipo de Treino</h3><div class="row">${Object.keys(TIPOS).map(t => `<button class="chip${state.P.tipo === t ? " on" : ""}" data-tipo2="${t}">${t}</button>`).join("")}</div>`;
    
    h += `<h3 class="mt-20">Treinos por semana</h3><div class="row">${[1,2,3,4,5,6].map(n => `<button class="chip${state.P.freq === n ? " on" : ""}" data-freq2="${n}">${n}</button>`).join("")}</div>`;
    
    h += `<h3 class="mt-20">Nomes dos Treinos (Opcional)</h3>`;
    h += `<div class="flex-col gap-12">`;
    LT().forEach(l => {
      h += `<div class="flex-row gap-12">
              <span style="font-weight:800; width:24px; font-family: var(--font-head);">${l}</span>
              <input type="text" id="title_${l}" placeholder="Ex: Peito e Tríceps" value="${state.P.customTitles && state.P.customTitles[l] ? esc(state.P.customTitles[l]) : ''}" style="margin:0;">
            </div>`;
    });
    h += `</div><button class="btn btn-secondary mt-16" id="saveTitles">Salvar Nomes</button></div>`;
    
    h += `<div class="config-section"><h3>Meus Exercícios</h3>`;
    h += `<div class="wgrid">${LT().map(l => {
      const n = (state.P.ex[l] || []).length;
      return `<button class="wcard" data-open="${l}"><b>Treino ${esc(getLabel(l))}</b><span>${n} exercício${n === 1 ? "" : "s"}</span></button>`;
    }).join("")}</div></div>`;

    h += `<div class="config-section all-subs-preview-box" style="border-style: solid; border-color: var(--water);">
            <div class="all-subs-header" style="margin-bottom:0;">
              <h3 style="color:var(--water);">Biblioteca de Substitutos</h3>
            </div>
            <p style="color:var(--mu); font-size:13px; margin: 8px 0 16px 0; text-align:center;">Consulte os substitutos disponíveis no banco global ou abra um chamado para o Administrador.</p>
            <button class="btn btn-secondary" data-all-subs="1" style="border-color: var(--water); color: var(--water); font-weight:700;">
              VER TODOS OS SUBSTITUTOS
            </button>
          </div>`;

  } else {
    $("configTitle").textContent = "Treino " + getLabel(state.letter);
    h += `<button class="btn btn-secondary mt-16 flex-row gap-8" id="configDetailBack" style="justify-content: center;">${Icons.arrowLeft} Voltar aos Treinos</button>`;
    h += `<div class="config-section mt-16">`;
    const exs = state.P.ex[state.letter] || [];
    
    if (!exs.length) {
      h += `<div class="empty">Nenhum exercício cadastrado ainda.</div>`;
    } else {
      h += exs.map((e, i) => {
        let img = e.f ? (state.cache[e.f] ? `<img src="${state.cache[e.f]}" alt="">` : `<img data-f="${e.f}" alt="">`) : `<div class="ph">${Icons.dumbbell}</div>`;
        const hasSuperset = !!e.supersetId;
        const numSubs = (e.substitutes || []).length;

        return `<div class="li ${hasSuperset ? 'superset-card' : ''}">
          ${img}
          <div class="flex-1">
            <b>${esc(e.name)}</b>
            ${hasSuperset ? '<span class="superset-badge">Bi-set</span>' : ''}
            <br><small>${esc(e.sets || "")}${numSubs > 0 ? ` · ${numSubs} sub.` : ''}</small>
          </div>
          <div class="flex-row gap-8">
            <button data-subs="${i}" style="padding:6px; color: var(--water);" aria-label="Substitutos">${Icons.swap}</button>
            <button data-link="${i}" style="padding:6px; color: ${hasSuperset ? '#ffd700' : 'var(--mu)'};" aria-label="Linkar Exercício">${Icons.link}</button>
            <button data-up="${i}" style="padding:6px;" aria-label="Mover para cima">${Icons.up}</button>
            <button data-down="${i}" style="padding:6px;" aria-label="Mover para baixo">${Icons.down}</button>
            <button data-edit="${i}" style="padding:6px;" aria-label="Editar">${Icons.edit}</button>
            <button data-del="${i}" style="padding:6px; color: var(--danger);" aria-label="Apagar">${Icons.trash}</button>
          </div>
        </div>`;
      }).join("");
    }
    
    h += `<div class="add">
      <b>${state.editingExIndex !== null ? 'Editando exercício' : 'Adicionar exercício'}</b>
      
      <input type="text" id="nn" placeholder="Nome (ex: Supino reto)" value="${esc(prevName || (state.editingExIndex !== null ? state.P.ex[state.letter][state.editingExIndex].name : ""))}">
      
      <div class="row mt-8" style="justify-content: flex-start; align-items: center;">
        <input type="checkbox" id="exIsCardio" style="width: auto; margin: 0 8px 0 0; transform: scale(1.3); cursor: pointer;" ${state.editingIsCardio ? 'checked' : ''}>
        <label for="exIsCardio" style="font-size: 14px; color: var(--mu); font-weight: 600; cursor: pointer;">É exercício de Cardio? (por tempo)</label>
      </div>

      <div id="exStrengthFields" class="row mt-8" style="display: ${state.editingIsCardio ? 'none' : 'flex'};">
        <input type="number" id="exSets" placeholder="Séries (ex: 3)" style="flex: 1; margin-top: 0;" value="${esc(prevSets)}" inputmode="numeric">
        <span style="color: var(--mu); font-weight: 700; margin-top: 8px;">x</span>
        <input type="number" id="exReps" placeholder="Reps (ex: 12)" style="flex: 1; margin-top: 0;" value="${esc(prevReps)}" inputmode="numeric">
      </div>

      <div id="exCardioFields" class="mt-8" style="display: ${state.editingIsCardio ? 'block' : 'none'};">
        <input type="number" id="exDuration" placeholder="Tempo em minutos (ex: 15)" style="margin-top: 0;" value="${esc(prevDur)}" inputmode="numeric">
      </div>

      <div class="row">${state.draft ? `<img src="${state.draft}" style="width:64px;height:64px;border-radius:12px;object-fit:contain;background:var(--bg);margin-top:12px" alt="">` : ''}<button class="btn btn-secondary flex-1 mt-12 flex-row gap-8" id="np" style="justify-content: center;">${Icons.camera} ${state.draft ? "Trocar foto" : "Foto do exercício"}</button></div>`;
    
    h += `<div class="flex-row gap-12 mt-12">`;
    if (state.editingExIndex !== null) h += `<button class="btn btn-danger flex-1" id="cancel-edit">Cancelar</button>`;
    h += `<button class="btn btn-primary flex-1" id="na" style="margin:0;">${state.editingExIndex !== null ? 'Salvar Alterações' : 'Adicionar'}</button>`;
    h += `</div></div></div>`;
  }

  safeRender("configContent", h);
  hydrate();
}

export function renderAllSubsScreen(filter = "all") {
  $("allSubsScreen").classList.add("on");
  $("allSubsScreen").style.display = "flex";
  
  const userSubs = [];
  LT().forEach(l => {
    (state.P.ex[l] || []).forEach((ex, exIndex) => {
      if (ex.substitutes) {
        ex.substitutes.forEach((sub, subIndex) => {
           if (!userSubs.find(s => s.name === sub.name)) {
               userSubs.push({ ...sub, baseName: ex.name, letter: l, exIndex: exIndex, subIndex: subIndex });
           }
        });
      }
    });
  });

  if (state.P.exImages) {
      Object.keys(state.P.exImages).forEach(name => {
          if (!userSubs.find(s => s.name === name)) {
              userSubs.push({ name: name, f: state.P.exImages[name], baseName: "Banco de Imagens", letter: null, exIndex: null, subIndex: null });
          }
      });
  }

  const matchFilter = (text) => {
    const n = text.toLowerCase();
    if (filter === "all") return true;
    if (filter === "Peito") return n.includes("supino") || n.includes("peito") || n.includes("crucifixo") || n.includes("crossover");
    if (filter === "Costas") return n.includes("remada") || n.includes("puxada") || n.includes("pulldown");
    if (filter === "Perna") return n.includes("agachamento") || n.includes("leg") || n.includes("stiff") || n.includes("panturrilha") || n.includes("flexora") || n.includes("extensora");
    if (filter === "Braço") return n.includes("rosca") || n.includes("tríceps") || n.includes("bíceps");
    if (filter === "Ombro") return n.includes("desenvolvimento") || n.includes("elevação") || n.includes("ombro");
    return true;
  };

  document.querySelectorAll('[data-filter-subs]').forEach(btn => {
    btn.classList.toggle("on", btn.dataset.filterSubs === filter);
  });

  let h = "";

  FAMILIAS.forEach(familia => {
    if (!matchFilter(familia.musculo) && !matchFilter(familia.membros[0].nome)) return;

    h += `<h3 style="font-size:12px; color:var(--water); text-transform:uppercase; margin-top:10px; letter-spacing:1px;">${esc(familia.musculo)}</h3>`;
    
    familia.membros.forEach(membro => {
      const jaAdicionado = userSubs.some(s => s.name === membro.nome);
      h += `
        <div class="sub-list-item" style="${jaAdicionado ? 'opacity:0.6;' : ''}">
          <div class="ph">${Icons.dumbbellLarge}</div>
          <div class="info">
            <b>${esc(membro.nome)}</b>
            <small>${esc(membro.obs)}</small>
          </div>
          ${jaAdicionado ? `<span style="color:var(--success);">${Icons.checkCircle}</span>` : ''}
        </div>
      `;
    });
  });

  if (userSubs.length > 0) {
    h += `<h3 style="font-size:12px; color:var(--success); text-transform:uppercase; margin-top:20px; letter-spacing:1px;">Meus Substitutos Salvos</h3>`;
    userSubs.forEach(sub => {
      let img = (sub.f && state.cache[sub.f]) ? `<img src="${state.cache[sub.f]}" alt="">` : `<div class="ph">${Icons.dumbbell}</div>`;
      h += `
        <div class="sub-list-item" style="border-color: var(--success);">
          <div class="ph" style="background: transparent;">${img}</div>
          <div class="info">
            <b>${esc(sub.name)}</b>
            <small>${sub.baseName !== "Banco de Imagens" ? 'Substituto de: ' + esc(sub.baseName) : 'Salvo no Banco (Sem vínculo)'}</small>
          </div>
        </div>
      `;
    });
  }

  safeRender("allSubsContent", h);
}

export function renderSubstitutesScreen() {
  if (!state.inSubstitutesMode) { $("substitutesScreen").classList.remove("on"); return; }
  $("substitutesScreen").classList.add("on");
  
  const baseEx = state.P.ex[state.letter][state.subsTargetIndex];
  if (!baseEx) return;

  $("subsTitle").textContent = "Substitutos";
  $("subsBaseExName").textContent = `Para: ${baseEx.name}`;

  let h = "";
  const dicSubs = getSubstitutosPara(baseEx.name);
  
  if (dicSubs.principais && dicSubs.principais.length > 0) {
    h += `<h3 style="font-size:12px; color:var(--mu); text-transform:uppercase; margin-top:10px; letter-spacing:1px;">Substitutos Diretos</h3>`;
    dicSubs.principais.forEach((sub) => {
      const jaAdicionado = (baseEx.substitutes || []).some(s => s.name === sub.name);
      h += `
        <div class="sub-card dict-suggestion">
          <div class="ph">${Icons.dumbbellLarge}</div>
          <div class="sub-card-info">
            <b>${esc(sub.name)}</b>
            <small>${esc(sub.obs)}</small>
          </div>
          ${jaAdicionado ? `<span style="color:var(--success);">${Icons.checkCircle}</span>` : ''}
        </div>
      `;
    });
  }

  if (dicSubs.secundarios && dicSubs.secundarios.length > 0) {
    h += `<h3 style="font-size:12px; color:var(--mu); text-transform:uppercase; margin-top:20px; letter-spacing:1px;">Variações Complementares</h3>`;
    dicSubs.secundarios.forEach((sub) => {
      const jaAdicionado = (baseEx.substitutes || []).some(s => s.name === sub.name);
      h += `
        <div class="sub-card dict-suggestion" style="border-color: var(--water);">
          <div class="ph">${Icons.dumbbell}</div>
          <div class="sub-card-info">
            <b>${esc(sub.name)}</b>
            <small>${esc(sub.obs)}</small>
          </div>
          ${jaAdicionado ? `<span style="color:var(--success);">${Icons.checkCircle}</span>` : ''}
        </div>
      `;
    });
  }

  const customSubs = baseEx.substitutes || [];
  if (customSubs.length > 0) {
    h += `<h3 style="font-size:12px; color:var(--mu); text-transform:uppercase; margin-top:20px; letter-spacing:1px;">Meus Substitutos</h3>`;
    customSubs.forEach((sub, i) => {
      let img = (sub.f && state.cache[sub.f]) ? `<img src="${state.cache[sub.f]}" alt="">` : `<div class="ph">${Icons.dumbbell}</div>`;
      h += `
        <div class="sub-card">
          ${img}
          <div class="sub-card-info">
            <b>${esc(sub.name)}</b>
            <small>${esc(sub.sets || "")}</small>
          </div>
        </div>
      `;
    });
  }

  if ((!dicSubs.principais || dicSubs.principais.length === 0) && (!dicSubs.secundarios || dicSubs.secundarios.length === 0) && customSubs.length === 0) {
    h += `<div class="empty">Nenhum substituto cadastrado ou encontrado.</div>`;
  }

  safeRender("subsContent", h);
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