/**
 * Main application logic for Jacobi Iteration Equalizer
 * 
 * This application simulates solving a system of linear equations using
 * the Jacobi iteration method, presented as a vintage audio equalizer interface.
 * 
 * System of equations:
 *   4x₁ - x₂ + x₃ = 7
 *   4x₁ - 8x₂ + x₃ = -21
 *   -2x₁ + x₂ + 5x₃ = 15
 * 
 * True solution: x₁ = 2, x₂ = 4, x₃ = 3
 */

// Import core modules
import { calculateErrors, getMaxError, getConvergenceState, clamp } from './src/core/math.js';
import { computeNextJacobi } from './src/core/jacobi.js';
import { computeNextGaussSeidel } from './src/core/gaussSeidel.js';
import { getDefaultSystem } from './src/core/system.js';
import { renderLaTeXWithKaTeX } from './src/utils/formatting.js';
import { initEquationVisualizer, updateEquationVisualizer, addIterationSnapshot, clearEquationHistory } from './src/ui/equationVisualizer.js';
import { startMeasurement, updateMeasurement, completeMeasurement, resetCurrentRun } from './src/utils/performance.js';
import { updatePerformanceDisplay } from './src/ui/performanceDisplay.js';
import { exportPerformanceToCSV, downloadCSV, generateFilename } from './src/utils/export.js';

// State management
const state = {
    // Dynamic System State
    n: 3,
    A: [
        [4, -1, 1],
        [4, -8, 1],
        [-2, 1, 5]
    ],
    b: [7, -21, 15],
    x: [1.0, 2.0, 2.0],
    
    iteration: 0,
    isAutoPlaying: false,
    autoplayInterval: null,
    speed: 50, // 1-100, maps to 2000ms to 100ms delay
    isDragging: false,
    dragKnob: null,
    dragKnobElement: null,
    dragStartY: 0,
    dragStartX: 0,
    dragStartValue: 0,
    knobUpdateRaf: null,
    focusedKnob: null, // Track which knob has keyboard focus
    volume: 50, // 0-100
    isDraggingVolume: false,
    volumeTrackRect: null,
    volumeHasMoved: false,
    volumeUpdateRaf: null,
    theme: 'vintage', // 'vintage' or 'modern'
    // Dynamic range tracking for gain sliders
    bandRangeMin: -12,
    bandRangeMax: 12,
    bandRangeCenter: 0,
    visibleKnobs: 3,
    visibleBands: 3,
    // Cache for optimization
    lastBandRange: null, // Cache last calculated range to avoid unnecessary updates
    lastMaxError: null, // Cache last max error for comparison
    initialGuess: [1.0, 2.0, 2.0], // Store initial guess for reset functionality
    equationHistory: [], // History of iteration snapshots for equation visualizer
    method: 'jacobi', // 'jacobi' or 'gaussSeidel'
    performanceHistory: {
        jacobi: { runs: [], currentRun: null },
        gaussSeidel: { runs: [], currentRun: null }
    },
    // Visibility state for all components
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
};

// DOM elements
const elements = {
    // Dynamic elements will be populated by renderKnobs and renderBands
    knobsContainer: document.querySelector('.knobs-container'),
    bandsContainer: document.querySelector('.equalizer-bands'),
    
    // Static elements
    stepBtn: document.getElementById('stepBtn'),
    autoplayBtn: document.getElementById('autoplayBtn'),
    resetBtn: document.getElementById('resetBtn'),
    randomBtn: document.getElementById('randomBtn'),
    speedSlider: document.getElementById('speedSlider'),
    speedSliderFill: document.getElementById('speedSliderFill'),
    speedValue: document.getElementById('speedValue'),
    iterationCount: document.getElementById('iterationCount'),
    maxError: document.getElementById('maxError'),
    convergenceStatus: document.getElementById('convergenceStatus'),
    signalClarityDisplay: document.getElementById('signalClarityDisplay'),
    equationHistoryBtn: document.getElementById('equationHistoryBtn'),
    equationHistoryModal: document.getElementById('equationHistoryModal'),
    closeEquationHistoryModal: document.getElementById('closeEquationHistoryModal'),
    closeEquationHistoryBtn: document.getElementById('closeEquationHistoryBtn'),
    solutionBtn: document.getElementById('solutionBtn'),
    solutionModal: document.getElementById('solutionModal'),
    closeSolutionModal: document.getElementById('closeSolutionModal'),
    printSolutionBtn: document.getElementById('printSolutionBtn'),
    closeSolutionBtn: document.getElementById('closeSolutionBtn'),
    powerIndicator: document.getElementById('powerIndicator'),
    speakerGrille: document.getElementById('speakerGrille'),
    band1: document.getElementById('band1'),
    band2: document.getElementById('band2'),
    band3: document.getElementById('band3'),
    masterMeterFill: document.getElementById('masterMeterFill'),
    lhs1: document.getElementById('lhs1'),
    lhs2: document.getElementById('lhs2'),
    lhs3: document.getElementById('lhs3'),
    error1: document.getElementById('error1'),
    error2: document.getElementById('error2'),
    error3: document.getElementById('error3'),
    meter1: document.getElementById('meter1'),
    meter2: document.getElementById('meter2'),
    meter3: document.getElementById('meter3'),
    target1: document.getElementById('target1'),
    target2: document.getElementById('target2'),
    target3: document.getElementById('target3'),
    welcomeModal: document.getElementById('welcomeModal'),
    closeModal: document.getElementById('closeModal'),
    dontShowAgain: document.getElementById('dontShowAgain'),
    helpPanel: document.getElementById('helpPanel'),
    helpBtn: document.getElementById('helpBtn'),
    configBtn: document.getElementById('configBtn'),
    helpClose: document.getElementById('helpClose'),
    volumeSliderTrack: document.getElementById('volumeSliderTrack'),
    volumeSliderThumb: document.getElementById('volumeSliderThumb'),
    volumeSliderFill: document.getElementById('volumeSliderFill'),
    startupModal: document.getElementById('startupModal'),
    btnUseDefault: document.getElementById('btnUseDefault'),
    btnConfigureCustom: document.getElementById('btnConfigureCustom'),
    rememberStartupChoice: document.getElementById('rememberStartupChoice'),
    learnMoreBtns: document.querySelectorAll('.learn-more-btn'),
    
    themeToggle: document.getElementById('themeToggle'),
    radioBody: document.querySelector('.radio-body'),
    container: document.querySelector('.container'),
    // Visibility control elements
    visibilityBtn: null, // Will be set in init
    header: document.querySelector('.header'),
    equalizerBands: document.querySelector('.equalizer-bands'),
    signalClarityDisplay: document.getElementById('signalClarityDisplay'),
    radioPanel: document.querySelector('.radio-panel'),
    knobsContainer: document.querySelector('.knobs-container'),
    volumeControl: document.querySelector('.radio-volume-control'),
    tuningDial: document.getElementById('tuningDial'),
    controls: document.querySelector('.controls')
};

// Startup Logic
function initStartup() {
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
        // For now, default to custom system setup (placeholder)
        // In the future, this will load the custom configuration
        initializeCustomSystem();
    } else {
        // Show startup modal if no choice saved
        if (elements.startupModal) {
            elements.startupModal.classList.remove('hidden');
            // Render KaTeX equations when modal is shown
            if (typeof katex !== 'undefined') {
                setTimeout(() => {
                    renderKaTeXEquations(elements.startupModal);
                }, 10);
            }
        }
    }
}

function initializeDefaultSystem() {
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
    
    // Initialize default values (already done by default state)
    state.n = 3; // Ensure system size is set
    // Ensure initialGuess is set for reset functionality
    if (!state.initialGuess || state.initialGuess.length !== state.n) {
        state.initialGuess = [...state.x];
    }
}

function initializeCustomSystem() {
    // Hide startup modal first
    if (elements.startupModal) {
        elements.startupModal.classList.add('hidden');
    }
    
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
            
            renderKnobs();
            renderBands();
            updateDisplays();
            
            showMessage('Loaded custom configuration.', 'success');
        } catch (e) {
            console.error("Error loading config", e);
            // Use requestAnimationFrame to ensure DOM has updated before showing config modal
            // This prevents the click event from propagating to the config modal overlay
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    showConfigModal();
                });
            });
        }
    } else {
        // Open Config Modal if no saved config
        // Use requestAnimationFrame to ensure DOM has updated before showing config modal
        // This prevents the click event from propagating to the config modal overlay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                showConfigModal();
            });
        });
    }
}

