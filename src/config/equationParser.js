/**
 * Equation Parser
 * 
 * Functions for parsing equations from text input
 */

/**
 * Parse equations from text input
 * @param {string} text - Text containing equations
 * @returns {Object|null} Parsed system {n, A, b} or null if parsing fails
 */
export function parseEquations(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) {
        return null;
    }
    
    const equations = [];
    
    for (const line of lines) {
        const equation = parseEquation(line);
        if (equation) {
            equations.push(equation);
        } else {
            return null; // Return null if any equation fails to parse
        }
    }
    
    if (equations.length === 0) {
        return null;
    }
    
    // Determine system size from equations
    const n = equations.length;
    const maxVarIndex = Math.max(...equations.map(eq => 
        Math.max(...Object.keys(eq.coeffs).map(k => parseInt(k) || 0))
    ));
    
    // Use the larger of equation count or max variable index
    const systemSize = Math.max(n, maxVarIndex);
    
    // Build A and b matrices
    const A = [];
    const b = [];
    
    for (let i = 0; i < n; i++) {
        A[i] = new Array(systemSize).fill(0);
        b[i] = equations[i].b;
        
        // Fill coefficients
        Object.keys(equations[i].coeffs).forEach(varIndex => {
            const idx = parseInt(varIndex) - 1; // Convert x1 -> index 0
            if (idx >= 0 && idx < systemSize) {
                A[i][idx] = equations[i].coeffs[varIndex];
            }
        });
    }
    
    return { n: systemSize, A, b };
}

/**
 * Parse single equation from text
 * @param {string} equation - Equation string (e.g., "4x1 - x2 + x3 = 7")
 * @returns {Object|null} Parsed equation {coeffs: {1: 4, 2: -1, 3: 1}, b: 7} or null
 */
export function parseEquation(equation) {
    if (!equation || typeof equation !== 'string') {
        return null;
    }
    
    // Split by = sign
    const parts = equation.split('=');
    if (parts.length !== 2) {
        return null;
    }
    
    const leftSide = parts[0].trim();
    const rightSide = parts[1].trim();
    
    // Parse constant (right side)
    const b = parseFloat(rightSide);
    if (isNaN(b)) {
        return null;
    }
    
    // Parse coefficients from left side
    const coeffs = extractCoefficients(leftSide);
    
    return { coeffs, b };
}

/**
 * Extract coefficients from equation string
 * @param {string} equation - Equation left side (e.g., "4x1 - x2 + x3")
 * @returns {Object} Object with variable indices as keys and coefficients as values
 */
export function extractCoefficients(equation) {
    const coeffs = {};
    
    // Pattern to match: optional sign, optional number, variable name (x1, x2, a1, b2, etc.)
    // Matches: "4x1", "-x2", "+3a1", "x3", etc.
    const pattern = /([+-]?)(\d*\.?\d*)([a-z])(\d+)/gi;
    let match;
    
    while ((match = pattern.exec(equation)) !== null) {
        const sign = match[1] || '+';
        const number = match[2];
        const varName = match[3];
        const varIndex = parseInt(match[4]);
        
        if (varIndex > 0) {
            let coeff = 1;
            if (number) {
                coeff = parseFloat(number);
            }
            if (sign === '-') {
                coeff = -coeff;
            }
            
            // Accumulate coefficients for same variable
            if (coeffs[varIndex]) {
                coeffs[varIndex] += coeff;
            } else {
                coeffs[varIndex] = coeff;
            }
        }
    }
    
    return coeffs;
}

/**
 * Validate equation format
 * @param {string} equation - Equation string to validate
 * @returns {boolean} True if format is valid
 */
export function validateEquationFormat(equation) {
    if (!equation || typeof equation !== 'string') {
        return false;
    }
    
    // Check for = sign
    if (!equation.includes('=')) {
        return false;
    }
    
    // Try to parse
    const parsed = parseEquation(equation);
    return parsed !== null;
}

