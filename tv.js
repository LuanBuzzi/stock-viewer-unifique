function renderTV(container) {
    let unsubscribe = null;

    container.innerHTML = `
        <div class="tv-layout fade-in">
            <div class="tv-header">
                <h1>ESTOQUE EM TEMPO REAL</h1>
                <div class="tv-clock" id="tv-clock">00:00:00</div>
            </div>
            
            <div class="main-content" style="display: flex; flex-direction: column; gap: 24px;">
                <div class="stats-grid">
                    <div class="stat-card glass">
                        <div class="stat-value" id="total-items">0</div>
                        <div class="stat-label">Itens Diferentes</div>
                    </div>
                    <div class="stat-card glass">
                        <div class="stat-value critical" id="critical-items" style="color: var(--danger)">0</div>
                        <div class="stat-label">Em Estado Crítico</div>
                    </div>
                </div>

                <div class="table-container glass" style="flex: 1;">
                    <table>
                        <thead>
                            <tr>
                                <th>Equipamento</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="tv-table-body">
                            <!-- Injetado via JS -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="side-panel glass" style="padding: 24px;">
                <h3 style="color: var(--text-secondary); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">Últimas Atualizações</h3>
                <div id="activity-feed" style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- Activity items -->
                </div>
                
                <div style="margin-top: auto; padding-top: 40px; text-align: center;">
                    <div style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid var(--accent); margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;" class="animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">SISTEMA ONLINE E SINCRONIZADO</p>
                </div>
            </div>
        </div>
    `;

    // Relógio
    const updateClock = () => {
        const now = new Date();
        document.getElementById('tv-clock').innerText = now.toLocaleTimeString('pt-BR');
    };
    setInterval(updateClock, 1000);
    updateClock();

    const getStatus = (qty, min) => {
        if (qty <= min / 2) return { label: 'Crítico', class: 'critical' };
        if (qty <= min) return { label: 'Baixo', class: 'low' };
        return { label: 'Adequado', class: 'ok' };
    };

    // Atualização em tempo real
    unsubscribe = window.db.subscribe((items) => {
        const tbody = document.getElementById('tv-table-body');
        const activityFeed = document.getElementById('activity-feed');
        
        let criticalCount = 0;
        
        tbody.innerHTML = items.map(item => {
            const status = getStatus(item.quantity, item.minQuantity);
            if (status.class === 'critical') criticalCount++;
            
            return `
                <tr class="fade-in">
                    <td style="font-weight: 600;">${item.name}</td>
                    <td><span style="color: var(--text-secondary); font-size: 0.9rem;">${item.category}</span></td>
                    <td style="font-weight: 700; font-size: 1.5rem;">${item.quantity}</td>
                    <td><span class="badge ${status.class}">${status.label}</span></td>
                </tr>
            `;
        }).join('');

        document.getElementById('total-items').innerText = items.length;
        document.getElementById('critical-items').innerText = criticalCount;

        // Activity mock (getting first 4 items as "recently updated")
        const recent = [...items].reverse().slice(0, 4);
        activityFeed.innerHTML = recent.map(item => `
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border-left: 3px solid var(--accent);" class="fade-in">
                <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Atualizado: ${item.quantity} un.</div>
            </div>
        `).join('');
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
}