function setupStartupListeners() {
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
            initializeDefaultSystem();
        });
    }
    
    // Option: Configure Custom
    if (elements.btnConfigureCustom) {
        elements.btnConfigureCustom.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Prevent event from bubbling to modal overlay
            if (elements.rememberStartupChoice && elements.rememberStartupChoice.checked) {
                try {
                    localStorage.setItem('jacobiRadioStartupChoice', 'custom');
                } catch (err) {
                    console.warn('Could not save startup choice to localStorage:', err);
                }
            }
            // Use setTimeout to ensure the startup modal closes before opening config modal
            // This prevents the click event from propagating to the config modal overlay
            initializeCustomSystem();
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

// computeNextJacobi moved to src/core/jacobi.js

// clamp, calculateErrors, getMaxError, getConvergenceState moved to src/core/math.js

// Update knob visual rotation
function updateKnobRotation(knob, value, immediate = false) {
    // Map value from [-10, 10] to rotation angle [-135, 135] degrees
    const normalized = (value + 10) / 20; // 0 to 1
    const angle = normalized * 270 - 135; // -135 to 135 degrees
    
    // Disable transitions during dragging for immediate response
    if (immediate) {
        knob.style.transition = 'none';
    }
    
    knob.style.transform = `rotate(${angle}deg)`;
    
    // Re-enable transitions after a brief moment if not dragging
    if (immediate) {
        requestAnimationFrame(() => {
            if (!state.isDragging) {
                knob.style.transition = '';
            }
        });
    }
}

// Update volume slider visual position
function updateVolumeSlider(volume, immediate = false) {
    // Map volume from [0, 100] to slider position [0%, 100%]
    const percentage = volume;
    if (elements.volumeSliderThumb && elements.volumeSliderFill) {
        // Disable transitions during dragging for immediate response
        if (immediate) {
            elements.volumeSliderThumb.style.transition = 'none';
            elements.volumeSliderFill.style.transition = 'none';
        }
        elements.volumeSliderThumb.style.left = `${percentage}%`;
        elements.volumeSliderFill.style.width = `${percentage}%`;
        
        // Re-enable transitions after a brief moment if not dragging
        if (immediate) {
            requestAnimationFrame(() => {
                if (!state.isDraggingVolume) {
                    elements.volumeSliderThumb.style.transition = '';
                    elements.volumeSliderFill.style.transition = '';
                }
            });
        }
    }
}

// Update all displays
function updateDisplays() {
    // Ensure state.x is properly initialized and sized
    if (!state.x || state.x.length !== state.n) {
        state.x = new Array(state.n).fill(0);
    }
    
    // Clamp values
    for(let i = 0; i < state.n; i++) {
        state.x[i] = clamp(state.x[i], -10, 10);
    }
    
    // Update knob values and rotations for visible knobs
    const count = Math.min(state.n, state.visibleKnobs);
    for(let i = 0; i < count; i++) {
        const id = i + 1;
        if (elements[`value${id}`]) {
            elements[`value${id}`].textContent = state.x[i].toFixed(2);
        }
        if (elements[`knob${id}`]) {
            elements[`knob${id}`].setAttribute('aria-valuenow', state.x[i].toFixed(2));
            updateKnobRotation(elements[`knob${id}`], state.x[i]);
        }
    }
    
    // Update HK tooltip if exists
    const hkIndicator = document.querySelector('.hk-indicator');
    if (hkIndicator && state.n > state.visibleKnobs) {
        const hiddenCount = state.n - state.visibleKnobs;
        let hiddenSummary = `Hidden Knobs (${hiddenCount}):\n`;
        for(let i = state.visibleKnobs; i < state.n; i++) {
            hiddenSummary += `x${i+1}: ${state.x[i].toFixed(2)}\n`;
        }
        hkIndicator.setAttribute('data-tooltip', hiddenSummary);
    }
    
    // Calculate errors
    const errors = calculateErrors(state.x, state.A, state.b);
    const maxError = getMaxError(errors);
    const convergence = getConvergenceState(maxError);
    
    // Update dynamic range based on current LHS values
    updateBandRange(errors);
    
    // Update equation displays
    const bandCount = Math.min(state.n, state.visibleBands);
    for(let i = 0; i < bandCount; i++) {
        updateConditionDisplay(i + 1, errors[`eq${i + 1}`]);
    }
    
    // Update HK tooltip for bands
    const hkIndicatorBand = document.querySelector('.hk-indicator-band');
    if (hkIndicatorBand && state.n > state.visibleBands) {
         const hiddenCount = state.n - state.visibleBands;
         let hiddenSummary = `Hidden Bands (${hiddenCount}):\n`;
         for(let i = state.visibleBands; i < state.n; i++) {
             const err = errors[`eq${i+1}`];
             if (err) {
                 hiddenSummary += `Band ${i+1}: Dev ±${Math.abs(err.error).toFixed(2)}\n`;
             }
         }
         hkIndicatorBand.setAttribute('data-tooltip', hiddenSummary);
    }
    
    // Update signal clarity display
    elements.iterationCount.textContent = state.iteration;
    elements.maxError.textContent = maxError.toFixed(4);
    elements.convergenceStatus.textContent = convergence.state;
    elements.convergenceStatus.style.color = convergence.color;
    
    // Update performance display
    updatePerformanceDisplay(elements, state);
    
    // Update master level meter
    if (elements.masterMeterFill) {
        const meterPercent = Math.min(100, Math.max(0, 100 - (maxError / 1.0) * 100));
        elements.masterMeterFill.style.width = `${meterPercent}%`;
    }
    
    // Update signal clarity display border
    if (maxError < 0.0001) {
        elements.signalClarityDisplay.classList.add('balanced');
        // Show solution button when balanced
        if (elements.solutionBtn) {
            elements.solutionBtn.style.display = 'block';
        }
    } else {
        elements.signalClarityDisplay.classList.remove('balanced');
        // Hide solution button when not balanced
        if (elements.solutionBtn) {
            elements.solutionBtn.style.display = 'none';
        }
    }
    
    // Update audio mix (if audio system is available)
    if (window.audioSystem) {
        window.audioSystem.updateMix(maxError);
    }
    
    // Update tuning dial
    updateTuningDial(maxError);
    
    // Update equation visualizer
    updateEquationVisualizer(state.equationHistory, state.A, state.b, state.n, state.method);
}

// Update tuning dial pointer
function updateTuningDial(maxError) {
    const dialPointer = document.querySelector('.dial-pointer');
    if (!dialPointer) return;
    
    // Map error to angle: maxError 1.0+ = -90deg (Static at bottom), maxError 0.0001 = 90deg (Clear at top)
    let angle;
    if (maxError >= 1.0) {
        angle = -90; // Static at bottom
    } else if (maxError <= 0.0001) {
        angle = 90; // Clear Signal at top
    } else {
        // Linear interpolation between -90 (bottom/Static) and 90 (top/Clear)
        const normalized = (1.0 - maxError) / (1.0 - 0.0001);
        angle = -90 + (normalized * 180);
    }
    
    dialPointer.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
}

// Calculate and update dynamic range for gain sliders
function updateBandRange(errors) {
    // Find min and max LHS values across all bands
    const lhsValues = [];
    Object.keys(errors).forEach(key => {
        if (errors[key] && typeof errors[key].lhs === 'number') {
            lhsValues.push(errors[key].lhs);
        }
    });
    
    if (lhsValues.length === 0) return;
    
    const minLHS = Math.min(...lhsValues);
    const maxLHS = Math.max(...lhsValues);
    
    // Calculate a symmetric range that accommodates all values with some padding
    // Use the maximum absolute value to ensure symmetric range
    const maxAbs = Math.max(Math.abs(minLHS), Math.abs(maxLHS));
    
    // Add padding (20% of range, minimum 2 units)
    const padding = Math.max(2, maxAbs * 0.2);
    const calculatedRange = maxAbs + padding;
    
    // Ensure minimum range of [-12, 12] for readability
    const minRange = 12;
    const finalRange = Math.max(minRange, calculatedRange);
    
    // Round to nice numbers for display (round up to next even number, or to nice increments)
    let roundedRange;
    if (finalRange <= 20) {
        roundedRange = Math.ceil(finalRange / 2) * 2; // Round up to even number
    } else if (finalRange <= 100) {
        roundedRange = Math.ceil(finalRange / 10) * 10; // Round up to nearest 10
    } else {
        roundedRange = Math.ceil(finalRange / 50) * 50; // Round up to nearest 50
    }
    
    // Optimization: Only update if range actually changed
    const newRange = { min: -roundedRange, max: roundedRange };
    if (state.lastBandRange && 
        state.lastBandRange.min === newRange.min && 
        state.lastBandRange.max === newRange.max) {
        // Range hasn't changed, skip DOM updates
        state.bandRangeMin = newRange.min;
        state.bandRangeMax = newRange.max;
        return;
    }
    
    state.bandRangeMin = newRange.min;
    state.bandRangeMax = newRange.max;
    state.bandRangeCenter = 0;
    state.lastBandRange = newRange;
    
    // Update gain marks for all visible bands
    const count = Math.min(state.n, state.visibleBands);
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const gainScale = document.querySelector(`#band${id} .gain-scale`);
        if (gainScale) {
            const marks = gainScale.querySelectorAll('.gain-mark');
            if (marks.length >= 3) {
                // Format numbers nicely
                const formatValue = (val) => {
                    if (Math.abs(val) < 0.01) return '0';
                    if (Math.abs(val) >= 100) return val.toFixed(0);
                    if (Math.abs(val) >= 10) return val.toFixed(0);
                    return val.toFixed(1);
                };
                
                marks[0].textContent = `+${formatValue(roundedRange)}`;
                marks[1].textContent = '0';
                marks[2].textContent = `-${formatValue(roundedRange)}`;
            }
        }
    }
}

// Update individual band display
function updateConditionDisplay(eqNum, errorData) {
    // Enhanced error handling and validation
    if (!errorData || typeof errorData !== 'object') {
        console.warn(`updateConditionDisplay: Invalid errorData for eq${eqNum}`);
        return;
    }
    
    // Validate errorData structure
    if (typeof errorData.lhs !== 'number' || typeof errorData.rhs !== 'number' || typeof errorData.error !== 'number') {
        console.warn(`updateConditionDisplay: Invalid errorData structure for eq${eqNum}`, errorData);
        return;
    }
    
    // Handle NaN and Infinity values
    if (!isFinite(errorData.lhs) || !isFinite(errorData.rhs) || !isFinite(errorData.error)) {
        console.warn(`updateConditionDisplay: Non-finite values for eq${eqNum}`, errorData);
        return;
    }
    
    const absError = Math.abs(errorData.error);
    const band = elements[`band${eqNum}`];
    const lhs = elements[`lhs${eqNum}`];
    const error = elements[`error${eqNum}`];
    const meter = elements[`meter${eqNum}`];
    const target = elements[`target${eqNum}`];
    const gainHandle = document.getElementById(`gainHandle${eqNum}`);
    
    if (!band) return; // Element might not exist if not visible
    
    // Update text with equalizer terminology
    // Convert LHS to dB scale (simplified: use LHS value as dB)
    const dbValue = errorData.lhs.toFixed(2);
    if (lhs) lhs.textContent = `Output: ${dbValue} dB`;
    if (error) error.textContent = `Dev: ±${absError.toFixed(2)}`;
    if (target) target.textContent = `Target: ${errorData.rhs.toFixed(2)}`;
    
    // Update gain slider position (map error to slider position)
    // Center position (0 dB) when error is 0, offset based on error
    // Map LHS value to slider position using dynamic range
    // Use state.bandRangeMin and state.bandRangeMax for dynamic range
    const range = state.bandRangeMax - state.bandRangeMin;
    
    // Safety check: prevent division by zero
    if (range <= 0 || !isFinite(range)) {
        console.warn(`updateConditionDisplay: Invalid range for eq${eqNum}`, { min: state.bandRangeMin, max: state.bandRangeMax });
        return;
    }
    
    const normalizedValue = (errorData.lhs - state.bandRangeMin) / range; // Map from [min, max] to [0, 1]
    const sliderPosition = normalizedValue * 100; // Map to [0, 100]
    const clampedPosition = Math.max(0, Math.min(100, sliderPosition));
    
    if (gainHandle) {
        // Position handle vertically (inverted: top = 0% for max value, bottom = 100% for min value)
        // Use transform to center the handle vertically at the calculated position
        const topPercent = 100 - clampedPosition;
        gainHandle.style.top = `${topPercent}%`;
        gainHandle.style.transform = 'translateX(-50%) translateY(-50%)';
    }
    
    // Update color coding
    band.classList.remove('error-high', 'error-medium', 'error-low');
    if (absError >= 1.0) {
        band.classList.add('error-high');
    } else if (absError >= 0.1) {
        band.classList.add('error-medium');
    } else {
        band.classList.add('error-low');
    }
    
    // Update VU meter (inverse relationship: higher error = lower needle)
    const meterPercent = Math.min(100, Math.max(0, 100 - (absError / 1.0) * 100));
    if (meter) meter.style.height = `${meterPercent}%`;
}

