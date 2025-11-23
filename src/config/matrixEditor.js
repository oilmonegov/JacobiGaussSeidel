/**
 * Matrix Editor
 * 
 * Functions for rendering and managing the interactive matrix grid editor
 */

/**
 * Render interactive matrix grid
 * @param {number} n - System size
 * @param {Object} configState - Configuration state object
 * @param {HTMLElement} container - Container element
 * @param {Function} updatePreview - Function to update preview
 */
export function renderMatrixGrid(n, configState, container, updatePreview) {
    if (!container) return;
    
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'matrix-row matrix-header';
    
    // Variable headers
    for (let j = 0; j < n; j++) {
        const header = document.createElement('div');
        header.className = 'matrix-cell-header';
        header.textContent = `x${j + 1}`;
        headerRow.appendChild(header);
    }
    
    // Constant header
    const constHeader = document.createElement('div');
    constHeader.className = 'matrix-cell-header';
    constHeader.textContent = 'b';
    headerRow.appendChild(constHeader);
    
    grid.appendChild(headerRow);
    
    // Create data rows
    for (let i = 0; i < n; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        // A[i][j] cells
        for (let j = 0; j < n; j++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'matrix-cell-wrapper';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-cell';
            if (i === j) {
                input.classList.add('diagonal');
            }
            input.value = (configState.A[i] && configState.A[i][j] !== undefined) ? configState.A[i][j] : 0;
            input.step = 'any';
            input.dataset.row = i;
            input.dataset.col = j;
            input.dataset.type = 'A';
            
            input.addEventListener('change', (e) => {
                const r = parseInt(e.target.dataset.row);
                const c = parseInt(e.target.dataset.col);
                if (!configState.A[r]) {
                    configState.A[r] = new Array(n).fill(0);
                }
                configState.A[r][c] = parseFloat(e.target.value) || 0;
                if (updatePreview) updatePreview();
            });
            
            wrapper.appendChild(input);
            row.appendChild(wrapper);
        }
        
        // b[i] cell
        const wrapperB = document.createElement('div');
        wrapperB.className = 'matrix-cell-wrapper';
        
        const inputB = document.createElement('input');
        inputB.type = 'number';
        inputB.className = 'matrix-cell';
        inputB.value = (configState.b && configState.b[i] !== undefined) ? configState.b[i] : 0;
        inputB.step = 'any';
        inputB.dataset.row = i;
        inputB.dataset.type = 'b';
        
        inputB.addEventListener('change', (e) => {
            const r = parseInt(e.target.dataset.row);
            if (!configState.b) {
                configState.b = new Array(n).fill(0);
            }
            configState.b[r] = parseFloat(e.target.value) || 0;
            if (updatePreview) updatePreview();
        });
        
        wrapperB.appendChild(inputB);
        row.appendChild(wrapperB);
        
        grid.appendChild(row);
    }
    
    container.appendChild(grid);
}

/**
 * Get matrix data from grid
 * @param {HTMLElement} container - Container element with grid
 * @param {number} n - System size
 * @returns {Object} Matrix data {A, b}
 */
export function getMatrixData(container, n) {
    if (!container) {
        return { A: [], b: [] };
    }
    
    const A = [];
    const b = [];
    
    const inputs = container.querySelectorAll('input[data-type]');
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const type = input.dataset.type;
        const value = parseFloat(input.value) || 0;
        
        if (type === 'A') {
            const col = parseInt(input.dataset.col);
            if (!A[row]) {
                A[row] = new Array(n).fill(0);
            }
            A[row][col] = value;
        } else if (type === 'b') {
            b[row] = value;
        }
    });
    
    return { A, b };
}

/**
 * Validate matrix input
 * @param {number[][]} A - Coefficient matrix
 * @param {number[]} b - Constant vector
 * @param {number} n - System size
 * @returns {Object} Validation result {isValid, message}
 */
export function validateMatrix(A, b, n) {
    if (!Array.isArray(A) || A.length !== n) {
        return { isValid: false, message: 'Matrix A must have n rows' };
    }
    
    if (!Array.isArray(b) || b.length !== n) {
        return { isValid: false, message: 'Vector b must have n elements' };
    }
    
    for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
            return { isValid: false, message: `Row ${i+1} of matrix A must have n columns` };
        }
        
        // Check for zero diagonal
        if (Math.abs(A[i][i]) < 1e-10) {
            return { 
                isValid: false, 
                message: `Diagonal element A[${i+1}][${i+1}] is too close to zero` 
            };
        }
    }
    
    return { isValid: true, message: 'Matrix is valid' };
}

