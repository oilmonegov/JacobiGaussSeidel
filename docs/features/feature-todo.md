> **⚠️ ARCHIVED DOCUMENT**  
> This document is archived as the feature has been completed. It is kept for historical reference only.

# Feature Todo: Restore Vintage Radio UI Layout

**Feature Document:** `feature.md`  
**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Completed (Archived)

---

## Implementation Phases

### Phase 1: Core Layout Structure

#### 1.1 Main Panel Container
- [x] Add `.main-panel` CSS class
  - `display: flex`
  - `flex-direction: row` (horizontal)
  - `gap: 20-30px`
  - `align-items: flex-start` or `stretch`
  - `max-width: 1200px` (or inherit from container)
  - `margin: 0 auto` (center on page)
  - `padding: 20px`

#### 1.2 Equation Panel (Left Side)
- [x] Add `.equation-panel` CSS class
  - `flex: 1` or fixed width (e.g., `min-width: 400px`)
  - `display: flex`
  - `flex-direction: column`
  - `gap: 20px`
  - Background styling (if needed)
  - Padding for content spacing

#### 1.3 Radio Panel (Right Side)
- [x] Add `.radio-panel` CSS class
  - `flex: 1` or fixed width (e.g., `min-width: 500px`)
  - `display: flex`
  - `justify-content: center` (center radio body)
  - `align-items: flex-start`
  - Background styling (if needed)

#### 1.4 Basic Responsive Breakpoint
- [x] Add media query for tablet/mobile
  - At `max-width: 1024px` or similar
  - Change `.main-panel` to `flex-direction: column`
  - Stack panels vertically
  - Adjust widths to `100%`

---

### Phase 2: Radio Body Styling

#### 2.1 Radio Body Base Container
- [x] Add `.radio-body` CSS class
  - Width: `500-600px` (or responsive)
  - Height: `auto` or `min-height: 600px`
  - Background: Wood grain or Bakelite texture
    - Use `var(--wood)` or `var(--dark-wood)` for vintage
    - Use `var(--modern-bg)` for modern theme
  - Border: `8px solid var(--dark-wood)` (vintage)
  - Border-radius: `15px` or `20px`
  - Box-shadow: 3D depth effect
    - `0 10px 30px rgba(0,0,0,0.5)`
    - Inset shadows for depth
  - Padding: `30-40px`
  - Position: `relative` (for absolute positioning of children)

#### 2.2 Speaker Grille
- [x] Style `.speaker-grille` within radio body
  - Position: Top/center of radio body
  - Width: `80-90%` of radio body width
  - Height: `150-200px`
  - Background: Grille pattern (CSS or image)
  - Border-radius: `10px`
  - Margin: `20px auto`
  - Box-shadow for depth

#### 2.3 Power Indicator
- [x] Style `.power-indicator` within radio body
  - Position: `absolute` or flex positioning
  - Top: `20px`
  - Right: `20px` (or left)
  - Size: `20px × 20px` or `30px × 30px`
  - Border-radius: `50%` (circle)
  - Background: `var(--red)` or `var(--vintage-green)`
  - Box-shadow: Glow effect when active
  - Z-index: Ensure visibility

#### 2.4 Knobs Container Integration
- [x] Ensure `.knobs-container` works within radio body
  - Verify existing flex layout works
  - Adjust margins if needed
  - Ensure knobs are centered horizontally
  - Spacing between knobs: `30px` (already set)

#### 2.5 Volume Slider Integration
- [x] Ensure `.radio-volume-control` works within radio body
  - Position: Below knobs or integrated area
  - Width: `80-90%` of radio body
  - Margin: `20px auto`
  - Verify existing volume slider styles work

#### 2.6 Tuning Dial
- [x] Style `.tuning-dial` within radio body
  - Position: Bottom/center of radio body
  - Size: `200-250px` diameter
  - Background: Circular dial with markings
  - Pointer: `.dial-pointer` positioned and styled
  - Markings: `.dial-markings` styled
  - Margin: `20px auto`