// Render knobs dynamically
function renderKnobs() {
    if (!elements.knobsContainer) return;
    
    elements.knobsContainer.innerHTML = '';
    
    const count = Math.min(state.n, state.visibleKnobs);
    
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const html = `
            <div class="knob-wrapper" data-tooltip="Drag vertically or horizontally to adjust x${id}. Click to focus, then use arrow keys or +/- for precise control. Hold Shift for fine adjustments.">
                <div class="knob" id="knob${id}" data-variable="x${id}">
                    <div class="knob-pointer"></div>
                    <div class="knob-ridges"></div>
                </div>
                <div class="knob-label">x${id}</div>
                <div class="knob-value" id="value${id}">0.00</div>
            </div>
        `;
        elements.knobsContainer.insertAdjacentHTML('beforeend', html);
    }
    
    // Update elements references for easy access
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        elements[`knob${id}`] = document.getElementById(`knob${id}`);
        elements[`value${id}`] = document.getElementById(`value${id}`);
    }
    
    // Handle HK (Hidden Knobs)
    if (state.n > state.visibleKnobs) {
        const hiddenCount = state.n - state.visibleKnobs;
        // Calculate summary of hidden values
        let hiddenSummary = '';
        for(let i = state.visibleKnobs; i < state.n; i++) {
            if (state.x && i < state.x.length && typeof state.x[i] === 'number') {
                hiddenSummary += `x${i+1}: ${state.x[i].toFixed(2)}\n`;
            } else {
                hiddenSummary += `x${i+1}: 0.00\n`;
            }
        }
        
        const hkHtml = `
            <div class="hk-indicator knob-wrapper" data-tooltip="Hidden Knobs (${hiddenCount}):\n${hiddenSummary}">
                <div class="hk-circle">
                    <span>HK</span>
                    <span class="hk-count">${hiddenCount}</span>
                </div>
                <div class="knob-label">More</div>
            </div>
        `;
        elements.knobsContainer.insertAdjacentHTML('beforeend', hkHtml);
    }
    
    setupKnobListeners();
}

// Render bands dynamically
function renderBands() {
    if (!elements.bandsContainer) return;
    
    elements.bandsContainer.innerHTML = '';
    
    const count = Math.min(state.n, state.visibleBands);
    
    // Frequencies for display
    const frequencies = ['60', '170', '310', '600', '1k', '3k', '6k', '12k', '14k', '16k'];
    
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const freq = frequencies[i % frequencies.length];
        
        // Construct equation string for tooltip
        let equationParts = [];
        for(let j=0; j<state.n; j++) {
            const coeff = state.A[i][j];
            if (coeff !== 0) {
                const sign = (coeff < 0) ? '-' : (equationParts.length > 0 ? '+' : '');
                const absCoeff = Math.abs(coeff);
                const val = absCoeff === 1 ? '' : absCoeff;
                equationParts.push(`${sign} ${val}x${j+1}`);
            }
        }
        const equationText = `${equationParts.join(' ')} = ${state.b[i]}`;
        
        const html = `
            <div class="band-display" id="band${id}" data-tooltip="Frequency Band ${id}: ${equationText}. Adjusts signal level at this frequency.">
                <div class="band-header">
                    <span class="band-label">Band ${id}</span>
                    <span class="frequency-label">${freq} Hz</span>
                    <span class="frequency-target" id="target${id}">Target: ${state.b[i].toFixed(2)}</span>
                </div>
                <div class="band-controls">
                    <div class="gain-slider-container">
                        <div class="gain-scale">
                            <span class="gain-mark">+12</span>
                            <span class="gain-mark">0</span>
                            <span class="gain-mark">-12</span>
                        </div>
                        <div class="gain-slider-track">
                            <div class="gain-slider-handle" id="gainHandle${id}"></div>
                        </div>
                    </div>
                </div>
                <div class="band-details">
                    <span class="signal-level" id="lhs${id}">Output: 0.00 dB</span>
                    <span class="deviation" id="error${id}">Dev: ±0.00</span>
                </div>
                <div class="vu-meter">
                    <div class="vu-meter-scale">
                        <div class="vu-mark">0</div>
                        <div class="vu-mark">-3</div>
                        <div class="vu-mark">-6</div>
                        <div class="vu-mark">-12</div>
                    </div>
                    <div class="vu-meter-bar">
                        <div class="vu-needle" id="meter${id}"></div>
                    </div>
                </div>
            </div>
        `;
        elements.bandsContainer.insertAdjacentHTML('beforeend', html);
    }
    
    // Update elements references
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        elements[`band${id}`] = document.getElementById(`band${id}`);
        elements[`lhs${id}`] = document.getElementById(`lhs${id}`);
        elements[`error${id}`] = document.getElementById(`error${id}`);
        elements[`meter${id}`] = document.getElementById(`meter${id}`);
        elements[`target${id}`] = document.getElementById(`target${id}`);
    }
    
    // Handle HK for bands
    if (state.n > state.visibleBands) {
        const hiddenCount = state.n - state.visibleBands;
        const hkHtml = `
            <div class="hk-indicator-band" data-tooltip="Hidden Bands: ${hiddenCount} more equations">
                <div class="hk-band-label">+ ${hiddenCount} Hidden</div>
                <div class="hk-band-subtitle">Bands</div>
            </div>
        `;
        elements.bandsContainer.insertAdjacentHTML('beforeend', hkHtml);
    }
}

function setupKnobListeners() {
    const count = Math.min(state.n, state.visibleKnobs);
    
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        const knob = elements[`knob${id}`];
        if (!knob) continue;
        
        const knobWrapper = knob.closest('.knob-wrapper');
        const variableIndex = i; // Use array index instead of variable string
        
        // Make entire wrapper draggable, not just the knob
        const dragHandler = (e) => {
            e.preventDefault();
            startKnobDrag(knob, variableIndex, e);
        };
        
        // Add event listeners
        [knob, knobWrapper].forEach(el => {
            if (el) {
                el.addEventListener('mousedown', dragHandler);
                el.addEventListener('touchstart', dragHandler);
            }
        });
        
        // Add keyboard focus support
        knob.setAttribute('tabindex', '0');
        knob.setAttribute('role', 'slider');
        knob.setAttribute('aria-label', `Adjust x${id}`);
        knob.setAttribute('aria-valuemin', '-10');
        knob.setAttribute('aria-valuemax', '10');
        knob.setAttribute('aria-valuenow', state.x[i]);
        
        knob.addEventListener('focus', () => {
            state.focusedKnob = variableIndex;
            knobWrapper.classList.add('focused');
        });
        
        knob.addEventListener('blur', () => {
            if (state.focusedKnob === variableIndex) {
                state.focusedKnob = null;
            }
            knobWrapper.classList.remove('focused');
        });
    }
}

// Single iteration step
/**
 * Perform one iteration step (Jacobi or Gauss-Seidel)
 * Updates all variables and checks for convergence/non-convergence
 */
function performIteration() {
    let newX;
    
    // Start measurement if not already started
    startMeasurement(state.method, state);
    
    // Choose method based on state
    if (state.method === 'gaussSeidel') {
        // Gauss-Seidel modifies in-place, so we need to copy first
        const xCopy = [...state.x];
        newX = computeNextGaussSeidel(xCopy, state.A, state.b);
    } else {
        // Jacobi method
        newX = computeNextJacobi(state.x, state.A, state.b);
    }
    
    // Track if values were clamped
    let wasClamped = false;
    for (let val of newX) {
        if (val < -10 || val > 10) {
            wasClamped = true;
            break;
        }
    }
    
    // Clamp new values and update state
    for (let i = 0; i < state.n; i++) {
        state.x[i] = clamp(newX[i], -10, 10);
    }
    
    state.iteration++;
    
    // Update performance measurement
    updateMeasurement(state.method, state.iteration, state);
    
    // Capture iteration snapshot for equation visualizer
    addIterationSnapshot(state.equationHistory, state.iteration, [...state.x], state.A);
    
    // Show clamping message if needed (only once per clamping event)
    if (wasClamped && state.iteration % 10 === 0) {
        showMessage('Values out of range — clamped to [-10, 10]', 'warning');
    }
    
    // Animate knobs smoothly
    animateKnobsToValues();
    
    // Update displays
    updateDisplays();
    
    // Check for convergence
    const errors = calculateErrors(state.x, state.A, state.b);
    const maxError = getMaxError(errors);
    
    if (maxError < 0.0001) {
        // Complete performance measurement
        completeMeasurement(state.method, state.iteration, state);
        
        // Show performance comparison if both methods have converged
        const jacobiRuns = state.performanceHistory.jacobi.runs || [];
        const gaussSeidelRuns = state.performanceHistory.gaussSeidel.runs || [];
        
        if (jacobiRuns.length > 0 && gaussSeidelRuns.length > 0) {
            const jacobiLast = jacobiRuns[jacobiRuns.length - 1];
            const gaussSeidelLast = gaussSeidelRuns[gaussSeidelRuns.length - 1];
            
            if (jacobiLast && gaussSeidelLast) {
                const faster = jacobiLast.iterations < gaussSeidelLast.iterations ? 'Jacobi' : 'Gauss-Seidel';
                const ratio = Math.max(jacobiLast.iterations, gaussSeidelLast.iterations) / 
                             Math.min(jacobiLast.iterations, gaussSeidelLast.iterations);
                showMessage(
                    `Performance: Jacobi (${jacobiLast.iterations} iters) vs Gauss-Seidel (${gaussSeidelLast.iterations} iters). ${faster} is ${ratio.toFixed(2)}x faster!`,
                    'success'
                );
            }
        }
        
        stopAutoplay();
        showMessage('Perfectly Balanced! Solution found.', 'success');
        if (window.audioSystem) {
            window.audioSystem.playConvergenceChime();
        }
    }
    
    // Check for non-convergence
    if (state.iteration > 1000) {
        // Reset current run on non-convergence
        resetCurrentRun(state.method, state);
        stopAutoplay();
        showMessage('Not converging after 1000 iterations. Try a different starting point.', 'error');
    }
}

/**
 * Show a temporary message to the user
 * @param {string} message - Message text
 * @param {string} type - Message type: 'success', 'warning', 'error'
 */
