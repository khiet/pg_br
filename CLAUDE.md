# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`pg_br` is a TypeScript CLI tool for PostgreSQL database backup management. It provides commands to backup, list, restore, and remove PostgreSQL database dump files with interactive prompts and YAML configuration support.

## Architecture

### Core Structure

- **Entry Point**: `src/cli.ts` - Simple command router that delegates to modular command implementations
- **Command Modules**: `src/commands/` - Individual command implementations (backup, list, restore, remove)
- **Utilities**: `src/utils/` - Shared functionality for config, file operations, and interactive prompts
- **Types**: `src/types/` - TypeScript interfaces and type definitions
- **Build Output**: `dist/cli.js` - Compiled JavaScript executable with shebang
- **Package Binary**: Configured as `pg_br` command in package.json bin field
- **Configuration**: `~/.pg_br.yml` - Optional YAML config file for backup destination

### Key Components

- **Command Router**: Simple if/else chain in `src/cli.ts` that delegates to individual command modules
- **Config System**: `src/utils/config.ts` - YAML-based configuration with environment variable expansion
- **Interactive Prompts**: `src/utils/prompts.ts` - Readline-based prompts for file selection and confirmations
- **File Operations**: `src/utils/files.ts` - Backup file discovery and management utilities
- **PostgreSQL Integration**: Command modules shell out to `pg_dump` and `pg_restore` commands

## Development Workflow

### Essential Commands

```bash
npm install                    # Install dependencies
npm run dev <command> <args>   # Run with tsx for development
npm run build                  # Compile TypeScript to JavaScript
npm run test                   # Run all tests with Jest
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage report
npm run test:unit              # Run only unit tests
npm run test:integration       # Run only integration tests
npm run lint                   # Run ESLint on TypeScript files
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier
npm run format:check           # Check if code is properly formatted
npm run typecheck              # Run TypeScript type checking without emit
```

### Code Quality Tools

- **ESLint 9.x**: Modern flat config with TypeScript support and Prettier integration
- **Prettier 3.x**: Code formatting with single quotes, 2-space indent, 100 char width
- **TypeScript 5.8.3**: Strict mode enabled, ES modules with Node16 module resolution
- **Jest**: Testing framework with ts-jest preset, comprehensive unit and integration tests
- **tsx**: Modern TypeScript runner for development, replacing ts-node

## CLI Commands Architecture

### Command Structure

All commands follow this modular pattern:

1. **Router** (`src/cli.ts`) - Argument validation and command delegation
2. **Command Implementation** (`src/commands/*.ts`) - Individual command logic
3. **Config loading** - Load `~/.pg_br.yml` using `src/utils/config.ts`
4. **Interactive prompts** - Use `src/utils/prompts.ts` for user input
5. **File operations** - Use `src/utils/files.ts` for backup management
6. **Error handling** - Consistent error messages and exit codes

### Available Commands

- `pg_br backup <database_name> <backup_name>` - Create PostgreSQL backup using pg_dump
- `pg_br ls` - List all backup files from configured destination
- `pg_br restore <database_name>` - Interactive restore from backup file selection
- `pg_br remove` - Interactive multi-file removal with confirmation
- `pg_br help` - Show usage information

### Configuration System

The `src/utils/config.ts` module handles:

- YAML parsing of `~/.pg_br.yml` configuration file
- Environment variable expansion (`$VAR`, `${VAR}`)
- Home directory expansion (`~`)
- Graceful fallback when config file doesn't exist

### Interactive Components

- **File Selection**: `promptFileSelection()` for single file choice (restore)
- **Multi-File Selection**: `promptMultiFileSelection()` for multiple files with ranges (remove)
- **Confirmation**: `promptConfirmation()` for destructive operations
- **Input Validation**: Comprehensive error checking for user input

## Key Utilities

### Path and Config Management (`src/utils/config.ts`)

- `expandPath()` - Expands environment variables and home directory in paths
- `loadConfig()` - Loads and processes YAML configuration with path expansion

### File Operations (`src/utils/files.ts`)

- `getBackupFiles()` - Scans backup directory for .dump files, returns sorted by date
- File listing and metadata extraction for backup management

### Command Implementations (`src/commands/`)

- `backupCommand()` - Executes pg_dump with standard flags (--verbose --clean --no-acl --no-owner)
- `restoreCommand()` - Interactive restore with file selection and pg_restore execution
- `removeCommand()` - Interactive multi-file deletion with confirmation
- `listCommand()` - Display available backup files

### Interactive Prompts (`src/utils/prompts.ts`)

- Support for individual selections (`1,3,5`) and ranges (`1-3,7-9`)
- Duplicate removal and input validation
- Consistent error messaging and graceful cancellation

## Dependencies

### Runtime Dependencies

- `js-yaml` (^4.1.0) - YAML configuration parsing
- `readline` (^1.3.0) - Interactive command-line prompts
- `@types/js-yaml` (^4.0.9) - TypeScript definitions for js-yaml

### Development Dependencies

- TypeScript toolchain with strict mode and ES module support
- ESLint 9.x with TypeScript parser and rules
- Prettier 3.x with ESLint integration
- tsx for modern TypeScript development workflow
- Jest with ts-jest for comprehensive testing
- @types packages for TypeScript definitions

### External Tools Required

- `pg_dump` - PostgreSQL backup utility
- `pg_restore` - PostgreSQL restore utility
- `rm` - File removal (standard Unix command)

## Error Handling Patterns

### Consistent Error Reporting

- All errors use `console.error()` for stderr output
- Exit codes: 0 for success, 1 for errors
- User-friendly error messages with usage hints
- Graceful handling of missing external dependencies

### Interactive Error Handling

- Input validation with helpful error messages
- Cancellation support for all interactive operations
- File operation error reporting with success/failure counts

## Configuration File Format

The `~/.pg_br.yml` configuration supports:

```yaml
# Backup destination directory with environment variable support
destination: ~/backups/postgresql/
# OR using environment variables:
destination: ${HOME}/pg_backups/
destination: $DEVS_HOME/dumps/
```

## Code Style and Patterns

### Formatting Standards

- Single quotes for strings
- 2-space indentation (no tabs)
- 100 character line width
- Trailing commas in ES5-compatible positions
- Semicolons required

### TypeScript Patterns

- Strict mode enabled with comprehensive type checking
- Interface definitions for configuration structures (`src/types/index.ts`)
- Explicit error handling with instanceof checks
- ES modules with Node16 module resolution for modern Node.js compatibility
- Modular architecture with clear separation of concerns

### CLI Patterns

- Simple argument parsing with `process.argv.slice(2)` in main router
- Command routing via if/else chain that delegates to modular command implementations
- Modular command structure with separation of concerns
- Consistent help text formatting and examples
- Interactive prompts using Node.js readline module

## Testing

### Test Structure

- **Unit Tests**: `tests/unit/` - Test individual functions and modules in isolation
- **Integration Tests**: `tests/integration/` - Test command flows and file operations
- **Test Fixtures**: `tests/__fixtures__/` - Mock data and test utilities
- **Jest Configuration**: Comprehensive test setup with coverage reporting

### Testing Commands

- `npm run test` - Run all tests
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests  
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Generate coverage reports
