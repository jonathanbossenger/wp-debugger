// Application state
const state = {
  currentDirectory: null,
  currentFile: null,
  currentFileContent: null,
  breakpoints: new Map(), // Map of filePath -> Set of line numbers
  isDebugging: false,
  debugSession: null,
  expandedFolders: new Set()
};

// DOM elements
const selectDirBtn = document.getElementById('select-dir-btn');
const fileTree = document.getElementById('file-tree');
const codeDisplay = document.getElementById('code-display');
const lineNumbers = document.getElementById('line-numbers');
const currentFileSpan = document.getElementById('current-file');
const closeFileBtn = document.getElementById('close-file-btn');
const statusText = document.getElementById('status-text');
const wordpressStatus = document.getElementById('wordpress-status');

// Debug controls
const startDebugBtn = document.getElementById('start-debug-btn');
const stepIntoBtn = document.getElementById('step-into-btn');
const stepOverBtn = document.getElementById('step-over-btn');
const stepOutBtn = document.getElementById('step-out-btn');
const continueBtn = document.getElementById('continue-btn');
const stopDebugBtn = document.getElementById('stop-debug-btn');
const breakpointsList = document.getElementById('breakpoints-list');
const variablesList = document.getElementById('variables-list');
const debugOutput = document.getElementById('debug-output');

// Event listeners
selectDirBtn.addEventListener('click', selectDirectory);
closeFileBtn.addEventListener('click', closeFile);
startDebugBtn.addEventListener('click', startDebugging);
stepIntoBtn.addEventListener('click', () => debugCommand('step-into'));
stepOverBtn.addEventListener('click', () => debugCommand('step-over'));
stepOutBtn.addEventListener('click', () => debugCommand('step-out'));
continueBtn.addEventListener('click', () => debugCommand('continue'));
stopDebugBtn.addEventListener('click', stopDebugging);

// Select WordPress directory
async function selectDirectory() {
  const dirPath = await window.electronAPI.selectDirectory();
  
  if (dirPath) {
    // Check if it's a WordPress directory
    const isWordPress = await window.electronAPI.checkWordPress(dirPath);
    
    if (isWordPress) {
      state.currentDirectory = dirPath;
      wordpressStatus.textContent = `WordPress: ${dirPath}`;
      statusText.textContent = 'WordPress directory loaded';
      await loadFileTree(dirPath);
      startDebugBtn.disabled = false;
    } else {
      alert('The selected directory does not appear to be a WordPress installation. Please select a directory containing wp-config.php');
      statusText.textContent = 'Invalid WordPress directory';
    }
  }
}

// Load and display file tree
async function loadFileTree(dirPath) {
  fileTree.innerHTML = '';
  const rootItem = await createTreeItem(dirPath, dirPath, 0);
  fileTree.appendChild(rootItem);
}

// Create tree item recursively
async function createTreeItem(itemPath, rootPath, level) {
  const items = await window.electronAPI.readDirectory(itemPath);
  const container = document.createElement('div');
  
  // Filter out hidden files and common directories to ignore
  const filtered = items.filter(item => {
    const name = item.name;
    return !name.startsWith('.') && 
           name !== 'node_modules' && 
           name !== 'vendor';
  });
  
  // Sort: directories first, then files
  filtered.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
  
  for (const item of filtered) {
    const itemElement = document.createElement('div');
    itemElement.className = 'tree-item' + (item.isDirectory ? ' directory' : '');
    itemElement.style.paddingLeft = `${16 + level * 16}px`;
    
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = item.isDirectory ? '📁' : '📄';
    
    const name = document.createElement('span');
    name.textContent = item.name;
    
    itemElement.appendChild(icon);
    itemElement.appendChild(name);
    
    if (item.isDirectory) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      childrenContainer.style.display = 'none';
      
      itemElement.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        if (childrenContainer.style.display === 'none') {
          // Expand
          if (childrenContainer.children.length === 0) {
            // Load children if not already loaded
            const children = await createTreeItem(item.path, rootPath, level + 1);
            childrenContainer.appendChild(children);
          }
          childrenContainer.style.display = 'block';
          icon.textContent = '📂';
          state.expandedFolders.add(item.path);
        } else {
          // Collapse
          childrenContainer.style.display = 'none';
          icon.textContent = '📁';
          state.expandedFolders.delete(item.path);
        }
      });
      
      container.appendChild(itemElement);
      container.appendChild(childrenContainer);
    } else {
      // File - only show PHP files and text files
      if (item.name.endsWith('.php') || 
          item.name.endsWith('.js') || 
          item.name.endsWith('.css') ||
          item.name.endsWith('.txt') ||
          item.name.endsWith('.md')) {
        
        itemElement.addEventListener('click', async (e) => {
          e.stopPropagation();
          await openFile(item.path);
          
          // Update selection
          document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
          itemElement.classList.add('selected');
        });
        
        container.appendChild(itemElement);
      }
    }
  }
  
  return container;
}

