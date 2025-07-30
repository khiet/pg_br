"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
// Mock external dependencies
globals_1.jest.mock('child_process');
globals_1.jest.mock('fs');
globals_1.jest.mock('readline');
// Set up test environment
process.env.NODE_ENV = 'test';
// Mock console methods to reduce noise in tests
global.console = Object.assign(Object.assign({}, console), { log: globals_1.jest.fn(() => { }), error: globals_1.jest.fn(() => { }), warn: globals_1.jest.fn(() => { }) });
