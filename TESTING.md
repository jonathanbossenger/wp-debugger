# Testing Guide

## Manual Testing Procedures

### 1. Application Launch
- [ ] Application window opens without errors
- [ ] UI renders correctly with all panels visible
- [ ] Status bar shows "Ready - Select a WordPress directory to begin"

### 2. Directory Selection
- [ ] Click "Select WordPress Directory" button
- [ ] Dialog opens for directory selection
- [ ] Selecting a non-WordPress directory shows error message
- [ ] Selecting a WordPress directory (with wp-config.php) loads successfully
- [ ] Status bar updates to show WordPress directory path
- [ ] "Start Debugging" button becomes enabled

### 3. File Tree Navigation
- [ ] File tree displays WordPress directory structure
- [ ] Directories show folder icon (📁)
- [ ] Files show document icon (📄)
- [ ] Clicking a directory expands/collapses it
- [ ] Expanded directory shows folder icon (📂)
- [ ] Hidden files (starting with .) are not shown
- [ ] node_modules and vendor directories are excluded
- [ ] Only .php, .js, .css, .txt, .md files are shown

### 4. File Viewing
- [ ] Clicking a PHP file opens it in the editor
- [ ] File name appears in editor header
- [ ] Line numbers display correctly
- [ ] Code content displays correctly
- [ ] "Close" button appears in editor header
- [ ] Clicking "Close" clears the editor
- [ ] Status bar updates when file is opened/closed

### 5. Breakpoint Management
- [ ] Clicking a line number toggles a breakpoint
- [ ] Breakpoint appears as red circle on line number
- [ ] Code line with breakpoint has red background
- [ ] Breakpoint appears in "Breakpoints" list
- [ ] Breakpoint shows filename and line number
- [ ] Clicking "×" button removes breakpoint
- [ ] Removing all breakpoints shows "No breakpoints set"
- [ ] Status bar updates when breakpoint is added/removed

### 6. Debug Controls
- [ ] "Start Debugging" requires at least one breakpoint
- [ ] Starting debug session enables all debug buttons
- [ ] "Start Debugging" becomes disabled when session starts
- [ ] Debug output shows session start message
- [ ] Variables panel shows sample WordPress variables
- [ ] Clicking "Step Into" logs action to debug output
- [ ] Clicking "Step Over" logs action to debug output
- [ ] Clicking "Step Out" logs action to debug output
- [ ] Clicking "Continue" logs action to debug output
- [ ] Clicking "Stop" ends debug session
- [ ] Stopping debug session disables debug buttons
- [ ] "Start Debugging" becomes enabled after stopping

### 7. UI Responsiveness
- [ ] All panels are properly sized
- [ ] Scrollbars appear when content overflows
- [ ] Hover effects work on buttons and tree items
- [ ] Selected file is highlighted in tree
- [ ] Status bar always visible at bottom

### 8. Edge Cases
- [ ] Opening very large files (>1000 lines) works
- [ ] Opening binary files shows readable content or error
- [ ] Deeply nested directories expand correctly
- [ ] Multiple breakpoints in same file work correctly
- [ ] Switching between files preserves breakpoints

## Automated Testing (Future)

Future automated tests should cover:

1. **Unit Tests**
   - State management functions
   - Breakpoint toggle logic
   - File tree generation
   - HTML escaping utility

2. **Integration Tests**
   - IPC communication between main and renderer
   - File reading operations
   - Directory validation

3. **E2E Tests**
   - Complete user workflow
   - UI interactions
   - Debug session lifecycle

## Performance Testing

Test with:
- Small WordPress sites (<100 files)
- Medium WordPress sites (100-500 files)
- Large WordPress sites (>500 files)
- Files with >1000 lines of code

Monitor for:
- Memory usage
- UI responsiveness
- File loading time
- Tree rendering performance
