/**
 * Button Event Handlers
 * 
 * Functions for handling button click events
 */

/**
 * Handle step button click
 * @param {Function} performIteration - Function to perform iteration
 */
export function handleStepClick(performIteration) {
    if (performIteration) {
        performIteration();
    }
}

/**
 * Handle reset button click
 * @param {Object} state - Application state
 * @param {Function} updateDisplays - Function to update displays
 * @param {Function} stopAutoplay - Function to stop autoplay
 */
export function handleResetClick(state, updateDisplays, stopAutoplay) {
    if (stopAutoplay) {
        stopAutoplay();
    }
    
    // Reset to initial guess
    if (state.initialGuess && state.initialGuess.length === state.n) {
        state.x = [...state.initialGuess];
    } else {
        // Fallback: reset to zeros
        state.x = new Array(state.n).fill(0);
    }
    
    state.iteration = 0;
    
    if (updateDisplays) {
        updateDisplays();
    }
    
    if (window.audioSystem) {
        window.audioSystem.playButtonClick();
    }
}

/**
 * Handle random initial guess button click
 * @param {Object} state - Application state
 * @param {Function} updateDisplays - Function to update displays
 * @param {Function} stopAutoplay - Function to stop autoplay
 */
export function handleRandomClick(state, updateDisplays, stopAutoplay) {
    if (stopAutoplay) {
        stopAutoplay();
    }
    
    // Generate random values in range [-5, 5]
    state.x = new Array(state.n).fill(0).map(() => (Math.random() - 0.5) * 10);
    state.initialGuess = [...state.x];
    state.iteration = 0;
    
    if (updateDisplays) {
        updateDisplays();
    }
    
    if (window.audioSystem) {
        window.audioSystem.playButtonClick();
    }
}

/**
 * Handle solution button click
 * @param {Function} showSolutionModal - Function to show solution modal
 */
export function handleSolutionClick(showSolutionModal) {
    if (showSolutionModal) {
        showSolutionModal();
    }
}

/**
 * Handle config button click
 * @param {Function} showConfigModal - Function to show config modal
 */
export function handleConfigClick(showConfigModal) {
    if (showConfigModal) {
        showConfigModal();
    }
}

