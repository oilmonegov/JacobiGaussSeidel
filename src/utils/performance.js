/**
 * Performance Measurement Module
 * 
 * Tracks time, memory, and CPU usage for iteration methods
 */

/**
 * Get current memory usage in MB
 * @returns {number|null} Memory in MB or null if API unavailable
 */
export function getMemoryUsage() {
    if (performance.memory && typeof performance.memory.usedJSHeapSize === 'number') {
        return performance.memory.usedJSHeapSize / 1024 / 1024;
    }
    return null;
}

/**
 * Start performance measurement for a method
 * @param {string} method - 'jacobi' or 'gaussSeidel'
 * @param {Object} state - Application state
 */
export function startMeasurement(method, state) {
    if (!state.performanceHistory[method]) {
        state.performanceHistory[method] = { runs: [], currentRun: null };
    }
    
    const perf = state.performanceHistory[method];
    
    // Don't restart if already measuring
    if (perf.currentRun && perf.currentRun.startTime) {
        return;
    }
    
    const startTime = performance.now();
    const startMemory = getMemoryUsage();
    
    perf.currentRun = {
        startTime,
        startMemory,
        lastUpdateTime: startTime,
        lastUpdateMemory: startMemory,
        iteration: 0
    };
}

/**
 * Validate and sanitize a numeric value
 * @param {number} value - Value to validate
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Validated value
 */
function validateNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || !isFinite(value) || isNaN(value)) {
        return defaultValue;
    }
    // Ensure non-negative for time and iterations
    return Math.max(0, value);
}

/**
 * Update performance measurement during iteration
 * @param {string} method - 'jacobi' or 'gaussSeidel'
 * @param {number} iteration - Current iteration count
 * @param {Object} state - Application state
 */
export function updateMeasurement(method, iteration, state) {
    if (!state.performanceHistory[method]) {
        return;
    }
    
    const perf = state.performanceHistory[method];
    const currentRun = perf.currentRun;
    
    if (!currentRun || !currentRun.startTime) {
        return;
    }
    
    const now = performance.now();
    const currentMemory = getMemoryUsage();
    const elapsedTime = (now - currentRun.startTime) / 1000; // Convert to seconds
    const memoryUsed = currentMemory !== null && currentRun.startMemory !== null
        ? currentMemory - currentRun.startMemory
        : null;
    const avgTimePerIteration = iteration > 0 ? elapsedTime / iteration * 1000 : 0; // ms per iteration
    
    // Validate all values
    const validatedIteration = validateNumber(iteration, 0);
    const validatedElapsedTime = validateNumber(elapsedTime, 0);
    const validatedMemoryUsed = memoryUsed !== null ? validateNumber(memoryUsed, null) : null;
    const validatedAvgTime = validateNumber(avgTimePerIteration, 0);
    
    currentRun.lastUpdateTime = now;
    currentRun.lastUpdateMemory = currentMemory;
    currentRun.iteration = validatedIteration;
    currentRun.elapsedTime = validatedElapsedTime;
    currentRun.memoryUsed = validatedMemoryUsed;
    currentRun.avgTimePerIteration = validatedAvgTime;
}

/**
 * Complete performance measurement and store in history
 * @param {string} method - 'jacobi' or 'gaussSeidel'
 * @param {number} iteration - Final iteration count
 * @param {Object} state - Application state
 */
export function completeMeasurement(method, iteration, state) {
    if (!state.performanceHistory[method]) {
        return;
    }
    
    const perf = state.performanceHistory[method];
    const currentRun = perf.currentRun;
    
    if (!currentRun || !currentRun.startTime) {
        return;
    }
    
    const now = performance.now();
    const finalTime = (now - currentRun.startTime) / 1000; // Convert to seconds
    const finalMemory = getMemoryUsage();
    const memoryUsed = finalMemory !== null && currentRun.startMemory !== null
        ? finalMemory - currentRun.startMemory
        : null;
    const avgTimePerIteration = iteration > 0 ? finalTime / iteration * 1000 : 0; // ms per iteration
    
    // Validate all values before storing
    const validatedIteration = validateNumber(iteration, 0);
    const validatedFinalTime = validateNumber(finalTime, 0);
    const validatedMemoryUsed = memoryUsed !== null ? validateNumber(memoryUsed, null) : null;
    const validatedAvgTime = validateNumber(avgTimePerIteration, 0);
    
    // Create completed run object with validated values
    const completedRun = {
        iterations: validatedIteration,
        timeToConverge: validatedFinalTime,
        memoryUsed: validatedMemoryUsed,
        avgTimePerIteration: validatedAvgTime,
        timestamp: new Date().toISOString()
    };
    
    // Add to history
    if (!perf.runs) {
        perf.runs = [];
    }
    perf.runs.push(completedRun);
    
    // Clear current run
    perf.currentRun = null;
}

