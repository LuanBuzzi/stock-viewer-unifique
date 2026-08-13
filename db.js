// Configuração do Supabase
// Substitua pelas suas credenciais corretas!
const SUPABASE_URL = 'COLE_AQUI_A_SUA_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_SUA_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class RealTimeDB {
    constructor() {
        this.listeners = [];
        this.items = [];
        
        // Carrega dados iniciais
        this.fetchItems();

        // Inscreve-se nas mudanças em tempo real
        this.setupRealtimeSubscription();
    }

    async fetchItems() {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Erro ao buscar dados:', error);
            return;
        }

        this.items = data || [];
        this.notify();
    }

    setupRealtimeSubscription() {
        supabase
            .channel('public:inventory')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, payload => {
                console.log('Mudança Real-time recebida!', payload);
                this.handleRealtimePayload(payload);
            })
            .subscribe();
    }

    handleRealtimePayload(payload) {
        if (payload.eventType === 'INSERT') {
            this.items.push(payload.new);
        } else if (payload.eventType === 'UPDATE') {
            this.items = this.items.map(item => item.id === payload.new.id ? payload.new : item);
        } else if (payload.eventType === 'DELETE') {
            this.items = this.items.filter(item => item.id !== payload.old.id);
        }
        
        // Reordenar por nome
        this.items.sort((a, b) => a.name.localeCompare(b.name));
        this.notify();
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.items); // chamada inicial
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(cb => cb(this.items));
    }

    async addItem(item) {
        // Não precisamos mandar o 'id' pois o Supabase gera (auto-increment ou UUID)
        const { error } = await supabase.from('inventory').insert([item]);
        if (error) console.error('Erro ao adicionar:', error);
    }

    async updateItem(id, updates) {
        const { error } = await supabase.from('inventory').update(updates).eq('id', id);
        if (error) console.error('Erro ao atualizar:', error);
    }

    async deleteItem(id) {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) console.error('Erro ao deletar:', error);
    }
}

// Para evitar erro no carregamento inicial antes de configurar a chave
if (SUPABASE_URL === 'COLE_AQUI_A_SUA_PROJECT_URL') {
    console.warn("ATENÇÃO: Você precisa colocar a URL e a KEY no db.js!");
}

window.db = new RealTimeDB();
