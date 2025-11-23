/**
 * Validation Utilities
 * 
 * Functions for validating user input and system configurations
 */

/**
 * Validate number in range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if valid
 */
export function validateNumber(value, min, max) {
    if (typeof value !== 'number' || !isFinite(value)) {
        return false;
    }
    return value >= min && value <= max;
}

/**
 * Validate system size
 * @param {number} n - System size
 * @returns {boolean} True if valid (2-20)
 */
export function validateSystemSize(n) {
    return validateNumber(n, 2, 20) && Number.isInteger(n);
}

/**
 * Validate matrix dimensions
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {boolean} True if dimensions match
 */
export function validateMatrixDimensions(A, b) {
    if (!Array.isArray(A) || !Array.isArray(b)) {
        return false;
    }
    
    const n = A.length;
    if (b.length !== n) {
        return false;
    }
    
    for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
            return false;
        }
    }
    
    return true;
}

/**
 * Sanitize user input
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim()
        .slice(0, 10000); // Limit length
}