function showMessage(message, type = 'info') {
    // Remove existing message if any
    const existingMsg = document.getElementById('statusMessage');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create message element
    const msgEl = document.createElement('div');
    msgEl.id = 'statusMessage';
    msgEl.className = `status-message status-message-${type}`;
    msgEl.textContent = message;
    msgEl.setAttribute('role', 'alert');
    msgEl.setAttribute('aria-live', 'polite');
    
    // Insert before controls
    const controls = document.querySelector('.controls');
    if (controls && controls.parentNode) {
        controls.parentNode.insertBefore(msgEl, controls);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (msgEl.parentNode) {
            msgEl.style.opacity = '0';
            msgEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => msgEl.remove(), 300);
        }
    }, 5000);
}

// Animate knobs to new values
function animateKnobsToValues() {
    // Smooth transition using CSS transitions
    // Only update existing visible knobs
    const count = Math.min(state.n, state.visibleKnobs);
    for(let i = 0; i < count; i++) {
        const id = i + 1;
        if (elements[`knob${id}`]) {
            updateKnobRotation(elements[`knob${id}`], state.x[i]);
        }
    }
}

// Autoplay control
function startAutoplay() {
    if (state.isAutoPlaying) return;
    
    state.isAutoPlaying = true;
    elements.autoplayBtn.textContent = '⏸ Pause';
    elements.autoplayBtn.classList.add('playing');
    elements.powerIndicator.classList.add('active');
    elements.speakerGrille.classList.add('pulse');
    
    const delay = mapSpeedToDelay(state.speed);
    state.autoplayInterval = setInterval(() => {
        performIteration();
    }, delay);
}

function stopAutoplay() {
    if (!state.isAutoPlaying) return;
    
    state.isAutoPlaying = false;
    if (state.autoplayInterval) {
        clearInterval(state.autoplayInterval);
        state.autoplayInterval = null;
    }
    elements.autoplayBtn.textContent = '▶ Play';
    elements.autoplayBtn.classList.remove('playing');
    elements.powerIndicator.classList.remove('active');
    elements.speakerGrille.classList.remove('pulse');
}

function toggleAutoplay() {
    if (state.isAutoPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

// Map speed slider (1-100) to delay (2000ms to 100ms)
function mapSpeedToDelay(speed) {
    return 2000 - (speed - 1) * (1900 / 99);
}

function updateSpeed(speed) {
    state.speed = speed;
    const delay = mapSpeedToDelay(speed);
    
    // Update speed fill width (percentage)
    if (elements.speedSliderFill) {
        const percentage = speed; // 1-100 maps to 1%-100%
        elements.speedSliderFill.style.width = `${percentage}%`;
    }
    
    // Update interval if autoplay is running
    if (state.isAutoPlaying) {
        stopAutoplay();
        startAutoplay();
    }
}

// Reset to default values
function reset() {
    stopAutoplay();
    // Reset performance measurements (clear current runs, keep history)
    resetCurrentRun('jacobi', state);
    resetCurrentRun('gaussSeidel', state);
    
    // Reset to initial guess stored in state
    // If initialGuess is not set or doesn't match system size, use default values
    if (!state.initialGuess || state.initialGuess.length !== state.n) {
        // Default to [1, 2, 2] for 3x3, or zeros for other sizes
        if (state.n === 3) {
            state.initialGuess = [1.0, 2.0, 2.0];
        } else {
            state.initialGuess = new Array(state.n).fill(0);
        }
    }
    state.x = [...state.initialGuess];
    // Ensure x array matches system size
    while (state.x.length < state.n) {
        state.x.push(0);
    }
    // Trim if too long (shouldn't happen, but safety check)
    state.x = state.x.slice(0, state.n);
    
    state.iteration = 0;
    clearEquationHistory(state.equationHistory);
    updateDisplays();
}

// Random initial guess
function randomGuess() {
    stopAutoplay();
    for (let i = 0; i < state.n; i++) {
        state.x[i] = (Math.random() * 20) - 10;
    }
    state.iteration = 0;
    updateDisplays();
}

// Knob interaction
function startKnobDrag(knob, variableIndex, event) {
    state.isDragging = true;
    state.dragKnob = variableIndex;
    state.dragKnobElement = knob;
    state.dragStartY = event.clientY || event.touches[0].clientY;
    state.dragStartX = event.clientX || event.touches[0].clientX;
    state.dragStartValue = state.x[variableIndex];
    
    // Disable transitions on the knob for immediate response during drag
    knob.style.transition = 'none';
    
    // Add visual feedback - preserve existing rotation, add scale
    const currentRotation = knob.style.transform.match(/rotate\([^)]+\)/);
    const rotationStr = currentRotation ? currentRotation[0] : 'rotate(0deg)';
    knob.style.transform = `${rotationStr} scale(1.1)`;
    knob.style.cursor = 'grabbing';
    
    if (window.audioSystem) {
        window.audioSystem.playKnobClick();
    }
}

function updateKnobDrag(event) {
    if (!state.isDragging || state.dragKnob === null || state.dragKnob === undefined || !state.dragKnobElement) return;
    
    const currentY = event.clientY || (event.touches && event.touches[0].clientY);
    const currentX = event.clientX || (event.touches && event.touches[0].clientX);
    if (!currentY && !currentX) return;
    
    // Cancel any pending RAF updates
    if (state.knobUpdateRaf) {
        cancelAnimationFrame(state.knobUpdateRaf);
    }
    
    // Use requestAnimationFrame for smooth updates
    state.knobUpdateRaf = requestAnimationFrame(() => {
        const deltaY = state.dragStartY - currentY;
        // Extremely easy control: much higher sensitivity (0.15 = very responsive)
        // Also support horizontal dragging for easier control
        const deltaX = currentX - (state.dragStartX || state.dragStartY);
        const sensitivity = 0.15; // Increased from 0.08 for easier control
        // Use whichever movement is larger (vertical or horizontal)
        // Vertical: up = increase, down = decrease
        // Horizontal: right = increase, left = decrease
        const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
        const newValue = state.dragStartValue + (delta * sensitivity);
        
        const previousValue = state.x[state.dragKnob];
        state.x[state.dragKnob] = clamp(newValue, -10, 10);
        
        // Only update displays if value actually changed (reduces unnecessary updates)
        if (Math.abs(state.x[state.dragKnob] - previousValue) > 0.001) {
            // Update knob rotation immediately (no transition during drag)
            updateKnobRotation(state.dragKnobElement, state.x[state.dragKnob], true);
            
            // Update value display for the dragged knob
            const knobId = state.dragKnob + 1;
            const valueElement = elements[`value${knobId}`];
            if (valueElement) {
                valueElement.textContent = state.x[state.dragKnob].toFixed(2);
            }
            
            // Calculate errors using dynamic state.x array (fixes bug for n>3 systems)
            const errors = calculateErrors(state.x, state.A, state.b);
            const maxError = getMaxError(errors);
            const convergence = getConvergenceState(maxError);
            
            // Update dynamic range based on current LHS values
            updateBandRange(errors);
            
            // Update equation displays for all visible bands
            const bandCount = Math.min(state.n, state.visibleBands);
            for (let i = 0; i < bandCount; i++) {
                updateConditionDisplay(i + 1, errors[`eq${i + 1}`]);
            }
            
            // Update signal clarity display
            if (elements.iterationCount) elements.iterationCount.textContent = state.iteration;
            if (elements.maxError) elements.maxError.textContent = maxError.toFixed(4);
            if (elements.convergenceStatus) {
                elements.convergenceStatus.textContent = convergence.state;
                elements.convergenceStatus.style.color = convergence.color;
            }
            
            // Update master level meter
            if (elements.masterMeterFill) {
                const meterPercent = Math.min(100, Math.max(0, 100 - (maxError / 1.0) * 100));
                elements.masterMeterFill.style.width = `${meterPercent}%`;
            }
            
            // Update signal clarity display border
            if (elements.signalClarityDisplay) {
                if (maxError < 0.0001) {
                    elements.signalClarityDisplay.classList.add('balanced');
                    if (elements.solutionBtn) {
                        elements.solutionBtn.style.display = 'block';
                    }
                } else {
                    elements.signalClarityDisplay.classList.remove('balanced');
                    if (elements.solutionBtn) {
                        elements.solutionBtn.style.display = 'none';
                    }
                }
            }
            
            // Update audio mix
            if (window.audioSystem) {
                window.audioSystem.updateMix(maxError);
            }
            
            // Update tuning dial
            updateTuningDial(maxError);
        }
    });
}

function endKnobDrag() {
    // Cancel any pending RAF updates
    if (state.knobUpdateRaf) {
        cancelAnimationFrame(state.knobUpdateRaf);
        state.knobUpdateRaf = null;
    }
    
    // Re-enable transitions on the knob and restore scale
    if (state.dragKnobElement) {
        state.dragKnobElement.style.transition = '';
        state.dragKnobElement.style.cursor = 'grab';
        // Remove scale transform, keep rotation
        const currentTransform = state.dragKnobElement.style.transform;
        if (currentTransform) {
            // Extract just the rotation part, remove any scale
            const rotationMatch = currentTransform.match(/rotate\([^)]+\)/);
            if (rotationMatch) {
                state.dragKnobElement.style.transform = rotationMatch[0];
            } else {
                // If no rotation found, just clear scale
                state.dragKnobElement.style.transform = currentTransform.replace(/\s*scale\([^)]+\)/g, '');
            }
        }
    }
    
    state.isDragging = false;
    state.dragKnob = null;
    state.dragKnobElement = null;
    state.dragStartX = null;
}

// Volume slider interaction
function startVolumeSliderDrag(event) {
    if (!elements.volumeSliderTrack) return;
    
    state.isDraggingVolume = true;
    state.volumeHasMoved = false;
    
    // Store track rect at start to avoid recalculating on every move
    state.volumeTrackRect = elements.volumeSliderTrack.getBoundingClientRect();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (window.audioSystem && window.audioSystem.audioContext) {
        if (window.audioSystem.audioContext.state === 'suspended') {
            window.audioSystem.audioContext.resume().catch(err => {
                console.warn('Could not resume audio context:', err);
            });
        }
    }
    
    // Get initial click position
    const clickX = event.clientX || (event.touches && event.touches[0].clientX);
    if (clickX) {
        const initialVolume = state.volume;
        updateVolumeFromPosition(clickX);
        
        // Check if this was a significant move
        if (Math.abs(state.volume - initialVolume) > 1) {
            state.volumeHasMoved = true;
        }
    }
    
    if (window.audioSystem) {
        window.audioSystem.playKnobClick();
    }
}

