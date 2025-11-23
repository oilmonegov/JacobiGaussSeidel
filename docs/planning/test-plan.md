# Jacobi Iteration Equalizer Simulator - Test Plan

**Version:** 1.0
**Date:** 2025-05-22
**Project:** Jacobi Iteration Equalizer Simulator

---

## 1. Math Engine Correctness Tests (MATH)

These tests verify the core mathematical logic of the simulator, including the Jacobi iteration formulas, error calculations, and convergence criteria.

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **MATH-001** | Initial State Verification | Application loaded | Check initial values of x₁, x₂, x₃. | x₁=1.00, x₂=2.00, x₃=2.00 (or configured defaults). | |
| **MATH-002** | Jacobi Formula Verification (Step 1) | Reset state (1, 2, 2) | Click "Step" once. | New values should be:<br>x₁ = (7+2-2)/4 = 1.75<br>x₂ = (21+4*1+2)/8 = 3.375<br>x₃ = (15+2*1-2)/5 = 3.00 | |
| **MATH-003** | Jacobi Formula Verification (Step 2) | After Step 1 (1.75, 3.375, 3.0) | Click "Step" again. | New values should be:<br>x₁ = (7+3.375-3)/4 ≈ 1.84<br>x₂ = (21+4*1.75+3)/8 = 3.875<br>x₃ = (15+2*1.75-3.375)/5 = 3.025 | |
| **MATH-004** | True Solution Convergence | Set values manually to (2, 4, 3) | Check error metrics. | All errors should be 0.00.<br>Convergence status: "Converged". | |
| **MATH-005** | Error Calculation - Equation 1 | Set x₁=0, x₂=0, x₃=0 | Check Eq 1 Display. | LHS = 0. RHS = 7. Error = -7.00. | |
| **MATH-006** | Error Calculation - Equation 2 | Set x₁=0, x₂=0, x₃=0 | Check Eq 2 Display. | LHS = 0. RHS = -21. Error = 21.00. | |
| **MATH-007** | Error Calculation - Equation 3 | Set x₁=0, x₂=0, x₃=0 | Check Eq 3 Display. | LHS = 0. RHS = 15. Error = -15.00. | |
| **MATH-008** | Max Error Metric Accuracy | Set arbitrary values (e.g., 0,0,0) | Check "Max Error" display. | Max Error should be 21.00 (max of \|-7\|, \|21\|, \|-15\|). | |
| **MATH-009** | Value Clamping (Max Positive) | Set inputs > 10 programmatically or via drag. | Attempt to set x₁ = 15. | Value clamps to 10.00. | |
| **MATH-010** | Value Clamping (Max Negative) | Set inputs < -10. | Attempt to set x₁ = -15. | Value clamps to -10.00. | |
| **MATH-011** | NaN Handling | Inject NaN into state variables. | Trigger updateDisplays(). | Value defaults to 0 or previous valid state; app does not crash. | |
| **MATH-012** | Infinity Handling | Inject Infinity into state. | Trigger updateDisplays(). | Value clamps to max range (10.00); app does not crash. | |
| **MATH-013** | Convergence Threshold - Not Converged | Max Error = 1.01 | Check Status Display. | Status: "Not Converged", Color: Red. | |
| **MATH-014** | Convergence Threshold - Converging | Max Error = 0.5 | Check Status Display. | Status: "Converging", Color: Amber. | |
| **MATH-015** | Convergence Threshold - Nearly Converged | Max Error = 0.05 | Check Status Display. | Status: "Nearly Converged", Color: Green. | |
| **MATH-016** | Convergence Threshold - Converged | Max Error = 0.00005 | Check Status Display. | Status: "Converged", Green Glow effect active. | |

---

## 2. UI Component Functional Tests (UI)

