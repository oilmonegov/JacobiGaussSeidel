# Test Suite for Jacobi Iteration Equalizer

This directory contains the test suite for the Jacobi Iteration Equalizer project.

## Test Structure

- `math.test.js` - Tests for mathematical functions (Jacobi iteration, error calculations, convergence)
- `stateManager.test.js` - Tests for state management system
- `utils.test.js` - Tests for utility functions
- `setup.js` - Test configuration and mocks

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:

1. **Math Engine** (MATH tests from test-plan.md)
   - Initial state verification
   - Jacobi formula verification (step 1, step 2)
   - True solution convergence
   - Error calculations for all equations
   - Max error metric accuracy
   - Value clamping (NaN, Infinity, bounds)
   - Convergence threshold states

2. **State Management**
   - Get/set operations
   - Subscriptions and notifications
   - Batch updates
   - Persistence and restoration
   - Validation
   - Edge cases

3. **Utility Functions**
   - Knob angle calculations
   - Tuning dial angle calculations
   - Speed to delay mapping

## Test IDs

Tests are labeled with IDs from the test plan (e.g., MATH-001, MATH-002) where applicable.

## Future Tests

Additional test files can be added for:
- UI component interactions (requires DOM testing)
- Audio system (requires Web Audio API mocks)
- Integration tests (end-to-end scenarios)
- Performance tests

