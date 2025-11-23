# Feature: Equation Visualizer

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** In Progress  
**Priority:** Medium

---

## Problem Statement

During Jacobi iteration, users may want to see how the equations evolve with each iteration. Currently, there's no way to visualize the progression of equations as coefficients (x values) change through iterations. Users cannot see:
- How the original system equations (A·x = b) evaluate with current x values
- The Jacobi update formulas with actual numeric substitutions
- The historical progression of iterations

This makes it difficult to understand the mathematical process and track convergence visually.

---

## Goal

Add a scrollable equation visualizer component that displays:
- Original system equations (A·x = b) with current x values substituted, showing LHS evaluation
- Jacobi update formulas with actual numeric substitutions and computed results
- Iteration-by-iteration history (last 50 iterations)
- KaTeX-rendered mathematical notation for clarity
- Scrollable container (max-height 300px) to accommodate long iteration histories

---

## Scope

### In Scope

1. **Equation Visualizer Container**
   - Placed below the signal clarity display in the equation panel
   - Scrollable area with max-height 300px
   - Header showing "Equation History"
   - Content area for iteration displays

2. **Iteration Display**
   - Each iteration shows:
     - Iteration number header (e.g., "Iteration 0", "Iteration 1")
     - Original equations group with substituted values
     - Jacobi update formulas group with numeric evaluations
   - All equations rendered using KaTeX with display mode

3. **Original Equations Display**
   - Show: `a₁x₁ + a₂x₂ + ... = b` (with actual coefficient values)
   - Show evaluation: `LHS = {computed_value} = {target_value}`
   - Display all n equations for the system

4. **Jacobi Formulas Display**
   - Show formula structure: `x_{i+1}^{(k+1)} = (b_{i+1} - Σ_{j≠i} a_{i+1,j} x_j^{(k)}) / a_{i+1,i+1}`
   - Show numeric substitution: `x_{i+1} = (b_i - sum) / a_ii = {computed_value}`
   - Display all n update formulas

5. **History Management**
   - Maintain history of last 50 iterations
   - Automatically remove oldest entries when limit exceeded
   - Clear history on system reset or configuration change

6. **Integration Points**
   - Capture iteration snapshots in `performIteration()`
   - Update visualizer in `updateDisplays()`
   - Clear history in `reset()` and `applySystemConfiguration()`

### Out of Scope

- Exporting equation history
- Filtering or searching iterations
- Configurable history limit (fixed at 50)
- Animation between iterations
- Click-to-expand detailed views
- Comparison between iterations

---

## Technical Approach

### File Changes Required

**New File: `src/ui/equationVisualizer.js`**
- Core visualizer module with functions:
  - `initEquationVisualizer(container)` - Initialize container
  - `updateEquationVisualizer(equationHistory, A, b, n)` - Render all iterations
  - `generateOriginalEquations(A, b, x, n)` - Generate LaTeX for original equations
  - `generateJacobiFormulasWithValues(A, b, x, n)` - Generate LaTeX for Jacobi formulas
  - `addIterationSnapshot(equationHistory, iteration, x)` - Add snapshot with limit
  - `clearEquationHistory(equationHistory)` - Clear history array

**Modify: `index.html`**
- Add equation visualizer container after signal clarity display (around line 148)
- Structure: header + scrollable content area

**Modify: `main.js`**
- Add `equationHistory: []` to state object
- Capture snapshots in `performIteration()` before `updateDisplays()`
- Call `updateEquationVisualizer()` in `updateDisplays()` at the end
- Clear history in `reset()` and `applySystemConfiguration()`
- Import and initialize visualizer module

**Modify: `src/utils/formatting.js`**
- Enhance or create helper for equations with evaluation display
- Support showing LHS computation vs target value

**Modify: `src/core/jacobi.js`**
- Enhance `generateJacobiFormulas()` or create `generateJacobiFormulasWithValues()`
- Include actual numeric substitutions and computed results

