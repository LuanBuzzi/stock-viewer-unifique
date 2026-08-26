const appContainer = document.getElementById('app');
let currentCleanup = null;

function renderLogin(container) {
    container.innerHTML = `
        <div class="admin-layout fade-in" style="display: flex; justify-content: center; align-items: center; height: 100vh; padding: 0;">
            <div class="glass" style="padding: 40px; width: 100%; max-width: 400px; text-align: center;">
                <h2 style="margin-bottom: 24px; color: var(--text-primary);">Login Admin</h2>
                <form id="login-form">
                    <div class="form-group" style="text-align: left;">
                        <label>Usuário</label>
                        <input type="text" id="login-user" class="form-control" required placeholder="Digite o usuário">
                    </div>
                    <div class="form-group" style="text-align: left;">
                        <label>Senha</label>
                        <input type="password" id="login-pass" class="form-control" required placeholder="Digite a senha">
                    </div>
                    <div id="login-error" style="color: var(--danger); margin-bottom: 16px; display: none; font-size: 0.9rem;">Usuário ou senha incorretos</div>
                    <button type="submit" class="btn" style="width: 100%;">Entrar</button>
                    <a href="#tv" class="btn btn-outline" style="width: 100%; margin-top: 12px; display: block; text-decoration: none; color: var(--text-secondary); box-sizing: border-box; text-align: center;">Voltar para TV</a>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;

        if (user === 'allan' && pass === '12345678') {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            router();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    return () => {}; // Sem cleanup necessário para o login
}

function router() {
    // Limpa a tela anterior, se houver
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    const hash = window.location.hash || '#tv';
    
    if (hash === '#tv') {
        document.title = "TV - Dashboard de Estoque";
        currentCleanup = renderTV(appContainer);
    } else if (hash === '#resumo') {
        document.title = "Resumo - Pedidos e NFs";
        currentCleanup = renderSummary(appContainer);
    } else if (hash === '#admin') {
        const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
        if (isLoggedIn) {
            document.title = "Admin - Controle de Estoque";
            currentCleanup = renderAdmin(appContainer);
        } else {
            document.title = "Login - Controle de Estoque";
            currentCleanup = renderLogin(appContainer);
        }
    }
}

window.addEventListener('hashchange', router);

// Inicializa a rota atual
router();
