/**
 * Iteration Controls
 * 
 * Functions for controlling Jacobi iteration steps and autoplay
 */

import { computeNextJacobi } from '../core/jacobi.js';
import { clamp } from '../core/math.js';

/**
 * Perform one Jacobi iteration
 * @param {Object} state - Application state
 * @param {Function} updateDisplays - Function to update displays
 * @param {Function} showMessage - Function to show messages
 * @param {Function} animateKnobs - Function to animate knobs
 */
export function performIteration(state, updateDisplays, showMessage, animateKnobs) {
    const newX = computeNextJacobi(state.x, state.A, state.b);
    
    // Track if values were clamped
    let wasClamped = false;
    for (let val of newX) {
        if (val < -10 || val > 10) {
            wasClamped = true;
            break;
        }
    }
    
    // Clamp new values and update state
    for (let i = 0; i < state.n; i++) {
        state.x[i] = clamp(newX[i], -10, 10);
    }
    
    state.iteration++;
    
    // Show clamping message if needed (only once per clamping event)
    if (wasClamped && state.iteration % 10 === 0) {
        if (showMessage) {
            showMessage('Values out of range — clamped to [-10, 10]', 'warning');
        }
    }
    
    // Animate knobs smoothly
    if (animateKnobs) {
        animateKnobs();
    }
    
    // Update displays
    if (updateDisplays) {
        updateDisplays();
    }
}

/**
 * Start autoplay
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {Function} performIterationFn - Function to perform iteration
 * @returns {number|null} Interval ID or null
 */
export function startAutoplay(state, elements, performIterationFn) {
    if (state.isAutoPlaying) return null;
    
    state.isAutoPlaying = true;
    if (elements.autoplayBtn) {
        elements.autoplayBtn.textContent = '⏸ Pause';
        elements.autoplayBtn.classList.add('playing');
    }
    if (elements.powerIndicator) {
        elements.powerIndicator.classList.add('active');
    }
    if (elements.speakerGrille) {
        elements.speakerGrille.classList.add('pulse');
    }
    
    const delay = mapSpeedToDelay(state.speed);
    const intervalId = setInterval(() => {
        performIterationFn();
    }, delay);
    
    return intervalId;
}

/**
 * Stop autoplay
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {number|null} intervalId - Interval ID to clear
 */
export function stopAutoplay(state, elements, intervalId) {
    if (!state.isAutoPlaying) return;
    
    state.isAutoPlaying = false;
    if (intervalId) {
        clearInterval(intervalId);
    }
    if (elements.autoplayBtn) {
        elements.autoplayBtn.textContent = '▶ Play';
        elements.autoplayBtn.classList.remove('playing');
    }
    if (elements.powerIndicator) {
        elements.powerIndicator.classList.remove('active');
    }
    if (elements.speakerGrille) {
        elements.speakerGrille.classList.remove('pulse');
    }
}

/**
 * Toggle autoplay
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {Function} performIterationFn - Function to perform iteration
 * @param {number|null} intervalId - Current interval ID
 * @returns {number|null} New interval ID or null
 */
export function toggleAutoplay(state, elements, performIterationFn, intervalId) {
    if (state.isAutoPlaying) {
        stopAutoplay(state, elements, intervalId);
        return null;
    } else {
        return startAutoplay(state, elements, performIterationFn);
    }
}

/**
 * Map speed slider (1-100) to delay (2000ms to 100ms)
 * @param {number} speed - Speed value (1-100)
 * @returns {number} Delay in milliseconds
 */
export function mapSpeedToDelay(speed) {
    return 2000 - (speed - 1) * (1900 / 99);
}

/**
 * Update autoplay speed
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {number} speed - New speed value (1-100)
 * @param {number|null} currentIntervalId - Current interval ID
 * @param {Function} performIterationFn - Function to perform iteration
 * @returns {number|null} New interval ID or null
 */
export function setSpeed(state, elements, speed, currentIntervalId, performIterationFn) {
    state.speed = speed;
    
    // Update UI
    if (elements.speedSliderFill) {
        elements.speedSliderFill.style.width = `${speed}%`;
    }
    if (elements.speedValue) {
        elements.speedValue.textContent = speed;
    }
    
    // Restart autoplay with new speed if currently playing
    if (state.isAutoPlaying && currentIntervalId) {
        stopAutoplay(state, elements, currentIntervalId);
        return startAutoplay(state, elements, performIterationFn);
    }
    
    return currentIntervalId;
}

