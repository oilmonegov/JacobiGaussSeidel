/**
 * Band Rendering and Visual Updates
 * 
 * Functions for rendering equalizer bands and updating their visual state
 */

import { equationToLaTeX, renderLaTeXWithKaTeX } from '../utils/formatting.js';

/**
 * Update band display with error data
 * @param {number} bandIndex - Band index (1-based)
 * @param {Object} errorData - Error data with lhs, rhs, error
 * @param {Object} elements - Elements object with band references
 * @param {Object} range - Range object with min, max, center
 */
export function updateBandDisplay(bandIndex, errorData, elements, range) {
    if (!errorData || typeof errorData !== 'object') {
        console.warn(`updateBandDisplay: Invalid errorData for band${bandIndex}`);
        return;
    }
    
    // Validate errorData structure
    if (typeof errorData.lhs !== 'number' || typeof errorData.rhs !== 'number' || typeof errorData.error !== 'number') {
        console.warn(`updateBandDisplay: Invalid errorData structure for band${bandIndex}`, errorData);
        return;
    }
    
    // Handle NaN and Infinity values
    if (!isFinite(errorData.lhs) || !isFinite(errorData.rhs) || !isFinite(errorData.error)) {
        console.warn(`updateBandDisplay: Non-finite values for band${bandIndex}`, errorData);
        return;
    }
    
    const absError = Math.abs(errorData.error);
    const band = elements[`band${bandIndex}`];
    const lhs = elements[`lhs${bandIndex}`];
    const error = elements[`error${bandIndex}`];
    const meter = elements[`meter${bandIndex}`];
    const target = elements[`target${bandIndex}`];
    const gainHandle = document.getElementById(`gainHandle${bandIndex}`);
    
    if (!band) return; // Element might not exist if not visible
    
    // Update text with equalizer terminology
    const dbValue = errorData.lhs.toFixed(2);
    if (lhs) lhs.textContent = `Output: ${dbValue} dB`;
    if (error) error.textContent = `Dev: ±${absError.toFixed(2)}`;
    if (target) target.textContent = `Target: ${errorData.rhs.toFixed(2)}`;
    
    // Update gain slider position
    const rangeSize = range.max - range.min;
    
    // Safety check: prevent division by zero
    if (rangeSize <= 0 || !isFinite(rangeSize)) {
        console.warn(`updateBandDisplay: Invalid range for band${bandIndex}`, range);
        return;
    }
    
    const normalizedValue = (errorData.lhs - range.min) / rangeSize; // Map from [min, max] to [0, 1]
    const sliderPosition = normalizedValue * 100; // Map to [0, 100]
    const clampedPosition = Math.max(0, Math.min(100, sliderPosition));
    
    if (gainHandle) {
        // Position handle vertically (inverted: top = 0% for max value, bottom = 100% for min value)
        const topPercent = 100 - clampedPosition;
        gainHandle.style.top = `${topPercent}%`;
        gainHandle.style.transform = 'translateX(-50%) translateY(-50%)';
    }
    
    // Update color coding
    band.classList.remove('error-high', 'error-medium', 'error-low');
    if (absError >= 1.0) {
        band.classList.add('error-high');
    } else if (absError >= 0.1) {
        band.classList.add('error-medium');
    } else {
        band.classList.add('error-low');
    }
    
    // Update VU meter (inverse relationship: higher error = lower needle)
    const meterPercent = Math.min(100, Math.max(0, 100 - (absError / 1.0) * 100));
    if (meter) meter.style.height = `${meterPercent}%`;
}

/**
 * Update band range for gain sliders
 * @param {Object} errors - Errors object from calculateErrors
 * @returns {Object} Range object with min, max, center
 */
export function updateBandRange(errors) {
    let minLHS = Infinity;
    let maxLHS = -Infinity;
    
    Object.keys(errors).forEach(key => {
        if (errors[key] && typeof errors[key].lhs === 'number' && isFinite(errors[key].lhs)) {
            minLHS = Math.min(minLHS, errors[key].lhs);
            maxLHS = Math.max(maxLHS, errors[key].lhs);
        }
    });
    
    // Default range if no valid values
    if (!isFinite(minLHS) || !isFinite(maxLHS)) {
        minLHS = -12;
        maxLHS = 12;
    }
    
    // Add padding
    const padding = Math.max(1, (maxLHS - minLHS) * 0.1);
    minLHS -= padding;
    maxLHS += padding;
    
    return {
        min: minLHS,
        max: maxLHS,
        center: (minLHS + maxLHS) / 2
    };
}

