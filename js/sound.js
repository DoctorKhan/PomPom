/**
 * Sound functionality and audio management
 */

// --- Sound Functions ---
function playGong() {
    if (!window.isSoundEnabled) return;
    
    try {
        const ctx = window.audioCtx || window.PomPomSettings?.initAudioContext();
        if (!ctx) return;
        
        // Create a gong-like sound using Web Audio API
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Gong-like frequency sweep
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        oscillator.type = 'sine';
        
        // Gong-like envelope
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 2);
    } catch (e) {
        console.warn('Could not play gong sound:', e);
    }
}

function playDing() {
    if (!window.isSoundEnabled) return;
    
    try {
        const ctx = window.audioCtx || window.PomPomSettings?.initAudioContext();
        if (!ctx) return;
        
        // Create a ding sound
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn('Could not play ding sound:', e);
    }
}

function playMeetingRing() {
    if (!window.isSoundEnabled) return;
    
    try {
        const ctx = window.audioCtx || window.PomPomSettings?.initAudioContext();
        if (!ctx) return;
        
        // Create a phone ring-like sound
        const oscillator1 = ctx.createOscillator();
        const oscillator2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator1.frequency.value = 440;
        oscillator2.frequency.value = 480;
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        // Ring pattern
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.7);
        
        oscillator1.start(ctx.currentTime);
        oscillator2.start(ctx.currentTime);
        oscillator1.stop(ctx.currentTime + 1);
        oscillator2.stop(ctx.currentTime + 1);
    } catch (e) {
        console.warn('Could not play meeting ring sound:', e);
    }
}

// Make sound functions available globally
window.playGong = playGong;
window.playDing = playDing;
window.playMeetingRing = playMeetingRing;

// Export functions for use by other modules
window.PomPomSound = {
    playGong,
    playDing,
    playMeetingRing
};
