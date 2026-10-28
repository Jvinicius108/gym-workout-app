import { state } from './state.js';
import { $, esc, Icons } from './utils.js';
import { db, AC } from './config.js';
import { putGlobalFoto, getGlobalFoto, hydrate, sanitizeName } from './db.js';
import { collection, getDocsFromServer, addDoc, deleteDoc, doc, updateDoc, clearIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth } from './config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getSubstitutosPara } from './substitutions.js'; 

let currentAdminBaseEx = "";
let currentAdminBaseSets = "3x12";
let currentAdminSubs = []; 
let tempNewSubPhoto = null;

export async function renderAdminScreen() {
    $("app").hidden = true;
    $("auth").hidden = true;
    $("splash").classList.add("hide");
    
    let adminScreen = document.getElementById("adminScreen");
    if (!adminScreen) {
        adminScreen = document.createElement("div");
        adminScreen.id = "adminScreen";
        adminScreen.style.cssText = "position:fixed; inset:0; background:var(--bg); z-index:200; display:flex; flex-direction:column; overflow:hidden;";
        document.body.appendChild(adminScreen);
    }
    
    adminScreen.style.display = "flex";

    try {
        await clearIndexedDbPersistence(db);
        console.log("Cache do Firestore limpo com sucesso.");
    } catch (err) {
        if (err.code === 'failed-precondition') console.warn("Múltiplas abas abertas, não foi possível limpar o cache.");
        else if (err.code === 'unimplemented') console.warn("Navegador não suporta persistência.");
    }

    let adminTheme = localStorage.getItem('gym_theme_admin');
    if (!adminTheme) {
        adminTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('gym_theme_admin', adminTheme);
    }
    document.documentElement.setAttribute('data-theme', adminTheme);
    
    let adminColor = localStorage.getItem('gym_ac_admin');
    if (!adminColor) {
        adminColor = '#ff5a36'; 
        localStorage.setItem('gym_ac_admin', adminColor);
    }
    document.documentElement.style.setProperty('--ac', adminColor);

    const isDark = adminTheme === 'dark';
    const bgColor = isDark ? '#0f1115' : '#f4f5f7';
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', bgColor);

    adminScreen.innerHTML = `
        <div class="admin-header">
            <div class="admin-header-top">
                <h2 class="admin-title">Painel Admin</h2>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary" id="adminThemeToggle" style="width:auto; margin:0; padding:8px 12px; font-size:12px;">🌓 Tema</button>
                    <button class="btn btn-secondary" id="adminColorBtn" style="width:auto; margin:0; padding:8px 12px; font-size:12px;">🎨 Cor</button>
                    <button class="btn btn-secondary" id="adminLogout" style="width:auto; margin:0; padding:8px 12px; font-size:12px;">Sair</button>
                </div>
            </div>
            
            <div id="adminTabsContainer" class="admin-tabs-container"></div>
        </div>
        
        <div id="adminContent" class="admin-content">
            <p style="text-align:center; color:var(--mu);">Carregando dados...</p>
        </div>

        <div id="adminColorPicker" style="display:none; position:fixed; top:80px; right:20px; background:var(--card); padding:15px; border-radius:16px; box-shadow:var(--shadow-lg); z-index:300; border:1px solid var(--bd);">
            <div style="display:flex; gap:12px; flex-wrap:wrap; width:260px; justify-content:center;" id="adminColorOptions"></div>
        </div>
    `;

   document.getElementById("adminLogout").onclick = () => {
        const adminScreen = document.getElementById("adminScreen");
        if (adminScreen) adminScreen.remove(); 
         signOut(auth).then(() => { window.location.href = window.location.pathname; });
    };

    document.getElementById("adminThemeToggle").onclick = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem('gym_theme_admin', newTheme);
        const newBgColor = newTheme === 'dark' ? '#0f1115' : '#f4f5f7';
        if (metaTheme) metaTheme.setAttribute('content', newBgColor);
    };

    const colorOptions = document.getElementById('adminColorOptions');
    colorOptions.innerHTML = AC.map(c => `<button class="sw" style="background:${c}; width:36px; height:36px; border-radius:50%; border:3px solid var(--card); box-shadow:0 0 0 1px var(--bd); cursor:pointer;" data-color="${c}"></button>`).join('');

    document.getElementById('adminColorBtn').onclick = (e) => {
        e.stopPropagation();
        const picker = document.getElementById('adminColorPicker');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    };

    document.body.onclick = (e) => {
        const picker = document.getElementById('adminColorPicker');
        if (picker && !picker.contains(e.target) && e.target.id !== 'adminColorBtn') {
            picker.style.display = 'none';
        }
    };

    colorOptions.querySelectorAll('.sw').forEach(btn => {
        btn.onclick = () => {
            const color = btn.dataset.color;
            document.documentElement.style.setProperty('--ac', color);
            localStorage.setItem('gym_ac_admin', color);
            document.getElementById('adminColorPicker').style.display = 'none';
        };
    });

    function renderTabs(activeTabId) {
        const container = document.getElementById("adminTabsContainer");
        const tabs = [
            { id: 'users', label: 'Usuários', action: loadUsers },
            { id: 'exs', label: 'Exercícios', action: loadExercises },
            { id: 'subs', label: 'Exercícios Substitutos', action: loadSubstitutes },
            { id: 'tickets', label: 'Chamados', action: loadTickets }
        ];
        
        let html = '';
        tabs.forEach(tab => {
            const isActive = tab.id === activeTabId;
            html += `<button class="btn admin-tab-btn ${isActive ? 'active' : ''}" data-tab="${tab.id}">${tab.label}</button>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.onclick = () => {
                const tabId = btn.dataset.tab;
                renderTabs(tabId);
                const activeTabObj = tabs.find(t => t.id === tabId);
                if (activeTabObj) activeTabObj.action();
            };
        });
    }

    renderTabs('users');
    
    if (auth.currentUser) {
        auth.currentUser.getIdToken(true).then(() => { loadUsers(); }).catch((e) => { console.error(e); loadUsers(); });
    } else { setTimeout(loadUsers, 1000); }

    const oldModal = document.getElementById('mdAdminAddSub');
    if (oldModal) oldModal.remove();

    const modalHTML = `
      <div class="modal" id="mdAdminAddSub" role="dialog" aria-modal="true" style="z-index: 300; max-height: 90vh; overflow-y: auto;">
        <h2 id="adminModalTitle">Gerenciar Substitutos</h2>
        <p id="adminModalBaseEx" style="color:var(--water); font-size:14px; margin-top:-8px; margin-bottom:12px; font-weight:bold;"></p>
        
        <div id="adminSubsList" style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px;"></div>
        
        <div id="adminAddForm" style="display:none; background:var(--bg); padding:12px; border-radius:8px; margin-bottom:15px; border: 1px dashed var(--bd);">
            <h3 style="margin:0 0 10px 0; font-size:14px; color:var(--tx);">Adicionar Novo Substituto ao Banco</h3>
            <input type="text" id="adminNewSubName" placeholder="Nome do Substituto" style="margin-bottom:8px;">
            <div style="display:flex; gap:8px;">
                <input type="text" id="adminNewSubSets" placeholder="Séries x Reps (ex: 3x12)" style="margin-bottom:8px;">
                <button class="btn btn-secondary" id="btnAdminNewPhoto" style="width:auto; margin:0; padding:0 12px;">${Icons.camera}</button>
            </div>
            <img id="adminNewSubPreview" style="display:none; max-height: 80px; margin-top: 8px; border-radius: 8px;">
            <button class="btn btn-primary mt-8" id="btnAdminAddNewConfirm" style="width:100%;">Adicionar</button>
        </div>

        <button class="btn btn-secondary" id="btnShowAddForm" style="margin-bottom:15px;">${Icons.plus} Adicionar Novo Substituto</button>
        
        <button class="btn btn-primary" id="btnAdminSaveAll" style="margin-top:10px;">SALVAR ALTERAÇÕES</button>
        <button class="btn btn-secondary mt-8" id="btnCloseAdminModal">Fechar</button>
      </div>
      <input type="file" accept="image/*" id="fiAdminSubstitute" hidden>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    $("btnCloseAdminModal").onclick = () => {
        $("ov").classList.remove("on");
        $("mdAdminAddSub").classList.remove("on");
        $("adminAddForm").style.display = "none";
        $("adminNewSubName").value = "";
        $("adminNewSubSets").value = "";
        $("adminNewSubPreview").src = "";
        $("adminNewSubPreview").style.display = "none";
        tempNewSubPhoto = null;
    };

    $("btnShowAddForm").onclick = () => {
        $("adminAddForm").style.display = "block";
        $("adminNewSubSets").value = currentAdminBaseSets; 
        $("adminNewSubPreview").src = "";
        $("adminNewSubPreview").style.display = "none";
        tempNewSubPhoto = null;
        $("adminNewSubName").value = "";
    };

    $("btnAdminNewPhoto").onclick = () => $("fiAdminSubstitute").click();
    
    $("fiAdminSubstitute").onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            tempNewSubPhoto = ev.target.result;
            $("adminNewSubPreview").src = tempNewSubPhoto;
            $("adminNewSubPreview").style.display = "block";
        };
        reader.readAsDataURL(file);
    };

    $("btnAdminAddNewConfirm").onclick = async () => {
        const name = $("adminNewSubName").value.trim();
        const sets = $("adminNewSubSets").value.trim() || currentAdminBaseSets;
        if (!name) return alert("Informe o nome.");

        let photoToSave = tempNewSubPhoto;
        let existingPhotoId = null;

        if (!photoToSave) {
            const existing = await getGlobalFoto(name);
            if (existing) existingPhotoId = 'global_' + sanitizeName(name);
            else return alert("Anexe uma foto para este substituto.");
        }

        if (currentAdminSubs.find(s => s.name.trim().toLowerCase() === name.trim().toLowerCase() && !s.isDict)) {
            return alert("Este substituto já está cadastrado no banco.");
        }

        $("btnAdminAddNewConfirm").textContent = "Salvando...";
        $("btnAdminAddNewConfirm").disabled = true;

        try {
            let globalPhotoId = existingPhotoId;
            if (photoToSave) globalPhotoId = await putGlobalFoto(name, photoToSave);

            const docRef = await addDoc(collection(db, "global_substitutes"), {
                baseExercise: currentAdminBaseEx,
                name: name,
                sets: sets,
                f: globalPhotoId,
                createdAt: Date.now()
            });

            currentAdminSubs = currentAdminSubs.filter(s => !(s.isDict && s.name.trim().toLowerCase() === name.trim().toLowerCase()));
            currentAdminSubs.push({ id: docRef.id, name, sets, f: globalPhotoId });
            
            renderAdminSubsList();
            $("adminAddForm").style.display = "none";
            $("adminNewSubName").value = "";
            $("adminNewSubPreview").style.display = "none";
            tempNewSubPhoto = null;
        } catch (e) {
            console.error(e); alert("Erro ao salvar.");
        } finally {
            $("btnAdminAddNewConfirm").textContent = "Adicionar";
            $("btnAdminAddNewConfirm").disabled = false;
        }
    };

    $("btnAdminSaveAll").onclick = async () => {
        $("btnAdminSaveAll").textContent = "Salvando...";
        $("btnAdminSaveAll").disabled = true;
        try {
            const inputs = document.querySelectorAll('.admin-set-input');
            for (const input of inputs) {
                const id = input.dataset.id;
                const newSets = input.value.trim();
                if (newSets) await updateDoc(doc(db, "global_substitutes", id), { sets: newSets });
            }
            alert("Alterações salvas!");
            $("btnCloseAdminModal").click();
            loadExercises();
        } catch (e) {
            console.error(e); alert("Erro ao salvar.");
        } finally {
            $("btnAdminSaveAll").textContent = "SALVAR ALTERAÇÕES";
            $("btnAdminSaveAll").disabled = false;
        }
    };

    function renderAdminSubsList() {
        const list = $("adminSubsList");
        if (currentAdminSubs.length === 0) {
            list.innerHTML = "<p style='color:var(--mu); font-size:14px;'>Nenhum substituto cadastrado.</p>";
            return;
        }
        let h = "";
        currentAdminSubs.forEach(sub => {
            if (sub.isDict) {
                h += `
                    <div style="display:flex; flex-direction:row; background:var(--bg); padding:10px; border-radius:8px; border:1px dashed var(--bd); align-items:center; gap:10px;">
                        <div style="flex:1;">
                            <b style="font-size:13px; color:var(--tx);">${esc(sub.name)}</b>
                            <div style="font-size:11px; color:var(--mu); display:flex; align-items:center; gap:4px;">${Icons.book} Sugerido pelo Dicionário</div>
                        </div>
                        <button class="btn btn-secondary btn-import-dict" data-name="${encodeURIComponent(sub.name)}" style="width:auto; padding:6px 10px; font-size:11px;">+ Banco</button>
                    </div>
                `;
            } else {
                let imgHtml = `<div style="width:100%; height:80px; background:var(--bg); border-radius:4px; margin-bottom:8px; display:flex; align-items:center; justify-content:center; color:var(--mu); font-size:12px;">Sem foto</div>`;
                const isValidImg = sub.f && typeof sub.f === 'string' && sub.f !== 'null' && sub.f !== 'undefined' && !sub.f.startsWith('data:');
                
                if (isValidImg) {
                    if (state.cache[sub.f]) imgHtml = `<img src="${state.cache[sub.f]}" style="width:100%; height:80px; object-fit:contain; background:var(--bg); border-radius:4px; margin-bottom:8px;">`;
                    else imgHtml = `<img data-f="${sub.f}" style="width:100%; height:80px; object-fit:contain; background:var(--bg); border-radius:4px; margin-bottom:8px;">`;
                }

                h += `
                    <div style="display:flex; flex-direction:column; background:var(--card); padding:8px; border-radius:8px; border:1px solid var(--bd); align-items:center; text-align:center;">
                        ${imgHtml}
                        <b style="font-size:12px; display:block; margin-bottom:4px; word-break:break-word; color:var(--tx);">${esc(sub.name)}</b>
                        <input type="text" class="admin-set-input" data-id="${sub.id}" value="${esc(sub.sets)}" style="padding:4px; font-size:12px; height:24px; text-align:center; width:100%; margin-bottom:4px;">
                        <button class="btn-remove-sub" data-id="${sub.id}" style="background:none; border:none; color:var(--danger); cursor:pointer; padding:4px;">${Icons.trash}</button>
                    </div>
                `;
            }
        });
        list.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">${h}</div>`;
        hydrate();

        list.querySelectorAll('.btn-remove-sub').forEach(btn => {
            btn.addEventListener('click', () => window.removeAdminSub(btn.dataset.id));
        });

        list.querySelectorAll('.btn-import-dict').forEach(btn => {
            btn.addEventListener('click', async () => {
                const name = decodeURIComponent(btn.dataset.name);
                $("adminNewSubName").value = name;
                $("adminNewSubSets").value = currentAdminBaseSets;
                
                tempNewSubPhoto = null;
                $("adminNewSubPreview").style.display = "none";
                $("adminNewSubPreview").src = "";

                const existingPhoto = await getGlobalFoto(name);
                if (existingPhoto) {
                    tempNewSubPhoto = existingPhoto;
                    $("adminNewSubPreview").src = existingPhoto;
                    $("adminNewSubPreview").style.display = "block";
                }

                $("adminAddForm").style.display = "block";
                $("adminAddForm").scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    window.removeAdminSub = async (id) => {
        if (!confirm("Remover este substituto?")) return;
        try {
            await deleteDoc(doc(db, "global_substitutes", id));
            currentAdminSubs = currentAdminSubs.filter(s => s.id !== id);
            renderAdminSubsList();
        } catch (e) { alert("Erro ao remover."); }
    };

    async function handlePermissionError(e) {
        console.error("Erro de permissão detectado. Recarregando...", e);
        alert("Sessão desatualizada. O app vai recarregar. Se o erro persistir, saia da conta e entre novamente.");
        window.location.reload();
    }

    async function loadUsers() {
        const content = document.getElementById("adminContent");
        content.innerHTML = "<p style='text-align:center; color:var(--tx);'>Buscando usuários...</p>";
        
        try {
            const snap = await getDocsFromServer(collection(db, "users"));
            let h = "<div style='display:flex; flex-direction:column; gap:10px;'>";
            snap.forEach(doc => {
                const u = doc.data();
                h += `
                    <div class="sub-list-item">
                        <div class="info">
                            <b>${esc(u.displayName || u.nome || "Sem Nome")}</b>
                            <small>ID: ${doc.id}</small>
                            <small>Treino: ${u.tipo || "Não configurado"}</small>
                        </div>
                    </div>
                `;
            });
            h += "</div>";
            content.innerHTML = h;
        } catch (e) {
            if (e.code === 'permission-denied') return handlePermissionError(e);
            content.innerHTML = "<p style='color:red;'>Erro ao buscar usuários.</p>";
            console.error(e);
        }
    }

    async function loadExercises() {
        const content = document.getElementById("adminContent");
        content.innerHTML = "<p style='text-align:center; color:var(--tx);'>Buscando exercícios...</p>";
        
        try {
            const snap = await getDocsFromServer(collection(db, "users"));
            const exerciciosMap = new Map();

            snap.forEach(doc => {
                const u = doc.data();
                if (u.ex) {
                    Object.values(u.ex).forEach(arr => {
                        arr.forEach(ex => {
                            if (!ex.name) return;
                            const key = String(ex.name).trim().toLowerCase();
                            if (!exerciciosMap.has(key)) exerciciosMap.set(key, { originalName: ex.name, sets: ex.sets || "3x12" });
                        });
                    });
                }
            });

            const gSnap = await getDocsFromServer(collection(db, "global_substitutes"));
            const globaisMap = {};
            gSnap.forEach(d => {
                const data = d.data();
                if (!data.baseExercise) return;
                const key = String(data.baseExercise).trim().toLowerCase();
                if (!globaisMap[key]) globaisMap[key] = [];
                globaisMap[key].push(data);
            });

            let h = "<p style='color:var(--mu); margin-bottom:12px;'>Clique em um exercício para gerenciar seus substitutos globais:</p>";
            h += "<div style='display:flex; flex-direction:column; gap:8px;'>";
            
            Array.from(exerciciosMap.keys()).sort().forEach(key => {
                const exData = exerciciosMap.get(key);
                const subs = globaisMap[key] || [];
                const hasSubs = subs.length > 0;
                
                const dicSubs = getSubstitutosPara(exData.originalName);
                const nDic = (dicSubs.principais ? dicSubs.principais.length : 0) + (dicSubs.secundarios ? dicSubs.secundarios.length : 0);
                
                let btnIcon = Icons.plus;
                let btnBg = 'var(--water)';
                let countText = '';
                
                if (hasSubs) {
                    btnIcon = Icons.edit;
                    btnBg = 'var(--ac)';
                    countText = `<small style="color:var(--success); font-weight:bold; display:flex; align-items:center; gap:4px;">${Icons.checkCircle} ${subs.length} substituto(s) no banco</small>`;
                } else if (nDic > 0) {
                    btnIcon = Icons.book;
                    btnBg = 'var(--mu)'; 
                    countText = `<small style="color:var(--mu); display:flex; align-items:center; gap:4px;">${Icons.book} ${nDic} no dicionário (aluno vê)</small>`;
                }
                
                h += `
                    <div class="sub-list-item admin-ex-item" data-name="${encodeURIComponent(exData.originalName)}" data-sets="${encodeURIComponent(exData.sets)}" style="cursor:pointer;">
                        <div class="info">
                            <b>${esc(exData.originalName)}</b><br>
                            ${countText}
                        </div>
                        <div class="action-btn" style="background:${btnBg}; color:#fff;">${btnIcon}</div>
                    </div>
                `;
            });
            h += "</div>";
            content.innerHTML = h;

            document.querySelectorAll('.admin-ex-item').forEach(el => {
                el.addEventListener('click', async () => {
                    currentAdminBaseEx = decodeURIComponent(el.dataset.name);
                    currentAdminBaseSets = decodeURIComponent(el.dataset.sets);
                    
                    try {
                        const qSnap = await getDocsFromServer(collection(db, "global_substitutes"));
                        currentAdminSubs = [];
                        const targetKey = String(currentAdminBaseEx).trim().toLowerCase();
                        
                        qSnap.forEach(d => {
                            const data = d.data();
                            if (data.baseExercise && String(data.baseExercise).trim().toLowerCase() === targetKey) {
                                currentAdminSubs.push({ id: d.id, ...data });
                            }
                        });

                        const dic = getSubstitutosPara(currentAdminBaseEx);
                        const allDicItems = [...(dic.principais || []), ...(dic.secundarios || [])];
                        
                        allDicItems.forEach(dictSub => {
                            if (!currentAdminSubs.find(s => s.name.trim().toLowerCase() === dictSub.name.trim().toLowerCase())) {
                                currentAdminSubs.push({ name: dictSub.name, sets: currentAdminBaseSets, isDict: true });
                            }
                        });
                        
                        $("adminModalBaseEx").textContent = "Exercício Base: " + currentAdminBaseEx;
                        renderAdminSubsList();

                        $("ov").classList.add("on");
                        $("mdAdminAddSub").classList.add("on");
                    } catch (e) {
                        if (e.code === 'permission-denied') return handlePermissionError(e);
                        console.error(e); alert("Erro ao carregar substitutos.");
                    }
                });
            });

        } catch (e) {
            if (e.code === 'permission-denied') return handlePermissionError(e);
            content.innerHTML = "<p style='color:red;'>Erro ao buscar exercícios.</p>";
            console.error(e);
        }
    }

    async function loadSubstitutes() {
        const content = document.getElementById("adminContent");
        content.innerHTML = "<p style='text-align:center; color:var(--tx);'>Buscando substitutos...</p>";
        
        try {
            const gSnap = await getDocsFromServer(collection(db, "global_substitutes"));
            const subsMap = new Map();

            gSnap.forEach(d => {
                const data = d.data();
                if (!data.name) return;
                const key = String(data.name).trim().toLowerCase();
                if (!subsMap.has(key)) subsMap.set(key, { name: data.name, bases: new Set() });
                subsMap.get(key).bases.add(data.baseExercise || "Desconhecido");
            });

            if (subsMap.size === 0) {
                content.innerHTML = "<p style='text-align:center; color:var(--mu); margin-top:20px;'>Nenhum substituto cadastrado no banco ainda.<br><br>Vá na aba 'Exercícios' e adicione um novo para começar.</p>";
                return;
            }

            let h = "<p style='color:var(--mu); margin-bottom:12px;'>Todos os substitutos cadastrados no banco:</p>";
            h += "<div style='display:flex; flex-direction:column; gap:8px;'>";
            
            Array.from(subsMap.values()).sort((a,b) => a.name.localeCompare(b.name)).forEach(sub => {
                h += `
                    <div class="sub-list-item sub-acc-item" style="flex-direction:column; align-items:flex-start; cursor:pointer;">
                        <div style="display:flex; width:100%; justify-content:space-between; align-items:center;">
                            <div class="info">
                                <b>${esc(sub.name)}</b>
                            </div>
                            <div class="sub-acc-arrow" style="color:var(--mu);">${Icons.down}</div>
                        </div>
                        <div class="sub-acc-content" style="display:none; width:100%; margin-top:10px; padding-top:10px; border-top:1px dashed var(--bd);">
                            <small style="color:var(--mu); font-weight:bold; text-transform:uppercase;">Substitui:</small>
                            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 14px;">
                                ${Array.from(sub.bases).map(b => `<li>${esc(b)}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            });
            h += "</div>";
            content.innerHTML = h;

            document.querySelectorAll('.sub-acc-item').forEach(el => {
                el.addEventListener('click', () => {
                    const contentDiv = el.querySelector('.sub-acc-content');
                    const arrow = el.querySelector('.sub-acc-arrow');
                    if (contentDiv.style.display === 'none') {
                        contentDiv.style.display = 'block';
                        arrow.innerHTML = Icons.up;
                    } else {
                        contentDiv.style.display = 'none';
                        arrow.innerHTML = Icons.down;
                    }
                });
            });

        } catch (e) {
            if (e.code === 'permission-denied') return handlePermissionError(e);
            content.innerHTML = "<p style='color:red;'>Erro ao buscar substitutos.</p>";
            console.error(e);
        }
    }

    async function loadTickets() {
        const content = document.getElementById("adminContent");
        content.innerHTML = "<p style='text-align:center; color:var(--tx);'>Buscando chamados...</p>";
        
        try {
            const snap = await getDocsFromServer(collection(db, "chamados"));
            let h = "<div style='display:flex; flex-direction:column; gap:10px;'>";
            if (snap.empty) h += "<p style='text-align:center; color:var(--mu);'>Nenhum chamado pendente.</p>";
            
            snap.forEach(docSnap => {
                const t = docSnap.data();
                h += `
                    <div class="sub-list-item" style="flex-direction:column; align-items:flex-start; border-color:var(--danger);">
                        <b>Exercício: ${esc(t.baseExercise)}</b>
                        <small>Pedido por: ${esc(t.userName)}</small>
                        <p style="margin:8px 0; font-size:14px; background:var(--bg); padding:10px; border-radius:8px; width:100%; box-sizing:border-box; color:var(--tx);">"${esc(t.message)}"</p>
                        <button class="btn btn-danger admin-resolve-btn" data-id="${docSnap.id}" style="margin-top:8px; padding:8px; width:auto; align-self:flex-end;">Concluir Chamado</button>
                    </div>
                `;
            });
            h += "</div>";
            content.innerHTML = h;

            document.querySelectorAll('.admin-resolve-btn').forEach(btn => {
                btn.addEventListener('click', () => window.resolveTicket(btn.dataset.id));
            });

        } catch (e) {
            if (e.code === 'permission-denied') return handlePermissionError(e);
            content.innerHTML = "<p style='color:red;'>Erro ao buscar chamados.</p>";
            console.error(e);
        }
    }

    window.resolveTicket = async (ticketId) => {
        if (confirm("Deseja marcar este chamado como concluído?")) {
            try {
                await deleteDoc(doc(db, "chamados", ticketId));
                loadTickets();
            } catch (e) { alert("Erro ao concluir."); }
        }
    };
}