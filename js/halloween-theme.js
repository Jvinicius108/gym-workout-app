/* ============================================================
   🎃 HALLOWEEN THEME — halloween-theme.js
   Transformação completa da UI (Fundo, Botões, Fontes, Cards, Ícones)
   ============================================================ */

const HW_CFG = {
    title: '.app-title, .month-header',
    carousel: '#strip, .strip',
    cards: '.d',
    bats: 7,
    ghosts: 3
};

const hwRand = (a, b) => a + Math.random() * (b - a);
const hwClamp = (v, a, b) => Math.min(b, Math.max(a, v));
const hwSmooth = t => t * t * (3 - 2 * t);

function hwInjectStyles() {
    if (document.getElementById('halloween-style')) return;
    
    // Fontes Temáticas: Creepster (Títulos) e Mali (Corpo/Texto)
    if (!document.getElementById('halloween-font')) {
        const link = document.createElement('link');
        link.id = 'halloween-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Creepster&family=Mali:wght@400;600;700&display=swap';
        document.head.appendChild(link);
    }
    
    const style = document.createElement('style');
    style.id = 'halloween-style';
    style.textContent = `
    /* ==========================================
       1. VARIÁVEIS GLOBAIS DO TEMA (Sobrescreve o App Todo)
       ========================================== */
    body.theme-halloween {
        --bg: #11070f;             /* Fundo principal super escuro (quase preto) */
        --card: #1f101a;           /* Card levemente arroxeado */
        --tx: #f2e3d5;             /* Texto cor de osso */
        --mu: #a87a98;             /* Texto secundário arroxeado */
        --bd: #3a1c32;             /* Bordas escuras */
        --ac: #ff7b00;             /* Laranja Abóbora */
        --acx: #ffffff;
        --water: #a855f7;          /* Poção Roxa (Água) */
        --glass-bg: rgba(31, 16, 26, 0.85);
        --glass-border: rgba(255, 123, 0, 0.2);
        
        font-family: 'Mali', sans-serif !important;
    }

    /* Força o tema escuro mesmo se o usuário estiver no modo claro */
    body.theme-halloween #app, 
    body.theme-halloween #app-body,
    body.theme-halloween header {
        background-color: var(--bg) !important;
    }

    /* ==========================================
       2. TIPOGRAFIA E TÍTULOS
       ========================================== */
    body.theme-halloween .app-title, 
    body.theme-halloween .month-header {
        font-family: 'Creepster', cursive !important; font-weight: 400 !important;
        letter-spacing: 0.09em; background: linear-gradient(180deg, #ffd27a 0%, #ff7a00 42%, #c42500 78%, #6e0f00 100%);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
        -webkit-text-stroke: 1px rgba(35, 0, 0, 0.7);
        filter: drop-shadow(0 0 8px rgba(255, 106, 0, 0.75)) drop-shadow(0 3px 0 rgba(0, 0, 0, 0.65));
        animation: hw-glow 3.4s ease-in-out infinite, hw-flicker 8s linear infinite;
    }

    @keyframes hw-glow { 0%, 100% { filter: drop-shadow(0 0 6px rgba(255,106,0,0.65)) drop-shadow(0 3px 0 rgba(0,0,0,0.65)); } 50% { filter: drop-shadow(0 0 18px rgba(255,140,0,0.95)) drop-shadow(0 3px 0 rgba(0,0,0,0.65)); } }
    @keyframes hw-flicker { 0%, 17%, 22%, 25%, 54%, 58%, 100% { opacity: 1; } 19%, 23.5%, 55.5% { opacity: 0.45; } }

    /* Títulos Gerais (Painéis, Modais, Drawer) */
    body.theme-halloween h1, 
    body.theme-halloween h2, 
    body.theme-halloween h3, 
    body.theme-halloween .panel h2,
    body.theme-halloween .modal h2,
    body.theme-halloween .menu-name,
    body.theme-halloween .evo-header h2 {
        font-family: 'Creepster', cursive !important;
        font-weight: 400 !important;
        color: var(--ac) !important;
        letter-spacing: 1.5px;
        text-shadow: 0 0 10px rgba(255, 123, 0, 0.4);
    }

    /* ==========================================
       3. BOTÕES E INTERAÇÕES
       ========================================== */
    body.theme-halloween .btn {
        font-family: 'Creepster', cursive !important;
        letter-spacing: 1px;
        font-size: 1.15rem !important;
        border-radius: 8px !important; /* Bordas menos arredondadas */
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    body.theme-halloween .btn-primary {
        background: linear-gradient(135deg, #6a0dad 0%, #ff7b00 100%) !important;
        border-color: #ff7b00 !important;
        box-shadow: 0 0 15px rgba(255, 123, 0, 0.5) !important;
        color: #fff !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    body.theme-halloween .btn-primary:active {
        transform: scale(0.95) !important;
        box-shadow: 0 0 25px rgba(255, 123, 0, 0.8) !important;
    }

    body.theme-halloween .btn-secondary {
        background: #2a0a0a !important;
        border: 2px dashed #6a0dad !important;
        color: #ff7b00 !important;
    }

    body.theme-halloween .btn-danger {
        background: #4a0000 !important;
        border: 2px solid #ff0000 !important;
        color: #ff9999 !important;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
    }

    /* Chips / Categorias */
    body.theme-halloween .chip {
        font-family: 'Creepster', cursive !important;
        font-size: 1.1rem !important;
        letter-spacing: 1px;
        border: 2px solid #6a0dad !important;
        background: #1a0b16 !important;
        color: #ff7b00 !important;
        border-radius: 4px !important;
    }
    body.theme-halloween .chip.on {
        background: #6a0dad !important;
        color: #fff !important;
        border-color: #ff7b00 !important;
        box-shadow: 0 0 10px #ff7b00 !important;
    }

    /* ==========================================
       4. CARDS, PAINÉIS E CALENDÁRIO
       ========================================== */
    /* Painel principal */
    body.theme-halloween .panel {
        border: 2px solid #3a1c32 !important;
        background: var(--card) !important;
        box-shadow: 0 0 25px rgba(106, 13, 173, 0.15) !important;
    }

    /* Calendário (Dias) */
    body.theme-halloween .d {
        background: #160810 !important;
        border: 2px dashed #3a1c32 !important;
        border-radius: 8px !important;
    }
    body.theme-halloween .d.sel {
        background: #ff7b00 !important;
        border: 2px solid #ff7b00 !important;
        box-shadow: 0 0 20px #ff7b00 !important;
    }
    body.theme-halloween .d.sel small, 
    body.theme-halloween .d.sel b, 
    body.theme-halloween .d.sel .label-txt {
        color: #11070f !important;
        font-weight: 800;
    }
    body.theme-halloween .d b {
        font-family: 'Creepster', cursive !important;
        font-size: 2rem !important;
    }
    body.theme-halloween .btn-start-inline {
        background: #11070f !important;
        color: #ff7b00 !important;
        border: 1px solid #ff7b00 !important;
    }

    /* Cards de treino e listas */
    body.theme-halloween .exs.vertical .ex, 
    body.theme-halloween .config-section,
    body.theme-halloween .sub-list-item,
    body.theme-halloween .workout-choice-card {
        border: 2px solid #3a1c32 !important;
        background: var(--card) !important;
        box-shadow: inset 0 0 15px rgba(106, 13, 173, 0.1) !important;
        border-radius: 12px !important;
    }

    /* ==========================================
       5. MENU LATERAL (DRAWER) E MODAIS
       ========================================== */
    body.theme-halloween .drawer {
        background: #11070f !important;
        border-right: 2px solid #3a1c32;
        box-shadow: 10px 0 30px rgba(0,0,0,0.8) !important;
    }
    body.theme-halloween .menu-username {
        color: #a87a98 !important;
        font-family: 'Mali', sans-serif !important;
    }
    body.theme-halloween .btn-menu {
        background: #1f101a !important;
        border: 1px solid #3a1c32 !important;
        color: #f2e3d5 !important;
    }
    body.theme-halloween .btn-menu:active {
        background: #3a1c32 !important;
    }

    /* Modais */
    body.theme-halloween .modal {
        background: #1a0b16 !important;
        border: 2px dashed #6a0dad !important;
        box-shadow: 0 0 40px rgba(106, 13, 173, 0.4) !important;
    }

    /* Inputs (Campos de digitação) */
    body.theme-halloween input[type=text], 
    body.theme-halloween input[type=password], 
    body.theme-halloween input[type=number], 
    body.theme-halloween select {
        background: #0a0508 !important;
        border: 1px solid #3a1c32 !important;
        color: #ff7b00 !important;
        font-family: 'Mali', sans-serif !important;
        font-weight: 600;
        border-radius: 8px !important;
    }
    body.theme-halloween input:focus {
        border-color: #ff7b00 !important;
        box-shadow: 0 0 10px rgba(255, 123, 0, 0.5) !important;
    }

    /* ==========================================
       6. ÍCONES E WIDGET DE ÁGUA (Poção)
       ========================================== */
    /* Deixa os ícones coloridos com brilho laranja/roxo */
    body.theme-halloween .ic,
    body.theme-halloween .ic-menu {
        border-color: #6a0dad !important;
        background: #1a0b16 !important;
        color: #ff7b00 !important;
        box-shadow: 0 0 10px rgba(106, 13, 173, 0.3);
    }
    body.theme-halloween .ic-menu span {
        background-color: #ff7b00 !important;
    }
    
    body.theme-halloween svg {
        filter: drop-shadow(0 0 2px rgba(255, 123, 0, 0.5));
    }

    /* Caldeirão de Poção (Antigo Copo de Água) */
    body.theme-halloween .water-glass {
        border: 4px solid #a855f7 !important;
        box-shadow: 0 0 25px rgba(168, 85, 247, 0.6) !important;
        background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%) !important;
    }
    body.theme-halloween .btn-water {
        background: #a855f7 !important;
        font-family: 'Creepster', cursive !important;
        font-size: 1.1rem !important;
        border: 1px solid #d8b4fe;
        box-shadow: 0 0 15px rgba(168, 85, 247, 0.5) !important;
    }

    /* Hierarquia de camadas (mantendo a correção anterior) */
    .ov, #ov { z-index: 60 !important; }
    .drawer, #dr { z-index: 70 !important; }

        /* ==========================================
       7. TELA DE LOGIN (Já existente, refinada)
       ========================================== */
    body.theme-halloween #auth { background: radial-gradient(circle at center, #2a0a0a 0%, #0a0a0c 100%) !important; }
    
    body.theme-halloween .auth {
        background: rgba(15, 5, 5, 0.95); 
        border: 2px dashed #ff7b00; 
        border-radius: 0px !important;
        box-shadow: 0 0 40px rgba(255, 123, 0, 0.3), inset 0 0 60px rgba(0,0,0,0.9); 
        padding: 40px 30px;
        /* ✅ NOVA ANIMAÇÃO DE PULSO */
        animation: authPulse 3s infinite alternate ease-in-out;
    }

    @keyframes authPulse {
        0% { 
            box-shadow: 0 0 30px rgba(255, 136, 0, 0.81), inset 0 0 60px rgba(0,0,0,0.9); 
            border-color: #ff7b00; 
        }
        100% { 
            box-shadow: 0 0 50px rgba(17, 0, 255, 0.6), inset 0 0 60px rgba(0,0,0,0.9); 
            border-color: #6a0dad; 
        }
    }

    body.theme-halloween .auth h1 { 
        font-size: 3rem !important; 
        margin-bottom: 15px; 
        text-align: center; 
        color: #ff7b00;
        /* ✅ NOVA ANIMAÇÃO DE PISCAR */
        animation: flicker 4s infinite alternate;
    }

    @keyframes flicker {
        0%, 18%, 22%, 25%, 53%, 57%, 100% { 
            text-shadow: 0 0 15px #ff0000, 0 0 25px #ff0000; 
            opacity: 1; 
        }
        20%, 24%, 55% { 
            text-shadow: none; 
            opacity: 0.5; 
        }
    }

    body.theme-halloween .auth p { 
        color: #a38888 !important; 
        font-style: italic; 
        text-align: center; 
        font-family: 'Mali', sans-serif !important;
    }

    /* ✅ NOVO BRILHO VERDE TÓXICO AO CLICAR NO INPUT */
    body.theme-halloween .auth input:focus { 
        border-color: #ff9900 !important; 
        color: #ff9900 !important;
    }

    body.theme-halloween .auth button[type="submit"] {
        background: linear-gradient(90deg, #6a0dad, #ff7b00) !important; 
        border: none !important; 
        color: #fff !important;
        border-radius: 0px !important; 
        font-size: 1.8rem !important; 
        letter-spacing: 2px;
        box-shadow: 0 0 20px rgba(255, 123, 0, 0.6); 
        margin-top: 15px;
    }
    `;
    document.head.appendChild(style);
}