/**
 * Reset current run without affecting history
 * @param {string} method - 'jacobi' or 'gaussSeidel'
 * @param {Object} state - Application state
 */
export function resetCurrentRun(method, state) {
    if (!state.performanceHistory[method]) {
        return;
    }
    
    const perf = state.performanceHistory[method];
    perf.currentRun = null;
}

/**
 * Migrate bytes to MB for historical data
 * Detects if a memory value is in bytes format (large number >= 1MB) and converts to MB
 * @param {number|null} memoryValue - Memory value to potentially migrate
 * @returns {number|null} Memory value in MB
 */
function migrateBytesToMB(memoryValue) {
    if (memoryValue === null || memoryValue === undefined || !isFinite(memoryValue)) {
        return memoryValue;
    }
    
    // If memory value is greater than or equal to 1MB (1,048,576 bytes), it's likely in bytes format
    // Real memory usage in MB is typically in the range of 1-1000 MB, so values >= 1MB are likely bytes
    const ONE_MB_IN_BYTES = 1024 * 1024;
    if (memoryValue >= ONE_MB_IN_BYTES) {
        // Convert from bytes to MB
        return memoryValue / ONE_MB_IN_BYTES;
    }
    
    return memoryValue;
}

/**
 * Calculate statistics from run history
 * @param {Array} runs - Array of completed runs
 * @returns {Object|null} Statistics object or null if no runs
 */
export function calculateStats(runs) {
    if (!runs || runs.length === 0) {
        return null;
    }
    
    if (runs.length === 1) {
        const run = runs[0];
        const migratedMemory = migrateBytesToMB(run.memoryUsed);
        return {
            best: {
                time: run.timeToConverge,
                memory: migratedMemory,
                iterations: run.iterations,
                avgTimePerIter: run.avgTimePerIteration
            },
            worst: {
                time: run.timeToConverge,
                memory: migratedMemory,
                iterations: run.iterations,
                avgTimePerIter: run.avgTimePerIteration
            },
            average: {
                time: run.timeToConverge,
                memory: migratedMemory,
                iterations: run.iterations,
                avgTimePerIter: run.avgTimePerIteration
            }
        };
    }
    
    // Calculate best (minimum) and worst (maximum)
    let bestTime = Infinity;
    let worstTime = -Infinity;
    let bestMemory = Infinity;
    let worstMemory = -Infinity;
    let bestIterations = Infinity;
    let worstIterations = -Infinity;
    let bestAvgTime = Infinity;
    let worstAvgTime = -Infinity;
    
    let sumTime = 0;
    let sumMemory = 0;
    let sumIterations = 0;
    let sumAvgTime = 0;
    let countMemory = 0;
    
    runs.forEach(run => {
        // Time
        if (run.timeToConverge < bestTime) bestTime = run.timeToConverge;
        if (run.timeToConverge > worstTime) worstTime = run.timeToConverge;
        sumTime += run.timeToConverge;
        
        // Memory (only if available) - migrate bytes to MB
        if (run.memoryUsed !== null) {
            const migratedMemory = migrateBytesToMB(run.memoryUsed);
            if (migratedMemory < bestMemory) bestMemory = migratedMemory;
            if (migratedMemory > worstMemory) worstMemory = migratedMemory;
            sumMemory += migratedMemory;
            countMemory++;
        }
        
        // Iterations
        if (run.iterations < bestIterations) bestIterations = run.iterations;
        if (run.iterations > worstIterations) worstIterations = run.iterations;
        sumIterations += run.iterations;
        
        // Avg time per iteration
        if (run.avgTimePerIteration < bestAvgTime) bestAvgTime = run.avgTimePerIteration;
        if (run.avgTimePerIteration > worstAvgTime) worstAvgTime = run.avgTimePerIteration;
        sumAvgTime += run.avgTimePerIteration;
    });
    
    return {
        best: {
            time: bestTime,
            memory: countMemory > 0 ? bestMemory : null,
            iterations: bestIterations,
            avgTimePerIter: bestAvgTime
        },
        worst: {
            time: worstTime,
            memory: countMemory > 0 ? worstMemory : null,
            iterations: worstIterations,
            avgTimePerIter: worstAvgTime
        },
        average: {
            time: sumTime / runs.length,
            memory: countMemory > 0 ? sumMemory / countMemory : null,
            iterations: sumIterations / runs.length,
            avgTimePerIter: sumAvgTime / runs.length
        }
    };
}

