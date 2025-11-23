/**
 * Audio system for Jacobi Iteration Equalizer
 * 
 * Manages all audio functionality including:
 * - White noise generation (for high error states)
 * - Nature sounds (for low error states)
 * - Dynamic crossfading based on convergence error
 * - UI feedback sounds (clicks, chimes)
 * - Volume and mute controls
 * 
 * Uses Web Audio API for dynamic audio generation and mixing.
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.noiseSource = null;
        this.natureSource = null;
        this.noiseGain = null;
        this.natureGain = null;
        this.masterGain = null;
        this.isMuted = true; // Audio off by default
        this.volume = 0.5; // 0-1 range
        this.natureBuffer = null;
        this.natureLoop = null;
        this.initialized = false;
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoadingIndicator();
            
            // Create AudioContext
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                console.warn('Web Audio API not supported');
                this.hideLoadingIndicator();
                return;
            }
            
            this.audioContext = new AudioContextClass();
            
            // Create gain nodes
            this.noiseGain = this.audioContext.createGain();
            this.natureGain = this.audioContext.createGain();
            this.masterGain = this.audioContext.createGain();
            
            // Connect nodes
            this.noiseGain.connect(this.masterGain);
            this.natureGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.noiseGain.gain.value = 0;
            this.natureGain.gain.value = 0;
            this.masterGain.gain.value = this.volume;
            
            // Only start audio sources if context is running
            // If suspended, sources will be created when context resumes
            if (this.audioContext.state === 'running') {
                // Generate noise
                this.generateNoise();
                
                // Load nature sounds (we'll generate synthetic nature sounds if files aren't available)
                await this.loadNatureSounds();
            } else {
                // Context is suspended, create sources but don't start them yet
                // They will be started when context resumes in updateMix
                await this.loadNatureSounds();
                // Don't start nature loop yet if context is suspended
                // Noise will be generated when context resumes
            }
            
            this.initialized = true;
            this.hideLoadingIndicator();
        } catch (error) {
            console.error('Audio initialization error:', error);
            this.hideLoadingIndicator();
        }
    }
    
    showLoadingIndicator() {
        this.isLoading = true;
        const audioControls = document.querySelector('.audio-controls');
        if (audioControls) {
            let loadingIndicator = document.getElementById('audioLoadingIndicator');
            if (!loadingIndicator) {
                loadingIndicator = document.createElement('div');
                loadingIndicator.id = 'audioLoadingIndicator';
                loadingIndicator.className = 'audio-loading-indicator';
                loadingIndicator.innerHTML = '<span class="loading-spinner"></span><span class="loading-text">Loading audio...</span>';
                audioControls.appendChild(loadingIndicator);
            }
            loadingIndicator.style.display = 'flex';
        }
    }
    
    hideLoadingIndicator() {
        this.isLoading = false;
        const loadingIndicator = document.getElementById('audioLoadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    generateNoise() {
        if (!this.audioContext) return;
        
        // Create buffer for white noise
        const bufferSize = 4096;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // White noise
        }
        
        // Create looped source
        this.noiseSource = this.audioContext.createBufferSource();
        this.noiseSource.buffer = buffer;
        this.noiseSource.loop = true;
        this.noiseSource.connect(this.noiseGain);
        this.noiseSource.start(0);
    }
    
    /**
     * Load nature sounds for low-error states
     * Currently generates synthetic nature sounds using Web Audio API
     * In production, could load actual audio files from assets/
     */
    async loadNatureSounds() {
        // For now, we'll generate synthetic nature sounds
        // In production, you would load actual audio files here
        try {
            // Create a pleasant nature-like sound using oscillators
            // This is a simplified version - in production, use actual audio files
            this.createSyntheticNatureSound();
        } catch (error) {
            console.warn('Could not load nature sounds:', error);
            this.hideLoadingIndicator();
        }
    }
    
    createSyntheticNatureSound() {
        if (!this.audioContext) return;
        
        // Create multiple oscillators for a more complex nature sound
        // This is a placeholder - real nature sounds would be better
        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a pleasant, nature-like sound (simplified)
        for (let i = 0; i < bufferSize; i++) {
            // Mix of low-frequency waves to simulate nature sounds
            const t = i / this.audioContext.sampleRate;
            data[i] = (
                Math.sin(2 * Math.PI * 200 * t) * 0.3 +
                Math.sin(2 * Math.PI * 300 * t) * 0.2 +
                Math.sin(2 * Math.PI * 400 * t) * 0.1 +
                (Math.random() * 0.1) // Add some randomness
            ) * 0.3;
        }
        
        this.natureBuffer = buffer;
        this.startNatureLoop();
    }
    
    startNatureLoop() {
        if (!this.audioContext || !this.natureBuffer) return;
        
        if (this.natureLoop) {
            this.natureLoop.stop();
        }
        
        this.natureLoop = this.audioContext.createBufferSource();
        this.natureLoop.buffer = this.natureBuffer;
        this.natureLoop.loop = true;
        this.natureLoop.connect(this.natureGain);
        this.natureLoop.start(0);
    }
    
    /**
     * Update audio mix based on convergence error
     * High error = more noise, low error = more nature sounds
     * @param {number} maxError - Maximum error across all equations
     */
    updateMix(maxError) {
        if (!this.initialized) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Could not resume audio context:', err);
            });
            // Return early - will be called again after context resumes
            return;
        }
        
        // Ensure audio sources exist and are playing
        if (!this.noiseSource) {
            this.generateNoise();
        }
        if (this.natureBuffer && !this.natureLoop) {
            this.startNatureLoop();
        }
        
        // Don't update mix if muted
        if (this.isMuted) return;
        
        // Map error to audio mix using linear mapping
        // When error is high (>1.0), noise dominates
        // When error is low (<0.1), nature sounds dominate
        let noiseVolume, natureVolume;
        
        if (maxError >= 1.0) {
            noiseVolume = 1.0;
            natureVolume = 0.0;
        } else if (maxError <= 0.0001) {
            noiseVolume = 0.0;
            natureVolume = 1.0;
        } else {
            // Linear interpolation
            noiseVolume = maxError / 1.0;
            natureVolume = 1.0 - noiseVolume;
        }
        
        // Smooth crossfading (100ms ramp)
        const now = this.audioContext.currentTime;
        const rampTime = 0.1;
        
        this.noiseGain.gain.setTargetAtTime(noiseVolume, now, rampTime);
        this.natureGain.gain.setTargetAtTime(natureVolume, now, rampTime);
    }
    
    setVolume(value) {
        // value is 0-100
        this.volume = value / 100;
        if (this.masterGain && this.audioContext) {
            // If not muted, update the gain directly
            // If muted, the gain is controlled by toggleMute
            if (!this.isMuted) {
                this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
            }
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (!this.audioContext || !this.masterGain) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Could not resume audio context:', err);
            });
        }
        
        if (this.isMuted) {
            // Smoothly fade out
            this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
        } else {
            // Smoothly fade in to current volume
            this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
        }
        
        // Update UI
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            const icon = muteBtn.querySelector('.speaker-icon');
            if (icon) {
                icon.textContent = this.isMuted ? '🔇' : '🔊';
            }
            muteBtn.classList.toggle('muted', this.isMuted);
            muteBtn.setAttribute('aria-pressed', this.isMuted.toString());
            muteBtn.setAttribute('aria-label', this.isMuted ? 'Unmute audio' : 'Mute audio');
        }
    }
    
    playKnobClick() {
        if (!this.audioContext || this.isMuted) return;
        
        // Create a short click sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    playButtonClick() {
        if (!this.audioContext || this.isMuted) return;
        
        // Create a button click sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.15 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playConvergenceChime() {
        if (!this.audioContext || this.isMuted) return;
        
        // Play a pleasant chime when converged
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = this.audioContext.currentTime + (index * 0.1);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2 * this.volume, startTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 1.0);
        });
    }
}

// Initialize audio system when page loads
let audioSystem = null;

function initAudio() {
    // Wait for user interaction before initializing audio (browser requirement)
    const initOnInteraction = () => {
        if (!audioSystem) {
            audioSystem = new AudioSystem();
            window.audioSystem = audioSystem;
            
            // Volume knob is handled in main.js
            // Mute can be toggled by clicking the volume knob
            
            // Set initial volume (default 50%)
            // The volume slider in main.js will update this when dragged
            audioSystem.setVolume(50); // Default
            
            // Note: Audio starts muted by default. User must interact with slider to unmute.
            // This is intentional to respect browser autoplay policies.
            
            // Add click sounds to buttons
            document.querySelectorAll('.control-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (audioSystem) {
                        audioSystem.playButtonClick();
                    }
                });
            });
        }
    };
    
    // Initialize on first user interaction
    ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, initOnInteraction, { once: true });
    });
}

// Start audio initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudio);
} else {
    initAudio();
}

