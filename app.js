const appContainer = document.getElementById('app');
let currentCleanup = null;

function router() {
    // Limpa a tela anterior, se houver
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    const hash = window.location.hash || '#admin';
    
    if (hash === '#tv') {
        document.title = "TV - Dashboard de Estoque";
        currentCleanup = renderTV(appContainer);
    } else {
        document.title = "Admin - Controle de Estoque";
        currentCleanup = renderAdmin(appContainer);
    }
}

window.addEventListener('hashchange', router);

// Inicializa a rota atual
router();
