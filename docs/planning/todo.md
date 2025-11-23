# Todo List – Jacobi Iteration Equalizer Simulator 🎛️

## Phase 1: Project Setup & Foundation
### 1.1 Project Structure
- [x] Create project directory structure
- [x] Create `index.html` with basic HTML5 structure
- [x] Create `styles.css` file
- [x] Create `main.js` file
- [x] Create `audio.js` file
- [x] Create `assets/` directory for audio files
- [x] Set up basic HTML layout containers (header, main panel, controls, footer)

### 1.2 Initial HTML Layout
- [x] Create header section with title "Jacobi Iteration Radio"
- [x] Create top-right audio controls area (mute button, volume slider placeholder)
- [x] Create main radio panel container
- [x] Create equation status display area
- [x] Create controls section at bottom
- [x] Add semantic HTML structure with proper IDs and classes

### 1.3 Basic CSS Foundation
- [x] Set up CSS reset/normalize
- [x] Define color palette variables (warm browns, cream, brass, vintage green, amber, red)
- [x] Set up typography (import Google Fonts: Playfair Display, Cinzel, or Bebas Neue)
- [x] Create base layout with Flexbox/Grid
- [x] Set background colors (neutral cream #F5F5F0)
- [x] Center content on desktop

---

## Phase 2: Core Math Engine
### 2.1 Jacobi Iteration Implementation
- [x] Implement `computeNextJacobi(x1, x2, x3)` function with formulas:
  - `x1' = (7 + x2 - x3) / 4`
  - `x2' = (21 + 4*x1 + x3) / 8`
  - `x3' = (15 + 2*x1 - x2) / 5`
- [x] Create state management for current values (x1, x2, x3)
- [x] Create iteration counter state
- [x] Implement equation error calculation:
  - Equation 1: LHS = 4*x1 - x2 + x3, RHS = 7, Error = LHS - RHS
  - Equation 2: LHS = 4*x1 - 8*x2 + x3, RHS = -21, Error = LHS - RHS
  - Equation 3: LHS = -2*x1 + x2 + 5*x3, RHS = 15, Error = LHS - RHS
- [x] Calculate overall error metric: `max(|error₁|, |error₂|, |error₃|)`
- [x] Implement convergence state logic:
  - "Not Converged": max error ≥ 1.0
  - "Converging": 0.1 ≤ max error < 1.0
  - "Nearly Converged": 0.0001 ≤ max error < 0.1
  - "Converged": max error < 0.0001

### 2.2 Value Clamping & Validation
- [x] Implement value clamping to range [-10, 10]
- [x] Add validation for edge cases (NaN, Infinity)
- [x] Create error handling for non-converging iterations (>1000 iterations)

---

## Phase 3: Knob Components
### 3.1 Knob HTML Structure
- [x] Create HTML structure for three knobs (x₁, x₂, x₃)
- [x] Add knob containers with proper IDs/classes
- [x] Add variable name labels (x₁, x₂, x₃)
- [x] Add value display areas for each knob

### 3.2 Knob CSS Styling
- [x] Style knobs as circular elements (60-80px diameter)
- [x] Add ridged edges (8-12 ridges using CSS gradients or SVG)
- [x] Create pointer indicator (brass/gold color, 2-3px wide)
- [x] Add vintage-style typography for labels
- [x] Style numeric value displays with period-appropriate font
- [x] Add hover effects (glow, shadow)
- [x] Add active state styling (scale, glow)
- [x] Create 3D depth effect with shadows and gradients

### 3.3 Knob Interaction Logic
- [x] Implement mouse drag interaction for knobs
- [x] Map drag distance/angle to value changes (270° rotation range)
- [x] Implement value-to-angle mapping (linear mapping)
- [x] Update knob rotation CSS transform based on value
- [x] Update displayed numeric value (2-3 decimal places)
- [x] Clamp values to [-10, 10] range during interaction
- [x] Add touch support for mobile devices
- [x] Implement smooth rotation animation
- [x] Optimize dragging with requestAnimationFrame for 60fps smoothness
- [x] Disable transitions during drag for immediate response
- [x] Only update displays when values actually change (performance optimization)
- [x] Add preventDefault on touch events to prevent scrolling interference

### 3.4 Knob Audio Feedback
- [x] Add click/tick sound on manual knob rotation
- [x] Integrate with audio system for knob sounds

---

## Phase 4: Radio Panel Styling
### 4.1 Main Radio Panel
- [x] Style main radio panel container (wood grain or Bakelite texture)
- [x] Add vintage radio front panel styling
- [x] Create bevel/emboss effect with CSS box-shadow
- [x] Add texture overlay (wood grain pattern or Bakelite texture)
- [x] Position knobs within panel

### 4.2 Speaker Grille
- [x] Create speaker grille visual element
- [x] Add textured pattern (CSS or SVG)
- [x] Add subtle depth effect
- [x] Implement pulse/glow animation for balanced state

### 4.3 Power Indicator
- [x] Create power indicator light (LED or vintage bulb)
- [x] Style as glowing element
- [x] Add pulse animation when autoplay is active
- [x] Connect to autoplay state

### 4.4 Tuning Dial (Optional)
- [x] Create large central tuning dial
- [x] Add analog-style markings
- [x] Add pointer indicator
- [x] Connect to overall convergence state
- [x] Animate pointer from "Static" to "Clear Signal"

---

## Phase 5: Equation Status Displays
### 5.1 Frequency Readouts
- [x] Create three "Station" displays (Station 1, Station 2, Station 3)
- [x] Style as vintage frequency readouts (e.g., "Station 1: 7.00 MHz ± 0.23")
- [x] Use period-appropriate numeric font (monospace or vintage style)
- [x] Display LHS, RHS, and Error values
- [x] Format numbers with appropriate decimal places

### 5.2 Color Coding
- [x] Implement color coding based on error thresholds:
  - Red: |error| ≥ 1.0
  - Amber: 0.1 ≤ |error| < 1.0
  - Green: |error| < 0.1
- [x] Add smooth color transitions (not instant changes)
- [x] Update colors dynamically as errors change

### 5.3 Signal Strength Meters
- [x] Create analog-style bar meters for each equation
- [x] Style as vintage radio signal strength indicators
- [x] Animate bar height based on error (inverse relationship)
- [x] Color-code meters: red → amber → green
- [x] Add smooth animations for bar changes

### 5.4 Convergence Display
- [x] Create overall convergence status display
- [x] Show current iteration number (k)
- [x] Display current values of x₁, x₂, x₃
- [x] Show overall error metric
- [x] Add "Balanced / Converged" message when solution reached
- [x] Add glowing green border effect when converged
- [x] Add "View Solution" button that appears when converged
- [x] Position button near iteration counter in convergence display
- [x] Style button to match convergence display aesthetic
- [x] Implement button visibility toggle based on convergence state

---

## Phase 6: Control Buttons & Sliders
### 6.1 Step Button
- [x] Create "Step" button with vintage styling
- [x] Style as raised/embossed radio button
- [x] Add hover and active states
- [x] Connect to single Jacobi iteration function
- [x] Add button click sound effect

### 6.2 Autoplay Toggle
- [x] Create play/pause toggle button
- [x] Style with vintage radio aesthetics
- [x] Implement play/pause state management
- [x] Connect to autoplay logic
- [x] Update power indicator when active
- [x] Add button click sound effect

### 6.3 Speed Slider
- [x] Create speed control slider/dial
- [x] Style like vintage radio dial
- [x] Map slider value (1-100) to delay (2000ms to 100ms)
- [x] Update autoplay speed immediately on change
- [x] Add visual indicator for current speed

### 6.4 Reset Button
- [x] Create reset button
- [x] Style with vintage aesthetics
- [x] Implement reset to default initial guess (1, 2, 2)
- [x] Reset iteration counter
- [x] Clear error messages
- [x] Animate knobs back to initial positions
- [x] Add button click sound effect

### 6.5 Random Initial Guess Button (Optional)
- [x] Create random initial guess button
- [x] Generate random values within [-10, 10] range
- [x] Update knobs to random values
- [x] Reset iteration counter

### 6.6 Station Presets
- [x] Create quick-start preset buttons (Station 1, Station 2, etc.)
- [x] Define preset initial guesses
- [x] Style as vintage radio preset buttons
- [x] Connect to set initial values

---

## Phase 7: Audio System
### 7.1 Web Audio API Setup
- [x] Initialize AudioContext
- [x] Create audio context management (create once, reuse)
- [x] Add browser compatibility checks
- [x] Implement fallback for browsers without Web Audio API

### 7.2 Noise Generation
- [x] Generate white/pink/brown noise using Web Audio API
- [x] Create noise source (OscillatorNode or AudioBuffer with random samples)
- [x] Implement dynamic noise generation
- [x] Connect to gain node for volume control

### 7.3 Nature Sounds
- [x] Source or create nature sound files (birds, water, wind)
- [x] Ensure sounds are loopable (10-30 seconds)
- [x] Convert to MP3/OGG formats for browser compatibility
- [x] Implement audio file loading
- [x] Create AudioBufferSourceNode for nature sounds
- [x] Implement seamless looping
- [x] Add loading indicator for audio files
- [x] Handle audio loading errors gracefully

### 7.4 Audio Crossfading
- [x] Implement error-to-audio mix ratio calculation
- [x] Use logarithmic or linear mapping for smooth transitions
- [x] Create gain nodes for noise and nature sounds
- [x] Implement smooth crossfading (100-200ms transitions)
- [x] Update audio mix based on overall error metric
- [x] Use requestAnimationFrame for smooth audio updates
- [x] Prevent audio glitches/pops during transitions

### 7.5 Audio Controls
- [x] Create mute/unmute button (top-right corner)
- [x] Style mute button with speaker icon (with slash when muted)
- [x] Implement mute state management
- [x] Add visual indicator when muted
- [x] Create volume slider (horizontal slider design, integrated into radio body)
- [x] Style volume slider with vintage radio aesthetics (brass thumb, gradient fill, OFF/MAX labels)
- [x] Implement volume control (0-100%)
- [x] Add smooth volume ramping when muting/unmuting
- [x] Connect volume slider to master gain node
- [x] Optimize volume slider with requestAnimationFrame for smooth dragging
- [x] Implement automatic unmute when volume > 0
- [x] Add audio context resume handling (browser autoplay policy)
- [x] Disable transitions during drag for immediate visual feedback

### 7.6 Audio Feedback Sounds
- [x] Create knob rotation click/tick sound
- [x] Create button click sounds
- [x] Create convergence chime sound
- [x] Integrate sounds with UI interactions
- [x] Ensure sounds are responsive and not laggy

### 7.7 Audio Performance Optimization
- [x] Optimize audio buffer sizes (4096 samples)
- [x] Ensure audio processing doesn't block main thread
- [x] Test for frame drops or lag
- [x] Optimize memory usage for audio buffers
- [x] Implement audio context resume handling (browser autoplay policy)
- [x] Add automatic unmute when volume slider moved above 0
- [x] Handle suspended audio context gracefully
- [ ] Test on multiple browsers

---

## Phase 8: Animation System
### 8.1 Knob Animations
- [x] Implement smooth knob rotation during Jacobi iteration
- [x] Use CSS transitions or requestAnimationFrame
- [x] Animate from old value to new value smoothly
- [x] Ensure animations don't lag or freeze

### 8.2 Display Animations
- [x] Animate frequency readout value changes smoothly
- [x] Animate signal strength meter bars smoothly
- [x] Animate color transitions (red → amber → green)
- [x] Add smooth updates to all numeric displays

### 8.3 Autoplay Animations
- [x] Implement power indicator pulse animation
- [x] Sync speaker grille pulse with convergence
- [x] Ensure animations run smoothly during autoplay

### 8.4 Audio Animations
- [x] Ensure smooth audio crossfading
- [x] Prevent audio glitches during transitions
- [x] Smooth volume ramping

---

## Phase 9: Autoplay & Iteration Control
### 9.1 Autoplay Logic
- [x] Implement autoplay state management (`isAutoPlaying`)
- [x] Create autoplay loop using setInterval or requestAnimationFrame
- [x] Connect to speed slider for dynamic delay
- [x] Implement pause/resume functionality
- [x] Auto-pause when converged (max error < 0.0001)
- [x] Auto-pause after 1000 iterations without convergence
- [x] Show convergence chime when solution reached
- [x] Display "Not converging" message if needed

### 9.2 Single Step Iteration
- [x] Implement single iteration function
- [x] Read current knob values
- [x] Compute new values using Jacobi formulas
- [x] Animate knobs to new values
- [x] Recompute equation errors
- [x] Update all displays
- [x] Increment iteration counter
- [x] Update audio mix based on new error

---

## Phase 10: User Onboarding & Help
### 10.1 Welcome Modal
- [x] Create welcome modal/overlay for first-time users
- [x] Add welcome message with radio metaphor
- [x] Include instructions for knobs, step button, autoplay
- [x] Add audio explanation
- [x] Implement "Don't show again" option
- [x] Store preference in localStorage
- [x] Style modal with vintage aesthetics

### 10.2 Tooltips
- [x] Create tooltip system
- [x] Add tooltips for knobs (explain what they do)
- [x] Add tooltips for buttons (step, autoplay, reset)
- [x] Add tooltips for displays (frequency readouts, meters)
- [x] Show tooltips on first interaction or hover
- [x] Style tooltips with vintage aesthetics

### 10.3 Help Panel
- [x] Create collapsible help section
- [x] Add radio metaphor explanation
- [x] Explain what sounds represent
- [x] Explain how to interpret frequency displays
- [x] List keyboard shortcuts
- [x] Style help panel with vintage aesthetics

### 10.4 Keyboard Shortcuts
- [x] Implement Enter/Space for Step button
- [x] Implement P key for Play/Pause
- [x] Implement M key for Mute
- [x] Add keyboard shortcut indicators in help panel

### 10.5 Solution Explanation Lightbox
- [x] Create solution explanation modal/lightbox
- [x] Add "View Solution" button in convergence display
- [x] Implement button visibility based on convergence state (max error < 0.0001)
- [x] Style solution button with fade-in animation
- [x] Create modal HTML structure with solution sections
- [x] Implement solution value display (x₁, x₂, x₃)
- [x] Implement equation verification calculations
- [x] Display convergence details (iterations, max error)
- [x] Add educational content about Jacobi iteration
- [x] Style modal to match overall design (vintage/modern themes)
- [x] Implement modal open/close functionality
- [x] Add close button (×) and "Close" button
- [x] Enable closing by clicking outside modal
- [x] Update modal content dynamically with current solution values
- [x] Add smooth modal transitions
- [x] **Enhanced:** Rewrite all explanations in plain English with radio metaphor analogies
- [x] **Enhanced:** Add "How Each Station Turned Out" section with plain English descriptions for each equation
- [x] **Enhanced:** Include radio tuning analogies throughout (e.g., "Like tuning to 7.00 MHz on the dial")
- [x] **Enhanced:** Make modal scrollable with max-height: 90vh and custom scrollbar styling
- [x] **Enhanced:** Improve structure with clear sections: "The Perfect Settings", "How Each Station Turned Out", "The Tuning Process", "What Just Happened"

---

## Phase 11: Polish & Refinement
### 11.1 Typography Refinement
- [x] Ensure all text uses period-appropriate fonts
- [x] Verify label styling (uppercase, condensed)
- [x] Check numeric display fonts
- [x] Ensure readability and contrast (WCAG AA)

### 11.2 Color & Visual Refinement
- [x] Verify color palette usage throughout
- [x] Check color contrast for accessibility
- [x] Refine texture overlays
- [x] Polish 3D effects and shadows
- [x] Ensure consistent vintage aesthetic

### 11.3 Responsive Design
- [x] Test layout on desktop (primary)
- [x] Adapt layout for tablet
- [x] Basic mobile support (if needed)
- [x] Ensure controls remain usable on smaller screens

### 11.4 Performance Optimization
- [x] Test animation performance
- [x] Optimize CSS for smooth animations
- [x] Ensure no frame drops
- [x] Test audio performance
- [x] Optimize JavaScript execution
- [x] Implement requestAnimationFrame for knob and volume slider dragging
- [x] Disable CSS transitions during active dragging for immediate response
- [x] Optimize display updates to only occur when values change
- [x] Add will-change CSS properties for better browser optimization

### 11.5 Accessibility
- [x] Verify text contrast (WCAG AA)
- [x] Ensure buttons have clear labels
- [x] Test keyboard navigation
- [x] Verify audio controls are accessible
- [x] Ensure visual feedback is sufficient without audio

---

## Phase 12: Testing & Edge Cases
### 12.1 Edge Case Handling
- [x] Test value clamping when out of range
- [x] Display "Values out of range — clamped" message if needed
- [x] Test non-converging iterations (>1000)
- [x] Show "Not converging" message
- [x] Test reset functionality thoroughly
- [x] Test with extreme initial values

### 12.2 Browser Compatibility
- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test Web Audio API fallbacks
- [ ] Verify CSS compatibility

### 12.3 Audio Testing
- [ ] Test audio loading and fallbacks
- [ ] Test crossfading smoothness
- [ ] Test mute/unmute functionality
- [ ] Test volume control
- [ ] Test on different audio systems
- [ ] Verify no audio glitches

### 12.4 User Experience Testing
- [ ] Test knob interaction responsiveness
- [ ] Test autoplay smoothness
- [ ] Test step-by-step iteration
- [ ] Verify all controls work as expected
- [ ] Test help and onboarding flow

---

## Phase 13: Final Polish
### 13.1 Code Organization
- [x] Organize JavaScript into logical sections
- [x] Add code comments where helpful
- [x] Ensure clean, maintainable code structure
- [x] Verify file organization

### 13.2 Documentation
- [x] Add inline code comments
- [x] Document key functions
- [x] Note any browser-specific considerations

### 13.3 Final Visual Pass
- [x] Review all UI elements for consistency
- [x] Verify vintage radio aesthetic throughout
- [x] Check spacing and alignment
- [x] Ensure polished, professional appearance

### 13.4 Final Testing
- [x] Complete end-to-end testing
- [x] Test all features together
- [x] Verify no regressions
- [x] Test with different initial values
- [x] Verify convergence works correctly
- [x] Test volume slider smoothness and responsiveness
- [x] Test knob dragging smoothness
- [x] Verify audio context resume functionality
- [x] Test theme switching (if implemented)

---

## Phase 14: Radio Redesign - Single Glance Layout
### 14.1 Layout Redesign
- [x] Redesign HTML structure for horizontal layout
- [x] Move equation displays to left side of main panel
- [x] Create realistic radio body in center/right with integrated controls
- [x] Integrate volume control into radio body (not separate header control)
- [x] Ensure all elements visible in single glance

### 14.2 Radio Body Design
- [x] Create realistic vintage radio body (wood/Bakelite styling)
- [x] Integrate three tuning knobs (x₁, x₂, x₃) into radio face
- [x] Add volume slider to radio body (horizontal slider design)
- [x] Position speaker grille on radio
- [x] Add power indicator to radio
- [x] Position tuning dial on radio
- [x] Ensure radio looks like authentic vintage unit

### 14.3 CSS Updates
- [x] Update main panel to horizontal flex layout
- [x] Style left side for equation displays
- [x] Style radio body with realistic 3D appearance
- [x] Ensure responsive design maintains single-glance visibility
- [x] Test on different screen sizes
- [x] Style volume slider with vintage aesthetics (brass thumb, gradient fill)

### 14.4 Testing
- [x] Verify all functionality works with new layout
- [x] Test knob interactions on radio
- [x] Test volume control on radio
- [x] Verify equation displays update correctly
- [x] Ensure single-glance visibility requirement met

---

## Phase 15: Theme Switching & Modern UI
### 15.1 Theme Toggle Implementation
- [x] Create theme toggle button in header
- [x] Implement theme switching logic in JavaScript
- [x] Add localStorage persistence for theme preference
- [x] Ensure smooth transitions between themes
- [x] Update all UI elements to support both themes

### 15.2 Modern Radio UI Design
- [x] Design modern radio UI with dark theme and blue accents
- [x] Create CSS variables for modern theme colors
- [x] Style radio body for modern theme (dark gradients, subtle glows)
- [x] Update knobs for modern theme (dark styling with blue highlights)
- [x] Style speaker grille for modern theme (hexagonal pattern)
- [x] Update power indicator for modern theme (blue glow)
- [x] Style tuning dial for modern theme
- [x] Update volume slider for modern theme
- [x] Style all buttons and controls for modern theme
- [x] Update equation panels for modern theme
- [x] Style convergence display for modern theme

### 15.3 Modern UI Cleanup & Refinement
- [x] Consolidate modern theme color variables
- [x] Simplify and clean up modern radio body styling
- [x] Refine modern theme typography (system fonts, consistent styling)
- [x] Clean up modern theme effects and glows (reduce excessive effects)
- [x] Ensure consistent modern theme styling across all elements
- [x] Fix text color mismatches in iteration and convergence displays
- [x] Add modern theme styles for speed control and preset buttons
- [x] Ensure proper contrast and readability in modern theme

### 15.4 Theme Consistency
- [x] Verify all functionality works in both themes
- [x] Ensure smooth theme transitions
- [x] Test theme persistence across page reloads
- [x] Verify accessibility in both themes

### 15.5 Volume Slider Redesign
- [x] Replace volume knob with horizontal slider design
- [x] Add slider track with color-coded fill (green → amber → red)
- [x] Implement smooth slider dragging with requestAnimationFrame
- [x] Add OFF/MAX labels to slider
- [x] Implement click-to-mute functionality (when no drag detected)
- [x] Style slider to match radio aesthetic (both themes)
- [x] Add modern theme styling for volume slider
- [x] Optimize volume slider performance

### 15.6 Performance Optimizations
- [x] Optimize knob dragging with requestAnimationFrame
- [x] Reduce unnecessary display updates during drag
- [x] Disable transitions during dragging for immediate response
- [x] Optimize volume slider dragging performance
- [x] Improve audio context resume handling
- [x] Add smooth animations with proper transition management
- [x] Handle audio context suspended state gracefully

---

## Phase 16: Radio to Equalizer Analogy Redesign
### 16.1 Text & Terminology Updates
- [x] Update help panel text to use equalizer analogy instead of radio analogy
- [x] Update welcome modal text to explain equalizer metaphor
- [x] Rewrite solution modal explanations to use equalizer analogy
- [x] Update tooltips to emphasize knob interdependence
- [x] Replace "Station" terminology with "Condition" or "Requirement"
- [x] Update PRD sections to reflect new analogy

### 16.2 HTML Structure Updates
- [x] Rename station-related IDs and classes (station1 → condition1, etc.)
- [x] Update HTML structure for equalizer-style displays
- [x] Update references in help and modals to match new structure

### 16.3 Visual Design Updates
- [x] Rename .station-* CSS classes to .condition-*
- [x] Update CSS styling to create equalizer bar visual design
- [x] Create unified output quality meter styling
- [x] Update visual styling to match equalizer aesthetic

### 16.4 JavaScript Logic Updates
- [x] Update element references in JS (station* → condition*)
- [x] Update display functions to handle equalizer metaphor
- [x] Update solution verification logic for new terminology
- [x] Test all functionality with new structure

---

## Phase 17: Startup System Selection
### 17.1 Startup Modal
- [x] Create modal for initial system selection
- [x] Add "Use Default System" option
- [x] Add "Configure Custom System" option
- [x] Add "Learn More" expandable details for each option
- [x] Implement choice persistence in localStorage
- [x] Style modal with vintage aesthetics

### 17.2 Initialization Logic
- [x] Update init() to check for saved preference
- [x] Implement initializeDefaultSystem()
- [x] Implement initializeCustomSystem()
- [x] Handle first-time user flow correctly

---

## Phase 18: Dynamic Equation System Architecture
### 18.1 State Migration
- [x] Migrate from x1/x2/x3 to array-based x[n] state
- [x] Implement coefficient matrix A (n×n)
- [x] Implement constant vector b (n)
- [x] Update all state references to use arrays

### 18.2 Math Engine Updates
- [x] Update computeNextJacobi to handle n×n systems
- [x] Implement dynamic Jacobi formula generation
- [x] Update calculateErrors to iterate n times
- [x] Update convergence checks for dynamic n

---

## Phase 19: Rich Visual Matrix & Equation Editor
### 19.1 Matrix Grid Editor
- [x] Create n×n grid input interface
- [x] Create b-vector column input
- [x] Implement dynamic grid generation based on n
- [x] Add real-time state updates from grid inputs

### 19.2 Text Parser
- [x] Implement parser for equation text (e.g. "4x1 - x2 = 7")
- [x] Handle variable extraction and coefficient parsing
- [x] Validate input format and system size
- [x] Update system state from parsed text

---

## Phase 20: Configuration Modal
### 20.1 Modal Structure
- [x] Create configuration modal container
- [x] Implement tabbed interface (Matrix, Text, Settings)
- [x] Add system size selector (n)
- [x] Add display settings inputs (visible knobs/bands)

### 20.2 Integration
- [x] Connect "Config" button to open modal
- [x] Implement "Apply" logic to update main system
- [x] Validate diagonal dominance before applying
- [x] Persist custom configuration to localStorage

---

## Phase 21: Hidden Knobs & Bands (HK) Display
### 21.1 Dynamic Rendering
- [x] Update renderKnobs to show first m knobs
- [x] Update renderBands to show first m bands
- [x] Handle cases where n > m

### 21.2 HK Indicators
- [x] Create "HK" indicator for hidden knobs
- [x] Create "HK" indicator for hidden bands
- [x] Implement tooltips to show summaries of hidden elements
- [x] Update summaries dynamically during iteration
