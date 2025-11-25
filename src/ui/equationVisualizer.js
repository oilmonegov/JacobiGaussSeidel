/**
 * Equation Visualizer Module
 * 
 * Displays iteration history with original equations and Jacobi update formulas.
 * Shows how equations evolve through iterations with actual numeric substitutions.
 */

import { renderLaTeXWithKaTeX } from '../utils/formatting.js';

// Maximum number of iterations to keep in history
const MAX_HISTORY_ITEMS = 50;

/**
 * Add iteration snapshot to history
 * @param {Array} equationHistory - History array to add to
 * @param {number} iteration - Iteration number
 * @param {number[]} x - Current x values (will be deep copied)
 * @param {number[][]} A - Coefficient matrix (will be deep copied)
 */
export function addIterationSnapshot(equationHistory, iteration, x, A) {
    if (!Array.isArray(equationHistory)) {
        console.warn('equationHistory must be an array');
        return;
    }
    
    if (!Array.isArray(x)) {
        console.warn('x must be an array');
        return;
    }
    
    // Deep copy x array
    const xCopy = [...x];
    
    // Deep copy A matrix
    const ACopy = A ? A.map(row => [...row]) : null;
    
    // Create snapshot object
    const snapshot = {
        iteration: iteration,
        x: xCopy,
        A: ACopy
    };
    
    // Add to history
    equationHistory.push(snapshot);
    
    // Enforce limit: remove oldest if exceeded
    if (equationHistory.length > MAX_HISTORY_ITEMS) {
        equationHistory.shift(); // Remove first (oldest) entry
    }
}

/**
 * Clear equation history
 * @param {Array} equationHistory - History array to clear
 */
export function clearEquationHistory(equationHistory) {
    if (!Array.isArray(equationHistory)) {
        console.warn('equationHistory must be an array');
        return;
    }
    
    // Clear array while maintaining reference
    equationHistory.length = 0;
}

/**
 * Generate LaTeX strings for original equations with evaluation
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number[]} x - Current x values
 * @param {number} n - System size
 * @returns {string[]} Array of LaTeX strings
 */
export function generateOriginalEquations(A, b, x, n) {
    if (!A || !b || !x || n <= 0) {
        return [];
    }
    
    const equations = [];
    
    for (let i = 0; i < n; i++) {
        // Build LaTeX equation: a₁x₁ + a₂x₂ + ... = b
        let equationLatex = '';
        let hasTerms = false;
        let lhsValue = 0;
        
        for (let j = 0; j < n; j++) {
            const coeff = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
            if (coeff !== 0) {
                hasTerms = true;
                const isFirst = equationLatex === '';
                const absCoeff = Math.abs(coeff);
                const sign = coeff < 0 ? '-' : (isFirst ? '' : '+');
                const varName = `x_{${j + 1}}`;
                
                // Calculate LHS contribution
                const xVal = x[j] !== undefined ? x[j] : 0;
                lhsValue += coeff * xVal;
                
                if (Math.abs(absCoeff - 1) < 1e-10) {
                    equationLatex += `${sign}${varName}`;
                } else {
                    equationLatex += `${sign}${absCoeff}${varName}`;
                }
            }
        }
        
        if (!hasTerms) {
            equationLatex = '0';
        }
        
        const bVal = b[i] !== undefined ? b[i] : 0;
        const fullEquationLatex = `${equationLatex} = ${bVal}`;
        
        // Add evaluation line: LHS = {computed} = {target}
        const computedStr = lhsValue.toFixed(4);
        const targetStr = bVal.toFixed(4);
        const evaluationLatex = `\\text{LHS} = ${computedStr} = ${targetStr}`;
        
        equations.push({
            equation: fullEquationLatex,
            evaluation: evaluationLatex
        });
    }
    
    return equations;
}

/**
 * Generate LaTeX string for matrix form A·x = b
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number} n - System size
 * @returns {string} LaTeX string for matrix equation
 */
