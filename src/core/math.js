/**
 * Math utilities for Jacobi Iteration Equalizer
 * 
 * Pure functions for mathematical operations:
 * - Error calculations
 * - Convergence state determination
 * - Value clamping and rounding
 */

/**
 * Calculate equation errors for a given system
 * @param {number[]} currentX - Current solution vector
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {Object} Errors object with keys eq1, eq2, etc.
 */
export function calculateErrors(currentX, A, b) {
    const errors = {};
    const n = A.length;
    
    for (let i = 0; i < n; i++) {
        let lhs = 0;
        for (let j = 0; j < n; j++) {
            lhs += A[i][j] * currentX[j];
        }
        const rhs = b[i];
        const error = lhs - rhs;
        
        // Map to eq1, eq2, eq3... for display
        errors[`eq${i+1}`] = { lhs, rhs, error };
    }
    
    return errors;
}

/**
 * Get maximum absolute error from errors object
 * @param {Object} errors - Errors object from calculateErrors
 * @returns {number} Maximum absolute error
 */
export function getMaxError(errors) {
    let maxErr = 0;
    // Iterate through keys to handle dynamic number of equations
    Object.keys(errors).forEach(key => {
        if (errors[key] && typeof errors[key].error === 'number') {
            maxErr = Math.max(maxErr, Math.abs(errors[key].error));
        }
    });
    return maxErr;
}

/**
 * Get convergence state based on maximum error
 * @param {number} maxError - Maximum absolute error
 * @returns {Object} State object with state string and color
 */
export function getConvergenceState(maxError) {
    if (maxError < 0.0001) {
        return { state: 'Perfectly Balanced', color: 'var(--vintage-green)' };
    } else if (maxError < 0.1) {
        return { state: 'Nearly Balanced', color: 'var(--vintage-green)' };
    } else if (maxError < 1.0) {
        return { state: 'Balancing', color: 'var(--amber)' };
    } else {
        return { state: 'Unbalanced', color: 'var(--red)' };
    }
}

/**
 * Clamp a value to a specified range and handle invalid numbers
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value, or 0 if invalid
 */
export function clamp(value, min, max) {
    if (isNaN(value) || !isFinite(value)) {
        return 0;
    }
    return Math.max(min, Math.min(max, value));
}

/**
 * Round a value to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundToDecimal(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

