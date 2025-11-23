# PRD – Jacobi Iteration Equalizer Simulator 🎛️

## 1. Product Overview

We want to build an **interactive, visual simulator** that helps a beginner understand:

* What a **system of linear equations** is (in a very intuitive way).
* What **Jacobi Iteration** does (step-by-step adjustment of guesses).
* How the solution is reached gradually (convergence).

The UI should look and feel like a **vintage audio equalizer** (1930s-1950s audio equipment) with **three knobs** representing the three unknowns (x_1, x_2, x_3). Turning the knobs changes the values.

The system will:

* Show how the **conditions "complain"** when the values are wrong.
* Show how, over time, the values are adjusted until all conditions are "satisfied" (balanced).
* Support **autoplay** of the iteration with a **speed controller**.
* Provide **audio feedback**: noisy static/white noise when unbalanced, transitioning to appealing nature sounds (birds, water, wind) as the equations become balanced—like tuning an audio system until the sound is clear.

Everything runs in the browser with **HTML/CSS/JavaScript** (no backend).

---

## 2. Problem Statement

Students often find:

* Systems of linear equations abstract and confusing.
* Iterative methods (like Jacobi) even more confusing because it’s “just formulas”.

We want to **turn this into a visual, physical-feeling experience**:
like tuning an audio system until the sound is crystal clear.

---

## 3. Goals & Success Criteria

### Goals

* Make students **see** and **feel** what it means to “solve” a system of linear equations.
* Show how Jacobi Iteration:

  * Starts with a **guess**.
  * Updates all variables using the equations.
  * Repeats until the variables **stabilize**.

### Success Criteria

* A user with no prior knowledge of linear equations should:

  * Understand “we have 3 unknowns, and 3 rules they must satisfy”.
  * Visually grasp that we are **adjusting the knobs** together until all rules are satisfied.
  * See the **iteration process** clearly (step-by-step and autoplay).

* From a technical POV:

  * Runs smoothly in a modern browser.
  * Knobs feel responsive.
  * Autoplay can be controlled (start, pause, speed slider).
  * Audio provides intuitive feedback about convergence state.
  * Users can **hear** the solution being reached, not just see it.

---

## 4. Target Users

* Secondary school / early university students (approx).
* Anyone new to:

  * Linear equations.
  * Numerical methods.
  * Jacobi Iteration.

The UI should be **playful but not childish**: educational, clean, and authentically **vintage audio** stylish. The design should evoke the golden age of high-fidelity audio (1940s-1950s) with period-appropriate aesthetics, materials, and typography.

---

## 5. Core Concept (What We Are Simulating)

The simulator supports **dynamic systems of linear equations** (Ax = b) of size n×n (from 2 to 20 variables).

By default, we use one fixed system of 3 linear equations (same as the class example) to help users get started quickly:

[
\begin{cases}
4x_1 - x_2 + x_3 = 7 \
4x_1 - 8x_2 + x_3 = -21 \
-2x_1 + x_2 + 5x_3 = 15
\end{cases}
]

The true solution is:
[
x_1 = 2,\quad x_2 = 4,\quad x_3 = 3.
]

The Jacobi update formulas are automatically generated for any system. For the default system:

[
\begin{aligned}
x_1^{(k+1)} &= \frac{7 + x_2^{(k)} - x_3^{(k)}}{4} \
x_2^{(k+1)} &= \frac{21 + 4x_1^{(k)} + x_3^{(k)}}{8} \
x_3^{(k+1)} &= \frac{15 + 2x_1^{(k)} - x_2^{(k)}}{5}
\end{aligned}
]

We will **not overwhelm** the user with equations at first, but the simulator should **internally** use these to compute each new iteration.

---

## 6. Scope

### In-Scope (MVP & Enhancements)

