/**
 * Theme Manager
 * 
 * Functions for managing theme switching and application
 */

/**
 * Initialize theme system
 * @param {Object} state - Application state
 */
export function initTheme(state) {
    loadThemePreference(state);
    applyTheme(state.theme);
}

/**
 * Switch theme
 * @param {string} themeName - Theme name ('vintage' or 'modern')
 */
export function switchTheme(themeName) {
    if (themeName !== 'vintage' && themeName !== 'modern') {
        console.warn('Invalid theme name:', themeName);
        return;
    }
    
    applyTheme(themeName);
    
    // Save preference
    try {
        localStorage.setItem('jacobiRadioTheme', themeName);
    } catch (e) {
        console.warn('Could not save theme preference to localStorage:', e);
    }
}

/**
 * Toggle between vintage and modern themes
 * @param {Object} state - Application state
 * @returns {string} New theme name
 */
export function toggleTheme(state) {
    const newTheme = state.theme === 'vintage' ? 'modern' : 'vintage';
    state.theme = newTheme;
    switchTheme(newTheme);
    return newTheme;
}

/**
 * Apply theme to DOM
 * @param {string} themeName - Theme name
 */
export function applyTheme(themeName) {
    const body = document.body;
    if (!body) return;
    
    // Remove existing theme classes
    body.classList.remove('theme-vintage', 'theme-modern');
    
    // Add new theme class
    body.classList.add(`theme-${themeName}`);
    
    // Update theme toggle button if it exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const themeLabel = themeToggle.querySelector('.theme-label');
        if (themeLabel) {
            themeLabel.textContent = themeName === 'vintage' ? 'Modern' : 'Vintage';
        }
    }
}

/**
 * Load theme preference from localStorage
 * @param {Object} state - Application state
 */
export function loadThemePreference(state) {
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('jacobiRadioTheme');
    } catch (e) {
        console.warn('Could not read theme preference from localStorage:', e);
    }
    
    if (savedTheme === 'vintage' || savedTheme === 'modern') {
        state.theme = savedTheme;
    } else {
        state.theme = 'vintage'; // Default
    }
    
    applyTheme(state.theme);
}

