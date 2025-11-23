# State Management System Design
## Jacobi Iteration Equalizer

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Design Document

---

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Design Goals](#design-goals)
4. [State Architecture](#state-architecture)
5. [State Categories](#state-categories)
6. [State Management API](#state-management-api)
7. [State Update Patterns](#state-update-patterns)
8. [Persistence Strategy](#persistence-strategy)
9. [Migration Plan](#migration-plan)
10. [Implementation Examples](#implementation-examples)

---

## Overview

This document describes a simple, lightweight state management system for the Jacobi Iteration Equalizer application. The system is designed to:

- **Centralize** all application state in a single source of truth
- **Provide** a simple API for reading and updating state
- **Enable** reactive UI updates through subscription patterns
- **Support** state persistence to localStorage
- **Maintain** backward compatibility with existing code
- **Keep** the implementation simple and framework-free

---

## Current State Analysis

### Current Structure

The application currently uses:

1. **Main State Object** (`state`): A single object containing all application state (~70 properties)
2. **Config State** (`configState`): Temporary state for the configuration modal
3. **Direct Mutation**: State is directly mutated throughout the codebase
4. **Scattered Updates**: UI updates happen in various places after state changes
5. **LocalStorage**: Some state is manually persisted to localStorage

### Issues with Current Approach

- **No Centralized Updates**: State changes happen anywhere, making it hard to track
- **No Observers**: UI updates must be manually triggered after state changes
- **Inconsistent Persistence**: Some state is saved, some isn't
- **No Validation**: State can be set to invalid values
- **Hard to Debug**: No way to track state changes or time-travel
- **Tight Coupling**: UI code directly accesses and mutates state

---

## Design Goals

### Primary Goals

1. **Simplicity**: Keep it simple - no external dependencies, minimal boilerplate
2. **Backward Compatibility**: Existing code should continue to work during migration
3. **Performance**: Minimal overhead, efficient updates
4. **Developer Experience**: Easy to use, easy to debug
5. **Maintainability**: Clear patterns, well-organized code

### Non-Goals

- Full Redux-like architecture (too complex for this project)
- Time-travel debugging (nice-to-have, not essential)
- State normalization (current structure is fine)
- Middleware system (can be added later if needed)

---

## State Architecture

### Core Concept

The state management system uses a **centralized store** with **subscription-based updates**:

```
┌─────────────────────────────────────────┐
│         State Store (Single Source)     │
│  ┌───────────────────────────────────┐  │
│  │  System State                     │  │
│  │  UI State                         │  │
│  │  Configuration State               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │                    │
           │                    │
    ┌──────▼──────┐      ┌──────▼──────┐
    │   Getters   │      │   Setters   │
    │  (Read API) │      │ (Update API)│
    └─────────────┘      └─────────────┘
           │                    │
           │                    │
    ┌──────▼────────────────────▼──────┐
    │      Subscription System          │
    │  (Notify subscribers of changes)  │
    └───────────────────────────────────┘
```

### State Store Structure

```javascript
const store = {
    // State data
    state: { /* all application state */ },
    
    // Subscribers (callbacks that react to state changes)
    subscribers: new Map(),
    
    // Methods
    get: (path) => { /* get state value */ },
    set: (path, value) => { /* set state value and notify */ },
    subscribe: (path, callback) => { /* subscribe to changes */ },
    unsubscribe: (id) => { /* remove subscription */ },
    persist: (key, path) => { /* save to localStorage */ },
    restore: (key, path) => { /* load from localStorage */ }
};
```

---

## State Categories

State is organized into logical categories for better organization and management:

### 1. System State
**Purpose**: Core mathematical system data

```javascript
system: {
    n: 3,                    // System size (number of equations)
    A: [[...], [...], [...]], // Coefficient matrix (n×n)
    b: [7, -21, 15],         // Constant vector (n)
    x: [1.0, 2.0, 2.0],      // Current variable values (n)
    initialGuess: [1.0, 2.0, 2.0], // Initial values for reset
    iteration: 0,             // Current iteration count
    maxError: 0.0,           // Maximum error across all equations
    errors: [0.0, 0.0, 0.0], // Error for each equation
    converged: false         // Whether system has converged
}
```

**Characteristics**:
- Core to application logic
- Changes trigger UI updates
- Should be validated (e.g., n > 0, A is n×n matrix)
- Persisted when system is configured

### 2. Iteration Control State
**Purpose**: Controls for Jacobi iteration execution

```javascript
iteration: {
    isAutoPlaying: false,    // Whether autoplay is active
    autoplayInterval: null,   // Interval ID for autoplay
    speed: 50,                // Autoplay speed (1-100)
    isPaused: false          // Pause state
}
```

**Characteristics**:
- Controls iteration execution
- Changes affect animation/playback
- Speed should be clamped to valid range
- Not persisted (session-only)

### 3. UI Interaction State
**Purpose**: Tracks user interactions and UI state

```javascript
interaction: {
    // Knob dragging
    isDragging: false,
    dragKnob: null,           // Index of knob being dragged
    dragKnobElement: null,    // DOM element reference
    dragStartY: 0,
    dragStartX: 0,
    dragStartValue: 0,
    focusedKnob: null,        // Index of focused knob
    
    // Volume control
    isDraggingVolume: false,
    volumeTrackRect: null,
    volumeHasMoved: false,
    
    // Request animation frame IDs
    knobUpdateRaf: null,
    volumeUpdateRaf: null
}
```

**Characteristics**:
- Temporary, interaction-specific
- Cleared when interaction ends
- Not persisted
- Used for smooth animations

### 4. Display State
**Purpose**: Controls what is visible and how it's displayed

```javascript
display: {
    theme: 'vintage',         // 'vintage' or 'modern'
    visibleKnobs: 3,          // Number of visible knobs (m)
    visibleBands: 3,          // Number of visible bands (m)
    
    // Visibility flags for all components
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
}
```

**Characteristics**:
- Controls UI visibility and appearance
- Theme changes affect entire UI
- Visibility settings can be persisted
- Changes trigger re-renders

### 5. Audio State
**Purpose**: Audio system configuration and state

```javascript
audio: {
    volume: 50,               // Volume level (0-100)
    isMuted: false,           // Mute state
    audioContext: null,        // Web Audio API context
    // ... other audio-related state
}
```

**Characteristics**:
- Controls audio playback
- Volume should be clamped to 0-100
- Can be persisted (user preference)
- Changes trigger audio updates

### 6. Configuration State
**Purpose**: Temporary state for configuration modal

```javascript
config: {
    n: 3,
    A: [],
    b: [],
    visibleKnobs: 3,
    visibleBands: 3,
    inputMethod: 'matrix',    // 'matrix', 'text', or 'visual'
    // ... other config modal state
}
```

**Characteristics**:
- Temporary, modal-specific
- Not part of main state
- Discarded when modal is closed
- Applied to main state when "Apply" is clicked

### 7. Cache/Optimization State
**Purpose**: Cached values for performance optimization

```javascript
cache: {
    lastBandRange: null,       // Last calculated band range
    lastMaxError: null,        // Last max error value
    bandRangeMin: -12,         // Cached range bounds
    bandRangeMax: 12,
    bandRangeCenter: 0
}
```

**Characteristics**:
- Performance optimization
- Can be invalidated when system changes
- Not persisted
- Internal use only

---

## State Management API

### Core API Methods

#### 1. `store.get(path)`
Get a value from state using a dot-notation path.

```javascript
// Get single value
const n = store.get('system.n');
const volume = store.get('audio.volume');

// Get nested object
const system = store.get('system');
const visibility = store.get('display.visibility');
```

**Path Examples**:
- `'system.n'` → `state.system.n`
- `'system.x[0]'` → `state.system.x[0]`
- `'display.visibility.header'` → `state.display.visibility.header`

#### 2. `store.set(path, value, options)`
Set a value in state and notify subscribers.

```javascript
// Set single value
store.set('system.n', 5);
store.set('audio.volume', 75);

// Set nested value
store.set('display.visibility.header', false);

// Set with options
store.set('system.x', [1, 2, 3], {
    validate: true,      // Validate before setting
    persist: true,       // Persist to localStorage
    silent: false        // Don't notify subscribers
});
```

**Options**:
- `validate`: Run validation before setting (default: false)
- `persist`: Save to localStorage (default: false)
- `silent`: Don't notify subscribers (default: false)

#### 3. `store.subscribe(path, callback)`
Subscribe to changes at a specific path.

```javascript
// Subscribe to specific path
const unsubscribe = store.subscribe('system.x', (newValue, oldValue) => {
    updateKnobs(newValue);
});

// Subscribe to all changes under a path
const unsubscribe = store.subscribe('system.*', (path, newValue) => {
    console.log(`${path} changed to`, newValue);
});

// Subscribe to all state changes
const unsubscribe = store.subscribe('*', (path, newValue) => {
    console.log('State changed:', path, newValue);
});

// Clean up
unsubscribe();
```

**Callback Signature**:
```javascript
callback(newValue, oldValue, path)
```

#### 4. `store.batch(updates)`
Perform multiple updates in a single batch (only one notification).

```javascript
store.batch({
    'system.n': 5,
    'system.x': [0, 0, 0, 0, 0],
    'display.visibleKnobs': 5,
    'display.visibleBands': 5
});
```

#### 5. `store.persist(key, path)`
Persist a state path to localStorage.

```javascript
// Persist specific path
store.persist('jacobiSystem', 'system');

// Persist multiple paths
store.persist('jacobiDisplay', 'display');
```

#### 6. `store.restore(key, path)`
Restore state from localStorage.

```javascript
// Restore specific path
store.restore('jacobiSystem', 'system');

// Restore with default fallback
store.restore('jacobiSystem', 'system', {
    n: 3,
    A: [[4, -1, 1], [4, -8, 1], [-2, 1, 5]],
    b: [7, -21, 15],
    x: [1.0, 2.0, 2.0]
});
```

#### 7. `store.reset(path, defaultValue)`
Reset a state path to its default value.

```javascript
// Reset to default
store.reset('system', defaultSystemState);

// Reset specific value
store.reset('system.iteration', 0);
```

---

## State Update Patterns

### Pattern 1: Simple Update
For single value updates:

```javascript
// Old way
state.volume = 75;
updateVolumeDisplay();

// New way
store.set('audio.volume', 75);
// Subscribers automatically notified
```

### Pattern 2: Batch Update
For multiple related updates:

```javascript
// Old way
state.n = 5;
state.x = new Array(5).fill(0);
state.visibleKnobs = 5;
updateDisplays();

// New way
store.batch({
    'system.n': 5,
    'system.x': new Array(5).fill(0),
    'display.visibleKnobs': 5
});
// Single notification after all updates
```

### Pattern 3: Validated Update
For updates that need validation:

```javascript
// Old way
if (volume >= 0 && volume <= 100) {
    state.volume = volume;
    updateVolumeDisplay();
}

// New way
store.set('audio.volume', volume, { validate: true });
// Validation happens automatically
```

### Pattern 4: Reactive Update
For UI that should update automatically:

```javascript
// Old way
function updateKnobValue(index, value) {
    state.x[index] = value;
    updateKnobDisplay(index);
    updateBands();
}

// New way
// Subscribe once during initialization
store.subscribe('system.x', (newX) => {
    updateKnobDisplays(newX);
    updateBands();
});

// Then just update state
store.set(`system.x[${index}]`, value);
```

### Pattern 5: Computed Values
For values derived from state:

```javascript
// Subscribe to dependencies
store.subscribe('system.x', updateErrors);
store.subscribe('system.A', updateErrors);
store.subscribe('system.b', updateErrors);

function updateErrors() {
    const x = store.get('system.x');
    const A = store.get('system.A');
    const b = store.get('system.b');
    
    const errors = calculateErrors(A, x, b);
    const maxError = Math.max(...errors.map(Math.abs));
    
    store.set('system.errors', errors);
    store.set('system.maxError', maxError);
    store.set('system.converged', maxError < 0.0001);
}
```

---

## Persistence Strategy

### What to Persist

**Persisted State** (User Preferences):
- System configuration (`system.n`, `system.A`, `system.b`)
- Display preferences (`display.theme`, `display.visibility`)
- Audio preferences (`audio.volume`)
- Startup choice (`'default'` or `'custom'`)
- Welcome modal preference

**Not Persisted** (Session-Only):
- Current variable values (`system.x`) - reset on load
- Iteration count (`system.iteration`)
- Interaction state (`interaction.*`)
- Cache values (`cache.*`)
- Autoplay state (`iteration.*`)

### Persistence Keys

```javascript
const PERSISTENCE_KEYS = {
    SYSTEM_CONFIG: 'jacobiRadioCustomConfig',
    THEME: 'jacobiRadioTheme',
    VISIBILITY: 'jacobiRadioVisibility',
    VOLUME: 'jacobiRadioVolume',
    STARTUP_CHOICE: 'jacobiRadioStartupChoice',
    WELCOME_SHOWN: 'jacobiRadioWelcomeShown'
};
```

### Persistence Lifecycle

1. **On State Change**: If `persist: true` option is set, automatically save to localStorage
2. **On App Load**: Restore persisted state during initialization
3. **On Reset**: Clear persisted state (hard reset)
4. **On Error**: Fall back to defaults if restoration fails

### Example Persistence Setup

```javascript
// During initialization
store.restore('jacobiSystem', 'system', defaultSystemState);
store.restore('jacobiDisplay', 'display', defaultDisplayState);
store.restore('jacobiAudio', 'audio', defaultAudioState);

// When state changes (automatic if persist: true)
store.set('display.theme', 'modern', { persist: true });

// Manual persistence
store.persist('jacobiSystem', 'system');
```

---

## Migration Plan

### Phase 1: Setup (Week 1)
1. Create `stateManager.js` module with core API
2. Create state structure with categories
3. Implement get/set/subscribe methods
4. Add basic validation
5. Test with simple examples

### Phase 2: Integration (Week 2)
1. Replace direct state access with `store.get()`
2. Replace direct state mutation with `store.set()`
3. Add subscriptions for UI updates
4. Migrate one feature at a time (start with knobs)
5. Test thoroughly after each migration

### Phase 3: Persistence (Week 3)
1. Implement persistence methods
2. Migrate localStorage code to use store API
3. Add restoration on app load
4. Test persistence/restoration

### Phase 4: Optimization (Week 4)
1. Add batch updates where needed
2. Optimize subscriptions (debounce, etc.)
3. Add validation where needed
4. Performance testing
5. Documentation updates

### Migration Strategy

**Gradual Migration**: Don't change everything at once. Migrate incrementally:

1. **Start Small**: Migrate one feature (e.g., volume control)
2. **Test Thoroughly**: Ensure it works before moving on
3. **Expand Gradually**: Move to next feature
4. **Keep Old Code**: Don't delete old code until migration is complete
5. **Add Wrapper**: Create wrapper functions for backward compatibility during migration

**Backward Compatibility Wrapper**:
```javascript
// During migration, keep old state object for compatibility
const state = new Proxy({}, {
    get(target, prop) {
        return store.get(prop);
    },
    set(target, prop, value) {
        store.set(prop, value);
        return true;
    }
});
```

---

## Implementation Examples

### Example 1: Knob Value Update

**Before**:
```javascript
function updateKnobValue(index, value) {
    state.x[index] = value;
    updateKnobDisplay(index);
    updateBands();
    updateErrors();
}
```

**After**:
```javascript
// Subscribe once during initialization
store.subscribe('system.x', (newX) => {
    updateKnobDisplays(newX);
    updateBands();
    updateErrors();
});

// Update function becomes simple
function updateKnobValue(index, value) {
    store.set(`system.x[${index}]`, value);
}
```

### Example 2: System Configuration

**Before**:
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

**After**:
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
        persistKey: 'jacobiRadioCustomConfig'
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

### Example 3: Theme Toggle

**Before**:
```javascript
function toggleTheme() {
    state.theme = state.theme === 'vintage' ? 'modern' : 'vintage';
    applyTheme(state.theme);
    localStorage.setItem('jacobiRadioTheme', state.theme);
}
```

**After**:
```javascript
function toggleTheme() {
    const currentTheme = store.get('display.theme');
    const newTheme = currentTheme === 'vintage' ? 'modern' : 'vintage';
    store.set('display.theme', newTheme, { persist: true });
}

// Subscribe to theme changes
store.subscribe('display.theme', (theme) => {
    applyTheme(theme);
});
```

### Example 4: Autoplay Control

**Before**:
```javascript
function startAutoplay() {
    if (state.isAutoPlaying) return;
    state.isAutoPlaying = true;
    state.autoplayInterval = setInterval(() => {
        performIteration();
    }, getSpeedDelay(state.speed));
    updateAutoplayButton();
}
```

**After**:
```javascript
function startAutoplay() {
    if (store.get('iteration.isAutoPlaying')) return;
    
    const speed = store.get('iteration.speed');
    const interval = setInterval(() => {
        performIteration();
    }, getSpeedDelay(speed));
    
    store.set('iteration.isAutoPlaying', true);
    store.set('iteration.autoplayInterval', interval);
}

// Subscribe to autoplay state changes
store.subscribe('iteration.isAutoPlaying', (isPlaying) => {
    updateAutoplayButton(isPlaying);
});
```

### Example 5: Error Calculation

**Before**:
```javascript
function calculateErrors() {
    const errors = [];
    for (let i = 0; i < state.n; i++) {
        let lhs = 0;
        for (let j = 0; j < state.n; j++) {
            lhs += state.A[i][j] * state.x[j];
        }
        errors.push(lhs - state.b[i]);
    }
    state.errors = errors;
    state.maxError = Math.max(...errors.map(Math.abs));
    state.converged = state.maxError < 0.0001;
    updateErrorDisplays();
}
```

**After**:
```javascript
// Subscribe to dependencies
store.subscribe('system.x', calculateErrors);
store.subscribe('system.A', calculateErrors);
store.subscribe('system.b', calculateErrors);

function calculateErrors() {
    const n = store.get('system.n');
    const A = store.get('system.A');
    const x = store.get('system.x');
    const b = store.get('system.b');
    
    const errors = [];
    for (let i = 0; i < n; i++) {
        let lhs = 0;
        for (let j = 0; j < n; j++) {
            lhs += A[i][j] * x[j];
        }
        errors.push(lhs - b[i]);
    }
    
    const maxError = Math.max(...errors.map(Math.abs));
    
    store.batch({
        'system.errors': errors,
        'system.maxError': maxError,
        'system.converged': maxError < 0.0001
    });
}

// Subscribe to error changes
store.subscribe('system.errors', updateErrorDisplays);
store.subscribe('system.converged', (converged) => {
    if (converged) showSolutionButton();
});
```

---

## File Structure

### Proposed File Organization

```
/state
  ├── stateManager.js       # Core state management API
  ├── stateStructure.js     # State structure definitions
  ├── stateValidation.js    # Validation functions
  ├── statePersistence.js   # localStorage persistence
  └── stateSubscriptions.js # Subscription management
```

### Alternative: Single File

For simplicity, everything could be in one file:

```
/state
  └── stateManager.js       # Complete state management system
```

---

## Validation Rules

### System State Validation

```javascript
const validators = {
    'system.n': (value) => {
        if (!Number.isInteger(value) || value < 2 || value > 20) {
            throw new Error('n must be an integer between 2 and 20');
        }
    },
    
    'system.A': (value, state) => {
        const n = state.system.n;
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
    }
};
```

---

## Performance Considerations

### Subscription Optimization

1. **Debouncing**: Debounce rapid updates (e.g., knob dragging)
2. **Batching**: Use batch updates for multiple changes
3. **Selective Subscriptions**: Only subscribe to needed paths
4. **Cleanup**: Always unsubscribe when components are removed

### Update Optimization

1. **Shallow Comparison**: Only notify if value actually changed
2. **Path Filtering**: Subscribers can filter by path patterns
3. **Lazy Evaluation**: Compute derived values only when needed

---

## Testing Strategy

### Unit Tests

- Test get/set operations
- Test subscription notifications
- Test validation
- Test persistence/restoration
- Test batch updates

### Integration Tests

- Test state updates trigger UI updates
- Test persistence across page reloads
- Test error handling

---

## Future Enhancements

### Potential Additions (Not in MVP)

1. **Time-Travel Debugging**: Store state history, allow undo/redo
2. **State DevTools**: Browser extension for state inspection
3. **Middleware**: Intercept state updates (logging, analytics)
4. **State Snapshots**: Save/restore state snapshots
5. **State Diffing**: Show what changed between updates
6. **Async Updates**: Support async state updates
7. **State Migrations**: Handle state structure changes over time

---

## Summary

This state management system provides:

✅ **Simple API**: Easy to use get/set/subscribe methods  
✅ **Centralized State**: Single source of truth  
✅ **Reactive Updates**: Automatic UI updates via subscriptions  
✅ **Persistence**: Built-in localStorage support  
✅ **Validation**: Optional validation for state updates  
✅ **Performance**: Optimized with batching and selective subscriptions  
✅ **Maintainability**: Clear structure and patterns  
✅ **Backward Compatible**: Can migrate gradually  

The system is designed to be **simple enough** for the current project size while being **extensible enough** for future growth.

---

## Appendix: Quick Reference

### Common Patterns

```javascript
// Get state
const value = store.get('path.to.value');

// Set state
store.set('path.to.value', newValue);

// Subscribe
const unsubscribe = store.subscribe('path', callback);

// Batch update
store.batch({ 'path1': value1, 'path2': value2 });

// Persist
store.set('path', value, { persist: true });

// Restore
store.restore('key', 'path', defaultValue);
```

---

**End of Document**

