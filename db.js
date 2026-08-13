// Mock Real-time Database using LocalStorage & BroadcastChannel
class RealTimeDB {
    constructor() {
        this.channel = new BroadcastChannel('telecom_inventory_sync');
        this.listeners = [];
        this.items = this.loadItems();

        this.channel.onmessage = (event) => {
            if (event.data.type === 'SYNC') {
                this.items = event.data.payload;
                this.notify();
            }
        };
    }

    loadItems() {
        const stored = localStorage.getItem('inventory_items');
        if (stored) {
            return JSON.parse(stored);
        }
        // Default mock data
        const defaultData = [
            { id: 1, name: 'Roteador Wi-Fi 6', category: 'Equipamento', quantity: 45, minQuantity: 10, updatedBy: 'Admin' },
            { id: 2, name: 'Cabo de Fibra Óptica (m)', category: 'Cabeamento', quantity: 1200, minQuantity: 500, updatedBy: 'Admin' },
            { id: 3, name: 'Modem ONT GPON', category: 'Equipamento', quantity: 5, minQuantity: 20, updatedBy: 'Admin' },
            { id: 4, name: 'Conector APC', category: 'Acessório', quantity: 300, minQuantity: 100, updatedBy: 'Admin' }
        ];
        this.saveItems(defaultData, false);
        return defaultData;
    }

    saveItems(data, sync = true) {
        localStorage.setItem('inventory_items', JSON.stringify(data));
        this.items = data;
        if (sync) {
            this.channel.postMessage({ type: 'SYNC', payload: this.items });
            this.notify();
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.items); // initial call
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(cb => cb(this.items));
    }

    addItem(item) {
        item.id = Date.now();
        const newItems = [...this.items, item];
        this.saveItems(newItems);
    }

    updateItem(id, updates) {
        const newItems = this.items.map(i => i.id === id ? { ...i, ...updates } : i);
        this.saveItems(newItems);
    }

    deleteItem(id) {
        const newItems = this.items.filter(i => i.id !== id);
        this.saveItems(newItems);
    }
}

window.db = new RealTimeDB();
