/**
 * VU Meters and Signal Displays
 * 
 * Functions for updating VU meters, signal clarity, and master level displays
 */

/**
 * Update VU meter needle position
 * @param {HTMLElement} meterElement - Meter element
 * @param {number} error - Absolute error value
 */
export function updateVUMeter(meterElement, error) {
    if (!meterElement) return;
    
    // Update VU meter (inverse relationship: higher error = lower needle)
    const meterPercent = Math.min(100, Math.max(0, 100 - (error / 1.0) * 100));
    meterElement.style.height = `${meterPercent}%`;
}

/**
 * Update signal clarity display
 * @param {Object} elements - Elements object
 * @param {number} iteration - Current iteration count
 * @param {number} maxError - Maximum error
 * @param {Object} convergence - Convergence state object
 */
export function updateSignalClarity(elements, iteration, maxError, convergence) {
    if (elements.iterationCount) {
        elements.iterationCount.textContent = iteration;
    }
    if (elements.maxError) {
        elements.maxError.textContent = maxError.toFixed(4);
    }
    if (elements.convergenceStatus) {
        elements.convergenceStatus.textContent = convergence.state;
        elements.convergenceStatus.style.color = convergence.color;
    }
    
    // Update signal clarity display border
    if (elements.signalClarityDisplay) {
        if (maxError < 0.0001) {
            elements.signalClarityDisplay.classList.add('balanced');
        } else {
            elements.signalClarityDisplay.classList.remove('balanced');
        }
    }
}

/**
 * Update master level meter
 * @param {HTMLElement} meterFill - Master meter fill element
 * @param {number} maxError - Maximum error
 */
export function updateMasterLevel(meterFill, maxError) {
    if (!meterFill) return;
    
    const meterPercent = Math.min(100, Math.max(0, 100 - (maxError / 1.0) * 100));
    meterFill.style.width = `${meterPercent}%`;
}