**Modify: CSS (styles/legacy.css or appropriate stylesheet)**
- Add styles for visualizer container, iteration sections, equation groups
- Ensure theme compatibility (vintage/modern)
- Proper scrolling behavior

### Implementation Strategy

**Phase 1: Core Module Creation**
- Create `equationVisualizer.js` with core functions
- Implement LaTeX generation for both equation types
- Implement history management (add, clear, limit)

**Phase 2: HTML Structure**
- Add visualizer container to HTML
- Structure with header and scrollable content area
- Add appropriate IDs and classes

**Phase 3: State Integration**
- Add `equationHistory` to state
- Hook into iteration capture point
- Hook into display update point
- Hook into reset/clear points

**Phase 4: Rendering**
- Implement iteration rendering with KaTeX
- Display original equations with evaluations
- Display Jacobi formulas with substitutions
- Handle empty state and initial render

**Phase 5: Styling**
- Style container with max-height and scrolling
- Style iteration sections with proper spacing
- Style equation groups and labels
- Ensure theme compatibility

### Key Considerations

- **Performance**: Limit to 50 iterations to prevent memory/rendering issues
- **KaTeX Rendering**: Use `displayMode: true` for proper equation display
- **History Order**: Display newest first (reverse chronological) for better UX
- **Auto-scroll**: Optionally auto-scroll to newest iteration (or let user control)
- **Reset Behavior**: Clear history when system changes or resets
- **Empty State**: Handle case when no iterations yet

---

## Success Criteria

- [ ] Visualizer container appears below signal clarity display
- [ ] Container is scrollable with max-height 300px
- [ ] Each iteration displays with header, original equations, and Jacobi formulas
- [ ] Original equations show LaTeX format with substituted x values and LHS evaluation
- [ ] Jacobi formulas show LaTeX format with numeric substitutions and computed results
- [ ] History maintains last 50 iterations (removes oldest when exceeded)
- [ ] History clears on system reset
- [ ] History clears on system configuration change
- [ ] All equations render correctly with KaTeX
- [ ] Styling matches app theme (vintage/modern)
- [ ] Component integrates seamlessly with existing iteration flow

---

## Test Cases

### Unit Tests

#### Test Case 1: History Management - Add Snapshot
**Description:** Verify that `addIterationSnapshot()` correctly adds iteration snapshots to history.

**Input:**
- Empty `equationHistory` array
- `iteration = 0`
- `x = [1.0, 2.0, 3.0]`

**Expected Output:**
- `equationHistory.length === 1`
- `equationHistory[0].iteration === 0`
- `equationHistory[0].x` is deep copy (not reference) of input x
- `equationHistory[0].x === [1.0, 2.0, 3.0]`

**Edge Cases:**
- Adding snapshot with `x = []` (empty array)
- Adding snapshot with `x = [0, 0, 0]` (all zeros)
- Adding snapshot with very large x values

---

#### Test Case 2: History Management - Limit Enforcement
**Description:** Verify that history limit of 50 iterations is enforced correctly.

**Input:**
- `equationHistory` with 50 existing entries
- Add 51st snapshot with `iteration = 50`

**Expected Output:**
- `equationHistory.length === 50` (limit maintained)
- Oldest entry (iteration 0) is removed
- Newest entry (iteration 50) is at end of array
- All entries from iteration 1-50 are preserved

**Edge Cases:**
- Adding multiple snapshots rapidly
- Adding snapshot when history has exactly 50 entries

---

#### Test Case 3: History Management - Clear History
**Description:** Verify that `clearEquationHistory()` clears history while maintaining array reference.

**Input:**
- `equationHistory` with 10 entries
- Call `clearEquationHistory(equationHistory)`

**Expected Output:**
- `equationHistory.length === 0`
- Array reference is maintained (same object)
- All entries are removed

---

#### Test Case 4: LaTeX Generation - Original Equations
**Description:** Verify `generateOriginalEquations()` generates correct LaTeX for original equations.

