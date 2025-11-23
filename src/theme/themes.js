/**
 * Theme Definitions
 * 
 * Theme color palettes and configurations
 */

/**
 * Vintage theme configuration
 */
export const vintageTheme = {
    name: 'vintage',
    colors: {
        primary: 'var(--vintage-brown)',
        secondary: 'var(--dark-wood)',
        accent: 'var(--vintage-green)',
        warning: 'var(--amber)',
        error: 'var(--red)',
        background: 'var(--cream)',
        text: 'var(--dark-wood)'
    },
    fonts: {
        primary: 'var(--font-condensed)',
        secondary: 'var(--font-serif)'
    }
};

/**
 * Modern theme configuration
 */
export const modernTheme = {
    name: 'modern',
    colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        warning: '#f39c12',
        error: '#e74c3c',
        background: '#ecf0f1',
        text: '#2c3e50'
    },
    fonts: {
        primary: 'system-ui, -apple-system, sans-serif',
        secondary: 'system-ui, -apple-system, sans-serif'
    }
};

/**
 * Get theme by name
 * @param {string} themeName - Theme name
 * @returns {Object} Theme configuration
 */
export function getTheme(themeName) {
    if (themeName === 'modern') {
        return modernTheme;
    }
    return vintageTheme;
}

