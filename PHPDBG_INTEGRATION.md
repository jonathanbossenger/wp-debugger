# phpdbg Integration Guide

This document outlines how to integrate phpdbg for actual PHP step debugging in future versions.

## Overview

phpdbg is a PHP debugger that allows stepping through PHP code, setting breakpoints, and inspecting variables. This guide explains how to integrate it with the WordPress Debugger Electron app.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  Electron App   │ ←──→ │  Debug Server    │ ←──→ │   phpdbg     │
│  (Frontend UI)  │      │  (Node.js/IPC)   │      │   (PHP CLI)  │
└─────────────────┘      └──────────────────┘      └──────────────┘
        │                                                  │
        │                                                  │
        └────────────────────┬─────────────────────────────┘
                             ↓
                    ┌─────────────────┐
                    │  WordPress Site │
                    │  (Web Browser)  │
                    └─────────────────┘
```

## Implementation Steps

### 1. Create Debug Server Module

Create `debug-server.js` in the project:

```javascript
const { spawn } = require('child_process');
const path = require('path');

class DebugServer {
  constructor() {
    this.phpdbgProcess = null;
    this.breakpoints = new Map();
  }

  start(phpPath, breakpoints) {
    const args = ['-qrr']; // quiet, run, remote
    
    // Add breakpoints
    for (const [file, lines] of breakpoints) {
      lines.forEach(line => {
        args.push('-e', `break ${file}:${line}`);
      });
    }
    
    this.phpdbgProcess = spawn('phpdbg', args);
    
    this.phpdbgProcess.stdout.on('data', (data) => {
      // Parse phpdbg output
      this.handleDebugOutput(data.toString());
    });
    
    return this.phpdbgProcess;
  }

  handleDebugOutput(output) {
    // Parse phpdbg output and send to renderer
    // Examples:
    // - Breakpoint hit
    // - Variable values
    // - Stack trace
  }

  sendCommand(command) {
    if (this.phpdbgProcess) {
      this.phpdbgProcess.stdin.write(command + '\n');
    }
  }

  stop() {
    if (this.phpdbgProcess) {
      this.phpdbgProcess.kill();
      this.phpdbgProcess = null;
    }
  }
}

module.exports = DebugServer;
```

### 2. Update Main Process

Add debug server handlers in `main.js`:

```javascript
const DebugServer = require('./debug-server');
let debugServer = null;

ipcMain.handle('start-debug', async (event, breakpoints) => {
  debugServer = new DebugServer();
  debugServer.start('/usr/bin/php', breakpoints);
  
  debugServer.on('breakpoint-hit', (data) => {
    mainWindow.webContents.send('debug-event', {
      type: 'breakpoint-hit',
      file: data.file,
      line: data.line
    });
  });
  
  debugServer.on('variable-update', (variables) => {
    mainWindow.webContents.send('debug-event', {
      type: 'variables',
      data: variables
    });
  });
  
  return { success: true };
});

ipcMain.handle('debug-command', async (event, command) => {
  if (debugServer) {
    debugServer.sendCommand(command);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('stop-debug', async () => {
  if (debugServer) {
    debugServer.stop();
    debugServer = null;
  }
  return { success: true };
});
```

### 3. Update Preload Script

Add debug APIs:

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing APIs ...
  startDebug: (breakpoints) => ipcRenderer.invoke('start-debug', breakpoints),
  debugCommand: (command) => ipcRenderer.invoke('debug-command', command),
  stopDebug: () => ipcRenderer.invoke('stop-debug'),
  onDebugEvent: (callback) => ipcRenderer.on('debug-event', (_, data) => callback(data))
});
```

### 4. Update Renderer

Replace simulated debugging with real commands:

```javascript
async function startDebugging() {
  const breakpoints = Array.from(state.breakpoints.entries()).map(([file, lines]) => ({
    file,
    lines: Array.from(lines)
  }));
  
  const result = await window.electronAPI.startDebug(breakpoints);
  
  if (result.success) {
    state.isDebugging = true;
    // Enable controls...
    
    // Listen for debug events
    window.electronAPI.onDebugEvent((event) => {
      if (event.type === 'breakpoint-hit') {
        highlightCurrentLine(event.file, event.line);
      } else if (event.type === 'variables') {
        displayVariables(event.data);
      }
    });
  }
}

async function debugCommand(command) {
  const commandMap = {
    'step-into': 'step',
    'step-over': 'next',
    'step-out': 'finish',
    'continue': 'continue'
  };
  
  await window.electronAPI.debugCommand(commandMap[command]);
}
```

## phpdbg Commands

Common phpdbg commands to implement:

- `break <file>:<line>` - Set breakpoint
- `step` - Step into functions
- `next` - Step over (next line)
- `finish` - Step out of function
- `continue` - Continue execution
- `print $variable` - Print variable value
- `bt` - Show backtrace
- `list` - Show code context
- `quit` - Exit debugger

## WordPress Integration

### Option 1: Debug Server Proxy

1. Create a proxy server that intercepts WordPress requests
2. When a request matches a breakpoint file, launch phpdbg
3. Proxy waits for debugging session to complete
4. Return response to browser

### Option 2: Xdebug Protocol

Instead of phpdbg, use Xdebug with DBGp protocol:

1. Install Xdebug PHP extension
2. Implement DBGp client in Node.js
3. More mature ecosystem and tools available

### Option 3: Development Server

1. Bundle a PHP development server with the app
2. Automatically configure it with debugging enabled
3. User accesses WordPress through this server

## Testing phpdbg Integration

1. Create test PHP files in `/tmp`
2. Set breakpoints
3. Run phpdbg and verify it stops at breakpoints
4. Test all debug commands
5. Verify variable inspection works
6. Test with actual WordPress files

## Resources

- [phpdbg Documentation](https://www.php.net/manual/en/book.phpdbg.php)
- [DBGp Protocol Specification](https://xdebug.org/docs/dbgp)
- [Xdebug Documentation](https://xdebug.org/docs/)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)

## Challenges

1. **Path Mapping**: Web server paths vs file system paths
2. **State Synchronization**: Keeping UI in sync with debugger state
3. **Performance**: Multiple debug sessions, large files
4. **Error Handling**: phpdbg crashes, invalid breakpoints
5. **PHP Versions**: Different phpdbg implementations across PHP versions