**Input:**
- `A = [[4, -1, 1], [-1, 3, -2], [1, -2, 3]]`
- `b = [7, 2, 5]`
- `x = [1.0, 2.0, 2.0]`
- `n = 3`

**Expected Output:**
- Array of 3 LaTeX strings
- First equation: `4x_1 - x_2 + x_3 = 7`
- Evaluation: `LHS = 8.00 = 7.00` (or similar format)
- All equations include coefficient values and evaluation

**Edge Cases:**
- Zero coefficients: `A = [[0, 1, 0], [1, 0, 1], [0, 0, 1]]`
- Negative coefficients: `A = [[-2, -3], [-1, -4]]`
- Large coefficients: `A = [[1000, 2000], [3000, 4000]]`
- Decimal coefficients: `A = [[0.5, 1.25], [2.75, 3.33]]`

---

#### Test Case 5: LaTeX Generation - Jacobi Formulas
**Description:** Verify `generateJacobiFormulasWithValues()` generates correct LaTeX for Jacobi update formulas.

**Input:**
- `A = [[4, -1, 1], [-1, 3, -2], [1, -2, 3]]`
- `b = [7, 2, 5]`
- `x = [1.0, 2.0, 2.0]`
- `n = 3`

**Expected Output:**
- Array of 3 LaTeX strings
- First formula: `x_1^{(k+1)} = (b_1 - \sum_{j \neq 1} a_{1,j} x_j^{(k)}) / a_{1,1}`
- Numeric substitution: `x_1 = (7 - (-1 \cdot 2 + 1 \cdot 2)) / 4 = 1.75`
- All formulas include structure and numeric evaluation

**Edge Cases:**
- Zero diagonal element (should handle gracefully or skip)
- Single term in sum (no summation needed)
- All off-diagonal terms zero

---

#### Test Case 6: LaTeX Generation - Edge Cases
**Description:** Verify LaTeX generation handles edge cases correctly.

**Test 6a: Single Equation System**
- Input: `n = 1`, `A = [[5]]`, `b = [10]`, `x = [2.0]`
- Expected: Single equation and formula generated correctly

**Test 6b: Large System**
- Input: `n = 10`, random A, b, x
- Expected: All 10 equations and formulas generated without errors

**Test 6c: Very Small Values**
- Input: `x = [0.0001, 0.0002, 0.0003]`
- Expected: Values formatted appropriately (scientific notation or precision handling)

**Test 6d: Very Large Values**
- Input: `x = [1000000, 2000000, 3000000]`
- Expected: Values formatted appropriately

---

#### Test Case 7: Rendering - Empty History
**Description:** Verify visualizer handles empty history gracefully.

**Input:**
- `equationHistory = []`
- Valid A, b, n

**Expected Output:**
- Container displays empty state message or remains empty
- No errors thrown
- Container is still visible and styled correctly

---

#### Test Case 8: Rendering - Single Iteration
**Description:** Verify visualizer renders single iteration correctly.

**Input:**
- `equationHistory = [{ iteration: 0, x: [1.0, 2.0, 3.0] }]`
- `A = [[4, -1, 1], [-1, 3, -2], [1, -2, 3]]`
- `b = [7, 2, 5]`
- `n = 3`

**Expected Output:**
- One iteration section displayed
- Header shows "Iteration 0"
- Original equations group displayed with 3 equations
- Jacobi formulas group displayed with 3 formulas
- All equations render with KaTeX (no errors)

---

#### Test Case 9: Rendering - Multiple Iterations
**Description:** Verify visualizer renders multiple iterations in reverse chronological order.

**Input:**
- `equationHistory` with 5 iterations (0-4)
- Valid A, b, n

**Expected Output:**
- 5 iteration sections displayed
- Iterations displayed newest first (4, 3, 2, 1, 0)
- Each iteration has correct header, equations, and formulas
- Proper spacing between iterations

---

#### Test Case 10: Rendering - Maximum Iterations
**Description:** Verify visualizer handles 50 iterations correctly.

