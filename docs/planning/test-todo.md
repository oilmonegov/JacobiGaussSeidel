# Test Execution Checklist - Jacobi Iteration Equalizer Simulator

**Version:** 1.0  
**Date:** 2025-05-22  
**Project:** Jacobi Iteration Equalizer Simulator  
**Total Test Cases:** 100+

---

## Test Execution Summary

- **Total Tests:** 100
- **Passed:** 0
- **Failed:** 0
- **Blocked:** 0
- **Not Run:** 100

---

## 1. Math Engine Correctness Tests (MATH) - 16 tests

- [ ] **MATH-001** - Initial State Verification
  - Preconditions: Application loaded
  - Expected: x₁=1.00, x₂=2.00, x₃=2.00 (or configured defaults)

- [ ] **MATH-002** - Jacobi Formula Verification (Step 1)
  - Preconditions: Reset state (1, 2, 2)
  - Expected: x₁ = 1.75, x₂ = 3.375, x₃ = 3.00

- [ ] **MATH-003** - Jacobi Formula Verification (Step 2)
  - Preconditions: After Step 1 (1.75, 3.375, 3.0)
  - Expected: x₁ ≈ 1.84, x₂ = 3.875, x₃ = 3.025

- [ ] **MATH-004** - True Solution Convergence
  - Preconditions: Set values manually to (2, 4, 3)
  - Expected: All errors = 0.00, Status: "Converged"

- [ ] **MATH-005** - Error Calculation - Equation 1
  - Preconditions: Set x₁=0, x₂=0, x₃=0
  - Expected: LHS = 0, RHS = 7, Error = -7.00

- [ ] **MATH-006** - Error Calculation - Equation 2
  - Preconditions: Set x₁=0, x₂=0, x₃=0
  - Expected: LHS = 0, RHS = -21, Error = 21.00

- [ ] **MATH-007** - Error Calculation - Equation 3
  - Preconditions: Set x₁=0, x₂=0, x₃=0
  - Expected: LHS = 0, RHS = 15, Error = -15.00

- [ ] **MATH-008** - Max Error Metric Accuracy
  - Preconditions: Set arbitrary values (e.g., 0,0,0)
  - Expected: Max Error = 21.00

- [ ] **MATH-009** - Value Clamping (Max Positive)
  - Preconditions: Set inputs > 10 programmatically or via drag
  - Expected: Value clamps to 10.00

- [ ] **MATH-010** - Value Clamping (Max Negative)
  - Preconditions: Set inputs < -10
  - Expected: Value clamps to -10.00

- [ ] **MATH-011** - NaN Handling
  - Preconditions: Inject NaN into state variables
  - Expected: Value defaults to 0 or previous valid state; app does not crash

- [ ] **MATH-012** - Infinity Handling
  - Preconditions: Inject Infinity into state
  - Expected: Value clamps to max range (10.00); app does not crash

- [ ] **MATH-013** - Convergence Threshold - Not Converged
  - Preconditions: Max Error = 1.01
  - Expected: Status: "Not Converged", Color: Red

- [ ] **MATH-014** - Convergence Threshold - Converging
  - Preconditions: Max Error = 0.5
  - Expected: Status: "Converging", Color: Amber

- [ ] **MATH-015** - Convergence Threshold - Nearly Converged
  - Preconditions: Max Error = 0.05
  - Expected: Status: "Nearly Converged", Color: Green

- [ ] **MATH-016** - Convergence Threshold - Converged
  - Preconditions: Max Error = 0.00005
  - Expected: Status: "Converged", Green Glow effect active

---

## 2. UI Component Functional Tests (UI) - 20 tests

- [ ] **UI-001** - Knob Display Accuracy
  - Preconditions: Initial Load
  - Expected: Labels x₁, x₂, x₃ present. Values match state (1.00, 2.00, 2.00)

- [ ] **UI-002** - Knob Visual Rotation
  - Preconditions: Initial Load
  - Expected: Knobs rotated to angles corresponding to values

- [ ] **UI-003** - Step Button Interaction
  - Preconditions: Idle state
  - Expected: Iteration counter increments by 1. Values update. Sound plays (if audio on)

- [ ] **UI-004** - Autoplay Toggle - Start
  - Preconditions: Idle state
  - Expected: Button text changes to "Pause". "Power" indicator lights up. Iterations increment automatically

- [ ] **UI-005** - Autoplay Toggle - Stop
  - Preconditions: Autoplaying
  - Expected: Button text changes to "Play". Iterations stop. Power indicator dims/off

- [ ] **UI-006** - Reset Button Functionality
  - Preconditions: Modified state (iter > 0)
  - Expected: Values return to (1, 2, 2). Iteration count = 0. Status resets. Audio stops/resets

