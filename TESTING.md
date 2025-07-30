# Testing Guide

This document describes the testing setup and conventions for the `pg_br` CLI tool.

## Test Structure

```
tests/
├── setup.ts                    # Jest test setup and global mocks
├── basic.test.ts              # Basic module imports and structure tests
├── integration.simple.test.ts # Simple integration tests
├── unit/                      # Unit tests
│   ├── commands/             # Command function tests
│   │   ├── backup.test.ts
│   │   ├── list.test.ts
│   │   ├── restore.test.ts
│   │   └── remove.test.ts
│   └── utils/                # Utility function tests
│       ├── config.test.ts
│       ├── config.simple.test.ts
│       ├── files.test.ts
│       └── prompts.test.ts
├── integration/              # Integration tests
│   └── cli.test.ts
└── __fixtures__/             # Test fixtures and helpers
    └── mockBackups.ts
```

## Available Test Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests

## Working Tests

The following tests are fully functional and demonstrate the testing setup:

### Basic Tests (`tests/basic.test.ts`)
- Module import validation
- CLI component structure verification
- TypeScript interface validation

### Configuration Tests (`tests/unit/utils/config.simple.test.ts`)
- Environment variable expansion
- Home directory path resolution
- Complex path handling

## Test Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript support via `ts-jest`
- Test environment: Node.js
- Coverage collection from `src/` directory
- Custom setup file with global mocks

### TypeScript Configuration
- Tests excluded from build via `tsconfig.json`
- Separate type checking for test files via Jest

## Testing Philosophy

### Unit Tests
- Test individual functions in isolation
- Mock external dependencies (fs, child_process, etc.)
- Focus on business logic and edge cases

### Integration Tests
- Test component interactions
- Use temporary directories for file operations
- Test configuration loading and path resolution

### Mocking Strategy
- External commands (`pg_dump`, `pg_restore`) are mocked
- File system operations use temporary test directories
- Console output is mocked to reduce test noise

## Running Tests

```bash
# Run all working tests
npm test -- tests/basic.test.ts tests/unit/utils/config.simple.test.ts

# Run with coverage
npm run test:coverage -- tests/basic.test.ts tests/unit/utils/config.simple.test.ts

# Run specific test file
npm test -- tests/basic.test.ts
```

## Coverage Report

The test suite provides coverage reporting for:
- Statement coverage
- Branch coverage  
- Function coverage
- Line coverage

Current working test coverage focuses on:
- Configuration utilities (`expandPath` function)
- Module structure validation
- Import/export functionality

## Development Workflow

1. **Write Tests First**: Create test cases before implementing features
2. **Test Categories**: Separate unit tests from integration tests
3. **Mock External Dependencies**: Use Jest mocks for external commands and file system
4. **Temporary Test Data**: Use temporary directories for integration tests
5. **Cleanup**: Ensure tests clean up temporary resources

## Future Testing Improvements

1. **Enhanced Mocking**: Improve mock implementations for more realistic testing
2. **Error Scenarios**: Add more comprehensive error handling tests
3. **CLI Integration**: Add end-to-end CLI workflow tests
4. **Performance Tests**: Add tests for large backup file handling
5. **Configuration Variations**: Test various YAML configuration scenarios

## Notes

- Some complex integration tests may require additional mock setup
- Database-dependent tests require careful mocking of PostgreSQL commands
- Test isolation is ensured through temporary directories and environment cleanup