function updateVolumeSliderDrag(event) {
    if (!state.isDraggingVolume || !state.volumeTrackRect) return;
    
    const clickX = event.clientX || (event.touches && event.touches[0].clientX);
    if (!clickX) return;
    
    // Cancel any pending RAF updates
    if (state.volumeUpdateRaf) {
        cancelAnimationFrame(state.volumeUpdateRaf);
    }
    
    // Use requestAnimationFrame for smooth updates
    state.volumeUpdateRaf = requestAnimationFrame(() => {
        const previousVolume = state.volume;
        updateVolumeFromPosition(clickX);
        
        // Mark as moved if there's significant change
        if (Math.abs(state.volume - previousVolume) > 0.5) {
            state.volumeHasMoved = true;
        }
    });
}

function updateVolumeFromPosition(clientX) {
    if (!state.volumeTrackRect) {
        // Recalculate if needed (shouldn't happen during drag, but safety check)
        if (elements.volumeSliderTrack) {
            state.volumeTrackRect = elements.volumeSliderTrack.getBoundingClientRect();
        } else {
            return;
        }
    }
    
    // Calculate percentage based on horizontal position
    const relativeX = clientX - state.volumeTrackRect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / state.volumeTrackRect.width) * 100));
    
    // Only update if value actually changed (reduces unnecessary updates)
    if (Math.abs(state.volume - percentage) < 0.1) return;
    
    const previousVolume = state.volume;
    state.volume = percentage;
    updateVolumeSlider(state.volume, true); // immediate = true for smooth dragging
    
    // Update audio system
    if (window.audioSystem) {
        window.audioSystem.setVolume(state.volume);
        
        // Unmute if volume is increased from 0, or mute if set to 0
        if (state.volume > 0 && window.audioSystem.isMuted) {
            window.audioSystem.toggleMute(); // This will unmute
        } else if (state.volume === 0 && !window.audioSystem.isMuted) {
            window.audioSystem.toggleMute(); // This will mute
        }
        
        // Resume audio context if suspended (browser autoplay policy)
        if (window.audioSystem.audioContext && window.audioSystem.audioContext.state === 'suspended') {
            window.audioSystem.audioContext.resume();
        }
    }
}

function endVolumeSliderDrag() {
    // Cancel any pending RAF updates
    if (state.volumeUpdateRaf) {
        cancelAnimationFrame(state.volumeUpdateRaf);
        state.volumeUpdateRaf = null;
    }
    
    // Re-enable transitions
    if (elements.volumeSliderThumb && elements.volumeSliderFill) {
        elements.volumeSliderThumb.style.transition = '';
        elements.volumeSliderFill.style.transition = '';
    }
    
    // If slider didn't move, it was a click - toggle mute
    if (!state.volumeHasMoved && window.audioSystem) {
        window.audioSystem.toggleMute();
    }
    
    state.isDraggingVolume = false;
    state.volumeHasMoved = false;
    state.volumeTrackRect = null;
}

// Condition presets
const presets = {
    default: [1.0, 2.0, 2.0],
    zero: [0.0, 0.0, 0.0],
    negative: [-1.0, -2.0, -2.0]
};

function loadPreset(presetName) {
    stopAutoplay();
    const preset = presets[presetName];
    if (preset) {
        // Only apply preset values for the first 3 elements (for 3x3 system compatibility)
        // For larger systems, only set the first 3 values
        for (let i = 0; i < Math.min(3, state.n, preset.length); i++) {
            state.x[i] = preset[i];
        }
        state.iteration = 0;
        updateDisplays();
        
        if (window.audioSystem) {
            window.audioSystem.playButtonClick();
        }
    }
}

// Render KaTeX equations in a container
function renderKaTeXEquations(container) {
    if (!container || typeof katex === 'undefined') return;
    
    const equationElements = container.querySelectorAll('.katex-equation-inline[data-latex]');
    equationElements.forEach(element => {
        // Skip if already rendered
        if (element.querySelector('.katex')) return;
        
        const latex = element.getAttribute('data-latex');
        if (latex) {
            element.innerHTML = ''; // Clear any existing content
            renderLaTeXWithKaTeX(latex, element, { displayMode: false });
        }
    });
}

// Help panel
function toggleHelpPanel() {
    if (elements.helpPanel) {
        const isHidden = elements.helpPanel.classList.contains('hidden');
        elements.helpPanel.classList.toggle('hidden');
        
        // Render KaTeX equations when panel is shown
        if (!isHidden && typeof katex !== 'undefined') {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                renderKaTeXEquations(elements.helpPanel);
            }, 10);
        }
        
        if (window.audioSystem) {
            window.audioSystem.playButtonClick();
        }
    }
}

// Solution lightbox
function showSolutionModal() {
    if (!elements.solutionModal) return;
    
    // Calculate current solution values
    const errors = calculateErrors(state.x, state.A, state.b);
    const maxError = getMaxError(errors);
    
    // Update solution values in modal (only for first 3 variables for 3x3 system)
    const solutionX1 = document.getElementById('solutionX1');
    const solutionX2 = document.getElementById('solutionX2');
    const solutionX3 = document.getElementById('solutionX3');
    if (solutionX1 && state.x.length > 0) solutionX1.textContent = state.x[0].toFixed(2);
    if (solutionX2 && state.x.length > 1) solutionX2.textContent = state.x[1].toFixed(2);
    if (solutionX3 && state.x.length > 2) solutionX3.textContent = state.x[2].toFixed(2);
    
    // Update verification calculations for Condition 1 (only for 3x3 system)
    const verifyX1_1 = document.getElementById('verifyX1-1');
    const verifyX2_1 = document.getElementById('verifyX2-1');
    const verifyX3_1 = document.getElementById('verifyX3-1');
    const verifyResult1 = document.getElementById('verifyResult1');
    if (verifyX1_1 && verifyX2_1 && verifyX3_1 && verifyResult1 && state.n === 3 && state.x.length >= 3) {
        verifyX1_1.textContent = state.x[0].toFixed(2);
        verifyX2_1.textContent = state.x[1].toFixed(2);
        verifyX3_1.textContent = state.x[2].toFixed(2);
        const result1 = 4 * state.x[0] - state.x[1] + state.x[2];
        verifyResult1.textContent = result1.toFixed(2);
    }
    
    // Update verification calculations for Condition 2 (only for 3x3 system)
    const verifyX1_2 = document.getElementById('verifyX1-2');
    const verifyX2_2 = document.getElementById('verifyX2-2');
    const verifyX3_2 = document.getElementById('verifyX3-2');
    const verifyResult2 = document.getElementById('verifyResult2');
    if (verifyX1_2 && verifyX2_2 && verifyX3_2 && verifyResult2 && state.n === 3 && state.x.length >= 3) {
        verifyX1_2.textContent = state.x[0].toFixed(2);
        verifyX2_2.textContent = state.x[1].toFixed(2);
        verifyX3_2.textContent = state.x[2].toFixed(2);
        const result2 = 4 * state.x[0] - 8 * state.x[1] + state.x[2];
        verifyResult2.textContent = result2.toFixed(2);
    }
    
    // Update verification calculations for Condition 3 (only for 3x3 system)
    const verifyX1_3 = document.getElementById('verifyX1-3');
    const verifyX2_3 = document.getElementById('verifyX2-3');
    const verifyX3_3 = document.getElementById('verifyX3-3');
    const verifyResult3 = document.getElementById('verifyResult3');
    if (verifyX1_3 && verifyX2_3 && verifyX3_3 && verifyResult3 && state.n === 3 && state.x.length >= 3) {
        verifyX1_3.textContent = state.x[0].toFixed(2);
        verifyX2_3.textContent = state.x[1].toFixed(2);
        verifyX3_3.textContent = state.x[2].toFixed(2);
        const result3 = -2 * state.x[0] + state.x[1] + 5 * state.x[2];
        verifyResult3.textContent = result3.toFixed(2);
    }
    
    // Update convergence details
    const solutionIterations = document.getElementById('solutionIterations');
    const solutionMaxError = document.getElementById('solutionMaxError');
    if (solutionIterations) solutionIterations.textContent = state.iteration;
    if (solutionMaxError) solutionMaxError.textContent = maxError.toFixed(4);
    
    // Show modal
    elements.solutionModal.classList.remove('hidden');
    
    // Render KaTeX equations when modal is shown
    if (typeof katex !== 'undefined') {
        setTimeout(() => {
            renderKaTeXEquations(elements.solutionModal);
        }, 10);
    }
    
    if (window.audioSystem) {
        window.audioSystem.playButtonClick();
    }
}

function hideSolutionModal() {
    if (elements.solutionModal) {
        elements.solutionModal.classList.add('hidden');
    }
}

// Equation History Modal
function showEquationHistoryModal() {
    if (!elements.equationHistoryModal) return;
    
    // Update the visualizer content before showing
    updateEquationVisualizer(state.equationHistory, state.A, state.b, state.n, state.method);
    
    // Show modal
    elements.equationHistoryModal.classList.remove('hidden');
    
    // Render KaTeX equations when modal is shown
    if (typeof katex !== 'undefined') {
        setTimeout(() => {
            renderKaTeXEquations(elements.equationHistoryModal);
        }, 10);
    }
    
    if (window.audioSystem) {
        window.audioSystem.playButtonClick();
    }
}

function hideEquationHistoryModal() {
    if (elements.equationHistoryModal) {
        elements.equationHistoryModal.classList.add('hidden');
    }
}

// Theme switching
function toggleTheme() {
    state.theme = state.theme === 'vintage' ? 'modern' : 'vintage';
    
    // Update container and body class
    if (elements.container) {
        elements.container.classList.toggle('modern-theme', state.theme === 'modern');
    }
    if (document.body) {
        document.body.classList.toggle('modern-theme', state.theme === 'modern');
    }
    
    // Update button label
    if (elements.themeToggle) {
        const label = elements.themeToggle.querySelector('.theme-label');
        if (label) {
            label.textContent = state.theme === 'vintage' ? 'Modern' : 'Vintage';
        }
    }
    
    // Save preference
    try {
        localStorage.setItem('jacobiRadioTheme', state.theme);
    } catch (e) {
        console.warn('Could not save theme preference to localStorage:', e);
    }
    
    // Play sound
    if (window.audioSystem) {
        window.audioSystem.playButtonClick();
    }
}

// Load theme preference
function loadThemePreference() {
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('jacobiRadioTheme');
    } catch (e) {
        console.warn('Could not read theme preference from localStorage:', e);
    }
    if (savedTheme === 'modern' || savedTheme === 'vintage') {
        state.theme = savedTheme;
        if (elements.container) {
            elements.container.classList.toggle('modern-theme', state.theme === 'modern');
        }
        if (document.body) {
            document.body.classList.toggle('modern-theme', state.theme === 'modern');
        }
        if (elements.themeToggle) {
            const label = elements.themeToggle.querySelector('.theme-label');
            if (label) {
                label.textContent = state.theme === 'vintage' ? 'Modern' : 'Vintage';
            }
        }
    }
}

