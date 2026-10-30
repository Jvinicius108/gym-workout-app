/* ============================================================
   🎅 CHRISTMAS THEME — christmas-theme.js
   TUDO em Canvas (Neve, Chapéu, Trenó, Renas, Presentes e POP-UP)
   UI Global Transformada (Cores, Fontes, Botões)
   ============================================================ */

const XMAS_CFG = {
    title: '.app-title, .month-header',
    carousel: '#strip, .strip',
    cards: '.d',
    flakes: 100
};

const xmasRand = (a, b) => a + Math.random() * (b - a);
const xmasClamp = (v, a, b) => Math.min(b, Math.max(a, v));

function xmasInjectStyles() {
    if (document.getElementById('xmas-style')) return;
    if (!document.getElementById('xmas-font')) {
        const link = document.createElement('link');
        link.id = 'xmas-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&family=Nunito:wght@600;800&display=swap';
        document.head.appendChild(link);
    }
    const style = document.createElement('style');
    style.id = 'xmas-style';
    style.textContent = `
    /* ==========================================
       1. VARIÁVEIS GLOBAIS DO TEMA NATAL
       ========================================== */
    body.theme-christmas {
        --bg: #0a1c12;
        --card: #122a1b;
        --tx: #fdfbf7;
        --mu: #a3c9b6;
        --bd: #1e4d2b;
        --ac: #d32f2f;
        --acx: #ffffff;
        --water: #e53935;
        --glass-bg: rgba(18, 42, 27, 0.85);
        --glass-border: rgba(212, 175, 55, 0.2);
        --ac-gradient: linear-gradient(135deg, #b30000 0%, #ff0000 100%);
        
        font-family: 'Nunito', sans-serif !important;
    }

    body.theme-christmas #app, 
    body.theme-christmas #app-body,
    body.theme-christmas header {
        background-color: var(--bg) !important;
    }

    .santa-hat { display: none !important; }

    /* ==========================================
       2. TIPOGRAFIA E TÍTULOS
       ========================================== */
    body.theme-christmas .app-title, 
    body.theme-christmas .month-header {
        font-family: 'Mountains of Christmas', cursive !important; 
        font-weight: 700 !important; letter-spacing: 2px; color: #fff;
        text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 2px 2px 0px #006400;
        animation: xmas-pulse 3s infinite alternate;
    }
    @keyframes xmas-pulse {
        0% { text-shadow: 0 0 8px #ff0000, 0 0 15px #ff0000, 2px 2px 0px #006400; }
        100% { text-shadow: 0 0 15px #ff0000, 0 0 30px #ff0000, 2px 2px 0px #006400; }
    }

    body.theme-christmas h1, 
    body.theme-christmas h2, 
    body.theme-christmas h3, 
    body.theme-christmas .panel h2,
    body.theme-christmas .modal h2,
    body.theme-christmas .menu-name,
    body.theme-christmas .evo-header h2 {
        font-family: 'Mountains of Christmas', cursive !important;
        font-weight: 700 !important;
        color: #d4af37 !important;
        letter-spacing: 1.5px;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
    }

    /* ==========================================
       3. BOTÕES E INTERAÇÕES
       ========================================== */
    body.theme-christmas .btn {
        font-family: 'Nunito', sans-serif !important;
        font-weight: 800 !important;
        letter-spacing: 0.5px;
        font-size: 1rem !important;
        border-radius: 50px !important;
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    body.theme-christmas .btn-primary {
        background: linear-gradient(90deg, #b30000, #ff0000, #b30000) !important;
        border-color: #d4af37 !important;
        box-shadow: 0 5px 20px rgba(255, 0, 0, 0.4) !important;
        color: #fff !important;
    }
    body.theme-christmas .btn-primary:active {
        transform: scale(0.95) !important;
        box-shadow: 0 0 25px rgba(255, 0, 0, 0.7) !important;
    }

    body.theme-christmas .btn-secondary {
        background: #2a1a1a !important;
        border: 2px solid #d4af37 !important;
        color: #d4af37 !important;
    }

    body.theme-christmas .btn-danger {
        background: #4a0000 !important;
        border: 2px solid #ff0000 !important;
        color: #ff9999 !important;
    }

    body.theme-christmas .chip {
        font-family: 'Nunito', sans-serif !important;
        font-weight: 800 !important;
        letter-spacing: 0.5px;
        border: 2px solid #d4af37 !important;
        background: #2a1a1a !important;
        color: #d4af37 !important;
        border-radius: 20px !important;
    }
    body.theme-christmas .chip.on {
        background: #b30000 !important;
        color: #fff !important;
        border-color: #ff0000 !important;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.6) !important;
    }

    /* ==========================================
       4. CARDS, PAINÉIS E CALENDÁRIO
       ========================================== */
    body.theme-christmas .panel {
        border: 2px solid #1e4d2b !important;
        background: var(--card) !important;
        box-shadow: 0 0 25px rgba(0, 100, 0, 0.2) !important;
    }

    body.theme-christmas .d {
        background: #122a1b !important;
        border: 2px solid #1e4d2b !important;
        border-radius: 12px !important;
        overflow: visible !important;
    }
    body.theme-christmas .d.sel {
        background: #d32f2f !important;
        border: 2px solid #d4af37 !important;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.6) !important;
    }
    body.theme-christmas .d.sel small, 
    body.theme-christmas .d.sel b, 
    body.theme-christmas .d.sel .label-txt {
        color: #fff !important;
        font-weight: 800;
    }
    body.theme-christmas .d b {
        font-family: 'Mountains of Christmas', cursive !important;
        font-size: 2rem !important;
    }
    body.theme-christmas .btn-start-inline {
        background: #fff !important;
        color: #d32f2f !important;
        border: 1px solid #d32f2f !important;
    }

    body.theme-christmas .exs.vertical .ex, 
    body.theme-christmas .config-section,
    body.theme-christmas .sub-list-item,
    body.theme-christmas .workout-choice-card {
        border: 2px solid #1e4d2b !important;
        background: var(--card) !important;
        box-shadow: inset 0 0 15px rgba(0, 100, 0, 0.1) !important;
        border-radius: 12px !important;
    }

    /* ==========================================
       5. MENU LATERAL E MODAIS
       ========================================== */
    body.theme-christmas .drawer {
        background: #0a1c12 !important;
        border-right: 2px solid #1e4d2b;
        box-shadow: 10px 0 30px rgba(0,0,0,0.8) !important;
    }
    body.theme-christmas .menu-username { color: #a3c9b6 !important; font-family: 'Nunito', sans-serif !important; }
    body.theme-christmas .btn-menu { background: #122a1b !important; border: 1px solid #1e4d2b !important; color: #fdfbf7 !important; }
    body.theme-christmas .btn-menu:active { background: #1e4d2b !important; }

    body.theme-christmas .modal {
        background: #122a1b !important;
        border: 2px solid #d4af37 !important;
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.3) !important;
    }

    body.theme-christmas input[type=text], 
    body.theme-christmas input[type=password], 
    body.theme-christmas input[type=number], 
    body.theme-christmas select {
        background: #0a1c12 !important;
        border: 1px solid #1e4d2b !important;
        color: #fff !important;
        font-family: 'Nunito', sans-serif !important;
        font-weight: 600;
        border-radius: 12px !important;
    }
    body.theme-christmas input:focus { border-color: #d4af37 !important; box-shadow: 0 0 10px rgba(212, 175, 55, 0.5) !important; }

    /* ==========================================
       6. ÍCONES E WIDGET DE ÁGUA
       ========================================== */
    body.theme-christmas .ic,
    body.theme-christmas .ic-menu { border-color: #d4af37 !important; background: #122a1b !important; color: #d4af37 !important; }
    body.theme-christmas .ic-menu span { background-color: #d4af37 !important; }
    body.theme-christmas svg { filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.5)); }

    body.theme-christmas .water-glass {
        border: 4px solid #d32f2f !important;
        box-shadow: 0 0 25px rgba(211, 47, 47, 0.6) !important;
        background: radial-gradient(circle, rgba(211, 47, 47, 0.2) 0%, transparent 70%) !important;
    }
    body.theme-christmas .btn-water { background: #d32f2f !important; font-family: 'Nunito', sans-serif !important; font-weight: 800 !important; border: 1px solid #d4af37; }

    .ov, #ov { z-index: 60 !important; }
    .drawer, #dr { z-index: 70 !important; }

    /* ==========================================
       7. TELA DE LOGIN
       ========================================== */
    body.theme-christmas #auth { background: radial-gradient(circle at top, #1a3625, #0b1d14 70%) !important; }
    body.theme-christmas .auth { background: rgba(15, 10, 10, 0.95); border: 3px solid #d4af37; border-radius: 24px; padding: 40px 30px; box-shadow: 0 0 50px rgba(255, 0, 0, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.2); }
    body.theme-christmas .auth h1 { font-size: 2.8rem !important; margin-bottom: 10px; text-align: center; }
    body.theme-christmas .auth p { color: #a3c9b6 !important; text-align: center; }
    body.theme-christmas .auth .chip { background: #2a1a1a; color: #d4af37; border: 2px solid #d4af37; border-radius: 20px; }
    body.theme-christmas .auth .chip.on { background: #b30000; color: #fff; border-color: #ff0000; box-shadow: 0 0 15px rgba(255, 0, 0, 0.6); }
    body.theme-christmas .auth button[type="submit"] { background: linear-gradient(90deg, #b30000, #ff0000, #b30000) !important; border: 2px solid #d4af37 !important; color: #fff !important; font-size: 1.6rem !important; box-shadow: 0 5px 20px rgba(255, 0, 0, 0.5); border-radius: 50px !important; padding: 15px !important; text-transform: uppercase; margin-top: 15px; }

    body.theme-christmas .btn-primary::after { 
      content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='18' height='18'><path d='M12 2L15 9H9L12 2ZM9 11L15 11L18 18H6L9 11ZM18 20H6C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20Z'/></svg>");
      display: inline-block; vertical-align: middle; margin-left: 8px;
    }
    body.theme-christmas .btn-secondary::after { 
      content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2' width='18' height='18'><path d='M12 2L15 9H9L12 2ZM9 11L15 11L18 18H6L9 11ZM18 20H6C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20Z'/></svg>");
      display: inline-block; vertical-align: middle; margin-left: 8px;
    }

    /* ==========================================
       8. POP-UP DE NATAL ANIMADO
       ========================================== */
    #xmasPopupOverlay {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(5, 9, 20, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; visibility: hidden; transition: opacity 0.5s ease, visibility 0.5s;
    }
    #xmasPopupOverlay.on { opacity: 1; visibility: visible; }
    
    #xmasPopupCard {
        background: #122a1b; border: 3px solid #d4af37; border-radius: 24px;
        width: 90%; max-width: 400px; position: relative;
        box-shadow: 0 0 60px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(0,0,0,0.5);
        display: flex; flex-direction: column; overflow: hidden;
        transform: scale(0.9); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #xmasPopupOverlay.on #xmasPopupCard { transform: scale(1); }

    #santaPopupCanvas {
        width: 100%; height: 220px; display: block; background: transparent;
        margin-top: -20px; /* Puxa o papai noel um pouco para cima */
    }

    .xmas-popup-text-area {
        padding: 0 24px 24px 24px; text-align: center; position: relative; z-index: 2;
    }

    .xmas-popup-text-area h2 {
        font-family: 'Mountains of Christmas', cursive !important;
        color: #fdfbf7 !important; font-size: 1.4rem !important; margin: 0 0 10px 0; text-shadow: none;
    }

    .xmas-popup-name {
        display: block; font-family: 'Mountains of Christmas', cursive;
        font-size: 2.8rem; color: #ff0000; line-height: 1;
        text-shadow: 0 0 15px rgba(255, 0, 0, 0.6), 2px 2px 0px #d4af37;
        margin-bottom: 24px; word-wrap: break-word;
    }

    .xmas-close-btn {
        position: absolute; top: 12px; right: 12px;
        background: rgba(0,0,0,0.4); border: 1px solid #d4af37; color: #d4af37;
        border-radius: 50%; width: 36px; height: 36px; font-size: 18px;
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        z-index: 10; transition: 0.2s;
    }
    .xmas-close-btn:active { transform: scale(0.9); background: #d4af37; color: #122a1b; }
    `;
    document.head.appendChild(style);
}