// Open and display file
async function openFile(filePath) {
  const content = await window.electronAPI.readFile(filePath);
  
  if (content !== null) {
    state.currentFile = filePath;
    state.currentFileContent = content;
    
    const fileName = filePath.split(/[\\/]/).pop();
    currentFileSpan.textContent = fileName;
    closeFileBtn.style.display = 'inline-block';
    
    displayCode(content, filePath);
    statusText.textContent = `Opened: ${fileName}`;
  } else {
    alert('Failed to read file');
  }
}

// Display code with line numbers and breakpoint support
function displayCode(content, filePath) {
  const lines = content.split('\n');
  
  // Generate line numbers
  lineNumbers.innerHTML = '';
  lines.forEach((_, index) => {
    const lineNum = index + 1;
    const lineElement = document.createElement('div');
    lineElement.className = 'line-number';
    lineElement.textContent = lineNum;
    lineElement.dataset.line = lineNum;
    
    // Check if this line has a breakpoint
    if (state.breakpoints.has(filePath) && state.breakpoints.get(filePath).has(lineNum)) {
      lineElement.classList.add('breakpoint');
    }
    
    // Add click handler to toggle breakpoints
    lineElement.addEventListener('click', () => toggleBreakpoint(filePath, lineNum));
    
    lineNumbers.appendChild(lineElement);
  });
  
  // Display code
  const codeLines = lines.map((line, index) => {
    const lineNum = index + 1;
    let className = 'code-line';
    if (state.breakpoints.has(filePath) && state.breakpoints.get(filePath).has(lineNum)) {
      className += ' breakpoint';
    }
    return `<span class="${className}" data-line="${lineNum}">${escapeHtml(line)}</span>`;
  }).join('\n');
  
  codeDisplay.innerHTML = `<code>${codeLines}</code>`;
}

// Toggle breakpoint
function toggleBreakpoint(filePath, lineNum) {
  if (!state.breakpoints.has(filePath)) {
    state.breakpoints.set(filePath, new Set());
  }
  
  const fileBreakpoints = state.breakpoints.get(filePath);
  
  if (fileBreakpoints.has(lineNum)) {
    // Remove breakpoint
    fileBreakpoints.delete(lineNum);
    if (fileBreakpoints.size === 0) {
      state.breakpoints.delete(filePath);
    }
  } else {
    // Add breakpoint
    fileBreakpoints.add(lineNum);
  }
  
  // Refresh display
  if (state.currentFile === filePath && state.currentFileContent) {
    displayCode(state.currentFileContent, filePath);
  }
  
  updateBreakpointsList();
  statusText.textContent = `Breakpoint ${fileBreakpoints.has(lineNum) ? 'added' : 'removed'} at line ${lineNum}`;
}

