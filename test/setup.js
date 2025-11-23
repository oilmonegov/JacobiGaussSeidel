/**
 * Test setup file for Vitest
 * Configures the testing environment
 */

import { expect, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

// Mock window.audioSystem
global.window = global.window || {};
global.window.audioSystem = {
  updateMix: () => {},
  playButtonClick: () => {},
  playKnobClick: () => {},
  playConvergenceChime: () => {}
};

// Mock katex for equation rendering
global.katex = {
  renderToString: (tex, options) => {
    return `<span class="katex">${tex}</span>`;
  }
};

