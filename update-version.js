const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, 'sw.js');
if (!fs.existsSync(swPath)) {
    console.error('Arquivo sw.js não encontrado.');
    process.exit(1);
}

let swContent = fs.readFileSync(swPath, 'utf8');

// Gera uma versão baseada na data e hora atual (ex: v202610281450)
const agora = new Date();
const ano = agora.getFullYear();
const mes = String(agora.getMonth() + 1).padStart(2, '0');
const dia = String(agora.getDate()).padStart(2, '0');
const hora = String(agora.getHours()).padStart(2, '0');
const minuto = String(agora.getMinutes()).padStart(2, '0');
const novaVersao = `v${ano}${mes}${dia}${hora}${minuto}`;

// Substitui a linha do CACHE_NAME no sw.js
swContent = swContent.replace(
    /const CACHE_NAME = '.*?';/, 
    `const CACHE_NAME = 'gym-workout-${novaVersao}';`
);

fs.writeFileSync(swPath, swContent);
console.log(`✅ Versão do Service Worker atualizada automaticamente para: gym-workout-${novaVersao}`);
const uiPath = path.join(__dirname, 'js', 'ui.js');
if (fs.existsSync(uiPath)) {
    let uiContent = fs.readFileSync(uiPath, 'utf8');
    // Procura a div com "Versão: v..." e substitui pela nova
    uiContent = uiContent.replace(
        /<div style="text-align: center; font-size: 10px; color: var\(--mu\); margin-top: 20px; opacity: 0.5;">Versão: .*?<\/div>/,
        `<div style="text-align: center; font-size: 10px; color: var(--mu); margin-top: 20px; opacity: 0.5;">Versão: ${novaVersao}</div>`
    );
    fs.writeFileSync(uiPath, uiContent);
    console.log(`✅ Versão visível no menu atualizada para: ${novaVersao}`);
}