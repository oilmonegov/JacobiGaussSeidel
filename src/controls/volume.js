/**
 * Volume Control
 * 
 * Functions for handling volume slider interactions
 */

/**
 * Update volume slider visual position
 * @param {HTMLElement} thumb - Slider thumb element
 * @param {HTMLElement} fill - Slider fill element
 * @param {number} volume - Volume value (0-100)
 * @param {boolean} immediate - Whether to disable transitions
 */
export function updateVolumeSlider(thumb, fill, volume, immediate = false) {
    if (!thumb || !fill) return;
    
    const percentage = volume;
    
    // Disable transitions during dragging for immediate response
    if (immediate) {
        thumb.style.transition = 'none';
        fill.style.transition = 'none';
    }
    
    thumb.style.left = `${percentage}%`;
    fill.style.width = `${percentage}%`;
    
    // Re-enable transitions after a brief moment if not dragging
    if (immediate) {
        requestAnimationFrame(() => {
            thumb.style.transition = '';
            fill.style.transition = '';
        });
    }
}

/**
 * Set volume from user input
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {number} volume - New volume value (0-100)
 */
export function setVolume(state, elements, volume) {
    state.volume = Math.max(0, Math.min(100, volume));
    
    // Update visual slider
    updateVolumeSlider(elements.volumeSliderThumb, elements.volumeSliderFill, state.volume, true);
    
    // Update audio system
    if (window.audioSystem) {
        window.audioSystem.setVolume(state.volume);
        
        // Unmute if volume is increased from 0, or mute if set to 0
        if (state.volume > 0 && window.audioSystem.isMuted) {
            window.audioSystem.toggleMute(); // This will unmute
        } else if (state.volume === 0 && !window.audioSystem.isMuted) {
            window.audioSystem.toggleMute(); // This will mute
        }
        
        // Resume audio context if suspended (browser autoplay policy)
        if (window.audioSystem.audioContext && window.audioSystem.audioContext.state === 'suspended') {
            window.audioSystem.audioContext.resume();
        }
    }
}

