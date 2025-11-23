# Feature Todo: Equation Visualizer

**Feature Document:** `feature-equation-visualizer.md`  
**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** In Progress

---

## Implementation Phases

### Phase 1: Create Core Visualizer Module

#### 1.1 Create Module File
- [ ] Create `src/ui/equationVisualizer.js`
- [ ] Add module exports structure
- [ ] Add JSDoc comments for all functions

#### 1.2 History Management Functions
- [ ] Implement `addIterationSnapshot(equationHistory, iteration, x)`
  - [ ] Deep copy x array
  - [ ] Create snapshot object with iteration and x
  - [ ] Add to history array
  - [ ] Enforce 50-iteration limit (remove oldest if exceeded)
- [ ] Implement `clearEquationHistory(equationHistory)`
  - [ ] Clear array while maintaining reference
  - [ ] Reset to empty array

#### 1.3 LaTeX Generation Functions
- [ ] Implement `generateOriginalEquations(A, b, x, n)`
  - [ ] For each equation i (0 to n-1):
    - [ ] Calculate LHS: `Σ A[i][j] * x[j]`
    - [ ] Build LaTeX string: `a₁x₁ + a₂x₂ + ... = b`
    - [ ] Build evaluation string: `LHS = {computed} = {target}`
  - [ ] Return array of LaTeX strings
- [ ] Implement `generateJacobiFormulasWithValues(A, b, x, n)`
  - [ ] For each variable i (0 to n-1):
    - [ ] Calculate sum of off-diagonal terms
    - [ ] Calculate new value: `(b[i] - sum) / A[i][i]`
    - [ ] Build LaTeX formula structure
    - [ ] Build numeric substitution string
  - [ ] Return array of LaTeX strings

#### 1.4 Rendering Functions
- [ ] Implement `initEquationVisualizer(container)`
  - [ ] Validate container element
  - [ ] Create header element if needed
  - [ ] Create content element if needed
  - [ ] Return container reference
- [ ] Implement `updateEquationVisualizer(equationHistory, A, b, n)`
  - [ ] Clear content area
  - [ ] Handle empty history case
  - [ ] Iterate through history (newest first)
  - [ ] For each iteration:
    - [ ] Create iteration section
    - [ ] Add iteration header
    - [ ] Generate and render original equations
    - [ ] Generate and render Jacobi formulas
    - [ ] Add proper spacing
  - [ ] Use KaTeX `renderLaTeXWithKaTeX()` with `displayMode: true`

---

### Phase 2: Add HTML Structure

#### 2.1 Container Element
- [ ] Locate signal clarity display in `index.html` (around line 148)
- [ ] Add equation visualizer container after signal clarity display
- [ ] Structure:
  ```html
  <div class="equation-visualizer" id="equationVisualizer">
      <div class="equation-visualizer-header">Equation History</div>
      <div class="equation-visualizer-content" id="equationVisualizerContent"></div>
  </div>
  ```
- [ ] Add appropriate IDs for JavaScript access

---

### Phase 3: Integrate with State and Iteration Flow

#### 3.1 State Object Updates
- [ ] Add `equationHistory: []` to state object in `main.js` (around line 60)
- [ ] Ensure it's initialized as empty array

#### 3.2 Iteration Capture
- [ ] Locate `performIteration()` function (around line 819)
- [ ] Add snapshot capture after `state.iteration++` (around line 836)
- [ ] Before `updateDisplays()` call:
  - [ ] Call `addIterationSnapshot(state.equationHistory, state.iteration, [...state.x])`
  - [ ] Use spread operator for deep copy

#### 3.3 Display Updates
- [ ] Locate `updateDisplays()` function (around line 347)
- [ ] Add visualizer update at end of function (after line 443)
- [ ] Call: `updateEquationVisualizer(state.equationHistory, state.A, state.b, state.n)`

#### 3.4 Reset Integration
- [ ] Locate `reset()` function (around line 978)
- [ ] Add history clear after `state.iteration = 0` (after line 998)
- [ ] Call: `clearEquationHistory(state.equationHistory)`

#### 3.5 Configuration Change Integration
- [ ] Locate `applySystemConfiguration()` function (around line 2308)
- [ ] Add history clear after `state.iteration = 0` (after line 2350)
- [ ] Call: `clearEquationHistory(state.equationHistory)`

