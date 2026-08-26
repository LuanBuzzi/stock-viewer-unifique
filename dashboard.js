function renderDashboard(container) {
    let unsubscribe = null;
    let chartTag = null;
    let chartStatus = null;

    container.innerHTML = `
        <div class="admin-layout fade-in">
            <div class="tv-header" style="padding-bottom: 0; border: none; margin-bottom: 24px;">
                <div>
                    <h1 style="font-size: 2rem; font-weight: 700;">Dashboard de Métricas</h1>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Acompanhamento de volume e fluxo de materiais em tempo real.</p>
                </div>
                <div style="display: flex; gap: 16px; align-items: center;">
                    <a href="#resumo" class="btn btn-outline" style="text-decoration: none;">Modo Lista</a>
                    <a href="#admin" class="btn btn-outline" style="text-decoration: none; border-color: var(--unifique-blue); color: var(--unifique-blue);">Gestão (Admin)</a>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 32px;">
                <div class="glass" style="padding: 24px; text-align: center;">
                    <h3 style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 8px;">Total de Pedidos Ativos</h3>
                    <div id="dash-total" style="font-size: 3.5rem; font-weight: 800; color: white;">0</div>
                </div>
                <div class="glass" style="padding: 24px; text-align: center;">
                    <h3 style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 8px;">Fila (Recebidos)</h3>
                    <div id="dash-recebidos" style="font-size: 3.5rem; font-weight: 800; color: var(--status-pedido);">0</div>
                </div>
                <div class="glass" style="padding: 24px; text-align: center;">
                    <h3 style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 8px;">Prontos (Liberados)</h3>
                    <div id="dash-prontos" style="font-size: 3.5rem; font-weight: 800; color: var(--status-disponivel);">0</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
                <div class="glass" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px; text-align: center; color: var(--text-secondary);">Distribuição por Tag</h3>
                    <div style="position: relative; height: 300px;">
                        <canvas id="chartTag"></canvas>
                    </div>
                </div>
                <div class="glass" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px; text-align: center; color: var(--text-secondary);">Volume por Status</h3>
                    <div style="position: relative; height: 300px;">
                        <canvas id="chartStatus"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Configuração base do Chart.js para modo dark
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = 'Inter';

    const ctxTag = document.getElementById('chartTag').getContext('2d');
    const ctxStatus = document.getElementById('chartStatus').getContext('2d');

    chartTag = new Chart(ctxTag, {
        type: 'doughnut',
        data: {
            labels: ['MANUTENÇÃO', 'REDES', 'TERCEIRIZADA'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#f97316', '#38bdf8', '#a855f7'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20 } }
            },
            cutout: '70%'
        }
    });

    chartStatus = new Chart(ctxStatus, {
        type: 'bar',
        data: {
            labels: ['Recebidos', 'Em Separação', 'Liberados'],
            datasets: [{
                label: 'Pedidos',
                data: [0, 0, 0],
                backgroundColor: ['#039dc4', '#b9d80a', '#0c9407'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { stepSize: 1 }
                },
                x: { 
                    grid: { display: false } 
                }
            }
        }
    });

    unsubscribe = window.db.subscribe((orders) => {
        // Atualiza Cards de métricas
        document.getElementById('dash-total').innerText = orders.length;
        document.getElementById('dash-recebidos').innerText = orders.filter(o => o.status === 'pedido').length;
        document.getElementById('dash-prontos').innerText = orders.filter(o => o.status === 'disponivel').length;

        // Atualiza Gráfico de Tags
        const tags = { 'MANUTENÇÃO': 0, 'REDES': 0, 'TERCEIRIZADA': 0 };
        orders.forEach(o => {
            const tag = o.tag || 'MANUTENÇÃO';
            if (tags[tag] !== undefined) tags[tag]++;
        });
        chartTag.data.datasets[0].data = [tags['MANUTENÇÃO'], tags['REDES'], tags['TERCEIRIZADA']];
        chartTag.update();

        // Atualiza Gráfico de Status
        const statuses = { pedido: 0, separacao: 0, disponivel: 0 };
        orders.forEach(o => {
            if(statuses[o.status] !== undefined) statuses[o.status]++;
        });
        chartStatus.data.datasets[0].data = [statuses['pedido'], statuses['separacao'], statuses['disponivel']];
        chartStatus.update();
    });

    return () => {
        if (unsubscribe) unsubscribe();
        if (chartTag) chartTag.destroy();
        if (chartStatus) chartStatus.destroy();
    };
}
