/**
 * State Management System
 * 
 * Implements the state management API described in STATE_MANAGEMENT.md
 * Uses Zustand as the underlying state management library
 */

import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Helper function to get nested value from object using dot notation path
 * Supports array indices like 'system.x[0]'
 */
function getNestedValue(obj, path) {
    // Handle array indices: 'system.x[0]' -> ['system', 'x', '0']
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let current = obj;
    
    for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
    }
    
    return current;
}

/**
 * Helper function to set nested value in object using dot notation path
 * Creates intermediate objects/arrays as needed
 */
function setNestedValue(obj, path, value) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    const lastPart = parts.pop();
    let current = obj;
    
    for (const part of parts) {
        if (current[part] == null) {
            // Check if next part is numeric (array index)
            const nextIndex = parts.indexOf(part) + 1;
            const nextPart = parts[nextIndex];
            current[part] = nextPart && !isNaN(parseInt(nextPart)) ? [] : {};
        }
        current = current[part];
    }
    
    current[lastPart] = value;
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Map) {
        const cloned = new Map();
        for (const [key, value] of obj.entries()) {
            cloned.set(key, deepClone(value));
        }
        return cloned;
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
    const output = deepClone(target);
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key]) && isObject(target[key])) {
                output[key] = deepMerge(target[key], source[key]);
            } else {
                output[key] = deepClone(source[key]);
            }
        });
    }
    
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Validation functions
 */
const validators = {
    'system.n': (value) => {
        if (!Number.isInteger(value) || value < 2 || value > 20) {
            throw new Error('n must be an integer between 2 and 20');
        }
    },
    
    'system.A': (value, state) => {
        const n = state.system?.n;
        if (n == null) return; // Skip validation if n is not set yet
        if (!Array.isArray(value) || value.length !== n) {
            throw new Error(`A must be a ${n}×${n} matrix`);
        }
        value.forEach((row, i) => {
            if (!Array.isArray(row) || row.length !== n) {
                throw new Error(`Row ${i} must have ${n} elements`);
            }
        });
    },
    
    'audio.volume': (value) => {
        if (value < 0 || value > 100) {
            throw new Error('Volume must be between 0 and 100');
        }
    },
    
    'iteration.speed': (value) => {
        if (value < 1 || value > 100) {
            throw new Error('Speed must be between 1 and 100');
        }
    }
};

/**
 * Default state structure organized by categories
 */
const defaultState = {
    system: {
        n: 3,
        A: [
            [4, -1, 1],
            [4, -8, 1],
            [-2, 1, 5]
        ],
        b: [7, -21, 15],
        x: [1.0, 2.0, 2.0],
        initialGuess: [1.0, 2.0, 2.0],
        iteration: 0,
        maxError: 0.0,
        errors: [0.0, 0.0, 0.0],
        converged: false
    },
    
    iteration: {
        isAutoPlaying: false,
        autoplayInterval: null,
        speed: 50,
        isPaused: false
    },
    
    interaction: {
        isDragging: false,
        dragKnob: null,
        dragKnobElement: null,
        dragStartY: 0,
        dragStartX: 0,
        dragStartValue: 0,
        focusedKnob: null,
        isDraggingVolume: false,
        volumeTrackRect: null,
        volumeHasMoved: false,
        knobUpdateRaf: null,
        volumeUpdateRaf: null
    },
    
    display: {
        theme: 'vintage',
        visibleKnobs: 3,
        visibleBands: 3,
        visibility: {
            header: true,
            equalizerBands: true,
            signalClarityDisplay: true,
            radioBody: true,
            speakerGrille: true,
            powerIndicator: true,
            knobs: true,
            volumeControl: true,
            tuningDial: true,
            controls: true,
            themeToggle: true
        }
    },
    
    audio: {
        volume: 50,
        isMuted: false,
        audioContext: null
    },
    
    cache: {
        lastBandRange: null,
        lastMaxError: null,
        bandRangeMin: -12,
        bandRangeMax: 12,
        bandRangeCenter: 0
    }
};

/**
 * Persistence keys mapping
 */
const PERSISTENCE_KEYS = {
    SYSTEM_CONFIG: 'jacobiRadioCustomConfig',
    THEME: 'jacobiRadioTheme',
    VISIBILITY: 'jacobiRadioVisibility',
    VOLUME: 'jacobiRadioVolume',
    STARTUP_CHOICE: 'jacobiRadioStartupChoice',
    WELCOME_SHOWN: 'jacobiRadioWelcomeShown'
};

/**
 * Create Zustand store with subscription support
 */
const useStore = createStore(
    subscribeWithSelector((set, get) => ({
        // State data
        ...defaultState,
        
        // Internal subscription tracking
        _subscribers: new Map(),
        _subscriptionId: 0,
        
        // Internal method to notify subscribers
        _notifySubscribers(path, newValue, oldValue) {
            const subscribers = get()._subscribers;
            subscribers.forEach(({ pathPattern, callback }) => {
                if (pathMatches(path, pathPattern)) {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (error) {
                        console.error('Error in subscriber callback:', error);
                    }
                }
            });
        },
        
        // Internal method to check if path matches pattern
        _pathMatches(path, pattern) {
            if (pattern === '*') return true;
            if (pattern === path) return true;
            if (pattern.endsWith('.*')) {
                const prefix = pattern.slice(0, -2);
                return path.startsWith(prefix + '.') || path === prefix;
            }
            return false;
        }
    }))
);

/**
 * Check if a path matches a pattern
 */
function pathMatches(path, pattern) {
    if (pattern === '*') return true;
    if (pattern === path) return true;
    if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        return path.startsWith(prefix + '.') || path === prefix;
    }
    return false;
}

