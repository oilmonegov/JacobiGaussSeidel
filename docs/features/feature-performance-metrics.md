# Feature: Performance Metrics Display

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Planning  
**Priority:** High

---

## Problem Statement

Users currently cannot see the performance differences between the Jacobi and Gauss-Seidel iteration methods. While the system tracks iteration counts to convergence, there's no visibility into:
- How long each method takes to converge (time in seconds)
- Memory consumption differences between methods
- CPU usage patterns (as a proxy via time per iteration)
- Historical performance comparisons across multiple runs
- Ability to export performance data for analysis

The current performance tracking only shows iteration counts after convergence, and this information is hidden by default. Users need real-time visibility into these metrics to understand the computational trade-offs between methods.

---

## Goal

Add comprehensive performance metrics to the signal clarity display that show:
- **Real-time updates** during iteration (time, memory, CPU proxy)
- **Time taken** in seconds for each convergence run
- **Memory usage** in MB for each method
- **CPU usage proxy** via average time per iteration (ms/iter)
- **Historical comparisons** showing best/worst/average across all runs
- **CSV export** functionality for performance data analysis

The metrics should update in real-time during iteration and provide clear visual comparison between Jacobi and Gauss-Seidel methods.

---

## Scope

### In Scope

1. **Performance Measurement System**
   - Track time from iteration start to convergence
   - Measure memory usage before/after convergence
   - Calculate average time per iteration as CPU proxy
   - Support for full history of all convergence runs
   - Real-time metric updates during iteration

2. **Signal Clarity Display Enhancement**
   - Expand existing performance info section
   - Display current run metrics (time, memory, avg time/iter)
   - Show historical statistics (best/worst/average) when multiple runs exist
   - Real-time updates every iteration
   - Visual indicators for performance winners

3. **Data Structure Extensions**
   - Extend `state.performanceHistory` to track arrays of runs
   - Store: iterations, time, memory, avg time/iter per run
   - Calculate statistics from run history
   - Maintain current run state separately from history

4. **CSV Export Functionality**
   - Export all performance runs to CSV format
   - Include historical statistics in export
   - Columns: Method, Run Number, Iterations, Time (s), Memory (MB), Avg Time/Iter (ms), Timestamp
   - Download via browser blob URL

5. **Measurement Integration**
   - Start measurements when iteration begins
   - Update measurements every iteration (real-time)
   - Complete measurements when convergence reached
   - Reset measurements on system reset or method switch
   - Handle edge cases (non-convergence, browser limitations)

6. **UI/UX Enhancements**
   - Format metrics clearly (time: X.XXXs, memory: X.XX MB, CPU: X.XX ms/iter)
   - Color coding for performance winners
   - Tooltips explaining each metric
   - Export button with appropriate styling
   - Responsive layout for metrics display

### Out of Scope

- Direct CPU usage measurement (browser limitations - using time/iter as proxy)
- Real-time memory monitoring during iteration (only measure at start/end)
- Performance profiling of individual operations
- Network performance metrics
- Browser performance API beyond memory (already limited support)
- Automatic performance optimization suggestions
- Performance regression detection

---

## Technical Approach

### File Changes Required

**main.js**
- Extend `state.performanceHistory` structure (around line 65)
- Integrate measurement calls in `performIteration()` (around line 852)
- Add measurement reset in `reset()` function (around line 1045)
- Update `updateDisplays()` to call performance display update (around line 359)
- Handle method switching to reset/complete measurements

**src/utils/performance.js** (new file)
- `startMeasurement(method)` - Initialize timing and memory tracking
- `updateMeasurement(method, iteration)` - Update real-time metrics
- `completeMeasurement(method, iteration)` - Finalize and store run data
- `getMemoryUsage()` - Get current memory with fallback
- `calculateStats(runs)` - Calculate best/worst/average statistics
- `resetCurrentRun(method)` - Clear current run data

**src/ui/performanceDisplay.js** (new file)
- `updatePerformanceDisplay(elements, state)` - Update all metrics in UI
- Format time, memory, and CPU proxy values
- Display current run metrics in real-time
- Display historical statistics when available
- Highlight performance winners with color coding

**src/utils/export.js** (new file)
- `exportPerformanceToCSV(performanceHistory)` - Generate CSV data
- Format all runs and statistics
- Trigger browser download via blob URL