#### 3.6 Module Import and Initialization
- [ ] Add import statement at top of `main.js`:
  ```javascript
  import { initEquationVisualizer, updateEquationVisualizer, addIterationSnapshot, clearEquationHistory } from './src/ui/equationVisualizer.js';
  ```
- [ ] Initialize visualizer in DOM ready/initialization code
  - [ ] Get container element: `elements.equationVisualizer = document.getElementById('equationVisualizer')`
  - [ ] Call: `initEquationVisualizer(elements.equationVisualizer)`

---

### Phase 4: Enhance Formatting and Jacobi Functions

#### 4.1 Formatting Helpers
- [ ] Review `src/utils/formatting.js`
- [ ] Enhance `equationToLaTeX()` or create new helper:
  - [ ] `equationToLaTeXWithEvaluation(coefficients, constant, x, computedLHS)`
  - [ ] Returns LaTeX string with evaluation line
- [ ] Test LaTeX generation for various equation sizes

#### 4.2 Jacobi Formula Generation
- [ ] Review `src/core/jacobi.js`
- [ ] Enhance `generateJacobiFormulas()` or create:
  - [ ] `generateJacobiFormulasWithValues(A, b, x)`
  - [ ] Include actual numeric substitutions
  - [ ] Include computed result
  - [ ] Return LaTeX strings ready for KaTeX rendering
- [ ] Test formula generation for various system sizes

---

### Phase 5: Styling

#### 5.1 Container Styles
- [ ] Add `.equation-visualizer` styles
  - [ ] `max-height: 300px`
  - [ ] `overflow-y: auto`
  - [ ] Appropriate padding and margins
  - [ ] Border or background to distinguish from other elements
- [ ] Add `.equation-visualizer-header` styles
  - [ ] Font size and weight
  - [ ] Padding and margins
  - [ ] Border-bottom for separation

#### 5.2 Content Area Styles
- [ ] Add `.equation-visualizer-content` styles
  - [ ] Padding for content
  - [ ] Proper spacing between iterations

#### 5.3 Iteration Section Styles
- [ ] Add `.iteration-section` styles
  - [ ] Margin-bottom for spacing between iterations
  - [ ] Border or background for visual separation
  - [ ] Padding for content
- [ ] Add `.iteration-header` styles
  - [ ] Font styling
  - [ ] Color and weight

#### 5.4 Equation Group Styles
- [ ] Add `.equation-group` styles
  - [ ] Margin for spacing
  - [ ] Indentation or visual hierarchy
- [ ] Add `.equation-group-label` styles
  - [ ] Font styling for "Original Equations" and "Jacobi Update Formulas"
  - [ ] Color and weight
- [ ] Add styles for KaTeX-rendered equations
  - [ ] Proper spacing
  - [ ] Readable font size

#### 5.5 Theme Support
- [ ] Test styles with vintage theme
- [ ] Test styles with modern theme
- [ ] Ensure colors work in both themes
- [ ] Use CSS variables where appropriate
- [ ] Adjust scrollbar styling to match theme

#### 5.6 Responsive Design
- [ ] Ensure container works on different screen sizes
- [ ] Test scrolling behavior on mobile
- [ ] Adjust max-height if needed for smaller screens

---

### Phase 6: Testing and Refinement

#### 6.1 Unit Testing
- [ ] **Test Case 1:** History Management - Add Snapshot
  - [ ] Verify snapshot is added correctly
  - [ ] Verify deep copy of x array (not reference)
  - [ ] Test with empty x array
  - [ ] Test with all-zero x values
- [ ] **Test Case 2:** History Management - Limit Enforcement
  - [ ] Verify 50-iteration limit is enforced
  - [ ] Verify oldest entry removed when limit exceeded
  - [ ] Test rapid snapshot additions
- [ ] **Test Case 3:** History Management - Clear History
  - [ ] Verify history clears correctly
  - [ ] Verify array reference maintained
- [ ] **Test Case 4:** LaTeX Generation - Original Equations
  - [ ] Test with standard 3x3 system
  - [ ] Test with zero coefficients
  - [ ] Test with negative coefficients
  - [ ] Test with large coefficients
  - [ ] Test with decimal coefficients
- [ ] **Test Case 5:** LaTeX Generation - Jacobi Formulas
  - [ ] Test with standard 3x3 system
  - [ ] Test with zero diagonal elements (edge case)
  - [ ] Test with single term in sum
  - [ ] Test with all off-diagonal terms zero
