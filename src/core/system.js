/**
 * System Configuration and Validation
 * 
 * Functions for creating, validating, and managing linear equation systems
 */

/**
 * Get default 3x3 system
 * @returns {Object} System object with A, b, and initialX
 */
export function getDefaultSystem() {
    return {
        A: [
            [4, -1, 1],
            [4, -8, 1],
            [-2, 1, 5]
        ],
        b: [7, -21, 15],
        initialX: [1.0, 2.0, 2.0],
        n: 3
    };
}

/**
 * Create a system configuration object
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number[]} initialX - Initial guess vector
 * @returns {Object} System configuration object
 */
export function createSystem(A, b, initialX = null) {
    const n = A.length;
    const defaultInitialX = new Array(n).fill(0);
    
    return {
        A,
        b,
        initialX: initialX || defaultInitialX,
        n
    };
}

/**
 * Validate system configuration
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {Object} Validation result with isValid and message
 */
export function validateSystem(A, b) {
    // Check if A is a valid matrix
    if (!Array.isArray(A) || A.length === 0) {
        return { isValid: false, message: 'Matrix A must be a non-empty array' };
    }
    
    const n = A.length;
    
    // Check if A is square
    for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
            return { isValid: false, message: `Row ${i+1} of matrix A must have ${n} elements` };
        }
    }
    
    // Check if b has correct length
    if (!Array.isArray(b) || b.length !== n) {
        return { isValid: false, message: `Vector b must have ${n} elements` };
    }
    
    // Check for zero diagonals
    for (let i = 0; i < n; i++) {
        if (Math.abs(A[i][i]) < 1e-10) {
            return { 
                isValid: false, 
                message: `Diagonal element A[${i+1}][${i+1}] is too close to zero. Jacobi method requires non-zero diagonal elements.` 
            };
        }
    }
    
    return { isValid: true, message: 'System is valid' };
}

/**
 * Parse system from text equations
 * @param {string} text - Text containing equations
 * @returns {Object|null} System object or null if parsing fails
 */
export function parseSystemFromText(text) {
    // This is a placeholder - actual implementation will be in config/equationParser.js
    // Keeping here for API consistency
    return null;
}

/**
 * Parse system from matrix data
 * @param {Object} matrixData - Matrix data object
 * @returns {Object|null} System object or null if parsing fails
 */
export function parseSystemFromMatrix(matrixData) {
    // This is a placeholder - actual implementation will be in config/matrixEditor.js
    // Keeping here for API consistency
    return null;
}

