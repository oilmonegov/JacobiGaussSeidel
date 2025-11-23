# State Management Usage Guide

This document provides examples of how to use the state management system implemented with Zustand.

## Quick Start

The state manager is available globally as `StateManager` after including `stateManager.bundle.js`:

```javascript
const { store, PERSISTENCE_KEYS, defaultState } = StateManager;
```

## Basic Usage

### Getting State

```javascript
// Get a single value
const n = store.get('system.n');
const volume = store.get('audio.volume');

// Get nested objects
const system = store.get('system');
const visibility = store.get('display.visibility');
```

### Setting State

```javascript
// Simple update
store.set('audio.volume', 75);

// With options
store.set('system.n', 5, {
    validate: true,    // Run validation
    persist: true,     // Save to localStorage
    silent: false      // Notify subscribers (default)
});
```

### Subscribing to Changes

```javascript
// Subscribe to specific path
const unsubscribe = store.subscribe('system.x', (newValue, oldValue, path) => {
    console.log(`x changed from ${oldValue} to ${newValue}`);
    updateKnobs(newValue);
});

// Subscribe to all changes under a path
store.subscribe('system.*', (newValue, oldValue, path) => {
    console.log(`${path} changed:`, newValue);
});

// Subscribe to all state changes
store.subscribe('*', (newValue, oldValue, path) => {
    console.log('State changed:', path, newValue);
});

// Clean up when done
unsubscribe();
```

### Batch Updates

```javascript
// Update multiple values at once (single notification)
store.batch({
    'system.n': 5,
    'system.x': [0, 0, 0, 0, 0],
    'display.visibleKnobs': 5,
    'display.visibleBands': 5
}, {
    validate: true,
    persist: true
});
```

### Persistence

```javascript
// Persist state to localStorage
store.persist(PERSISTENCE_KEYS.SYSTEM_CONFIG, 'system');

// Restore state from localStorage
store.restore(PERSISTENCE_KEYS.SYSTEM_CONFIG, 'system', defaultState.system);

// Auto-persist on set
store.set('display.theme', 'modern', { persist: true });
```

## Migration Examples

### Example 1: Replacing Direct State Access

**Before:**
```javascript
const n = state.n;
const volume = state.volume;
```

**After:**
```javascript
const n = store.get('system.n');
const volume = store.get('audio.volume');
```

### Example 2: Replacing Direct State Mutation

**Before:**
```javascript
state.volume = 75;
updateVolumeDisplay();
```

**After:**
```javascript
store.set('audio.volume', 75);
// Subscribers automatically notified
```

### Example 3: Reactive UI Updates

**Before:**
```javascript
function updateKnobValue(index, value) {
    state.x[index] = value;
    updateKnobDisplay(index);
    updateBands();
}
```

**After:**
```javascript
// Subscribe once during initialization
store.subscribe('system.x', (newX) => {
    updateKnobDisplays(newX);
    updateBands();
});

// Update function becomes simple
function updateKnobValue(index, value) {
    store.set(`system.x[${index}]`, value);
}
```

### Example 4: System Configuration

**Before:**
```javascript
function applySystemConfiguration(config) {
    state.n = config.n;
    state.A = config.A;
    state.b = config.b;
    state.x = new Array(config.n).fill(0);
    state.visibleKnobs = config.visibleKnobs;
    state.visibleBands = config.visibleBands;
    
    renderKnobs();
    renderBands();
    updateDisplays();
    
    localStorage.setItem('jacobiRadioCustomConfig', JSON.stringify(config));
}
```

**After:**
```javascript
function applySystemConfiguration(config) {
    store.batch({
        'system.n': config.n,
        'system.A': config.A,
        'system.b': config.b,
        'system.x': new Array(config.n).fill(0),
        'display.visibleKnobs': config.visibleKnobs,
        'display.visibleBands': config.visibleBands
    }, {
        persist: true,
        persistKey: PERSISTENCE_KEYS.SYSTEM_CONFIG
    });
}

// Subscriptions handle UI updates automatically
store.subscribe('system.n', () => {
    renderKnobs();
    renderBands();
});

store.subscribe('display.visibleKnobs', renderKnobs);
store.subscribe('display.visibleBands', renderBands);
```

## State Structure

The state is organized into categories:

- **system**: Core mathematical system data (n, A, b, x, errors, etc.)
- **iteration**: Iteration control (isAutoPlaying, speed, etc.)
- **interaction**: UI interaction state (dragging, focus, etc.)
- **display**: Display preferences (theme, visibility, etc.)
- **audio**: Audio state (volume, mute, etc.)
- **cache**: Cached values for optimization

See `STATE_MANAGEMENT.md` for the complete state structure.

## Persistence Keys

Available persistence keys:

```javascript
PERSISTENCE_KEYS.SYSTEM_CONFIG      // 'jacobiRadioCustomConfig'
PERSISTENCE_KEYS.THEME               // 'jacobiRadioTheme'
PERSISTENCE_KEYS.VISIBILITY          // 'jacobiRadioVisibility'
PERSISTENCE_KEYS.VOLUME              // 'jacobiRadioVolume'
PERSISTENCE_KEYS.STARTUP_CHOICE      // 'jacobiRadioStartupChoice'
PERSISTENCE_KEYS.WELCOME_SHOWN       // 'jacobiRadioWelcomeShown'
```

## Validation

Validation is available for certain paths:

```javascript
// This will throw an error if n is not between 2 and 20
store.set('system.n', 25, { validate: true });

// This will throw an error if volume is not between 0 and 100
store.set('audio.volume', 150, { validate: true });
```

## Building

To rebuild the state manager bundle after making changes:

```bash
npm run build:state
```

Or build everything:

```bash
npm run build
```

