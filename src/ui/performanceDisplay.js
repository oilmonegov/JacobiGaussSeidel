/**
 * Performance Display Module
 * 
 * Updates the UI with real-time and historical performance metrics
 */

import { calculateStats } from '../utils/performance.js';

/**
 * Format time in seconds to "X.XXX s"
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    if (seconds === null || seconds === undefined || !isFinite(seconds)) {
        return '-';
    }
    return `${seconds.toFixed(3)} s`;
}

/**
 * Format memory in MB to "X.XX MB" or "N/A"
 * @param {number|null} mb - Memory in MB or null
 * @returns {string} Formatted memory string
 */
function formatMemory(mb) {
    if (mb === null || mb === undefined || !isFinite(mb)) {
        return 'N/A';
    }
    return `${mb.toFixed(2)} MB`;
}

/**
 * Format CPU proxy (avg time per iteration) to "X.XX ms/iter"
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted CPU string
 */
function formatCPU(ms) {
    if (ms === null || ms === undefined || !isFinite(ms)) {
        return '-';
    }
    return `${ms.toFixed(2)} ms/iter`;
}

/**
 * Determine winner for a metric (lower is better for time, memory, CPU)
 * @param {Object} method1Data - First method's data
 * @param {Object} method2Data - Second method's data
 * @param {string} metric - 'time', 'memory', or 'cpu'
 * @returns {string|null} 'method1', 'method2', or null if tie/unavailable
 */
function getWinner(method1Data, method2Data, metric) {
    let val1, val2;
    
    if (metric === 'time') {
        val1 = method1Data.time;
        val2 = method2Data.time;
    } else if (metric === 'memory') {
        val1 = method1Data.memory;
        val2 = method2Data.memory;
    } else if (metric === 'cpu') {
        val1 = method1Data.avgTimePerIter;
        val2 = method2Data.avgTimePerIter;
    } else {
        return null;
    }
    
    // Handle null/undefined values
    if (val1 === null || val1 === undefined || !isFinite(val1)) return null;
    if (val2 === null || val2 === undefined || !isFinite(val2)) return null;
    
    // Lower is better
    if (val1 < val2) return 'method1';
    if (val2 < val1) return 'method2';
    return null; // Tie
}

/**
 * Update performance display in the UI
 * @param {Object} elements - DOM elements object
 * @param {Object} state - Application state
 */
