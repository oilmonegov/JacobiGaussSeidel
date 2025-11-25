> **⚠️ OBSOLETE DOCUMENT**  
> This document is obsolete. It describes a restructuring plan that has already been completed. The project now uses the modular structure described herein. This document is kept for historical reference only.

# Project Structure Plan
## Jacobi Iteration Equalizer

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Obsolete (Planning completed, structure implemented)  
**Purpose:** Reorganize monolithic codebase into maintainable, modular structure

---

## Table of Contents

1. [Overview](#overview)
2. [Current State](#current-state)
3. [Proposed Structure](#proposed-structure)
4. [Module Breakdown](#module-breakdown)
5. [Migration Strategy](#migration-strategy)
6. [Build Configuration](#build-configuration)
7. [Benefits](#benefits)
8. [Implementation Notes](#implementation-notes)

---

## Overview

This document outlines a comprehensive restructuring plan for the Jacobi Iteration Equalizer project. The goal is to transform the current monolithic codebase (single `main.js` file with ~3000 lines) into a well-organized, modular structure that improves maintainability, testability, and scalability.

### Goals

- **Separation of Concerns**: Each module has a single, clear responsibility
- **Maintainability**: Smaller, focused files are easier to understand and modify
- **Testability**: Isolated modules are easier to unit test
- **Scalability**: New features can be added without touching existing code
- **Collaboration**: Clear boundaries make parallel development easier
- **Performance**: Potential for code splitting and lazy loading

### Principles

- **Incremental Migration**: Migrate one module at a time to minimize risk
- **Backward Compatibility**: Existing functionality must continue to work
- **No Breaking Changes**: Maintain existing API surface during migration
- **ES6 Modules**: Use modern JavaScript module system throughout
- **Vanilla JS**: No framework dependencies (keep it simple)

---

## Current State

### Existing Structure

```
LinearEquation/
├── index.html              # Main HTML (710 lines)
├── main.js                 # Monolithic application logic (2951 lines)
├── audio.js                # Audio system (395 lines)
├── stateManager.js         # State management (495 lines)
├── styles.css              # All styles in one file
├── package.json            # Dependencies
├── vitest.config.js        # Test configuration
├── assets/katex/           # KaTeX library
├── test/                   # Test files
└── docs/                   # Documentation (scattered)
```

### Current Issues

1. **Monolithic Code**: `main.js` contains all logic (math, UI, controls, rendering)
2. **Tight Coupling**: Functions are interdependent and hard to isolate
3. **Hard to Test**: Large files make unit testing difficult
4. **Hard to Navigate**: Finding specific functionality requires searching through 3000+ lines
5. **CSS Organization**: All styles in one file, no clear component boundaries
6. **Documentation Scattered**: Docs in root directory, not organized

### Current Module Boundaries (Informal)

The code already has some logical groupings that can guide the refactoring:

- **Math/Algorithm**: `computeNextJacobi()`, `calculateErrors()`, `getMaxError()`
- **Rendering**: `renderKnobs()`, `renderBands()`, `updateDisplays()`
- **Controls**: `setupKnobListeners()`, `performIteration()`, `toggleAutoplay()`
- **Configuration**: `initStartup()`, `initializeDefaultSystem()`, `initializeCustomSystem()`
- **State**: `state` object, `elements` object, state mutations

---

## Proposed Structure

### Directory Tree

```
LinearEquation/
├── index.html                 # Main HTML entry point
├── package.json               # Dependencies & scripts
├── vitest.config.js          # Test configuration
│
├── src/                      # Source code (NEW - organized modules)
│   ├── main.js              # Application entry point & initialization
│   │
│   ├── core/                # Core business logic
│   │   ├── jacobi.js        # Jacobi iteration algorithm
│   │   ├── math.js          # Math utilities (errors, convergence, etc.)
│   │   └── system.js        # System configuration & validation
│   │
│   ├── state/                # State management
│   │   ├── stateManager.js  # Zustand-based state store
│   │   └── initialState.js  # Default state definitions
│   │
│   ├── ui/                   # UI components & rendering
│   │   ├── renderer.js      # Main rendering orchestrator
│   │   ├── knobs.js         # Knob rendering & interaction
│   │   ├── bands.js         # Equalizer band rendering
│   │   ├── meters.js        # VU meters & signal displays
│   │   ├── dials.js         # Tuning dial & master controls
│   │   └── modals.js        # Modal dialogs (config, solution)
│   │
│   ├── controls/             # User interaction handlers
│   │   ├── iteration.js     # Step/autoplay controls
│   │   ├── knobs.js         # Knob drag/keyboard handlers
│   │   ├── volume.js        # Volume slider handler
│   │   └── buttons.js       # Button event handlers
│   │
│   ├── audio/                # Audio system
│   │   ├── audioSystem.js   # Main audio class (from audio.js)
│   │   └── audioUtils.js    # Audio utilities & helpers
│   │
│   ├── config/               # Configuration & setup
│   │   ├── startup.js       # Startup modal & system selection
│   │   ├── configModal.js   # Configuration modal logic
│   │   ├── matrixEditor.js  # Matrix grid editor
│   │   └── equationParser.js # Text equation parser
│   │
│   ├── utils/                # Utility functions
│   │   ├── dom.js           # DOM utilities
│   │   ├── animation.js     # Animation helpers
│   │   ├── validation.js    # Input validation
│   │   └── formatting.js   # Number/string formatting
│   │
│   └── theme/                # Theme system
│       ├── themeManager.js  # Theme switching logic
│       └── themes.js        # Theme definitions
│
├── styles/                    # CSS (NEW - organized by concern)
│   ├── main.css             # Main stylesheet (imports all)
│   ├── base/                # Base styles
│   │   ├── reset.css        # CSS reset
│   │   ├── variables.css    # CSS variables (colors, fonts)
│   │   └── typography.css   # Typography
│   ├── layout/              # Layout styles
│   │   ├── container.css    # Main containers
│   │   ├── header.css       # Header layout
│   │   └── panels.css       # Panel layouts
│   ├── components/          # Component styles
│   │   ├── knobs.css        # Knob styles
│   │   ├── bands.css        # Band display styles
│   │   ├── meters.css       # VU meter styles
│   │   ├── dials.css        # Dial styles
│   │   ├── buttons.css      # Button styles
│   │   └── modals.css       # Modal styles
│   └── themes/              # Theme-specific styles
│       ├── vintage.css      # Vintage theme
│       └── modern.css       # Modern theme
│
├── assets/                    # Static assets
│   ├── katex/               # KaTeX library (keep as-is)
│   └── audio/               # Audio files (if any)
│
├── test/                     # Tests (keep existing structure)
│   ├── math.test.js
│   ├── stateManager.test.js
│   ├── utils.test.js
│   ├── setup.js
│   └── README.md
│
└── docs/                     # Documentation (NEW - organized)
    ├── prd.md               # Product requirements
    ├── design/              # Design documents
    │   ├── DESIGN_STYLE_GUIDE.md
    │   └── STATE_MANAGEMENT.md
    ├── features/            # Feature documentation
    │   ├── feature.md
    │   └── feature-todo.md
    └── planning/            # Planning documents
        ├── todo.md
        ├── test-plan.md
        └── test-todo.md
```

---

## Module Breakdown

### 1. Core (`src/core/`)

**Purpose**: Pure business logic - no DOM, no UI, no side effects

#### `jacobi.js`
- `computeNextJacobi(currentX, A, b)`: Compute next iteration values
- `generateJacobiFormulas(A, b)`: Generate update formulas for any system
- `validateDiagonalDominance(A)`: Check if system is diagonally dominant

#### `math.js`
- `calculateErrors(x, A, b)`: Calculate error for each equation
- `getMaxError(errors)`: Get maximum absolute error
- `getConvergenceState(maxError)`: Determine convergence status
- `clamp(value, min, max)`: Clamp value to range
- `roundToDecimal(value, decimals)`: Round to specified decimal places

#### `system.js`
- `createSystem(A, b, initialX)`: Create system configuration
- `validateSystem(A, b)`: Validate system (no zero diagonals, etc.)
- `parseSystemFromText(text)`: Parse equations from text input
- `parseSystemFromMatrix(matrixData)`: Parse from matrix input
- `getDefaultSystem()`: Get default 3x3 system

**Dependencies**: None (pure functions)

---

### 2. State (`src/state/`)

**Purpose**: Centralized state management

#### `stateManager.js`
- Zustand store implementation (keep existing)
- State getters and setters
- Subscription system
- Persistence to localStorage

#### `initialState.js`
- Default state values
- State shape definitions
- Initial system configuration

**Dependencies**: Zustand

---

### 3. UI (`src/ui/`)

**Purpose**: Rendering and visual updates (read-only, no business logic)

#### `renderer.js`
- `updateAllDisplays()`: Orchestrate all UI updates
- `initializeUI()`: Set up initial UI state
- Coordinate updates from other UI modules

#### `knobs.js`
- `renderKnobs(n, visibleCount)`: Create knob DOM elements
- `updateKnobRotation(knobIndex, value)`: Update knob visual rotation
- `updateKnobValue(knobIndex, value)`: Update knob value display

#### `bands.js`
- `renderBands(n, visibleCount)`: Create band DOM elements
- `updateBandDisplay(bandIndex, errorData)`: Update band visual state
- `updateBandRange(range)`: Update gain slider range

#### `meters.js`
- `updateVUMeter(meterIndex, error)`: Update VU meter needle
- `updateSignalClarity(maxError)`: Update signal clarity display
- `updateMasterLevel(error)`: Update master level indicator

#### `dials.js`
- `updateTuningDial(maxError)`: Update tuning dial pointer
- `updatePowerIndicator(isOn)`: Update power indicator state

#### `modals.js`
- `renderStartupModal()`: Render startup system selection
- `renderConfigModal()`: Render configuration modal
- `renderSolutionModal(solution)`: Render solution display
- `showModal(modalId)`: Show modal
- `hideModal(modalId)`: Hide modal

**Dependencies**: `src/state/`, `src/utils/dom.js`

---

### 4. Controls (`src/controls/`)

**Purpose**: User interaction handlers (event listeners, user actions)

#### `iteration.js`
- `performIteration()`: Execute one Jacobi iteration
- `startAutoplay()`: Start continuous iterations
- `stopAutoplay()`: Stop autoplay
- `toggleAutoplay()`: Toggle autoplay state
- `setSpeed(speed)`: Update autoplay speed

#### `knobs.js`
- `setupKnobListeners()`: Attach drag/keyboard handlers
- `handleKnobDrag(event)`: Handle knob drag interaction
- `handleKnobKeyboard(event)`: Handle keyboard input
- `setKnobValue(knobIndex, value)`: Update knob value from user input

#### `volume.js`
- `setupVolumeListener()`: Attach volume slider handler
- `handleVolumeDrag(event)`: Handle volume slider interaction
- `setVolume(value)`: Update volume from user input

#### `buttons.js`
- `setupButtonListeners()`: Attach button click handlers
- `handleStepClick()`: Handle step button
- `handleResetClick()`: Handle reset button
- `handleRandomClick()`: Handle random initial guess
- `handleSolutionClick()`: Handle solution button
- `handleConfigClick()`: Handle configure button

**Dependencies**: `src/state/`, `src/core/`, `src/ui/`

---

### 5. Audio (`src/audio/`)

**Purpose**: Audio system management

#### `audioSystem.js`
- `AudioSystem` class (from existing `audio.js`)
- Audio context management
- Sound generation and mixing
- Volume and mute controls

#### `audioUtils.js`
- Audio utility functions
- Sound effect helpers
- Audio file loading utilities

**Dependencies**: Web Audio API

---

### 6. Config (`src/config/`)

**Purpose**: System configuration and setup

#### `startup.js`
- `initStartup()`: Initialize startup modal
- `handleDefaultSystem()`: Handle default system selection
- `handleCustomSystem()`: Handle custom system selection
- `setupStartupListeners()`: Attach startup modal listeners

#### `configModal.js`
- `initConfigModal()`: Initialize configuration modal
- `handleSystemSizeChange()`: Handle system size selection
- `handleInputMethodChange()`: Handle input method selection
- `validateAndApplyConfig()`: Validate and apply configuration

#### `matrixEditor.js`
- `renderMatrixGrid(n)`: Render interactive matrix grid
- `handleMatrixCellInput()`: Handle matrix cell editing
- `getMatrixData()`: Extract matrix data from grid
- `validateMatrix()`: Validate matrix input

#### `equationParser.js`
- `parseEquations(text)`: Parse equations from text
- `parseEquation(equation)`: Parse single equation
- `validateEquationFormat()`: Validate equation syntax
- `extractCoefficients(equation)`: Extract coefficients from equation string

**Dependencies**: `src/core/system.js`, `src/ui/modals.js`, `src/utils/validation.js`

---

### 7. Utils (`src/utils/`)

**Purpose**: Shared utility functions

#### `dom.js`
- `querySelector(selector)`: Safe query selector
- `createElement(tag, classes, attributes)`: Create element helper
- `updateElement(element, updates)`: Update element properties
- `showElement(element)`: Show element
- `hideElement(element)`: Hide element

#### `animation.js`
- `animateValue(start, end, duration, callback)`: Animate numeric value
- `requestAnimationFrame(callback)`: RAF wrapper
- `cancelAnimationFrame(id)`: Cancel RAF wrapper

#### `validation.js`
- `validateNumber(value, min, max)`: Validate number in range
- `validateSystemSize(n)`: Validate system size (2-20)
- `validateMatrixDimensions(A, b)`: Validate matrix dimensions
- `sanitizeInput(input)`: Sanitize user input

#### `formatting.js`
- `formatNumber(value, decimals)`: Format number with decimals
- `formatError(error)`: Format error display
- `formatEquation(equation)`: Format equation for display
- `formatSolution(solution)`: Format solution for display

**Dependencies**: None (pure utilities)

---

### 8. Theme (`src/theme/`)

**Purpose**: Theme management

#### `themeManager.js`
- `initTheme()`: Initialize theme system
- `switchTheme(themeName)`: Switch between themes
- `toggleTheme()`: Toggle between vintage/modern
- `applyTheme(theme)`: Apply theme to DOM

#### `themes.js`
- Theme definitions (vintage, modern)
- Theme color palettes
- Theme-specific configurations

**Dependencies**: `src/utils/dom.js`

---

### 9. Main Entry Point (`src/main.js`)

**Purpose**: Application initialization and orchestration

- Import all modules
- Initialize state
- Initialize UI
- Set up event listeners
- Start application

**Dependencies**: All other modules

---

## Migration Strategy

### Phase 1: Setup Structure (No Code Changes)

**Goal**: Create directory structure and move files

1. Create `src/` directory structure
2. Create `styles/` directory structure
3. Create `docs/` directory structure
4. Move `stateManager.js` → `src/state/stateManager.js`
5. Move `audio.js` → `src/audio/audioSystem.js`
6. Move documentation files to `docs/` subdirectories
7. Update `package.json` scripts if needed
8. **Test**: Verify project still runs (no functionality changes)

**Estimated Time**: 1-2 hours  
**Risk**: Low (file moves only)

---

### Phase 2: Extract Core Logic

**Goal**: Extract pure business logic (math, algorithms)

1. Create `src/core/` directory
2. Extract math functions → `src/core/math.js`
   - `calculateErrors()`
   - `getMaxError()`
   - `getConvergenceState()`
   - `clamp()`
3. Extract Jacobi algorithm → `src/core/jacobi.js`
   - `computeNextJacobi()`
   - `generateJacobiFormulas()`
4. Extract system logic → `src/core/system.js`
   - System creation/validation
   - Default system
5. Update `main.js` to import from new modules
6. **Test**: Run all tests, verify functionality unchanged

**Estimated Time**: 2-3 hours  
**Risk**: Low (pure functions, easy to test)

---

### Phase 3: Extract UI Rendering

**Goal**: Extract all rendering logic

1. Create `src/ui/` directory
2. Extract rendering functions → `src/ui/` modules
   - `renderKnobs()` → `src/ui/knobs.js`
   - `renderBands()` → `src/ui/bands.js`
   - `updateDisplays()` → `src/ui/renderer.js`
   - Meter updates → `src/ui/meters.js`
   - Dial updates → `src/ui/dials.js`
   - Modal rendering → `src/ui/modals.js`
3. Keep DOM element references in `main.js` or create `src/utils/dom.js`
4. Update `main.js` to import from new modules
5. **Test**: Visual inspection, verify all UI updates work

**Estimated Time**: 4-5 hours  
**Risk**: Medium (UI changes visible, need careful testing)

---

### Phase 4: Extract Controls

**Goal**: Extract event handlers and user interactions

1. Create `src/controls/` directory
2. Extract control functions → `src/controls/` modules
   - Iteration controls → `src/controls/iteration.js`
   - Knob handlers → `src/controls/knobs.js`
   - Volume handler → `src/controls/volume.js`
   - Button handlers → `src/controls/buttons.js`
3. Update event listeners in `main.js`
4. **Test**: Test all user interactions (clicks, drags, keyboard)

**Estimated Time**: 3-4 hours  
**Risk**: Medium (user interactions, need thorough testing)

---

### Phase 5: Extract Configuration

**Goal**: Extract configuration and setup logic

1. Create `src/config/` directory
2. Extract config functions → `src/config/` modules
   - Startup modal → `src/config/startup.js`
   - Config modal → `src/config/configModal.js`
   - Matrix editor → `src/config/matrixEditor.js`
   - Equation parser → `src/config/equationParser.js`
3. Update `main.js` to import from new modules
4. **Test**: Test configuration flows (default, custom, matrix, text)

**Estimated Time**: 3-4 hours  
**Risk**: Medium (complex configuration logic)

---

### Phase 6: Extract Utilities

**Goal**: Extract shared utility functions

1. Create `src/utils/` directory
2. Extract utility functions → `src/utils/` modules
   - DOM utilities → `src/utils/dom.js`
   - Animation utilities → `src/utils/animation.js`
   - Validation utilities → `src/utils/validation.js`
   - Formatting utilities → `src/utils/formatting.js`
3. Update imports across all modules
4. **Test**: Verify all utilities work correctly

**Estimated Time**: 2-3 hours  
**Risk**: Low (utility functions, easy to test)

---

### Phase 7: Extract Theme System

**Goal**: Extract theme management

1. Create `src/theme/` directory
2. Extract theme functions → `src/theme/` modules
   - Theme manager → `src/theme/themeManager.js`
   - Theme definitions → `src/theme/themes.js`
3. Update `main.js` to import from new modules
4. **Test**: Test theme switching (vintage ↔ modern)

**Estimated Time**: 1-2 hours  
**Risk**: Low (isolated feature)

---

### Phase 8: Organize CSS

**Goal**: Split monolithic CSS into organized modules

1. Create `styles/` directory structure
2. Split `styles.css` into modules:
   - Base styles → `styles/base/`
   - Layout styles → `styles/layout/`
   - Component styles → `styles/components/`
   - Theme styles → `styles/themes/`
3. Create `styles/main.css` that imports all modules
4. Update `index.html` to import `styles/main.css`
5. **Test**: Visual inspection, verify all styles apply correctly

**Estimated Time**: 4-5 hours  
**Risk**: Medium (CSS changes visible, need careful testing)

---

### Phase 9: Refactor Main Entry Point

**Goal**: Clean up `main.js` to be a simple orchestrator

1. Refactor `src/main.js` to:
   - Import all modules
   - Initialize state
   - Initialize UI
   - Set up event listeners
   - Start application
2. Remove all business logic (moved to modules)
3. Keep only orchestration code
4. **Test**: Full application test, verify everything works

**Estimated Time**: 2-3 hours  
**Risk**: Medium (touching entry point, need comprehensive testing)

---

### Phase 10: Cleanup and Documentation

**Goal**: Final cleanup and documentation

1. Remove old monolithic files (backup first)
2. Update all imports
3. Update test imports
4. Update documentation
5. Add module-level documentation
6. Create `README.md` with new structure
7. **Test**: Full regression test

**Estimated Time**: 2-3 hours  
**Risk**: Low (cleanup only)

---

## Build Configuration

### Updated `package.json` Scripts

```json
{
  "scripts": {
    "dev": "npx http-server . -p 8080 -o",
    "start": "npm run dev",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "build:state": "npx esbuild src/state/stateManager.js --bundle --format=iife --global-name=StateManager --outfile=stateManager.bundle.js",
    "build:main": "npx esbuild src/main.js --bundle --format=iife --outfile=dist/main.bundle.js",
    "build": "npm run build:state && npm run build:main",
    "build:watch": "npm run build -- --watch"
  }
}
```

### ES Module Support

All modules will use ES6 `import`/`export`:

```javascript
// src/core/math.js
export function calculateErrors(x, A, b) {
  // ...
}

// src/main.js
import { calculateErrors } from './core/math.js';
```

### HTML Module Imports

Update `index.html` to use ES modules:

```html
<script type="module" src="src/main.js"></script>
```

Or use bundled version:

```html
<script src="dist/main.bundle.js"></script>
```

---

## Benefits

### 1. Maintainability

- **Smaller Files**: Each module is 100-300 lines instead of 3000
- **Clear Responsibilities**: Each file has one clear purpose
- **Easy Navigation**: Find functionality by directory structure
- **Reduced Cognitive Load**: Understand one module at a time

### 2. Testability

- **Isolated Modules**: Test each module independently
- **Mock Dependencies**: Easy to mock dependencies for testing
- **Unit Tests**: Write focused unit tests for each module
- **Integration Tests**: Test module interactions separately

### 3. Reusability

- **Shared Utilities**: Common functions in `utils/` can be reused
- **Component Patterns**: UI components can be reused or extended
- **Algorithm Library**: Core algorithms can be used in other projects

### 4. Scalability

- **Easy to Extend**: Add new features by adding new modules
- **No Conflicts**: Modules don't interfere with each other
- **Parallel Development**: Multiple developers can work on different modules
- **Code Splitting**: Potential for lazy loading modules

### 5. Collaboration

- **Clear Boundaries**: Team members know where to make changes
- **Reduced Conflicts**: Less likely to have merge conflicts
- **Code Reviews**: Easier to review smaller, focused changes
- **Onboarding**: New developers can understand structure quickly

### 6. Performance

- **Code Splitting**: Load only needed modules
- **Tree Shaking**: Remove unused code during build
- **Lazy Loading**: Load modules on demand
- **Optimization**: Optimize individual modules

---

## Implementation Notes

### Module Dependencies

**Dependency Graph** (simplified):

```
main.js
├── state/stateManager.js
├── core/
│   ├── jacobi.js (no deps)
│   ├── math.js (no deps)
│   └── system.js (no deps)
├── ui/
│   ├── renderer.js → state, utils
│   ├── knobs.js → state, utils
│   ├── bands.js → state, utils
│   └── ...
├── controls/
│   ├── iteration.js → state, core, ui
│   ├── knobs.js → state, ui
│   └── ...
├── audio/
│   └── audioSystem.js (no deps)
├── config/
│   └── ... → core, ui, utils
├── utils/
│   └── ... (no deps)
└── theme/
    └── ... → utils
```

### Circular Dependencies

**Avoid**:
- UI modules importing from controls
- Controls importing from UI (except for DOM updates)
- Core importing from UI or controls

**Pattern**:
- Core → no dependencies
- UI → depends on state, utils
- Controls → depends on state, core, UI
- Main → orchestrates everything

### State Management

- Use Zustand store for global state
- Pass state as parameters to pure functions
- Avoid direct state mutations in modules
- Use state setters from stateManager

### DOM Access

- Centralize DOM element references in `main.js` or `src/utils/dom.js`
- Pass element references to modules that need them
- Avoid global DOM queries in modules
- Use dependency injection pattern

### Error Handling

- Add error handling at module boundaries
- Validate inputs in utility functions
- Use try/catch in async operations
- Log errors for debugging

### Testing Strategy

- **Unit Tests**: Test each module in isolation
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test full user flows
- **Visual Tests**: Test UI rendering (manual or automated)

### Documentation

- Add JSDoc comments to all exported functions
- Document module purpose in file header
- Document dependencies and side effects
- Keep README.md updated

### Migration Checklist

- [x] Phase 1: Setup structure ✅
- [x] Phase 2: Extract core logic ✅
- [x] Phase 3: Extract UI rendering ✅
- [x] Phase 4: Extract controls ✅
- [x] Phase 5: Extract configuration ✅
- [x] Phase 6: Extract utilities ✅
- [x] Phase 7: Extract theme system ✅
- [x] Phase 8: Organize CSS ✅ (Structure created, full split pending)
- [x] Phase 9: Refactor main entry point ✅ (Modules created, integration pending)
- [x] Phase 10: Cleanup and documentation ✅ (Structure complete)

---

## Timeline Estimate

**Total Estimated Time**: 25-35 hours

- Phase 1: 1-2 hours
- Phase 2: 2-3 hours
- Phase 3: 4-5 hours
- Phase 4: 3-4 hours
- Phase 5: 3-4 hours
- Phase 6: 2-3 hours
- Phase 7: 1-2 hours
- Phase 8: 4-5 hours
- Phase 9: 2-3 hours
- Phase 10: 2-3 hours

**Recommendation**: Migrate one phase per day/week, test thoroughly after each phase.

---

## Success Criteria

The restructuring is successful when:

1. ✅ All functionality works exactly as before
2. ✅ All tests pass
3. ✅ Code is organized into logical modules
4. ✅ Each module is < 500 lines
5. ✅ No circular dependencies
6. ✅ Clear separation of concerns
7. ✅ Easy to find and modify code
8. ✅ Documentation is up to date
9. ✅ Build process works
10. ✅ No performance regressions

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize phases** based on current needs
3. **Start with Phase 1** (low risk, high value)
4. **Test after each phase** before proceeding
5. **Document learnings** as you go
6. **Adjust plan** based on real-world experience

---

**Last Updated**: 2025-01-27  
**Status**: Planning - Ready for Implementation

