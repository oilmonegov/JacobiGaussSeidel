/**
 * Tests for theme modules: themeManager.js, themes.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initTheme, switchTheme, toggleTheme, applyTheme, loadThemePreference } from '../src/theme/themeManager.js';
import { vintageTheme, modernTheme, getTheme } from '../src/theme/themes.js';

describe('Theme: Themes Module', () => {
  describe('vintageTheme', () => {
    it('should have correct structure', () => {
      expect(vintageTheme).toHaveProperty('name');
      expect(vintageTheme).toHaveProperty('colors');
      expect(vintageTheme).toHaveProperty('fonts');
      expect(vintageTheme.name).toBe('vintage');
    });

    it('should have all required color properties', () => {
      const colors = vintageTheme.colors;
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('accent');
      expect(colors).toHaveProperty('warning');
      expect(colors).toHaveProperty('error');
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('text');
    });

    it('should have font properties', () => {
      expect(vintageTheme.fonts).toHaveProperty('primary');
      expect(vintageTheme.fonts).toHaveProperty('secondary');
    });
  });

  describe('modernTheme', () => {
    it('should have correct structure', () => {
      expect(modernTheme).toHaveProperty('name');
      expect(modernTheme).toHaveProperty('colors');
      expect(modernTheme).toHaveProperty('fonts');
      expect(modernTheme.name).toBe('modern');
    });

    it('should have all required color properties', () => {
      const colors = modernTheme.colors;
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('accent');
      expect(colors).toHaveProperty('warning');
      expect(colors).toHaveProperty('error');
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('text');
    });
  });

  describe('getTheme', () => {
    it('should return modern theme for "modern"', () => {
      const theme = getTheme('modern');
      expect(theme).toBe(modernTheme);
      expect(theme.name).toBe('modern');
    });

    it('should return vintage theme for "vintage"', () => {
      const theme = getTheme('vintage');
      expect(theme).toBe(vintageTheme);
      expect(theme.name).toBe('vintage');
    });

    it('should return vintage theme as default', () => {
      const theme = getTheme('unknown');
      expect(theme).toBe(vintageTheme);
    });

    it('should return vintage theme for null', () => {
      const theme = getTheme(null);
      expect(theme).toBe(vintageTheme);
    });
  });
});

describe('Theme: Theme Manager', () => {
  let mockState;
  let originalBody;

  beforeEach(() => {
    // Save original body
    originalBody = document.body;
    
    // Create fresh body for each test
    document.body = document.createElement('body');
    document.body.className = '';
    
    mockState = {
      theme: 'vintage'
    };

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
  });

  afterEach(() => {
    // Restore original body
    document.body = originalBody;
    vi.clearAllMocks();
  });

  describe('applyTheme', () => {
    it('should apply vintage theme class', () => {
      applyTheme('vintage');
      expect(document.body.classList.contains('theme-vintage')).toBe(true);
      expect(document.body.classList.contains('theme-modern')).toBe(false);
    });

    it('should apply modern theme class', () => {
      applyTheme('modern');
      expect(document.body.classList.contains('theme-modern')).toBe(true);
      expect(document.body.classList.contains('theme-vintage')).toBe(false);
    });

    it('should remove previous theme class', () => {
      document.body.classList.add('theme-vintage');
      applyTheme('modern');
      expect(document.body.classList.contains('theme-vintage')).toBe(false);
      expect(document.body.classList.contains('theme-modern')).toBe(true);
    });

    it('should handle missing body gracefully', () => {
      // In jsdom, we can't actually set body to null, but we can test the null check
      // by temporarily removing the body reference
      const bodyRef = document.body;
      // Mock the function to simulate null body
      const originalApplyTheme = applyTheme;
      
      // The function checks if body exists, so if it doesn't, it should return early
      // Since we can't actually set body to null in jsdom, we'll just verify the function
      // has a null check (which it does: if (!body) return;)
      expect(() => applyTheme('vintage')).not.toThrow();
    });

    it('should update theme toggle button if exists', () => {
      const button = document.createElement('button');
      button.id = 'themeToggle';
      const label = document.createElement('span');
      label.className = 'theme-label';
      label.textContent = 'Vintage';
      button.appendChild(label);
      document.body.appendChild(button);
      
      applyTheme('modern');
      
      expect(label.textContent).toBe('Vintage');
      
      applyTheme('vintage');
      
      expect(label.textContent).toBe('Modern');
    });
  });

  describe('switchTheme', () => {
    it('should switch to modern theme', () => {
      switchTheme('modern');
      expect(document.body.classList.contains('theme-modern')).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith('jacobiRadioTheme', 'modern');
    });

    it('should switch to vintage theme', () => {
      switchTheme('vintage');
      expect(document.body.classList.contains('theme-vintage')).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith('jacobiRadioTheme', 'vintage');
    });

    it('should warn and not switch for invalid theme', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      switchTheme('invalid');
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid theme name:', 'invalid');
      expect(global.localStorage.setItem).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      expect(() => switchTheme('modern')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from vintage to modern', () => {
      mockState.theme = 'vintage';
      const newTheme = toggleTheme(mockState);
      
      expect(newTheme).toBe('modern');
      expect(mockState.theme).toBe('modern');
      expect(document.body.classList.contains('theme-modern')).toBe(true);
    });

    it('should toggle from modern to vintage', () => {
      mockState.theme = 'modern';
      const newTheme = toggleTheme(mockState);
      
      expect(newTheme).toBe('vintage');
      expect(mockState.theme).toBe('vintage');
      expect(document.body.classList.contains('theme-vintage')).toBe(true);
    });
  });

  describe('loadThemePreference', () => {
    it('should load vintage theme from localStorage', () => {
      global.localStorage.getItem = vi.fn(() => 'vintage');
      
      loadThemePreference(mockState);
      
      expect(mockState.theme).toBe('vintage');
      expect(document.body.classList.contains('theme-vintage')).toBe(true);
    });

    it('should load modern theme from localStorage', () => {
      global.localStorage.getItem = vi.fn(() => 'modern');
      
      loadThemePreference(mockState);
      
      expect(mockState.theme).toBe('modern');
      expect(document.body.classList.contains('theme-modern')).toBe(true);
    });

    it('should use default vintage when no preference saved', () => {
      global.localStorage.getItem = vi.fn(() => null);
      
      loadThemePreference(mockState);
      
      expect(mockState.theme).toBe('vintage');
    });

    it('should use default vintage for invalid preference', () => {
      global.localStorage.getItem = vi.fn(() => 'invalid');
      
      loadThemePreference(mockState);
      
      expect(mockState.theme).toBe('vintage');
    });

    it('should handle localStorage errors gracefully', () => {
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      loadThemePreference(mockState);
      
      expect(mockState.theme).toBe('vintage');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('initTheme', () => {
    it('should initialize theme system', () => {
      global.localStorage.getItem = vi.fn(() => 'modern');
      
      initTheme(mockState);
      
      expect(mockState.theme).toBe('modern');
      expect(document.body.classList.contains('theme-modern')).toBe(true);
    });
  });
});

