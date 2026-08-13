function renderAdmin(container) {
    let unsubscribe = null;

    container.innerHTML = `
        <div class="admin-layout fade-in">
            <div class="admin-header">
                <div>
                    <h1 style="font-size: 2rem; font-weight: 700;">Painel de Controle</h1>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Gerencie o estoque. As alterações refletem na TV instantaneamente.</p>
                </div>
                <div style="display: flex; gap: 16px;">
                    <a href="#tv" target="_blank" class="btn" style="background: rgba(255,255,255,0.1); text-decoration: none;">Abrir TV</a>
                    <button class="btn" id="btn-add">Novo Item</button>
                </div>
            </div>

            <div class="glass" style="padding: 24px; margin-bottom: 32px; display: none;" id="form-container">
                <h3 style="margin-bottom: 24px;" id="form-title">Adicionar Item</h3>
                <form id="item-form">
                    <input type="hidden" id="item-id">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome do Equipamento/Material</label>
                            <input type="text" id="item-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Categoria</label>
                            <select id="item-category" class="form-control" required>
                                <option value="Equipamento">Equipamento</option>
                                <option value="Cabeamento">Cabeamento</option>
                                <option value="Acessório">Acessório</option>
                                <option value="Ferramenta">Ferramenta</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Quantidade Atual</label>
                            <input type="number" id="item-qty" class="form-control" required min="0">
                        </div>
                        <div class="form-group">
                            <label>Quantidade Mínima (Alerta)</label>
                            <input type="number" id="item-min" class="form-control" required min="0">
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button type="submit" class="btn">Salvar</button>
                        <button type="button" class="btn" id="btn-cancel" style="background: transparent; border: 1px solid var(--card-border);">Cancelar</button>
                    </div>
                </form>
            </div>

            <div class="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Equipamento</th>
                            <th>Categoria</th>
                            <th>Qtd. Atual</th>
                            <th>Mínimo</th>
                            <th>Ações</th>
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
    const form = document.getElementById('item-form');
    
    document.getElementById('btn-add').addEventListener('click', () => {
        form.reset();
        document.getElementById('item-id').value = '';
        document.getElementById('form-title').innerText = 'Adicionar Item';
        formContainer.style.display = 'block';
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        formContainer.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const item = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            quantity: parseInt(document.getElementById('item-qty').value, 10),
            minQuantity: parseInt(document.getElementById('item-min').value, 10),
            updatedBy: 'Admin'
        };

        if (id) {
            window.db.updateItem(parseInt(id, 10), item);
        } else {
            window.db.addItem(item);
        }

        formContainer.style.display = 'none';
        form.reset();
    });

    window.editItem = (id) => {
        const item = window.db.items.find(i => i.id === id);
        if (item) {
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-qty').value = item.quantity;
            document.getElementById('item-min').value = item.minQuantity;
            document.getElementById('form-title').innerText = 'Editar Item';
            formContainer.style.display = 'block';
            window.scrollTo(0, 0);
        }
    };

    window.deleteItem = (id) => {
        if(confirm('Tem certeza que deseja remover este item?')) {
            window.db.deleteItem(id);
        }
    };

    window.adjustQty = (id, delta) => {
        const item = window.db.items.find(i => i.id === id);
        if (item) {
            const newQty = Math.max(0, item.quantity + delta);
            window.db.updateItem(id, { quantity: newQty });
        }
    };

    unsubscribe = window.db.subscribe((items) => {
        const tbody = document.getElementById('admin-table-body');
        
        tbody.innerHTML = items.map(item => `
            <tr>
                <td style="font-weight: 500;">${item.name}</td>
                <td><span style="color: var(--text-secondary); font-size: 0.9rem;">${item.category}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button class="action-btn" onclick="adjustQty(${item.id}, -1)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span style="font-weight: 700; font-size: 1.2rem; width: 40px; text-align: center;">${item.quantity}</span>
                        <button class="action-btn" onclick="adjustQty(${item.id}, 1)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                </td>
                <td>${item.minQuantity}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" onclick="editItem(${item.id})" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn" onclick="deleteItem(${item.id})" title="Remover" style="color: var(--danger);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
}
