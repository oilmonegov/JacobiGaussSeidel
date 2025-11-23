# Design & Style Guide
## Jacobi Iteration Equalizer

**Version:** 1.0  
**Last Updated:** 2025-01-27  
**Project:** Jacobi Iteration Equalizer Simulator

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout & Spacing](#layout--spacing)
5. [Component Library](#component-library)
6. [Theme System](#theme-system)
7. [Visual Effects](#visual-effects)
8. [Responsive Design](#responsive-design)
9. [Animation & Transitions](#animation--transitions)
10. [Accessibility](#accessibility)

---

## Design Philosophy

### Core Concept

The Jacobi Iteration Equalizer presents a mathematical concept (solving linear equations) through the metaphor of a **vintage audio equalizer** from the golden age of high-fidelity audio (1930s-1950s). The design should evoke:

- **Nostalgia**: Authentic period-appropriate aesthetics
- **Quality**: Premium materials and craftsmanship
- **Clarity**: Visual feedback that makes abstract concepts tangible
- **Elegance**: Sophisticated but approachable design

### Design Principles

1. **Metaphor-Driven**: Every visual element reinforces the audio equalizer metaphor
2. **Progressive Disclosure**: Complex information revealed gradually
3. **Immediate Feedback**: Visual and audio responses to every interaction
4. **Authenticity**: Period-accurate materials, textures, and styling
5. **Accessibility**: Clear contrast, readable fonts, keyboard navigation

---

## Color System

### Vintage Theme Palette

#### Primary Colors

| Color | Variable | Hex | Usage |
|-------|----------|-----|-------|
| **Brass** | `--brass` | `#b5a642` | Primary accent, knobs, borders, labels |
| **Dark Wood** | `--dark-wood` | `#3e2723` | Radio body, borders, shadows |
| **Wood** | `--wood` | `#5d4037` | Radio body base, panels |
| **Cream** | `--cream` | `#f5f5dc` | Primary text, backgrounds |

#### Status Colors

| Color | Variable | Hex | Usage |
|-------|----------|-----|-------|
| **Vintage Green** | `--vintage-green` | `#4caf50` | Success, balanced state, clear signal |
| **Amber** | `--amber` | `#ffc107` | Warning, medium error, mixed signal |
| **Red** | `--red` | `#f44336` | Error, high deviation, static noise |
| **Dark Background** | `--dark-bg` | `#1a1a1a` | Base background |

#### Color Usage Guidelines

- **Brass**: Use for interactive elements, labels, and accents. Creates warmth and vintage feel.
- **Wood Tones**: Create depth and texture. Use gradients for 3D effects.
- **Status Colors**: 
  - Green: Error < 0.1 (balanced)
  - Amber: 0.1 ≤ Error < 1.0 (balancing)
  - Red: Error ≥ 1.0 (unbalanced)

### Modern Theme Palette

| Color | Variable | Hex | Usage |
|-------|----------|-----|-------|
| **Modern Background** | `--modern-bg` | `#222` | Primary background |
| **Modern Text** | `--modern-text` | `#eee` | Primary text |
| **Modern Accent** | `--modern-accent` | `#4a90e2` | Primary accent, interactive elements |
| **Modern Border** | `--modern-border` | `#444` | Borders, dividers |

### Color Contrast

- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Clear hover states with 3:1 contrast change
- **Status Indicators**: High contrast for visibility (red/green/amber)

---

## Typography

### Font Families

#### Primary Font
- **Family**: `'Courier New', monospace`
- **Variable**: `--font-main`
- **Usage**: Body text, labels, values, controls
- **Characteristics**: Monospace, technical, period-appropriate

#### Display Font
- **Family**: `'Playfair Display', serif` (for titles)
- **Usage**: Main title, headings
- **Characteristics**: Elegant, serif, vintage feel

#### Condensed Font
- **Family**: `'Arial Narrow', sans-serif`
- **Variable**: `--font-condensed`
- **Usage**: Compact displays, meter labels, numeric values
- **Characteristics**: Space-efficient, readable at small sizes

#### Additional Fonts
- **Cinzel**: Available for decorative elements
- **Bebas Neue**: Available for bold headings

### Typography Scale

| Element | Size | Weight | Letter Spacing | Usage |
|---------|------|--------|----------------|-------|
| **Title (h1)** | `2rem` | `700` | `2px` | Main page title |
| **Section Headings (h2)** | `1.5rem` | `bold` | `2px` | Modal titles, sections |
| **Subheadings (h3)** | `1.3rem` | `bold` | `1px` | Help sections |
| **Body Text** | `1rem` | `400` | `normal` | General content |
| **Labels** | `0.9rem` | `bold` | `1-2px` | Control labels |
| **Small Text** | `0.85rem` | `400` | `normal` | Helper text, captions |
| **Tiny Text** | `0.7-0.8rem` | `400` | `normal` | Scale marks, fine print |

### Typography Styles

#### Headings
```css
h1, h2, h3 {
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--brass);
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}
```

#### Text Transformations
- **Uppercase**: Headings, labels, button text
- **Normal Case**: Body text, values, descriptions

---

## Layout & Spacing

### Container Structure

```
.container (max-width: 1400px, centered)
├── .header
│   ├── .title
│   └── .theme-toggle
├── .main-panel (flex row)
│   ├── .equation-panel (left, flex: 1)
│   │   ├── .equalizer-bands
│   │   └── .signal-clarity-display
│   └── .radio-panel (right, flex: 1)
│       └── .radio-body
│           ├── .speaker-grille
│           ├── .power-indicator
│           ├── .knobs-container
│           ├── .radio-volume-control
│           └── .tuning-dial
└── .controls (footer)
```

### Spacing System

| Size | Value | Usage |
|------|-------|-------|
| **XS** | `5px` | Tight spacing, icon padding |
| **S** | `10px` | Small gaps, compact elements |
| **M** | `15-20px` | Standard gaps, element spacing |
| **L** | `25-30px` | Section spacing, panel padding |
| **XL** | `40-50px` | Major sections, modal padding |

### Layout Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Desktop** | `≥1024px` | Horizontal layout, side-by-side panels |
| **Tablet** | `768px - 1023px` | Horizontal layout, reduced spacing |
| **Mobile** | `<768px` | Vertical stack, full-width elements |
| **Small Mobile** | `<480px` | Compact spacing, smaller elements |

### Grid System

- **Main Panel**: Flexbox with `gap: 25px`
- **Equalizer Bands**: Flexbox with `gap: 25px`, horizontal scroll on mobile
- **Knobs Container**: Flexbox with `gap: 55px`, wraps on smaller screens

---

## Component Library

### Buttons

#### Primary Control Button
```css
.control-btn {
    padding: 14px 28px;
    border: 3px solid var(--brass);
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(181, 166, 66, 0.1) 0%, transparent 100%);
    color: var(--brass);
    font-family: var(--font-main);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
}
```

**States:**
- **Default**: Transparent background, brass border
- **Hover**: Brass background, dark wood text, slight scale (1.02)
- **Active**: Pressed effect, scale (0.98)

#### Preset Button
- Smaller variant of control button
- `padding: 8px 16px`
- `font-size: 0.85rem`

#### Solution Button
- Appears when system is balanced
- Same styling as control button
- Hidden by default (`display: none`)

### Knobs

#### Knob Structure
```
.knob
├── .knob-pointer (indicator)
└── .knob-ridges (texture)
```

#### Knob Styling
- **Size**: `90px × 90px`
- **Material**: Vintage brass with 3D depth
- **Rotation Range**: `-135°` to `+135°` (270° total)
- **Value Range**: `-10` to `+10`

**Visual Effects:**
- Radial gradients for 3D appearance
- Multiple box-shadows for depth
- Ridged texture around perimeter
- Center cap with highlight
- Pointer indicator at top

**States:**
- **Default**: Subtle shadow
- **Hover**: Enhanced glow, slight lift
- **Active/Dragging**: Scale down (0.98), enhanced inset shadows

### Equalizer Bands

#### Band Display Structure
```
.band-display
├── .band-header
│   ├── .band-label
│   ├── .frequency-label
│   └── .frequency-target
├── .band-controls
│   └── .gain-slider-container
│       ├── .gain-scale
│       └── .gain-slider-track
│           └── .gain-slider-handle
├── .band-details
│   ├── .signal-level
│   └── .deviation
└── .vu-meter
    ├── .vu-meter-scale
    └── .vu-meter-bar
        └── .vu-needle
```

#### Band Styling
- **Width**: `160px` per band
- **Border**: `3px solid var(--brass)`
- **Background**: `rgba(0,0,0,0.4)` with subtle texture
- **Spacing**: `25px` gap between bands

**Color Coding:**
- `.error-high`: Red border/indicators (error ≥ 1.0)
- `.error-medium`: Amber border/indicators (0.1 ≤ error < 1.0)
- `.error-low`: Green border/indicators (error < 0.1)

### Radio Body

#### Dimensions
- **Width**: `550px` (desktop)
- **Min Height**: `700px`
- **Border**: `10px solid var(--dark-wood)`
- **Border Radius**: `25px`
- **Padding**: `40px`

#### Visual Effects
- **Background**: Multi-layer gradients simulating wood grain
- **Texture**: Repeating linear gradients for wood grain effect
- **Depth**: Multiple box-shadows (outer, inset top, inset bottom)
- **Overlay**: Radial gradient for subtle lighting

#### Internal Elements
- **Speaker Grille**: Top section, `90%` width, `200px` height
- **Power Indicator**: Top-right corner, `28px` circle
- **Knobs Container**: Center section, horizontal flex
- **Volume Slider**: Bottom section, `90%` width
- **Tuning Dial**: Center-bottom, `240px` diameter

### Volume Slider

#### Structure
```
.volume-slider-container
├── .volume-slider-label
└── .volume-slider-wrapper
    ├── .volume-slider-track
    │   ├── .volume-slider-fill
    │   └── .volume-slider-thumb
    └── .volume-slider-labels
```

#### Styling
- **Track**: Recessed groove with wood texture
- **Fill**: Gradient (green → amber → red) representing signal quality
- **Thumb**: 3D brass handle, `32px` diameter
- **Tick Marks**: Major (every 25%) and minor (every 10%)

### Signal Clarity Display

#### Structure
```
.signal-clarity-display
├── .adjustment-info
├── .clarity-status
├── .master-level-meter
│   ├── .master-meter-label
│   └── .master-meter-bar
│       └── .master-meter-fill
└── .solution-btn
```

#### Balanced State
- **Border**: `4px solid var(--vintage-green)`
- **Glow**: Pulsing green shadow animation
- **Animation**: `pulse-glow` keyframes (2s infinite)

### Modals

#### Modal Overlay
- **Background**: `rgba(0,0,0,0.8)`
- **Position**: Fixed, full viewport
- **Z-index**: `1000`
- **Display**: Flex, centered

#### Modal Content
- **Background**: `var(--cream)` (vintage) or `var(--modern-bg)` (modern)
- **Max Width**: `600px` (standard), `800px` (help), `900px` (config)
- **Padding**: `30-40px`
- **Border Radius**: `5px`
- **Max Height**: `90vh` with scroll

#### Modal Types
1. **Help Modal**: Wide format, scrollable content
2. **Solution Modal**: Celebration style, verification details
3. **Config Modal**: Tabbed interface, matrix editor
4. **Startup Modal**: Choice selection, expandable details

### Tabs (Config Modal)

#### Tab Button
- **Active State**: Background color, bottom border (`3px solid`)
- **Inactive State**: `opacity: 0.7`
- **Padding**: `15px 25px`

---

## Theme System

### Theme Switching

The application supports two themes that can be toggled via the theme toggle button:

1. **Vintage Theme** (Default)
2. **Modern Theme**

### Theme Implementation

Themes are applied via CSS class on the container:
```css
.modern-theme .component { /* overrides */ }
```

### Vintage Theme Characteristics

- **Materials**: Wood grain, brass, Bakelite
- **Colors**: Warm tones (browns, brass, cream)
- **Textures**: Visible grain, brushed metal effects
- **Typography**: Serif for titles, monospace for body
- **Shadows**: Deep, warm shadows
- **Glows**: Soft, warm glows

### Modern Theme Characteristics

- **Materials**: Flat surfaces, minimal texture
- **Colors**: Cool tones (blues, grays, dark backgrounds)
- **Textures**: Subtle gradients, minimal grain
- **Typography**: Sans-serif, clean lines
- **Shadows**: Sharp, high-contrast shadows
- **Glows**: Bright, cool glows (blue accent)

### Theme-Specific Overrides

Key components with theme overrides:
- Radio body background and borders
- Button colors and borders
- Modal backgrounds
- Knob materials
- Volume slider styling
- Band displays
- Text colors

---

## Visual Effects

### Shadows

#### Component Shadows
```css
box-shadow: 
    0 10px 30px rgba(0,0,0,0.5),      /* Outer shadow */
    inset 0 3px 15px rgba(0,0,0,0.4),  /* Top inset */
    inset 0 -3px 15px rgba(0,0,0,0.2); /* Bottom inset */
```

#### Shadow Hierarchy
- **Level 1**: Subtle (`0 2px 4px`)
- **Level 2**: Medium (`0 4px 12px`)
- **Level 3**: Deep (`0 10px 30px`)
- **Level 4**: Very Deep (`0 15px 40px`)

### Gradients

#### Wood Grain Effect
```css
background: 
    linear-gradient(135deg, rgba(93, 64, 55, 0.8) 0%, rgba(62, 39, 35, 0.9) 100%),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
```

#### 3D Knob Effect
- Radial gradients for depth
- Multiple layers for highlight/shadow
- Center cap with raised appearance

#### Volume Slider Fill
- Color gradient: Green → Amber → Red
- Represents signal quality
- Smooth transitions

### Glows

#### Power Indicator (Active)
```css
box-shadow: 0 0 25px rgba(76, 175, 80, 0.9);
animation: pulse-glow 2s ease-in-out infinite;
```

#### Balanced State Glow
- Pulsing green glow on signal clarity display
- `pulse-glow` animation
- Intensity varies from 0.5 to 0.8 opacity

### Textures

#### Wood Grain
- Repeating linear gradients
- Subtle opacity variations
- Directional (90deg for horizontal grain)

#### Brushed Metal
- Radial gradients
- Highlight/shadow patterns
- Used on knobs and controls

---

## Responsive Design

### Desktop (≥1024px)

- **Layout**: Horizontal, side-by-side panels
- **Radio Body**: Full size (550px width)
- **Bands**: Horizontal row, no wrapping
- **Knobs**: Horizontal row, no wrapping
- **Spacing**: Full gaps (25px)

### Tablet (768px - 1023px)

- **Layout**: Horizontal, reduced spacing
- **Radio Body**: `450px` width
- **Bands**: Horizontal, may wrap
- **Knobs**: Horizontal, may wrap
- **Spacing**: Reduced gaps (15px)

### Mobile (<768px)

- **Layout**: Vertical stack
- **Radio Body**: `90%` width, max `500px`
- **Bands**: Horizontal scroll or wrap
- **Knobs**: Wrap to multiple rows
- **Controls**: Vertical stack, full width buttons
- **Spacing**: Compact (10-20px)

### Small Mobile (<480px)

- **Layout**: Very compact
- **Radio Body**: `90%` width, `500px` min-height
- **Header**: Vertical stack, centered
- **Title**: Reduced size (`1.2rem`)
- **Spacing**: Minimal (10px)

---

## Animation & Transitions

### Transition Timing

- **Standard**: `0.3s ease`
- **Fast**: `0.1s ease` (knob rotation during drag)
- **Slow**: `0.5s ease` (modal transitions)

### Keyframe Animations

#### Pulse Glow
```css
@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.5); }
    50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.8); }
}
```

**Usage**: Balanced state indicators, power indicator

### Smooth Animations

#### Knob Rotation
- **During Drag**: No transition (immediate)
- **After Drag**: Smooth transition enabled
- **During Iteration**: Smooth rotation to new value

#### Volume Slider
- **During Drag**: No transition (immediate)
- **After Drag**: Smooth transition enabled
- **Fill Width**: Smooth width changes

#### VU Meter Needle
- **Height Changes**: `0.2s ease` transition
- **Color Changes**: `0.3s ease` transition

#### Master Level Meter
- **Width Changes**: `0.3s ease` transition

### Interaction Feedback

#### Button Hover
- Scale: `1.02`
- Shadow enhancement
- Background color change
- Shine effect (sweep animation)

#### Button Active
- Scale: `0.98`
- Shadow reduction
- Inset shadow enhancement

#### Knob Hover
- Lift effect (`translateY(-2px)`)
- Enhanced glow
- Shadow enhancement

#### Knob Active/Drag
- Scale: `0.98`
- Cursor: `grabbing`
- Enhanced inset shadows

---

## Accessibility

### Color Contrast

- **Text on Background**: Minimum 4.5:1
- **Interactive Elements**: Clear focus states
- **Status Indicators**: High contrast colors

### Keyboard Navigation

- **Tab Order**: Logical flow through interactive elements
- **Focus Indicators**: Visible focus rings
- **Keyboard Shortcuts**:
  - `Enter`/`Space`: Perform iteration
  - `P`: Toggle autoplay
  - `M`: Toggle mute
  - Arrow keys: Adjust focused knob

### ARIA Labels

- **Knobs**: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- **Buttons**: Descriptive labels
- **Modals**: `role="dialog"`, `aria-labelledby`
- **Status Messages**: `role="alert"`, `aria-live="polite"`

### Screen Reader Support

- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: Descriptive text for visual elements
- **Live Regions**: Status updates announced
- **Labels**: All inputs properly labeled

### Visual Indicators

- **Focus States**: Clear visual focus indicators
- **Hover States**: Obvious hover feedback
- **Active States**: Clear pressed/active appearance
- **Disabled States**: Grayed out, non-interactive

---

## Design Tokens

### Spacing Scale
```css
--spacing-xs: 5px;
--spacing-s: 10px;
--spacing-m: 15px;
--spacing-l: 20px;
--spacing-xl: 25px;
--spacing-xxl: 30px;
```

### Border Radius
```css
--radius-s: 5px;
--radius-m: 8px;
--radius-l: 12px;
--radius-xl: 15px;
--radius-round: 25px;
--radius-circle: 50%;
```

### Z-Index Scale
```css
--z-base: 1;
--z-elevated: 2;
--z-overlay: 10;
--z-modal: 1000;
```

### Shadow Presets
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.3);
--shadow-md: 0 4px 12px rgba(0,0,0,0.4);
--shadow-lg: 0 10px 30px rgba(0,0,0,0.5);
--shadow-xl: 0 15px 40px rgba(0,0,0,0.6);
```

---

## Usage Guidelines

### When to Use Vintage Theme

- Default experience
- Educational contexts
- When emphasizing the metaphor
- For nostalgic/retro aesthetic

### When to Use Modern Theme

- Modern/premium feel
- When reducing visual complexity
- For users preferring minimal design
- For better contrast in bright environments

### Component Usage

1. **Knobs**: Use for variable inputs (x₁, x₂, etc.)
2. **Bands**: Use for equation status displays
3. **VU Meters**: Use for visual error representation
4. **Modals**: Use for detailed information, configuration
5. **Buttons**: Use for actions (Step, Play, Reset, etc.)

### Color Usage

- **Brass/Accent**: Interactive elements, labels, highlights
- **Status Colors**: Error states, convergence feedback
- **Wood Tones**: Backgrounds, containers, depth
- **Cream/Text**: Readable text, light backgrounds

---

## Best Practices

### Do's

✅ Use consistent spacing from the spacing scale  
✅ Maintain color contrast ratios for accessibility  
✅ Apply smooth transitions for state changes  
✅ Use semantic HTML for structure  
✅ Provide keyboard navigation alternatives  
✅ Test in both themes  
✅ Use appropriate shadows for depth hierarchy  
✅ Maintain responsive breakpoints  

### Don'ts

❌ Mix theme styles within a component  
❌ Use colors outside the defined palette  
❌ Skip focus states for interactive elements  
❌ Use animations longer than 0.5s  
❌ Create custom spacing values  
❌ Override component styles unnecessarily  
❌ Use low contrast text  
❌ Break responsive breakpoints  

---

## Future Considerations

### Potential Enhancements

- Additional theme options (dark mode, high contrast)
- Custom color palette support
- Animation speed preferences
- Font size scaling
- Reduced motion support
- Print stylesheet

---

## Resources

### Fonts
- **Playfair Display**: Google Fonts
- **Cinzel**: Google Fonts
- **Bebas Neue**: Google Fonts
- **Courier New**: System font
- **Arial Narrow**: System font

### Color Tools
- Use color contrast checkers for accessibility
- Test color combinations in both themes
- Verify colorblind-friendly palettes

### Design Tools
- CSS custom properties for theming
- Flexbox/Grid for layouts
- CSS gradients for textures
- Box-shadows for depth

---

## Version History

- **v1.0** (2025-01-27): Initial design and style guide creation

---

## Contact & Feedback

For questions or suggestions about the design system, please refer to the project documentation or create an issue in the project repository.