- [ ] **Test Case 6:** LaTeX Generation - Edge Cases
  - [ ] Test single equation system (n=1)
  - [ ] Test large system (n=10)
  - [ ] Test very small values
  - [ ] Test very large values
- [ ] **Test Case 7:** Rendering - Empty History
  - [ ] Verify empty state handled gracefully
  - [ ] Verify no errors thrown
- [ ] **Test Case 8:** Rendering - Single Iteration
  - [ ] Verify single iteration renders correctly
  - [ ] Verify all equations and formulas displayed
  - [ ] Verify KaTeX rendering works
- [ ] **Test Case 9:** Rendering - Multiple Iterations
  - [ ] Verify reverse chronological order (newest first)
  - [ ] Verify proper spacing between iterations
- [ ] **Test Case 10:** Rendering - Maximum Iterations
  - [ ] Test with 50 iterations
  - [ ] Verify scrollable container
  - [ ] Verify performance is acceptable

#### 6.2 Integration Testing
- [ ] **Test Case 11:** Integration - Manual Iteration Step
  - [ ] Test iteration capture on manual step
  - [ ] Verify history updates correctly
  - [ ] Verify visualizer updates immediately
- [ ] **Test Case 12:** Integration - Autoplay Iterations
  - [ ] Test iteration capture during autoplay
  - [ ] Verify all iterations captured
  - [ ] Verify smooth updates (or at least correct)
- [ ] **Test Case 13:** Integration - System Reset
  - [ ] Test history clear on reset
  - [ ] Verify visualizer shows empty state
- [ ] **Test Case 14:** Integration - Configuration Change
  - [ ] Test history clear on configuration change
  - [ ] Verify new iterations start from clean state
- [ ] **Test Case 15:** Integration - Theme Switching
  - [ ] Test with vintage theme
  - [ ] Test with modern theme
  - [ ] Verify styling adapts correctly

#### 6.3 Mathematical Accuracy Testing
- [ ] **Test Case 16:** Mathematical Accuracy - LHS Calculation
  - [ ] Verify LHS calculations are correct
  - [ ] Test with known solutions
  - [ ] Test with convergence values
  - [ ] Test various coefficient combinations
- [ ] **Test Case 17:** Mathematical Accuracy - Jacobi Formula Calculation
  - [ ] Verify Jacobi formula calculations are correct
  - [ ] Test with standard system
  - [ ] Verify all formulas compute correctly
- [ ] **Test Case 18:** Mathematical Accuracy - Precision Handling
  - [ ] Test with repeating decimals
  - [ ] Test with very small differences
  - [ ] Verify consistent precision formatting

#### 6.4 Functional Testing
- [ ] Test iteration capture on manual step
- [ ] Test iteration capture on autoplay
- [ ] Test history limit (verify oldest removed after 50 iterations)
- [ ] Test history clear on reset
- [ ] Test history clear on configuration change
- [ ] Test empty state (no iterations yet)
- [ ] Test with different system sizes (n=3, n=5, etc.)

#### 6.5 Rendering Testing
- [ ] Verify original equations render correctly
- [ ] Verify Jacobi formulas render correctly
- [ ] Verify LHS evaluations are accurate
- [ ] Verify numeric substitutions are correct
- [ ] Test with various coefficient values (positive, negative, zero)
- [ ] Test with large coefficient values
- [ ] Test with decimal values

#### 6.6 UI/UX Testing
- [ ] **Test Case 19:** UI - Container Positioning
  - [ ] Verify container appears in correct location
  - [ ] Verify no overlap with other elements
- [ ] **Test Case 20:** UI - Scrolling Behavior
  - [ ] Verify scrollbar appears when content exceeds 300px
  - [ ] Verify smooth scrolling
  - [ ] Verify scroll position maintained during updates
- [ ] **Test Case 21:** UI - KaTeX Rendering
  - [ ] Verify all equations render without errors
  - [ ] Verify display mode is used
  - [ ] Check browser console for errors
- [ ] **Test Case 22:** UI - Responsive Design
  - [ ] Test on desktop (1920x1080)
  - [ ] Test on tablet (768x1024)
  - [ ] Test on mobile (375x667)