/**
 * Render bands dynamically
 * @param {number} n - System size
 * @param {number} visibleCount - Number of visible bands
 * @param {HTMLElement} container - Container element
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {Object} Elements object with band references
 */
export function renderBands(n, visibleCount, container, A, b) {
    if (!container) return {};
    
    container.innerHTML = '';
    const elements = {};
    
    const count = Math.min(n, visibleCount);
    
    // Frequencies for display
    const frequencies = ['60', '170', '310', '600', '1k', '3k', '6k', '12k', '14k', '16k'];
    
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const freq = frequencies[i % frequencies.length];
        
        // Construct equation string for tooltip
        let equationParts = [];
        for(let j=0; j<n; j++) {
            const coeff = A[i][j];
            if (coeff !== 0) {
                const sign = (coeff < 0) ? '-' : (equationParts.length > 0 ? '+' : '');
                const absCoeff = Math.abs(coeff);
                const val = absCoeff === 1 ? '' : absCoeff;
                equationParts.push(`${sign} ${val}x${j+1}`);
            }
        }
        const equationText = `${equationParts.join(' ')} = ${b[i]}`;
        
        const html = `
            <div class="band-display" id="band${id}" data-tooltip="Frequency Band ${id}: ${equationText}. Adjusts signal level at this frequency.">
                <div class="band-header">
                    <span class="band-label">Band ${id}</span>
                    <span class="frequency-label">${freq} Hz</span>
                    <span class="frequency-target" id="target${id}">Target: ${b[i].toFixed(2)}</span>
                </div>
                <div class="band-equation" id="bandEquation${id}"></div>
                <div class="band-controls">
                    <div class="gain-slider-container">
                        <div class="gain-scale">
                            <span class="gain-mark">+12</span>
                            <span class="gain-mark">0</span>
                            <span class="gain-mark">-12</span>
                        </div>
                        <div class="gain-slider-track">
                            <div class="gain-slider-handle" id="gainHandle${id}"></div>
                        </div>
                    </div>
                </div>
                <div class="band-details">
                    <span class="signal-level" id="lhs${id}">Output: 0.00 dB</span>
                    <span class="deviation" id="error${id}">Dev: ±0.00</span>
                </div>
                <div class="vu-meter">
                    <div class="vu-meter-scale">
                        <div class="vu-mark">0</div>
                        <div class="vu-mark">-3</div>
                        <div class="vu-mark">-6</div>
                        <div class="vu-mark">-12</div>
                    </div>
                    <div class="vu-meter-bar">
                        <div class="vu-needle" id="meter${id}"></div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        
        // Render equation with KaTeX after DOM insertion
        const bandElement = document.getElementById(`band${id}`);
        const equationContainer = document.getElementById(`bandEquation${id}`);
        if (equationContainer && typeof katex !== 'undefined') {
            const latex = equationToLaTeX(A[i], b[i], 'x');
            renderLaTeXWithKaTeX(latex, equationContainer, { displayMode: false });
        }
    }
    
    // Update elements references
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        elements[`band${id}`] = document.getElementById(`band${id}`);
        elements[`lhs${id}`] = document.getElementById(`lhs${id}`);
        elements[`error${id}`] = document.getElementById(`error${id}`);
        elements[`meter${id}`] = document.getElementById(`meter${id}`);
        elements[`target${id}`] = document.getElementById(`target${id}`);
        elements[`bandEquation${id}`] = document.getElementById(`bandEquation${id}`);
    }
    
    // Handle HK for bands
    if (n > visibleCount) {
        const hiddenCount = n - visibleCount;
        const hkHtml = `
            <div class="hk-indicator-band" style="text-align: center; padding: 10px; color: var(--dark-wood); font-family: var(--font-condensed);" data-tooltip="Hidden Bands: ${hiddenCount} more equations">
                <div style="font-size: 1.2rem; font-weight: bold;">+ ${hiddenCount} Hidden Bands</div>
                <div style="font-size: 0.8rem;">Checking internally...</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', hkHtml);
    }
    
    return elements;
}

