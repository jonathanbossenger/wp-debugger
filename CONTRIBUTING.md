# Contributing to WordPress Debugger

Thank you for your interest in contributing to WordPress Debugger!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/jonathanbossenger/wp-debugger.git
cd wp-debugger
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed information about the project architecture.

## Making Changes

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Test your changes thoroughly
4. Commit with clear, descriptive messages
5. Push your branch and create a pull request

## Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and modular

## Testing

Currently, the application uses manual testing. Future contributions to add automated tests are welcome.

### Manual Testing Checklist

- [ ] Directory selection works
- [ ] WordPress validation works correctly
- [ ] File tree loads and expands properly
- [ ] Files open and display correctly
- [ ] Breakpoints can be set and removed
- [ ] Debug controls enable/disable appropriately
- [ ] UI is responsive and elements are properly styled

## Future Development Areas

### High Priority

1. **phpdbg Integration**: Implement actual debugging with phpdbg
2. **Browser Integration**: Connect debugging to WordPress site in browser
3. **Variable Inspection**: Real-time variable value display
4. **Stack Trace**: Show call stack during debugging

### Medium Priority

5. **Syntax Highlighting**: Add proper PHP syntax highlighting
6. **Search**: File and code search functionality
7. **Settings**: User preferences and configuration
8. **Session Management**: Save and restore debug sessions

### Low Priority

9. **Themes**: Light/dark theme toggle
10. **Plugin Support**: WordPress plugin debugging features
11. **Multi-instance**: Debug multiple WordPress sites simultaneously
12. **Export**: Export debug logs and breakpoints

## Reporting Issues

When reporting issues, please include:

- Operating system and version
- Node.js and npm versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or discussions about the project.