let hwAuthObserver;
function hwCustomizeLogin() {
    const authEl = document.getElementById('auth');
    if (!authEl || authEl.hidden) return;
    if (hwAuthObserver) hwAuthObserver.disconnect();

    const h1 = authEl.querySelector('h1'); const p = authEl.querySelector('p');
    const inputUser = authEl.querySelector('#au'); const inputPass = authEl.querySelector('#ap');
    const submitBtn = authEl.querySelector('#ago');
    if (h1) h1.innerHTML = 'Portal Assombrado';
    if (p) p.innerHTML = 'Entre se tiver coragem...';
    if (inputUser) inputUser.placeholder = 'Nome do Fantasma...';
    if (inputPass) inputPass.placeholder = 'Senha Assustadora...';
    if (submitBtn) submitBtn.innerHTML = 'Invocar Treino 🎃';

    if (hwAuthObserver) hwAuthObserver.observe(authEl, { childList: true, subtree: true });
}

function initHalloweenTheme(snowContainer) {
    if (window.__halloweenStop) window.__halloweenStop();
    hwInjectStyles();
    if (snowContainer) snowContainer.innerHTML = '';
    
    hwAuthObserver = new MutationObserver(() => hwCustomizeLogin());
    const authEl = document.getElementById('auth');
    if (authEl) hwAuthObserver.observe(authEl, { childList: true, subtree: true });
    hwCustomizeLogin();

    // ✅ CAMADA DE FUNDO (z-index: 5 - Dentro do #app)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'halloween-bg-canvas';
    bgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;';
    
    const appEl = document.getElementById('app');
    if (appEl) {
        appEl.insertBefore(bgCanvas, appEl.firstChild);
    } else {
        document.body.appendChild(bgCanvas);
    }
    const bgCtx = bgCanvas.getContext('2d');

    // ✅ CAMADA SUPERIOR (z-index: 99999 - Morcegos, Fantasmas e Teias do Menu)
    const fgCanvas = document.createElement('canvas');
    fgCanvas.id = 'halloween-fg-canvas';
    fgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
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
    // ==========================================
    // MORCEGOS E FANTASMAS (Desenhados na camada superior fgCtx)
    // ==========================================
    function drawWing(ctx, s, sp, lag) {
        const S = [0.24 * s, -0.3 * s], E = [0.95 * s * sp, -0.6 * s], Wr = [1.55 * s * sp, -1.0 * s];
        const tips = [[3.4 * s * sp, -0.3 * s + lag],[3.0 * s * sp, 0.7 * s + lag * 0.8],[2.35 * s * sp, 1.4 * s + lag * 0.6],[1.55 * s * sp, 1.8 * s + lag * 0.4]];
        const B = [0.3 * s, 1.1 * s];
        ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(Wr[0], Wr[1]); ctx.lineTo(tips[0][0], tips[0][1]);
        let prev = tips[0];
        for (let i = 1; i < 4; i++) {
            const q = tips[i], mx = (prev[0] + q[0]) / 2, my = (prev[1] + q[1]) / 2;
            ctx.quadraticCurveTo(mx + (Wr[0] - mx) * 0.3, my + (Wr[1] - my) * 0.3, q[0], q[1]); prev = q;
        }
        const mx = (prev[0] + B[0]) / 2, my = (prev[1] + B[1]) / 2;
        ctx.quadraticCurveTo(mx + (Wr[0] - mx) * 0.2, my + (Wr[1] - my) * 0.2, B[0], B[1]);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.save(); ctx.strokeStyle = 'rgba(52, 36, 72, 0.95)'; ctx.lineWidth = Math.max(0.6, s * 0.06); ctx.lineCap = 'round';
        ctx.beginPath(); tips.forEach(t => { ctx.moveTo(Wr[0], Wr[1]); ctx.lineTo(t[0], t[1]); }); ctx.stroke();
        ctx.lineWidth = s * 0.13; ctx.strokeStyle = '#0a0610';
        ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(Wr[0], Wr[1]); ctx.stroke();
        ctx.restore();
    }

    class Bat {
        constructor() { this.respawn(true); }
        respawn(initial) {
            this.s = hwRand(7, 15); this.speed = hwRand(70, 130) * (this.s / 11);
            this.life = hwRand(18, 34); this.leaving = false; this.phase = hwRand(0, 6.28);
            this.rate = hwRand(13, 18); this.wander = hwRand(0, 100);
            if (initial) { this.x = hwRand(0, W); this.y = hwRand(0, H * 0.75); this.heading = hwRand(0, Math.PI * 2); }
            else {
                const r = Math.random();
                if (r < 0.4) { this.x = -120; this.y = hwRand(0, H * 0.7); }
                else if (r < 0.8) { this.x = W + 120; this.y = hwRand(0, H * 0.7); }
                else { this.x = hwRand(0, W); this.y = -120; }
                this.heading = Math.atan2(hwRand(H * 0.2, H * 0.7) - this.y, hwRand(W * 0.2, W * 0.8) - this.x);
            }
        }
        update(dt, t) {
            this.life -= dt;
            if (this.life <= 0 && !this.leaving) { this.leaving = true; this.heading = Math.atan2(this.y - H / 2, this.x - W / 2); }
            if (!this.leaving) {
                const turn = Math.sin(t * 0.0011 + this.wander) * 0.8 + Math.sin(t * 0.0027 + this.wander * 1.7) * 0.6;
                this.heading += turn * dt;
                if (this.x < -40 || this.x > W + 40 || this.y < -40 || this.y > H * 0.9) {
                    const want = Math.atan2(H * 0.4 - this.y, W / 2 - this.x);
                    const diff = Math.atan2(Math.sin(want - this.heading), Math.cos(want - this.heading));
                    this.heading += hwClamp(diff, -1, 1) * 2.5 * dt;
                }
            } else if (this.x < -220 || this.x > W + 220 || this.y < -220 || this.y > H + 220) { this.respawn(false); return; }
            this.x += Math.cos(this.heading) * this.speed * dt; this.y += Math.sin(this.heading) * this.speed * dt; this.phase += this.rate * dt;
        }
        draw(t) {
            const s = this.s, amp = hwClamp(0.55 + 0.7 * Math.sin(t * 0.0006 + this.wander * 3), 0.2, 1), flap = Math.sin(this.phase) * amp;
            const sp = 1 - 0.30 * (0.5 + 0.5 * flap), lag = Math.cos(this.phase) * 0.35 * amp * s;
            fgCtx.save(); fgCtx.translate(this.x, this.y); fgCtx.rotate(this.heading + Math.PI / 2 + Math.sin(this.phase * 0.5) * 0.04); fgCtx.translate(0, flap * s * 0.08);
            fgCtx.fillStyle = '#07040b'; fgCtx.strokeStyle = 'rgba(160, 110, 230, 0.3)'; fgCtx.lineWidth = 0.7; fgCtx.lineJoin = 'round';
            for (const d of [1, -1]) { fgCtx.save(); fgCtx.scale(d, 1); drawWing(fgCtx, s, sp, lag); fgCtx.restore(); }
            fgCtx.beginPath(); fgCtx.moveTo(-0.3 * s, 0.85 * s); fgCtx.lineTo(0.3 * s, 0.85 * s); fgCtx.lineTo(0.2 * s, 1.5 * s); fgCtx.lineTo(-0.2 * s, 1.5 * s); fgCtx.closePath(); fgCtx.fill();
            fgCtx.beginPath(); fgCtx.ellipse(0, 0.1 * s, 0.32 * s, 0.85 * s, 0, 0, Math.PI * 2); fgCtx.fill();
            fgCtx.beginPath(); fgCtx.arc(0, -0.88 * s, 0.3 * s, 0, Math.PI * 2); fgCtx.fill();
            for (const d of [1, -1]) { fgCtx.beginPath(); fgCtx.moveTo(d * 0.08 * s, -1.0 * s); fgCtx.lineTo(d * 0.34 * s, -1.65 * s); fgCtx.lineTo(d * 0.3 * s, -0.88 * s); fgCtx.closePath(); fgCtx.fill(); }
            fgCtx.fillStyle = '#ff3b30'; fgCtx.shadowColor = '#ff2a1a'; fgCtx.shadowBlur = 4;
            for (const d of [1, -1]) { fgCtx.beginPath(); fgCtx.arc(d * 0.11 * s, -0.93 * s, Math.max(0.5, 0.045 * s), 0, Math.PI * 2); fgCtx.fill(); }
            fgCtx.restore();
        }
    }

    class Ghost {
        constructor() { this.reset(true); }
        reset(initial) {
            this.w = hwRand(46, 78); this.h = this.w * hwRand(1.5, 1.9);
            this.x = hwRand(this.w, Math.max(this.w + 1, W - this.w)); this.y = hwRand(H * 0.2, H * 0.85);
            this.vx = hwRand(-12, 12); this.vy = hwRand(-14, -4); this.age = 0;
            this.fadeIn = hwRand(1.6, 2.6); this.hold = hwRand(3, 7); this.fadeOut = hwRand(1.6, 2.6);
            this.wait = initial ? hwRand(0, 6) : hwRand(1, 5); this.phase = hwRand(0, 100); this.maxAlpha = hwRand(0.35, 0.6);
        }
        envelope() {
            const t = this.age;
            if (t < this.fadeIn) return hwSmooth(t / this.fadeIn);
            if (t < this.fadeIn + this.hold) return 1;
            const f = (t - this.fadeIn - this.hold) / this.fadeOut;
            return f >= 1 ? 0 : 1 - hwSmooth(f);
        }
        update(dt) {
            if (this.wait > 0) { this.wait -= dt; return; }
            this.age += dt; this.x += (this.vx + Math.sin(this.age * 0.9 + this.phase) * 14) * dt; this.y += this.vy * dt;
            if (this.age > this.fadeIn + this.hold + this.fadeOut) this.reset(false);
        }
        draw(time) {
            if (this.wait > 0) return;
            const env = this.envelope(), a = env * this.maxAlpha * (0.88 + 0.12 * Math.sin(time * 0.013 + this.phase));
            if (a < 0.01) return;
            const t = time * 0.001, w = this.w, h = this.h, N = 26;
            const sway = Math.sin(t * 0.8 + this.phase) * 0.18;
            const halfW = yn => yn < 0.38 ? w * 0.5 * Math.sqrt(1 - Math.pow(1 - yn / 0.38, 2)) : w * (0.5 + 0.17 * (yn - 0.38) / 0.62);
            const off = yn => sway * w * yn * yn * 1.2 + Math.sin(t * 2 + yn * 5 + this.phase) * w * 0.05 * yn;
            const topY = -h * 0.5, botY = topY + h * 0.92;
            const left = [], right = [];
            for (let i = 0; i <= N; i++) {
                const yn = i / N, y = topY + yn * h * 0.92;
                left.push([-halfW(yn) + off(yn), y]); right.push([halfW(yn) + off(yn), y]);
            }
            const body = new Path2D(); body.moveTo(left[0][0], left[0][1]);
            right.forEach(p => body.lineTo(p[0], p[1]));
            const xr = right[N][0], xl = left[N][0], M = 16;
            for (let k = 0; k <= M; k++) {
                const u = k / M;
                const yb = botY + Math.sin(u * Math.PI * 5 + t * 3 + this.phase) * h * 0.045 + Math.sin(u * Math.PI * 9 - t * 2) * h * 0.02 + Math.pow(Math.abs(Math.sin(u * Math.PI * 3)), 1.5) * h * 0.1;
                body.lineTo(xr + (xl - xr) * u, yb);
            }
            for (let i = N; i >= 0; i--) body.lineTo(left[i][0], left[i][1]);
            body.closePath();
            fgCtx.save(); fgCtx.translate(this.x, this.y); fgCtx.rotate(sway * 0.3);
            const sc = 0.88 + 0.12 * env; fgCtx.scale(sc, sc); fgCtx.globalAlpha = a;
            const g = fgCtx.createLinearGradient(0, topY, 0, botY + h * 0.12);
            g.addColorStop(0, 'rgba(245, 253, 255, 0.98)'); g.addColorStop(0.55, 'rgba(205, 232, 248, 0.75)'); g.addColorStop(1, 'rgba(170, 210, 235, 0)');
            fgCtx.shadowColor = 'rgba(140, 220, 255, 0.9)'; fgCtx.shadowBlur = 28; fgCtx.fillStyle = g; fgCtx.fill(body); fgCtx.shadowBlur = 0;
            const rg = fgCtx.createRadialGradient(0, topY + h * 0.2, 2, 0, topY + h * 0.25, w * 0.7);
            rg.addColorStop(0, 'rgba(255, 255, 255, 0.55)'); rg.addColorStop(1, 'rgba(255, 255, 255, 0)');
            fgCtx.fillStyle = rg; fgCtx.fill(body);
            const shY = topY + 0.42 * h * 0.92, wave = Math.sin(t * 2.2 + this.phase) * h * 0.04;
            for (const d of [1, -1]) {
                const sx = d * halfW(0.42) * 0.9 + off(0.42);
                const arm = () => { fgCtx.beginPath(); fgCtx.moveTo(sx, shY); fgCtx.bezierCurveTo(d * w * 0.9, shY + h * 0.02 + wave, d * w * 1.1, shY + h * 0.2 + wave, d * w * 0.85, shY + h * 0.34 - wave); fgCtx.stroke(); };
                fgCtx.lineCap = 'round'; fgCtx.strokeStyle = 'rgba(190, 228, 250, 0.35)'; fgCtx.lineWidth = w * 0.15; arm();
                fgCtx.strokeStyle = 'rgba(235, 248, 255, 0.6)'; fgCtx.lineWidth = w * 0.07; arm();
            }
            const eyeY = topY + 0.22 * h * 0.92, ox = off(0.22);
            for (const d of [1, -1]) {
                const ex = d * w * 0.18 + ox;
                const eg = fgCtx.createRadialGradient(ex, eyeY, 0, ex, eyeY, w * 0.12);
                eg.addColorStop(0, 'rgba(5, 12, 25, 0.95)'); eg.addColorStop(1, 'rgba(5, 12, 25, 0)');
                fgCtx.fillStyle = eg; fgCtx.beginPath(); fgCtx.ellipse(ex, eyeY, w * 0.085, w * 0.13, d * 0.15, 0, Math.PI * 2); fgCtx.fill();
            }
            const mouthY = topY + 0.38 * h * 0.92, mry = w * (0.09 + 0.045 * Math.sin(t * 1.3 + this.phase));
            const mg = fgCtx.createRadialGradient(off(0.38), mouthY, 0, off(0.38), mouthY, mry * 1.4);
            mg.addColorStop(0, 'rgba(5, 12, 25, 0.9)'); mg.addColorStop(1, 'rgba(5, 12, 25, 0)');
            fgCtx.fillStyle = mg; fgCtx.beginPath(); fgCtx.ellipse(off(0.38), mouthY, w * 0.08, mry, 0, 0, Math.PI * 2); fgCtx.fill();
            fgCtx.restore();
        }
    }

    // ==========================================
    // TEIAS E ARANHAS DOS CONTAINERS (bgCtx)
    // ==========================================
    function makeWeb() {
        const nS = 6 + Math.floor(Math.random() * 2), rings = 6 + Math.floor(Math.random() * 3);
        const angles = [], spokeLen = [];
        for (let i = 0; i < nS; i++) {
            const edge = i === 0 || i === nS - 1;
            angles.push((i / (nS - 1)) * Math.PI / 2 + (edge ? 0 : hwRand(-0.07, 0.07)));
            spokeLen.push(hwRand(0.97, 1.04));
        }
        const radii = [], skip = [], drops = [];
        for (let k = 1; k <= rings; k++) {
            const base = Math.pow(k / rings, 0.85);
            radii.push(angles.map(() => base * (1 + hwRand(-0.04, 0.04))));
            skip.push(angles.map(() => Math.random() < 0.09));
            for (let s = 0; s < nS; s++) if (Math.random() < 0.12) drops.push({ k: k - 1, s, r: hwRand(0.9, 1.7) });
        }
        return { nS, rings, angles, spokeLen, radii, skip, drops };
    }

    function drawWeb(ctx, cx, cy, c, R, web, t) {
        const P = (k, s) => {
            const r = web.radii[k][s], wind = Math.sin(t * 0.0012 + k * 0.6 + s) * 0.7 * r;
            return [cx + c * Math.cos(web.angles[s]) * r * R + wind * c, cy + Math.sin(web.angles[s]) * r * R + wind];
        };
        const spokes = new Path2D(), rings = new Path2D();
        for (let s = 0; s < web.nS; s++) {
            spokes.moveTo(cx, cy);
            spokes.lineTo(cx + c * Math.cos(web.angles[s]) * R * web.spokeLen[s], cy + Math.sin(web.angles[s]) * R * web.spokeLen[s]);
        }
        for (let k = 0; k < web.rings; k++) {
            for (let s = 0; s < web.nS - 1; s++) {
                if (web.skip[k][s]) continue;
                const A = P(k, s), B = P(k, s + 1), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
                rings.moveTo(A[0], A[1]);
                rings.quadraticCurveTo(mx + (cx - mx) * 0.18, my + (cy - my) * 0.18, B[0], B[1]);
            }
        }
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'; ctx.lineWidth = 2.2; ctx.stroke(spokes); ctx.stroke(rings);
        ctx.strokeStyle = 'rgba(238, 243, 250, 0.6)'; ctx.lineWidth = 0.95; ctx.stroke(spokes);
        ctx.strokeStyle = 'rgba(238, 243, 250, 0.5)'; ctx.lineWidth = 0.7; ctx.stroke(rings);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (const d of web.drops) { const p = P(d.k, d.s); ctx.beginPath(); ctx.arc(p[0], p[1], d.r, 0, Math.PI * 2); ctx.fill(); }
    }

    function drawSpiderBody(ctx, s, t, phase) {
        const g = ctx.createRadialGradient(-0.2 * s, 0.5 * s, 0.1 * s, 0, 0.8 * s, 0.95 * s);
        g.addColorStop(0, '#4a4a55'); g.addColorStop(0.5, '#0d0d11'); g.addColorStop(1, '#000');
        const a1 = [-1.0, -0.45, 0.1, 0.7], L1 = [1.3, 1.6, 1.7, 1.5], L2 = [1.5, 1.8, 1.9, 1.6];
        ctx.strokeStyle = '#08080a'; ctx.lineWidth = Math.max(0.8, 0.15 * s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const d of [1, -1]) {
            ctx.save(); ctx.scale(d, 1);
            for (let j = 0; j < 4; j++) {
                const wig = 0.14 * Math.sin(t * 3 + j * 0.9 + phase);
                const bx = 0.25 * s, by = (1.8 + (j - 1.5) * 0.17) * s;
                const th1 = a1[j] + wig, th2 = th1 + 1.25 + wig * 0.6;
                const kx = bx + Math.cos(th1) * L1[j] * s, ky = by + Math.sin(th1) * L1[j] * s;
                const fx = kx + Math.cos(th2) * L2[j] * s, fy = ky + Math.sin(th2) * L2[j] * s;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
            }
            ctx.restore();
        }
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0.8 * s, 0.58 * s, 0.8 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(200, 15, 20, 0.9)';
        ctx.beginPath(); ctx.moveTo(-0.16 * s, 0.75 * s); ctx.lineTo(0.16 * s, 0.75 * s); ctx.lineTo(0, 1.05 * s); ctx.closePath();
        ctx.moveTo(-0.16 * s, 1.35 * s); ctx.lineTo(0.16 * s, 1.35 * s); ctx.lineTo(0, 1.05 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#0a0a0d'; ctx.beginPath(); ctx.ellipse(0, 1.95 * s, 0.38 * s, 0.42 * s, 0, 0, Math.PI * 2); ctx.fill();
        
        ctx.shadowColor = '#ff0000'; ctx.shadowBlur = Math.max(4, 2.5 * s);
        ctx.fillStyle = '#ff1a1a';
        for (const d of [1, -1]) {
            ctx.beginPath(); ctx.arc(d * 0.16 * s, 2.08 * s, Math.max(1.2, 0.11 * s), 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(d * 0.16 * s, 2.08 * s, Math.max(0.5, 0.05 * s), 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff1a1a';
        }
        for (const d of [1, -1]) { ctx.beginPath(); ctx.arc(d * 0.26 * s, 1.98 * s, Math.max(0.8, 0.06 * s), 0, Math.PI * 2); ctx.fill(); }
        ctx.shadowBlur = 0;
    }

    function drawHangingSpider(ctx, sp, ax, ay, maxLen, t) {
        const tt = t / 1000;
        const u = ((tt / sp.period) + sp.offset) % 1;
        let k;
        if (u < 0.42) k = hwSmooth(u / 0.42);
        else if (u < 0.58) k = 1;
        else if (u < 0.94) k = 1 - hwSmooth((u - 0.58) / 0.36);
        else k = 0;
        const minLen = sp.s * 1.5;
        const len = minLen + Math.max(0, maxLen - minLen - sp.s * 2.4) * k + Math.sin(tt * 3 + sp.phase) * 0.8 * k;
        const ang = Math.sin(tt * 1.1 + sp.phase) * 0.035;
        const x = ax + Math.sin(ang) * len, y = ay + Math.cos(ang) * len;
        ctx.strokeStyle = 'rgba(235, 240, 245, 0.55)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(x, y); ctx.stroke();
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang * 0.8); drawSpiderBody(ctx, sp.s, tt, sp.phase); ctx.restore();
    }

    let carousel = null, targets = [];
    const decors = new Map();

    function scan() {
        carousel = document.querySelector(HW_CFG.carousel);
        let cards = [...document.querySelectorAll(HW_CFG.cards)];
        if (carousel) cards = cards.filter(c => carousel.contains(c) && c !== carousel);
        if (!cards.length && carousel) cards = [...carousel.children].filter(e => e.offsetWidth > 40);
        const list = [];
        
        // ✅ REMOVIDO: A linha abaixo adicionava a barra do carrossel como alvo das teias
        // if (carousel) list.push({ el: carousel, isBar: true, key: 'carousel-bar' });
        
        cards.forEach((el, i) => {
            const key = el.dataset.k || ('card-' + i);
            list.push({ el, isBar: false, key });
        });
        list.forEach(tg => {
            const r = parseFloat(getComputedStyle(tg.el).borderTopLeftRadius) || 0;
            tg.radius = r;
        });
        targets = list;
    }

    function makeSpider(isBar) {
        return { s: isBar ? hwRand(7, 9) : hwRand(4.2, 6.2), period: hwRand(16, 26), offset: Math.random(), phase: hwRand(0, 6.28) };
    }

    function getDecor(tg) {
        let d = decors.get(tg.key);
        if (!d) {
            const cs = tg.isBar ? [1, -1] : [tg.key.charCodeAt(tg.key.length - 1) % 2 ? -1 : 1];
            d = { corners: cs.map(c => ({ c, web: makeWeb(), spider: (tg.isBar || Math.random() < 0.7) ? makeSpider(tg.isBar) : null })) };
            decors.set(tg.key, d);
        }
        return d;
    }

    function clipTo(ctx, carRect, r, radius) {
        if (carRect) { ctx.beginPath(); ctx.rect(carRect.left, carRect.top, carRect.width, carRect.height); ctx.clip(); }
        ctx.beginPath();
        if (ctx.roundRect && radius > 0) ctx.roundRect(r.left, r.top, r.width, r.height, radius);
        else ctx.rect(r.left, r.top, r.width, r.height);
        ctx.clip();
    }

    function drawDecorations(t) {
        const carRect = carousel ? carousel.getBoundingClientRect() : null;
        for (const tg of targets) {
            const r = tg.el.getBoundingClientRect();
            if (r.width < 30 || r.height < 20 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
            const d = getDecor(tg);
            const R = tg.isBar ? hwClamp(Math.min(r.width * 0.25, r.height * 1.2), 40, 130) : hwClamp(Math.min(r.width * 0.42, r.height * 0.55), 24, 80);
            const maxLen = tg.isBar ? hwClamp(r.height * 0.6, 40, 130) : hwClamp(r.height * 0.55, 30, 110);
            for (const co of d.corners) {
                const cx = co.c === 1 ? r.left : r.right;
                bgCtx.save(); clipTo(bgCtx, carRect, r, tg.radius); drawWeb(bgCtx, cx, r.top, co.c, R, co.web, t); bgCtx.restore();
                if (co.spider) {
                    bgCtx.save();
                    if (carRect) { bgCtx.beginPath(); bgCtx.rect(carRect.left, 0, carRect.width, H); bgCtx.clip(); }
                    drawHangingSpider(bgCtx, co.spider, cx + co.c * R * 0.6, r.top, maxLen, t);
                    bgCtx.restore();
                }
            }
        }
    }

    // ==========================================
    // TEIAS DO MENU (Deslizam junto com o .drawer)
    // ==========================================
    const menuWebs = {
        topLeft: makeWeb(),
        topRight: makeWeb(),
        bottomRight: makeWeb(),
        spider: makeSpider(true)
    };

    function drawMenuDecorations(ctx, t) {
        const drawerEl = document.querySelector('.drawer') || document.getElementById('dr');
        if (!drawerEl) return;
        const r = drawerEl.getBoundingClientRect();
        if (r.width < 10 || r.right <= 0) return;

        const R = hwClamp(Math.min(r.width * 0.35, r.height * 0.15), 40, 110);
        const maxLen = hwClamp(r.height * 0.5, 40, 120);

        ctx.save();
        ctx.beginPath();
        ctx.rect(r.left, r.top, r.width, r.height);
        ctx.clip();

        // Teias nos cantos do menu acompanhando o movimento
        drawWeb(ctx, r.left, r.top, 1, R, menuWebs.topLeft, t);
        drawWeb(ctx, r.right, r.top, -1, R, menuWebs.topRight, t);
        drawWeb(ctx, r.right, r.bottom, -1, R, menuWebs.bottomRight, t);

        // Aranha pendurada na borda direita do menu
        drawHangingSpider(ctx, menuWebs.spider, r.right - R * 0.4, r.top, maxLen, t);

        ctx.restore();
    }

    // ==========================================
    // LOOP PRINCIPAL
    // ==========================================
    const bats = Array.from({ length: HW_CFG.bats }, () => new Bat());
    const ghosts = Array.from({ length: HW_CFG.ghosts }, () => new Ghost());
    let raf = 0, last = performance.now();
    
    let scanTimeout;
    const observer = new MutationObserver(() => { clearTimeout(scanTimeout); scanTimeout = setTimeout(scan, 30); });
    observer.observe(document.body, { childList: true, subtree: true });

    function stop() {
        cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
        if(hwAuthObserver) hwAuthObserver.disconnect();
        observer.disconnect();
        bgCanvas.remove(); fgCanvas.remove(); window.__halloweenStop = null;
    }
    window.__halloweenStop = stop;

    function frame(now) {
        if (!document.body.classList.contains('theme-halloween')) { stop(); return; }
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        
        // 1. CAMADA DE FUNDO (Apenas teias e aranhas dos containers)
        bgCtx.clearRect(0, 0, W, H);
        drawDecorations(now);

        // 2. CAMADA SUPERIOR (Morcegos, Fantasmas e Teias do Menu)
        fgCtx.clearRect(0, 0, W, H);
        ghosts.forEach(g => { g.update(dt); g.draw(now); });
        bats.forEach(b => { b.update(dt, now); b.draw(now); });
        drawMenuDecorations(fgCtx, now);

        raf = requestAnimationFrame(frame);
    }
    scan();
    raf = requestAnimationFrame(frame);
}