**Input:**
- `equationHistory` with 50 iterations
- Valid A, b, n

**Expected Output:**
- All 50 iterations displayed
- Container is scrollable
- Performance is acceptable (rendering completes in reasonable time)
- No memory leaks or performance degradation

---

### Integration Tests

#### Test Case 11: Integration - Manual Iteration Step
**Description:** Verify visualizer updates when user performs manual iteration step.

**Steps:**
1. Initialize system with valid configuration
2. Click "Step" button once
3. Verify `equationHistory` has 1 entry
4. Verify visualizer displays iteration 0
5. Click "Step" button again
6. Verify `equationHistory` has 2 entries
7. Verify visualizer displays iterations 0 and 1 (newest first)

**Expected Output:**
- History updates correctly on each step
- Visualizer renders new iteration immediately
- No errors in console

---

#### Test Case 12: Integration - Autoplay Iterations
**Description:** Verify visualizer updates correctly during autoplay.

**Steps:**
1. Initialize system with valid configuration
2. Start autoplay
3. Let it run for 10 iterations
4. Stop autoplay
5. Verify `equationHistory` has 10 entries
6. Verify visualizer displays all 10 iterations

**Expected Output:**
- History captures all iterations during autoplay
- Visualizer updates smoothly (or at least correctly)
- No performance issues or lag
- All iterations are displayed correctly

---

#### Test Case 13: Integration - System Reset
**Description:** Verify history clears when system is reset.

**Steps:**
1. Perform 5 iterations (history has 5 entries)
2. Click "Reset" button
3. Verify `equationHistory.length === 0`
4. Verify visualizer shows empty state or no iterations

**Expected Output:**
- History is cleared immediately on reset
- Visualizer updates to show empty state
- No errors thrown

---

#### Test Case 14: Integration - Configuration Change
**Description:** Verify history clears when system configuration changes.

**Steps:**
1. Perform 5 iterations with system A
2. Change system configuration (matrix size or values)
3. Apply new configuration
4. Verify `equationHistory.length === 0`
5. Verify visualizer shows empty state

**Expected Output:**
- History is cleared when configuration changes
- Visualizer updates correctly
- New iterations start from clean state

---

#### Test Case 15: Integration - Theme Switching
**Description:** Verify visualizer styling works with both themes.

**Steps:**
1. Initialize system and perform 3 iterations
2. Switch to vintage theme
3. Verify visualizer styling matches vintage theme
4. Switch to modern theme
5. Verify visualizer styling matches modern theme

**Expected Output:**
- Visualizer adapts to theme changes
- Colors, fonts, and styling are consistent
- No visual glitches or layout issues

---

### Mathematical Accuracy Tests

#### Test Case 16: Mathematical Accuracy - LHS Calculation
**Description:** Verify LHS calculations are mathematically correct.

**Input:**
- `A = [[2, 1], [1, 3]]`
- `b = [5, 7]`
- `x = [1.0, 3.0]`

**Expected Output:**
- First equation LHS: `2(1.0) + 1(3.0) = 5.0`
- Second equation LHS: `1(1.0) + 3(3.0) = 10.0`
- Evaluations match computed values exactly (within floating point precision)

**Test Cases:**
- Test with known solutions
- Test with convergence values
- Test with various coefficient combinations

---

#### Test Case 17: Mathematical Accuracy - Jacobi Formula Calculation
**Description:** Verify Jacobi formula calculations are mathematically correct.

**Input:**
- `A = [[4, -1, 1], [-1, 3, -2], [1, -2, 3]]`
- `b = [7, 2, 5]`
- `x = [1.0, 2.0, 2.0]`

**Expected Output:**
- First variable: `x_1 = (7 - (-1)(2) - (1)(2)) / 4 = (7 + 2 - 2) / 4 = 7/4 = 1.75`
- Calculations match expected Jacobi update formula
- All formulas compute correctly

---

#### Test Case 18: Mathematical Accuracy - Precision Handling
**Description:** Verify calculations handle floating point precision correctly.

