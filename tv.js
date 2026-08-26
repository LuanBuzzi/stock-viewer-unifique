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
                    <a href="#resumo" title="Resumo e NFs" style="color: rgba(255,255,255,0.3); text-decoration: none; font-size: 1.2rem;">📋</a>
                    <div class="tv-weather" id="tv-weather" style="font-size: 1.6rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                        <span id="weather-icon">--</span>
                        <span id="weather-temp">--°C</span>
                    </div>
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

    // Clima em Rio do Sul - SC
    const fetchWeather = async () => {
        try {
            // Latitude -27.214, Longitude -49.643 (Rio do Sul)
            const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-27.214&longitude=-49.643&current=temperature_2m,weather_code");
            const data = await res.json();
            const temp = Math.round(data.current.temperature_2m);
            const code = data.current.weather_code;
            
            // Dicionário simples de códigos WMO para emojis
            let icon = "☀️";
            if (code === 0) icon = "☀️";
            else if (code === 1 || code === 2 || code === 3) icon = "⛅";
            else if (code === 45 || code === 48) icon = "🌫️";
            else if (code >= 51 && code <= 67) icon = "🌧️";
            else if (code >= 71 && code <= 77) icon = "❄️";
            else if (code >= 80 && code <= 82) icon = "🌦️";
            else if (code >= 95) icon = "⛈️";
            
            const tempEl = document.getElementById('weather-temp');
            const iconEl = document.getElementById('weather-icon');
            if (tempEl && iconEl) {
                tempEl.innerText = `${temp}°C`;
                iconEl.innerText = icon;
                iconEl.title = "Clima em Rio do Sul";
            }
        } catch (error) {
            console.error("Erro ao buscar o clima:", error);
        }
    };
    fetchWeather();
    let weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // Atualiza a cada 30 min

    // Renderizar Cards
    const renderCard = (order) => {
        // Formata id com 4 digitos
        const orderNum = String(order.id).padStart(4, '0');
        const extraClass = order.status === 'disponivel' ? 'pulse-available' : '';
        
        // Cores discretas para a tag
        let tagColor = '#f97316'; // manutencao
        if (order.tag === 'REDES') tagColor = '#38bdf8';
        if (order.tag === 'TERCEIRIZADA') tagColor = '#a855f7';
        const tagHtml = order.tag ? `<span style="float: right; font-size: 0.7rem; font-weight: normal; color: ${tagColor}; opacity: 0.8; letter-spacing: 0.5px;">• ${order.tag}</span>` : '';

        return `
            <div class="order-card status-${order.status} ${extraClass}">
                <div class="order-id">
                    Pedido #${orderNum}
                    ${tagHtml}
                </div>
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
        if (weatherInterval) clearInterval(weatherInterval);
    };
}
