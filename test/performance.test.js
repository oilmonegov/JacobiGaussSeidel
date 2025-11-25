/**
 * Tests for performance measurement utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getMemoryUsage,
    startMeasurement,
    updateMeasurement,
    completeMeasurement,
    resetCurrentRun,
    calculateStats
} from '../src/utils/performance.js';

describe('Performance: Memory Usage', () => {
    beforeEach(() => {
        // Reset performance.memory mock
        global.performance = global.performance || {};
        global.performance.memory = undefined;
    });

    it('should return memory in bytes when available', () => {
        global.performance.memory = {
            usedJSHeapSize: 10 * 1024 * 1024 // 10 MB in bytes
        };
        
        const memory = getMemoryUsage();
        
        expect(memory).toBe(10 * 1024 * 1024);
    });

    it('should return null when memory API unavailable', () => {
        global.performance.memory = undefined;
        
        const memory = getMemoryUsage();
        
        expect(memory).toBeNull();
    });

    it('should handle zero memory', () => {
        global.performance.memory = {
            usedJSHeapSize: 0
        };
        
        const memory = getMemoryUsage();
        
        // Zero is a valid memory value (0 bytes), not an unavailable API
        expect(memory).toBe(0);
    });
});

describe('Performance: Measurement Lifecycle', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            performanceHistory: {}
        };
        
        // Mock performance.now
        global.performance = global.performance || {};
        global.performance.now = vi.fn(() => 1000);
        global.performance.memory = {
            usedJSHeapSize: 5 * 1024 * 1024 // 5 MB in bytes
        };
    });

    describe('startMeasurement', () => {
        it('should initialize measurement for method', () => {
            startMeasurement('jacobi', mockState);
            
            expect(mockState.performanceHistory.jacobi).toBeDefined();
            expect(mockState.performanceHistory.jacobi.currentRun).toBeDefined();
            expect(mockState.performanceHistory.jacobi.currentRun.startTime).toBe(1000);
        });

        it('should not restart if already measuring', () => {
            startMeasurement('jacobi', mockState);
            const firstRun = mockState.performanceHistory.jacobi.currentRun;
            
            global.performance.now = vi.fn(() => 2000);
            startMeasurement('jacobi', mockState);
            
            expect(mockState.performanceHistory.jacobi.currentRun).toBe(firstRun);
            expect(mockState.performanceHistory.jacobi.currentRun.startTime).toBe(1000);
        });

        it('should initialize separate measurements for different methods', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            startMeasurement('gaussSeidel', mockState);
            
            expect(mockState.performanceHistory.jacobi.currentRun.startTime).toBe(1000);
            expect(mockState.performanceHistory.gaussSeidel.currentRun.startTime).toBe(2000);
        });
    });

    describe('updateMeasurement', () => {
        it('should update measurement during iteration', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000); // 1 second later
            
            updateMeasurement('jacobi', 5, mockState);
            
            const currentRun = mockState.performanceHistory.jacobi.currentRun;
            expect(currentRun.iteration).toBe(5);
            expect(currentRun.elapsedTime).toBeCloseTo(1.0, 2);
            expect(currentRun.avgTimePerIteration).toBeCloseTo(200, 0); // 1000ms / 5 iterations
        });

        it('should not update if measurement not started', () => {
            updateMeasurement('jacobi', 5, mockState);
            
            expect(mockState.performanceHistory.jacobi).toBeUndefined();
        });

        it('should handle zero iterations', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            
            updateMeasurement('jacobi', 0, mockState);
            
            const currentRun = mockState.performanceHistory.jacobi.currentRun;
            expect(currentRun.avgTimePerIteration).toBe(0);
        });

        it('should validate and sanitize values', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            
            updateMeasurement('jacobi', -5, mockState); // Negative iteration
            
            const currentRun = mockState.performanceHistory.jacobi.currentRun;
            expect(currentRun.iteration).toBeGreaterThanOrEqual(0);
        });
    });

    describe('completeMeasurement', () => {
        it('should complete measurement and add to history', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            updateMeasurement('jacobi', 10, mockState);
            
            completeMeasurement('jacobi', 10, mockState);
            
            expect(mockState.performanceHistory.jacobi.runs).toHaveLength(1);
            expect(mockState.performanceHistory.jacobi.runs[0].iterations).toBe(10);
            expect(mockState.performanceHistory.jacobi.runs[0].timeToConverge).toBeCloseTo(1.0, 2);
            expect(mockState.performanceHistory.jacobi.runs[0].timestamp).toBeDefined();
            expect(mockState.performanceHistory.jacobi.currentRun).toBeNull();
        });

        it('should not complete if measurement not started', () => {
            completeMeasurement('jacobi', 10, mockState);
            
            expect(mockState.performanceHistory.jacobi).toBeUndefined();
        });

        it('should validate values before storing', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            
            completeMeasurement('jacobi', -10, mockState); // Negative iterations
            
            const run = mockState.performanceHistory.jacobi.runs[0];
            expect(run.iterations).toBeGreaterThanOrEqual(0);
        });

        it('should handle null memory values', () => {
            global.performance.memory = undefined;
            
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            completeMeasurement('jacobi', 10, mockState);
            
            const run = mockState.performanceHistory.jacobi.runs[0];
            expect(run.memoryUsed).toBeNull();
        });
    });

    describe('resetCurrentRun', () => {
        it('should reset current run without affecting history', () => {
            startMeasurement('jacobi', mockState);
            global.performance.now = vi.fn(() => 2000);
            completeMeasurement('jacobi', 10, mockState);
            
            const historyLength = mockState.performanceHistory.jacobi.runs.length;
            resetCurrentRun('jacobi', mockState);
            
            expect(mockState.performanceHistory.jacobi.currentRun).toBeNull();
            expect(mockState.performanceHistory.jacobi.runs.length).toBe(historyLength);
        });

        it('should handle reset when no measurement exists', () => {
            expect(() => resetCurrentRun('jacobi', mockState)).not.toThrow();
        });
    });
});

describe('Performance: Statistics', () => {
    describe('calculateStats', () => {
        it('should return null for empty runs', () => {
            const stats = calculateStats([]);
            
            expect(stats).toBeNull();
        });

        it('should return same values for single run', () => {
            const runs = [{
                iterations: 10,
                timeToConverge: 0.5,
                memoryUsed: 5242880, // 5 MB in bytes
                avgTimePerIteration: 50.0
            }];
            
            const stats = calculateStats(runs);
            
            expect(stats.best.time).toBe(0.5);
            expect(stats.worst.time).toBe(0.5);
            expect(stats.average.time).toBe(0.5);
            expect(stats.best.iterations).toBe(10);
            expect(stats.worst.iterations).toBe(10);
            expect(stats.average.iterations).toBe(10);
        });

        it('should calculate best/worst/average for multiple runs', () => {
            const runs = [
                {
                    iterations: 10,
                    timeToConverge: 0.1,
                    memoryUsed: 5242880, // 5 MB in bytes
                    avgTimePerIteration: 10.0
                },
                {
                    iterations: 15,
                    timeToConverge: 0.2,
                    memoryUsed: 6291456, // 6 MB in bytes
                    avgTimePerIteration: 13.3
                },
                {
                    iterations: 8,
                    timeToConverge: 0.05,
                    memoryUsed: 4194304, // 4 MB in bytes
                    avgTimePerIteration: 6.25
                }
            ];
            
            const stats = calculateStats(runs);
            
            // Best should be minimum
            expect(stats.best.time).toBe(0.05);
            expect(stats.best.iterations).toBe(8);
            expect(stats.best.memory).toBe(4194304); // 4 MB
            expect(stats.best.avgTimePerIter).toBe(6.25);
            
            // Worst should be maximum
            expect(stats.worst.time).toBe(0.2);
            expect(stats.worst.iterations).toBe(15);
            expect(stats.worst.memory).toBe(6291456); // 6 MB
            expect(stats.worst.avgTimePerIter).toBe(13.3);
            
            // Average
            expect(stats.average.time).toBeCloseTo((0.1 + 0.2 + 0.05) / 3, 3);
            expect(stats.average.iterations).toBeCloseTo((10 + 15 + 8) / 3, 1);
            expect(stats.average.memory).toBeCloseTo((5242880 + 6291456 + 4194304) / 3, 0);
        });

        it('should handle null memory values', () => {
            const runs = [
                {
                    iterations: 10,
                    timeToConverge: 0.1,
                    memoryUsed: null,
                    avgTimePerIteration: 10.0
                },
                {
                    iterations: 15,
                    timeToConverge: 0.2,
                    memoryUsed: 5242880, // 5 MB in bytes
                    avgTimePerIteration: 13.3
                }
            ];
            
            const stats = calculateStats(runs);
            
            // Should only use non-null values for memory stats
            expect(stats.best.memory).toBe(5242880); // 5 MB
            expect(stats.worst.memory).toBe(5242880); // 5 MB
            expect(stats.average.memory).toBe(5242880); // 5 MB
        });

        it('should handle all null memory values', () => {
            const runs = [
                {
                    iterations: 10,
                    timeToConverge: 0.1,
                    memoryUsed: null,
                    avgTimePerIteration: 10.0
                },
                {
                    iterations: 15,
                    timeToConverge: 0.2,
                    memoryUsed: null,
                    avgTimePerIteration: 13.3
                }
            ];
            
            const stats = calculateStats(runs);
            
            expect(stats.best.memory).toBeNull();
            expect(stats.worst.memory).toBeNull();
            expect(stats.average.memory).toBeNull();
        });

        it('should handle edge cases with Infinity', () => {
            const runs = [
                {
                    iterations: 10,
                    timeToConverge: Infinity,
                    memoryUsed: 5242880, // 5 MB in bytes
                    avgTimePerIteration: 10.0
                },
                {
                    iterations: 15,
                    timeToConverge: 0.2,
                    memoryUsed: 6291456, // 6 MB in bytes
                    avgTimePerIteration: 13.3
                }
            ];
            
            const stats = calculateStats(runs);
            
            // Should handle Infinity in calculations
            expect(stats.best.time).toBe(0.2);
            expect(stats.worst.time).toBe(Infinity);
        });
    });
});

