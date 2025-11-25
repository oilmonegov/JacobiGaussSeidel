/**
 * Tests for performance display utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updatePerformanceDisplay } from '../src/ui/performanceDisplay.js';
import { calculateStats } from '../src/utils/performance.js';

// Mock calculateStats
vi.mock('../src/utils/performance.js', () => ({
    calculateStats: vi.fn((runs) => {
        if (!runs || runs.length === 0) return null;
        if (runs.length === 1) {
            const run = runs[0];
            return {
                best: { time: run.timeToConverge, memory: run.memoryUsed, iterations: run.iterations, avgTimePerIter: run.avgTimePerIteration },
                worst: { time: run.timeToConverge, memory: run.memoryUsed, iterations: run.iterations, avgTimePerIter: run.avgTimePerIteration },
                average: { time: run.timeToConverge, memory: run.memoryUsed, iterations: run.iterations, avgTimePerIter: run.avgTimePerIteration }
            };
        }
        const times = runs.map(r => r.timeToConverge);
        const memories = runs.map(r => r.memoryUsed).filter(m => m !== null);
        const iterations = runs.map(r => r.iterations);
        const avgTimes = runs.map(r => r.avgTimePerIteration);
        return {
            best: {
                time: Math.min(...times),
                memory: memories.length > 0 ? Math.min(...memories) : null,
                iterations: Math.min(...iterations),
                avgTimePerIter: Math.min(...avgTimes)
            },
            worst: {
                time: Math.max(...times),
                memory: memories.length > 0 ? Math.max(...memories) : null,
                iterations: Math.max(...iterations),
                avgTimePerIter: Math.max(...avgTimes)
            },
            average: {
                time: times.reduce((a, b) => a + b, 0) / times.length,
                memory: memories.length > 0 ? memories.reduce((a, b) => a + b, 0) / memories.length : null,
                iterations: iterations.reduce((a, b) => a + b, 0) / iterations.length,
                avgTimePerIter: avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length
            }
        };
    })
}));

describe('Performance Display', () => {
    let mockElements;
    let mockState;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        
        // Create mock DOM elements
        const jacobiCurrent = document.createElement('div');
        jacobiCurrent.id = 'jacobiCurrent';
        document.body.appendChild(jacobiCurrent);
        
        const gaussSeidelCurrent = document.createElement('div');
        gaussSeidelCurrent.id = 'gaussSeidelCurrent';
        document.body.appendChild(gaussSeidelCurrent);
        
        const jacobiStats = document.createElement('div');
        jacobiStats.id = 'jacobiStats';
        document.body.appendChild(jacobiStats);
        
        const gaussSeidelStats = document.createElement('div');
        gaussSeidelStats.id = 'gaussSeidelStats';
        document.body.appendChild(gaussSeidelStats);
        
        const historicalStats = document.createElement('div');
        historicalStats.id = 'historicalStats';
        document.body.appendChild(historicalStats);
        
        mockElements = {
            jacobiCurrent,
            gaussSeidelCurrent,
            jacobiStats,
            gaussSeidelStats,
            historicalStats
        };
        
        mockState = {
            performanceHistory: {
                jacobi: { runs: [], currentRun: null },
                gaussSeidel: { runs: [], currentRun: null }
            }
        };
    });

    describe('updatePerformanceDisplay', () => {
        it('should display empty state when no measurements', () => {
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiCurrent = document.getElementById('jacobiCurrent');
            expect(jacobiCurrent.innerHTML).toContain('Time:');
            expect(jacobiCurrent.innerHTML).toContain('-');
        });

        it('should display current metrics for Jacobi', () => {
            mockState.performanceHistory.jacobi.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: 5.0,
                avgTimePerIteration: 50.0
            };
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiCurrent = document.getElementById('jacobiCurrent');
            expect(jacobiCurrent.innerHTML).toContain('0.500 s');
            expect(jacobiCurrent.innerHTML).toContain('5.00 MB');
            expect(jacobiCurrent.innerHTML).toContain('50.00 ms/iter');
        });

        it('should display current metrics for Gauss-Seidel', () => {
            mockState.performanceHistory.gaussSeidel.currentRun = {
                elapsedTime: 0.3,
                memoryUsed: 4.5,
                avgTimePerIteration: 30.0
            };
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const gaussSeidelCurrent = document.getElementById('gaussSeidelCurrent');
            expect(gaussSeidelCurrent.innerHTML).toContain('0.300 s');
            expect(gaussSeidelCurrent.innerHTML).toContain('4.50 MB');
            expect(gaussSeidelCurrent.innerHTML).toContain('30.00 ms/iter');
        });

        it('should handle null memory values', () => {
            mockState.performanceHistory.jacobi.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: null,
                avgTimePerIteration: 50.0
            };
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiCurrent = document.getElementById('jacobiCurrent');
            expect(jacobiCurrent.innerHTML).toContain('N/A');
        });

        it('should display historical stats when available', () => {
            mockState.performanceHistory.jacobi.runs = [{
                iterations: 10,
                timeToConverge: 0.5,
                memoryUsed: 5.0,
                avgTimePerIteration: 50.0,
                timestamp: '2024-01-01T12:00:00.000Z'
            }];
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiStats = document.getElementById('jacobiStats');
            expect(jacobiStats.innerHTML).toContain('Best:');
            expect(jacobiStats.innerHTML).toContain('Worst:');
            expect(jacobiStats.innerHTML).toContain('Average:');
        });

        it('should display empty message when no history', () => {
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiStats = document.getElementById('jacobiStats');
            expect(jacobiStats.innerHTML).toContain('No history yet');
        });

        it('should show/hide historical stats section', () => {
            const historicalStats = document.getElementById('historicalStats');
            historicalStats.style.display = 'none';
            
            // No history - should stay hidden
            updatePerformanceDisplay(mockElements, mockState);
            expect(historicalStats.style.display).toBe('none');
            
            // Add history - should show
            mockState.performanceHistory.jacobi.runs = [{
                iterations: 10,
                timeToConverge: 0.5,
                memoryUsed: 5.0,
                avgTimePerIteration: 50.0,
                timestamp: '2024-01-01T12:00:00.000Z'
            }];
            
            updatePerformanceDisplay(mockElements, mockState);
            expect(historicalStats.style.display).toBe('block');
        });

        it('should highlight winner for time metric', () => {
            mockState.performanceHistory.jacobi.currentRun = {
                elapsedTime: 0.3,
                memoryUsed: 5.0,
                avgTimePerIteration: 30.0
            };
            mockState.performanceHistory.gaussSeidel.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: 6.0,
                avgTimePerIteration: 50.0
            };
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiCurrent = document.getElementById('jacobiCurrent');
            const gaussSeidelCurrent = document.getElementById('gaussSeidelCurrent');
            
            // Jacobi should have winner class (lower time)
            expect(jacobiCurrent.innerHTML).toContain('metric-winner');
            // Gauss-Seidel should not have winner class
            expect(gaussSeidelCurrent.innerHTML).not.toContain('metric-winner');
        });

        it('should highlight winner for memory metric', () => {
            mockState.performanceHistory.jacobi.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: 4.0,
                avgTimePerIteration: 50.0
            };
            mockState.performanceHistory.gaussSeidel.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: 6.0,
                avgTimePerIteration: 50.0
            };
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiCurrent = document.getElementById('jacobiCurrent');
            // Jacobi should have winner class for memory (lower is better)
            expect(jacobiCurrent.innerHTML).toContain('metric-winner');
        });

        it('should highlight winner for CPU metric', () => {
            mockState.performanceHistory.jacobi.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: 5.0,
                avgTimePerIteration: 30.0
            };
            mockState.performanceHistory.gaussSeidel.currentRun = {
                elapsedTime: 0.5,
                memoryUsed: 5.0,
                avgTimePerIteration: 50.0
            };
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiCurrent = document.getElementById('jacobiCurrent');
            // Jacobi should have winner class for CPU (lower is better)
            expect(jacobiCurrent.innerHTML).toContain('metric-winner');
        });

        it('should handle missing DOM elements gracefully', () => {
            document.body.innerHTML = ''; // Remove all elements
            
            expect(() => {
                updatePerformanceDisplay(mockElements, mockState);
            }).not.toThrow();
        });

        it('should format statistics correctly', () => {
            mockState.performanceHistory.jacobi.runs = [
                {
                    iterations: 10,
                    timeToConverge: 0.1,
                    memoryUsed: 5.0,
                    avgTimePerIteration: 10.0,
                    timestamp: '2024-01-01T12:00:00.000Z'
                },
                {
                    iterations: 15,
                    timeToConverge: 0.2,
                    memoryUsed: 6.0,
                    avgTimePerIteration: 13.3,
                    timestamp: '2024-01-01T12:01:00.000Z'
                }
            ];
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiStats = document.getElementById('jacobiStats');
            expect(jacobiStats.innerHTML).toContain('Best:');
            expect(jacobiStats.innerHTML).toContain('Worst:');
            expect(jacobiStats.innerHTML).toContain('Average:');
            // Should contain formatted numbers
            expect(jacobiStats.innerHTML).toMatch(/\d+\.\d{3} s/); // Time format
        });

        it('should handle both methods with history', () => {
            mockState.performanceHistory.jacobi.runs = [{
                iterations: 10,
                timeToConverge: 0.5,
                memoryUsed: 5.0,
                avgTimePerIteration: 50.0,
                timestamp: '2024-01-01T12:00:00.000Z'
            }];
            mockState.performanceHistory.gaussSeidel.runs = [{
                iterations: 8,
                timeToConverge: 0.4,
                memoryUsed: 4.5,
                avgTimePerIteration: 50.0,
                timestamp: '2024-01-01T12:00:00.000Z'
            }];
            
            updatePerformanceDisplay(mockElements, mockState);
            
            const jacobiStats = document.getElementById('jacobiStats');
            const gaussSeidelStats = document.getElementById('gaussSeidelStats');
            
            expect(jacobiStats.innerHTML).not.toContain('No history yet');
            expect(gaussSeidelStats.innerHTML).not.toContain('No history yet');
        });
    });
});

