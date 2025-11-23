/**
 * Gauss-Seidel Iteration Algorithm
 * 
 * Pure functions for Gauss-Seidel iteration method:
 * - Computing next iteration values (in-place updates)
 * - Generating Gauss-Seidel formulas
 * - Note: Uses validateDiagonalDominance from jacobi.js
 */

/**
 * Compute next Gauss-Seidel iteration values
 * @param {number[]} currentX - Current solution vector (modified in-place)
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {number[]} Updated solution vector (same reference as currentX)
 */
export function computeNextGaussSeidel(currentX, A, b) {
    const n = A.length;
    
    // Gauss-Seidel updates in-place, using already-computed values
    for (let i = 0; i < n; i++) {
        let sum = 0;
        
        // Sum for j < i: use new values (already computed in this iteration)
        for (let j = 0; j < i; j++) {
            sum += A[i][j] * currentX[j];
        }
        
        // Sum for j > i: use old values (not yet computed in this iteration)
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * currentX[j];
        }
        
        // Gauss-Seidel formula: x_i = (b_i - sum) / a_ii
        // Avoid division by zero
        if (Math.abs(A[i][i]) < 1e-10) {
            // Keep current value if diagonal is zero
        } else {
            const newValue = (b[i] - sum) / A[i][i];
            
            // Handle NaN and Infinity results
            if (isFinite(newValue)) {
                currentX[i] = newValue;
            }
            // Otherwise keep current value
        }
    }
    
    return currentX;
}

/**
 * Generate Gauss-Seidel update formulas for a given system
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @returns {string[]} Array of formula strings
 */
export function generateGaussSeidelFormulas(A, b) {
    const n = A.length;
    const formulas = [];
    
    for (let i = 0; i < n; i++) {
        if (Math.abs(A[i][i]) < 1e-10) {
            formulas.push(`x_${i+1} = x_${i+1} (diagonal too small)`);
            continue;
        }
        
        const terms = [];
        
        // Terms for j < i (use new values)
        for (let j = 0; j < i; j++) {
            if (Math.abs(A[i][j]) > 1e-10) {
                const coeff = A[i][j] / A[i][i];
                const sign = coeff >= 0 ? '+' : '-';
                const absCoeff = Math.abs(coeff);
                const valueLabel = Math.abs(absCoeff - 1) < 1e-10 
                    ? `x_${j+1}` 
                    : `${absCoeff.toFixed(2)}x_${j+1}`;
                terms.push(`${sign} ${valueLabel} (new)`);
            }
        }
        
        // Terms for j > i (use old values)
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[i][j]) > 1e-10) {
                const coeff = A[i][j] / A[i][i];
                const sign = coeff >= 0 ? '+' : '-';
                const absCoeff = Math.abs(coeff);
                const valueLabel = Math.abs(absCoeff - 1) < 1e-10 
                    ? `x_${j+1}` 
                    : `${absCoeff.toFixed(2)}x_${j+1}`;
                terms.push(`${sign} ${valueLabel} (old)`);
            }
        }
        
        const constant = b[i] / A[i][i];
        const formula = `x_${i+1} = ${constant.toFixed(2)} ${terms.join(' ')}`;
        formulas.push(formula);
    }
    
    return formulas;
}

