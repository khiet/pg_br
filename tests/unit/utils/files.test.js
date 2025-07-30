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
const files_1 = require("../../../src/utils/files");
const configUtils = __importStar(require("../../../src/utils/config"));
globals_1.jest.mock('fs');
globals_1.jest.mock('../../../src/utils/config');
const mockExistsSync = fs_1.existsSync;
const mockReaddirSync = fs_1.readdirSync;
const mockStatSync = fs_1.statSync;
const mockLoadConfig = configUtils.loadConfig;
(0, globals_1.describe)('File Utils', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('getBackupDirectory', () => {
        (0, globals_1.it)('should return configured destination when available', () => {
            mockLoadConfig.mockReturnValue({ destination: '/custom/backup/path' });
            const result = (0, files_1.getBackupDirectory)();
            (0, globals_1.expect)(result).toBe('/custom/backup/path');
        });
        (0, globals_1.it)('should return current working directory when no config', () => {
            mockLoadConfig.mockReturnValue({});
            const result = (0, files_1.getBackupDirectory)();
            (0, globals_1.expect)(result).toBe(process.cwd());
        });
    });
    (0, globals_1.describe)('getBackupFiles', () => {
        const mockStats = {
            birthtime: new Date('2023-01-01T10:00:00Z'),
            isDirectory: () => false,
        };
        (0, globals_1.beforeEach)(() => {
            mockLoadConfig.mockReturnValue({ destination: '/test/backups' });
        });
        (0, globals_1.it)('should return empty array when directory does not exist', () => {
            mockExistsSync.mockReturnValue(false);
            const result = (0, files_1.getBackupFiles)();
            (0, globals_1.expect)(result).toEqual([]);
        });
        (0, globals_1.it)('should return backup files sorted by creation date', () => {
            const file1Stats = Object.assign(Object.assign({}, mockStats), { birthtime: new Date('2023-01-01T10:00:00Z') });
            const file2Stats = Object.assign(Object.assign({}, mockStats), { birthtime: new Date('2023-01-02T10:00:00Z') });
            mockExistsSync.mockReturnValue(true);
            mockReaddirSync.mockReturnValue(['backup1.dump', 'backup2.dump', 'other.txt']);
            mockStatSync
                .mockReturnValueOnce(file1Stats)
                .mockReturnValueOnce(file2Stats);
            const result = (0, files_1.getBackupFiles)();
            (0, globals_1.expect)(result).toHaveLength(2);
            (0, globals_1.expect)(result[0].name).toBe('backup2.dump'); // Newer first
            (0, globals_1.expect)(result[1].name).toBe('backup1.dump');
            (0, globals_1.expect)(result[0].path).toBe('/test/backups/backup2.dump');
        });
        (0, globals_1.it)('should filter out non-dump files', () => {
            mockExistsSync.mockReturnValue(true);
            mockReaddirSync.mockReturnValue(['backup.dump', 'readme.txt', 'config.yml']);
            mockStatSync.mockReturnValue(mockStats);
            const result = (0, files_1.getBackupFiles)();
            (0, globals_1.expect)(result).toHaveLength(1);
            (0, globals_1.expect)(result[0].name).toBe('backup.dump');
        });
        (0, globals_1.it)('should handle file reading errors gracefully', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
            mockExistsSync.mockReturnValue(true);
            mockReaddirSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });
            const result = (0, files_1.getBackupFiles)();
            (0, globals_1.expect)(result).toEqual([]);
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Error reading backup directory:', 'Permission denied');
            consoleSpy.mockRestore();
        });
    });
    (0, globals_1.describe)('getDetailedBackupFiles', () => {
        const mockStats = {
            birthtime: new Date('2023-01-01T10:00:00Z'),
            mtime: new Date('2023-01-01T11:00:00Z'),
            size: 1024,
            isDirectory: () => false,
        };
        (0, globals_1.beforeEach)(() => {
            mockLoadConfig.mockReturnValue({ destination: '/test/backups' });
        });
        (0, globals_1.it)('should return detailed backup file information', () => {
            mockExistsSync.mockReturnValue(true);
            mockReaddirSync.mockReturnValue(['backup.dump']);
            mockStatSync.mockReturnValue(mockStats);
            const result = (0, files_1.getDetailedBackupFiles)();
            (0, globals_1.expect)(result).toHaveLength(1);
            (0, globals_1.expect)(result[0]).toEqual({
                name: 'backup.dump',
                path: '/test/backups/backup.dump',
                size: 1024,
                created: mockStats.birthtime,
                modified: mockStats.mtime,
            });
        });
        (0, globals_1.it)('should return empty array when directory does not exist', () => {
            mockExistsSync.mockReturnValue(false);
            const result = (0, files_1.getDetailedBackupFiles)();
            (0, globals_1.expect)(result).toEqual([]);
        });
        (0, globals_1.it)('should handle errors and return empty array', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
            mockExistsSync.mockReturnValue(true);
            mockReaddirSync.mockImplementation(() => {
                throw new Error('Access denied');
            });
            const result = (0, files_1.getDetailedBackupFiles)();
            (0, globals_1.expect)(result).toEqual([]);
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
