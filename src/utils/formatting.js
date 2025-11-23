/**
 * Formatting Utilities
 * 
 * Functions for formatting numbers, errors, equations, and solutions
 */

/**
 * Format number with specified decimal places
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2) {
    if (typeof value !== 'number' || !isFinite(value)) {
        return '0.00';
    }
    return value.toFixed(decimals);
}

/**
 * Format error display
 * @param {number} error - Error value
 * @returns {string} Formatted error string
 */
export function formatError(error) {
    const absError = Math.abs(error);
    return `±${formatNumber(absError, 2)}`;
}

/**
 * Format equation for display
 * @param {number[]} coefficients - Array of coefficients
 * @param {number} constant - Constant term
 * @param {string} variablePrefix - Variable prefix (default: 'x')
 * @returns {string} Formatted equation string
 */
export function formatEquation(coefficients, constant, variablePrefix = 'x') {
    const terms = [];
    
    for (let i = 0; i < coefficients.length; i++) {
        const coeff = coefficients[i];
        if (coeff !== 0) {
            const sign = coeff < 0 ? '-' : (terms.length > 0 ? '+' : '');
            const absCoeff = Math.abs(coeff);
            const varName = `${variablePrefix}${i + 1}`;
            
            if (absCoeff === 1) {
                terms.push(`${sign} ${varName}`);
            } else {
                terms.push(`${sign} ${absCoeff}${varName}`);
            }
        }
    }
    
    return `${terms.join(' ')} = ${constant}`;
}

/**
 * Format solution for display
 * @param {number[]} solution - Solution vector
 * @returns {string} Formatted solution string
 */
export function formatSolution(solution) {
    if (!Array.isArray(solution)) {
        return '';
    }
    
    return solution.map((val, i) => `x${i + 1} = ${formatNumber(val, 2)}`).join(', ');
}

/**
 * Convert equation to LaTeX format
 * @param {number[]} coefficients - Array of coefficients
 * @param {number} constant - Constant term
 * @param {string} variablePrefix - Variable prefix (default: 'x')
 * @returns {string} LaTeX equation string
 */
export function equationToLaTeX(coefficients, constant, variablePrefix = 'x') {
    let equationLatex = '';
    let hasTerms = false;
    
    for (let i = 0; i < coefficients.length; i++) {
        const coeff = coefficients[i];
        if (coeff !== 0) {
            hasTerms = true;
            const isFirst = equationLatex === '';
            const absCoeff = Math.abs(coeff);
            const sign = coeff < 0 ? '-' : (isFirst ? '' : '+');
            const varName = `${variablePrefix}_{${i + 1}}`;
            
            if (absCoeff === 1) {
                equationLatex += `${sign}${varName}`;
            } else {
                equationLatex += `${sign}${absCoeff}${varName}`;
            }
        }
    }
    
    if (!hasTerms) {
        equationLatex = '0';
    }
    
    return `${equationLatex} = ${constant}`;
}

/**
 * Render equation with KaTeX
 * @param {number[]} coefficients - Array of coefficients
 * @param {number} constant - Constant term
 * @param {HTMLElement} container - Container element to render into
 * @param {Object} options - Rendering options {displayMode, variablePrefix}
 * @returns {HTMLElement|null} Created element or null if KaTeX not available
 */
export function renderEquationWithKaTeX(coefficients, constant, container, options = {}) {
    if (typeof katex === 'undefined') {
        console.warn('KaTeX not available');
        return null;
    }
    
    if (!container) {
        console.warn('Container element not provided');
        return null;
    }
    
    const {
        displayMode = false,
        variablePrefix = 'x'
    } = options;
    
    const latex = equationToLaTeX(coefficients, constant, variablePrefix);
    
    try {
        const equationHTML = katex.renderToString(latex, {
            throwOnError: false,
            displayMode,
            output: 'html'
        });
        
        const eqDiv = document.createElement('div');
        eqDiv.className = 'katex-equation';
        if (displayMode) {
            eqDiv.style.marginBottom = '10px';
        }
        eqDiv.innerHTML = equationHTML;
        container.appendChild(eqDiv);
        
        return eqDiv;
    } catch (e) {
        console.warn('KaTeX rendering error:', e);
        const eqDiv = document.createElement('div');
        eqDiv.textContent = latex;
        container.appendChild(eqDiv);
        return eqDiv;
    }
}

/**
 * Render equation string with KaTeX (from LaTeX string)
 * @param {string} latex - LaTeX equation string
 * @param {HTMLElement} container - Container element to render into
 * @param {Object} options - Rendering options {displayMode}
 * @returns {HTMLElement|null} Created element or null if KaTeX not available
 */
export function renderLaTeXWithKaTeX(latex, container, options = {}) {
    if (typeof katex === 'undefined') {
        console.warn('KaTeX not available');
        return null;
    }
    
    if (!container) {
        console.warn('Container element not provided');
        return null;
    }
    
    const { displayMode = false } = options;
    
    try {
        const equationHTML = katex.renderToString(latex, {
            throwOnError: false,
            displayMode,
            output: 'html'
        });
        
        const eqDiv = document.createElement('div');
        eqDiv.className = 'katex-equation';
        if (displayMode) {
            eqDiv.style.marginBottom = '10px';
        }
        eqDiv.innerHTML = equationHTML;
        container.appendChild(eqDiv);
        
        return eqDiv;
    } catch (e) {
        console.warn('KaTeX rendering error:', e);
        const eqDiv = document.createElement('div');
        eqDiv.textContent = latex;
        container.appendChild(eqDiv);
        return eqDiv;
    }
}

