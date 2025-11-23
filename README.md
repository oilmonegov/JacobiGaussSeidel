# Jacobi & Gauss-Seidel Equalizer 🎛️

An interactive, visual simulator that helps students understand systems of linear equations and iterative methods (Jacobi and Gauss-Seidel) through an intuitive vintage audio equalizer interface.

## Overview

The Jacobi Iteration Equalizer transforms abstract mathematical concepts into a tangible, visual experience. Instead of traditional equation solving, users interact with vintage-style audio knobs and meters to "tune" a system until it's perfectly balanced—just like adjusting an audio equalizer until the sound is crystal clear.

### Key Concept

The application simulates solving a system of linear equations (Ax = b) using iterative methods (Jacobi and Gauss-Seidel). Each variable is represented by a knob, each equation by a frequency band, and the convergence process is visualized through audio feedback, VU meters, and signal clarity indicators.

## Features

### 🎚️ Interactive Controls

- **Variable Knobs**: Drag or use keyboard to adjust variable values (x₁, x₂, x₃, ...)
- **Frequency Bands**: Visual equalizer bars showing each equation's error state
- **VU Meters**: Analog-style meters displaying signal strength for each condition
- **Master Tuning Dial**: Overall system balance indicator

### 🔄 Iteration Methods

- **Jacobi Iteration**: Classic iterative method with step-by-step updates using previous iteration values
- **Gauss-Seidel Method**: Faster convergence using updated values immediately as they're computed
- **Method Switching**: Easily switch between methods using the header radio buttons
- **Performance Comparison**: Track and compare convergence rates between methods in real-time

### 🎨 Visual Design

- **Vintage Theme**: Authentic 1930s-1950s high-fidelity audio equipment aesthetics
- **Modern Theme**: Clean, contemporary alternative design
- **Smooth Animations**: Real-time visual feedback for all interactions

### 🔊 Audio Feedback

- **Dynamic Audio Mix**: 
  - Static/white noise when equations are unbalanced
  - Smooth transition to nature sounds (birds, water, wind) as system converges
  - Convergence chime when solution is reached
- **Volume Control**: Integrated volume slider with mute/unmute toggle

### ⚙️ Configuration

- **Default System**: Quick start with pre-configured 3×3 example
- **Custom Systems**: 
  - Support for 2×2 to 20×20 systems
  - Multiple input methods:
    - Matrix grid editor
    - Text equation parser
    - Visual equation builder
- **Display Settings**: Configure visible knobs and bands
- **Component Visibility**: Show/hide UI elements for focused learning

### 📊 Educational Features

- **Equation Visualizer**: Step-by-step history of iterations
- **Solution Modal**: Detailed explanation of the solution with plain English descriptions
- **Help Panel**: Comprehensive guide with keyboard shortcuts
- **Real-time Feedback**: Live error calculations and convergence status

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd JacobiGaussSeidel
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
npm run dev
```

The application will open in your browser at `http://localhost:8080`

## Usage

### Basic Operation

1. **Choose a System**: On first launch, select either the default 3×3 system or configure a custom system
2. **Select Method**: Choose between Jacobi or Gauss-Seidel iteration method using the radio buttons in the header
3. **Adjust Knobs**: Drag knobs vertically/horizontally or use keyboard (click to focus, then arrow keys)
4. **Perform Iterations**: 
   - Click "Step" for one iteration
   - Click "Play" for automatic iterations
   - Adjust speed slider to control autoplay speed
5. **Monitor Progress**: Watch the VU meters, gain sliders, and signal clarity display
6. **Compare Methods**: Switch between Jacobi and Gauss-Seidel to compare convergence rates
7. **View Solution**: When converged (error < 0.0001), click "View Solution" for detailed explanation

### Keyboard Shortcuts

- `Enter` or `Space`: Perform one iteration step
- `P`: Toggle autoplay (Play/Pause)
- `M`: Toggle mute
- `Arrow Keys` or `+/-`: Adjust focused knob (hold `Shift` for fine control)

### Configuration

Access the configuration modal via the "Config" button to:
- Edit system size and equations
- Switch between matrix and text input
- Adjust display settings
- Control component visibility

## Project Structure

```
LinearEquation/
├── src/                    # Source code
│   ├── core/              # Core business logic
│   │   ├── jacobi.js      # Jacobi iteration algorithm
│   │   ├── gaussSeidel.js # Gauss-Seidel algorithm
│   │   ├── math.js        # Math utilities
│   │   └── system.js      # System configuration
│   ├── state/             # State management
│   │   └── stateManager.js
│   ├── ui/                # UI components
│   │   ├── knobs.js       # Knob rendering
│   │   ├── bands.js       # Band displays
│   │   ├── meters.js      # VU meters
│   │   └── ...
│   ├── controls/          # User interaction handlers
│   ├── audio/             # Audio system
│   ├── config/            # Configuration modals
│   ├── utils/             # Utility functions
│   └── theme/             # Theme management
├── styles/                # CSS stylesheets
│   ├── base/             # Base styles
│   ├── components/        # Component styles
│   └── themes/            # Theme styles
├── test/                  # Test suite
├── assets/                # Static assets (KaTeX library)
├── docs/                  # Documentation
└── index.html             # Main HTML entry point
```

## Development

### Available Scripts

```bash
# Development
npm start          # Start development server
npm run dev        # Alias for start

# Testing
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:ui    # Run tests with UI
npm run test:coverage  # Run tests with coverage

# Build
npm run build      # Build state manager bundle
npm run build:state # Build state manager only
```

### Code Organization

The project follows a modular architecture:

- **Core**: Pure business logic (no DOM dependencies)
- **State**: Centralized state management using Zustand
- **UI**: Rendering and visual updates
- **Controls**: User interaction handlers
- **Config**: System configuration and setup
- **Utils**: Shared utility functions

### Adding Features

1. **New Algorithm**: Add to `src/core/`
2. **New UI Component**: Add to `src/ui/`
3. **New Control**: Add to `src/controls/`
4. **New Utility**: Add to `src/utils/`

## Testing

The project includes a comprehensive test suite using Vitest:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

Test coverage includes:
- Mathematical functions (Jacobi, Gauss-Seidel, error calculations, convergence)
- State management
- Utility functions
- Core algorithms

See `test/README.md` for detailed testing information.

## Technologies

- **Vanilla JavaScript (ES6 Modules)**: No framework dependencies
- **KaTeX**: Mathematical notation rendering
- **Zustand**: Lightweight state management
- **Vitest**: Testing framework
- **Web Audio API**: Dynamic audio generation
- **CSS3**: Modern styling with CSS variables

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires ES6 module support and Web Audio API.

## Documentation

Additional documentation is available in the `docs/` directory:

- `docs/prd.md`: Product Requirements Document
- `docs/PROJECT_STRUCTURE.md`: Detailed project structure
- `docs/design/`: Design and style guides
- `docs/features/`: Feature documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

- KaTeX for mathematical rendering
- Vintage audio equipment aesthetics inspired by 1930s-1950s high-fidelity designs

---

**Made with ❤️ for students learning numerical methods**