- [ ] **UI-007** - Random Button Functionality
  - Preconditions: Idle state
  - Expected: Values change to random numbers in [-10, 10]. Iteration count resets to 0

- [ ] **UI-008** - Speed Slider - Slow
  - Preconditions: Autoplaying
  - Expected: Iteration updates become slower (~2000ms delay). Speed label shows "Slow"

- [ ] **UI-009** - Speed Slider - Fast
  - Preconditions: Autoplaying
  - Expected: Iteration updates become rapid (~100ms delay). Speed label shows "Fast"

- [ ] **UI-010** - Volume Slider Interaction
  - Preconditions: Audio Init
  - Expected: `volumeValue` display updates (0-100%). Audio volume changes perceptibly

- [ ] **UI-011** - Mute Button Toggle
  - Preconditions: Audio Playing
  - Expected: Icon changes to muted. Sound stops. Click again -> Sound resumes

- [ ] **UI-012** - Frequency Readout Updates
  - Preconditions: Step Iteration
  - Expected: Frequencies/Errors update instantly after step. Colors update based on error

- [ ] **UI-013** - Signal Meter Animation
  - Preconditions: Reduce error
  - Expected: Signal meter bars fill up as error decreases (inverse relationship)

- [ ] **UI-014** - Tuning Dial Movement
  - Preconditions: Reduce error
  - Expected: Tuning dial pointer moves from "Static" side towards "Clear" side

- [ ] **UI-015** - Welcome Modal Display
  - Preconditions: Fresh Load (Clean Storage)
  - Expected: Welcome modal appears centered overlaying content

- [ ] **UI-016** - Welcome Modal Dismissal
  - Preconditions: Modal Open
  - Expected: Modal disappears. Main interface accessible

- [ ] **UI-017** - Welcome Modal - Don't Show Again
  - Preconditions: Modal Open
  - Expected: Modal does NOT appear on reload

- [ ] **UI-018** - Power Indicator Animation
  - Preconditions: Autoplay Active
  - Expected: LED pulses/glows while autoplay is active

- [ ] **UI-019** - Speaker Grille Pulse
  - Preconditions: Autoplay Active
  - Expected: Grille visual pulses rhythmically during operation/convergence

- [ ] **UI-020** - Station Preset Buttons (Future)
  - Preconditions: N/A
  - Expected: If implemented: Values jump to preset configuration

---

## 3. User Interaction Tests (INT) - 10 tests

- [ ] **INT-001** - Knob Mouse Drag - Vertical
  - Preconditions: Idle
  - Expected: Value x₁ changes. Up=Increase, Down=Decrease. Knob rotates

- [ ] **INT-002** - Knob Mouse Drag - Release
  - Preconditions: Dragging
  - Expected: Dragging stops. Value persists

- [ ] **INT-003** - Knob Drag Bounds
  - Preconditions: Idle
  - Expected: Value stops increasing at 10.00 even if mouse continues moving

- [ ] **INT-004** - Touch Drag (Mobile)
  - Preconditions: Mobile Device/Sim
  - Expected: Knob follows touch movement. Value updates

- [ ] **INT-005** - Keyboard Shortcut - Step
  - Preconditions: Focus on body
  - Expected: Performs one iteration step

- [ ] **INT-006** - Keyboard Shortcut - Play/Pause
  - Preconditions: Focus on body
  - Expected: Toggles autoplay state

- [ ] **INT-007** - Keyboard Shortcut - Mute
  - Preconditions: Focus on body
  - Expected: Toggles mute state

- [ ] **INT-008** - Multiple Button Clicks
  - Preconditions: Idle
  - Expected: 5 iterations occur. UI updates keep up or catch up

- [ ] **INT-009** - Interaction During Autoplay
  - Preconditions: Autoplaying
  - Expected: Either pauses autoplay OR updates value live while iterating (Ideally: pauses or overrides)

- [ ] **INT-010** - Focus Management
  - Preconditions: Tab Key
  - Expected: Focus moves logically through interactive elements (Knobs? Buttons, Sliders)

---

## 4. Audio System Tests (AUD) - 15 tests

- [ ] **AUD-001** - Audio Context Initialization
  - Preconditions: User Interaction
  - Expected: AudioContext transitions to 'running'. `window.audioSystem` is initialized

- [ ] **AUD-002** - Noise Generation
  - Preconditions: High Error State
  - Expected: White/Pink noise is audible (static)

- [ ] **AUD-003** - Nature Sound Playback
  - Preconditions: Low Error State
  - Expected: Nature sounds (birds/wind) become audible. Noise fades out

- [ ] **AUD-004** - Crossfading Logic
  - Preconditions: Unmuted
  - Expected: Audio smoothly transitions from Noise to Nature sounds. No popping/clicking

- [ ] **AUD-005** - Volume Control Scaling
  - Preconditions: Audio Playing
  - Expected: Volume matches slider position. 0% is silent