Tests for all visual interactive elements on the screen.

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **UI-001** | Knob Display Accuracy | Initial Load | Verify knob labels and values. | Labels x₁, x₂, x₃ present. Values match state (1.00, 2.00, 2.00). | |
| **UI-002** | Knob Visual Rotation | Initial Load | Inspect knob CSS transform. | Knobs rotated to angles corresponding to values. | |
| **UI-003** | Step Button Interaction | Idle state | Click "Step" button. | Iteration counter increments by 1. Values update. Sound plays (if audio on). | |
| **UI-004** | Autoplay Toggle - Start | Idle state | Click "Play" button. | Button text changes to "Pause". "Power" indicator lights up. Iterations increment automatically. | |
| **UI-005** | Autoplay Toggle - Stop | Autoplaying | Click "Pause" button. | Button text changes to "Play". Iterations stop. Power indicator dims/off. | |
| **UI-006** | Reset Button Functionality | Modified state (iter > 0) | Click "Reset" button. | Values return to (1, 2, 2). Iteration count = 0. Status resets. Audio stops/resets. | |
| **UI-007** | Random Button Functionality | Idle state | Click "Random" button. | Values change to random numbers in [-10, 10]. Iteration count resets to 0. | |
| **UI-008** | Speed Slider - Slow | Autoplaying | Move slider to left (min). | Iteration updates become slower (~2000ms delay). Speed label shows "Slow". | |
| **UI-009** | Speed Slider - Fast | Autoplaying | Move slider to right (max). | Iteration updates become rapid (~100ms delay). Speed label shows "Fast". | |
| **UI-010** | Volume Slider Interaction | Audio Init | Drag volume slider. | `volumeValue` display updates (0-100%). Audio volume changes perceptibly. | |
| **UI-011** | Mute Button Toggle | Audio Playing | Click Mute button. | Icon changes to muted. Sound stops. Click again -> Sound resumes. | |
| **UI-012** | Frequency Readout Updates | Step Iteration | Observe Condition Displays. | Frequencies/Errors update instantly after step. Colors update based on error. | |
| **UI-013** | Signal Meter Animation | Reduce error | Step towards solution. | Signal meter bars fill up as error decreases (inverse relationship). | |
| **UI-014** | Tuning Dial Movement | Reduce error | Step towards solution. | Tuning dial pointer moves from "Static" side towards "Clear" side. | |
| **UI-015** | Welcome Modal Display | Fresh Load (Clean Storage) | Load page. | Welcome modal appears centered overlaying content. | |
| **UI-016** | Welcome Modal Dismissal | Modal Open | Click "Get Started". | Modal disappears. Main interface accessible. | |
| **UI-017** | Welcome Modal - Don't Show Again | Modal Open | Check "Don't show again", Close. Refresh page. | Modal does NOT appear on reload. | |
| **UI-018** | Power Indicator Animation | Autoplay Active | Observe power LED. | LED pulses/glows while autoplay is active. | |
| **UI-019** | Speaker Grille Pulse | Autoplay Active | Observe speaker grille. | Grille visual pulses rhythmically during operation/convergence. | |
| **UI-020** | Condition Preset Buttons (Future) | N/A | If implemented: Click preset. | Values jump to preset configuration. | |

---

## 3. User Interaction Tests (INT)

Tests focusing on how the user physically interacts with the application (mouse, touch, keyboard).

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **INT-001** | Knob Mouse Drag - Vertical | Idle | Click knob x₁, drag mouse up/down. | Value x₁ changes. Up=Increase, Down=Decrease. Knob rotates. | |
| **INT-002** | Knob Mouse Drag - Release | Dragging | Release mouse button. | Dragging stops. Value persists. | |
| **INT-003** | Knob Drag Bounds | Idle | Drag value to > 10. | Value stops increasing at 10.00 even if mouse continues moving. | |
| **INT-004** | Touch Drag (Mobile) | Mobile Device/Sim | Touch knob x₂, drag finger. | Knob follows touch movement. Value updates. | |
| **INT-005** | Keyboard Shortcut - Step | Focus on body | Press 'Enter' or 'Space'. | Performs one iteration step. | |
| **INT-006** | Keyboard Shortcut - Play/Pause | Focus on body | Press 'P'. | Toggles autoplay state. | |
| **INT-007** | Keyboard Shortcut - Mute | Focus on body | Press 'M'. | Toggles mute state. | |
| **INT-008** | Multiple Button Clicks | Idle | Click Step rapidly (5x). | 5 iterations occur. UI updates keep up or catch up. | |
| **INT-009** | Interaction During Autoplay | Autoplaying | Grab a knob and drag it. | **Decision:** Either pauses autoplay OR updates value live while iterating. (Ideally: pauses or overrides). | |
| **INT-010** | Focus Management | Tab Key | Press Tab repeatedly. | Focus moves logically through interactive elements (Knobs? Buttons, Sliders). | |

---

## 4. Audio System Tests (AUD)