export function updatePerformanceDisplay(elements, state) {
    const jacobiData = state.performanceHistory.jacobi || {};
    const gaussSeidelData = state.performanceHistory.gaussSeidel || {};
    
    const jacobiCurrent = jacobiData.currentRun || null;
    const gaussSeidelCurrent = gaussSeidelData.currentRun || null;
    const jacobiRuns = jacobiData.runs || [];
    const gaussSeidelRuns = gaussSeidelData.runs || [];
    
    // Get current metrics
    const jacobiCurrentMetrics = {
        time: jacobiCurrent ? jacobiCurrent.elapsedTime : null,
        memory: jacobiCurrent ? jacobiCurrent.memoryUsed : null,
        avgTimePerIter: jacobiCurrent ? jacobiCurrent.avgTimePerIteration : null
    };
    
    const gaussSeidelCurrentMetrics = {
        time: gaussSeidelCurrent ? gaussSeidelCurrent.elapsedTime : null,
        memory: gaussSeidelCurrent ? gaussSeidelCurrent.memoryUsed : null,
        avgTimePerIter: gaussSeidelCurrent ? gaussSeidelCurrent.avgTimePerIteration : null
    };
    
    // Calculate statistics
    const jacobiStats = calculateStats(jacobiRuns);
    const gaussSeidelStats = calculateStats(gaussSeidelRuns);
    
    // Update current metrics display
    const jacobiCurrentEl = document.getElementById('jacobiCurrent');
    const gaussSeidelCurrentEl = document.getElementById('gaussSeidelCurrent');
    
    if (jacobiCurrentEl) {
        const timeStr = formatTime(jacobiCurrentMetrics.time);
        const memoryStr = formatMemory(jacobiCurrentMetrics.memory);
        const cpuStr = formatCPU(jacobiCurrentMetrics.avgTimePerIter);
        jacobiCurrentEl.innerHTML = `
            <div class="metric-row">
                <span class="metric-label">Time:</span>
                <span class="metric-value ${getWinner(jacobiCurrentMetrics, gaussSeidelCurrentMetrics, 'time') === 'method1' ? 'metric-winner' : ''}">${timeStr}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Memory:</span>
                <span class="metric-value ${getWinner(jacobiCurrentMetrics, gaussSeidelCurrentMetrics, 'memory') === 'method1' ? 'metric-winner' : ''}">${memoryStr}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">CPU:</span>
                <span class="metric-value ${getWinner(jacobiCurrentMetrics, gaussSeidelCurrentMetrics, 'cpu') === 'method1' ? 'metric-winner' : ''}">${cpuStr}</span>
            </div>
        `;
    }
    
    if (gaussSeidelCurrentEl) {
        const timeStr = formatTime(gaussSeidelCurrentMetrics.time);
        const memoryStr = formatMemory(gaussSeidelCurrentMetrics.memory);
        const cpuStr = formatCPU(gaussSeidelCurrentMetrics.avgTimePerIter);
        gaussSeidelCurrentEl.innerHTML = `
            <div class="metric-row">
                <span class="metric-label">Time:</span>
                <span class="metric-value ${getWinner(jacobiCurrentMetrics, gaussSeidelCurrentMetrics, 'time') === 'method2' ? 'metric-winner' : ''}">${timeStr}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Memory:</span>
                <span class="metric-value ${getWinner(jacobiCurrentMetrics, gaussSeidelCurrentMetrics, 'memory') === 'method2' ? 'metric-winner' : ''}">${memoryStr}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">CPU:</span>
                <span class="metric-value ${getWinner(jacobiCurrentMetrics, gaussSeidelCurrentMetrics, 'cpu') === 'method2' ? 'metric-winner' : ''}">${cpuStr}</span>
            </div>
        `;
    }
    
    // Update historical stats display
    const jacobiStatsEl = document.getElementById('jacobiStats');
    const gaussSeidelStatsEl = document.getElementById('gaussSeidelStats');
    const historicalStatsEl = document.getElementById('historicalStats');
    
    if (historicalStatsEl) {
        const hasHistory = (jacobiStats || gaussSeidelStats);
        historicalStatsEl.style.display = hasHistory ? 'block' : 'none';
    }
    
    if (jacobiStatsEl && jacobiStats) {
        jacobiStatsEl.innerHTML = `
            <div class="stats-section">
                <div class="stats-label">Best:</div>
                <div class="stats-values">
                    ${formatTime(jacobiStats.best.time)} / ${formatMemory(jacobiStats.best.memory)} / ${formatCPU(jacobiStats.best.avgTimePerIter)}
                </div>
            </div>
            <div class="stats-section">
                <div class="stats-label">Worst:</div>
                <div class="stats-values">
                    ${formatTime(jacobiStats.worst.time)} / ${formatMemory(jacobiStats.worst.memory)} / ${formatCPU(jacobiStats.worst.avgTimePerIter)}
                </div>
            </div>
            <div class="stats-section">
                <div class="stats-label">Average:</div>
                <div class="stats-values">
                    ${formatTime(jacobiStats.average.time)} / ${formatMemory(jacobiStats.average.memory)} / ${formatCPU(jacobiStats.average.avgTimePerIter)}
                </div>
            </div>
        `;
    } else if (jacobiStatsEl) {
        jacobiStatsEl.innerHTML = '<div class="stats-empty">No history yet</div>';
    }
    
    if (gaussSeidelStatsEl && gaussSeidelStats) {
        gaussSeidelStatsEl.innerHTML = `
            <div class="stats-section">
                <div class="stats-label">Best:</div>
                <div class="stats-values">
                    ${formatTime(gaussSeidelStats.best.time)} / ${formatMemory(gaussSeidelStats.best.memory)} / ${formatCPU(gaussSeidelStats.best.avgTimePerIter)}
                </div>
            </div>
            <div class="stats-section">
                <div class="stats-label">Worst:</div>
                <div class="stats-values">
                    ${formatTime(gaussSeidelStats.worst.time)} / ${formatMemory(gaussSeidelStats.worst.memory)} / ${formatCPU(gaussSeidelStats.worst.avgTimePerIter)}
                </div>
            </div>
            <div class="stats-section">
                <div class="stats-label">Average:</div>
                <div class="stats-values">
                    ${formatTime(gaussSeidelStats.average.time)} / ${formatMemory(gaussSeidelStats.average.memory)} / ${formatCPU(gaussSeidelStats.average.avgTimePerIter)}
                </div>
            </div>
        `;
    } else if (gaussSeidelStatsEl) {
        gaussSeidelStatsEl.innerHTML = '<div class="stats-empty">No history yet</div>';
    }
}

