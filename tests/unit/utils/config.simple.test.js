"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const config_1 = require("../../../src/utils/config");
(0, globals_1.describe)('Config Utils - Simple Tests', () => {
    (0, globals_1.beforeEach)(() => {
        delete process.env.TEST_VAR;
        delete process.env.HOME;
    });
    (0, globals_1.describe)('expandPath', () => {
        (0, globals_1.it)('should expand environment variables with braces', () => {
            process.env.TEST_VAR = '/test/path';
            const result = (0, config_1.expandPath)('${TEST_VAR}/subdir');
            (0, globals_1.expect)(result).toBe('/test/path/subdir');
        });
        (0, globals_1.it)('should expand environment variables without braces', () => {
            process.env.TEST_VAR = '/test/path';
            const result = (0, config_1.expandPath)('$TEST_VAR/subdir');
            (0, globals_1.expect)(result).toBe('/test/path/subdir');
        });
        (0, globals_1.it)('should expand home directory', () => {
            const result = (0, config_1.expandPath)('~/Documents');
            // Should use the actual home directory from os.homedir()
            (0, globals_1.expect)(result).toContain('/Documents');
            (0, globals_1.expect)(result).not.toContain('~');
        });
        (0, globals_1.it)('should handle missing environment variables', () => {
            const result = (0, config_1.expandPath)('$MISSING_VAR/path');
            (0, globals_1.expect)(result).toBe('$MISSING_VAR/path');
        });
        (0, globals_1.it)('should handle complex path with multiple variables', () => {
            process.env.PROJECT = 'myproject';
            const result = (0, config_1.expandPath)('~/${PROJECT}/data');
            (0, globals_1.expect)(result).toContain('myproject/data');
            (0, globals_1.expect)(result).not.toContain('~');
            (0, globals_1.expect)(result).not.toContain('${PROJECT}');
        });
    });
});
