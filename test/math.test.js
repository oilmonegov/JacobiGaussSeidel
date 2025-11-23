/**
 * Tests for math engine functions
 * Tests Jacobi iteration, error calculations, and convergence logic
 * 
 * Note: This file maintains backward compatibility with existing test IDs (MATH-001, etc.)
 * Additional comprehensive tests are in core.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateErrors, getMaxError, getConvergenceState, clamp } from '../src/core/math.js';
import { computeNextJacobi } from '../src/core/jacobi.js';

// Mock the global state object
const mockState = {
  n: 3,
  A: [
    [4, -1, 1],
    [4, -8, 1],
    [-2, 1, 5]
  ],
  b: [7, -21, 15],
  x: [1.0, 2.0, 2.0]
};

describe('Math Engine', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle NaN', () => {
      expect(clamp(NaN, -10, 10)).toBe(0);
    });

    it('should handle Infinity', () => {
      expect(clamp(Infinity, -10, 10)).toBe(0);
      expect(clamp(-Infinity, -10, 10)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(clamp(10, 0, 10)).toBe(10);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(-10, -10, 10)).toBe(-10);
    });
  });

  describe('computeNextJacobi', () => {
    it('MATH-001: should compute correct initial state', () => {
      const x = [1.0, 2.0, 2.0];
      const result = computeNextJacobi(x, mockState.A, mockState.b);
      
      // Expected: x₁ = (7 + 2 - 2)/4 = 1.75
      //           x₂ = (21 + 4*1 + 2)/8 = 3.375
      //           x₃ = (15 + 2*1 - 2)/5 = 3.0
      expect(result[0]).toBeCloseTo(1.75, 2);
      expect(result[1]).toBeCloseTo(3.375, 2);
      expect(result[2]).toBeCloseTo(3.0, 2);
    });

    it('MATH-002: should compute step 1 correctly', () => {
      const x = [1.0, 2.0, 2.0];
      const result = computeNextJacobi(x, mockState.A, mockState.b);
      
      expect(result[0]).toBeCloseTo(1.75, 2);
      expect(result[1]).toBeCloseTo(3.375, 2);
      expect(result[2]).toBeCloseTo(3.0, 2);
    });

    it('MATH-003: should compute step 2 correctly', () => {
      const x1 = [1.0, 2.0, 2.0];
      const x2 = computeNextJacobi(x1, mockState.A, mockState.b);
      const x3 = computeNextJacobi(x2, mockState.A, mockState.b);
      
      // After step 1: [1.75, 3.375, 3.0]
      // Step 2: x₁ = (7 + 3.375 - 3)/4 ≈ 1.84
      //         x₂ = (21 + 4*1.75 + 3)/8 = 3.875
      //         x₃ = (15 + 2*1.75 - 3.375)/5 = 3.025
      expect(x3[0]).toBeCloseTo(1.84, 2);
      expect(x3[1]).toBeCloseTo(3.875, 2);
      expect(x3[2]).toBeCloseTo(3.025, 2);
    });

    it('MATH-004: should converge to true solution', () => {
      const trueSolution = [2, 4, 3];
      const result = computeNextJacobi(trueSolution, mockState.A, mockState.b);
      
      // When at true solution, next iteration should be the same (or very close)
      expect(result[0]).toBeCloseTo(2, 2);
      expect(result[1]).toBeCloseTo(4, 2);
      expect(result[2]).toBeCloseTo(3, 2);
    });

    it('should handle zero diagonal gracefully', () => {
      const A = [[0, 1], [1, 1]];
      const b = [1, 2];
      const x = [1, 1];
      const result = computeNextJacobi(x, A, b);
      
      // Should keep current value when diagonal is zero
      expect(result[0]).toBe(1);
    });

    it('should handle NaN results', () => {
      const A = [[1, 1], [1, 1]];
      const b = [1, 2];
      const x = [Infinity, 1];
      const result = computeNextJacobi(x, A, b);
      
      // Should fallback to current value for invalid results
      expect(isFinite(result[0])).toBe(true);
    });
  });

  describe('calculateErrors', () => {
    it('MATH-005: should calculate error for equation 1', () => {
      const x = [0, 0, 0];
      const errors = calculateErrors(x, mockState.A, mockState.b);
      
      // LHS = 4*0 - 1*0 + 1*0 = 0
      // RHS = 7
      // Error = 0 - 7 = -7
      expect(errors.eq1.lhs).toBe(0);
      expect(errors.eq1.rhs).toBe(7);
      expect(errors.eq1.error).toBe(-7);
    });

    it('MATH-006: should calculate error for equation 2', () => {
      const x = [0, 0, 0];
      const errors = calculateErrors(x, mockState.A, mockState.b);
      
      // LHS = 4*0 - 8*0 + 1*0 = 0
      // RHS = -21
      // Error = 0 - (-21) = 21
      expect(errors.eq2.lhs).toBe(0);
      expect(errors.eq2.rhs).toBe(-21);
      expect(errors.eq2.error).toBe(21);
    });

    it('MATH-007: should calculate error for equation 3', () => {
      const x = [0, 0, 0];
      const errors = calculateErrors(x, mockState.A, mockState.b);
      
      // LHS = -2*0 + 1*0 + 5*0 = 0
      // RHS = 15
      // Error = 0 - 15 = -15
      expect(errors.eq3.lhs).toBe(0);
      expect(errors.eq3.rhs).toBe(15);
      expect(errors.eq3.error).toBe(-15);
    });

    it('MATH-004: should show zero error at true solution', () => {
      const trueSolution = [2, 4, 3];
      const errors = calculateErrors(trueSolution, mockState.A, mockState.b);
      
      expect(errors.eq1.error).toBeCloseTo(0, 5);
      expect(errors.eq2.error).toBeCloseTo(0, 5);
      expect(errors.eq3.error).toBeCloseTo(0, 5);
    });
  });

  describe('getMaxError', () => {
    it('MATH-008: should return maximum absolute error', () => {
      const errors = {
        eq1: { error: -7 },
        eq2: { error: 21 },
        eq3: { error: -15 }
      };
      
      expect(getMaxError(errors)).toBe(21);
    });

    it('should handle single equation', () => {
      const errors = {
        eq1: { error: 5 }
      };
      
      expect(getMaxError(errors)).toBe(5);
    });

    it('should handle zero errors', () => {
      const errors = {
        eq1: { error: 0 },
        eq2: { error: 0 }
      };
      
      expect(getMaxError(errors)).toBe(0);
    });

    it('should ignore invalid error values', () => {
      const errors = {
        eq1: { error: 5 },
        eq2: { error: null },
        eq3: { error: 10 }
      };
      
      expect(getMaxError(errors)).toBe(10);
    });
  });

  describe('getConvergenceState', () => {
    it('MATH-013: should return "Unbalanced" for high error', () => {
      const state = getConvergenceState(1.01);
      expect(state.state).toBe('Unbalanced');
      expect(state.color).toBe('var(--red)');
    });

    it('MATH-014: should return "Balancing" for medium error', () => {
      const state = getConvergenceState(0.5);
      expect(state.state).toBe('Balancing');
      expect(state.color).toBe('var(--amber)');
    });

    it('MATH-015: should return "Nearly Balanced" for low error', () => {
      const state = getConvergenceState(0.05);
      expect(state.state).toBe('Nearly Balanced');
      expect(state.color).toBe('var(--vintage-green)');
    });

    it('MATH-016: should return "Perfectly Balanced" for very low error', () => {
      const state = getConvergenceState(0.00005);
      expect(state.state).toBe('Perfectly Balanced');
      expect(state.color).toBe('var(--vintage-green)');
    });

    it('should handle boundary values', () => {
      // 1.0 is not < 1.0, so it's "Unbalanced"
      expect(getConvergenceState(1.0).state).toBe('Unbalanced');
      expect(getConvergenceState(0.1).state).toBe('Balancing');
      expect(getConvergenceState(0.0001).state).toBe('Nearly Balanced');
    });
  });

  describe('Integration: Full iteration cycle', () => {
    it('should converge over multiple iterations', () => {
      let x = [1.0, 2.0, 2.0];
      let maxError = Infinity;
      let iterations = 0;
      
      while (maxError > 0.0001 && iterations < 100) {
        x = computeNextJacobi(x, mockState.A, mockState.b);
        const errors = calculateErrors(x, mockState.A, mockState.b);
        maxError = getMaxError(errors);
        iterations++;
      }
      
      expect(maxError).toBeLessThan(0.0001);
      expect(x[0]).toBeCloseTo(2, 2);
      expect(x[1]).toBeCloseTo(4, 2);
      expect(x[2]).toBeCloseTo(3, 2);
    });
  });
});

