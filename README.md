# WordPress Debugger

A desktop app that enables step debugging in a local WordPress installation using Electron.

## Features

- **WordPress Directory Browser**: Select and browse your local WordPress installation with a tree-like file structure
- **Code Editor**: View PHP, JavaScript, CSS, and other code files with syntax highlighting
- **Breakpoint Management**: Set and remove breakpoints by clicking on line numbers
- **Debug Controls**: Step into, step over, step out, continue, and stop debugging
- **Variable Inspection**: View variable values during debugging sessions
- **Debug Output**: Monitor debug messages and execution flow

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the application:
```bash
npm start
```

2. Click "Select WordPress Directory" and choose your local WordPress installation folder
   - The app will verify that the directory contains a `wp-config.php` file

3. Browse the file tree and open PHP files you want to debug

4. Set breakpoints by clicking on line numbers in the code editor

5. Click "Start Debugging" to begin a debug session

6. Use the debug controls to step through code:
   - **Step Into**: Step into function calls
   - **Step Over**: Execute current line and move to next
   - **Step Out**: Step out of current function
   - **Continue**: Continue execution until next breakpoint
   - **Stop**: End the debug session

## Current Implementation

This version provides the UI and interface for WordPress debugging. The phpdbg integration is simulated and would require additional server-side implementation for full functionality.

### What Works:
- WordPress directory selection and validation
- File tree browsing
- Code viewing with line numbers
- Breakpoint setting and management
- Debug control UI
- Variable display panel
- Debug output logging

### Future Enhancements:
- Full phpdbg integration for actual step debugging
- Browser integration to trigger debugging from WordPress site
- Real-time variable inspection
- Stack trace visualization
- Watch expressions
- Conditional breakpoints

## Requirements

- Node.js 14 or higher
- A local WordPress installation
- PHP with phpdbg (for full debugging functionality)

## License

ISC
