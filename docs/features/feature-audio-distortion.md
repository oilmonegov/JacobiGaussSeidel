# Feature: Audio Distortion Algorithm

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Completed  
**Priority:** High

---

## Problem Statement

The audio system previously used a linear mapping between equation error and audio distortion, which created a predictable and less dramatic audio experience. Users wanted a more engaging audio feedback system where:

- The nature sound starts heavily distorted (barely audible, like static)
- The distortion stays very high for most of the solving process
- The sound clears quickly as the solution is approached
- The clear sound continues playing even after convergence is reached

The previous linear mapping didn't create this dramatic effect, and the volume wasn't modulated based on distortion level, making the heavily distorted sound still too audible.

---

## Goal

Implement a non-linear audio distortion algorithm that creates a dramatic transition from heavily distorted, barely audible nature sounds to crystal-clear audio as the equation converges. The system should:

1. Start with maximum distortion and minimal volume when error is high
2. Use an exponential curve to keep distortion high for most of the process
3. Clear quickly as the solution is approached
4. Maintain clear, full-volume playback after convergence

---

## Scope

### In Scope

1. **Non-Linear Distortion Mapping**
   - Replace linear error-to-distortion mapping with exponential curve
   - Formula: `distortionAmount = 100 * Math.pow(normalizedError, 0.3)`
   - Keeps distortion high (90-100%) for errors 0.5-1.0
   - Drops quickly for errors < 0.1

2. **Volume Modulation Based on Distortion**
   - Calculate nature volume based on distortion amount (not error)
   - Continuous smooth increase from 0.1 (10%) to 1.0 (100%)
   - Formula: `natureVolume = 0.1 + Math.pow(1 - distortionAmount/100, 0.8) * 0.9`
   - Uses power curve (0.8 exponent) for natural-sounding acceleration as clarity improves
   - At 100% distortion: volume = 0.1 (barely audible)
   - At 0% distortion: volume = 1.0 (full volume when clear)

3. **Enhanced Distortion Curve**
   - More aggressive clipping for distortion > 80%
   - Severe bitcrushing (2-4 bits) at high distortion vs normal (2-16 bits)
   - Increased noise/static at high distortion levels
   - Additional quantization for "barely audible" effect

4. **Continuous Playback After Convergence**
   - When `maxError <= 0.0001`: distortion = 0%, nature volume = 1.0
   - Nature sound continues looping indefinitely
   - No changes to audio state after convergence

5. **Smooth Transitions**
   - Volume changes use 200ms ramp time
   - Distortion curve updates create smooth audio effects

### Out of Scope

- Real-time audio analysis or frequency-based effects
- Multiple distortion types or presets
- User-configurable distortion curves
- Audio visualization or spectrum analysis
- Export/import of distortion settings

---

## Technical Approach

### File Changes

**Modified: `src/audio/audioSystem.js`**

1. **`updateMix(maxError)` method** (lines 378-451)
   - Replaced linear distortion mapping with exponential curve
   - Implemented continuous volume increase formula based on distortion amount
   - Volume smoothly increases from 0.1 to 1.0 as distortion decreases
   - Ensured convergence state maintains clear audio
   - Increased ramp time to 200ms for smoother transitions

2. **`makeDistortionCurve(amount)` method** (lines 177-220)
   - Enhanced for heavier distortion at high amounts (>80%)
   - Increased clipping intensity for heavy distortion
   - More aggressive bitcrushing (2-4 bits at high distortion)
   - Increased noise/static levels for barely audible effect
   - Additional quantization for harshness

3. **`startNatureLoop()` method** (lines 343-356)
   - Verified `loop = true` ensures continuous playback
   - Confirmed connection through distortion node

### Algorithm Details

**Distortion Mapping:**
- High error (≥1.0): distortion = 100%, volume = 0.1 (10% - barely audible)
- Medium-high error (0.5-1.0): distortion = 81-100% (exponential)
- Medium error (0.1-0.5): distortion = 50-81%
- Low error (0.01-0.1): distortion = 25-50%
- Very low error (<0.01): distortion = 0-25%
- Converged (≤0.0001): distortion = 0%, volume = 1.0 (100% - full volume)

**Volume Calculation:**
- Based on distortion amount, not directly on error
- Continuous smooth curve: `volume = 0.1 + Math.pow(clarityFactor, 0.8) * 0.9`
- Where `clarityFactor = 1 - (distortionAmount / 100)`
- Creates "barely audible" effect (10% volume) when heavily distorted
- Smoothly and continuously increases to full volume (100%) as distortion clears
- Power curve creates natural acceleration as clarity improves

---

## User Experience

### Initial State (High Error)
- Nature sound is heavily distorted with static/crackling
- Volume is very low (10% of normal - barely audible)
- White noise may be audible
- Overall effect: barely audible, like a radio with poor reception

### During Convergence
- Distortion stays very high (90%+) for most of the process
- Volume gradually increases as distortion decreases
- Sound becomes more recognizable but still distorted
- Quick clearing happens in the final stages

### Converged State (Error < 0.0001)
- Crystal clear nature sound
- Full volume (100%)
- No distortion or static
- Continuous playback of clear audio
- Satisfying audio reward for solving the equation

---

## Testing Considerations

- Test with high initial errors (maxError > 1.0) - should be barely audible
- Test gradual convergence - should stay distorted until very close to solution
- Test after convergence - should remain clear and audible
- Verify smooth transitions without audio glitches
- Test with different error ranges to ensure non-linear curve works correctly
- Verify volume modulation creates "barely audible" effect at high distortion

---

## Implementation Status

✅ **Completed:**
- Non-linear exponential distortion mapping
- Volume reduction for heavy distortion
- Enhanced distortion curve with heavier effects at high amounts
- Continuous playback after convergence
- Smooth transitions with appropriate ramp times

---

## Future Enhancements (Out of Scope)

- Configurable distortion curves (linear, exponential, logarithmic)
- Multiple distortion presets (static, radio, underwater, etc.)
- Frequency-based distortion (affect different frequency bands differently)
- User-adjustable volume thresholds
- Audio visualization showing distortion level
- Export/import of audio settings

---

## Related Features

- **Audio System** (`src/audio/audioSystem.js`): Core audio functionality
- **Nature Sound Loading**: Loads audio files from assets directory
- **Convergence Detection**: Uses `maxError` from equation solving
- **Performance Metrics**: May track audio clarity as a metric

---

## Notes

- The exponential curve with power 0.3 was chosen to create the desired "stays distorted, clears quickly" effect
- Volume modulation uses a continuous formula: `volume = 0.1 + Math.pow(1 - distortion/100, 0.8) * 0.9`
- The power curve (0.8 exponent) creates natural acceleration as clarity improves
- Volume is independent of error, based on distortion amount for better user experience
- Volume smoothly increases from 10% (barely audible) to 100% (full volume) as distortion clears
- The distortion curve uses seeded random for consistent static patterns
- All audio changes use smooth ramping (200ms) to avoid clicks and pops

