/**
 * Tests for state management system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import store, { PERSISTENCE_KEYS, defaultState } from '../src/state/stateManager.js';

describe('State Manager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear subscribers but keep the Map structure
    const state = store.getState();
    if (state._subscribers instanceof Map) {
      state._subscribers.clear();
    }
    
    // Reset specific state paths to defaults using silent mode
    store.set('system', defaultState.system, { silent: true });
    store.set('iteration', defaultState.iteration, { silent: true });
    store.set('interaction', defaultState.interaction, { silent: true });
    store.set('display', defaultState.display, { silent: true });
    store.set('audio', defaultState.audio, { silent: true });
    store.set('cache', defaultState.cache, { silent: true });
  });

  describe('get', () => {
    it('should get top-level values', () => {
      const n = store.get('system.n');
      expect(n).toBe(3);
    });

    it('should get nested values', () => {
      const volume = store.get('audio.volume');
      expect(volume).toBe(50);
    });

    it('should get array values', () => {
      const x = store.get('system.x');
      expect(Array.isArray(x)).toBe(true);
      expect(x.length).toBe(3);
    });

    it('should return undefined for non-existent paths', () => {
      const value = store.get('nonexistent.path');
      expect(value).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set top-level values', () => {
      store.set('system.n', 5);
      expect(store.get('system.n')).toBe(5);
    });

    it('should set nested values', () => {
      store.set('audio.volume', 75);
      expect(store.get('audio.volume')).toBe(75);
    });

    it('should notify subscribers', () => {
      let notifiedValue = null;
      const unsubscribe = store.subscribe('audio.volume', (newValue) => {
        notifiedValue = newValue;
      });

      store.set('audio.volume', 80);
      expect(notifiedValue).toBe(80);

      unsubscribe();
    });

    it('should validate values when validate option is true', () => {
      expect(() => {
        store.set('system.n', 25, { validate: true });
      }).toThrow('n must be an integer between 2 and 20');

      expect(() => {
        store.set('audio.volume', 150, { validate: true });
      }).toThrow('Volume must be between 0 and 100');
    });

    it('should persist to localStorage when persist option is true', () => {
      store.set('audio.volume', 60, { persist: true });
      
      const saved = localStorage.getItem(PERSISTENCE_KEYS.VOLUME);
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved);
      expect(parsed).toBe(60);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to specific path', () => {
      let callCount = 0;
      const unsubscribe = store.subscribe('audio.volume', () => {
        callCount++;
      });

      store.set('audio.volume', 70);
      store.set('audio.volume', 80);
      
      expect(callCount).toBe(2);
      unsubscribe();
    });

    it('should support wildcard subscriptions', () => {
      let callCount = 0;
      const unsubscribe = store.subscribe('system.*', () => {
        callCount++;
      });

      store.set('system.n', 4);
      store.set('system.x', [1, 2, 3]);
      store.set('audio.volume', 50); // Should not trigger

      expect(callCount).toBe(2);
      unsubscribe();
    });

    it('should support global wildcard', () => {
      let callCount = 0;
      const unsubscribe = store.subscribe('*', () => {
        callCount++;
      });

      store.set('system.n', 4);
      store.set('audio.volume', 50);

      expect(callCount).toBe(2);
      unsubscribe();
    });

    it('should unsubscribe correctly', () => {
      let callCount = 0;
      const unsubscribe = store.subscribe('audio.volume', () => {
        callCount++;
      });

      store.set('audio.volume', 70);
      unsubscribe();
      store.set('audio.volume', 80);

      expect(callCount).toBe(1);
    });
  });

  describe('batch', () => {
    it('should update multiple values at once', () => {
      store.batch({
        'system.n': 4,
        'audio.volume': 75,
        'iteration.speed': 60
      });

      expect(store.get('system.n')).toBe(4);
      expect(store.get('audio.volume')).toBe(75);
      expect(store.get('iteration.speed')).toBe(60);
    });

    it('should notify subscribers for each change', () => {
      const notifications = [];
      const unsubscribe1 = store.subscribe('system.n', (val) => {
        notifications.push(['system.n', val]);
      });
      const unsubscribe2 = store.subscribe('audio.volume', (val) => {
        notifications.push(['audio.volume', val]);
      });

      store.batch({
        'system.n': 4,
        'audio.volume': 75
      });

      expect(notifications.length).toBe(2);
      expect(notifications).toContainEqual(['system.n', 4]);
      expect(notifications).toContainEqual(['audio.volume', 75]);

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('persist and restore', () => {
    it('should persist and restore values', () => {
      store.set('audio.volume', 85);
      store.persist(PERSISTENCE_KEYS.VOLUME, 'audio.volume');

      // Clear state
      store.set('audio.volume', 50);

      // Restore
      const restored = store.restore(PERSISTENCE_KEYS.VOLUME, 'audio.volume');
      expect(restored).toBe(85);
      expect(store.get('audio.volume')).toBe(85);
    });

    it('should use default value when restore fails', () => {
      const restored = store.restore('nonexistent.key', 'audio.volume', 50);
      expect(restored).toBe(50);
      expect(store.get('audio.volume')).toBe(50);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(PERSISTENCE_KEYS.VOLUME, 'invalid json');
      
      const restored = store.restore(PERSISTENCE_KEYS.VOLUME, 'audio.volume', 50);
      expect(restored).toBe(50);
    });
  });

  describe('reset', () => {
    it('should reset path to default value', () => {
      store.set('audio.volume', 90);
      store.reset('audio.volume', 50);
      
      expect(store.get('audio.volume')).toBe(50);
    });
  });

  describe('getState', () => {
    it('should return complete state object', () => {
      const state = store.getState();
      expect(state).toHaveProperty('system');
      expect(state).toHaveProperty('audio');
      expect(state).toHaveProperty('iteration');
    });
  });

  describe('Edge cases', () => {
    it('should handle array indices in paths', () => {
      store.set('system.x[0]', 5);
      expect(store.get('system.x[0]')).toBe(5);
    });

    it('should handle deeply nested paths', () => {
      store.set('display.visibility.header', false);
      expect(store.get('display.visibility.header')).toBe(false);
    });

    it('should handle silent updates', () => {
      let notified = false;
      const unsubscribe = store.subscribe('audio.volume', () => {
        notified = true;
      });

      store.set('audio.volume', 70, { silent: true });
      expect(notified).toBe(false);

      store.set('audio.volume', 80);
      expect(notified).toBe(true);

      unsubscribe();
    });
  });
});