**index.html**
- Expand performance info section (around line 149-156)
- Add DOM elements for metrics display
- Add export button
- Add tooltips for metric explanations

**styles/legacy.css**
- Style performance metrics display elements (around line 979)
- Style historical stats section
- Style export button
- Add color coding for winners
- Theme support (vintage/modern)

### Implementation Strategy

**Phase 1: Data Structure and Measurement**
- Extend `state.performanceHistory` to track run arrays
- Create `src/utils/performance.js` with measurement functions
- Integrate start/update/complete calls in iteration loop
- Test measurement accuracy

**Phase 2: Display Component**
- Create `src/ui/performanceDisplay.js`
- Update HTML structure for metrics display
- Integrate display updates in `updateDisplays()`
- Test real-time updates

**Phase 3: Historical Tracking**
- Implement statistics calculation (best/worst/average)
- Display historical comparisons in UI
- Test with multiple convergence runs

**Phase 4: Export Functionality**
- Create `src/utils/export.js` with CSV generation
- Add export button and handler
- Test CSV download and format

**Phase 5: Polish and Edge Cases**
- Handle browser memory API limitations
- Add tooltips and help text
- Style metrics display
- Test reset and method switching
- Handle non-convergence cases

### Key Considerations

- **Browser Compatibility**: Memory API only available in Chrome/Edge - need fallback
- **Performance Impact**: Measurement overhead should be minimal
- **Real-time Updates**: Balance update frequency with performance
- **Data Persistence**: Consider if performance history should persist across sessions
- **Accuracy**: Time measurements use `performance.now()` for high resolution
- **Memory Measurement**: Only measure at start/end, not continuously (performance)

---

## Success Criteria

- [ ] Performance metrics display in signal clarity box
- [ ] Real-time updates during iteration (time, memory, CPU proxy)
- [ ] Time displayed in seconds with 3 decimal precision
- [ ] Memory displayed in MB with 2 decimal precision
- [ ] CPU proxy (avg time/iter) displayed in ms with 2 decimal precision
- [ ] Historical statistics shown when multiple runs exist (best/worst/average)
- [ ] CSV export generates correct format with all runs and statistics
- [ ] Export button triggers CSV download
- [ ] Metrics reset properly on system reset
- [ ] Metrics handle method switching correctly
- [ ] Fallback message shown when memory API unavailable
- [ ] Color coding highlights performance winners
- [ ] Tooltips explain each metric
- [ ] Styling matches vintage/modern themes
- [ ] No performance degradation from measurement overhead

---

## Dependencies

- Existing `state.performanceHistory` structure (needs extension)
- `performance.now()` API (widely supported)
- `performance.memory` API (Chrome/Edge only - needs fallback)
- Existing signal clarity display HTML structure
- Existing `updateDisplays()` function
- Existing `performIteration()` function

---

## Risks

1. **Browser Memory API Limitations**: Only available in Chrome/Edge
   - *Mitigation*: Provide fallback message, focus on time metrics which are universal

2. **Measurement Overhead**: Real-time updates could impact performance
   - *Mitigation*: Use efficient measurement methods, update only necessary DOM elements

3. **Memory Measurement Accuracy**: Browser may not provide precise memory data
   - *Mitigation*: Document limitations, use as relative comparison rather than absolute

4. **Data Structure Complexity**: Tracking full history may become unwieldy
   - *Mitigation*: Limit history size if needed, use efficient data structures

5. **Export Format Compatibility**: CSV format must be compatible with common tools
   - *Mitigation*: Use standard CSV format, test with Excel/Google Sheets

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

- CPU usage is measured as a proxy via average time per iteration, as browsers don't provide direct CPU usage APIs
- Memory measurements are only taken at start/end of convergence, not continuously, to minimize performance impact
- Historical tracking maintains all runs - consider adding a limit if memory becomes an issue
- CSV export includes all runs plus summary statistics for easy analysis
- Real-time updates happen every iteration, so users can see progress as it happens

---

## Related Documents

- `prd.md` - Product Requirements Document
- `feature-todo.md` - Main feature todo list
- `test-plan.md` - Testing documentation
- `STATE_MANAGEMENT.md` - State management patterns

