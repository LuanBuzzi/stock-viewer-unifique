function renderAdmin(container) {
    let unsubscribe = null;

    container.innerHTML = `
        <div class="admin-layout fade-in">
            <div class="tv-header" style="padding-bottom: 0; border: none; margin-bottom: 24px;">
                <div>
                    <h1 style="font-size: 2rem; font-weight: 700;">Gestão de Pedidos (Estoque)</h1>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Adicione novos pedidos e avance o status para aparecer na TV da Unifique.</p>
                </div>
                <div style="display: flex; gap: 16px; align-items: center;">
                    <a href="#tv" target="_blank" class="btn btn-outline" style="text-decoration: none;">Ver Tela da TV</a>
                    <button class="btn" id="btn-add">Novo Pedido</button>
                    <button class="btn btn-outline" id="btn-logout" style="border-color: var(--danger); color: var(--danger);">Sair</button>
                </div>
            </div>

            <div class="glass" style="padding: 24px; margin-bottom: 32px; display: none;" id="form-container">
                <h3 style="margin-bottom: 24px;">Criar Novo Pedido</h3>
                <form id="order-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome do Colaborador</label>
                            <input type="text" id="order-employee" class="form-control" required placeholder="Ex: Luan Fernandes">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descrição dos Materiais (Opcional)</label>
                        <input type="text" id="order-desc" class="form-control" placeholder="Ex: 2x Roteador, 50m Cabo">
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button type="submit" class="btn">Adicionar Pedido</button>
                        <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
                    </div>
                </form>
            </div>

            <div class="glass" style="padding: 24px; overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Colaborador</th>
                            <th>Materiais</th>
                            <th>Data</th>
                            <th>Status Atual</th>
                            <th>Ações (Avançar Etapa)</th>
                        </tr>
                    </thead>
                    <tbody id="admin-table-body">
                        <!-- Injetado via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('order-form');
    
    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.reload();
    });

    document.getElementById('btn-add').addEventListener('click', () => {
        form.reset();
        formContainer.style.display = 'block';
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        formContainer.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const order = {
            employee: document.getElementById('order-employee').value,
            description: document.getElementById('order-desc').value,
            status: 'pedido'
        };

        window.db.addOrder(order);
        formContainer.style.display = 'none';
        form.reset();
    });

    window.updateStatus = (id, status) => {
        window.db.updateStatus(id, status);
    };

    window.deleteOrder = (id) => {
        if(confirm('Tem certeza que deseja remover este pedido do painel?')) {
            window.db.deleteOrder(id);
        }
    };

    unsubscribe = window.db.subscribe((orders) => {
        const tbody = document.getElementById('admin-table-body');
        
        tbody.innerHTML = orders.map(order => {
            const orderNum = String(order.id).padStart(4, '0');
            const dateStr = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Lógica dos botões baseada no status atual
            let actionButtons = '';
            if (order.status === 'pedido') {
                actionButtons = `<button class="btn btn-small" style="background: var(--status-separacao)" onclick="updateStatus(${order.id}, 'separacao')">Iniciar Separação</button>`;
            } else if (order.status === 'separacao') {
                actionButtons = `<button class="btn btn-small" style="background: var(--status-disponivel)" onclick="updateStatus(${order.id}, 'disponivel')">Liberar Retirada</button>`;
            } else if (order.status === 'disponivel') {
                actionButtons = `<button class="btn btn-small btn-outline" style="color: var(--text-secondary); border-color: var(--text-secondary)" onclick="deleteOrder(${order.id})">Baixar/Finalizar</button>`;
            }

            return `
            <tr>
                <td style="color: var(--text-secondary);">#${orderNum}</td>
                <td style="font-weight: 700; font-size: 1.2rem;">${order.employee}</td>
                <td style="color: var(--text-secondary);">${order.description || '-'}</td>
                <td style="color: var(--text-secondary);">${dateStr}</td>
                <td><span class="badge ${order.status}">${order.status.replace('separacao', 'em separação')}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${actionButtons}
                        ${order.status !== 'disponivel' ? `<button class="btn btn-small btn-outline" style="color: var(--danger); border-color: var(--danger)" onclick="deleteOrder(${order.id})" title="Cancelar Pedido">X</button>` : ''}
                    </div>
                </td>
            </tr>
        `}).join('');
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
}