Tests for the Web Audio API implementation and sound design.

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **AUD-001** | Audio Context Initialization | User Interaction | Click anywhere on page. | AudioContext transitions to 'running'. `window.audioSystem` is initialized. | |
| **AUD-002** | Noise Generation | High Error State | Unmute. | White/Pink noise is audible (static). | |
| **AUD-003** | Nature Sound Playback | Low Error State | Manually set near-solution values. | Nature sounds (birds/wind) become audible. Noise fades out. | |
| **AUD-004** | Crossfading Logic | Unmuted | Step from High Error to Low Error. | Audio smoothly transitions from Noise to Nature sounds. No popping/clicking. | |
| **AUD-005** | Volume Control Scaling | Audio Playing | Set Volume 50% -> 0% -> 100%. | Volume matches slider position. 0% is silent. | |
| **AUD-006** | Mute Immediate Silence | Audio Playing | Click Mute. | Sound cuts off (possibly with short fade out) immediately. | |
| **AUD-007** | Unmute Resume | Muted | Click Unmute. | Sound resumes at correct mix level for current error state. | |
| **AUD-008** | Knob Click Sound | Unmuted | Drag knob. | Subtle "tick" or "click" heard during rotation. | |
| **AUD-009** | Button Click Sound | Unmuted | Click buttons. | Distinct mechanical click sound plays. | |
| **AUD-010** | Convergence Chime | Unmuted | Run until converged. | Pleasant chime plays once upon hitting convergence (error < 0.0001). | |
| **AUD-011** | Audio Fallback | Browser w/o WebAudio | Simulate no WebAudio support. | App runs without errors. UI visual feedback still works. Console warns gracefully. | |
| **AUD-012** | Tab Switching | Audio Playing | Switch tabs/minimize. | Audio continues or pauses (depending on browser policy, typically continues if context is running). | |
| **AUD-013** | Rapid Mute/Unmute | Audio Playing | Click Mute repeatedly. | No audio glitches/stacking of sounds. State remains consistent. | |
| **AUD-014** | Audio Resource Loading | Init | Check Network tab. | Nature sound assets load successfully. | |
| **AUD-015** | Synthetic Sound Generation | No Assets | (If using synth fallback) Init audio. | Synthetic nature sounds generated if files missing. | |

---

## 5. Animation & Visual Feedback Tests (VIS)

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **VIS-001** | Knob Smooth Transition | Step | Click Step. | Knob rotates smoothly to new position (CSS transition/animation), not instant jump. | |
| **VIS-002** | Color Transition - Red to Amber | Error 1.5 -> 0.5 | Change values. | Condition display bg changes from Red-tint to Amber-tint smoothly. | |
| **VIS-003** | Color Transition - Amber to Green | Error 0.5 -> 0.05 | Change values. | Condition display bg changes from Amber-tint to Green-tint smoothly. | |
| **VIS-004** | Signal Meter Animation | Step | Change values. | Bar width animates (grows/shrinks) smoothly. | |
| **VIS-005** | Convergence Glow | Converged | Reach solution. | Main convergence display emits green glow/pulse. | |
| **VIS-006** | Power Light Pulse | Autoplay | Start Autoplay. | Power indicator pulses rhythmically (not static on). | |
| **VIS-007** | Speaker Grille Animation | Autoplay | Start Autoplay. | Speaker grille element scales/pulses slightly. | |
| **VIS-008** | Numeric Display Stability | Rapid Updates | Autoplay Fast. | Numbers update without jittering layout (fixed width font/container). | |
| **VIS-009** | Tuning Dial Smoothness | Step | Change values. | Dial pointer moves smoothly, not jumping. | |
| **VIS-010** | Visual Hierarchy | Static | Inspect UI. | "Converged" state visually distinct and rewarding compared to "Not Converged". | |

---