// Update breakpoints list in debug panel
function updateBreakpointsList() {
  breakpointsList.innerHTML = '';
  
  let hasBreakpoints = false;
  
  state.breakpoints.forEach((lines, filePath) => {
    const fileName = filePath.split(/[\\/]/).pop();
    lines.forEach(lineNum => {
      hasBreakpoints = true;
      
      const item = document.createElement('div');
      item.className = 'breakpoint-item';
      
      const info = document.createElement('span');
      info.textContent = `${fileName}:${lineNum}`;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-breakpoint';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => toggleBreakpoint(filePath, lineNum));
      
      item.appendChild(info);
      item.appendChild(removeBtn);
      breakpointsList.appendChild(item);
    });
  });
  
  if (!hasBreakpoints) {
    breakpointsList.innerHTML = '<p class="placeholder">No breakpoints set</p>';
  }
}

// Close current file
function closeFile() {
  state.currentFile = null;
  state.currentFileContent = null;
  currentFileSpan.textContent = 'No file opened';
  closeFileBtn.style.display = 'none';
  codeDisplay.innerHTML = '<code>Select a file from the tree to view its contents</code>';
  lineNumbers.innerHTML = '';
  statusText.textContent = 'File closed';
}

// Debugging functions
function startDebugging() {
  if (state.breakpoints.size === 0) {
    addDebugMessage('Please set at least one breakpoint before starting debug session', 'error');
    return;
  }
  
  state.isDebugging = true;
  
  // Enable debug controls
  stepIntoBtn.disabled = false;
  stepOverBtn.disabled = false;
  stepOutBtn.disabled = false;
  continueBtn.disabled = false;
  stopDebugBtn.disabled = false;
  startDebugBtn.disabled = true;
  
  addDebugMessage('Debug session started', 'success');
  addDebugMessage('NOTE: This is a simulation. Full phpdbg integration requires server setup.', 'info');
  addDebugMessage('Set breakpoints and they will be shown in the code editor.', 'info');
  
  // Simulate variable display
  displayVariables({
    '$post': 'WP_Post Object',
    '$user': 'WP_User Object',
    '$wpdb': 'wpdb Object',
    '$wp_query': 'WP_Query Object'
  });
  
  statusText.textContent = 'Debugging active';
}

function debugCommand(command) {
  addDebugMessage(`Executing: ${command}`, 'info');
  
  // In a real implementation, this would communicate with phpdbg
  // For now, we'll simulate the behavior
  
  if (command === 'step-into') {
    addDebugMessage('Stepped into function', 'success');
  } else if (command === 'step-over') {
    addDebugMessage('Stepped over line', 'success');
  } else if (command === 'step-out') {
    addDebugMessage('Stepped out of function', 'success');
  } else if (command === 'continue') {
    addDebugMessage('Continuing execution...', 'success');
  }
}

function stopDebugging() {
  state.isDebugging = false;
  
  // Disable debug controls
  stepIntoBtn.disabled = true;
  stepOverBtn.disabled = true;
  stepOutBtn.disabled = true;
  continueBtn.disabled = true;
  stopDebugBtn.disabled = true;
  startDebugBtn.disabled = false;
  
  addDebugMessage('Debug session stopped', 'info');
  variablesList.innerHTML = '<p class="placeholder">Start debugging to see variables</p>';
  statusText.textContent = 'Ready';
}

function addDebugMessage(message, type = 'info') {
  const msgElement = document.createElement('div');
  msgElement.className = `debug-message ${type}`;
  msgElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  debugOutput.appendChild(msgElement);
  debugOutput.scrollTop = debugOutput.scrollHeight;
}

function displayVariables(vars) {
  variablesList.innerHTML = '';
  
  for (const [name, value] of Object.entries(vars)) {
    const item = document.createElement('div');
    item.className = 'variable-item';
    item.innerHTML = `<strong>${name}</strong>: ${value}`;
    variablesList.appendChild(item);
  }
}

// Utility function
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
statusText.textContent = 'Ready - Select a WordPress directory to begin';
