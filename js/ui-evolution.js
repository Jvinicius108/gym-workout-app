import { state } from './state.js';
import { $, esc, pd, LT, showToast } from './utils.js';
import { hydrate } from './db.js';

const Icons = {
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
};

export function openEvolution() {
  $("dr").classList.remove("on");
  $("ov").classList.remove("on");
  state.draft = ""; state.exDetail = false; state.editingExIndex = null;

  $("evoScreen").classList.add("on");
  $("evoChartArea").style.display = "none";
  $("evoList").style.display = "block";
  $("evoTitle").textContent = "Seus Exercícios";

  const exsWithData = [];
  const uniqueNames = new Set();

  LT().forEach(l => {
    (state.P.ex[l] || []).forEach(e => {
      let hasHistory = false;
      Object.values(state.F).forEach(feito => { if (feito.weights && feito.weights[e.id]) hasHistory = true; });
      if (hasHistory && !uniqueNames.has(e.name)) {
        uniqueNames.add(e.name);
        exsWithData.push(e);
      }
    });
  });

  if (exsWithData.length === 0) {
    $("evoList").innerHTML = '<div class="empty">Você ainda não registrou cargas.<br>Vá em um treino e clique no botão "⚖️ Carga".</div>';
    return;
  }

  let h = "";
  exsWithData.forEach(e => {
    h += `<button class="wcard" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; width: 100%;" data-chart="${e.id}"><div style="text-align: left;"><b>${esc(e.name)}</b><span>Carga atual: ${esc(e.w || "Nenhuma")} ${esc(e.wu || "")}</span></div><div style="color: var(--ac);">${Icons.chart}</div></button>`;
  });
  $("evoList").innerHTML = h;
}

export function drawChart(exId) {
  // ✅ CORREÇÃO: Verifica se a biblioteca Chart.js carregou da internet.
  if (typeof Chart === "undefined") {
    showToast("Gráfico indisponível. Verifique sua internet.", "error");
    $("evoTitle").textContent = "Gráfico Indisponível";
    $("evoList").style.display = "none";
    $("evoChartArea").style.display = "block";
    $("evoChartArea").innerHTML = '<div class="empty" style="padding:40px; text-align:center; color:var(--mu);">Não foi possível carregar o gráfico.<br>Verifique sua conexão com a internet e tente novamente.</div>';
    return;
  }

  if (!document.getElementById('myChart')) {
    $("evoChartArea").innerHTML = '<div class="chart-container"><canvas id="myChart" role="img" aria-label="Gráfico de evolução de carga"></canvas></div>';
  }

  let chartData = [];
  let exName = "";

  LT().forEach(l => { (state.P.ex[l] || []).forEach(e => { if (e.id === exId) exName = e.name; }); });

  let chartUnit = "kg"; 

  Object.keys(state.F).sort().forEach(k => {
    const feit = state.F[k];
    if (feit.weights && feit.weights[exId]) {
      const dateObj = pd(k);
      const dateStr = dateObj.toLocaleDateString("pt-BR", {day:"2-digit", month:"2-digit"});
      
      const rawWeight = feit.weights[exId];
      let total = 0;
      let displayStr = "";

      if (typeof rawWeight === 'object' && rawWeight !== null) {
          total = parseFloat(rawWeight.v) || 0;
          chartUnit = rawWeight.u || "kg";
          displayStr = `${rawWeight.v} ${chartUnit}`;
      } else if (typeof rawWeight === 'string') {
          let rawW = rawWeight.replace(',', '.').replace(/[^\d.+]/g, '');
          if (rawW.includes('+')) { rawW.split('+').forEach(n => total += parseFloat(n) || 0); }
          else { total = parseFloat(rawW) || 0; }
          
          if (rawWeight.toLowerCase().includes('lb')) chartUnit = 'lbs';
          else if (rawWeight.toLowerCase().includes('pl')) chartUnit = 'pl';
          
          displayStr = rawWeight;
      }

      chartData.push({ date: dateStr, val: total, raw: displayStr });
    }
  });

  $("evoTitle").textContent = exName;
  $("evoList").style.display = "none";
  $("evoChartArea").style.display = "block";
  
  const ctx = document.getElementById('myChart').getContext('2d');
  if (state.myChart) state.myChart.destroy();

  const rootStyles = getComputedStyle(document.documentElement);
  const accentColor = rootStyles.getPropertyValue('--ac').trim() || "#ff5a36";
  const textColor = rootStyles.getPropertyValue('--mu').trim() || "#6b7380";
  const cardColor = rootStyles.getPropertyValue('--card').trim() || "#fff";
  const borderColor = rootStyles.getPropertyValue('--bd').trim() || "#e3e6ea";
  const txColor = rootStyles.getPropertyValue('--tx').trim() || "#14171c";

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, accentColor + '66'); 
  gradient.addColorStop(1, accentColor + '00'); 

  state.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map(d => d.date),
      datasets: [{ 
          label: `Carga (${chartUnit})`,
          data: chartData.map(d => d.val), 
          borderColor: accentColor, 
          backgroundColor: gradient, 
          borderWidth: 4, 
          pointBackgroundColor: accentColor, 
          pointBorderColor: cardColor,
          pointBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: accentColor,
          pointHoverBorderColor: cardColor,
          tension: 0.4, 
          fill: true 
      }]
    },
    options: {
      responsive: true, 
      maintainAspectRatio: false,
      layout: { padding: { top: 10, right: 10, left: 0, bottom: 0 } },
      animation: { duration: 1000, easing: 'easeOutQuart' }, 
      plugins: { 
          legend: { display: false }, 
          tooltip: {
              backgroundColor: cardColor,
              titleColor: txColor,
              bodyColor: accentColor,
              borderColor: borderColor,
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
              displayColors: false,
              titleFont: { family: 'Outfit', size: 14, weight: 'bold' },
              bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
              callbacks: { 
                  title: () => '', 
                  label: function(context) { return `🏋️ ${chartData[context.dataIndex].raw}`; } 
              } 
          } 
      },
      scales: { 
          y: { 
              beginAtZero: true, 
              border: { display: false }, 
              grid: { color: borderColor, borderDash: [5, 5], drawTicks: false }, 
              ticks: { color: textColor, padding: 10, font: { family: 'Inter', size: 12, weight: 600 } } 
          }, 
          x: { 
              border: { display: false }, 
              grid: { display: false }, 
              ticks: { color: textColor, padding: 10, font: { family: 'Inter', size: 12, weight: 600 } } 
          } 
      }
    }
  });
}