## 6. Edge Cases & Error Handling (EDGE)

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **EDGE-001** | Divergence / Non-Convergence | Random Start | Start Autoplay. Let run > 1000 iters. | Autoplay stops. Alert/Message: "Not converging". | |
| **EDGE-002** | Rapid Reset | Autoplaying | Click Reset while playing. | Autoplay stops immediately. Values reset. No ghost iterations continue. | |
| **EDGE-003** | Audio Init Delay | No Interaction | Reload page. Don't click. | Audio Context is suspended. No sound. No errors in console. | |
| **EDGE-004** | Extreme Speed Change | Autoplaying | Drag speed Min to Max rapidly. | Interval updates correctly. No "stacking" of intervals (super fast speed). | |
| **EDGE-005** | Knob Drag Out of View | Dragging | Drag mouse outside browser window. | Drag continues or releases gracefully. Value doesn't get stuck. | |
| **EDGE-006** | Zero Values | Manual | Set all to 0. | Valid state. Math works (Values update to 1.75, 2.625, 3.0). | |
| **EDGE-007** | Very Small Errors | Near Sol | Error < 1e-10. | Display handles small numbers (e.g., shows 0.00 or scientific notation if needed, but 0.00 preferred). | |
| **EDGE-008** | Network Failure | Reload | Block network for audio assets. | App loads. Audio might be silent or use fallback synth. No crash. | |

---

## 7. Browser Compatibility Tests (COMP)

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **COMP-001** | Chrome / Chromium (Edge) | Latest Ver | Run full suite. | All tests pass. Performance optimal. | |
| **COMP-002** | Firefox | Latest Ver | Run full suite. | All tests pass. Audio context handles specific Firefox policies. | |
| **COMP-003** | Safari (macOS) | Latest Ver | Run full suite. | Check Web Audio syntax (webkit prefix handled). UI rendering matches. | |
| **COMP-004** | Mobile Safari (iOS) | iOS Device | Test Touch & Audio. | Touch works. Audio starts only after tap. Layout responsive. | |
| **COMP-005** | Android Chrome | Android Device | Test Touch & Audio. | Touch works. Audio starts after tap. Layout responsive. | |

---

## 8. Performance Tests (PERF)

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **PERF-001** | Frame Rate - Idle | Idle | Check DevTools FPS. | Steady 60fps (or screen refresh rate). | |
| **PERF-002** | Frame Rate - Autoplay Fast | Max Speed | Start Autoplay. Monitor FPS. | Maintain > 30fps (ideally 60fps). No visible stutter. | |
| **PERF-003** | Memory Leak Check | Autoplay | Run for 5 minutes. | Heap size remains stable. No monotonically increasing memory usage. | |
| **PERF-004** | CPU Usage | Autoplay | Monitor Task Manager. | CPU usage reasonable (< 20-30% of single core). | |
| **PERF-005** | Audio Latency | Unmuted | Click Step. | Sound corresponds immediately to visual update. | |

---

## 9. Accessibility Tests (ACC)

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **ACC-001** | Keyboard Navigation | Tab | Tab through interface. | Focus ring visible on all interactive elements (buttons, sliders, knobs). | |
| **ACC-002** | Screen Reader - Knobs | VoiceOver/NVDA | Focus Knob. | Reads label ("x1") and current value. | |
| **ACC-003** | Screen Reader - Status | VoiceOver/NVDA | Converged. | Convergence status is announced or readable. | |
| **ACC-004** | Color Contrast | Static | Run Lighthouse Audit. | Contrast ratio > 4.5:1 for text. | |
| **ACC-005** | No Audio Dependency | Muted | Use app. | Visual feedback (meters, colors) sufficient to use app without hearing. | |

---

## 10. Integration Tests (INTEG)

End-to-end scenarios simulating real user journeys.

| Test ID | Test Name | Preconditions | Test Steps | Expected Result | Status |
|---------|-----------|---------------|------------|-----------------|--------|
| **INTEG-001** | The "Happy Path" | Fresh Load | 1. Close Welcome.<br>2. Click Step 3 times.<br>3. Start Autoplay.<br>4. Wait for convergence. | App guides user from initial state to solution smoothly. Audio transitions from static to nature. Success chime plays. | |
| **INTEG-002** | Manual Tuning Challenge | Fresh Load | 1. Randomize.<br>2. Try to manually drag knobs to reduce error (watch meters).<br>3. Get close manually.<br>4. Use Step to finish. | User can "gameify" the solution by manually adjusting based on feedback. | |
| **INTEG-003** | Presentation Mode | Connected to Projector | 1. Mute Audio.<br>2. Use Max Speed.<br>3. Run iterations.<br>4. Reset. | Visuals clear from distance. Fast speed works for demos. | |
| **INTEG-004** | Persistent User Prefs | Fresh Load | 1. Check "Don't Show Again".<br>2. Set Volume 20%.<br>3. Reload. | Welcome hidden. (Optional: Volume remembered? If implemented). | |

