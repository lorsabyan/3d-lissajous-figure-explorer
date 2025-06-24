// Audio System for sonifying the Lissajous curves
export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = {};
        this.initialized = false;
    }    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if it's suspended (required for user interaction)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0; // Muted by default
            this.masterGain.connect(this.audioContext.destination);

            ['a', 'b', 'c'].forEach(key => {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(110, this.audioContext.currentTime);
                osc.connect(gainNode);
                gainNode.connect(this.masterGain);
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                osc.start();
                this.oscillators[key] = { osc, gainNode };
            });
            
            this.initialized = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.initialized = false;
        }
    }    updateParams(params) {
        if (!this.initialized || !this.audioContext) {
            console.warn('Audio system not initialized, skipping update');
            return;
        }
        
        try {
            const baseFreq = 110; // A2
            const now = this.audioContext.currentTime + 0.01; // Small delay to prevent clicking
            
            console.log('Updating audio params:', { a: params.a, b: params.b, c: params.c, A: params.A, B: params.B, C: params.C });
            
            this.oscillators.a.osc.frequency.linearRampToValueAtTime(baseFreq * params.a, now);
            this.oscillators.b.osc.frequency.linearRampToValueAtTime(baseFreq * params.b, now);
            if (params.c > 0) {
                this.oscillators.c.osc.frequency.linearRampToValueAtTime(baseFreq * params.c, now);
            }

            this.oscillators.a.gainNode.gain.linearRampToValueAtTime(params.A * 0.08, now);
            this.oscillators.b.gainNode.gain.linearRampToValueAtTime(params.B * 0.08, now);
            this.oscillators.c.gainNode.gain.linearRampToValueAtTime(params.c > 0 ? params.C * 0.08 : 0, now);
        } catch (error) {
            console.warn('Audio update failed:', error);
        }
    }

    setVolume(volume) {
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
        }
    }

    cleanup() {
        try {
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
        } catch (error) {
            console.warn('Audio cleanup error:', error);
        }
    }
}