- [ ] **AUD-006** - Mute Immediate Silence
  - Preconditions: Audio Playing
  - Expected: Sound cuts off (possibly with short fade out) immediately

- [ ] **AUD-007** - Unmute Resume
  - Preconditions: Muted
  - Expected: Sound resumes at correct mix level for current error state

- [ ] **AUD-008** - Knob Click Sound
  - Preconditions: Unmuted
  - Expected: Subtle "tick" or "click" heard during rotation

- [ ] **AUD-009** - Button Click Sound
  - Preconditions: Unmuted
  - Expected: Distinct mechanical click sound plays

- [ ] **AUD-010** - Convergence Chime
  - Preconditions: Unmuted
  - Expected: Pleasant chime plays once upon hitting convergence (error < 0.0001)

- [ ] **AUD-011** - Audio Fallback
  - Preconditions: Browser w/o WebAudio
  - Expected: App runs without errors. UI visual feedback still works. Console warns gracefully

- [ ] **AUD-012** - Tab Switching
  - Preconditions: Audio Playing
  - Expected: Audio continues or pauses (depending on browser policy, typically continues if context is running)

- [ ] **AUD-013** - Rapid Mute/Unmute
  - Preconditions: Audio Playing
  - Expected: No audio glitches/stacking of sounds. State remains consistent

- [ ] **AUD-014** - Audio Resource Loading
  - Preconditions: Init
  - Expected: Nature sound assets load successfully

- [ ] **AUD-015** - Synthetic Sound Generation
  - Preconditions: No Assets
  - Expected: Synthetic nature sounds generated if files missing

---

## 5. Animation & Visual Feedback Tests (VIS) - 10 tests

- [ ] **VIS-001** - Knob Smooth Transition
  - Preconditions: Step
  - Expected: Knob rotates smoothly to new position (CSS transition/animation), not instant jump

- [ ] **VIS-002** - Color Transition - Red to Amber
  - Preconditions: Error 1.5 -> 0.5
  - Expected: Station display bg changes from Red-tint to Amber-tint smoothly

- [ ] **VIS-003** - Color Transition - Amber to Green
  - Preconditions: Error 0.5 -> 0.05
  - Expected: Station display bg changes from Amber-tint to Green-tint smoothly

- [ ] **VIS-004** - Signal Meter Animation
  - Preconditions: Step
  - Expected: Bar width animates (grows/shrinks) smoothly

- [ ] **VIS-005** - Convergence Glow
  - Preconditions: Converged
  - Expected: Main convergence display emits green glow/pulse

- [ ] **VIS-006** - Power Light Pulse
  - Preconditions: Autoplay
  - Expected: Power indicator pulses rhythmically (not static on)

- [ ] **VIS-007** - Speaker Grille Animation
  - Preconditions: Autoplay
  - Expected: Speaker grille element scales/pulses slightly

- [ ] **VIS-008** - Numeric Display Stability
  - Preconditions: Rapid Updates
  - Expected: Numbers update without jittering layout (fixed width font/container)

- [ ] **VIS-009** - Tuning Dial Smoothness
  - Preconditions: Step
  - Expected: Dial pointer moves smoothly, not jumping

- [ ] **VIS-010** - Visual Hierarchy
  - Preconditions: Static
  - Expected: "Converged" state visually distinct and rewarding compared to "Not Converged"

---

## 6. Edge Cases & Error Handling (EDGE) - 8 tests

- [ ] **EDGE-001** - Divergence / Non-Convergence
  - Preconditions: Random Start
  - Expected: Autoplay stops. Alert/Message: "Not converging"

- [ ] **EDGE-002** - Rapid Reset
  - Preconditions: Autoplaying
  - Expected: Autoplay stops immediately. Values reset. No ghost iterations continue

- [ ] **EDGE-003** - Audio Init Delay
  - Preconditions: No Interaction
  - Expected: Audio Context is suspended. No sound. No errors in console

- [ ] **EDGE-004** - Extreme Speed Change
  - Preconditions: Autoplaying
  - Expected: Interval updates correctly. No "stacking" of intervals (super fast speed)

- [ ] **EDGE-005** - Knob Drag Out of View
  - Preconditions: Dragging
  - Expected: Drag continues or releases gracefully. Value doesn't get stuck

- [ ] **EDGE-006** - Zero Values
  - Preconditions: Manual
  - Expected: Valid state. Math works (Values update to 1.75, 2.625, 3.0)

- [ ] **EDGE-007** - Very Small Errors
  - Preconditions: Near Sol
  - Expected: Display handles small numbers (e.g., shows 0.00 or scientific notation if needed, but 0.00 preferred)

- [ ] **EDGE-008** - Network Failure
  - Preconditions: Reload
  - Expected: App loads. Audio might be silent or use fallback synth. No crash

