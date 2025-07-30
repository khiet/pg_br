"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Basic Tests', () => {
    (0, globals_1.it)('should import and run CLI components', () => {
        // Test that the main modules can be imported without errors
        (0, globals_1.expect)(() => {
            const { expandPath } = require('../src/utils/config');
            const result = expandPath('test/path');
            (0, globals_1.expect)(result).toBe('test/path');
        }).not.toThrow();
    });
    (0, globals_1.it)('should validate CLI module structure', () => {
        // Test that all commands can be imported
        (0, globals_1.expect)(() => {
            const commands = require('../src/commands');
            (0, globals_1.expect)(typeof commands.backupCommand).toBe('function');
            (0, globals_1.expect)(typeof commands.listCommand).toBe('function');
            (0, globals_1.expect)(typeof commands.restoreCommand).toBe('function');
            (0, globals_1.expect)(typeof commands.removeCommand).toBe('function');
        }).not.toThrow();
    });
    (0, globals_1.it)('should validate utility module structure', () => {
        // Test that all utilities can be imported
        (0, globals_1.expect)(() => {
            const utils = require('../src/utils');
            (0, globals_1.expect)(typeof utils.expandPath).toBe('function');
            (0, globals_1.expect)(typeof utils.loadConfig).toBe('function');
            (0, globals_1.expect)(typeof utils.getBackupFiles).toBe('function');
            (0, globals_1.expect)(typeof utils.getDetailedBackupFiles).toBe('function');
            (0, globals_1.expect)(typeof utils.promptFileSelection).toBe('function');
            (0, globals_1.expect)(typeof utils.promptMultiFileSelection).toBe('function');
            (0, globals_1.expect)(typeof utils.promptConfirmation).toBe('function');
        }).not.toThrow();
    });
    (0, globals_1.it)('should validate type definitions', () => {
        // Test that types can be imported
        (0, globals_1.expect)(() => {
            const types = require('../src/types');
            (0, globals_1.expect)(types).toBeDefined();
        }).not.toThrow();
    });
});
