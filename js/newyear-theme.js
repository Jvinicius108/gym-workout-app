/* ============================================================
   🥂 NEW YEAR THEME — newyear-theme.js
   Fogos, bolhas de champanhe e UI luxuosa (Preto, Dourado e Azul)
   TUDO em Canvas (Fogos de fundo, Fogos de clique, Bolhas)
   ============================================================ */

const NY_CFG = {
    title: '.app-title, .month-header',
    carousel: '#strip, .strip',
    cards: '.d',
    maxBackgroundFireworks: 6 // ✅ Aumentado de 3 para 6
};

const nyRand = (a, b) => a + Math.random() * (b - a);
const nyClamp = (v, a, b) => Math.min(b, Math.max(a, v));

function nyInjectStyles() {
    if (document.getElementById('newyear-style')) return;
    if (!document.getElementById('newyear-font')) {
        const link = document.createElement('link');
        link.id = 'newyear-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Montserrat:wght@500;700;900&display=swap';
        document.head.appendChild(link);
    }
    
    const style = document.createElement('style');
    style.id = 'newyear-style';
    style.textContent = `
    /* ==========================================
       1. VARIÁVEIS GLOBAIS DO TEMA ANO NOVO
       ========================================== */
    body.theme-newyear {
        --bg: #08080a;             /* Quase preto */
        --card: #121216;           /* Card grafite escuro */
        --tx: #fdfbf7;             /* Texto branco */
        --mu: #8a8a93;             /* Texto secundário cinza */
        --bd: #2a2a30;             /* Bordas escuras */
        --ac: #d4af37;             /* Dourado */
        --acx: #000000;
        --water: #00bfff;          /* Azul meia-noite */
        --glass-bg: rgba(18, 18, 22, 0.85);
        --glass-border: rgba(212, 175, 55, 0.3);
        --ac-gradient: linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #d4af37 100%);
        
        font-family: 'Montserrat', sans-serif !important;
    }

    body.theme-newyear #app, 
    body.theme-newyear #app-body,
    body.theme-newyear header {
        background-color: var(--bg) !important;
    }

    /* ==========================================
       2. TIPOGRAFIA E TÍTULOS
       ========================================== */
    body.theme-newyear .app-title, 
    body.theme-newyear .month-header {
        font-family: 'Playfair Display', serif !important; 
        font-style: italic; font-weight: 700 !important;
        letter-spacing: 2px;
        background: linear-gradient(180deg, #fff7d6 0%, #ffd700 40%, #d4af37 70%, #996515 100%);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
    }

    body.theme-newyear h1, 
    body.theme-newyear h2, 
    body.theme-newyear h3, 
    body.theme-newyear .panel h2,
    body.theme-newyear .modal h2,
    body.theme-newyear .menu-name,
    body.theme-newyear .evo-header h2 {
        font-family: 'Playfair Display', serif !important;
        font-style: italic;
        font-weight: 700 !important;
        color: #d4af37 !important;
        letter-spacing: 1px;
    }

    /* ==========================================
       3. BOTÕES E INTERAÇÕES
       ========================================== */
    body.theme-newyear .btn {
        font-family: 'Montserrat', sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: 1px;
        font-size: 0.95rem !important;
        border-radius: 8px !important;
        border: 1px solid transparent;
        transition: all 0.3s ease;
    }

    body.theme-newyear .btn-primary {
        background: var(--ac-gradient) !important;
        color: #000 !important;
        border-color: #f3e5ab !important;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4) !important;
    }
    body.theme-newyear .btn-primary:active {
        transform: scale(0.96) !important;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.8) !important;
    }

    body.theme-newyear .btn-secondary {
        background: #1a1a20 !important;
        border: 1px solid #d4af37 !important;
        color: #d4af37 !important;
    }

    body.theme-newyear .btn-danger {
        background: #4a0000 !important;
        border: 1px solid #ff0000 !important;
        color: #ff9999 !important;
    }

    /* Chips */
    body.theme-newyear .chip {
        font-family: 'Montserrat', sans-serif !important;
        font-weight: 700 !important;
        border: 1px solid #2a2a30 !important;
        background: #121216 !important;
        color: #d4af37 !important;
        border-radius: 8px !important;
    }
    body.theme-newyear .chip.on {
        background: #d4af37 !important;
        color: #000 !important;
        border-color: #d4af37 !important;
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.5) !important;
    }

    /* ==========================================
       4. CARDS, PAINÉIS E CALENDÁRIO
       ========================================== */
    body.theme-newyear .panel {
        border: 1px solid #2a2a30 !important;
        background: var(--card) !important;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.05) !important;
    }

    body.theme-newyear .d {
        background: #121216 !important;
        border: 1px solid #2a2a30 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
    }
    body.theme-newyear .d.sel {
        background: #d4af37 !important;
        border: 1px solid #f3e5ab !important;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.6) !important;
        overflow: visible !important;
    }
    body.theme-newyear .d.sel small, 
    body.theme-newyear .d.sel b, 
    body.theme-newyear .d.sel .label-txt {
        color: #000 !important;
        font-weight: 900;
    }
    body.theme-newyear .d b {
        font-family: 'Playfair Display', serif !important;
        font-weight: 700 !important;
        font-size: 1.8rem !important;
    }
    body.theme-newyear .btn-start-inline {
        background: #000 !important;
        color: #d4af37 !important;
        border: 1px solid #d4af37 !important;
        border-radius: 4px !important;
    }

    /* Cards de treino e listas */
    body.theme-newyear .exs.vertical .ex, 
    body.theme-newyear .config-section,
    body.theme-newyear .sub-list-item,
    body.theme-newyear .workout-choice-card {
        border: 1px solid #2a2a30 !important;
        background: var(--card) !important;
        border-radius: 8px !important;
    }

    /* ==========================================
       5. MENU LATERAL (DRAWER) E MODAIS
       ========================================== */
    body.theme-newyear .drawer {
        background: #08080a !important;
        border-right: 1px solid #2a2a30;
        box-shadow: 10px 0 40px rgba(0,0,0,0.9) !important;
    }
    body.theme-newyear .menu-username {
        color: #8a8a93 !important;
    }
    body.theme-newyear .btn-menu {
        background: #121216 !important;
        border: 1px solid #2a2a30 !important;
        color: #fdfbf7 !important;
    }
    body.theme-newyear .btn-menu:active {
        background: #1a1a20 !important;
    }

    body.theme-newyear .modal {
        background: #121216 !important;
        border: 1px solid #d4af37 !important;
        box-shadow: 0 0 50px rgba(212, 175, 55, 0.15) !important;
    }

    /* Inputs */
    body.theme-newyear input[type=text], 
    body.theme-newyear input[type=password], 
    body.theme-newyear input[type=number], 
    body.theme-newyear select {
        background: #08080a !important;
        border: 1px solid #2a2a30 !important;
        color: #d4af37 !important;
        font-family: 'Montserrat', sans-serif !important;
        font-weight: 500;
        border-radius: 8px !important;
    }
    body.theme-newyear input:focus {
        border-color: #d4af37 !important;
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.3) !important;
    }

    /* ==========================================
       6. ÍCONES E WIDGET DE ÁGUA (Champanhe)
       ========================================== */
    body.theme-newyear .ic,
    body.theme-newyear .ic-menu {
        border-color: #2a2a30 !important;
        background: #121216 !important;
        color: #d4af37 !important;
    }
    body.theme-newyear .ic-menu span {
        background-color: #d4af37 !important;
    }
    
    body.theme-newyear svg {
        filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.5));
    }

    body.theme-newyear .water-glass {
        border: 2px solid #d4af37 !important;
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.4) !important;
        background: radial-gradient(circle, rgba(0, 191, 255, 0.1) 0%, transparent 70%) !important;
    }
    body.theme-newyear .btn-water {
        background: #00bfff !important;
        color: #000 !important;
        font-weight: 800 !important;
        border: 1px solid #d4af37;
    }

    /* ==========================================
       7. TELA DE LOGIN
       ========================================== */
    body.theme-newyear #auth {
        background: radial-gradient(circle at center, #141416 0%, #050505 100%) !important;
    }
    body.theme-newyear .auth {
        background: rgba(8, 8, 10, 0.95); border: 2px solid #d4af37; border-radius: 16px;
        padding: 50px 30px; box-shadow: 0 0 50px rgba(212, 175, 55, 0.15);
    }
    body.theme-newyear .auth h1 { font-size: 3rem !important; margin-bottom: 15px; text-align: center; }
    body.theme-newyear .auth p { color: #8a8a93 !important; text-align: center; }
    body.theme-newyear .auth .chip { background: #121216; color: #d4af37; border: 1px solid #2a2a30; }
    body.theme-newyear .auth .chip.on { background: #d4af37; color: #000; border-color: #d4af37; box-shadow: 0 0 15px rgba(212, 175, 55, 0.5); }
    body.theme-newyear .auth button[type="submit"] {
        background: var(--ac-gradient) !important; 
        border: none !important; color: #000 !important; 
        font-size: 1.2rem !important; box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
        border-radius: 8px !important; padding: 18px !important; text-transform: uppercase; margin-top: 15px; font-weight: 900;
    }

    /* Ícones SVG no botão */
    body.theme-newyear .btn-primary::after { 
      content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' width='18' height='18'><path d='M8 22h8M12 11v11M5 3h14v3a7 7 0 0 1-14 0V3zM7 3v3a5 5 0 0 0 10 0V3'/></svg>");
      display: inline-block; vertical-align: middle; margin-left: 8px;
    }
    `;
    document.head.appendChild(style);
}