---

## 7. Browser Compatibility Tests (COMP) - 5 tests

- [ ] **COMP-001** - Chrome / Chromium (Edge)
  - Preconditions: Latest Ver
  - Expected: All tests pass. Performance optimal

- [ ] **COMP-002** - Firefox
  - Preconditions: Latest Ver
  - Expected: All tests pass. Audio context handles specific Firefox policies

- [ ] **COMP-003** - Safari (macOS)
  - Preconditions: Latest Ver
  - Expected: Check Web Audio syntax (webkit prefix handled). UI rendering matches

- [ ] **COMP-004** - Mobile Safari (iOS)
  - Preconditions: iOS Device
  - Expected: Touch works. Audio starts only after tap. Layout responsive

- [ ] **COMP-005** - Android Chrome
  - Preconditions: Android Device
  - Expected: Touch works. Audio starts after tap. Layout responsive

---

## 8. Performance Tests (PERF) - 5 tests

- [ ] **PERF-001** - Frame Rate - Idle
  - Preconditions: Idle
  - Expected: Steady 60fps (or screen refresh rate)

- [ ] **PERF-002** - Frame Rate - Autoplay Fast
  - Preconditions: Max Speed
  - Expected: Maintain > 30fps (ideally 60fps). No visible stutter

- [ ] **PERF-003** - Memory Leak Check
  - Preconditions: Autoplay
  - Expected: Heap size remains stable. No monotonically increasing memory usage

- [ ] **PERF-004** - CPU Usage
  - Preconditions: Autoplay
  - Expected: CPU usage reasonable (< 20-30% of single core)

- [ ] **PERF-005** - Audio Latency
  - Preconditions: Unmuted
  - Expected: Sound corresponds immediately to visual update

---

## 9. Accessibility Tests (ACC) - 5 tests

- [ ] **ACC-001** - Keyboard Navigation
  - Preconditions: Tab
  - Expected: Focus ring visible on all interactive elements (buttons, sliders, knobs)

- [ ] **ACC-002** - Screen Reader - Knobs
  - Preconditions: VoiceOver/NVDA
  - Expected: Reads label ("x1") and current value

- [ ] **ACC-003** - Screen Reader - Status
  - Preconditions: VoiceOver/NVDA, Converged
  - Expected: Convergence status is announced or readable

- [ ] **ACC-004** - Color Contrast
  - Preconditions: Static
  - Expected: Contrast ratio > 4.5:1 for text

- [ ] **ACC-005** - No Audio Dependency
  - Preconditions: Muted
  - Expected: Visual feedback (meters, colors) sufficient to use app without hearing

---

## 10. Integration Tests (INTEG) - 4 tests

- [ ] **INTEG-001** - The "Happy Path"
  - Preconditions: Fresh Load
  - Steps: 1. Close Welcome. 2. Click Step 3 times. 3. Start Autoplay. 4. Wait for convergence
  - Expected: App guides user from initial state to solution smoothly. Audio transitions from static to nature. Success chime plays

- [ ] **INTEG-002** - Manual Tuning Challenge
  - Preconditions: Fresh Load
  - Steps: 1. Randomize. 2. Try to manually drag knobs to reduce error (watch meters). 3. Get close manually. 4. Use Step to finish
  - Expected: User can "gameify" the solution by manually adjusting based on feedback

- [ ] **INTEG-003** - Presentation Mode
  - Preconditions: Connected to Projector
  - Steps: 1. Mute Audio. 2. Use Max Speed. 3. Run iterations. 4. Reset
  - Expected: Visuals clear from distance. Fast speed works for demos

- [ ] **INTEG-004** - Persistent User Prefs
  - Preconditions: Fresh Load
  - Steps: 1. Check "Don't Show Again". 2. Set Volume 20%. 3. Reload
  - Expected: Welcome hidden. (Optional: Volume remembered? If implemented)

---

## Test Execution Notes

### Issues Found
(Add any issues discovered during testing here)

### Blocked Tests
(Note any tests that cannot be executed due to missing features or blockers)

### Test Environment
- Browser: _______________
- Version: _______________
- OS: _______________
- Date: _______________
- Tester: _______________

---

## Quick Reference

### Test Categories Summary
- **MATH**: 16 tests - Core mathematical correctness
- **UI**: 20 tests - User interface components
- **INT**: 10 tests - User interactions
- **AUD**: 15 tests - Audio system
- **VIS**: 10 tests - Visual feedback and animations
- **EDGE**: 8 tests - Edge cases and error handling
- **COMP**: 5 tests - Browser compatibility
- **PERF**: 5 tests - Performance metrics
- **ACC**: 5 tests - Accessibility
- **INTEG**: 4 tests - End-to-end scenarios

**Total: 98 test cases**

