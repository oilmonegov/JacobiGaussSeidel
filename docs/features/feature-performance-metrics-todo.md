# Feature Todo: Performance Metrics Display

**Feature Document:** `feature-performance-metrics.md`  
**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** In Progress

---

## Implementation Phases

### Phase 1: Data Structure and Measurement Foundation

#### 1.1 Extend Performance History State
- [ ] Update `state.performanceHistory` structure in `main.js` (around line 65)
  - Change from simple object to structure with `runs` arrays
  - Add `currentRun` object for active measurement
  - Structure: `{ jacobi: { runs: [], currentRun: {...} }, gaussSeidel: { runs: [], currentRun: {...} } }`
  - Each run object: `{ iterations, timeToConverge, memoryUsed, avgTimePerIteration, timestamp }`
  - Current run object: `{ startTime, startMemory, lastUpdateTime, lastUpdateMemory, iteration }`

#### 1.2 Create Performance Measurement Module
- [ ] Create `src/utils/performance.js` file
- [ ] Implement `startMeasurement(method, state)` function
  - Record `performance.now()` as start time
  - Record `performance.memory.usedJSHeapSize` as start memory (if available)
  - Initialize current run in state
  - Handle case where measurement already started (don't restart)
- [ ] Implement `updateMeasurement(method, iteration, state)` function
  - Update current run with latest iteration count
  - Calculate elapsed time: `performance.now() - startTime`
  - Calculate current memory: `performance.memory.usedJSHeapSize - startMemory` (if available)
  - Calculate avg time per iteration: `elapsedTime / iteration`
  - Update current run object in state
- [ ] Implement `completeMeasurement(method, state)` function
  - Finalize current run metrics
  - Push completed run to `runs` array
  - Clear current run
  - Add timestamp to completed run
- [ ] Implement `getMemoryUsage()` helper function
  - Check if `performance.memory` exists
  - Return memory in MB: `(usedJSHeapSize / 1024 / 1024)`
  - Return `null` if API unavailable
- [ ] Implement `calculateStats(runs)` function
  - Calculate best (minimum) time, memory, iterations
  - Calculate worst (maximum) time, memory, iterations
  - Calculate average time, memory, iterations
  - Return stats object: `{ best: {...}, worst: {...}, average: {...} }`
- [ ] Implement `resetCurrentRun(method, state)` function
  - Clear current run data
  - Don't affect runs history

#### 1.3 Integrate Measurements into Iteration Loop
- [ ] Import performance module in `main.js`
- [ ] In `performIteration()` function (around line 852):
  - Call `startMeasurement()` at beginning if not already started
  - Call `updateMeasurement()` at end of each iteration (after state.iteration++)
  - Call `completeMeasurement()` when convergence reached (around line 899)
- [ ] Test measurement integration
  - Verify start/update/complete calls work
  - Verify metrics are calculated correctly

---

### Phase 2: Display Component and UI Updates

#### 2.1 Update HTML Structure
- [ ] Update `index.html` signal clarity display (around line 149-156)
- [ ] Expand `.performance-info` section to show:
  - Current run metrics (time, memory, avg time/iter) - updating in real-time
  - Historical stats section (best/worst/average) - shown when multiple runs exist
- [ ] Add DOM elements:
  - `#currentMetrics` - container for current run metrics
  - `#jacobiCurrent` - Jacobi current metrics display
  - `#gaussSeidelCurrent` - Gauss-Seidel current metrics display
  - `#historicalStats` - container for historical statistics
  - `#jacobiStats` - Jacobi historical stats display
  - `#gaussSeidelStats` - Gauss-Seidel historical stats display
  - `#exportPerformanceBtn` - export button
- [ ] Add tooltip attributes to metric elements
  - Time tooltip: "Time taken from iteration start to convergence"
  - Memory tooltip: "Memory used during convergence (Chrome/Edge only)"
  - CPU tooltip: "Average time per iteration, used as CPU usage proxy"

#### 2.2 Create Performance Display Component
- [ ] Create `src/ui/performanceDisplay.js` file
- [ ] Implement `updatePerformanceDisplay(elements, state)` function
  - Get current run data for both methods
  - Get runs history for both methods
  - Calculate statistics if multiple runs exist
  - Format and display current metrics:
    - Time: `X.XXX s` (3 decimals)
    - Memory: `X.XX MB` or `N/A` if unavailable (2 decimals)
    - CPU proxy: `X.XX ms/iter` (2 decimals)
  - Display historical stats if available:
    - Format: "Best: X.XXXs, Worst: X.XXXs, Avg: X.XXXs"
  - Highlight performance winners with color coding
  - Show "N/A" or "-" for metrics not yet available
- [ ] Implement helper functions:
  - `formatTime(seconds)` - format to "X.XXX s"
  - `formatMemory(mb)` - format to "X.XX MB" or "N/A"
  - `formatCPU(ms)` - format to "X.XX ms/iter"
  - `getWinner(method1Data, method2Data, metric)` - determine winner for metric
- [ ] Handle edge cases:
  - No current run (show "-")
  - No history (don't show stats section)
  - Memory unavailable (show "N/A")
  - Non-convergence (show ">1000 iters" or similar)

#### 2.3 Integrate Display Updates
- [ ] Import performance display module in `main.js`
- [ ] In `updateDisplays()` function (around line 359):
  - Call `updatePerformanceDisplay(elements, state)` after other display updates
  - Ensure it's called every iteration for real-time feel
- [ ] Test real-time updates
  - Verify metrics update smoothly during iteration
  - Verify no performance degradation

---

### Phase 3: Historical Tracking and Statistics

#### 3.1 Statistics Calculation
- [ ] Verify `calculateStats()` function works correctly
  - Test with empty array (return null or empty stats)
  - Test with single run (best = worst = average)
  - Test with multiple runs (calculate correctly)
- [ ] Test statistics display
  - Verify best/worst/average are correct
  - Verify formatting is correct
  - Verify display only shows when multiple runs exist

#### 3.2 Historical Display
- [ ] Update `updatePerformanceDisplay()` to show historical stats
- [ ] Format historical stats clearly:
  - "Best: X.XXXs / X.XX MB / X.XX ms/iter"
  - "Worst: X.XXXs / X.XX MB / X.XX ms/iter"
  - "Average: X.XXXs / X.XX MB / X.XX ms/iter"
- [ ] Show stats for both methods side-by-side
- [ ] Test with multiple convergence runs
  - Run Jacobi to convergence multiple times
  - Run Gauss-Seidel to convergence multiple times
  - Verify stats update correctly

---

### Phase 4: CSV Export Functionality

#### 4.1 Create Export Module
- [ ] Create `src/utils/export.js` file
- [ ] Implement `exportPerformanceToCSV(performanceHistory)` function
  - Generate CSV header row: "Method,Run,Iterations,Time (s),Memory (MB),Avg Time/Iter (ms),Timestamp"
  - For each method (jacobi, gaussSeidel):
    - For each run in runs array:
      - Generate row with: method name, run number, iterations, time, memory, avg time/iter, timestamp
  - Calculate and add statistics rows:
    - "Jacobi - Best, ..."
    - "Jacobi - Worst, ..."
    - "Jacobi - Average, ..."
    - Same for Gauss-Seidel
  - Return CSV string
- [ ] Implement CSV formatting helpers:
  - Escape commas and quotes in data
  - Format numbers consistently
  - Format timestamps (ISO format or readable)

#### 4.2 Add Export Button Handler
- [ ] In `main.js` or create handler in `src/controls/buttons.js`:
  - Add event listener for `#exportPerformanceBtn`
  - On click: call `exportPerformanceToCSV(state.performanceHistory)`
  - Create blob with CSV data
  - Create download link and trigger download
  - Generate filename: `performance-data-YYYY-MM-DD-HH-MM-SS.csv`
  - Show success message after export
- [ ] Test export functionality
  - Export with no data (handle gracefully)
  - Export with single run
  - Export with multiple runs
  - Verify CSV opens correctly in Excel/Google Sheets

---

### Phase 5: Reset and Method Switching

#### 5.1 Handle System Reset
- [ ] Update `reset()` function in `main.js` (around line 1045)
  - Call `resetCurrentRun('jacobi', state)`
  - Call `resetCurrentRun('gaussSeidel', state)`
  - Keep runs history intact (don't clear)
- [ ] Test reset behavior
  - Reset during active measurement (should clear current run)
  - Reset after convergence (should keep history)
  - Verify metrics display updates correctly

#### 5.2 Handle Method Switching
- [ ] Find method switching logic in `main.js`
- [ ] When method changes:
  - Complete current run for previous method (if in progress)
  - Start new measurement for new method
  - Reset current run for previous method
- [ ] Test method switching
  - Switch mid-iteration (should complete previous, start new)
  - Switch after convergence (should start fresh)
  - Verify metrics display updates correctly

---

### Phase 6: Styling and Polish

#### 6.1 Style Performance Metrics Display
- [ ] Update `styles/legacy.css` (around line 979)
- [ ] Style `.performance-info` section:
  - Layout: flex or grid for metrics
  - Spacing between metrics
  - Font sizing and colors
- [ ] Style current metrics display:
  - `.current-metrics` container
  - Individual metric displays
  - Method labels
- [ ] Style historical stats section:
  - `.historical-stats` container
  - Stats display formatting
  - Show/hide based on data availability
- [ ] Style export button:
  - `.export-performance-btn` class
  - Match existing button styles
  - Hover effects
  - Icon or text label

#### 6.2 Color Coding for Winners
- [ ] Add CSS classes for winners:
  - `.metric-winner` - highlight better performance
  - Use green color for better (faster time, lower memory, lower CPU)
  - Use subtle background or border
- [ ] Update `updatePerformanceDisplay()` to add winner classes
  - Compare metrics between methods
  - Apply winner class to better performing method

#### 6.3 Theme Support
- [ ] Add modern theme overrides:
  - `.modern-theme .performance-info` styles
  - `.modern-theme .current-metrics` styles
  - `.modern-theme .historical-stats` styles
  - `.modern-theme .export-performance-btn` styles
- [ ] Test both themes
  - Verify metrics display correctly in vintage theme
  - Verify metrics display correctly in modern theme
  - Verify color coding works in both themes

#### 6.4 Responsive Design
- [ ] Add responsive styles for metrics display
  - Stack metrics vertically on small screens
  - Adjust font sizes for mobile
  - Ensure export button is accessible
- [ ] Test responsive layout
  - Desktop (1200px+)
  - Tablet (768px-1199px)
  - Mobile (<768px)

---

### Phase 7: Edge Cases and Error Handling

#### 7.1 Memory API Fallback
- [ ] Test memory API availability
  - Chrome/Edge: should show memory values
  - Firefox/Safari: should show "N/A"
- [ ] Verify fallback message displays correctly
  - Show "N/A" for memory when API unavailable
  - Don't break other metrics
- [ ] Add tooltip explaining memory API limitation

#### 7.2 Non-Convergence Handling
- [ ] Handle case where method doesn't converge
  - Show ">1000 iters" or "N/A" for time
  - Don't add incomplete run to history
  - Reset current run on non-convergence
- [ ] Test non-convergence scenarios
  - System that doesn't converge
  - Very slow convergence (>1000 iterations)

#### 7.3 Data Validation
- [ ] Add validation for performance data
  - Check for NaN or Infinity values
  - Check for negative values (shouldn't happen)
  - Handle missing data gracefully
- [ ] Test edge cases:
  - Very fast convergence (< 1ms)
  - Very slow convergence (> 1 hour)
  - Zero memory usage (shouldn't happen but handle)

---

### Phase 8: Testing and Validation

#### 8.1 Functional Testing
- [ ] Test measurement accuracy
  - Compare time measurements with manual timing
  - Verify memory measurements are reasonable
  - Verify CPU proxy calculations are correct
- [ ] Test real-time updates
  - Metrics update every iteration
  - No flickering or performance issues
  - Updates are smooth
- [ ] Test historical tracking
  - Multiple runs tracked correctly
  - Statistics calculated correctly
  - History persists across resets

#### 8.2 Visual Testing
- [ ] Test metrics display layout
  - All metrics visible and readable
  - Proper spacing and alignment
  - Color coding works correctly
- [ ] Test tooltips
  - Appear on hover
  - Explain metrics clearly
  - Don't interfere with interaction
- [ ] Test export button
  - Visible and accessible
  - Styled correctly
  - Works in both themes

#### 8.3 Browser Testing
- [ ] Chrome/Edge (with memory API)
  - All metrics display correctly
  - Memory values show correctly
  - Export works
- [ ] Firefox (without memory API)
  - Memory shows "N/A"
  - Other metrics work correctly
  - Export works
- [ ] Safari (without memory API)
  - Memory shows "N/A"
  - Other metrics work correctly
  - Export works
- [ ] Mobile browsers
  - Layout is responsive
  - Metrics are readable
  - Export works

#### 8.4 Integration Testing
- [ ] Test with existing features
  - Config modal doesn't interfere
  - Theme switching works
  - Reset button works correctly
  - Method switching works correctly
- [ ] Test performance impact
  - No noticeable slowdown from measurements
  - Real-time updates don't cause lag
  - Export doesn't freeze browser

---

## Testing Checklist

### Functional Testing
- [ ] Metrics start tracking when iteration begins
- [ ] Metrics update in real-time during iteration
- [ ] Metrics complete when convergence reached
- [ ] Metrics reset when system resets
- [ ] Metrics handle method switching correctly
- [ ] Historical stats calculate correctly (best/worst/average)
- [ ] CSV export generates correct data
- [ ] CSV download works in different browsers
- [ ] Memory fallback message shows when API unavailable

### Visual Testing
- [ ] Metrics display correctly in signal clarity box
- [ ] Real-time updates are smooth (no flickering)
- [ ] Color coding highlights winners correctly
- [ ] Historical stats display when multiple runs exist
- [ ] Export button is visible and styled correctly
- [ ] Tooltips appear on hover
- [ ] Layout works in both vintage and modern themes
- [ ] Responsive layout on different screen sizes

### Data Accuracy Testing
- [ ] Time measurements are accurate (compare with manual timing)
- [ ] Memory measurements are reasonable (within expected ranges)
- [ ] CPU proxy calculations are correct (time/iterations)
- [ ] Statistics calculations are correct (best/worst/average)
- [ ] CSV data matches displayed data

### Edge Case Testing
- [ ] Non-convergence handled gracefully (show N/A or >1000 iters)
- [ ] Method switch mid-iteration handled correctly
- [ ] Multiple rapid resets don't break measurement
- [ ] Very long convergence runs don't cause issues
- [ ] Memory API unavailable shows appropriate message
- [ ] Export with no data handled gracefully

### Browser Testing
- [ ] Chrome/Edge (with memory API)
- [ ] Firefox (without memory API - fallback)
- [ ] Safari (without memory API - fallback)
- [ ] Mobile browsers

---

## Notes

- All measurement functions should be efficient to minimize performance impact
- Memory API is only available in Chrome/Edge - always provide fallback
- Real-time updates happen every iteration - ensure DOM updates are efficient
- CSV export should use standard format for compatibility
- Historical tracking maintains all runs - consider adding limit if needed
- Test incrementally after each phase to catch issues early

---

## Completion Criteria

All items in this todo list must be completed and tested before considering the feature complete. The feature is complete when:
- All metrics display correctly in real-time
- Historical statistics work correctly
- CSV export generates correct data
- All edge cases are handled
- Styling matches existing design system
- All browsers tested and working

