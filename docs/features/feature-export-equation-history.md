# Feature: Export Equation History as PDF

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Planning  
**Priority:** Medium

---

## Problem Statement

Users currently cannot export the equation history for offline analysis, documentation, or sharing. The equation visualizer displays iteration-by-iteration results with beautifully formatted KaTeX equations, but this information is only available within the browser session. Users need the ability to:

- Export the complete iteration history with all equations intact
- Preserve the mathematical notation exactly as displayed (KaTeX-rendered)
- Generate a professional PDF document suitable for reports or documentation
- Share iteration results with others who may not have access to the application

The current equation history is stored in memory and displayed in a modal, but there's no way to save or export this valuable information.

---

## Goal

Add PDF export functionality that generates a professionally formatted document containing:
- **System information** (method used, system size, export timestamp)
- **Original system** (matrix form A·x = b with KaTeX rendering)
- **Complete iteration history** with:
  - Iteration number and current variable values
  - Coefficient matrix A (if available)
  - Original equations with KaTeX-rendered mathematical notation
  - Update formulas (Jacobi/Gauss-Seidel) with numeric substitutions
  - Error analysis (LHS values, target values, errors)
- **Preserved formatting** matching the visual appearance in the browser

The PDF should be well-formatted, print-friendly, and preserve all mathematical notation exactly as displayed in the equation visualizer.

---

## Scope

### In Scope

1. **PDF Generation System**
   - Use html2pdf.js library for browser-based PDF generation
   - Generate HTML document with KaTeX-rendered equations
   - Convert HTML to PDF with proper formatting
   - Handle page breaks for long histories
   - Apply print-friendly styling

2. **Export Utility Module**
   - Create `src/utils/export.js` with PDF export function
   - Reuse existing equation generation functions from `equationVisualizer.js`
   - Render KaTeX equations to HTML before PDF conversion
   - Generate structured document with headers, sections, and formatting
   - Handle empty history gracefully

3. **UI Integration**
   - Add "Export as PDF" button in equation history modal
   - Show loading indicator during PDF generation
   - Display success/error messages
   - Generate timestamped filename: `equation-history-YYYY-MM-DD-HH-MM-SS.pdf`

4. **Document Structure**
   - Header with system information and metadata
   - Original system display (matrix form)
   - Iteration-by-iteration sections in chronological order
   - Each iteration includes: values, matrices, equations, formulas, errors
   - Professional formatting with clear section separators

5. **Styling and Formatting**
   - Print-friendly CSS (A4 page size, margins)
   - Proper typography and spacing
   - Centered equations with appropriate spacing
   - Table formatting for error analysis
   - Color scheme suitable for printing (consider grayscale)

### Out of Scope

- Export in other formats (CSV, JSON, LaTeX source)
- Customizable PDF templates or layouts
- Batch export of multiple histories
- PDF editing or annotation features
- Integration with external PDF services
- Compression or optimization of PDF files
- Digital signatures or security features

---

## Technical Approach

### File Changes Required

**package.json**
- Add dependency: `html2pdf.js`

**src/utils/export.js** (new file)
- `exportEquationHistoryToPDF(equationHistory, A, b, n, method)` - Main export function
- Generate HTML document structure
- Render KaTeX equations using `katex.renderToString()`
- Apply inline CSS for PDF styling
- Use html2pdf.js to convert HTML to PDF
- Trigger browser download

**index.html**
- Add export button in equation history modal (around line 465)
- Button ID: `exportEquationHistoryBtn`
- Add tooltip for export functionality

**main.js**
- Import export function
- Add element reference for export button
- Add event listener in `setupEventListeners()` (around line 1685)
- Show loading indicator during generation
- Handle success/error states

**styles/legacy.css**
- Style export button (`.export-history-btn`)
- Support both vintage and modern themes
- Add loading state styling

### Implementation Strategy

**Phase 1: Setup and Dependencies**
- Install html2pdf.js library
- Create export utility module structure
- Import required equation generation functions

**Phase 2: HTML Generation**
- Generate document header with system information
- Create iteration sections using existing equation functions
- Render KaTeX equations to HTML
- Structure document with proper sections

**Phase 3: PDF Conversion**
- Configure html2pdf.js options (page size, margins, quality)
- Apply print-friendly CSS styling
- Convert HTML to PDF
- Test PDF generation and download

**Phase 4: UI Integration**
- Add export button to modal
- Wire up event handlers
- Add loading and success states
- Handle errors gracefully

