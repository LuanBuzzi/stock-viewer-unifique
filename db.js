// Configuração do Supabase
// Substitua pelas suas credenciais corretas!
const SUPABASE_URL = 'https://nhualbztrfoxbpugwbes.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWFsYnp0cmZveGJwdWd3YmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NzMwNTEsImV4cCI6MjEwMjE0OTA1MX0.3dAkf-A9aDWrc8WDmjUp67EZoJCGBEHy3slAM44kI9c';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
});

class OrderDB {
    constructor() {
        this.listeners = [];
        this.orders = [];
        
        // Carrega dados iniciais
        this.fetchOrders();

        // Inscreve-se nas mudanças em tempo real
        this.setupRealtimeSubscription();
    }

    async fetchOrders() {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false }); // Pedidos mais novos no topo

        if (error) {
            console.error('Erro ao buscar pedidos:', error);
            alert('Erro de conexão: ' + error.message);
            return;
        }

        this.orders = data || [];
        this.notify();
    }

    setupRealtimeSubscription() {
        supabaseClient
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
                console.log('Mudança no Pedido!', payload);
                this.handleRealtimePayload(payload);
            })
            .subscribe();
    }

    handleRealtimePayload(payload) {
        if (payload.eventType === 'INSERT') {
            this.orders.unshift(payload.new); // Adiciona no começo
        } else if (payload.eventType === 'UPDATE') {
            this.orders = this.orders.map(o => o.id === payload.new.id ? payload.new : o);
        } else if (payload.eventType === 'DELETE') {
            this.orders = this.orders.filter(o => o.id !== payload.old.id);
        }
        
        // Mantém a ordem por data
        this.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        this.notify();
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.orders); // chamada inicial
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(cb => cb(this.orders));
    }

    async addOrder(order, file = null) {
        if (file) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError, data } = await supabaseClient.storage.from('nfs').upload(fileName, file);
                
                if (uploadError) throw uploadError;
                order.nf_path = data.path;
            } catch (err) {
                console.error('Erro no upload da NF:', err);
                alert('Erro ao enviar a Nota Fiscal: ' + err.message);
                return; // Aborta se falhar o upload
            }
        }

        const { error } = await supabaseClient.from('orders').insert([order]);
        if (error) {
            console.error('Erro ao adicionar pedido:', error);
            alert('Erro ao adicionar: ' + error.message);
        }
    }

    async updateStatus(id, newStatus) {
        const { error } = await supabaseClient.from('orders').update({ status: newStatus }).eq('id', id);
        if (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar: ' + error.message);
        }
    }

    async deleteOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order && order.nf_path) {
            // Remove o arquivo do Storage antes de apagar a linha
            await supabaseClient.storage.from('nfs').remove([order.nf_path]);
        }

        const { error } = await supabaseClient.from('orders').delete().eq('id', id);
        if (error) {
            console.error('Erro ao deletar pedido:', error);
            alert('Erro ao deletar: ' + error.message);
        }
    }

    getNFUrl(path) {
        const { data } = supabaseClient.storage.from('nfs').getPublicUrl(path);
        return data.publicUrl;
    }
}

if (!SUPABASE_URL || SUPABASE_URL.includes('COLE_AQUI')) {
    console.warn("ATENÇÃO: Você precisa colocar a URL e a KEY no db.js!");
}

window.db = new OrderDB();
