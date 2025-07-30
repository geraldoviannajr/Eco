/**
 * Headphone Manager - Gerencia detecção de fones de ouvido
 */
class HeadphoneManager {
    constructor() {
        this.isHeadphoneConnected = false;
        this.callbacks = {
            onConnect: [],
            onDisconnect: []
        };
        
        this.init();
    }

    init() {
        // Aguarda o dispositivo estar pronto
        document.addEventListener('deviceready', () => {
            this.setupHeadphoneDetection();
        }, false);
    }

    setupHeadphoneDetection() {
        // Verifica se o plugin está disponível
        if (typeof HeadsetDetection !== 'undefined') {
            // Detecta fones conectados inicialmente
            this.detectCurrentHeadphones();
            
            // Registra eventos de mudança
            this.registerHeadphoneEvents();
        } else {
            console.warn('Plugin HeadsetDetection não encontrado');
            this.fallbackDetection();
        }
    }

    detectCurrentHeadphones() {
        HeadsetDetection.detect((devices) => {
            const wasConnected = this.isHeadphoneConnected;
            this.isHeadphoneConnected = devices.length > 0;
            
            console.log('Fones detectados:', devices);
            console.log('Fone conectado:', this.isHeadphoneConnected);
            
            // Notifica mudança se necessário
            if (wasConnected !== this.isHeadphoneConnected) {
                this.notifyHeadphoneChange();
            }
        });
    }

    registerHeadphoneEvents() {
        HeadsetDetection.registerRemoteEvents((devices) => {
            const wasConnected = this.isHeadphoneConnected;
            this.isHeadphoneConnected = devices.length > 0;
            
            console.log('Mudança de fone detectada:', this.isHeadphoneConnected);
            this.notifyHeadphoneChange();
        });
    }

    fallbackDetection() {
        // Fallback para navegadores sem o plugin
        console.log('Usando detecção fallback de fones');
        
        // Escuta mudanças de rota de áudio (se disponível)
        if (window.AudioContext || window.webkitAudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Tenta detectar mudanças de saída de áudio
            if (audioContext.destination && audioContext.destination.channelCount) {
                // Monitora mudanças de áudio
                this.monitorAudioChanges();
            }
        }
    }

    monitorAudioChanges() {
        // Implementação básica de monitoramento
        // Pode ser expandida conforme necessário
        setInterval(() => {
            // Verifica periodicamente se há mudanças
            // Esta é uma implementação simplificada
        }, 1000);
    }

    notifyHeadphoneChange() {
        if (this.isHeadphoneConnected) {
            console.log('🎧 Fone de ouvido conectado');
            this.callbacks.onConnect.forEach(callback => callback());
        } else {
            console.log('🔇 Fone de ouvido desconectado');
            this.callbacks.onDisconnect.forEach(callback => callback());
        }
    }

    // Métodos públicos para adicionar callbacks
    onConnect(callback) {
        this.callbacks.onConnect.push(callback);
    }

    onDisconnect(callback) {
        this.callbacks.onDisconnect.push(callback);
    }

    // Verifica se há fone conectado
    isConnected() {
        return this.isHeadphoneConnected;
    }

    // Força uma nova detecção
    refresh() {
        if (typeof HeadsetDetection !== 'undefined') {
            this.detectCurrentHeadphones();
        }
    }
}

// Exporta para uso global
window.HeadphoneManager = HeadphoneManager; 