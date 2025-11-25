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
        this.distortionNode = null; // WaveShaperNode for distortion effect
        this.initialized = false;
        this.isLoading = false;
        
        // Free nature sound from open source platform
        // 
        // To add your own free nature sound:
        // 1. Download a free nature sound (forest, birds, water, etc.) from:
        //    - Mixkit: https://mixkit.co/free-sound-effects/nature/
        //    - Freesound: https://freesound.org (requires free account)
        //    - 99Sounds: https://99sounds.org/nature-sounds/
        // 2. Save it in the assets/ folder with one of these names:
        //    - nature-sound.mp3
        //    - nature-sound.ogg
        //    - nature-sound.wav
        //    - nature.mp3 (or .ogg, .wav)
        // 3. The audio system will automatically detect and use it
        // 
        // The nature sound will start heavily distorted (like static) and gradually
        // gain clarity as the equation converges (error decreases).
        
        // Try multiple possible file names and formats
        // Includes the audio file found in assets/audio/ directory
        this.natureSoundPaths = [
            'assets/audio/Computer-Math-That-Breaks-Everything.m4a', // Found in assets directory
            'assets/nature-sound.mp3',
            'assets/nature-sound.ogg',
            'assets/nature-sound.wav',
            'assets/nature-sound.m4a',
            'assets/nature.mp3',
            'assets/nature.ogg',
            'assets/nature.wav',
            'assets/nature.m4a',
            'assets/audio/nature-sound.mp3',
            'assets/audio/nature-sound.ogg',
            'assets/audio/nature-sound.wav',
            'assets/audio/nature-sound.m4a'
        ];
        
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
            
            // Create distortion node (WaveShaperNode) for nature sound
            this.distortionNode = this.audioContext.createWaveShaper();
            this.distortionNode.curve = this.makeDistortionCurve(0); // Start with no distortion
            this.distortionNode.oversample = '4x'; // Higher quality
            
            // Connect nodes: nature sound -> distortion -> nature gain -> master gain
            this.natureGain.connect(this.masterGain);
            this.distortionNode.connect(this.natureGain);
            this.noiseGain.connect(this.masterGain);
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
     * Create distortion curve for WaveShaperNode
     * Creates a static/distorted effect that simulates radio interference
     * Enhanced for heavier distortion at high amounts (>80%)
     * @param {number} amount - Distortion amount (0-100, where 0 = no distortion, 100 = maximum static)
     * @returns {Float32Array} Distortion curve
     */
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        // Convert amount (0-100) to a distortion factor
        // Higher amount = more distortion (static/crackling effect)
        const distortionFactor = amount / 100;
        const isHeavyDistortion = distortionFactor > 0.8; // >80% distortion
        
        // Use a seeded random for consistent static pattern (but still random-like)
        let seed = Math.floor(distortionFactor * 1000);
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            let y = x;
            
            if (distortionFactor > 0) {
                // Enhanced clipping distortion - more aggressive at high distortion
                let clipAmount;
                if (isHeavyDistortion) {
                    // Very aggressive clipping for heavy distortion (>80%)
                    clipAmount = 0.9 + (distortionFactor - 0.8) * 0.5; // 0.9 to 1.4
                } else {
                    clipAmount = distortionFactor * 0.9;
                }
                y = Math.max(-1, Math.min(1, y * (1 + clipAmount * 2.5)));
                
                // Enhanced bitcrushing - more severe at high distortion
                let bitDepth;
                if (isHeavyDistortion) {
                    // Very low bit depth for heavy distortion (2-4 bits)
                    bitDepth = Math.max(2, 4 - (distortionFactor - 0.8) * 10);
                } else {
                    bitDepth = Math.max(2, 16 - (distortionFactor * 12));
                }
                const step = Math.pow(2, bitDepth);
                y = Math.round(y * step) / step;
                
                // Enhanced waveshaping - more aggressive at high distortion
                let waveshapeAmount;
                if (isHeavyDistortion) {
                    waveshapeAmount = 0.5 + (distortionFactor - 0.8) * 0.5; // 0.5 to 0.6
                } else {
                    waveshapeAmount = distortionFactor * 0.5;
                }
                y = Math.max(-1, Math.min(1, y + Math.sin(y * Math.PI * 6) * waveshapeAmount));
                
                // Enhanced noise/static - much more at high distortion
                let noiseAmount;
                if (isHeavyDistortion) {
                    // Heavy static noise for barely audible effect
                    noiseAmount = 0.4 + (distortionFactor - 0.8) * 0.6; // 0.4 to 0.6
                } else {
                    noiseAmount = distortionFactor * 0.4;
                }
                y += (random() * 2 - 1) * noiseAmount;
                y = Math.max(-1, Math.min(1, y));
                
                // Additional harshness for heavy distortion - add more clipping
                if (isHeavyDistortion) {
                    y = Math.max(-1, Math.min(1, y * 1.2)); // Additional gain
                    // Add more quantization noise
                    const extraQuantization = Math.pow(2, Math.max(1, bitDepth - 1));
                    y = Math.round(y * extraQuantization) / extraQuantization;
                }
            }
            
            curve[i] = y;
        }
        
        return curve;
    }
    
    /**
     * Load nature sounds from local assets folder
     * Tries multiple file names and formats, then falls back to synthetic sounds
     */
    async loadNatureSounds() {
        // Try each possible file path
        for (const path of this.natureSoundPaths) {
            try {
                console.log(`Attempting to load nature sound from: ${path}`);
                const response = await fetch(path);
                
                if (!response.ok) {
                    // File doesn't exist, try next path
                    continue;
                }
                
                const arrayBuffer = await response.arrayBuffer();
                
                if (arrayBuffer.byteLength === 0) {
                    // Empty file, try next
                    continue;
                }
                
                this.natureBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                console.log(`Successfully loaded nature sound from: ${path}`);
                
                // Start the nature loop with distortion
                this.startNatureLoop();
                
                // Set initial distortion to maximum (static/distorted)
                this.updateDistortion(100);
                
                return; // Success, exit function
                
            } catch (error) {
                // If it's a decode error, the file exists but is invalid
                if (error.name === 'EncodingError' || error.name === 'NotSupportedError') {
                    console.warn(`File ${path} exists but could not be decoded:`, error);
                    // Continue to try other files
                } else if (error.message && error.message.includes('404')) {
                    // File not found, try next
                    continue;
                } else {
                    console.warn(`Failed to load from ${path}:`, error);
                    // Continue to next path
                }
            }
        }
        
        // If all paths failed, use synthetic fallback
        console.warn('No nature sound file found in assets folder. Tried:', this.natureSoundPaths);
        console.warn('Using synthetic nature sound fallback. To use a real file, add one of these to assets/:');
        console.warn('  - nature-sound.mp3 (or .ogg, .wav)');
        console.warn('  - nature.mp3 (or .ogg, .wav)');
        this.createSyntheticNatureSound();
    }
    
    /**
     * Create synthetic nature sounds as fallback
     */
    createSyntheticNatureSound() {
        if (!this.audioContext) return;
        
        // Create multiple oscillators for a more complex nature sound
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
        
        // Set initial distortion to maximum
        this.updateDistortion(100);
    }
    
    startNatureLoop() {
        if (!this.audioContext || !this.natureBuffer) return;
        
        if (this.natureLoop) {
            this.natureLoop.stop();
        }
        
        this.natureLoop = this.audioContext.createBufferSource();
        this.natureLoop.buffer = this.natureBuffer;
        this.natureLoop.loop = true;
        // Connect through distortion node instead of directly to natureGain
        this.natureLoop.connect(this.distortionNode);
        this.natureLoop.start(0);
    }
    
    /**
     * Update distortion amount (0-100, where 0 = clear, 100 = maximum static/distortion)
     * @param {number} amount - Distortion amount (0-100)
     */
    updateDistortion(amount) {
        if (!this.distortionNode) return;
        
        // Clamp amount to 0-100
        amount = Math.max(0, Math.min(100, amount));
        
        // Update the distortion curve
        this.distortionNode.curve = this.makeDistortionCurve(amount);
    }
    
    /**
     * Update audio mix based on convergence error
     * High error = more noise + distorted nature sound
     * Low error = clear nature sound, less noise
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
        
        // Non-linear distortion mapping using exponential curve
        // Stays very distorted for most of the process, then clears quickly near solution
        let noiseVolume, natureVolume, distortionAmount;
        
        if (maxError >= 1.0) {
            // High error: maximum distortion, barely audible nature sound
            noiseVolume = 1.0;
            distortionAmount = 100; // Maximum distortion (static)
            natureVolume = 0.1; // Barely audible when heavily distorted (matches continuous curve)
        } else if (maxError <= 0.0001) {
            // Converged: clear sound, full volume, continues playing
            // This state will persist - updateMix() continues to be called but maintains
            // these values, ensuring the clear nature sound keeps playing indefinitely
            noiseVolume = 0.0;
            distortionAmount = 0; // No distortion (clear)
            natureVolume = 1.0; // Full volume - natureLoop is set to loop=true
        } else {
            // Non-linear exponential mapping for distortion
            // Uses power curve: stays high for most errors, drops quickly near solution
            const normalizedError = Math.min(maxError / 1.0, 1.0);
            distortionAmount = 100 * Math.pow(normalizedError, 0.3); // Exponential decay
            
            // Noise volume: linear fade out as error decreases
            noiseVolume = normalizedError;
            
            // Nature volume: continuously increases as distortion decreases
            // Smooth curve from barely audible (0.1) at 100% distortion to full volume (1.0) at 0% distortion
            // Uses power curve for smooth, natural-sounding increase
            const distortionFactor = distortionAmount / 100; // 0 to 1
            const clarityFactor = 1 - distortionFactor; // 1 to 0 (inverse of distortion)
            // Power curve: starts slow, accelerates as clarity increases
            natureVolume = 0.1 + Math.pow(clarityFactor, 0.8) * 0.9; // 0.1 to 1.0
        }
        
        // Smooth crossfading (200ms ramp for smoother transitions)
        const now = this.audioContext.currentTime;
        const rampTime = 0.2;
        
        this.noiseGain.gain.setTargetAtTime(noiseVolume, now, rampTime);
        this.natureGain.gain.setTargetAtTime(natureVolume, now, rampTime);
        
        // Update distortion: non-linear clearing as error decreases
        this.updateDistortion(distortionAmount);
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

