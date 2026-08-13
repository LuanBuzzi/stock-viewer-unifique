function renderTV(container) {
    let unsubscribe = null;

    container.innerHTML = `
        <div class="tv-layout fade-in">
            <div class="tv-header">
                <div class="unifique-logo-text">
                    <!-- Ícone Placeholder para a Logo -->
                    <svg xmlns="https://i.ibb.co/99gZK6jz/image.png" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    UNIFIQUE | Retirada de Materiais
                </div>
                <div style="display: flex; gap: 24px; align-items: center;">
                    <div class="tv-clock" id="tv-clock">00:00</div>
                    <a href="#admin" class="btn btn-outline" style="border-color: rgba(255,255,255,0.2); color: white; text-decoration: none;">Acesso Restrito</a>
                </div>
            </div>
            
            <div class="kanban-board">
                <!-- Coluna 1: Pedidos -->
                <div class="kanban-col glass">
                    <div class="kanban-header header-pedido">Recebidos</div>
                    <div class="kanban-cards" id="col-pedido"></div>
                </div>

                <!-- Coluna 2: Em Separação -->
                <div class="kanban-col glass">
                    <div class="kanban-header header-separacao">Em Separação</div>
                    <div class="kanban-cards" id="col-separacao"></div>
                </div>

                <!-- Coluna 3: Disponível -->
                <div class="kanban-col glass" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3);">
                    <div class="kanban-header header-disponivel">RETIRADA LIBERADA</div>
                    <div class="kanban-cards" id="col-disponivel"></div>
                </div>
            </div>
        </div>
    `;

    // Relógio
    const updateClock = () => {
        const now = new Date();
        document.getElementById('tv-clock').innerText = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };
    setInterval(updateClock, 1000);
    updateClock();

    // Renderizar Cards
    const renderCard = (order) => {
        // Formata id com 4 digitos
        const orderNum = String(order.id).padStart(4, '0');
        const extraClass = order.status === 'disponivel' ? 'pulse-available' : '';
        
        return `
            <div class="order-card status-${order.status} ${extraClass}">
                <div class="order-id">Pedido #${orderNum}</div>
                <div class="order-name">${order.employee}</div>
                ${order.description ? `<div class="order-desc">${order.description}</div>` : ''}
            </div>
        `;
    };

    // Atualização em tempo real
    unsubscribe = window.db.subscribe((orders) => {
        const colPedido = document.getElementById('col-pedido');
        const colSeparacao = document.getElementById('col-separacao');
        const colDisponivel = document.getElementById('col-disponivel');
        
        // Filtra os pedidos e mapeia para HTML
        colPedido.innerHTML = orders.filter(o => o.status === 'pedido').map(renderCard).join('');
        colSeparacao.innerHTML = orders.filter(o => o.status === 'separacao').map(renderCard).join('');
        colDisponivel.innerHTML = orders.filter(o => o.status === 'disponivel').map(renderCard).join('');
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
}