/**
 * State Manager API
 * Implements the API described in STATE_MANAGEMENT.md
 */
const store = {
    /**
     * Get a value from state using dot-notation path
     * @param {string} path - Dot notation path (e.g., 'system.n', 'system.x[0]')
     * @returns {*} The value at the path
     */
    get(path) {
        const state = useStore.getState();
        return getNestedValue(state, path);
    },
    
    /**
     * Set a value in state and notify subscribers
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     * @param {Object} options - Options object
     * @param {boolean} options.validate - Run validation before setting
     * @param {boolean} options.persist - Persist to localStorage
     * @param {string} options.persistKey - localStorage key for persistence
     * @param {boolean} options.silent - Don't notify subscribers
     */
    set(path, value, options = {}) {
        const { validate = false, persist = false, persistKey = null, silent = false } = options;
        const currentState = useStore.getState();
        const oldValue = getNestedValue(currentState, path);
        
        // Validate if requested
        if (validate) {
            const validator = validators[path];
            if (validator) {
                validator(value, currentState);
            }
        }
        
        // Update state
        const newState = deepClone(currentState);
        setNestedValue(newState, path, value);
        
        // Update Zustand store
        useStore.setState(newState);
        
        // Notify subscribers
        if (!silent) {
            const updatedState = useStore.getState();
            updatedState._notifySubscribers(path, value, oldValue);
        }
        
        // Persist if requested
        if (persist) {
            const key = persistKey || this._getPersistenceKey(path);
            if (key) {
                this.persist(key, path);
            }
        }
    },
    
    /**
     * Subscribe to changes at a specific path
     * @param {string} path - Path to subscribe to (supports wildcards: 'system.*', '*')
     * @param {Function} callback - Callback function (newValue, oldValue, path)
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, callback) {
        const state = useStore.getState();
        const id = state._subscriptionId++;
        
        state._subscribers.set(id, { pathPattern: path, callback });
        
        // Update subscription ID in state
        useStore.setState({ _subscriptionId: state._subscriptionId });
        
        // Return unsubscribe function
        return () => {
            const currentState = useStore.getState();
            currentState._subscribers.delete(id);
        };
    },
    
    /**
     * Perform multiple updates in a single batch (only one notification)
     * @param {Object} updates - Object with path:value pairs
     * @param {Object} options - Options for batch update
     */
    batch(updates, options = {}) {
        const { validate = false, persist = false, persistKey = null } = options;
        const currentState = useStore.getState();
        const newState = deepClone(currentState);
        const changes = [];
        
        // Apply all updates
        for (const [path, value] of Object.entries(updates)) {
            // Validate if requested
            if (validate) {
                const validator = validators[path];
                if (validator) {
                    validator(value, newState);
                }
            }
            
            const oldValue = getNestedValue(newState, path);
            setNestedValue(newState, path, value);
            changes.push({ path, newValue: value, oldValue });
        }
        
        // Update Zustand store
        useStore.setState(newState);
        
        // Notify subscribers for each change
        const updatedState = useStore.getState();
        changes.forEach(({ path, newValue, oldValue }) => {
            updatedState._notifySubscribers(path, newValue, oldValue);
        });
        
        // Persist if requested
        if (persist) {
            const key = persistKey;
            if (key) {
                // Persist all updated paths (simplified - persist entire category)
                // In a real implementation, you might want more granular control
                this.persist(key, Object.keys(updates)[0].split('.')[0]);
            }
        }
    },
    
    /**
     * Persist a state path to localStorage
     * @param {string} key - localStorage key
     * @param {string} path - State path to persist
     */
    persist(key, path) {
        try {
            const value = this.get(path);
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Could not persist ${path} to localStorage:`, error);
        }
    },
    
    /**
     * Restore state from localStorage
     * @param {string} key - localStorage key
     * @param {string} path - State path to restore to
     * @param {*} defaultValue - Default value if restoration fails
     */
    restore(key, path, defaultValue = null) {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const value = JSON.parse(saved);
                this.set(path, value, { silent: false });
                return value;
            } else if (defaultValue !== null) {
                this.set(path, defaultValue, { silent: false });
                return defaultValue;
            }
        } catch (error) {
            console.warn(`Could not restore ${path} from localStorage:`, error);
            if (defaultValue !== null) {
                this.set(path, defaultValue, { silent: false });
                return defaultValue;
            }
        }
        return null;
    },
    
    /**
     * Reset a state path to its default value
     * @param {string} path - State path to reset
     * @param {*} defaultValue - Default value
     */
    reset(path, defaultValue) {
        this.set(path, deepClone(defaultValue));
    },
    
    /**
     * Get the entire state object (for backward compatibility)
     * @returns {Object} Complete state object
     */
    getState() {
        return useStore.getState();
    },
    
    /**
     * Internal: Get persistence key for a path
     */
    _getPersistenceKey(path) {
        // Map common paths to persistence keys
        if (path.startsWith('system.')) {
            return PERSISTENCE_KEYS.SYSTEM_CONFIG;
        }
        if (path.startsWith('display.theme')) {
            return PERSISTENCE_KEYS.THEME;
        }
        if (path.startsWith('display.visibility')) {
            return PERSISTENCE_KEYS.VISIBILITY;
        }
        if (path.startsWith('audio.volume')) {
            return PERSISTENCE_KEYS.VOLUME;
        }
        return null;
    }
};

// Export the store API and persistence keys
// For ES modules
export default store;
export { PERSISTENCE_KEYS, defaultState };

// For IIFE bundle (exposed as global)
if (typeof window !== 'undefined') {
    window.StateManager = {
        store,
        PERSISTENCE_KEYS,
        defaultState
    };
}

