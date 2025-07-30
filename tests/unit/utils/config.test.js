"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const fs_1 = require("fs");
const yaml = __importStar(require("js-yaml"));
const config_1 = require("../../../src/utils/config");
globals_1.jest.mock('fs');
globals_1.jest.mock('js-yaml');
const mockExistsSync = fs_1.existsSync;
const mockReadFileSync = fs_1.readFileSync;
const mockYamlLoad = yaml.load;
(0, globals_1.describe)('Config Utils', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        delete process.env.TEST_VAR;
        delete process.env.HOME;
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.clearAllMocks();
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
            process.env.HOME = '/home/user';
            const result = (0, config_1.expandPath)('~/Documents');
            (0, globals_1.expect)(result).toBe('/home/user/Documents');
        });
        (0, globals_1.it)('should handle missing environment variables', () => {
            const result = (0, config_1.expandPath)('$MISSING_VAR/path');
            (0, globals_1.expect)(result).toBe('$MISSING_VAR/path');
        });
        (0, globals_1.it)('should handle complex path with multiple variables', () => {
            process.env.HOME = '/home/user';
            process.env.PROJECT = 'myproject';
            const result = (0, config_1.expandPath)('~/${PROJECT}/data');
            (0, globals_1.expect)(result).toBe('/home/user/myproject/data');
        });
    });
    (0, globals_1.describe)('loadConfig', () => {
        (0, globals_1.it)('should return empty config when file does not exist', () => {
            mockExistsSync.mockReturnValue(false);
            const result = (0, config_1.loadConfig)();
            (0, globals_1.expect)(result).toEqual({});
            (0, globals_1.expect)(mockExistsSync).toHaveBeenCalled();
        });
        (0, globals_1.it)('should load and parse YAML config file', () => {
            const mockConfig = { destination: '/test/path' };
            mockExistsSync.mockReturnValue(true);
            mockReadFileSync.mockReturnValue('destination: /test/path');
            mockYamlLoad.mockReturnValue(mockConfig);
            const result = (0, config_1.loadConfig)();
            (0, globals_1.expect)(result).toEqual(mockConfig);
            (0, globals_1.expect)(mockReadFileSync).toHaveBeenCalled();
            (0, globals_1.expect)(mockYamlLoad).toHaveBeenCalledWith('destination: /test/path');
        });
        (0, globals_1.it)('should expand paths in config', () => {
            process.env.HOME = '/home/user';
            const mockConfig = { destination: '~/backups' };
            mockExistsSync.mockReturnValue(true);
            mockReadFileSync.mockReturnValue('destination: ~/backups');
            mockYamlLoad.mockReturnValue(mockConfig);
            const result = (0, config_1.loadConfig)();
            (0, globals_1.expect)(result.destination).toBe('/home/user/backups');
        });
        (0, globals_1.it)('should handle YAML parsing errors gracefully', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'warn').mockImplementation();
            mockExistsSync.mockReturnValue(true);
            mockReadFileSync.mockReturnValue('invalid: yaml: content');
            mockYamlLoad.mockImplementation(() => {
                throw new Error('Invalid YAML');
            });
            const result = (0, config_1.loadConfig)();
            (0, globals_1.expect)(result).toEqual({});
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith(globals_1.expect.stringContaining('Warning: Failed to load config file'));
            consoleSpy.mockRestore();
        });
        (0, globals_1.it)('should handle file reading errors gracefully', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'warn').mockImplementation();
            mockExistsSync.mockReturnValue(true);
            mockReadFileSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });
            const result = (0, config_1.loadConfig)();
            (0, globals_1.expect)(result).toEqual({});
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith(globals_1.expect.stringContaining('Warning: Failed to load config file'));
            consoleSpy.mockRestore();
        });
    });
});