// Event listeners
function setupEventListeners() {
    // Step button
    if (elements.stepBtn) {
        elements.stepBtn.addEventListener('click', performIteration);
    }
    
    // Autoplay button
    if (elements.autoplayBtn) {
        elements.autoplayBtn.addEventListener('click', toggleAutoplay);
    }
    
    // Reset button
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', reset);
    }
    
    // Random button
    if (elements.randomBtn) {
        elements.randomBtn.addEventListener('click', randomGuess);
    }
    
    // Speed slider
    if (elements.speedSlider) {
        elements.speedSlider.addEventListener('input', (e) => {
            updateSpeed(parseInt(e.target.value));
        });
    }
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetName = e.target.getAttribute('data-preset');
            if (presetName) {
                loadPreset(presetName);
            }
        });
    });
    
    // Help panel
    if (elements.helpBtn) {
        elements.helpBtn.addEventListener('click', toggleHelpPanel);
    }
    
    // Config button
    if (elements.configBtn) {
        elements.configBtn.addEventListener('click', showConfigModal);
    }
    
    if (elements.helpClose) {
        elements.helpClose.addEventListener('click', toggleHelpPanel);
    }
    if (elements.helpPanel) {
        elements.helpPanel.addEventListener('click', (e) => {
            if (e.target === elements.helpPanel) {
                toggleHelpPanel();
            }
        });
    }
    
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Method selector
    const methodRadios = document.querySelectorAll('input[name="method"]');
    methodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const oldMethod = state.method;
            const newMethod = e.target.value;
            
            // Complete current run for previous method if in progress
            if (state.performanceHistory[oldMethod] && state.performanceHistory[oldMethod].currentRun) {
                completeMeasurement(oldMethod, state.iteration, state);
            }
            
            // Reset current run for previous method
            resetCurrentRun(oldMethod, state);
            
            state.method = newMethod;
            
            // Reset iteration counter when switching methods
            state.iteration = 0;
            
            // Clear equation history
            clearEquationHistory(state.equationHistory);
            
            // Show message
            const methodName = state.method === 'jacobi' ? 'Jacobi' : 'Gauss-Seidel';
            showMessage(`Switched to ${methodName} method`, 'info');
            
            // Update displays
            updateDisplays();
            
            if (window.audioSystem) {
                window.audioSystem.playButtonClick();
            }
        });
    });
    
    // Export performance button
    const exportPerformanceBtn = document.getElementById('exportPerformanceBtn');
    if (exportPerformanceBtn) {
        exportPerformanceBtn.addEventListener('click', () => {
            try {
                const csvContent = exportPerformanceToCSV(state.performanceHistory);
                const filename = generateFilename();
                downloadCSV(csvContent, filename);
                showMessage('Performance data exported successfully!', 'success');
            } catch (e) {
                console.error('Export error:', e);
                showMessage('Error exporting performance data', 'error');
            }
        });
    }
    
    // Solution button
    if (elements.solutionBtn) {
        elements.solutionBtn.addEventListener('click', showSolutionModal);
    }
    
    // Equation History button
    if (elements.equationHistoryBtn) {
        elements.equationHistoryBtn.addEventListener('click', showEquationHistoryModal);
    }
    
    // Equation History modal close buttons
    if (elements.closeEquationHistoryModal) {
        elements.closeEquationHistoryModal.addEventListener('click', hideEquationHistoryModal);
    }
    if (elements.closeEquationHistoryBtn) {
        elements.closeEquationHistoryBtn.addEventListener('click', hideEquationHistoryModal);
    }
    if (elements.equationHistoryModal) {
        elements.equationHistoryModal.addEventListener('click', (e) => {
            if (e.target === elements.equationHistoryModal) {
                hideEquationHistoryModal();
            }
        });
    }
    
    // Solution modal close buttons
    if (elements.closeSolutionModal) {
        elements.closeSolutionModal.addEventListener('click', hideSolutionModal);
    }
    if (elements.closeSolutionBtn) {
        elements.closeSolutionBtn.addEventListener('click', hideSolutionModal);
    }
    if (elements.printSolutionBtn) {
        elements.printSolutionBtn.addEventListener('click', () => {
            window.print();
            if (window.audioSystem) {
                window.audioSystem.playButtonClick();
            }
        });
    }
    if (elements.solutionModal) {
        elements.solutionModal.addEventListener('click', (e) => {
            if (e.target === elements.solutionModal) {
                hideSolutionModal();
            }
        });
    }
    
    // Knob interactions are handled by setupKnobListeners called from renderKnobs
    
    // Volume slider interaction
    if (elements.volumeSliderTrack) {
        elements.volumeSliderTrack.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startVolumeSliderDrag(e);
        });
        
        elements.volumeSliderTrack.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startVolumeSliderDrag(e);
        });
        
        // Also allow clicking on thumb
        if (elements.volumeSliderThumb) {
            elements.volumeSliderThumb.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                startVolumeSliderDrag(e);
            });
            
            elements.volumeSliderThumb.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                startVolumeSliderDrag(e);
            });
        }
    }
    
    document.addEventListener('mousemove', (e) => {
        if (state.isDraggingVolume) {
            e.preventDefault();
            updateVolumeSliderDrag(e);
        } else if (state.isDragging) {
            e.preventDefault();
            updateKnobDrag(e);
        }
    });
    document.addEventListener('touchmove', (e) => {
        if (state.isDraggingVolume) {
            e.preventDefault();
            updateVolumeSliderDrag(e);
        } else if (state.isDragging) {
            e.preventDefault();
            updateKnobDrag(e);
        }
    });
    document.addEventListener('mouseup', () => {
        if (state.isDraggingVolume) {
            endVolumeSliderDrag();
        }
        endKnobDrag();
    });
    document.addEventListener('touchend', () => {
        if (state.isDraggingVolume) {
            endVolumeSliderDrag();
        }
        endKnobDrag();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Knob keyboard controls (when a knob is focused)
        if (state.focusedKnob !== null && typeof state.focusedKnob === 'number') {
            const step = e.shiftKey ? 0.1 : 1.0; // Fine control with Shift
            let changed = false;
            
            if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
                e.preventDefault();
                state.x[state.focusedKnob] = clamp(state.x[state.focusedKnob] + step, -10, 10);
                changed = true;
            } else if (e.key === 'ArrowDown' || e.key === '-') {
                e.preventDefault();
                state.x[state.focusedKnob] = clamp(state.x[state.focusedKnob] - step, -10, 10);
                changed = true;
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                state.x[state.focusedKnob] = clamp(state.x[state.focusedKnob] - step, -10, 10);
                changed = true;
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                state.x[state.focusedKnob] = clamp(state.x[state.focusedKnob] + step, -10, 10);
                changed = true;
            }
            
            if (changed) {
                updateDisplays();
                if (window.audioSystem) {
                    window.audioSystem.playKnobClick();
                }
                return; // Don't process other shortcuts when adjusting knobs
            }
        }
        
        // Global shortcuts
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            performIteration();
        } else if (e.key === 'p' || e.key === 'P') {
            e.preventDefault();
            toggleAutoplay();
        } else if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            if (window.audioSystem) {
                window.audioSystem.toggleMute();
            }
        }
    });
    
    // Welcome modal
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', () => {
            if (elements.dontShowAgain && elements.dontShowAgain.checked) {
                try {
                    localStorage.setItem('jacobiRadioWelcomeShown', 'true');
                } catch (e) {
                    console.warn('Could not save welcome modal preference:', e);
                }
            }
            if (elements.welcomeModal) {
                elements.welcomeModal.classList.add('hidden');
            }
        });
    }
    
    // Startup modal listeners
    setupStartupListeners();
}

// --- Configuration Modal & Matrix Editor ---

// Temporary state for configuration
let configState = {
    n: 3,
    A: [],
    b: [],
    visibleKnobs: 3,
    visibleBands: 3
};

// Hard Reset Function - Clears all storage and reloads app
function performHardReset() {
    try {
        // Stop any running processes
        stopAutoplay();
        
        // Clear all localStorage items
        const keysToRemove = [
            'jacobiRadioStartupChoice',
            'jacobiRadioWelcomeShown',
            'jacobiRadioCustomConfig',
            'jacobiRadioTheme',
            'jacobiRadioVisibility'
        ];
        
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn(`Could not remove ${key} from localStorage:`, e);
            }
        });
        
        // Clear all localStorage (in case there are any other keys we missed)
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }
        
        // Clear sessionStorage if it exists
        try {
            sessionStorage.clear();
        } catch (e) {
            console.warn('Could not clear sessionStorage:', e);
        }
        
        // Clear IndexedDB if it exists (for future-proofing)
        if ('indexedDB' in window) {
            try {
                indexedDB.databases().then(databases => {
                    databases.forEach(db => {
                        if (db.name) {
                            indexedDB.deleteDatabase(db.name);
                        }
                    });
                }).catch(e => {
                    console.warn('Could not clear IndexedDB:', e);
                });
            } catch (e) {
                console.warn('IndexedDB not available:', e);
            }
        }
        
        // Clear browser cache (force reload)
        // Reload the page after a brief delay to ensure storage is cleared
        setTimeout(() => {
            window.location.reload(true);
        }, 100);
        
    } catch (e) {
        console.error('Error during hard reset:', e);
        // Still reload even if there was an error
        window.location.reload(true);
    }
}

function initConfigModal() {
    const modal = document.getElementById('configModal');
    const btnClose = document.getElementById('closeConfigModal');
    const btnCancel = document.getElementById('cancelConfigBtn');
    const btnApply = document.getElementById('applyConfigBtn');
    const btnUpdateSize = document.getElementById('updateMatrixSizeBtn');
    const inputSize = document.getElementById('matrixSize');
    
    // Prevent closing when clicking inside the modal content
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Only close if clicking directly on the overlay (not on modal content)
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            
            // Add active class to clicked tab and corresponding content
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.remove('hidden');
            
            // Refresh content based on current configState
            if (tabId === 'matrix') {
                // Update inputs in case configState changed from text tab
                document.getElementById('matrixSize').value = configState.n;
                renderMatrixEditor(configState.n);
            } else if (tabId === 'text') {
                updateTextInputFromState();
            } else if (tabId === 'visibility') {
                updateVisibilityCheckboxes();
            }
        });
    });
    
    // Close/Cancel
    const closeModal = () => {
        modal.classList.add('hidden');
    };
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    
    // Update Grid Size
    if (btnUpdateSize) {
        btnUpdateSize.addEventListener('click', () => {
            const newSize = parseInt(inputSize.value);
            if (newSize >= 2 && newSize <= 10) {
                renderMatrixEditor(newSize);
            }
        });
    }
    
    // Apply Changes
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            applySystemConfiguration();
            closeModal();
            // Also close startup modal if open
            if (elements.startupModal) elements.startupModal.classList.add('hidden');
        });
    }
    
    // Hard Reset Button
    const btnHardReset = document.getElementById('hardResetBtn');
    if (btnHardReset) {
        btnHardReset.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data and reload the app? This will:\n\n- Clear all preferences\n- Clear all saved configurations\n- Clear all cache and storage\n- Reload the app with default settings\n\nThis action cannot be undone.')) {
                performHardReset();
            }
        });
    }
    
    setupTextParserListeners();
}