export function generateMatrixForm(A, b, n) {
    if (!A || !b || n <= 0) {
        return '';
    }
    
    // Build matrix A LaTeX
    let matrixALatex = '\\begin{pmatrix}';
    for (let i = 0; i < n; i++) {
        let row = '';
        for (let j = 0; j < n; j++) {
            const val = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
            if (j > 0) row += ' & ';
            row += val;
        }
        if (i < n - 1) row += ' \\\\';
        matrixALatex += row;
    }
    matrixALatex += '\\end{pmatrix}';
    
    // Build vector x LaTeX
    let vectorXLatex = '\\begin{pmatrix}';
    for (let i = 0; i < n; i++) {
        if (i > 0) vectorXLatex += ' \\\\';
        vectorXLatex += `x_{${i + 1}}`;
    }
    vectorXLatex += '\\end{pmatrix}';
    
    // Build vector b LaTeX
    let vectorBLatex = '\\begin{pmatrix}';
    for (let i = 0; i < n; i++) {
        const val = b[i] !== undefined ? b[i] : 0;
        if (i > 0) vectorBLatex += ' \\\\';
        vectorBLatex += val;
    }
    vectorBLatex += '\\end{pmatrix}';
    
    return `${matrixALatex}${vectorXLatex} = ${vectorBLatex}`;
}

/**
 * Generate LaTeX strings for Gauss-Seidel update formulas with numeric substitutions
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number[]} x - Current x values
 * @param {number} n - System size
 * @returns {Object[]} Array of formula objects
 */
export function generateGaussSeidelFormulasWithValues(A, b, x, n) {
    if (!A || !b || !x || n <= 0) {
        return [];
    }
    
    const formulas = [];
    
    for (let i = 0; i < n; i++) {
        const aii = A[i] && A[i][i] !== undefined ? A[i][i] : 0;
        const bi = b[i] !== undefined ? b[i] : 0;
        
        if (Math.abs(aii) < 1e-10) {
            formulas.push({
                formula: `x_{${i + 1}}^{(k+1)} = x_{${i + 1}}^{(k)} \\text{ (diagonal too small)}`,
                substitution: '',
                result: ''
            });
            continue;
        }
        
        // Calculate sum: j < i uses new values, j > i uses old values
        let sum = 0;
        let sumTerms = [];
        
        // Terms with new values (j < i)
        for (let j = 0; j < i; j++) {
            const aij = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
            const xj = x[j] !== undefined ? x[j] : 0;
            const contribution = aij * xj;
            sum += contribution;
            
            if (Math.abs(aij) > 1e-10) {
                const aijStr = aij.toFixed(4);
                const xjStr = xj.toFixed(4);
                sumTerms.push(`${aijStr} \\cdot ${xjStr} \\text{ (new)}`);
            }
        }
        
        // Terms with old values (j > i)
        for (let j = i + 1; j < n; j++) {
            const aij = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
            const xj = x[j] !== undefined ? x[j] : 0;
            const contribution = aij * xj;
            sum += contribution;
            
            if (Math.abs(aij) > 1e-10) {
                const aijStr = aij.toFixed(4);
                const xjStr = xj.toFixed(4);
                sumTerms.push(`${aijStr} \\cdot ${xjStr} \\text{ (old)}`);
            }
        }
        
        const newValue = (bi - sum) / aii;
        
        const formulaLatex = `x_{${i + 1}}^{(k+1)} = \\frac{b_{${i + 1}} - \\sum_{j < ${i + 1}} a_{${i + 1},j} x_j^{(k+1)} - \\sum_{j > ${i + 1}} a_{${i + 1},j} x_j^{(k)}}{a_{${i + 1},${i + 1}}}`;
        
        let substitutionLatex = '';
        if (sumTerms.length > 0) {
            const sumStr = sumTerms.join(' + ');
            const sumValue = sum.toFixed(4);
            substitutionLatex = `x_{${i + 1}} = \\frac{${bi.toFixed(4)} - (${sumStr})}{${aii.toFixed(4)}} = \\frac{${bi.toFixed(4)} - ${sumValue}}{${aii.toFixed(4)}}`;
        } else {
            substitutionLatex = `x_{${i + 1}} = \\frac{${bi.toFixed(4)} - 0}{${aii.toFixed(4)}}`;
        }
        
        const resultLatex = `= ${newValue.toFixed(4)}`;
        
        formulas.push({
            formula: formulaLatex,
            substitution: substitutionLatex,
            result: resultLatex
        });
    }
    
    return formulas;
}