---

### Phase 3: Signal Clarity Display

#### 3.1 Signal Clarity Display Container
- [x] Add `.signal-clarity-display` CSS class
  - Background: Matching equation panel or distinct
  - Border: `2px solid var(--brass)` (vintage)
  - Border-radius: `10px`
  - Padding: `20px`
  - Margin: `20px 0` (top/bottom)
  - Display: `flex` or `block`
  - Flex-direction: `column`
  - Gap: `15px`

#### 3.2 Adjustment Info Section
- [x] Style `.adjustment-info` within signal clarity display
  - Display: `flex`
  - Justify-content: `space-between`
  - Font styling
  - Spacing

#### 3.3 Clarity Status
- [x] Style `.clarity-status` (`.convergenceStatus`)
  - Font-size: `1.5rem` or larger
  - Font-weight: `bold`
  - Text-align: `center`
  - Color: Dynamic based on state
  - Margin: `10px 0`

#### 3.4 Master Level Meter
- [x] Style `.master-level-meter` and `.master-meter-bar`
  - Width: `100%`
  - Height: `30-40px`
  - Background: Dark track
  - Border-radius: `5px`
  - Position: `relative`

#### 3.5 Master Meter Fill
- [x] Style `.master-meter-fill` (`.masterMeterFill`)
  - Height: `100%`
  - Background: Gradient (green to red or similar)
  - Border-radius: `5px`
  - Transition: `width 0.3s ease`
  - Width: Controlled by JavaScript (already implemented)

#### 3.6 Balanced State Effect
- [x] Add `.balanced` class styling to `.signal-clarity-display`
  - Border: `3px solid var(--vintage-green)`
  - Box-shadow: Glow effect
    - `0 0 20px rgba(76, 175, 80, 0.5)`
  - Animation: Subtle pulse (optional)

#### 3.7 Solution Button
- [x] Ensure `.solution-btn` styling works
  - Position: Within signal clarity display
  - Margin: `10px auto`
  - Styling: Match control buttons

---

### Phase 4: Header and Controls

#### 4.1 Header Container
- [x] Add `.header` CSS class
  - Display: `flex`
  - Justify-content: `space-between`
  - Align-items: `center`
  - Padding: `20px 0`
  - Margin-bottom: `20px`
  - Border-bottom: Optional divider

#### 4.2 Title Styling
- [x] Ensure `.title` (h1) styling
  - Font-family: Vintage typography (already set)
  - Color: `var(--brass)` (already set)
  - Text-transform: `uppercase` (already set)
  - Letter-spacing: `2px` (already set)
  - Margin: `0`

#### 4.3 Theme Toggle
- [x] Ensure `.theme-toggle` positioning
  - Display: `flex`
  - Align-items: `center`
  - Gap: `10px`
  - Padding: `10px 15px`
  - Border: `2px solid var(--brass)`
  - Border-radius: `5px`
  - Cursor: `pointer`
  - Background: Transparent or subtle

#### 4.4 Controls Footer
- [x] Add `.controls` CSS class (footer)
  - Display: `flex`
  - Flex-wrap: `wrap`
  - Justify-content: `center` or `space-around`
  - Gap: `15px`
  - Padding: `20px`
  - Margin-top: `30px`
  - Border-top: Optional divider
  - Background: Optional subtle background

#### 4.5 Control Buttons
- [x] Ensure `.control-btn` styling consistency
  - Padding: `12px 24px`
  - Border: `2px solid var(--brass)`
  - Border-radius: `5px`
  - Background: Transparent or subtle
  - Color: `var(--brass)`
  - Font-family: Vintage style
  - Cursor: `pointer`
  - Transition: Hover effects
  - Hover: Background change, scale, or glow

---

### Phase 5: Responsive Design

#### 5.1 Tablet Breakpoint (768px - 1024px)
- [x] Add media query `@media (max-width: 1024px)`
  - Adjust `.main-panel` gap: `15px`
  - Adjust panel widths if needed
  - Ensure radio body fits
  - Test layout

