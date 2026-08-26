function renderSummary(container) {
    let unsubscribe = null;

    container.innerHTML = `
        <div class="admin-layout fade-in">
            <div class="tv-header" style="padding-bottom: 0; border: none; margin-bottom: 24px;">
                <div>
                    <h1 style="font-size: 2rem; font-weight: 700;">Resumo de Pedidos</h1>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Acompanhamento de todos os pedidos e download de NFs.</p>
                </div>
                <div style="display: flex; gap: 16px; align-items: center;">
                    <a href="#dashboard" class="btn btn-outline" style="text-decoration: none; border-color: var(--unifique-blue); color: var(--unifique-blue);">Dashboard</a>
                    <a href="#tv" class="btn btn-outline" style="text-decoration: none;">Voltar para TV</a>
                </div>
            </div>

            <div class="glass" style="padding: 24px; overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Colaborador</th>
                            <th>Tag</th>
                            <th>Materiais</th>
                            <th>Data</th>
                            <th>Status Atual</th>
                            <th>Anexos</th>
                        </tr>
                    </thead>
                    <tbody id="summary-table-body">
                        <!-- Injetado via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    unsubscribe = window.db.subscribe((orders) => {
        const tbody = document.getElementById('summary-table-body');
        
        tbody.innerHTML = orders.map(order => {
            const orderNum = String(order.id).padStart(4, '0');
            const dateStr = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            let nfLink = '-';
            if (order.nf_path) {
                const url = window.db.getNFUrl(order.nf_path);
                nfLink = `<a href="${url}" target="_blank" class="btn btn-small btn-outline" style="color: var(--unifique-blue); border-color: var(--unifique-blue);" title="Baixar NF">📄 Baixar NF</a>`;
            }
            
            let tagClass = 'tag-manutencao';
            if (order.tag === 'REDES') tagClass = 'tag-redes';
            if (order.tag === 'TERCEIRIZADA') tagClass = 'tag-terceirizada';

            return `
            <tr>
                <td style="color: var(--text-secondary);">#${orderNum}</td>
                <td style="font-weight: 700; font-size: 1.2rem;">${order.employee}</td>
                <td><span class="tag-badge ${tagClass}">${order.tag || 'MANUTENÇÃO'}</span></td>
                <td style="color: var(--text-secondary);">${order.description || '-'}</td>
                <td style="color: var(--text-secondary);">${dateStr}</td>
                <td><span class="badge ${order.status}">${order.status.replace('separacao', 'em separação')}</span></td>
                <td>
                    ${nfLink}
                </td>
            </tr>
        `}).join('');
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
}