**Input:**
- System with values that produce repeating decimals
- System with very small differences

**Expected Output:**
- Values are formatted appropriately
- Precision is consistent across all equations
- No rounding errors cause display issues

---

### UI/UX Tests

#### Test Case 19: UI - Container Positioning
**Description:** Verify visualizer container appears in correct location.

**Expected Output:**
- Container is positioned below signal clarity display
- Container is within equation panel
- Container does not overlap other elements
- Container is visible and accessible

---

#### Test Case 20: UI - Scrolling Behavior
**Description:** Verify scrolling works correctly.

**Steps:**
1. Perform 20 iterations (enough to exceed 300px height)
2. Verify scrollbar appears
3. Verify user can scroll to see all iterations
4. Verify scroll position is maintained during updates

**Expected Output:**
- Scrollbar appears when content exceeds 300px
- Scrolling is smooth and responsive
- All content is accessible via scrolling

---

#### Test Case 21: UI - KaTeX Rendering
**Description:** Verify all equations render correctly with KaTeX.

**Steps:**
1. Perform iterations with various coefficient values
2. Verify all LaTeX strings render without errors
3. Check browser console for KaTeX errors

**Expected Output:**
- All equations render as mathematical notation
- No KaTeX rendering errors
- Equations are readable and properly formatted
- Display mode is used (equations centered, larger)

---

#### Test Case 22: UI - Responsive Design
**Description:** Verify visualizer works on different screen sizes.

**Test Cases:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Expected Output:**
- Container adapts to screen size
- Scrolling works on all devices
- Text and equations remain readable
- Layout does not break

---

### Performance Tests

#### Test Case 23: Performance - Maximum Iterations Rendering
**Description:** Verify performance with 50 iterations.

**Steps:**
1. Perform 50 iterations
2. Measure time to render all iterations
3. Monitor memory usage

**Expected Output:**
- Rendering completes in < 2 seconds
- Memory usage is reasonable (< 50MB increase)
- No browser freezing or lag
- Smooth scrolling

---

#### Test Case 24: Performance - Rapid Updates
**Description:** Verify performance during rapid iteration updates.

**Steps:**
1. Start autoplay with fast interval
2. Let it run for 20 iterations rapidly
3. Monitor rendering performance

**Expected Output:**
- Visualizer updates without lag
- No dropped iterations
- Browser remains responsive
- Memory usage stable

---

#### Test Case 25: Performance - Large Systems
**Description:** Verify performance with large systems (n > 5).

**Steps:**
1. Configure system with n = 10
2. Perform 20 iterations
3. Monitor rendering performance

**Expected Output:**
- All equations render correctly
- Performance is acceptable
- No significant slowdown compared to smaller systems

---

### Browser Compatibility Tests

#### Test Case 26: Browser - Chrome/Edge
**Description:** Verify functionality in Chrome and Edge browsers.

**Expected Output:**
- All features work correctly
- KaTeX renders properly
- Scrolling works smoothly
- No console errors

---

#### Test Case 27: Browser - Firefox
**Description:** Verify functionality in Firefox browser.

**Expected Output:**
- All features work correctly
- KaTeX renders properly
- Scrolling works smoothly
- No console errors

---

#### Test Case 28: Browser - Safari
**Description:** Verify functionality in Safari browser.

**Expected Output:**
- All features work correctly
- KaTeX renders properly
- Scrolling works smoothly
- No console errors

---

#### Test Case 29: Browser - Mobile Browsers
**Description:** Verify functionality on mobile browsers (iOS Safari, Chrome Mobile).

**Expected Output:**
- Touch scrolling works
- Layout is responsive
- Equations are readable
- Performance is acceptable

---

### Error Handling Tests

#### Test Case 30: Error Handling - Invalid Input
**Description:** Verify error handling for invalid inputs.

**Test Cases:**
- `A` is null or undefined
- `b` is null or undefined
- `x` is null or undefined
- `n` is 0 or negative
- `equationHistory` is null