/**
 * Generate LaTeX strings for Jacobi update formulas with numeric substitutions
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number[]} x - Current x values
 * @param {number} n - System size
 * @returns {Object[]} Array of formula objects
 */
export function generateJacobiFormulasWithValues(A, b, x, n) {
    if (!A || !b || !x || n <= 0) {
        return [];
    }
    
    const formulas = [];
    
    for (let i = 0; i < n; i++) {
        const aii = A[i] && A[i][i] !== undefined ? A[i][i] : 0;
        const bi = b[i] !== undefined ? b[i] : 0;
        
        // Check for zero or very small diagonal element
        if (Math.abs(aii) < 1e-10) {
            formulas.push({
                formula: `x_{${i + 1}}^{(k+1)} = x_{${i + 1}}^{(k)} \\text{ (diagonal too small)}`,
                substitution: '',
                result: ''
            });
            continue;
        }
        
        // Calculate sum of off-diagonal terms
        let sum = 0;
        let sumTerms = [];
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const aij = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
                const xj = x[j] !== undefined ? x[j] : 0;
                const contribution = aij * xj;
                sum += contribution;
                
                if (Math.abs(aij) > 1e-10) {
                    // Show as a_ij * x_j
                    const aijStr = aij.toFixed(4);
                    const xjStr = xj.toFixed(4);
                    sumTerms.push(`${aijStr} \\cdot ${xjStr}`);
                }
            }
        }
        
        // Calculate new value
        const newValue = (bi - sum) / aii;
        
        // Build formula structure
        const formulaLatex = `x_{${i + 1}}^{(k+1)} = \\frac{b_{${i + 1}} - \\sum_{j \\neq ${i + 1}} a_{${i + 1},j} x_j^{(k)}}{a_{${i + 1},${i + 1}}}`;
        
        // Build numeric substitution
        let substitutionLatex = '';
        if (sumTerms.length > 0) {
            const sumStr = sumTerms.join(' + ');
            const sumValue = sum.toFixed(4);
            substitutionLatex = `x_{${i + 1}} = \\frac{${bi.toFixed(4)} - (${sumStr})}{${aii.toFixed(4)}} = \\frac{${bi.toFixed(4)} - ${sumValue}}{${aii.toFixed(4)}}`;
        } else {
            substitutionLatex = `x_{${i + 1}} = \\frac{${bi.toFixed(4)} - 0}{${aii.toFixed(4)}}`;
        }
        
        // Result
        const resultLatex = `= ${newValue.toFixed(4)}`;
        
        formulas.push({
            formula: formulaLatex,
            substitution: substitutionLatex,
            result: resultLatex
        });
    }
    
    return formulas;
}

/**
 * Initialize equation visualizer container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement|null} Container element or null if invalid
 */
export function initEquationVisualizer(container) {
    if (!container) {
        console.warn('Container element not provided for equation visualizer');
        return null;
    }
    
    // Create header if it doesn't exist
    let header = container.querySelector('.equation-visualizer-header');
    if (!header) {
        header = document.createElement('div');
        header.className = 'equation-visualizer-header';
        header.textContent = 'Equation History';
        container.insertBefore(header, container.firstChild);
    }
    
    // Create content area if it doesn't exist
    let content = container.querySelector('.equation-visualizer-content');
    if (!content) {
        content = document.createElement('div');
        content.className = 'equation-visualizer-content';
        content.id = 'equationVisualizerContent';
        container.appendChild(content);
    }
    
    return container;
}