- [ ] Verify iteration headers are clear
- [ ] Verify equation groups are visually distinct
- [ ] Verify spacing is appropriate
- [ ] Test theme switching (if applicable)
- [ ] Verify visual consistency with rest of app

#### 6.7 Performance Testing
- [ ] **Test Case 23:** Performance - Maximum Iterations Rendering
  - [ ] Test with 50 iterations (maximum)
  - [ ] Measure rendering time (< 2 seconds)
  - [ ] Monitor memory usage (< 50MB increase)
- [ ] **Test Case 24:** Performance - Rapid Updates
  - [ ] Test rapid autoplay iterations
  - [ ] Verify no lag or dropped iterations
  - [ ] Verify browser remains responsive
- [ ] **Test Case 25:** Performance - Large Systems
  - [ ] Test with large systems (n > 5, e.g., n=10)
  - [ ] Verify acceptable performance
  - [ ] Compare with smaller systems
- [ ] Verify rendering performance is acceptable
- [ ] Monitor memory usage

#### 6.8 Browser Testing
- [ ] **Test Case 26:** Browser - Chrome/Edge
  - [ ] Verify all features work
  - [ ] Verify KaTeX renders correctly
  - [ ] Check for console errors
- [ ] **Test Case 27:** Browser - Firefox
  - [ ] Verify all features work
  - [ ] Verify KaTeX renders correctly
  - [ ] Check for console errors
- [ ] **Test Case 28:** Browser - Safari
  - [ ] Verify all features work
  - [ ] Verify KaTeX renders correctly
  - [ ] Check for console errors
- [ ] **Test Case 29:** Browser - Mobile Browsers
  - [ ] Test on iOS Safari
  - [ ] Test on Chrome Mobile
  - [ ] Verify touch scrolling works
  - [ ] Verify responsive layout

#### 6.9 Error Handling Testing
- [ ] **Test Case 30:** Error Handling - Invalid Input
  - [ ] Test with null/undefined A, b, x
  - [ ] Test with n = 0 or negative
  - [ ] Test with null equationHistory
  - [ ] Verify graceful error handling
- [ ] **Test Case 31:** Error Handling - KaTeX Rendering Errors
  - [ ] Test with invalid LaTeX (if possible)
  - [ ] Verify throwOnError: false is used
  - [ ] Verify fallback behavior
- [ ] **Test Case 32:** Error Handling - Missing DOM Elements
  - [ ] Test initEquationVisualizer(null)
  - [ ] Test updateEquationVisualizer() with missing container
  - [ ] Verify graceful error handling

---

## Testing Checklist

### Visual Testing
- [ ] Visualizer container appears below signal clarity display
- [ ] Container has max-height 300px and scrolls correctly
- [ ] Header "Equation History" displays correctly
- [ ] Iteration sections display with proper spacing
- [ ] Original equations render with KaTeX
- [ ] Jacobi formulas render with KaTeX
- [ ] LHS evaluations display correctly
- [ ] Numeric substitutions display correctly
- [ ] Styling matches app theme
- [ ] Scrollbar appears when content exceeds 300px

### Functional Testing
- [ ] Iterations are captured correctly
- [ ] History maintains last 50 iterations
- [ ] Oldest iteration removed when limit exceeded
- [ ] History clears on reset
- [ ] History clears on configuration change
- [ ] Empty state handled gracefully
- [ ] Equations update correctly on each iteration

### Mathematical Accuracy Testing
- [ ] LHS calculations are correct
- [ ] Jacobi formula calculations are correct
- [ ] Numeric substitutions are accurate
- [ ] Formula structures are mathematically correct
- [ ] Handles edge cases (zero coefficients, etc.)

---

## Notes

- History limit of 50 iterations balances visibility with performance
- KaTeX rendering uses `displayMode: true` for proper mathematical notation
- Deep copying x arrays prevents reference issues
- History cleared on system changes to avoid confusion
- Container scrolls to show newest iterations (or user can scroll manually)
- All LaTeX generation should handle edge cases (zero coefficients, etc.)

---

## Completed Tasks Summary

- [x] Phase 1: Core module created
- [x] Phase 2: HTML structure added
- [x] Phase 3: State integration complete
- [x] Phase 4: Formatting enhancements done
- [x] Phase 5: Styling complete
- [x] Phase 6: Testing complete

Feature implementation complete!