**Expected Output:**
- Functions handle invalid inputs gracefully
- No uncaught exceptions
- Appropriate error messages or fallback behavior

---

#### Test Case 31: Error Handling - KaTeX Rendering Errors
**Description:** Verify handling of KaTeX rendering errors.

**Steps:**
1. Create invalid LaTeX string (if possible)
2. Attempt to render with KaTeX

**Expected Output:**
- KaTeX uses `throwOnError: false`
- Invalid LaTeX shows fallback text or error indicator
- Application continues to function

---

#### Test Case 32: Error Handling - Missing DOM Elements
**Description:** Verify handling when DOM elements are missing.

**Steps:**
1. Call `initEquationVisualizer(null)`
2. Call `updateEquationVisualizer()` with missing container

**Expected Output:**
- Functions handle missing elements gracefully
- No uncaught exceptions
- Appropriate error handling or validation

---

## Dependencies

- KaTeX library (already included in project)
- Existing `src/utils/formatting.js` for LaTeX helpers
- Existing `src/core/jacobi.js` for Jacobi formula generation
- No additional npm packages required

---

## Data Structure

### Equation History Array
```javascript
equationHistory = [
  {
    iteration: 0,
    x: [1.0, 2.0, 2.0]  // Deep copy of x values
  },
  {
    iteration: 1,
    x: [1.75, 2.5, 3.2]
  },
  // ... up to 50 entries
]
```

### LaTeX Generation

**Original Equation Format:**
- Structure: `a₁x₁ + a₂x₂ + ... = b`
- Evaluation: `LHS = {computed} = {target}`
- Example: `4x₁ - x₂ + x₃ = 7` then `LHS = 8.50 = 7.00`

**Jacobi Formula Format:**
- Structure: `x_{i+1}^{(k+1)} = (b_{i+1} - Σ_{j≠i} a_{i+1,j} x_j^{(k)}) / a_{i+1,i+1}`
- Substitution: `x_{i+1} = (b_i - sum) / a_ii = {computed_value}`
- Example: `x₁ = (7 - (-1·2 + 1·2)) / 4 = 1.75`

---

## Risks

1. **Performance with Many Iterations**: Rendering 50 KaTeX equations may be slow
   - *Mitigation*: Limit to 50 iterations, use efficient DOM updates, consider virtual scrolling if needed

2. **KaTeX Rendering Errors**: Complex LaTeX may fail to render
   - *Mitigation*: Use `throwOnError: false`, provide fallback text display

3. **Memory Usage**: Storing 50 iteration snapshots with x arrays
   - *Mitigation*: Limit enforced, arrays are relatively small (n values each)

4. **Theme Consistency**: Must ensure styling works with both themes
   - *Mitigation*: Use CSS variables, test both themes

5. **Long Equations**: Large systems (n > 5) may produce very long equations
   - *Mitigation*: Scrollable container handles overflow, KaTeX handles wrapping

---

## Future Enhancements

- Configurable history limit (user setting)
- Export equation history as text/LaTeX
- Comparison view between two iterations
- Animation showing progression between iterations
- Filter/search iterations by iteration number
- Collapsible iteration sections
- Highlight changed values between iterations
- Click to focus on specific equation
- Integration with state manager for persistence

---

## Related Documents

- `feature-equation-visualizer-todo.md` - Implementation checklist
- `src/ui/equationVisualizer.js` - Visualizer module implementation
- `index.html` - HTML structure with visualizer container
- `main.js` - Integration with iteration flow
- `src/utils/formatting.js` - LaTeX formatting helpers
- `src/core/jacobi.js` - Jacobi formula generation

---

## Notes

- Visualizer captures snapshots at each iteration automatically
- History is cleared when system resets or configuration changes
- KaTeX rendering uses display mode for proper mathematical notation
- Container scrolls automatically or user can manually scroll
- All equations are rendered fresh on each update (no caching needed for simplicity)
- History limit of 50 balances visibility with performance