/**
 * Update equation visualizer with current history
 * @param {Array} equationHistory - History array
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number} n - System size
 */
export function updateEquationVisualizer(equationHistory, A, b, n, method = 'jacobi') {
    const content = document.getElementById('equationVisualizerContent');
    if (!content) {
        console.warn('Equation visualizer content element not found');
        return;
    }
    
    if (!Array.isArray(equationHistory) || !A || !b || n <= 0) {
        console.warn('Invalid parameters for updateEquationVisualizer');
        return;
    }
    
    // Clear content area
    content.innerHTML = '';
    
    // Add sticky original question section at the top
    const stickySection = document.createElement('div');
    stickySection.className = 'equation-visualizer-sticky';
    
    const stickyLabel = document.createElement('div');
    stickyLabel.className = 'equation-group-label';
    stickyLabel.textContent = 'Original System (A·x = b)';
    stickySection.appendChild(stickyLabel);
    
    // Generate and render matrix form
    const matrixLatex = generateMatrixForm(A, b, n);
    if (matrixLatex) {
        renderLaTeXWithKaTeX(matrixLatex, stickySection, { displayMode: true });
    }
    
    content.appendChild(stickySection);
    
    // Handle empty history
    if (equationHistory.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'equation-visualizer-empty';
        emptyMsg.textContent = 'No iterations yet. Perform iterations to see equation history.';
        content.appendChild(emptyMsg);
        return;
    }
    
    // Iterate through history in ascending order (oldest first)
    for (let idx = 0; idx < equationHistory.length; idx++) {
        const snapshot = equationHistory[idx];
        if (!snapshot || !snapshot.x) {
            continue;
        }
        
        // Create iteration section
        const iterationSection = document.createElement('div');
        iterationSection.className = 'iteration-section';
        
        // Add iteration header
        const iterationHeader = document.createElement('div');
        iterationHeader.className = 'iteration-header';
        iterationHeader.textContent = `Iteration ${snapshot.iteration}`;
        iterationSection.appendChild(iterationHeader);
        
        // Add brief intro
        const introText = document.createElement('div');
        introText.className = 'iteration-intro';
        if (snapshot.iteration === 0) {
            introText.textContent = 'This shows the initial state before any iterations.';
        } else {
            introText.textContent = `After ${snapshot.iteration} iteration${snapshot.iteration === 1 ? '' : 's'}, here's the current state of the system:`;
        }
        iterationSection.appendChild(introText);
        
        // Add matrix A for this iteration if available
        if (snapshot.A) {
            const matrixGroup = document.createElement('div');
            matrixGroup.className = 'equation-group';
            
            const matrixLabel = document.createElement('div');
            matrixLabel.className = 'equation-group-label';
            matrixLabel.textContent = 'Coefficient Matrix A';
            matrixGroup.appendChild(matrixLabel);
            
            // Generate matrix LaTeX (just A, not the full equation)
            let matrixALatex = 'A = \\begin{pmatrix}';
            for (let i = 0; i < n; i++) {
                let row = '';
                for (let j = 0; j < n; j++) {
                    const val = snapshot.A[i] && snapshot.A[i][j] !== undefined ? snapshot.A[i][j] : 0;
                    if (j > 0) row += ' & ';
                    row += val;
                }
                if (i < n - 1) row += ' \\\\';
                matrixALatex += row;
            }
            matrixALatex += '\\end{pmatrix}';
            
            renderLaTeXWithKaTeX(matrixALatex, matrixGroup, { displayMode: true });
            iterationSection.appendChild(matrixGroup);
        }
        
        // Add current variable values section
        const valuesSection = document.createElement('div');
        valuesSection.className = 'iteration-values';
        
        const valuesLabel = document.createElement('div');
        valuesLabel.className = 'iteration-values-label';
        valuesLabel.textContent = 'Current Variable Values:';
        valuesSection.appendChild(valuesLabel);
        
        const valuesList = document.createElement('div');
        valuesList.className = 'iteration-values-list';
        let valuesText = '';
        for (let i = 0; i < n; i++) {
            const xVal = snapshot.x[i] !== undefined ? snapshot.x[i] : 0;
            if (i > 0) valuesText += ', ';
            valuesText += `x${i + 1} = ${xVal.toFixed(6)}`;
        }
        valuesList.textContent = valuesText;
        valuesSection.appendChild(valuesList);
        iterationSection.appendChild(valuesSection);
        
        // Calculate errors for this iteration to provide context
        let maxError = 0;
        let errorDetails = [];
        let totalError = 0;
        for (let i = 0; i < n; i++) {
            let lhs = 0;
            for (let j = 0; j < n; j++) {
                const coeff = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
                const xVal = snapshot.x[j] !== undefined ? snapshot.x[j] : 0;
                lhs += coeff * xVal;
            }
            const bVal = b[i] !== undefined ? b[i] : 0;
            const error = Math.abs(lhs - bVal);
            totalError += error;
            if (error > maxError) maxError = error;
            errorDetails.push({ eq: i + 1, lhs: lhs, target: bVal, error: error });
        }
        
        // Add error summary section
        const errorSection = document.createElement('div');
        errorSection.className = 'iteration-error-summary';
        
        const errorLabel = document.createElement('div');
        errorLabel.className = 'iteration-error-label';
        errorLabel.textContent = 'Error Analysis:';
        errorSection.appendChild(errorLabel);
        
        const errorList = document.createElement('div');
        errorList.className = 'iteration-error-list';
        errorDetails.forEach(detail => {
            const errorItem = document.createElement('div');
            errorItem.className = 'iteration-error-item';
            const errorSign = detail.error < 0.0001 ? '✓' : '→';
            errorItem.innerHTML = `<span class="error-equation">Equation ${detail.eq}:</span> <span class="error-lhs">LHS = ${detail.lhs.toFixed(4)}</span> <span class="error-target">Target = ${detail.target.toFixed(4)}</span> <span class="error-value">Error = ${detail.error.toFixed(6)}</span> <span class="error-status">${errorSign}</span>`;
            errorList.appendChild(errorItem);
        });
        
        const maxErrorDisplay = document.createElement('div');
        maxErrorDisplay.className = 'iteration-max-error';
        maxErrorDisplay.innerHTML = `<strong>Maximum Error:</strong> ${maxError.toFixed(6)}`;
        errorSection.appendChild(errorList);
        errorSection.appendChild(maxErrorDisplay);
        iterationSection.appendChild(errorSection);
        
        // Add explanation for this iteration
        const explanation = document.createElement('div');
        explanation.className = 'iteration-explanation';
        
        // Generate detailed explanation text
        let explanationText = '';
        if (snapshot.iteration === 0) {
            explanationText = `📊 <strong>Initial State (Iteration 0)</strong><br>
            We start with initial guess values for all variables. The equations below show how well these initial values satisfy the system. Each equation's left-hand side (LHS) is calculated using the current variable values and compared to the target value (right-hand side). The error shows how far off we are from the solution.`;
        } else if (maxError < 0.0001) {
            explanationText = `✅ <strong>Converged! (Iteration ${snapshot.iteration})</strong><br>
            The solution has been found! All equations are satisfied within the error tolerance. The maximum error is ${maxError.toFixed(6)}, which is below the convergence threshold. The current variable values are the solution to the system of equations.`;
        } else if (maxError < 0.1) {
            explanationText = `🎯 <strong>Very Close to Solution (Iteration ${snapshot.iteration})</strong><br>
            We're very close to the solution! The maximum error is ${maxError.toFixed(4)}, meaning the current values are almost correct. The Jacobi method is converging well, and each iteration brings us closer to the exact solution.`;
        } else if (maxError < 1.0) {
            explanationText = `📈 <strong>Making Good Progress (Iteration ${snapshot.iteration})</strong><br>
            The iteration is making steady progress. The maximum error is ${maxError.toFixed(4)}. In this iteration, each variable is being updated using the Jacobi formula, which calculates a new value based on the current values of all other variables. This process continues until all equations are satisfied.`;
        } else {
            explanationText = `🔄 <strong>Early Stage (Iteration ${snapshot.iteration})</strong><br>
            This is an early iteration in the process. The maximum error is ${maxError.toFixed(4)}, which means we're still adjusting the variable values. The Jacobi method works by iteratively updating each variable: for each equation, we solve for one variable while keeping the others fixed at their current values. This process gradually moves all variables toward values that satisfy all equations simultaneously.`;
        }
        
        explanation.innerHTML = explanationText;
        iterationSection.appendChild(explanation);
        
        // Generate and render original equations
        const originalEquations = generateOriginalEquations(A, b, snapshot.x, n);
        if (originalEquations.length > 0) {
            const eqGroup = document.createElement('div');
            eqGroup.className = 'equation-group';
            
            const eqLabel = document.createElement('div');
            eqLabel.className = 'equation-group-label';
            eqLabel.textContent = 'Original Equations (A·x = b)';
            eqGroup.appendChild(eqLabel);
            
            const eqDescription = document.createElement('div');
            eqDescription.className = 'equation-group-description';
            eqDescription.textContent = 'These are the original system equations with current variable values substituted. The LHS shows the computed value, which we compare to the target value (RHS).';
            eqGroup.appendChild(eqDescription);
            
            originalEquations.forEach(eq => {
                // Render equation
                renderLaTeXWithKaTeX(eq.equation, eqGroup, { displayMode: true });
                // Render evaluation
                renderLaTeXWithKaTeX(eq.evaluation, eqGroup, { displayMode: false });
            });
            
            iterationSection.appendChild(eqGroup);
        }
        
        // Generate and render formulas based on method
        const formulas = method === 'gaussSeidel' 
            ? generateGaussSeidelFormulasWithValues(A, b, snapshot.x, n)
            : generateJacobiFormulasWithValues(A, b, snapshot.x, n);
            
        if (formulas.length > 0) {
            const formulaGroup = document.createElement('div');
            formulaGroup.className = 'equation-group';
            
            const formulaLabel = document.createElement('div');
            formulaLabel.className = 'equation-group-label';
            formulaLabel.textContent = method === 'gaussSeidel' ? 'Gauss-Seidel Update Formulas' : 'Jacobi Update Formulas';
            formulaGroup.appendChild(formulaLabel);
            
            const formulaDescription = document.createElement('div');
            formulaDescription.className = 'equation-group-description';
            if (method === 'gaussSeidel') {
                formulaDescription.textContent = 'These formulas calculate the next values for each variable. Gauss-Seidel uses already-updated values from the current iteration (for j < i) and old values (for j > i), making it typically faster than Jacobi.';
            } else {
                formulaDescription.textContent = 'These formulas calculate the next values for each variable. For each variable, we solve its equation while keeping all other variables at their current values.';
            }
            formulaGroup.appendChild(formulaDescription);
            
            formulas.forEach(formula => {
                // Render formula structure
                renderLaTeXWithKaTeX(formula.formula, formulaGroup, { displayMode: true });
                // Render numeric substitution if available
                if (formula.substitution) {
                    renderLaTeXWithKaTeX(formula.substitution, formulaGroup, { displayMode: true });
                }
                // Render result if available
                if (formula.result) {
                    renderLaTeXWithKaTeX(formula.result, formulaGroup, { displayMode: true });
                }
            });
            
            iterationSection.appendChild(formulaGroup);
        }
        
        // Add spacing
        const spacing = document.createElement('div');
        spacing.className = 'iteration-spacing';
        iterationSection.appendChild(spacing);
        
        content.appendChild(iterationSection);
    }
}

