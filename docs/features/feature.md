# Feature: Restore Vintage Radio UI Layout

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Planning  
**Priority:** High

---

## Problem Statement

The CSS file is missing critical layout styles, causing the UI to appear broken. The HTML structure exists with all new features (dynamic systems, config modal, hidden knobs/bands), but without proper CSS layout, elements are misaligned or stacked incorrectly.

The current state:
- HTML structure is complete with `.main-panel`, `.equation-panel`, `.radio-panel`, `.radio-body`
- JavaScript functionality is intact (dynamic systems, config modal, HK indicators)
- CSS is missing layout styles for main containers
- Components have individual styles but no structural layout

---

## Goal

Restore the complete vintage radio UI layout while preserving all existing functionality:
- Dynamic n×n system support
- Configuration modal
- Hidden knobs/bands (HK) indicators
- Matrix editor
- Text parser
- Theme switching
- All existing audio and interaction features

---

## Scope

### In Scope

1. **Core Layout Structure**
   - Main panel horizontal flex layout
   - Equation panel (left side) styling and positioning
   - Radio panel (right side) styling and positioning
   - Responsive behavior for different screen sizes

2. **Radio Body Styling**
   - Vintage radio container with wood/Bakelite aesthetics
   - 3D depth effects (shadows, gradients, textures)
   - Speaker grille positioning and styling
   - Power indicator positioning and animation
   - Knobs container integration within radio body
   - Volume slider integration within radio body
   - Tuning dial positioning and styling

3. **Signal Clarity Display**
   - Convergence info panel styling
   - Balanced state visual effects (glow, border)
   - Master level meter styling
   - Integration with equation panel layout

4. **Header and Controls**
   - Header layout and typography
   - Theme toggle positioning
   - Controls footer bar styling
   - Button styling consistency

5. **Theme Support**
   - Ensure modern theme works with restored layout
   - Theme-specific overrides for new layout elements
   - Consistent styling across both themes

### Out of Scope

- Changes to JavaScript functionality
- New features beyond UI restoration
- Audio system modifications
- Backend or data persistence changes
- Changes to existing component styles (knobs, bands, etc.) - only layout restoration

---

## Technical Approach

### File Changes Required

**styles.css** - Add missing layout CSS:
- `.main-panel` - Horizontal flex container with gap and responsive behavior
- `.equation-panel` - Left column container with proper width and spacing
- `.radio-panel` - Right column container with proper width and spacing
- `.radio-body` - Vintage radio styling with 3D effects
- `.signal-clarity-display` - Convergence display panel styling
- Header styling (`.header`, `.title`, `.theme-toggle`)
- Controls styling (`.controls`, `.control-btn`)
- Responsive breakpoints for tablet and mobile

### Implementation Strategy

**Phase 1: Core Layout**
- Add `.main-panel` flex container
- Style `.equation-panel` and `.radio-panel` as columns
- Ensure proper spacing and alignment
- Test basic structure

**Phase 2: Radio Body**
- Style `.radio-body` with vintage aesthetics
- Position internal elements (speaker, power indicator, knobs, volume, dial)
- Add 3D effects and textures
- Integrate with radio panel

**Phase 3: Signal Display**
- Style `.signal-clarity-display`
- Position relative to bands
- Add balanced state styling
- Integrate with equation panel

**Phase 4: Polish**
- Style header and controls
- Add responsive breakpoints
- Verify theme switching
- Final visual pass

### Key Considerations

- **Separation of Concerns**: Layout CSS should be separate from feature logic
- **Backward Compatibility**: Existing JavaScript should work without changes
- **Dynamic Content**: Layout must handle variable numbers of knobs/bands
- **Theme Support**: Both vintage and modern themes must work
- **Responsive Design**: Must work on desktop, tablet, and mobile

---

## Success Criteria

- [ ] Horizontal layout visible on desktop (equation panel | radio panel)
- [ ] Radio body displays as authentic vintage equipment with 3D depth
- [ ] All bands display correctly on left side with proper spacing
- [ ] All knobs render correctly on radio body
- [ ] HK indicators appear correctly when n > visible count
- [ ] Signal clarity display shows convergence info properly
- [ ] Controls bar displays at bottom with proper styling
- [ ] Config modal opens/closes without layout issues
- [ ] Theme switching works correctly with restored layout
- [ ] Responsive behavior works on tablet (768px-1199px)
- [ ] Responsive behavior works on mobile (<768px)
- [ ] All existing functionality preserved (no regressions)

---

## Dependencies

- Existing HTML structure (`index.html`) - already complete
- Existing JavaScript functionality (`main.js`) - already complete
- Existing color variables and theme system - already defined
- No new dependencies required

---

## Risks

1. **CSS Conflicts**: New layout styles may conflict with existing component styles
   - *Mitigation*: Use specific selectors, test incrementally

2. **Responsive Breakpoints**: May need adjustment for different screen sizes
   - *Mitigation*: Test on multiple viewport sizes during development

3. **Theme Switching**: May require additional overrides for modern theme
   - *Mitigation*: Test both themes after each phase

4. **Dynamic Content**: Layout must handle variable numbers of elements
   - *Mitigation*: Use flexbox/grid which handles dynamic content well

---

## Testing Checklist

### Visual Testing
- [ ] Desktop layout (1200px+ width) displays correctly
- [ ] Tablet layout (768px-1199px) displays correctly
- [ ] Mobile layout (<768px) stacks vertically
- [ ] Radio body looks like authentic vintage equipment
- [ ] All elements properly aligned and spaced
- [ ] No overlapping elements
- [ ] No horizontal scrolling on desktop

### Functional Testing
- [ ] All knobs are draggable and functional
- [ ] All buttons work correctly
- [ ] Config modal opens/closes properly
- [ ] Theme switching works
- [ ] HK indicators display when needed
- [ ] Dynamic rendering works (n×n systems)

### Theme Testing
- [ ] Vintage theme displays correctly
- [ ] Modern theme displays correctly
- [ ] Theme switching is smooth
- [ ] All elements styled in both themes

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Notes

- JavaScript already supports all features - only CSS restoration needed
- Dynamic rendering functions (`renderKnobs`, `renderBands`) will work once layout is restored
- HK indicators are already implemented, just need proper positioning
- Existing component styles (knobs, bands, modals) should remain unchanged
- Focus is on structural layout, not component redesign

---

## Related Documents

- `prd.md` - Product Requirements Document
- `todo.md` - Main project todo list
- `test-plan.md` - Testing documentation
- `test-todo.md` - Test execution checklist

