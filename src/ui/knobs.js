/**
 * Knob Rendering and Visual Updates
 * 
 * Functions for rendering knobs and updating their visual state
 */

/**
 * Update knob visual rotation
 * @param {HTMLElement} knob - Knob element
 * @param {number} value - Current value (-10 to 10)
 * @param {boolean} immediate - Whether to disable transitions
 */
export function updateKnobRotation(knob, value, immediate = false) {
    // Map value from [-10, 10] to rotation angle [-135, 135] degrees
    const normalized = (value + 10) / 20; // 0 to 1
    const angle = normalized * 270 - 135; // -135 to 135 degrees
    
    // Disable transitions during dragging for immediate response
    if (immediate) {
        knob.style.transition = 'none';
    }
    
    knob.style.transform = `rotate(${angle}deg)`;
    
    // Re-enable transitions after a brief moment if not dragging
    if (immediate) {
        requestAnimationFrame(() => {
            // Check if still dragging (will be set by caller)
            knob.style.transition = '';
        });
    }
}

/**
 * Update knob value display
 * @param {HTMLElement} valueElement - Value display element
 * @param {number} value - Value to display
 */
export function updateKnobValue(valueElement, value) {
    if (valueElement) {
        valueElement.textContent = value.toFixed(2);
    }
}

/**
 * Render knobs dynamically
 * @param {number} n - System size
 * @param {number} visibleCount - Number of visible knobs
 * @param {HTMLElement} container - Container element
 * @param {number[]} x - Current values
 * @returns {Object} Elements object with knob references
 */
export function renderKnobs(n, visibleCount, container, x) {
    if (!container) return {};
    
    container.innerHTML = '';
    const elements = {};
    
    const count = Math.min(n, visibleCount);
    
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const html = `
            <div class="knob-wrapper" data-tooltip="Drag vertically or horizontally to adjust x${id}. Click to focus, then use arrow keys or +/- for precise control. Hold Shift for fine adjustments.">
                <div class="knob" id="knob${id}" data-variable="x${id}">
                    <div class="knob-pointer"></div>
                    <div class="knob-ridges"></div>
                </div>
                <div class="knob-label">x${id}</div>
                <div class="knob-value" id="value${id}">${x && i < x.length ? x[i].toFixed(2) : '0.00'}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    }
    
    // Update elements references for easy access
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        elements[`knob${id}`] = document.getElementById(`knob${id}`);
        elements[`value${id}`] = document.getElementById(`value${id}`);
    }
    
    // Handle HK (Hidden Knobs)
    if (n > visibleCount) {
        const hiddenCount = n - visibleCount;
        let hiddenSummary = '';
        for(let i = visibleCount; i < n; i++) {
            if (x && i < x.length && typeof x[i] === 'number') {
                hiddenSummary += `x${i+1}: ${x[i].toFixed(2)}\n`;
            } else {
                hiddenSummary += `x${i+1}: 0.00\n`;
            }
        }
        
        const hkHtml = `
            <div class="hk-indicator knob-wrapper" data-tooltip="Hidden Knobs (${hiddenCount}):\n${hiddenSummary}">
                <div class="hk-circle">
                    <span>HK</span>
                    <span class="hk-count">${hiddenCount}</span>
                </div>
                <div class="knob-label">More</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', hkHtml);
    }
    
    return elements;
}

