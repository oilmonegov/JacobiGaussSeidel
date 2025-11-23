/**
 * Tests for utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateNumber, validateSystemSize, validateMatrixDimensions, sanitizeInput } from '../src/utils/validation.js';
import { formatNumber, formatError, formatEquation, formatSolution, equationToLaTeX } from '../src/utils/formatting.js';
import { querySelector, createElement, updateElement, showElement, hideElement } from '../src/utils/dom.js';

describe('Utils: Validation', () => {
  describe('validateNumber', () => {
    it('should validate numbers in range', () => {
      expect(validateNumber(5, 0, 10)).toBe(true);
      expect(validateNumber(0, 0, 10)).toBe(true);
      expect(validateNumber(10, 0, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(validateNumber(-1, 0, 10)).toBe(false);
      expect(validateNumber(11, 0, 10)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(validateNumber(NaN, 0, 10)).toBe(false);
    });

    it('should reject Infinity', () => {
      expect(validateNumber(Infinity, 0, 10)).toBe(false);
      expect(validateNumber(-Infinity, 0, 10)).toBe(false);
    });

    it('should reject non-numbers', () => {
      expect(validateNumber('5', 0, 10)).toBe(false);
      expect(validateNumber(null, 0, 10)).toBe(false);
      expect(validateNumber(undefined, 0, 10)).toBe(false);
    });
  });

  describe('validateSystemSize', () => {
    it('should validate valid system sizes', () => {
      expect(validateSystemSize(2)).toBe(true);
      expect(validateSystemSize(10)).toBe(true);
      expect(validateSystemSize(20)).toBe(true);
    });

    it('should reject sizes outside range', () => {
      expect(validateSystemSize(1)).toBe(false);
      expect(validateSystemSize(21)).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(validateSystemSize(2.5)).toBe(false);
      expect(validateSystemSize(10.1)).toBe(false);
    });
  });

  describe('validateMatrixDimensions', () => {
    it('should validate correct dimensions', () => {
      const A = [[1, 2], [3, 4]];
      const b = [1, 2];
      
      expect(validateMatrixDimensions(A, b)).toBe(true);
    });

    it('should reject non-array A', () => {
      expect(validateMatrixDimensions(null, [1, 2])).toBe(false);
      expect(validateMatrixDimensions('not array', [1, 2])).toBe(false);
    });

    it('should reject non-array b', () => {
      const A = [[1, 2], [3, 4]];
      expect(validateMatrixDimensions(A, null)).toBe(false);
    });

    it('should reject mismatched lengths', () => {
      const A = [[1, 2], [3, 4]];
      const b = [1, 2, 3];
      
      expect(validateMatrixDimensions(A, b)).toBe(false);
    });

    it('should reject non-square matrix', () => {
      const A = [[1, 2, 3], [4, 5]];
      const b = [1, 2];
      
      expect(validateMatrixDimensions(A, b)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize normal strings', () => {
      expect(sanitizeInput('hello world')).toBe('hello world');
    });

    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should limit length', () => {
      const longString = 'a'.repeat(20000);
      const result = sanitizeInput(longString);
      expect(result.length).toBe(10000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
    });
  });
});

describe('Utils: Formatting', () => {
  describe('formatNumber', () => {
    it('should format with default 2 decimals', () => {
      expect(formatNumber(3.14159)).toBe('3.14');
    });

    it('should format with specified decimals', () => {
      expect(formatNumber(3.14159, 3)).toBe('3.142');
      expect(formatNumber(3.14159, 0)).toBe('3');
    });

    it('should handle invalid numbers', () => {
      expect(formatNumber(NaN)).toBe('0.00');
      expect(formatNumber(Infinity)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-3.14, 2)).toBe('-3.14');
    });
  });

  describe('formatError', () => {
    it('should format error with ± symbol', () => {
      expect(formatError(5.123)).toBe('±5.12');
      expect(formatError(-5.123)).toBe('±5.12');
    });

    it('should use absolute value', () => {
      expect(formatError(-10)).toBe('±10.00');
    });
  });

  describe('formatEquation', () => {
    it('should format simple equation', () => {
      const coeffs = [4, -1, 1];
      const constant = 7;
      const result = formatEquation(coeffs, constant);
      
      expect(result).toContain('=');
      expect(result).toContain('7');
    });

    it('should handle zero coefficients', () => {
      const coeffs = [4, 0, 1];
      const constant = 7;
      const result = formatEquation(coeffs, constant);
      
      expect(result).not.toContain('x2');
    });

    it('should use custom variable prefix', () => {
      const coeffs = [1, 2];
      const constant = 3;
      const result = formatEquation(coeffs, constant, 'a');
      
      expect(result).toContain('a1');
      expect(result).toContain('a2');
    });
  });

  describe('formatSolution', () => {
    it('should format solution vector', () => {
      const solution = [2, 4, 3];
      const result = formatSolution(solution);
      
      expect(result).toContain('x1 = 2.00');
      expect(result).toContain('x2 = 4.00');
      expect(result).toContain('x3 = 3.00');
    });

    it('should handle empty array', () => {
      expect(formatSolution([])).toBe('');
    });

    it('should handle non-array input', () => {
      expect(formatSolution(null)).toBe('');
      expect(formatSolution('not array')).toBe('');
    });
  });

  describe('equationToLaTeX', () => {
    it('should convert equation to LaTeX', () => {
      const coeffs = [4, -1, 1];
      const constant = 7;
      const result = equationToLaTeX(coeffs, constant);
      
      expect(result).toContain('=');
      expect(result).toContain('7');
      expect(result).toContain('x_');
    });

    it('should handle zero coefficients', () => {
      const coeffs = [4, 0, 1];
      const constant = 7;
      const result = equationToLaTeX(coeffs, constant);
      
      expect(result).not.toContain('x_2');
    });

    it('should use custom variable prefix', () => {
      const coeffs = [1, 2];
      const constant = 3;
      const result = equationToLaTeX(coeffs, constant, 'a');
      
      // LaTeX uses a_{1} format, not a_1
      expect(result).toContain('a_{1}');
      expect(result).toContain('a_{2}');
    });

    it('should handle all zero coefficients', () => {
      const coeffs = [0, 0, 0];
      const constant = 0;
      const result = equationToLaTeX(coeffs, constant);
      
      expect(result).toContain('0 = 0');
    });
  });
});

describe('Utils: DOM', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('querySelector', () => {
    it('should find existing element', () => {
      const div = document.createElement('div');
      div.id = 'test';
      document.body.appendChild(div);
      
      const result = querySelector('#test');
      expect(result).toBe(div);
    });

    it('should return null for non-existent element', () => {
      const result = querySelector('#nonexistent');
      expect(result).toBeNull();
    });

    it('should handle invalid selector gracefully', () => {
      const result = querySelector('!!!invalid!!!');
      expect(result).toBeNull();
    });
  });

  describe('createElement', () => {
    it('should create element with tag', () => {
      const el = createElement('div');
      expect(el.tagName).toBe('DIV');
    });

    it('should add classes', () => {
      const el = createElement('div', ['class1', 'class2']);
      expect(el.classList.contains('class1')).toBe(true);
      expect(el.classList.contains('class2')).toBe(true);
    });

    it('should set attributes', () => {
      const el = createElement('div', [], { id: 'test', 'data-value': '123' });
      expect(el.id).toBe('test');
      expect(el.getAttribute('data-value')).toBe('123');
    });
  });

  describe('updateElement', () => {
    it('should update textContent', () => {
      const el = document.createElement('div');
      updateElement(el, { textContent: 'Hello' });
      expect(el.textContent).toBe('Hello');
    });

    it('should update innerHTML', () => {
      const el = document.createElement('div');
      updateElement(el, { innerHTML: '<span>Test</span>' });
      expect(el.innerHTML).toBe('<span>Test</span>');
    });

    it('should update style', () => {
      const el = document.createElement('div');
      updateElement(el, { style: { color: 'red', display: 'block' } });
      expect(el.style.color).toBe('red');
      expect(el.style.display).toBe('block');
    });

    it('should set attributes', () => {
      const el = document.createElement('div');
      updateElement(el, { id: 'test', 'data-value': '123' });
      expect(el.id).toBe('test');
      expect(el.getAttribute('data-value')).toBe('123');
    });

    it('should handle null element', () => {
      expect(() => updateElement(null, { textContent: 'test' })).not.toThrow();
    });
  });

  describe('showElement', () => {
    it('should remove hidden class', () => {
      const el = document.createElement('div');
      el.classList.add('hidden');
      showElement(el);
      expect(el.classList.contains('hidden')).toBe(false);
    });

    it('should set display style', () => {
      const el = document.createElement('div');
      el.style.display = 'none';
      showElement(el);
      expect(el.style.display).toBe('');
    });

    it('should handle null element', () => {
      expect(() => showElement(null)).not.toThrow();
    });
  });

  describe('hideElement', () => {
    it('should add hidden class', () => {
      const el = document.createElement('div');
      hideElement(el);
      expect(el.classList.contains('hidden')).toBe(true);
    });

    it('should handle null element', () => {
      expect(() => hideElement(null)).not.toThrow();
    });
  });
});

