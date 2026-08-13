function renderTV(container) {
    let unsubscribe = null;

    container.innerHTML = `
        <div class="tv-layout fade-in">
            <div class="tv-header">
                <div class="unifique-logo-text">
                    <!-- Logo da Unifique -->
                    <img src="https://i.ibb.co/99gZK6jz/image.png" alt="Unifique Logo" width="120" height="120" style="object-fit: contain; border-radius: 4px;">
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
                <div class="kanban-col glass">
                    <div class="kanban-header header-disponivel">RETIRADA LIBERADA</div>
                    <div class="kanban-cards" id="col-disponivel"></div>
                </div>
            </div>
        </div>
    `;

    // Relógio
    let intervalId = null;
    const updateClock = () => {
        const clock = document.getElementById('tv-clock');
        if (clock) {
            clock.innerText = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else {
            if (intervalId) clearInterval(intervalId);
        }
    };
    intervalId = setInterval(updateClock, 1000);
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

    // Efeito de auto-scroll lento para colunas com muitos pedidos
    const autoScrollInterval = setInterval(() => {
        const cols = document.querySelectorAll('.kanban-cards');
        cols.forEach(col => {
            // Só faz scroll se o conteúdo for maior que a tela
            if (col.scrollHeight > col.clientHeight) {
                if (!col.dataset.scrollDir) {
                    col.dataset.scrollDir = "1"; // 1 para descer, -1 para subir
                }
                
                let dir = parseInt(col.dataset.scrollDir);
                col.scrollTop += dir;
                
                // Chegou no final (ou muito próximo) - sobe
                if (Math.ceil(col.scrollTop + col.clientHeight) >= col.scrollHeight) {
                    col.dataset.scrollDir = "-1";
                } 
                // Chegou no topo - desce
                else if (col.scrollTop <= 0) {
                    col.dataset.scrollDir = "1";
                }
            } else {
                // Se não precisa de scroll, garante que está no topo
                col.scrollTop = 0;
                col.dataset.scrollDir = "1";
            }
        });
    }, 40); // Ajuste este valor para controlar a velocidade do scroll

    return () => {
        if (unsubscribe) unsubscribe();
        if (intervalId) clearInterval(intervalId);
        if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
}
