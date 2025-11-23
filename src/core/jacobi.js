/**
 * Jacobi Iteration Algorithm
 * 
 * Pure functions for Jacobi iteration method:
 * - Computing next iteration values
 * - Generating Jacobi formulas
 * - Validating diagonal dominance
 */

/**
 * Compute next Jacobi iteration values
 * @param {number[]} currentX - Current solution vector
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {number[]} New solution vector
 */
export function computeNextJacobi(currentX, A, b) {
    const n = A.length;
    const newX = new Array(n);
    
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                sum += A[i][j] * currentX[j];
            }
        }
        // Jacobi formula: x_i = (b_i - sum_{j!=i} a_ij * x_j) / a_ii
        // Avoid division by zero
        if (Math.abs(A[i][i]) < 1e-10) {
            newX[i] = currentX[i]; // Keep current value if diagonal is zero
        } else {
            newX[i] = (b[i] - sum) / A[i][i];
        }
        
        // Handle NaN and Infinity results
        if (!isFinite(newX[i])) {
            newX[i] = currentX[i]; // Keep current value if result is invalid
        }
    }
    return newX;
}

/**
 * Generate Jacobi update formulas for a given system
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {string[]} Array of formula strings
 */
export function generateJacobiFormulas(A, b) {
    const n = A.length;
    const formulas = [];
    
    for (let i = 0; i < n; i++) {
        if (Math.abs(A[i][i]) < 1e-10) {
            formulas.push(`x_${i+1} = x_${i+1} (diagonal too small)`);
            continue;
        }
        
        const terms = [];
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.abs(A[i][j]) > 1e-10) {
                const coeff = A[i][j] / A[i][i];
                const sign = coeff >= 0 ? '+' : '-';
                const absCoeff = Math.abs(coeff);
                if (Math.abs(absCoeff - 1) < 1e-10) {
                    terms.push(`${sign} x_${j+1}`);
                } else {
                    terms.push(`${sign} ${absCoeff.toFixed(2)}x_${j+1}`);
                }
            }
        }
        
        const constant = b[i] / A[i][i];
        const formula = `x_${i+1} = ${constant.toFixed(2)} ${terms.join(' ')}`;
        formulas.push(formula);
    }
    
    return formulas;
}

/**
 * Validate if system is diagonally dominant
 * @param {number[][]} A - Coefficient matrix
 * @returns {boolean} True if diagonally dominant
 */
export function validateDiagonalDominance(A) {
    const n = A.length;
    
    for (let i = 0; i < n; i++) {
        let diagonal = Math.abs(A[i][i]);
        let rowSum = 0;
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                rowSum += Math.abs(A[i][j]);
            }
        }
        
        if (diagonal <= rowSum) {
            return false;
        }
    }
    
    return true;
}

