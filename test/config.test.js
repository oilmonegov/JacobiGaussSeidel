/**
 * Tests for config modules: equationParser.js
 */

import { describe, it, expect } from 'vitest';
import { parseEquations, parseEquation, extractCoefficients, validateEquationFormat } from '../src/config/equationParser.js';

describe('Config: Equation Parser', () => {
  describe('parseEquation', () => {
    it('should parse simple equation', () => {
      const result = parseEquation('4x1 - x2 + x3 = 7');
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('coeffs');
      expect(result).toHaveProperty('b');
      expect(result.b).toBe(7);
    });

    it('should parse equation with coefficients', () => {
      const result = parseEquation('4x1-x2+x3 = 7');
      
      expect(result.coeffs[1]).toBe(4);
      expect(result.coeffs[2]).toBe(-1);
      expect(result.coeffs[3]).toBe(1);
    });

    it('should parse equation with implicit coefficient 1', () => {
      const result = parseEquation('x1 + x2 = 3');
      
      expect(result.coeffs[1]).toBe(1);
      expect(result.coeffs[2]).toBe(1);
    });

    it('should parse negative constant', () => {
      const result = parseEquation('x1 = -5');
      
      expect(result.b).toBe(-5);
    });

    it('should return null for invalid format', () => {
      expect(parseEquation('not an equation')).toBeNull();
      expect(parseEquation('x1 + x2')).toBeNull(); // No = sign
      expect(parseEquation('')).toBeNull();
      expect(parseEquation(null)).toBeNull();
    });

    it('should return null for non-numeric constant', () => {
      expect(parseEquation('x1 = abc')).toBeNull();
    });
  });

  describe('extractCoefficients', () => {
    it('should extract coefficients from equation', () => {
      const result = extractCoefficients('4x1-x2+x3');
      
      expect(result[1]).toBe(4);
      expect(result[2]).toBe(-1);
      expect(result[3]).toBe(1);
    });

    it('should handle implicit coefficient 1', () => {
      const result = extractCoefficients('x1 + x2');
      
      expect(result[1]).toBe(1);
      expect(result[2]).toBe(1);
    });

    it('should handle negative coefficients', () => {
      const result = extractCoefficients('-2x1-3x2');
      
      expect(result[1]).toBe(-2);
      expect(result[2]).toBe(-3);
    });

    it('should accumulate coefficients for same variable', () => {
      const result = extractCoefficients('x1 + 2x1');
      
      expect(result[1]).toBe(3);
    });

    it('should handle decimal coefficients', () => {
      const result = extractCoefficients('1.5x1 + 2.5x2');
      
      expect(result[1]).toBeCloseTo(1.5, 5);
      expect(result[2]).toBeCloseTo(2.5, 5);
    });

    it('should handle different variable names', () => {
      const result = extractCoefficients('4a1-b2+c3');
      
      expect(result[1]).toBe(4);
      expect(result[2]).toBe(-1);
      expect(result[3]).toBe(1);
    });

    it('should return empty object for no matches', () => {
      const result = extractCoefficients('no variables here');
      
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('parseEquations', () => {
    it('should parse multiple equations', () => {
      const text = `4x1 - x2 + x3 = 7
4x1 - 8x2 + x3 = -21
-2x1 + x2 + 5x3 = 15`;
      
      const result = parseEquations(text);
      
      expect(result).not.toBeNull();
      expect(result.n).toBe(3);
      expect(result.A.length).toBe(3);
      expect(result.b.length).toBe(3);
    });

    it('should build correct coefficient matrix', () => {
      const text = `4x1-x2+x3 = 7
4x1-8x2+x3 = -21
-2x1+x2+5x3 = 15`;
      
      const result = parseEquations(text);
      
      expect(result.A[0][0]).toBe(4);
      expect(result.A[0][1]).toBe(-1);
      expect(result.A[0][2]).toBe(1);
      expect(result.A[1][1]).toBe(-8);
    });

    it('should build correct constant vector', () => {
      const text = `x1 = 7
x2 = -21
x3 = 15`;
      
      const result = parseEquations(text);
      
      expect(result.b[0]).toBe(7);
      expect(result.b[1]).toBe(-21);
      expect(result.b[2]).toBe(15);
    });

    it('should handle empty text', () => {
      expect(parseEquations('')).toBeNull();
      expect(parseEquations(null)).toBeNull();
    });

    it('should handle invalid equation in text', () => {
      const text = `4x1 - x2 + x3 = 7
invalid equation
-2x1 + x2 + 5x3 = 15`;
      
      expect(parseEquations(text)).toBeNull();
    });

    it('should trim whitespace from lines', () => {
      const text = `  4x1-x2 = 7  
  4x1-8x2 = -21  `;
      
      const result = parseEquations(text);
      
      expect(result).not.toBeNull();
      expect(result.n).toBe(2);
    });

    it('should ignore empty lines', () => {
      const text = `4x1-x2 = 7

4x1-8x2 = -21`;
      
      const result = parseEquations(text);
      
      expect(result).not.toBeNull();
      // System size is max of equation count and max variable index
      // 2 equations with x1 and x2, so n = 2
      expect(result.n).toBe(2);
    });

    it('should handle 2x2 system', () => {
      const text = `2x1 + x2 = 3
x1 + 2x2 = 3`;
      
      const result = parseEquations(text);
      
      expect(result.n).toBe(2);
      expect(result.A.length).toBe(2);
      expect(result.A[0].length).toBe(2);
    });
  });

  describe('validateEquationFormat', () => {
    it('should validate correct equation format', () => {
      expect(validateEquationFormat('4x1 - x2 + x3 = 7')).toBe(true);
      expect(validateEquationFormat('x1 = 5')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateEquationFormat('not an equation')).toBe(false);
      expect(validateEquationFormat('x1 + x2')).toBe(false); // No = sign
      expect(validateEquationFormat('')).toBe(false);
      expect(validateEquationFormat(null)).toBe(false);
    });

    it('should reject non-numeric constant', () => {
      expect(validateEquationFormat('x1 = abc')).toBe(false);
    });
  });
});

