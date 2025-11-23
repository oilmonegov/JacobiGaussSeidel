/**
 * Main Rendering Orchestrator
 * 
 * Coordinates all UI updates and rendering operations
 */

import { calculateErrors, getMaxError, getConvergenceState, clamp } from '../core/math.js';
import { updateKnobRotation, updateKnobValue } from './knobs.js';
import { updateBandDisplay, updateBandRange } from './bands.js';
import { updateVUMeter, updateSignalClarity, updateMasterLevel } from './meters.js';
import { updateTuningDial, updatePowerIndicator } from './dials.js';

/**
 * Update all displays
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements object
 */
export function updateAllDisplays(state, elements) {
    // Ensure state.x is properly initialized and sized
    if (!state.x || state.x.length !== state.n) {
        state.x = new Array(state.n).fill(0);
    }
    
    // Clamp values
    for(let i = 0; i < state.n; i++) {
        state.x[i] = clamp(state.x[i], -10, 10);
    }
    
    // Update knob values and rotations for visible knobs
    const count = Math.min(state.n, state.visibleKnobs);
    for(let i = 0; i < count; i++) {
        const id = i + 1;
        if (elements[`value${id}`]) {
            updateKnobValue(elements[`value${id}`], state.x[i]);
        }
        if (elements[`knob${id}`]) {
            elements[`knob${id}`].setAttribute('aria-valuenow', state.x[i].toFixed(2));
            updateKnobRotation(elements[`knob${id}`], state.x[i]);
        }
    }
    
    // Update HK tooltip if exists
    const hkIndicator = document.querySelector('.hk-indicator');
    if (hkIndicator && state.n > state.visibleKnobs) {
        const hiddenCount = state.n - state.visibleKnobs;
        let hiddenSummary = `Hidden Knobs (${hiddenCount}):\n`;
        for(let i = state.visibleKnobs; i < state.n; i++) {
            hiddenSummary += `x${i+1}: ${state.x[i].toFixed(2)}\n`;
        }
        hkIndicator.setAttribute('data-tooltip', hiddenSummary);
    }
    
    // Calculate errors
    const errors = calculateErrors(state.x, state.A, state.b);
    const maxError = getMaxError(errors);
    const convergence = getConvergenceState(maxError);
    
    // Update dynamic range based on current LHS values
    const range = updateBandRange(errors);
    state.bandRangeMin = range.min;
    state.bandRangeMax = range.max;
    state.bandRangeCenter = range.center;
    
    // Update equation displays
    const bandCount = Math.min(state.n, state.visibleBands);
    for(let i = 0; i < bandCount; i++) {
        updateBandDisplay(i + 1, errors[`eq${i + 1}`], elements, range);
    }
    
    // Update HK tooltip for bands
    const hkIndicatorBand = document.querySelector('.hk-indicator-band');
    if (hkIndicatorBand && state.n > state.visibleBands) {
         const hiddenCount = state.n - state.visibleBands;
         let hiddenSummary = `Hidden Bands (${hiddenCount}):\n`;
         for(let i = state.visibleBands; i < state.n; i++) {
             const err = errors[`eq${i+1}`];
             if (err) {
                 hiddenSummary += `Band ${i+1}: Dev ±${Math.abs(err.error).toFixed(2)}\n`;
             }
         }
         hkIndicatorBand.setAttribute('data-tooltip', hiddenSummary);
    }
    
    // Update signal clarity display
    updateSignalClarity(elements, state.iteration, maxError, convergence);
    
    // Update master level meter
    updateMasterLevel(elements.masterMeterFill, maxError);
    
    // Update tuning dial
    updateTuningDial(elements.tuningDial, maxError);
    
    // Update power indicator
    updatePowerIndicator(elements.powerIndicator, state.isAutoPlaying);
}

/**
 * Initialize UI
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements object
 */
export function initializeUI(state, elements) {
    // Initial UI setup
    // This will be called after initial state is set
    updateAllDisplays(state, elements);
}

