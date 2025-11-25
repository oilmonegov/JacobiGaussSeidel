/**
 * Tests for export utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    exportPerformanceToCSV,
    downloadCSV,
    generateFilename
} from '../src/utils/export.js';

// Mock equationVisualizer functions
vi.mock('../src/ui/equationVisualizer.js', () => ({
    generateMatrixForm: vi.fn((A, b, n) => `A \\cdot x = b`),
    generateOriginalEquations: vi.fn((A, b, x, n) => [
        { equation: '4x_1 - x_2 + x_3 = 7', evaluation: '4(1) - 2 + 3 = 5' }
    ]),
    generateJacobiFormulasWithValues: vi.fn((A, b, x, n) => [
        { formula: 'x_1 = ...', substitution: 'x_1 = ...', result: 'x_1 = 1.5' }
    ]),
    generateGaussSeidelFormulasWithValues: vi.fn((A, b, x, n) => [
        { formula: 'x_1 = ...', substitution: 'x_1 = ...', result: 'x_1 = 1.5' }
    ])
}));

describe('Export: CSV Export', () => {
    describe('exportPerformanceToCSV', () => {
        it('should export empty performance history', () => {
            const history = {
                jacobi: { runs: [] },
                gaussSeidel: { runs: [] }
            };
            
            const csv = exportPerformanceToCSV(history);
            
            expect(csv).toContain('Method,Run,Iterations,Time (s),Memory (MB),Avg Time/Iter (ms),Timestamp');
            expect(csv.split('\n').length).toBe(1); // Only header
        });

        it('should export single run for Jacobi', () => {
            const history = {
                jacobi: {
                    runs: [{
                        iterations: 10,
                        timeToConverge: 0.123,
                        memoryUsed: 5.67,
                        avgTimePerIteration: 12.3,
                        timestamp: '2024-01-01T12:00:00.000Z'
                    }]
                },
                gaussSeidel: { runs: [] }
            };
            
            const csv = exportPerformanceToCSV(history);
            const lines = csv.split('\n');
            
            expect(lines[0]).toContain('Method,Run,Iterations');
            expect(lines[1]).toContain('Jacobi');
            expect(lines[1]).toContain('1');
            expect(lines[1]).toContain('10');
            expect(lines[1]).toContain('0.123');
            expect(lines[1]).toContain('5.67');
        });

        it('should export multiple runs with statistics', () => {
            const history = {
                jacobi: {
                    runs: [
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
                    ]
                },
                gaussSeidel: { runs: [] }
            };
            
            const csv = exportPerformanceToCSV(history);
            const lines = csv.split('\n');
            
            // Should have header + 2 runs + 3 stats rows = 6 lines
            expect(lines.length).toBeGreaterThanOrEqual(6);
            
            // Check for statistics rows
            const csvText = csv.toLowerCase();
            expect(csvText).toContain('best');
            expect(csvText).toContain('worst');
            expect(csvText).toContain('average');
        });

        it('should handle null memory values', () => {
            const history = {
                jacobi: {
                    runs: [{
                        iterations: 10,
                        timeToConverge: 0.123,
                        memoryUsed: null,
                        avgTimePerIteration: 12.3,
                        timestamp: '2024-01-01T12:00:00.000Z'
                    }]
                },
                gaussSeidel: { runs: [] }
            };
            
            const csv = exportPerformanceToCSV(history);
            
            expect(csv).toContain('N/A');
        });

        it('should export both methods', () => {
            const history = {
                jacobi: {
                    runs: [{
                        iterations: 10,
                        timeToConverge: 0.1,
                        memoryUsed: 5.0,
                        avgTimePerIteration: 10.0,
                        timestamp: '2024-01-01T12:00:00.000Z'
                    }]
                },
                gaussSeidel: {
                    runs: [{
                        iterations: 8,
                        timeToConverge: 0.08,
                        memoryUsed: 4.5,
                        avgTimePerIteration: 10.0,
                        timestamp: '2024-01-01T12:00:00.000Z'
                    }]
                }
            };
            
            const csv = exportPerformanceToCSV(history);
            
            expect(csv).toContain('Jacobi');
            expect(csv).toContain('Gauss-Seidel');
        });

        it('should escape CSV special characters', () => {
            const history = {
                jacobi: {
                    runs: [{
                        iterations: 10,
                        timeToConverge: 0.123,
                        memoryUsed: 5.67,
                        avgTimePerIteration: 12.3,
                        timestamp: '2024-01-01T12:00:00.000Z'
                    }]
                },
                gaussSeidel: { runs: [] }
            };
            
            const csv = exportPerformanceToCSV(history);
            
            // Should not have unescaped quotes or cause parsing issues
            expect(csv.split('\n').length).toBeGreaterThan(1);
        });
    });

    describe('downloadCSV', () => {
        beforeEach(() => {
            // Reset DOM
            document.body.innerHTML = '';
            
            // Mock URL.createObjectURL and URL.revokeObjectURL
            global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
            global.URL.revokeObjectURL = vi.fn();
        });

        it('should create download link and trigger click', () => {
            const csvContent = 'Header\nRow1,Row2';
            const filename = 'test.csv';
            
            // Mock link.click
            const mockClick = vi.fn();
            const originalCreateElement = document.createElement;
            document.createElement = vi.fn((tag) => {
                const element = originalCreateElement.call(document, tag);
                if (tag === 'a') {
                    element.click = mockClick;
                }
                return element;
            });
            
            downloadCSV(csvContent, filename);
            
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockClick).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            
            // Restore
            document.createElement = originalCreateElement;
        });

        it('should create blob with correct type', () => {
            const csvContent = 'test,content';
            const filename = 'test.csv';
            
            let capturedBlob = null;
            const originalBlob = global.Blob;
            global.Blob = vi.fn(function(content, options) {
                capturedBlob = { content, options };
                return new originalBlob(content, options);
            });
            
            const mockClick = vi.fn();
            const originalCreateElement = document.createElement;
            document.createElement = vi.fn((tag) => {
                const element = originalCreateElement.call(document, tag);
                if (tag === 'a') {
                    element.click = mockClick;
                }
                return element;
            });
            
            downloadCSV(csvContent, filename);
            
            expect(capturedBlob.options.type).toBe('text/csv;charset=utf-8;');
            
            // Restore
            global.Blob = originalBlob;
            document.createElement = originalCreateElement;
        });
    });

    describe('generateFilename', () => {
        it('should generate filename with timestamp', () => {
            const filename = generateFilename();
            
            expect(filename).toContain('performance-data-');
            expect(filename).toMatch(/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/);
        });

        it('should have correct format', () => {
            const filename = generateFilename();
            
            expect(filename.startsWith('performance-data-')).toBe(true);
            expect(filename.endsWith('.csv')).toBe(true);
        });
    });
});


