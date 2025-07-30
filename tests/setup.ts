import { jest } from '@jest/globals';

// Mock external dependencies
jest.mock('child_process');
jest.mock('fs');
jest.mock('readline');

// Set up test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(() => {}),
  error: jest.fn(() => {}),
  warn: jest.fn(() => {}),
};