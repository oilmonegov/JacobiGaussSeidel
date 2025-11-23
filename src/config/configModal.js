/**
 * Configuration Modal
 * 
 * Functions for managing the configuration modal and system settings
 */

import { validateSystem } from '../core/system.js';
import { validateDiagonalDominance } from '../core/jacobi.js';

/**
 * Initialize configuration modal
 * @param {Object} state - Application state
 * @param {Object} configState - Configuration state object
 * @param {Function} renderMatrixEditor - Function to render matrix editor
 * @param {Function} updateMatrixPreview - Function to update matrix preview
 * @param {Function} updateTextPreview - Function to update text preview
 * @param {Function} updateTextInputFromState - Function to update text input
 * @param {Function} setupTextParserListeners - Function to setup text parser
 */
export function initConfigModal(state, configState, renderMatrixEditor, updateMatrixPreview, updateTextPreview, updateTextInputFromState, setupTextParserListeners) {
    // Setup tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(`tab-${tab}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
            
            // Update content for the active tab
            if (tab === 'matrix') {
                if (updateMatrixPreview) updateMatrixPreview();
            } else if (tab === 'text') {
                if (updateTextInputFromState) updateTextInputFromState();
                if (setupTextParserListeners) setupTextParserListeners();
            }
        });
    });
    
    // Setup matrix size update button
    const updateSizeBtn = document.getElementById('updateMatrixSizeBtn');
    if (updateSizeBtn) {
        updateSizeBtn.addEventListener('click', () => {
            const sizeInput = document.getElementById('matrixSize');
            if (sizeInput) {
                const newSize = parseInt(sizeInput.value);
                if (newSize >= 2 && newSize <= 10) {
                    configState.n = newSize;
                    // Resize matrices
                    configState.A = resizeMatrix(configState.A, newSize);
                    configState.b = resizeVector(configState.b, newSize);
                    if (renderMatrixEditor) renderMatrixEditor(newSize, configState);
                }
            }
        });
    }
}

/**
 * Show configuration modal
 * @param {Object} state - Application state
 * @param {Object} configState - Configuration state object
 * @param {string} activeTab - Active tab name
 * @param {Function} renderMatrixEditor - Function to render matrix editor
 * @param {Function} updateMatrixPreview - Function to update matrix preview
 * @param {Function} updateTextInputFromState - Function to update text input
 * @param {Function} updateVisibilityCheckboxes - Function to update visibility checkboxes
 */
export function showConfigModal(state, configState, activeTab = 'matrix', renderMatrixEditor, updateMatrixPreview, updateTextInputFromState, updateVisibilityCheckboxes) {
    const modal = document.getElementById('configModal');
    if (!modal) return;
    
    // Initialize temp state from current state
    configState.n = state.n;
    configState.A = JSON.parse(JSON.stringify(state.A));
    configState.b = [...state.b];
    configState.visibleKnobs = state.visibleKnobs;
    configState.visibleBands = state.visibleBands;
    
    // Populate inputs
    const sizeInput = document.getElementById('matrixSize');
    const knobsInput = document.getElementById('settingVisibleKnobs');
    const bandsInput = document.getElementById('settingVisibleBands');
    
    if (sizeInput) sizeInput.value = state.n;
    if (knobsInput) knobsInput.value = state.visibleKnobs;
    if (bandsInput) bandsInput.value = state.visibleBands;
    
    // Render matrix
    if (renderMatrixEditor) {
        renderMatrixEditor(state.n, configState);
    }
    
    // Switch to the requested tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === activeTab) {
            btn.classList.add('active');
        }
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
        if (content.id === `tab-${activeTab}`) {
            content.classList.remove('hidden');
            content.classList.add('active');
        }
    });
    
    // Update content for the active tab
    if (activeTab === 'matrix') {
        if (updateMatrixPreview) updateMatrixPreview();
    } else if (activeTab === 'text') {
        if (updateTextInputFromState) updateTextInputFromState();
    } else if (activeTab === 'visibility') {
        if (updateVisibilityCheckboxes) updateVisibilityCheckboxes();
    }
    
    modal.classList.remove('hidden');
}