1. **Audio-like control panel with knobs**

   * Knobs represent variables: (x_1, x_2, ..., x_m).
   * Dynamic generation of knobs based on system size.
   * "Hidden Knobs" (HK) indicator for variables beyond the visible limit.
   * User can drag/rotate each knob to set initial values (e.g., between -10 and +10).
   * Each knob shows:
     * Variable name (x₁, x₂, etc.).
     * Current value (numeric, with 2–3 decimal places).

2. **Equation Status Display (Equalizer Condition Meters)**

   * For each equation (displayed as "Condition 1", "Condition 2", etc.):
     * Show as equalizer bar or meter:
       `Condition 1: Target 7.00 | Current Error ± 0.23`.
     * Use **color coding**:
       * Green when error is near zero (|error| < 0.1).
       * Amber when medium (0.1 ≤ |error| < 1.0).
       * Red when large (|error| ≥ 1.0).
   * **Signal Clarity Meters:**
     * Analog-style bar meters for each condition (like VU meters).
     * Smoothly animate as error decreases.
     * Color-coded: red → amber → green.
   * "Hidden Bands" (HK) indicator for equations beyond the visible limit.

3. **Iteration Controls**

   * **Step button**: perform **one Jacobi iteration**:
     * Reads current values.
     * Computes new values using generated formulas.
     * Smoothly animates the knobs from old values to new values.
   * **Autoplay toggle/button**:
     * Start continuous iterations.
     * Pause/resume the autoplay.

4. **Speed Controller**

   * A slider (or dial) that sets autoplay speed (e.g. iterations per second).
   * Min = slow (e.g., 1 iteration every 2 seconds).
   * Max = fast (e.g., 5–10 iterations per second with visible but quick animation).

5. **Convergence Feedback**

   * Display live:
     * Current iteration number k.
     * Current values of variables.
     * Overall error (e.g. max absolute equation error).
   * When solution is "close enough":
     * Show a subtle "Balanced / Converged" state (e.g., glowing green border, message).
     * **Solution Button**: Appears when converged (max error < 0.0001).
     * **Solution Modal**: Opens when solution button is clicked, displaying:
       * Final solution values with plain English explanations using equalizer metaphor.
       * Step-by-step verification for each condition.
       * Convergence details.
       * Educational content explaining how Jacobi iteration works.

6. **Reset & Presets**

   * **Reset button**:
     * Reset to default initial guess.
     * Reset iteration counter.
   * **Random initial guess button**:
     * Set random starting values for variables within allowed range.

7. **Audio System**

   * **Sound Design:**
     * Noisy static/white noise when equations are unbalanced (high error).
     * Smooth transition to nature sounds (birds, water, wind) as equations become balanced.
     * Audio crossfades smoothly based on overall convergence state.
   * **Audio Controls:**
     * Volume slider integrated into main body.
     * Click slider to toggle mute/unmute.
     * Visual indicator shows volume level.
   * **Sound Mapping:**
     * Audio mix ratio determined by overall error metric.
     * Logarithmic mapping: noise dominates when error > 1.0.
     * Full nature sound when all equations balanced (error < 0.0001).
   * **Audio Feedback:**
     * Subtle click/tick sound when knobs are rotated manually.
     * Button click sounds.
     * Convergence chime when solution is reached.

8. **Startup & Configuration**
   * **Startup System Selection**: Choose between default or custom system.
   * **Configuration Modal**: Define custom equations, matrix, and visual settings.
   * **Rich Visual Editor**: Interactive grid for matrix input and equation building.

---

## 7. Out of Scope (for now)

* Saving sessions or user accounts (backend).
* Backend services.

We can keep the architecture **purely frontend**.

---

## 8. UX / UI Requirements

### 8.1 Layout

