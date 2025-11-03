# Architecture Overview

## Technology Stack

- **Electron**: Desktop application framework
- **Node.js**: Backend runtime for file operations
- **HTML/CSS/JavaScript**: Frontend UI

## Project Structure

```
wp-debugger/
├── main.js           # Electron main process
├── preload.js        # IPC bridge with context isolation
├── renderer.js       # Frontend application logic
├── index.html        # Main UI layout
├── styles.css        # Application styling
├── package.json      # Project dependencies
└── README.md         # Documentation
```

## Components

### Main Process (main.js)
- Manages application lifecycle
- Creates browser windows
- Handles IPC communication
- Provides file system access through secure handlers:
  - `select-directory`: Opens directory picker dialog
  - `read-directory`: Lists directory contents
  - `read-file`: Reads file contents
  - `check-wordpress`: Validates WordPress installation

### Preload Script (preload.js)
- Provides secure bridge between renderer and main process
- Exposes limited API through contextBridge
- Ensures context isolation for security

### Renderer Process (renderer.js)
- Manages application state (current file, breakpoints, debug session)
- Handles UI interactions
- Implements file tree navigation
- Manages breakpoint toggling
- Simulates debug session controls

### UI Components

1. **Header**: Title and directory selection button
2. **File Tree Sidebar**: WordPress directory browser
3. **Code Editor**: File viewer with line numbers and breakpoint support
4. **Debug Panel**: Contains:
   - Debug control buttons
   - Breakpoints list
   - Variables inspector
   - Debug output console
5. **Status Bar**: Shows current state and WordPress directory

## Security Features

- Context isolation enabled
- Node integration disabled
- Secure IPC communication through preload script
- No direct file system access from renderer

## Data Flow

1. User selects WordPress directory → Main process validates → File tree loads
2. User clicks file → Main process reads file → Renderer displays code
3. User clicks line number → Renderer toggles breakpoint → UI updates
4. User starts debug → UI enables controls → Debug session begins

## Future Integration Points

### phpdbg Integration
The application is designed to integrate with phpdbg for actual step debugging:

1. **Breakpoint Sync**: Breakpoints set in UI would be sent to phpdbg
2. **Debug Server**: A debug server would communicate between Electron and phpdbg
3. **Variable Inspection**: Real variable values would be fetched from phpdbg
4. **Step Control**: Debug commands would be forwarded to phpdbg

### Browser Integration
To trigger debugging from WordPress site:

1. **Debug Proxy**: Set up a proxy server that intercepts PHP requests
2. **phpdbg Wrapper**: Launch PHP with phpdbg when breakpoint matches
3. **WebSocket Communication**: Real-time updates between browser and Electron app