let xmasAuthObserver;
function xmasCustomizeLogin() {
    const authEl = document.getElementById('auth');
    if (!authEl || authEl.hidden) return;
    if (xmasAuthObserver) xmasAuthObserver.disconnect();

    const h1 = authEl.querySelector('h1'); const p = authEl.querySelector('p');
    const inputUser = authEl.querySelector('#au'); const inputPass = authEl.querySelector('#ap');
    const submitBtn = authEl.querySelector('#ago'); const chips = authEl.querySelectorAll('.chip');

    if (h1) h1.innerHTML = 'Oficina do Noel';
    if (p) p.innerHTML = 'Faça sua lista e venha treinar!';
    if (chips.length >= 2) { chips[0].innerHTML = 'Entrar'; chips[1].innerHTML = 'Criar Conta'; }
    if (inputUser) { inputUser.placeholder = 'Nome do Duende...'; inputUser.autocomplete = 'off'; }
    if (inputPass) inputPass.placeholder = 'Senha Secreta...';
    if (submitBtn) submitBtn.innerHTML = 'Entrar na Magia';

    if (xmasAuthObserver) xmasAuthObserver.observe(authEl, { childList: true, subtree: true });
}

// ==========================================
// ANIMAÇÃO DO PAPAI NOEL (POP-UP)
// ==========================================
let santaRaf = 0;
function startSantaAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    function drawFluffyCluster(cx, cy, count, radiusBase, scatter) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const rOffset = Math.sin(angle * 5) * scatter;
            const x = cx + Math.cos(angle) * (radiusBase * 0.6);
            const y = cy + Math.sin(angle) * (radiusBase * 0.6);
            ctx.beginPath();
            ctx.arc(x, y, radiusBase * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    function animate(time) {
        if (!canvas.offsetParent) {
            cancelAnimationFrame(santaRaf); // Para a animação se o modal for fechado
            return;
        }

        const t = time * 0.001;
        ctx.clearRect(0, 0, W, H);

        const centerX = W / 2;
        const centerY = H / 2 + 30; 
        const scale = Math.min(W / 600, H / 400) * 1.1;
        const finalScale = Math.min(Math.max(scale, 0.5), 1.3);

        const breatheY = Math.sin(t * 2) * 5;
        
        const blinkCycle = t % 4.5;
        let blinkAmt = 1.0; 
        if (blinkCycle < 0.15) blinkAmt = 0.1 + 0.9 * Math.pow(Math.cos((blinkCycle / 0.15) * Math.PI / 2), 2);
        else if (blinkCycle > 2.5 && blinkCycle < 2.6) blinkAmt = 0.1 + 0.9 * Math.pow(Math.cos(((blinkCycle - 2.5) / 0.1) * Math.PI / 2), 2);

        const speakCycle = t % 4.0;
        let speakFactor = 0; 
        if (speakCycle > 0.3 && speakCycle < 0.6) speakFactor = Math.sin(((speakCycle - 0.3) / 0.3) * Math.PI);
        else if (speakCycle > 0.8 && speakCycle < 1.1) speakFactor = Math.sin(((speakCycle - 0.8) / 0.3) * Math.PI);
        else if (speakCycle > 1.3 && speakCycle < 1.7) speakFactor = Math.sin(((speakCycle - 1.3) / 0.4) * Math.PI);
        speakFactor = Math.max(0, speakFactor);

        ctx.save();
        ctx.translate(centerX, centerY); 
        ctx.scale(finalScale, finalScale);

        // CORPO
        ctx.translate(0, breatheY);
        const suitGrad = ctx.createLinearGradient(0, 0, 0, 250);
        suitGrad.addColorStop(0, '#e62222');
        suitGrad.addColorStop(1, '#850707');
        ctx.fillStyle = suitGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(-180, 240);
        ctx.bezierCurveTo(-150, 80, -90, 70, 0, 70);
        ctx.bezierCurveTo(90, 70, 150, 80, 180, 240);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#f0f4f8';
        ctx.beginPath(); ctx.ellipse(0, 90, 140, 40, 0, 0, Math.PI * 2); ctx.fill();

        // GORRO TRASEIRO
        const hatGrad = ctx.createLinearGradient(-50, -100, 150, 50);
        hatGrad.addColorStop(0, '#ff3333'); hatGrad.addColorStop(0.5, '#cc1414'); hatGrad.addColorStop(1, '#7a0505');
        const hatSwing = Math.sin(t * 1.5 + 1) * 12; 
        ctx.fillStyle = hatGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(-75, -50);
        ctx.bezierCurveTo(-90, -200, 40, -230, 100, -140);
        ctx.bezierCurveTo(160, -70, 180 + hatSwing, 20 + hatSwing, 145 + hatSwing, 65 + hatSwing);
        ctx.bezierCurveTo(120 + hatSwing, 65 + hatSwing, 95, -30, 45, -85);
        ctx.bezierCurveTo(15, -120, 30, -50, 75, -50);
        ctx.fill(); ctx.shadowBlur = 0;
        drawFluffyCluster(145 + hatSwing, 75 + hatSwing, 22, 32, 8);

        // ORELHAS
        ctx.translate(0, -breatheY * 0.3);
        const skinGrad = ctx.createRadialGradient(0, -20, 0, 0, -20, 90);
        skinGrad.addColorStop(0, '#ffe1d4'); skinGrad.addColorStop(0.7, '#f7c3ac'); skinGrad.addColorStop(1, '#e39d7f');
        const earShadow = '#c47d60';
        
        ctx.fillStyle = skinGrad; ctx.beginPath(); ctx.ellipse(-85, -10, 18, 26, -0.2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = earShadow; ctx.beginPath(); ctx.ellipse(-87, -10, 9, 15, -0.2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = skinGrad; ctx.beginPath(); ctx.ellipse(85, -10, 18, 26, 0.2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = earShadow; ctx.beginPath(); ctx.ellipse(87, -10, 9, 15, 0.2, 0, Math.PI*2); ctx.fill();

        // ROSTO
        ctx.fillStyle = skinGrad;
        ctx.beginPath(); ctx.ellipse(0, -20, 78, 85, 0, 0, Math.PI * 2); ctx.fill();

        const cheekGradL = ctx.createRadialGradient(-45, 5, 0, -45, 5, 22);
        cheekGradL.addColorStop(0, 'rgba(255, 100, 100, 0.5)'); cheekGradL.addColorStop(1, 'rgba(255, 100, 100, 0)');
        ctx.fillStyle = cheekGradL; ctx.beginPath(); ctx.arc(-45, 5, 22, 0, Math.PI*2); ctx.fill();
        const cheekGradR = ctx.createRadialGradient(45, 5, 0, 45, 5, 22);
        cheekGradR.addColorStop(0, 'rgba(255, 100, 100, 0.5)'); cheekGradR.addColorStop(1, 'rgba(255, 100, 100, 0)');
        ctx.fillStyle = cheekGradR; ctx.beginPath(); ctx.arc(45, 5, 22, 0, Math.PI*2); ctx.fill();

        // OLHOS
        const eyeY = -35;
        ctx.strokeStyle = 'rgba(196, 125, 96, 0.6)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        for (let d of [1, -1]) {
            ctx.beginPath(); ctx.moveTo(d * 55, eyeY - 5); ctx.quadraticCurveTo(d * 65, eyeY, d * 70, eyeY - 8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(d * 55, eyeY); ctx.quadraticCurveTo(d * 65, eyeY + 5, d * 70, eyeY + 2); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(-35, eyeY, 14, 18 * blinkAmt, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(35, eyeY, 14, 18 * blinkAmt, 0, 0, Math.PI*2); ctx.fill();
        
        if (blinkAmt > 0.1) {
            const pupilX = Math.sin(t * 1.5) * 2;
            ctx.fillStyle = '#0a4270';
            ctx.beginPath(); ctx.ellipse(-35 + pupilX, eyeY, 8, 11 * blinkAmt, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(35 + pupilX, eyeY, 8, 11 * blinkAmt, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(-37 + pupilX, eyeY - 4 * blinkAmt, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(33 + pupilX, eyeY - 4 * blinkAmt, 3, 0, Math.PI*2); ctx.fill();
        }

        // BARBA
        function drawBeardLayer(color, scaleY, offset) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(-75, 10 + offset);
            ctx.bezierCurveTo(-110, 50, -120, 110, -90, 150 * scaleY);
            ctx.bezierCurveTo(-60, 190 * scaleY, -30, 230 * scaleY, 0, 235 * scaleY);
            ctx.bezierCurveTo(30, 230 * scaleY, 60, 190 * scaleY, 90, 150 * scaleY);
            ctx.bezierCurveTo(120, 110, 110, 50, 75, 10 + offset);
            ctx.bezierCurveTo(40, 50 + offset, -40, 50 + offset, -75, 10 + offset);
            ctx.fill();
        }
        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(0,0,0,0.15)';
        drawBeardLayer('#c9d6e8', 1.05, 5);
        drawBeardLayer('#e8eef7', 0.95, 2);
        drawBeardLayer('#ffffff', 0.85, 0);
        ctx.shadowBlur = 0;

        // BOCA
        const mouthY = 30;
        const mouthOpen = speakFactor * 32;
        ctx.fillStyle = '#360909';
        ctx.beginPath();
        ctx.moveTo(-22, mouthY);
        ctx.quadraticCurveTo(0, mouthY + mouthOpen * 1.3, 22, mouthY);
        ctx.quadraticCurveTo(0, mouthY + mouthOpen * 0.1, -22, mouthY);
        ctx.fill();
        if (speakFactor > 0.1) {
            ctx.fillStyle = '#f06e6e';
            ctx.beginPath(); ctx.ellipse(0, mouthY + mouthOpen * 0.7, 10, mouthOpen * 0.4, 0, 0, Math.PI*2); ctx.fill();
        }

        // BIGODE
        const stacheLift = speakFactor * 5; 
        function drawMustacheSide(d) {
            ctx.save(); ctx.scale(d, 1); ctx.translate(0, 15 - stacheLift * 0.3); ctx.rotate(-speakFactor * 0.1);
            ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(30, -15, 70, -20, 100, 20);
            ctx.bezierCurveTo(110, 40, 80, 55, 65, 35);
            ctx.bezierCurveTo(45, 10, 20, 15, 0, 15);
            ctx.fill(); ctx.restore();
        }
        drawMustacheSide(-1); drawMustacheSide(1); ctx.shadowBlur = 0;

        // NARIZ
        const noseGrad = ctx.createRadialGradient(-3, 0, 0, 0, 5, 25);
        noseGrad.addColorStop(0, '#ff7a7a'); noseGrad.addColorStop(1, '#d12828');
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.fillStyle = noseGrad;
        ctx.beginPath(); ctx.ellipse(0, 5, 22, 18, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.ellipse(-6, 0, 6, 4, -0.2, 0, Math.PI*2); ctx.fill();

        // SOBRANCELHAS
        const browLift = speakFactor * -6;
        function drawEyebrow(d) {
            ctx.save(); ctx.scale(d, 1); ctx.translate(35, -60 + browLift); ctx.rotate(-speakFactor * 0.1);
            ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 5; ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.beginPath(); ctx.moveTo(-25, 5);
            ctx.bezierCurveTo(-15, -15, 15, -20, 30, 0);
            ctx.bezierCurveTo(15, -5, -10, 0, -25, 5);
            ctx.fill(); ctx.restore();
        }
        drawEyebrow(-1); drawEyebrow(1);

        // BASE FRONTAL DO GORRO
        const hatFrontGrad = ctx.createLinearGradient(0, -120, 0, -60);
        hatFrontGrad.addColorStop(0, '#ff3333'); hatFrontGrad.addColorStop(1, '#cc1414');
        ctx.fillStyle = hatFrontGrad;
        ctx.beginPath(); ctx.moveTo(-82, -60);
        ctx.bezierCurveTo(-82, -125, 82, -125, 82, -60);
        ctx.lineTo(-82, -60); ctx.fill();

        // BORDA FELPUDA
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.2)';
        for (let bx = -85; bx <= 85; bx += 12) {
            const by = -68 + Math.pow(bx / 85, 2) * 12; 
            const r = 20 + Math.sin(bx * 0.5) * 3;
            ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI*2); ctx.fill();
        }
        ctx.shadowBlur = 0;

        // ==========================================
        // BALÃO DE FALA ("HO HO HO!")
        // ==========================================
        const bubbleX = 80; // Posição X do balão (à direita do rosto)
        const bubbleY = -100; // Posição Y do balão
        const bubbleW = 150;
        const bubbleH = 60;
        const bubbleR = 15;

        // Desenha o balão (com rabinho apontando para a boca)
        ctx.beginPath();
        ctx.moveTo(bubbleX + bubbleR, bubbleY);
        ctx.lineTo(bubbleX + bubbleW - bubbleR, bubbleY);
        ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + bubbleR);
        ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - bubbleR);
        ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - bubbleR, bubbleY + bubbleH);
        // Rabinho
        ctx.lineTo(bubbleX + 40, bubbleY + bubbleH);
        ctx.lineTo(bubbleX + 15, bubbleY + bubbleH + 30); // Ponta do rabinho (aponta pra boca)
        ctx.lineTo(bubbleX + 20, bubbleY + bubbleH);
        // Continua a borda inferior
        ctx.lineTo(bubbleX + bubbleR, bubbleY + bubbleH);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - bubbleR);
        ctx.lineTo(bubbleX, bubbleY + bubbleR);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + bubbleR, bubbleY);
        ctx.closePath();

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#b30000';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        // Texto HO HO HO dentro do balão
        ctx.fillStyle = '#b30000';
        ctx.font = '900 24px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Leve animação no texto também
        const textPop = 1 + speakFactor * 0.1;
        ctx.save();
        ctx.translate(bubbleX + bubbleW/2, bubbleY + bubbleH/2);
        ctx.scale(textPop, textPop);
        ctx.fillText('HO HO HO!', 0, 0);
        ctx.restore();

        ctx.restore(); // Restaura a transformação principal

        santaRaf = requestAnimationFrame(animate);
    }
    
    santaRaf = requestAnimationFrame(animate);
}

// ==========================================
// LÓGICA DE EXIBIÇÃO DO POP-UP (COM TRAVA ANUAL)
// ==========================================
function showXmasPopup(userName) {
    const currentYear = new Date().getFullYear().toString();
    const lastShownYear = localStorage.getItem('xmas_popup_year');
    
    // ✅ TRAVA: Se o usuário já viu o pop-up neste ano, ele bloqueia a execução aqui.
    if (lastShownYear === currentYear) {
        return;
    }

    // Cria o HTML do Pop-up
    const popupHTML = `
        <div id="xmasPopupOverlay">
            <div id="xmasPopupCard">
                <button class="xmas-close-btn" id="closeXmasPopup">✕</button>
                <canvas id="santaPopupCanvas"></canvas>
                <div class="xmas-popup-text-area">
                    <h2>A GYM WORKOUT TE DESEJA UM FELIZ NATAL</h2>
                    <span class="xmas-popup-name">${userName}</span>
                    <button class="btn btn-primary" id="btnXmasOk" style="margin-top: 10px;">FELIZ NATAL!</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Mostra o pop-up
    setTimeout(() => {
        document.getElementById('xmasPopupOverlay').classList.add('on');
        startSantaAnimation('santaPopupCanvas');
        
        // ✅ SALVA A TRAVA: Grava o ano atual no navegador do usuário
        localStorage.setItem('xmas_popup_year', currentYear); 
    }, 1000);

    // Funções para fechar o pop-up
    const closePopup = () => {
        const overlay = document.getElementById('xmasPopupOverlay');
        overlay.classList.remove('on');
        setTimeout(() => {
            overlay.remove(); 
            cancelAnimationFrame(santaRaf); // Para a animação para economizar bateria
        }, 500);
    };

    document.getElementById('closeXmasPopup').addEventListener('click', closePopup);
    document.getElementById('btnXmasOk').addEventListener('click', closePopup);
}


function initChristmasTheme(snowContainer, userName) {
    if (window.__xmasStop) window.__xmasStop();
    xmasInjectStyles();
    if (snowContainer) snowContainer.innerHTML = '';
    
    xmasAuthObserver = new MutationObserver(() => xmasCustomizeLogin());
    const authEl = document.getElementById('auth');
    if (authEl) xmasAuthObserver.observe(authEl, { childList: true, subtree: true });
    xmasCustomizeLogin();

    // ✅ DISPARA O POP-UP A PARTIR DO DIA 25 DE DEZEMBRO
    const today = new Date();
    if (today.getMonth() === 11 && today.getDate() >= 24 && userName) {
        showXmasPopup(userName);
    }

    // CAMADAS DE CANVAS (Fundo e Frente do App)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'xmas-bg-canvas';
    bgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;';
    const appEl = document.getElementById('app');
    if (appEl) appEl.insertBefore(bgCanvas, appEl.firstChild);
    else document.body.appendChild(bgCanvas);
    const bgCtx = bgCanvas.getContext('2d');

    const fgCanvas = document.createElement('canvas');
    fgCanvas.id = 'xmas-fg-canvas';
    fgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(fgCanvas);
    const fgCtx = fgCanvas.getContext('2d');

    let W = 0, H = 0;
    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        bgCanvas.width = W * dpr; bgCanvas.height = H * dpr; bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fgCanvas.width = W * dpr; fgCanvas.height = H * dpr; fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);

    // [PARTÍCULAS DE CLIQUE]
    class XmasParticle {
        constructor(x, y, type) {
            this.x = x; this.y = y; this.type = type;
            this.size = xmasRand(6, 12); this.vx = xmasRand(-8, 8); this.vy = xmasRand(-16, -6);
            this.gravity = 0.5; this.friction = 0.98; this.rotation = xmasRand(0, Math.PI * 2); this.vr = xmasRand(-0.2, 0.2); this.life = 1;
            if (type === 'candy') {
                this.color1 = ['#ff0000', '#00ff00', '#ffffff', '#ffb3c6'][Math.floor(Math.random()*4)];
                this.color2 = this.color1 === '#ffffff' ? '#ff0000' : '#ffffff';
            } else {
                this.color1 = ['#b30000', '#006400', '#00008b', '#d4af37'][Math.floor(Math.random()*4)];
                this.color2 = '#ffffff';
            }
        }
        update() {
            this.vx *= this.friction; this.vy += this.gravity; this.x += this.vx; this.y += this.vy;
            this.rotation += this.vr; this.life -= 0.015;
            if (this.y > H - this.size) { this.y = H - this.size; this.vy *= -0.5; this.vx *= 0.8; this.vr *= 0.8; }
        }
        draw() {
            if (this.life <= 0) return;
            fgCtx.save(); fgCtx.translate(this.x, this.y); fgCtx.rotate(this.rotation);
            fgCtx.globalAlpha = this.life; const s = this.size;
            if (this.type === 'candy') {
                fgCtx.fillStyle = this.color2;
                fgCtx.beginPath(); fgCtx.moveTo(-s/2, 0); fgCtx.lineTo(-s, -s/2); fgCtx.lineTo(-s, s/2); fgCtx.closePath(); fgCtx.fill();
                fgCtx.beginPath(); fgCtx.moveTo(s/2, 0); fgCtx.lineTo(s, -s/2); fgCtx.lineTo(s, s/2); fgCtx.closePath(); fgCtx.fill();
                fgCtx.fillStyle = this.color1;
                fgCtx.beginPath(); fgCtx.ellipse(0, 0, s * 0.7, s * 0.5, 0, 0, Math.PI * 2); fgCtx.fill();
                fgCtx.strokeStyle = 'rgba(255,255,255,0.5)'; fgCtx.lineWidth = 1; fgCtx.stroke();
            } else {
                fgCtx.fillStyle = this.color1;
                fgCtx.fillRect(-s/2, -s/2, s, s);
                fgCtx.strokeStyle = 'rgba(0,0,0,0.3)'; fgCtx.strokeRect(-s/2, -s/2, s, s);
                fgCtx.fillStyle = this.color2;
                fgCtx.fillRect(-s/6, -s/2, s/3, s); fgCtx.fillRect(-s/2, -s/6, s, s/3);
                fgCtx.beginPath(); fgCtx.arc(-s/4, -s/2, s/4, 0, Math.PI * 2); fgCtx.arc(s/4, -s/2, s/4, 0, Math.PI * 2); fgCtx.fill();
            }
            fgCtx.restore();
        }
    }

    const particles = [];
    const clickHandler = (e) => {
        // Não gera partículas se o clique for no popup
        if (e.target.closest('#xmasPopupOverlay')) return;
        
        const isInteractive = e.target.closest('button, a, input, select, textarea, .chip, .d, .wcard, .btn, .sub-list-item');
        if (isInteractive) {
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            if (x !== undefined && y !== undefined) {
                for (let i = 0; i < 15; i++) {
                    particles.push(new XmasParticle(x, y, Math.random() > 0.5 ? 'candy' : 'gift'));
                }
            }
        }
    };
    document.addEventListener('click', clickHandler);

    // [NEVE]
    class Snowflake {
        constructor() { this.reset(true); }
        reset(initial) {
            this.baseScale = xmasRand(0.4, 1.2); this.size = 20 * this.baseScale; 
            this.x = Math.random() * W; this.y = initial ? Math.random() * H : -30;
            this.speedY = xmasRand(0.8, 2.5) * this.baseScale; this.angle = Math.random() * Math.PI; 
            this.spin = xmasRand(-0.01, 0.01) * this.baseScale;
            this.wobble = Math.random() * Math.PI * 2; this.wobbleSpeed = xmasRand(0.01, 0.03);
            this.wobbleAmp = xmasRand(0.5, 2.0) * this.baseScale; this.opacity = xmasRand(0.3, 0.8);
        }
        update() {
            this.y += this.speedY; this.angle += this.spin; this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * this.wobbleAmp;
            if (this.y > H + 30) this.reset(false);
        }
        draw() {
            fgCtx.save(); fgCtx.translate(this.x, this.y); fgCtx.rotate(this.angle);
            fgCtx.globalAlpha = this.opacity; fgCtx.strokeStyle = '#fff';
            fgCtx.lineWidth = Math.max(1, this.size * 0.05); fgCtx.lineCap = 'round';
            fgCtx.beginPath();
            for (let i = 0; i < 6; i++) {
                fgCtx.rotate(Math.PI / 3);
                fgCtx.moveTo(0, 0); fgCtx.lineTo(0, -this.size);
                fgCtx.moveTo(0, -this.size * 0.4); fgCtx.lineTo(-this.size * 0.25, -this.size * 0.65);
                fgCtx.moveTo(0, -this.size * 0.4); fgCtx.lineTo(this.size * 0.25, -this.size * 0.65);
                fgCtx.moveTo(0, -this.size * 0.7); fgCtx.lineTo(-this.size * 0.15, -this.size * 0.85);
                fgCtx.moveTo(0, -this.size * 0.7); fgCtx.lineTo(this.size * 0.15, -this.size * 0.85);
            }
            fgCtx.stroke(); fgCtx.restore();
        }
    }

    // [PAPAI NOEL VOADOR]
    class SantaFlying {
        constructor() {
            this.speed = 2.0; this.reset();
        }
        reset() {
            this.x = W / 2; this.y = H / 2;
            this.targetX = xmasRand(100, W - 100); this.targetY = xmasRand(100, H * 0.8);
            this.angle = 0; this.stars = []; this.legPhase = 0;
        }
        update(dt) {
            let dx = this.targetX - this.x; let dy = this.targetY - this.y; let dist = Math.hypot(dx, dy);
            if (dist < 50) { this.targetX = xmasRand(100, W - 100); this.targetY = xmasRand(100, H * 0.8); }
            let targetAngle = Math.atan2(dy, dx); let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.angle += angleDiff * dt * 2;
            this.x += Math.cos(this.angle) * this.speed; this.y += Math.sin(this.angle) * this.speed; this.legPhase += dt * 12; 

            const margin = 250;
            if (this.x > W + margin) this.x = -margin; if (this.x < -margin) this.x = W + margin;
            if (this.y > H + margin) this.y = -margin; if (this.y < -margin) this.y = H + margin;

            if (Math.random() < 0.3) this.stars.push({ x: this.x - Math.cos(this.angle) * 50, y: this.y - Math.sin(this.angle) * 50, life: 1, size: xmasRand(1, 3) });
            this.stars.forEach(s => { s.life -= 0.02; }); this.stars = this.stars.filter(s => s.life > 0);
        }
        draw() {
            fgCtx.save();
            this.stars.forEach(s => { fgCtx.globalAlpha = s.life; fgCtx.fillStyle = '#ffd700'; fgCtx.beginPath(); fgCtx.arc(s.x, s.y, s.size, 0, Math.PI*2); fgCtx.fill(); });
            fgCtx.restore();

            fgCtx.save(); fgCtx.translate(this.x, this.y);
            fgCtx.rotate(this.angle); if (Math.cos(this.angle) < 0) { fgCtx.scale(1, -1); }
            const bounce = Math.sin(Date.now() * 0.01) * 3; fgCtx.translate(0, bounce);

            for (let i = 0; i < 4; i++) {
                const rx = 60 + i * 30; fgCtx.save(); fgCtx.translate(rx, 10);
                fgCtx.fillStyle = '#8b5a2b';
                fgCtx.beginPath(); fgCtx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); fgCtx.fill();
                fgCtx.beginPath(); fgCtx.moveTo(10, -5); fgCtx.lineTo(20, -18); fgCtx.lineTo(26, -14); fgCtx.lineTo(14, 0); fgCtx.fill();
                fgCtx.strokeStyle = '#5c4033'; fgCtx.lineWidth = 2;
                fgCtx.beginPath(); fgCtx.moveTo(20, -18); fgCtx.lineTo(22, -28); fgCtx.moveTo(22, -28); fgCtx.lineTo(20, -32); fgCtx.stroke();
                fgCtx.strokeStyle = '#5c4033'; fgCtx.lineWidth = 3;
                const backLeg = Math.sin(this.legPhase + i) * 10; fgCtx.beginPath(); fgCtx.moveTo(-10, 10); fgCtx.lineTo(-10 + backLeg, 22); fgCtx.stroke();
                const frontLeg = Math.sin(this.legPhase + i + Math.PI) * 10; fgCtx.beginPath(); fgCtx.moveTo(5, 10); fgCtx.lineTo(5 + frontLeg, 22); fgCtx.stroke();
                if (i === 3) { fgCtx.fillStyle = '#ff0000'; fgCtx.shadowColor = '#ff0000'; fgCtx.shadowBlur = 10; fgCtx.beginPath(); fgCtx.arc(24, -16, 3, 0, Math.PI * 2); fgCtx.fill(); fgCtx.shadowBlur = 0; }
                fgCtx.restore();
            }

            fgCtx.strokeStyle = '#5c4033'; fgCtx.lineWidth = 1; fgCtx.beginPath(); fgCtx.moveTo(50, 0); fgCtx.lineTo(60, 10); fgCtx.stroke();
            fgCtx.fillStyle = '#b30000'; fgCtx.strokeStyle = '#d4af37'; fgCtx.lineWidth = 2;
            fgCtx.beginPath(); fgCtx.moveTo(-50, 0); fgCtx.lineTo(50, 0); fgCtx.quadraticCurveTo(60, 0, 50, 20); fgCtx.lineTo(-30, 20); fgCtx.quadraticCurveTo(-50, 20, -60, -10); fgCtx.closePath();
            fgCtx.fill(); fgCtx.stroke();
            fgCtx.strokeStyle = '#d4af37'; fgCtx.lineWidth = 3;
            fgCtx.beginPath(); fgCtx.moveTo(-60, 25); fgCtx.lineTo(55, 25); fgCtx.quadraticCurveTo(65, 25, 60, 15); fgCtx.stroke();
            fgCtx.fillStyle = '#5c4033'; fgCtx.beginPath(); fgCtx.arc(-35, -15, 18, 0, Math.PI*2); fgCtx.fill(); fgCtx.stroke();
            fgCtx.fillStyle = '#ff0000'; fgCtx.beginPath(); fgCtx.arc(-10, -15, 12, 0, Math.PI*2); fgCtx.fill();
            fgCtx.fillStyle = '#fff'; fgCtx.beginPath(); fgCtx.arc(-10, -28, 6, 0, Math.PI*2); fgCtx.fill();
            fgCtx.fillStyle = '#ff0000'; fgCtx.beginPath(); fgCtx.moveTo(-15, -30); fgCtx.lineTo(-5, -30); fgCtx.lineTo(-20, -45); fgCtx.closePath(); fgCtx.fill();
            fgCtx.restore(); 
        }
    }

    // [CHAPÉUS]
    let cards = [];
    const scanCards = () => { cards = [...document.querySelectorAll('.d')]; };
    function drawHatOnCard(ctx, r, time) {
        if (r.width < 30 || r.height < 20 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return;
        const cx = r.right + 20; const cy = r.top - 4;
        const angle = Math.sin(time * 0.002) * 0.08 + 0.45;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); 
        const scale = 0.6; ctx.scale(scale, scale); ctx.translate(-50, -5);
        
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(50, 5, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(10, 40, 30, 12, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#d32f2f'; ctx.strokeStyle = '#b30000';
        ctx.beginPath(); ctx.moveTo(-15, 40);
        ctx.quadraticCurveTo(-10, -10, 50, 5); ctx.quadraticCurveTo(30, 30, 35, 45); ctx.quadraticCurveTo(10, 50, -15, 40);
        ctx.fill(); ctx.stroke();
        ctx.restore();
    }

    // LOOP PRINCIPAL
    const flakes = Array.from({ length: XMAS_CFG.flakes }, () => new Snowflake());
    const santaFlying = new SantaFlying();
    let raf = 0, last = performance.now();
    
    let scanTimeout;
    const observer = new MutationObserver(() => { clearTimeout(scanTimeout); scanTimeout = setTimeout(scanCards, 100); });
    observer.observe(document.body, { childList: true, subtree: true });

    function stop() {
        cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
        document.removeEventListener('click', clickHandler); observer.disconnect(); if(xmasAuthObserver) xmasAuthObserver.disconnect();
        bgCanvas.remove(); fgCanvas.remove(); window.__xmasStop = null;
    }
    window.__xmasStop = stop;

    function frame(now) {
        if (!document.body.classList.contains('theme-christmas')) { stop(); return; }
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        
        bgCtx.clearRect(0, 0, W, H);
        cards.forEach(card => { const r = card.getBoundingClientRect(); drawHatOnCard(bgCtx, r, now); });
        
        fgCtx.clearRect(0, 0, W, H);
        flakes.forEach(f => { f.update(); f.draw(); });
        santaFlying.update(dt); santaFlying.draw();
        
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update(); particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        raf = requestAnimationFrame(frame);
    }
    
    scanCards(); raf = requestAnimationFrame(frame);
}