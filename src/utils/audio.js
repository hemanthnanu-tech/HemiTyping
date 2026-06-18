let globalAudioCtx = null;

export const playSound = (type, profile = 'mechanical') => {
    if (!globalAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) globalAudioCtx = new AudioContext();
    }
    
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
    }

    if (!globalAudioCtx) return;

    const ctx = globalAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Add lowpass filter for 'thock'
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;

    if (type === 'click') {
        if (profile === 'thock') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else {
            // Mechanical
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.15);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'finish') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.2);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 1);
        osc.start(now);
        osc.stop(now + 1);
    }
};