function setupTextParserListeners() {
    const input = document.getElementById('equationInput');
    const status = document.getElementById('parserStatus');
    
    if (!input || !status) return;
    
    input.addEventListener('input', () => {
        const text = input.value;
        if (!text.trim()) {
            status.textContent = '';
            status.className = 'parser-status';
            // Clear preview
            const previewContent = document.getElementById('textPreviewContent');
            const previewMatrix = document.getElementById('textPreviewMatrix');
            if (previewContent) previewContent.innerHTML = '';
            if (previewMatrix) previewMatrix.innerHTML = '';
            return;
        }
        
        const result = parseEquationText(text);
        
        if (result.error) {
            status.textContent = result.error;
            status.className = 'parser-status error';
            // Clear preview on error
            const previewContent = document.getElementById('textPreviewContent');
            const previewMatrix = document.getElementById('textPreviewMatrix');
            if (previewContent) previewContent.innerHTML = '';
            if (previewMatrix) previewMatrix.innerHTML = '';
        } else {
            status.textContent = `Valid System detected: ${result.n} equations.`;
            status.className = 'parser-status success';
            
            // Update configState
            configState.n = result.n;
            configState.A = result.A;
            configState.b = result.b;
            
            // Update preview
            updateTextPreview();
        }
    });
}

function updateTextInputFromState() {
    const input = document.getElementById('equationInput');
    if (!input) return;
    
    const lines = [];
    for(let i=0; i<configState.n; i++) {
        let line = '';
        let firstTerm = true;
        
        for(let j=0; j<configState.n; j++) {
            // Safe access to configState.A[i][j]
            let coeff = 0;
            if (configState.A[i] && configState.A[i][j] !== undefined) {
                coeff = configState.A[i][j];
            }
            
            if (coeff === 0) continue;
            
            if (firstTerm) {
                if (coeff === 1) line += `x${j+1}`;
                else if (coeff === -1) line += `-x${j+1}`;
                else line += `${coeff}x${j+1}`;
                firstTerm = false;
            } else {
                if (coeff > 0) {
                    line += ` + ${coeff === 1 ? '' : coeff}x${j+1}`;
                } else {
                    line += ` - ${coeff === -1 ? '' : Math.abs(coeff)}x${j+1}`;
                }
            }
        }
        
        if (line === '') line = '0'; // All zeros
        
        const bVal = (configState.b && configState.b[i] !== undefined) ? configState.b[i] : 0;
        line += ` = ${bVal}`;
        lines.push(line);
    }
    
    input.value = lines.join('\n');
    
    // Update status manually
    const status = document.getElementById('parserStatus');
    if (status) {
        status.textContent = `Current System: ${configState.n} equations`;
        status.className = 'parser-status success';
    }
}

function parseEquationText(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { error: '' };
    
    const equations = [];
    let maxIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // Normalize: remove spaces
        const cleanLine = line.replace(/\s+/g, '');
        const parts = cleanLine.split('=');
        
        if (parts.length !== 2) return { error: `Line ${i+1}: Missing '=' sign` };
        
        const lhs = parts[0];
        const rhsStr = parts[1];
        if (!rhsStr) return { error: `Line ${i+1}: Missing value after '='` };
        
        const rhs = parseFloat(rhsStr);
        if (isNaN(rhs)) return { error: `Line ${i+1}: Invalid constant '${rhsStr}'` };
        
        // Parse LHS
        // Regex to match terms like: +4x1, -x2, 5.5x3
        // We need to handle the first term which might not have a sign
        
        const coeffs = {};
        let termFound = false;
        
        // Pattern: ([+-]?)(number)?x(index)
        // We iterate through the string looking for matches
        const regex = /([+-]?)(\d*\.?\d*)x(\d+)/g;
        let match;
        
        while ((match = regex.exec(lhs)) !== null) {
            termFound = true;
            const signStr = match[1];
            const numStr = match[2];
            const idxStr = match[3];
            
            let val = 1;
            if (numStr !== '') {
                val = parseFloat(numStr);
            }
            
            if (signStr === '-') val = -val;
            
            const idx = parseInt(idxStr);
            if (idx < 1) return { error: `Line ${i+1}: Variable indices must start at 1 (found x${idx})` };
            
            coeffs[idx] = val;
            maxIndex = Math.max(maxIndex, idx);
        }
        
        if (!termFound) return { error: `Line ${i+1}: No variables found (format: 4x1 - x2 = 7)` };
        
        equations.push({ coeffs, b: rhs });
    }
    
    // Determine system size
    // We use the larger of (lines count) or (max variable index)
    // But strictly they should match for a square system
    const n = Math.max(maxIndex, lines.length);
    
    if (n < 2) return { error: "System too small (min 2 variables)" };
    if (n > 10) return { error: "System too large (max 10 variables)" };
    
    if (lines.length !== n) {
         return { error: `System mismatch: ${lines.length} equations for ${n} variables. (Expected ${n} equations)` };
    }
    
    // Build Matrix A and Vector b
    const A = [];
    const b = [];
    
    for(let i=0; i<n; i++) {
        A[i] = [];
        b[i] = equations[i].b;
        for(let j=0; j<n; j++) {
            A[i][j] = equations[i].coeffs[j+1] || 0;
        }
    }
    
    return { n, A, b };
}

function showConfigModal(activeTab = 'matrix') {
    const modal = document.getElementById('configModal');
    if (!modal) return;
    
    // Initialize temp state from current state
    configState.n = state.n;
    configState.A = JSON.parse(JSON.stringify(state.A));
    configState.b = [...state.b];
    configState.visibleKnobs = state.visibleKnobs;
    configState.visibleBands = state.visibleBands;
    
    // Populate inputs
    document.getElementById('matrixSize').value = state.n;
    document.getElementById('settingVisibleKnobs').value = state.visibleKnobs;
    document.getElementById('settingVisibleBands').value = state.visibleBands;
    
    // Render matrix
    renderMatrixEditor(state.n);
    
    // Switch to the requested tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === activeTab) {
            btn.classList.add('active');
        }
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        if (content.id === `tab-${activeTab}`) {
            content.classList.remove('hidden');
        }
    });
    
    // Update content for the active tab
    if (activeTab === 'matrix') {
        // Matrix tab is already rendered above, but update preview
        updateMatrixPreview();
    } else if (activeTab === 'text') {
        updateTextInputFromState();
    } else if (activeTab === 'visibility') {
        updateVisibilityCheckboxes();
    }
    
    modal.classList.remove('hidden');
}

// Render equations with KaTeX from configState
function renderEquationsPreview(A, b, n, previewContentId) {
    const previewContent = document.getElementById(previewContentId);
    if (!previewContent || typeof katex === 'undefined') return;
    
    previewContent.innerHTML = '';
    
    for (let i = 0; i < n; i++) {
        let equationLatex = '';
        let hasTerms = false;
        
        for (let j = 0; j < n; j++) {
            const coeff = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
            if (coeff !== 0) {
                hasTerms = true;
                const isFirst = equationLatex === '';
                const absCoeff = Math.abs(coeff);
                const sign = coeff < 0 ? '-' : (isFirst ? '' : '+');
                const varName = `x_{${j + 1}}`;
                
                if (absCoeff === 1) {
                    equationLatex += `${sign}${varName}`;
                } else {
                    equationLatex += `${sign}${absCoeff}${varName}`;
                }
            }
        }
        
        if (!hasTerms) {
            equationLatex = '0';
        }
        
        const bVal = (b && b[i] !== undefined) ? b[i] : 0;
        const fullEquationLatex = `${equationLatex} = ${bVal}`;
        
        try {
            const equationHTML = katex.renderToString(fullEquationLatex, {
                throwOnError: false,
                displayMode: false,
                output: 'html'
            });
            
            const eqDiv = document.createElement('div');
            eqDiv.style.marginBottom = '10px';
            eqDiv.innerHTML = equationHTML;
            previewContent.appendChild(eqDiv);
        } catch (e) {
            console.warn('KaTeX rendering error:', e);
            const eqDiv = document.createElement('div');
            eqDiv.style.marginBottom = '10px';
            eqDiv.textContent = fullEquationLatex;
            previewContent.appendChild(eqDiv);
        }
    }
}

// Render matrix form with KaTeX
function renderMatrixPreview(A, b, n, previewMatrixId) {
    const previewMatrix = document.getElementById(previewMatrixId);
    if (!previewMatrix || typeof katex === 'undefined') return;
    
    // Build matrix LaTeX: A * x = b
    let matrixALatex = '\\begin{pmatrix}';
    for (let i = 0; i < n; i++) {
        let row = '';
        for (let j = 0; j < n; j++) {
            const val = A[i] && A[i][j] !== undefined ? A[i][j] : 0;
            if (j > 0) row += ' & ';
            row += val;
        }
        if (i < n - 1) row += ' \\\\';
        matrixALatex += row;
    }
    matrixALatex += '\\end{pmatrix}';
    
    let vectorXLatex = '\\begin{pmatrix}';
    for (let i = 0; i < n; i++) {
        if (i > 0) vectorXLatex += ' \\\\';
        vectorXLatex += `x_{${i + 1}}`;
    }
    vectorXLatex += '\\end{pmatrix}';
    
    let vectorBLatex = '\\begin{pmatrix}';
    for (let i = 0; i < n; i++) {
        const val = (b && b[i] !== undefined) ? b[i] : 0;
        if (i > 0) vectorBLatex += ' \\\\';
        vectorBLatex += val;
    }
    vectorBLatex += '\\end{pmatrix}';
    
    const fullMatrixLatex = `${matrixALatex}${vectorXLatex} = ${vectorBLatex}`;
    
    try {
        const matrixHTML = katex.renderToString(fullMatrixLatex, {
            throwOnError: false,
            displayMode: true,
            output: 'html'
        });
        previewMatrix.innerHTML = matrixHTML;
    } catch (e) {
        console.warn('KaTeX matrix rendering error:', e);
        previewMatrix.textContent = fullMatrixLatex;
    }
}

