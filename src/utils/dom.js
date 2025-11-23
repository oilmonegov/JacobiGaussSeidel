/**
 * DOM Utilities
 * 
 * Helper functions for DOM manipulation
 */

/**
 * Safe query selector
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} Element or null
 */
export function querySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (e) {
        console.warn('Invalid selector:', selector, e);
        return null;
    }
}

/**
 * Create element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {string[]} classes - Array of class names
 * @param {Object} attributes - Object of attributes
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    
    if (classes.length > 0) {
        element.classList.add(...classes);
    }
    
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    
    return element;
}

/**
 * Update element properties
 * @param {HTMLElement} element - Element to update
 * @param {Object} updates - Object of property updates
 */
export function updateElement(element, updates) {
    if (!element) return;
    
    Object.keys(updates).forEach(key => {
        if (key === 'textContent' || key === 'innerHTML') {
            element[key] = updates[key];
        } else if (key === 'style' && typeof updates[key] === 'object') {
            Object.assign(element.style, updates[key]);
        } else {
            element.setAttribute(key, updates[key]);
        }
    });
}

/**
 * Show element
 * @param {HTMLElement} element - Element to show
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
        element.style.display = '';
    }
}

/**
 * Hide element
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