* Page centered content on desktop.
* **Single-glance horizontal layout** - everything visible at once.
* Suggested layout:

  **Top area:**

  * Title: "Jacobi Iteration Equalizer" (vintage-style typography).
  * Short description/instruction.

  **Main area (horizontal layout):**

  **Left side:**
  * Condition displays (displayed as "Condition 1", "Condition 2", "Condition 3").
  * Condition meters (equalizer bars).
  * Signal strength indicators.
  * Iteration info & residual/error.

  **Center/Right side:**
  * **Realistic vintage audio body** with integrated controls:
    * Knobs (x₁, x₂, ...) integrated into faceplate.
    * Volume slider integrated into body.
    * Speaker grille (representing unified output).
    * Power indicator light.
    * Large master dial (for overall convergence).
    * Audio equipment styling (wood grain, metal faceplate).

  **Bottom area:**

  * Controls:
    * Step button.
    * Autoplay toggle.
    * Speed slider.
    * Reset button.
    * Presets.
    * Mute button.
    * Configure button (for custom systems).

### 8.2 Styling & Visual Design System

* Use **modern CSS** (Flexbox / Grid) with vintage aesthetics.
* **Visual Theme: Nostalgic Audio Equipment (1930s-1950s)**

  * **Era/Style:** High-fidelity audio equipment, studio gear.
  * **Materials & Textures:**
    * Wood grain cabinets.
    * Brushed metal or Bakelite faceplates.
    * Analog meters (VU meters).
    * Glowing tubes/indicators.

---

## 17. Enhanced Equalizer Metaphor Elements

### 17.1 Terminology

* Use audio/equalizer terminology throughout:
  * "Balancing" instead of "iterating".
  * "Sound clarity" instead of "convergence".
  * "Condition" or "Requirement" instead of "equation".
  * "Unbalanced" instead of "unbalanced".
  * "Perfectly tuned" instead of "converged".

### 17.2 Visual Feedback Enhancements

* **Condition Meters:**
  * Analog-style VU meters or equalizer bars.
  * Shows error level for each condition.
  * Smoothly animates as error decreases.
* **Unified Output Meter:**
  * Large central dial showing overall system balance.
  * Pointer moves from "Distorted" to "Clear" as system balances.

### 17.3 Audio Metaphor Integration

* **Audio as Primary Feedback:**
  * The sound IS the primary indicator of balance (like using a real equalizer).
  * Visual elements support the audio experience.
  * Emphasize that knobs work *together* to affect the single output.

---

## 18. Startup System Selection

### 18.1 Modal Structure
* **Two Options:**
  * "Use Default System": Quick start with pre-configured 3x3 example.
  * "Configure Custom System": Setup custom equations via configuration modal.
* **Educational Content:**
  * "Learn More" expandable sections for each option.
  * Explanations of what will be learned with each path.
  * Visual previews of what to expect.

### 18.2 User Flow
* Appears on first load (unless "remember choice" is active).
* Guides user to appropriate experience level.
* "Remember my choice" option for returning users.

---

## 19. Dynamic System Configuration

### 19.1 System Support
* Support for n×n systems where n is between 2 and 20.
* Dynamic generation of Jacobi update formulas.
* Validation for diagonal dominance and zero diagonals.

### 19.2 Configuration Modal
* **System Size:** Selector for number of variables/equations.
* **Input Methods:**
  * Text Input (e.g., "4x1 - x2 = 7").
  * Matrix Input (paste matrix/vector data).
  * Visual Editor (interactive grid).
* **Display Settings:**
  * Configure number of visible knobs (m).
  * Configure number of visible frequency bands.

### 19.3 Hidden Elements (HK)
* **Hidden Knobs:**
  * Indicator "HK (count)" for knobs beyond visible limit.
  * Tooltip showing summary of hidden values.
* **Hidden Bands:**
  * Indicator for equation displays beyond visible limit.
  * Tooltip showing aggregate error metrics for hidden bands.

---

## 20. Rich Visual Editor

### 20.1 Matrix Grid Editor
* Interactive n×n grid for coefficient matrix A.
* Separate column for constant vector b.
* Real-time validation of inputs.
* Keyboard navigation between cells.

### 20.2 Visual Equation Builder
* Drag-and-drop coefficient manipulation.
* Proper mathematical notation rendering.
* Real-time preview of system behavior.