// Update matrix preview with current configState
function updateMatrixPreview() {
    if (typeof katex === 'undefined') {
        // Wait for KaTeX to load
        setTimeout(updateMatrixPreview, 100);
        return;
    }
    renderEquationsPreview(configState.A, configState.b, configState.n, 'matrixPreviewContent');
    renderMatrixPreview(configState.A, configState.b, configState.n, 'matrixPreviewMatrix');
}

// Update text preview with current configState
function updateTextPreview() {
    if (typeof katex === 'undefined') {
        // Wait for KaTeX to load
        setTimeout(updateTextPreview, 100);
        return;
    }
    renderEquationsPreview(configState.A, configState.b, configState.n, 'textPreviewContent');
    renderMatrixPreview(configState.A, configState.b, configState.n, 'textPreviewMatrix');
}

function renderMatrixEditor(size) {
    const container = document.getElementById('matrixEditorContainer');
    if (!container) return;
    
    configState.n = size; // Update temp size
    
    // Resize A and b if needed (preserve existing values where possible)
    const newA = [];
    const newB = [];
    
    for(let i=0; i<size; i++) {
        newA[i] = [];
        newB[i] = (configState.b && configState.b[i] !== undefined) ? configState.b[i] : 0;
        for(let j=0; j<size; j++) {
            if (configState.A && configState.A[i] && configState.A[i][j] !== undefined) {
                newA[i][j] = configState.A[i][j];
            } else {
                // Default identity-like matrix for new cells
                newA[i][j] = (i === j) ? 4 : 0;
            }
        }
    }
    configState.A = newA;
    configState.b = newB;
    
    // Generate Grid HTML
    // Columns: n for A + 1 separator + 1 for b
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${size}, auto) 20px auto`;
    
    // Header Row
    for(let j=0; j<size; j++) {
        const label = document.createElement('div');
        label.className = 'cell-label';
        label.textContent = `x${j+1}`;
        grid.appendChild(label);
    }
    grid.appendChild(document.createElement('div')); // Separator header
    const bLabel = document.createElement('div');
    bLabel.className = 'cell-label';
    bLabel.textContent = 'Const (b)';
    grid.appendChild(bLabel);
    
    // Rows
    for(let i=0; i<size; i++) {
        // A[i][j] cells
        for(let j=0; j<size; j++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'matrix-cell-wrapper';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = `matrix-cell ${i===j ? 'diagonal' : ''}`;
            input.value = configState.A[i][j];
            input.step = 'any';
            input.dataset.row = i;
            input.dataset.col = j;
            input.dataset.type = 'A';
            
            input.addEventListener('change', (e) => {
                const r = parseInt(e.target.dataset.row);
                const c = parseInt(e.target.dataset.col);
                configState.A[r][c] = parseFloat(e.target.value) || 0;
                updateMatrixPreview();
            });
            
            wrapper.appendChild(input);
            grid.appendChild(wrapper);
        }
        
        // Separator
        const sep = document.createElement('div');
        sep.className = 'grid-separator';
        grid.appendChild(sep);
        
        // b[i] cell
        const wrapperB = document.createElement('div');
        wrapperB.className = 'matrix-cell-wrapper';
        
        const inputB = document.createElement('input');
        inputB.type = 'number';
        inputB.className = 'matrix-cell';
        inputB.value = configState.b[i];
        inputB.step = 'any';
        inputB.dataset.row = i;
        inputB.dataset.type = 'b';
        
        inputB.addEventListener('change', (e) => {
            const r = parseInt(e.target.dataset.row);
            configState.b[r] = parseFloat(e.target.value) || 0;
            updateMatrixPreview();
        });
        
        wrapperB.appendChild(inputB);
        grid.appendChild(wrapperB);
    }
    
    container.appendChild(grid);
    
    // Update preview
    updateMatrixPreview();
}

function applySystemConfiguration() {
    // Read settings
    const visibleKnobs = parseInt(document.getElementById('settingVisibleKnobs').value);
    const visibleBands = parseInt(document.getElementById('settingVisibleBands').value);
    
    // Validate diagonal dominance (warning)
    let isDiagonallyDominant = true;
    for(let i=0; i<configState.n; i++) {
        let sum = 0;
        for(let j=0; j<configState.n; j++) {
            if (i !== j && configState.A[i] && configState.A[i][j] !== undefined) {
                sum += Math.abs(configState.A[i][j]);
            }
        }
        if (configState.A[i] && Math.abs(configState.A[i][i]) <= sum) {
            isDiagonallyDominant = false;
        }
    }
    
    if (!isDiagonallyDominant) {
        showMessage('Warning: System is not diagonally dominant. Convergence not guaranteed.', 'warning');
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
    clearEquationHistory(state.equationHistory);
    
    // Update UI
    renderKnobs();
    renderBands();
    updateDisplays();
    
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
    
    showMessage(`System updated to ${state.n}×${state.n} configuration.`, 'success');
}

// Visibility Control Functions
function loadVisibilityPreference() {
    try {
        const saved = localStorage.getItem('jacobiRadioVisibility');
        if (saved) {
            const visibility = JSON.parse(saved);
            Object.assign(state.visibility, visibility);
        }
    } catch (e) {
        console.warn('Could not read visibility preference from localStorage:', e);
    }
    applyVisibility();
}

function saveVisibilityPreference() {
    try {
        localStorage.setItem('jacobiRadioVisibility', JSON.stringify(state.visibility));
    } catch (e) {
        console.warn('Could not save visibility preference to localStorage:', e);
    }
}

function applyVisibility() {
    // Map visibility state to DOM elements
    const visibilityMap = {
        header: elements.header,
        equalizerBands: elements.equalizerBands,
        signalClarityDisplay: elements.signalClarityDisplay,
        radioBody: elements.radioBody,
        speakerGrille: elements.speakerGrille,
        powerIndicator: elements.powerIndicator,
        knobs: elements.knobsContainer,
        volumeControl: elements.volumeControl,
        tuningDial: elements.tuningDial,
        controls: elements.controls,
        themeToggle: elements.themeToggle
    };
    
    // Apply visibility to each element
    for (const [key, element] of Object.entries(visibilityMap)) {
        if (element) {
            // Special handling: if header is hidden, theme toggle should also be hidden
            if (key === 'themeToggle' && !state.visibility.header) {
                element.classList.add('component-hidden');
            } else if (state.visibility[key]) {
                element.classList.remove('component-hidden');
            } else {
                element.classList.add('component-hidden');
            }
        }
    }
}

function toggleComponentVisibility(componentKey, visible) {
    state.visibility[componentKey] = visible;
    applyVisibility();
    saveVisibilityPreference();
}

function resetVisibility() {
    // Reset all to visible
    Object.keys(state.visibility).forEach(key => {
        state.visibility[key] = true;
    });
    applyVisibility();
    saveVisibilityPreference();
    updateVisibilityCheckboxes();
}

function updateVisibilityCheckboxes() {
    const checkboxMap = {
        header: 'toggleHeader',
        controls: 'toggleControls',
        equalizerBands: 'toggleEqualizerBands',
        signalClarityDisplay: 'toggleSignalClarity',
        radioBody: 'toggleRadioBody',
        speakerGrille: 'toggleSpeakerGrille',
        powerIndicator: 'togglePowerIndicator',
        knobs: 'toggleKnobs',
        volumeControl: 'toggleVolumeControl',
        tuningDial: 'toggleTuningDial'
    };
    
    for (const [key, checkboxId] of Object.entries(checkboxMap)) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = state.visibility[key];
        }
    }
}

function initVisibilityControls() {
    // Get visibility button
    elements.visibilityBtn = document.getElementById('visibilityBtn');
    const resetVisibilityBtn = document.getElementById('resetVisibilityBtn');
    
    // Open config modal with visibility tab active
    if (elements.visibilityBtn) {
        elements.visibilityBtn.addEventListener('click', () => {
            showConfigModal('visibility');
        });
    }
    
    // Reset button
    if (resetVisibilityBtn) {
        resetVisibilityBtn.addEventListener('click', () => {
            resetVisibility();
        });
    }
    
    // Setup checkbox listeners
    const checkboxMap = {
        toggleHeader: 'header',
        toggleControls: 'controls',
        toggleEqualizerBands: 'equalizerBands',
        toggleSignalClarity: 'signalClarityDisplay',
        toggleRadioBody: 'radioBody',
        toggleSpeakerGrille: 'speakerGrille',
        togglePowerIndicator: 'powerIndicator',
        toggleKnobs: 'knobs',
        toggleVolumeControl: 'volumeControl',
        toggleTuningDial: 'tuningDial'
    };
    
    for (const [checkboxId, componentKey] of Object.entries(checkboxMap)) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                toggleComponentVisibility(componentKey, e.target.checked);
            });
        }
    }
}

// Initialize
function init() {
    // Load theme preference
    loadThemePreference();
    
    // Load visibility preference
    loadVisibilityPreference();
    
    // Apply visibility settings after loading preferences
    applyVisibility();
    
    // Initialize Configuration Modal
    initConfigModal();
    
    // Initialize Visibility Controls
    initVisibilityControls();
    
    setupEventListeners();
    
    // Initial render of knobs and bands (default 3x3)
    renderKnobs();
    renderBands();
    
    // Initialize equation visualizer (now in modal)
    const equationVisualizerContent = document.getElementById('equationVisualizerContent');
    if (equationVisualizerContent) {
        // The content element already exists in the modal, no need to initialize container
        // Just ensure it's ready
    }
    
    // Initialize startup flow (handles welcome modal visibility)
    initStartup();
    
    // Render any visible KaTeX equations after initialization
    if (typeof katex !== 'undefined') {
        setTimeout(() => {
            // Render equations in startup modal if visible
            if (elements.startupModal && !elements.startupModal.classList.contains('hidden')) {
                renderKaTeXEquations(elements.startupModal);
            }
            // Render equations in help panel if visible
            if (elements.helpPanel && !elements.helpPanel.classList.contains('hidden')) {
                renderKaTeXEquations(elements.helpPanel);
            }
        }, 100);
    }
    
    updateDisplays();
    
    // Initialize speed
    updateSpeed(state.speed);
    
    // Initialize volume slider
    updateVolumeSlider(state.volume);
    
    // Set up audio volume sync when audio system is ready
    // Audio system initializes on first user interaction, so we'll sync when it's available
    const syncAudioVolume = () => {
        if (window.audioSystem && window.audioSystem.initialized) {
            window.audioSystem.setVolume(state.volume);
            // If volume is > 0, unmute (audio starts muted by default)
            if (state.volume > 0 && window.audioSystem.isMuted) {
                window.audioSystem.toggleMute();
            }
        } else {
            // Try again after a short delay if audio system isn't ready yet
            setTimeout(syncAudioVolume, 100);
        }
    };
    
    // Start syncing (will work once audio system initializes)
    syncAudioVolume();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

