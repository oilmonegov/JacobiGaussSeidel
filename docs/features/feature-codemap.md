# Feature: Code Map Visualization

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Completed  
**Priority:** Medium

---

## Problem Statement

Developers and users may want to understand the project structure, file relationships, and dependencies at a glance. Currently, there's no visual representation of how the codebase is organized, making it difficult to understand the architecture and navigate the project.

---

## Goal

Add an interactive code map visualization that displays:
- Project file structure as an interactive graph
- File dependencies and relationships
- File types (HTML, JavaScript, CSS, tests, config, docs)
- Easy navigation between the main app and code map

---

## Scope

### In Scope

1. **Code Map Button**
   - Add button to header (top-right area)
   - Positioned after theme toggle
   - Matches existing button styling
   - Navigates to separate codemap page

2. **Code Map Page**
   - Standalone HTML page (`codemap.html`)
   - Interactive D3.js force-directed graph
   - Visual representation of project files
   - Color-coded by file type
   - Navigation back to main app

3. **Visualization Features**
   - Force-directed layout with physics simulation
   - Interactive nodes (drag, hover)
   - Tooltips showing file information
   - Color-coded nodes by file type
   - Links showing dependencies and relationships
   - Responsive design

4. **Styling**
   - Matches app theme (vintage/modern)
   - Consistent with existing design system
   - Responsive for different screen sizes

### Out of Scope

- Automatic code analysis to generate map
- Real-time updates when files change
- Detailed code previews
- Search/filter functionality (future enhancement)
- Export functionality (future enhancement)

---

## Technical Approach

### File Changes Required

**index.html**
- Add codemap button to `.header` section
- Position after theme toggle button
- Wrap buttons in `.header-buttons` container

**styles.css**
- Add `.header-buttons` container styling
- Add `.codemap-toggle` button styling (matching `.theme-toggle`)
- Add modern theme overrides for codemap button

**codemap.html** (new file)
- Standalone HTML page
- D3.js v7 via CDN
- SVG container for visualization
- Project structure data (nodes and links)
- Force-directed graph implementation
- Styling consistent with app theme

### Implementation Strategy

**Phase 1: Button and Navigation**
- Add codemap button to header
- Style button to match existing theme toggle
- Add navigation to codemap.html

**Phase 2: Code Map Page Structure**
- Create codemap.html with basic structure
- Add header with title and back button
- Create SVG container for visualization
- Add legend for file type colors

**Phase 3: D3.js Visualization**
- Define project structure data (nodes and links)
- Implement force-directed graph
- Add node colors by file type
- Add interactive features (drag, hover, tooltips)

**Phase 4: Styling and Polish**
- Apply app theme styling
- Ensure responsiveness
- Add visual feedback for interactions

### Key Considerations

- **D3.js Library**: Use CDN for easy integration (no build step required)
- **Data Structure**: Manually define nodes and links (can be enhanced later with auto-generation)
- **Theme Support**: Must work with both vintage and modern themes
- **Responsive Design**: Visualization should adapt to different screen sizes
- **Performance**: Force simulation should be optimized for smooth interaction

---

## Success Criteria

- [x] Button appears in header top-right area
- [x] Button navigates to codemap.html
- [x] Codemap page displays interactive D3.js graph
- [x] All major project files are represented as nodes
- [x] File relationships are shown as links
- [x] Visualization is interactive (drag, hover)
- [x] Styling matches app theme
- [x] Navigation back to main app works
- [x] Page is responsive on different screen sizes

---

## Dependencies

- D3.js v7 (via CDN: `https://d3js.org/d3.v7.min.js`)
- No additional npm packages required
- Uses existing theme system for styling consistency
- References existing `styles.css` for theme variables

---

## Data Structure

### Nodes
Each node represents a file in the project:
```javascript
{
  id: "filename.ext",
  type: "html|js|css|test|config|doc|lib",
  group: 1-7, // For color grouping
  size: 12-30, // Node radius
  description: "File description"
}
```

### Links
Each link represents a relationship:
```javascript
{
  source: "source-file",
  target: "target-file",
  type: "script|stylesheet|import|tests|documents|etc"
}
```

### File Types and Colors
- HTML Files: Red (#e74c3c)
- JavaScript Files: Blue (#3498db)
- CSS Files: Green (#2ecc71)
- Test Files: Purple (#9b59b6)
- Config Files: Orange (#f39c12)
- Documentation: Gray (#95a5a6)
- Libraries: Dark Orange (#e67e22)

---

## Risks

1. **D3.js CDN Availability**: If CDN is unavailable, visualization won't load
   - *Mitigation*: Could add fallback or local copy if needed

2. **Data Maintenance**: Manual data structure needs updates when files change
   - *Mitigation*: Document structure clearly, consider auto-generation in future

3. **Performance**: Large graphs may be slow on older devices
   - *Mitigation*: Optimize force simulation parameters, limit node count

4. **Theme Consistency**: Must ensure styling works with both themes
   - *Mitigation*: Use CSS variables, test both themes

---

## Future Enhancements

- Automatic code analysis to generate map from actual imports
- Search/filter functionality
- Zoom and pan controls
- Click to highlight all connections
- Export as image or SVG
- Detailed file information panel
- Animation when opening/closing
- Integration with build system for auto-updates

---

## Related Documents

- `feature-codemap-todo.md` - Implementation checklist
- `codemap.html` - Code map page implementation
- `index.html` - Main app with codemap button
- `styles.css` - Styling for codemap button and page

---

## Notes

- D3.js is loaded via CDN for simplicity (no build step)
- Project structure data is manually defined but can be enhanced
- Visualization uses force-directed layout for natural clustering
- All interactions (drag, hover) are implemented
- Theme support is built-in using CSS variables

