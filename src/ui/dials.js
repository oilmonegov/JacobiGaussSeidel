/**
 * Dial Controls and Indicators
 * 
 * Functions for updating tuning dial and power indicator
 */

/**
 * Update tuning dial pointer position
 * @param {HTMLElement} dialElement - Tuning dial element
 * @param {number} maxError - Maximum error
 */
export function updateTuningDial(dialElement, maxError) {
    if (!dialElement) return;
    
    // Map maxError to dial rotation
    // Error range: 0 (perfect) to ~10+ (very unbalanced)
    // Dial range: 0deg (Static) to 180deg (Clear)
    const normalized = Math.min(1, maxError / 10); // Normalize to 0-1
    const angle = normalized * 180; // Map to 0-180 degrees
    
    const pointer = dialElement.querySelector('.dial-pointer');
    if (pointer) {
        pointer.style.transform = `rotate(${angle}deg)`;
    }
}

/**
 * Update power indicator state
 * @param {HTMLElement} powerIndicator - Power indicator element
 * @param {boolean} isOn - Whether power is on
 */
export function updatePowerIndicator(powerIndicator, isOn) {
    if (!powerIndicator) return;
    
    if (isOn) {
        powerIndicator.classList.add('active');
    } else {
        powerIndicator.classList.remove('active');
    }
}