#### 5.2 Mobile Breakpoint (< 768px)
- [x] Add media query `@media (max-width: 768px)`
  - Change `.main-panel` to `flex-direction: column`
  - Set `.equation-panel` width: `100%`
  - Set `.radio-panel` width: `100%`
  - Adjust `.radio-body` width: `90%` or `100%`
  - Reduce padding/margins
  - Stack controls vertically if needed
  - Test touch interactions

#### 5.3 Small Mobile (< 480px)
- [x] Add media query `@media (max-width: 480px)`
  - Further reduce padding/margins
  - Adjust font sizes if needed
  - Ensure all controls accessible
  - Test layout

---

### Phase 6: Theme Support

#### 6.1 Modern Theme - Main Panel
- [x] Add `.modern-theme .main-panel` overrides
  - Background adjustments if needed
  - Border adjustments if needed

#### 6.2 Modern Theme - Radio Body
- [x] Add `.modern-theme .radio-body` overrides
  - Background: `var(--modern-bg)`
  - Border: `var(--modern-border)`
  - Box-shadow: Modern style
  - Color adjustments

#### 6.3 Modern Theme - Signal Display
- [x] Add `.modern-theme .signal-clarity-display` overrides
  - Background: `var(--modern-bg)`
  - Border: `var(--modern-border)`
  - Color: `var(--modern-text)`

#### 6.4 Modern Theme - Header/Controls
- [x] Add modern theme overrides for header and controls
  - Color adjustments
  - Border adjustments
  - Background adjustments

---

### Phase 7: Integration and Testing

#### 7.1 HK Indicators Positioning
- [x] Verify `.hk-indicator` positioning in knobs container
- [x] Verify `.hk-indicator-band` positioning in bands container
- [x] Test with n=5, visibleKnobs=3 scenario
- [x] Test with n=5, visibleBands=3 scenario
- [x] Ensure tooltips work correctly

#### 7.2 Config Modal Integration
- [x] Verify config modal doesn't break layout when open
- [x] Test modal overlay positioning
- [x] Test modal content scrolling
- [x] Verify modal closes correctly

#### 7.3 Dynamic Content Testing
- [x] Test with n=3 (default)
- [x] Test with n=5
- [x] Test with n=10
- [x] Verify layout handles variable content
- [x] Test with different visibleKnobs/visibleBands values

#### 7.4 Visual Polish
- [x] Review spacing consistency
- [x] Review alignment
- [x] Review color consistency
- [x] Review typography consistency
- [x] Check for any overlapping elements
- [x] Verify no horizontal scrolling on desktop

---

## Testing Checklist

### Visual Testing
- [x] Desktop layout (1200px+ width) displays correctly
- [x] Tablet layout (768px-1199px) displays correctly
- [x] Mobile layout (<768px) stacks vertically
- [x] Radio body looks like authentic vintage equipment
- [x] All elements properly aligned and spaced
- [x] No overlapping elements
- [x] No horizontal scrolling on desktop

### Functional Testing
- [x] All knobs are draggable and functional
- [x] All buttons work correctly
- [x] Config modal opens/closes properly
- [x] Theme switching works
- [x] HK indicators display when needed
- [x] Dynamic rendering works (n×n systems)

### Theme Testing
- [x] Vintage theme displays correctly
- [x] Modern theme displays correctly
- [x] Theme switching is smooth
- [x] All elements styled in both themes

### Browser Testing
- [x] Chrome/Edge
- [x] Firefox
- [x] Safari
- [x] Mobile browsers

---

## Notes

- All JavaScript functionality is already implemented
- Focus is purely on CSS layout restoration
- Existing component styles should remain unchanged
- Test incrementally after each phase
- Use browser DevTools to inspect and debug layout issues

---

## Completion Criteria

All items in this todo list must be completed and tested before considering the feature complete.

