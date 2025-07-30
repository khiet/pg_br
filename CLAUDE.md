# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`pg_br` is a minimal TypeScript CLI tool that echoes command line arguments. It serves as a simple example of a Node.js CLI application built with TypeScript.

## Architecture

### Core Structure
- **Entry Point**: `/Users/khietle/pg_br/src/cli.ts` - Single file containing the CLI logic
- **Build Output**: `/Users/khietle/pg_br/dist/cli.js` - Compiled JavaScript executable
- **Package Binary**: Configured as `pg_br` command in package.json bin field

### Key Files
- `src/cli.ts` - Main CLI implementation (6 lines of TypeScript)
- `package.json` - Package configuration with bin setup
- `tsconfig.json` - TypeScript compilation configuration
- `dist/cli.js` - Compiled output with shebang for CLI execution

## Development Workflow

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript using `tsc`
- `npm run dev <args>` - Run directly with ts-node for development
- `npm test` - Not implemented (placeholder script)

### Build System
- **Compiler**: TypeScript 5.8.3 with strict mode enabled
- **Target**: ES2016 with CommonJS modules
- **Input**: `./src` directory (rootDir)
- **Output**: `./dist` directory (outDir)
- **Development**: Uses ts-node for direct TypeScript execution

### TypeScript Configuration
- Strict type checking enabled
- ES module interop for CommonJS compatibility
- Force consistent casing in file names
- Skip lib check for faster compilation
- Source files in `src/`, compiled output in `dist/`

## CLI Implementation Details

### Argument Processing
The CLI uses Node.js built-in `process.argv` to handle command line arguments:
- `process.argv.slice(2)` removes node executable and script path
- Arguments are joined with spaces and echoed to stdout
- No argument parsing library used (commander, yargs, etc.)

### Executable Setup
- Shebang: `#!/usr/bin/env node` in both source and compiled files
- Binary name: `pg_br` (matches package name)
- Global installation supported via `npm install -g .`

## Dependencies

### Runtime Dependencies
- None (uses only Node.js built-ins)

### Development Dependencies
- `typescript` (^5.8.3) - TypeScript compiler
- `ts-node` (^10.9.2) - Direct TypeScript execution for development
- `@types/node` (^24.1.0) - Node.js type definitions

## Git Configuration
The `.gitignore` excludes:
- `node_modules/` - npm dependencies
- `dist/` - compiled output
- `*.log` - log files
- `.DS_Store` - macOS system files

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev hello    # Run with ts-node: outputs "hello"
npm run build        # Compile TypeScript
./dist/cli.js hello  # Run compiled version: outputs "hello"
```

### Global Installation
```bash
npm install -g .     # Install globally
pg_br hello world    # Use globally: outputs "hello world"
```

## Code Patterns

### Simple CLI Pattern
This codebase demonstrates the minimal viable CLI pattern:
1. Shebang for executable permission
2. Process argv for argument handling
3. Direct console output
4. No external dependencies for core functionality

### TypeScript Setup
Standard TypeScript configuration for Node.js CLI tools:
- CommonJS modules for Node.js compatibility
- Strict typing for code quality
- Separate source and dist directories
- Development workflow with ts-node

## Testing
No testing framework is currently configured. The package.json includes a placeholder test script that exits with error.

## Maintenance Notes
- Single file CLI implementation makes it easy to understand and modify
- Build process is straightforward TypeScript compilation
- No complex dependencies or build tools
- Ready for extension with argument parsing libraries if needed