**Phase 5: Polish and Testing**
- Test with various history sizes
- Verify KaTeX rendering in PDF
- Test in different browsers
- Ensure print-friendly formatting

### Key Considerations

- **KaTeX Rendering**: Equations must be rendered to HTML before PDF conversion (not as LaTeX source)
- **Reuse Existing Functions**: Use `generateMatrixForm()`, `generateOriginalEquations()`, etc. from `equationVisualizer.js`
- **Performance**: PDF generation may take time for large histories - show loading indicator
- **Browser Compatibility**: html2pdf.js works in modern browsers, test compatibility
- **File Size**: Large histories may generate large PDFs - document limitations if needed
- **Print Quality**: Ensure equations are readable when printed
- **Page Breaks**: Consider page breaks between iterations for long histories

---

## Success Criteria

- [ ] Export button appears in equation history modal
- [ ] Clicking export button generates PDF with all iterations
- [ ] PDF preserves KaTeX-rendered equations exactly as displayed
- [ ] PDF includes system information and metadata
- [ ] PDF includes original system (matrix form)
- [ ] PDF includes complete iteration history in chronological order
- [ ] Each iteration includes: values, matrices, equations, formulas, errors
- [ ] PDF is well-formatted and print-friendly
- [ ] PDF filename includes timestamp
- [ ] Loading indicator shows during PDF generation
- [ ] Success message displays after export
- [ ] Empty history handled gracefully (show message or disable button)
- [ ] Export button styled correctly in both themes
- [ ] PDF opens correctly in different PDF viewers
- [ ] Equations are readable when PDF is printed

---

## Dependencies

- Existing `equationHistory` array in state
- Existing equation generation functions in `equationVisualizer.js`:
  - `generateMatrixForm(A, b, n)`
  - `generateOriginalEquations(A, b, x, n)`
  - `generateJacobiFormulasWithValues(A, b, x, n)`
  - `generateGaussSeidelFormulasWithValues(A, b, x, n)`
- KaTeX library (already included)
- html2pdf.js library (to be added)
- Browser support for blob URLs and downloads

---

## Risks

1. **PDF Generation Performance**: Large histories may take significant time to generate
   - *Mitigation*: Show loading indicator, consider pagination for very long histories

2. **KaTeX Rendering in PDF**: Equations may not render correctly in PDF
   - *Mitigation*: Test thoroughly, ensure KaTeX CSS is included in HTML

3. **Browser Compatibility**: html2pdf.js may not work in all browsers
   - *Mitigation*: Test in major browsers, provide fallback message if needed

4. **File Size**: PDFs with many iterations may be large
   - *Mitigation*: Document limitations, consider compression options

5. **Print Quality**: Equations may not print clearly
   - *Mitigation*: Use high-quality rendering, test print output

---

## Testing Checklist

### Functional Testing
- [ ] Export button triggers PDF generation
- [ ] PDF contains all iterations from history
- [ ] PDF includes system information
- [ ] PDF includes original system matrix form
- [ ] Each iteration section is complete
- [ ] Equations render correctly in PDF
- [ ] PDF downloads with correct filename
- [ ] Empty history handled gracefully
- [ ] Loading indicator works correctly
- [ ] Success/error messages display correctly

### Visual Testing
- [ ] PDF layout is professional and readable
- [ ] Equations are properly formatted and centered
- [ ] Section headers are clear
- [ ] Page breaks work correctly for long histories
- [ ] Print preview looks good
- [ ] Colors are print-friendly (if applicable)

### Data Accuracy Testing
- [ ] All variable values are correct in PDF
- [ ] All equations match browser display
- [ ] Error calculations are correct
- [ ] Matrix values are correct
- [ ] System information is accurate

### Browser Testing
- [ ] Chrome/Edge (primary browsers)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (if applicable)

### Edge Case Testing
- [ ] Export with empty history
- [ ] Export with single iteration
- [ ] Export with maximum history (50 iterations)
- [ ] Export with very long equations
- [ ] Export during active iteration
- [ ] Multiple rapid exports

---

## Notes

- PDF generation uses html2pdf.js which converts HTML to PDF in the browser
- KaTeX equations are rendered to HTML first, then included in PDF
- Existing equation generation functions are reused to maintain consistency
- PDF styling should be print-friendly and professional
- Consider adding page numbers and table of contents for very long histories (future enhancement)

---

## Related Documents

- `prd.md` - Product Requirements Document
- `feature-todo.md` - Main feature todo list (archived - feature completed)
- `feature-equation-visualizer.md` - Equation visualizer feature documentation
- `test-plan.md` - Testing documentation