/**
 * Validate and apply configuration
 * @param {Object} state - Application state
 * @param {Object} configState - Configuration state object
 * @param {Function} renderKnobs - Function to render knobs
 * @param {Function} renderBands - Function to render bands
 * @param {Function} updateDisplays - Function to update displays
 * @param {Function} showMessage - Function to show messages
 * @param {Function} hideModal - Function to hide modal
 */
export function validateAndApplyConfig(state, configState, renderKnobs, renderBands, updateDisplays, showMessage, hideModal) {
    // Read settings
    const visibleKnobsInput = document.getElementById('settingVisibleKnobs');
    const visibleBandsInput = document.getElementById('settingVisibleBands');
    
    const visibleKnobs = visibleKnobsInput ? parseInt(visibleKnobsInput.value) : 3;
    const visibleBands = visibleBandsInput ? parseInt(visibleBandsInput.value) : 3;
    
    // Validate system
    const validation = validateSystem(configState.A, configState.b);
    if (!validation.isValid) {
        if (showMessage) {
            showMessage(validation.message, 'error');
        }
        return false;
    }
    
    // Check diagonal dominance (warning)
    const isDiagonallyDominant = validateDiagonalDominance(configState.A);
    if (!isDiagonallyDominant) {
        if (showMessage) {
            showMessage('Warning: System is not diagonally dominant. Convergence not guaranteed.', 'warning');
        }
    }
    
    // Update State
    state.n = configState.n;
    state.A = JSON.parse(JSON.stringify(configState.A)); // Deep copy
    state.b = [...configState.b];
    state.visibleKnobs = visibleKnobs;
    state.visibleBands = visibleBands;
    
    // Resize x array
    const newX = new Array(state.n).fill(0);
    // Preserve existing x values
    for(let i=0; i<Math.min(state.x.length, state.n); i++) {
        newX[i] = state.x[i];
    }
    state.x = newX;
    
    // Store current x values as the new initial guess for reset functionality
    state.initialGuess = [...state.x];
    
    // Reset iteration
    state.iteration = 0;
    
    // Update UI
    if (renderKnobs) renderKnobs();
    if (renderBands) renderBands();
    if (updateDisplays) updateDisplays();
    
    // Save configuration
    const config = {
        n: state.n,
        A: state.A,
        b: state.b,
        visibleKnobs: state.visibleKnobs,
        visibleBands: state.visibleBands
    };
    try {
        localStorage.setItem('jacobiRadioCustomConfig', JSON.stringify(config));
    } catch (e) {
        console.warn('Could not save custom config to localStorage:', e);
    }
    
    if (showMessage) {
        showMessage(`System updated to ${state.n}×${state.n} configuration.`, 'success');
    }
    
    if (hideModal) {
        hideModal();
    }
    
    return true;
}

/**
 * Resize matrix to new size
 * @param {number[][]} matrix - Original matrix
 * @param {number} newSize - New size
 * @returns {number[][]} Resized matrix
 */
function resizeMatrix(matrix, newSize) {
    const newMatrix = [];
    for (let i = 0; i < newSize; i++) {
        newMatrix[i] = [];
        for (let j = 0; j < newSize; j++) {
            if (matrix[i] && matrix[i][j] !== undefined) {
                newMatrix[i][j] = matrix[i][j];
            } else {
                newMatrix[i][j] = i === j ? 1 : 0; // Identity matrix for new cells
            }
        }
    }
    return newMatrix;
}

/**
 * Resize vector to new size
 * @param {number[]} vector - Original vector
 * @param {number} newSize - New size
 * @returns {number[]} Resized vector
 */
function resizeVector(vector, newSize) {
    const newVector = [];
    for (let i = 0; i < newSize; i++) {
        newVector[i] = (vector && vector[i] !== undefined) ? vector[i] : 0;
    }
    return newVector;
}