let nyAuthObserver;
function nyCustomizeLogin() {
    const authEl = document.getElementById('auth');
    if (!authEl || authEl.hidden) return;
    if (nyAuthObserver) nyAuthObserver.disconnect();

    const h1 = authEl.querySelector('h1'); const p = authEl.querySelector('p');
    const inputUser = authEl.querySelector('#au'); const inputPass = authEl.querySelector('#ap');
    const submitBtn = authEl.querySelector('#ago'); const chips = authEl.querySelectorAll('.chip');
    
    if (h1) h1.innerHTML = 'Reveillon Fit';
    if (p) p.innerHTML = 'Comece o ano com o pé direito!';
    if (chips.length >= 2) { chips[0].innerHTML = 'Entrar'; chips[1].innerHTML = 'Criar Conta'; }
    if (inputUser) inputUser.placeholder = 'Seu Nome...';
    if (inputPass) inputPass.placeholder = 'Sua Senha...';
    if (submitBtn) submitBtn.innerHTML = 'Celebrar';

    if (nyAuthObserver) nyAuthObserver.observe(authEl, { childList: true, subtree: true });
}

function initNewYearTheme(snowContainer) {
    if (window.__newyearStop) window.__newyearStop();
    nyInjectStyles();
    if (snowContainer) snowContainer.innerHTML = '';
    
    nyAuthObserver = new MutationObserver(() => nyCustomizeLogin());
    const authEl = document.getElementById('auth');
    if (authEl) nyAuthObserver.observe(authEl, { childList: true, subtree: true });
    nyCustomizeLogin();

    // CAMADAS DE CANVAS
    const bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'ny-bg-canvas';
    bgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;';
    const appEl = document.getElementById('app');
    if (appEl) appEl.insertBefore(bgCanvas, appEl.firstChild);
    else document.body.appendChild(bgCanvas);
    const bgCtx = bgCanvas.getContext('2d');

    const fgCanvas = document.createElement('canvas');
    fgCanvas.id = 'ny-fg-canvas';
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

    // ==========================================
    // MINI FOGOS DE ARTIFÍCIO (CLIQUE)
    // ==========================================
    class ClickParticle {
        constructor(x, y) {
            this.x = x; this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = nyRand(4, 14); // ✅ Mais velocidade e alcance
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.2; this.friction = 0.94;
            this.life = 1.0; this.decay = nyRand(0.02, 0.04);
            // ✅ Cores vibrantes e neon
            this.color = ['#ff003c', '#00f3ff', '#ffea00', '#ff00ea', '#00ff73', '#ffffff'][Math.floor(Math.random() * 6)];
        }
        update() {
            this.vx *= this.friction; this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx; this.y += this.vy;
            this.life -= this.decay;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color; ctx.shadowBlur = 8; // ✅ Brilho mais forte
            ctx.beginPath(); ctx.arc(this.x, this.y, nyRand(1.5, 3.5), 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    let clickParticles = [];
    const clickHandler = (e) => {
        const target = e.target.closest('button, a, input, select, textarea, .chip, .d, .wcard, .btn, .sub-list-item');
        if (target && !target.disabled) {
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            if (x !== undefined && y !== undefined) {
                for (let i = 0; i < 25; i++) clickParticles.push(new ClickParticle(x, y)); // ✅ Mais partículas
            }
        }
    };
    document.addEventListener('click', clickHandler);

    // ==========================================
    // FOGOS DE FUNDO (TRADICIONAIS)
    // ==========================================
    class BackgroundFirework {
        constructor() {
            this.x = nyRand(W * 0.1, W * 0.9); this.y = H;
            // ✅ Alcança desde o cabeçalho (H*0.05) até a parte de baixo (H*0.8)
            this.targetY = nyRand(H * 0.05, H * 0.8); 
            this.vy = nyRand(-10, -18); // ✅ Sobe mais rápido
            this.vx = nyRand(-1.5, 1.5);
            this.exploded = false; this.particles = []; this.trail = [];
            this.color = ['#ffd700', '#ff4500', '#ffffff', '#00bfff', '#ff003c'][Math.floor(Math.random() * 5)];
            this.hasFlash = false; this.flashAlpha = 0;
        }
        update() {
            if (!this.exploded) {
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 10) this.trail.shift();
                this.x += this.vx; this.y += this.vy; this.vy += 0.15;
                if (this.y <= this.targetY || this.vy >= 0) this.explode();
            } else {
                this.particles.forEach(p => p.update());
                this.particles = this.particles.filter(p => p.alpha > 0);
                // ✅ Atualiza o flash
                if (this.hasFlash) this.flashAlpha -= 0.05;
            }
        }
        explode() {
            this.exploded = true; const count = nyRand(50, 80);
            // ✅ 60% de chance de gerar clarão
            this.hasFlash = Math.random() > 0.4;
            if (this.hasFlash) this.flashAlpha = 1;
            
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2; const speed = nyRand(1, 6);
                this.particles.push(new BgParticle(this.x, this.y, angle, speed, this.color));
            }
        }
        draw() {
            if (!this.exploded) {
                fgCtx.beginPath(); fgCtx.strokeStyle = this.color; fgCtx.lineWidth = 2;
                fgCtx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
                this.trail.forEach(p => fgCtx.lineTo(p.x, p.y)); fgCtx.stroke();
                fgCtx.beginPath(); fgCtx.fillStyle = '#fff'; fgCtx.arc(this.x, this.y, 2, 0, Math.PI * 2); fgCtx.fill();
            } else {
                // ✅ Desenha o Clarão (Flash)
                if (this.hasFlash && this.flashAlpha > 0) {
                    fgCtx.save();
                    const radius = 150 + (1 - this.flashAlpha) * 250;
                    const grad = fgCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
                    grad.addColorStop(0, `rgba(255, 255, 255, ${this.flashAlpha})`);
                    grad.addColorStop(0.2, `rgba(255, 255, 255, ${this.flashAlpha * 0.5})`);
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    fgCtx.fillStyle = grad;
                    fgCtx.beginPath(); fgCtx.arc(this.x, this.y, radius, 0, Math.PI * 2); fgCtx.fill();
                    fgCtx.restore();
                }
                this.particles.forEach(p => p.draw());
            }
        }
    }

    class BgParticle {
        constructor(x, y, angle, speed, color) {
            this.x = x; this.y = y;
            this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
            this.color = color; this.alpha = 1;
            this.decay = nyRand(0.01, 0.025); this.gravity = 0.04; this.friction = 0.98;
        }
        update() {
            this.vx *= this.friction; this.vy *= this.friction; this.vy += this.gravity;
            this.x += this.vx; this.y += this.vy; this.alpha -= this.decay;
        }
        draw() {
            fgCtx.save(); fgCtx.globalAlpha = this.alpha; fgCtx.fillStyle = this.color;
            fgCtx.shadowColor = this.color; fgCtx.shadowBlur = 6;
            fgCtx.beginPath(); fgCtx.arc(this.x, this.y, 1.5, 0, Math.PI * 2); fgCtx.fill(); fgCtx.restore();
        }
    }

    const bgFireworks = [];

    // ==========================================
    // BOLHAS DE CHAMPANHE (NOS CARDS)
    // ==========================================
    let cards = [];
    const cardBubbles = new Map();

    const scanCards = () => {
        cards = [...document.querySelectorAll(NY_CFG.cards)];
    };

    function getBubbles(card) {
        const key = card.dataset.k || Math.random().toString(36);
        if (!cardBubbles.has(key)) {
            const b = [];
            for (let i = 0; i < 3; i++) {
                b.push({ x: Math.random(), y: Math.random(), size: nyRand(2, 4), speed: nyRand(0.2, 0.6), wobble: nyRand(0, 100), opacity: nyRand(0.3, 0.8) });
            }
            cardBubbles.set(key, b);
        }
        return cardBubbles.get(key);
    }

    function drawCardBubbles(ctx, r, time) {
        if (r.width < 30 || r.height < 20 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return;
        const bubbles = getBubbles({ dataset: { k: r.left + '_' + r.top } });
        bubbles.forEach(b => {
            b.y -= b.speed * 0.01;
            const wobbleX = Math.sin(time * 0.002 + b.wobble) * 3;
            if (b.y < -0.1) { b.y = 1.1; b.x = Math.random(); }
            const bx = r.left + (b.x * r.width) + wobbleX;
            const by = r.top + (b.y * r.height);
            ctx.save(); ctx.globalAlpha = b.opacity;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(bx, by, b.size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath(); ctx.arc(bx - b.size * 0.3, by - b.size * 0.3, b.size * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    }

    // ==========================================
    // LOOP PRINCIPAL
    // ==========================================
    let raf = 0, last = performance.now();
    
    let scanTimeout;
    const observer = new MutationObserver(() => { 
        clearTimeout(scanTimeout); 
        scanTimeout = setTimeout(scanCards, 100); 
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function stop() {
        cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
        document.removeEventListener('click', clickHandler); 
        observer.disconnect(); if(nyAuthObserver) nyAuthObserver.disconnect();
        bgCanvas.remove(); fgCanvas.remove();
        window.__newyearStop = null;
    }
    window.__newyearStop = stop;

    function frame(now) {
        if (!document.body.classList.contains('theme-newyear')) { stop(); return; }
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        
        // 1. CAMADA DE FUNDO (Bolhas nos cards)
        bgCtx.clearRect(0, 0, W, H);
        cards.forEach(card => {
            const r = card.getBoundingClientRect();
            drawCardBubbles(bgCtx, r, now);
        });
        
        // 2. CAMADA SUPERIOR (Fogos de fundo + Cliques)
        fgCtx.clearRect(0, 0, W, H);
        
        // ✅ Dobro de chance de spawnar fogos
        if (Math.random() < 0.08 && bgFireworks.length < NY_CFG.maxBackgroundFireworks) {
            bgFireworks.push(new BackgroundFirework());
        }
        for (let i = bgFireworks.length - 1; i >= 0; i--) {
            bgFireworks[i].update(); bgFireworks[i].draw();
            if (bgFireworks[i].exploded && bgFireworks[i].particles.length === 0 && bgFireworks[i].flashAlpha <= 0) {
                bgFireworks.splice(i, 1);
            }
        }

        // Fogos de Clique
        for (let i = clickParticles.length - 1; i >= 0; i--) {
            clickParticles[i].update();
            clickParticles[i].draw(fgCtx);
            if (clickParticles[i].life <= 0) clickParticles.splice(i, 1);
        }

        raf = requestAnimationFrame(frame);
    }
    
    scanCards();
    raf = requestAnimationFrame(frame);
}