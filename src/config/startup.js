/**
 * Startup Configuration
 * 
 * Functions for handling startup modal and system initialization
 */

import { getDefaultSystem } from '../core/system.js';

/**
 * Initialize startup modal and handle system selection
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {Function} initializeDefaultSystem - Function to initialize default system
 * @param {Function} initializeCustomSystem - Function to initialize custom system
 */
export function initStartup(state, elements, initializeDefaultSystem, initializeCustomSystem) {
    // Hide all modals initially to prevent overlap
    if (elements.welcomeModal) elements.welcomeModal.classList.add('hidden');
    if (elements.startupModal) elements.startupModal.classList.add('hidden');
    
    let savedChoice = null;
    try {
        savedChoice = localStorage.getItem('jacobiRadioStartupChoice');
    } catch (e) {
        console.warn('Could not read startup choice from localStorage:', e);
    }
    
    if (savedChoice === 'default') {
        initializeDefaultSystem();
    } else if (savedChoice === 'custom') {
        initializeCustomSystem();
    } else {
        // Show startup modal if no choice saved
        if (elements.startupModal) {
            elements.startupModal.classList.remove('hidden');
        }
    }
}

/**
 * Initialize default system
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 */
export function handleDefaultSystem(state, elements) {
    if (elements.startupModal) elements.startupModal.classList.add('hidden');
    
    // Show welcome modal if not seen before
    let welcomeShown = false;
    try {
        welcomeShown = localStorage.getItem('jacobiRadioWelcomeShown') === 'true';
    } catch (e) {
        console.warn('Could not read welcome modal preference from localStorage:', e);
    }
    if (!welcomeShown) {
        if (elements.welcomeModal) {
            elements.welcomeModal.classList.remove('hidden');
        }
    }
    
    // Initialize default values
    const defaultSystem = getDefaultSystem();
    state.n = defaultSystem.n;
    state.A = defaultSystem.A;
    state.b = defaultSystem.b;
    state.x = [...defaultSystem.initialX];
    
    // Ensure initialGuess is set for reset functionality
    if (!state.initialGuess || state.initialGuess.length !== state.n) {
        state.initialGuess = [...state.x];
    }
}

/**
 * Initialize custom system
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @param {Function} renderKnobs - Function to render knobs
 * @param {Function} renderBands - Function to render bands
 * @param {Function} updateDisplays - Function to update displays
 * @param {Function} showConfigModal - Function to show config modal
 * @param {Function} showMessage - Function to show messages
 */
export function handleCustomSystem(state, elements, renderKnobs, renderBands, updateDisplays, showConfigModal, showMessage) {
    if (elements.startupModal) elements.startupModal.classList.add('hidden');
    
    // Try to load saved config
    let savedConfig = null;
    try {
        savedConfig = localStorage.getItem('jacobiRadioCustomConfig');
    } catch (e) {
        console.warn('Could not read custom config from localStorage:', e);
    }
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            state.n = config.n;
            state.A = config.A;
            state.b = config.b;
            state.visibleKnobs = config.visibleKnobs || 3;
            state.visibleBands = config.visibleBands || 3;
            
            // Resize x
            state.x = new Array(state.n).fill(0);
            // Store initial guess for reset functionality
            state.initialGuess = [...state.x];
            state.iteration = 0;
            
            if (renderKnobs) renderKnobs();
            if (renderBands) renderBands();
            if (updateDisplays) updateDisplays();
            
            if (showMessage) {
                showMessage('Loaded custom configuration.', 'success');
            }
        } catch (e) {
            console.error("Error loading config", e);
            if (showConfigModal) showConfigModal();
        }
    } else {
        // Open Config Modal if no saved config
        if (showConfigModal) showConfigModal();
    }
}

/**
 * Setup startup modal event listeners
 * @param {Object} elements - DOM elements
 * @param {Function} handleDefaultSystem - Function to handle default system
 * @param {Function} handleCustomSystem - Function to handle custom system
 */
export function setupStartupListeners(elements, handleDefaultSystem, handleCustomSystem) {
    // Option: Use Default
    if (elements.btnUseDefault) {
        elements.btnUseDefault.addEventListener('click', () => {
            if (elements.rememberStartupChoice && elements.rememberStartupChoice.checked) {
                try {
                    localStorage.setItem('jacobiRadioStartupChoice', 'default');
                } catch (e) {
                    console.warn('Could not save startup choice to localStorage:', e);
                }
            }
            handleDefaultSystem();
        });
    }
    
    // Option: Configure Custom
    if (elements.btnConfigureCustom) {
        elements.btnConfigureCustom.addEventListener('click', () => {
            if (elements.rememberStartupChoice && elements.rememberStartupChoice.checked) {
                try {
                    localStorage.setItem('jacobiRadioStartupChoice', 'custom');
                } catch (e) {
                    console.warn('Could not save startup choice to localStorage:', e);
                }
            }
            handleCustomSystem();
        });
    }
    
    // Learn More toggles
    if (elements.learnMoreBtns) {
        elements.learnMoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                const details = document.getElementById(targetId);
                if (details) {
                    const isExpanded = details.classList.contains('expanded');
                    
                    // Toggle expanded class
                    details.classList.toggle('expanded');
                    
                    // Update button text
                    e.target.textContent = isExpanded ? 'Learn More ▼' : 'Show Less ▲';
                }
            });
        });
    }
}

