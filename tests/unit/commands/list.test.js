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
const list_1 = require("../../../src/commands/list");
const fileUtils = __importStar(require("../../../src/utils/files"));
globals_1.jest.mock('fs');
globals_1.jest.mock('../../../src/utils/files');
const mockExistsSync = fs_1.existsSync;
const mockGetBackupDirectory = fileUtils.getBackupDirectory;
const mockGetDetailedBackupFiles = fileUtils.getDetailedBackupFiles;
(0, globals_1.describe)('List Command', () => {
    const mockProcessExit = globals_1.jest.spyOn(process, 'exit').mockImplementation();
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockProcessExit.mockClear();
    });
    (0, globals_1.it)('should display backup directory path', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        mockGetBackupDirectory.mockReturnValue('/test/backup/path');
        mockExistsSync.mockReturnValue(true);
        mockGetDetailedBackupFiles.mockReturnValue([]);
        (0, list_1.listCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Listing backups from: /test/backup/path');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should display message when backup directory does not exist', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        mockGetBackupDirectory.mockReturnValue('/nonexistent/path');
        mockExistsSync.mockReturnValue(false);
        (0, list_1.listCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('No backup directory found.');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should display message when no backup files found', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        mockGetBackupDirectory.mockReturnValue('/test/backup/path');
        mockExistsSync.mockReturnValue(true);
        mockGetDetailedBackupFiles.mockReturnValue([]);
        (0, list_1.listCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('No backup files found.');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should display backup files with details', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            {
                name: 'backup1.dump',
                path: '/test/backup1.dump',
                size: 1048576, // 1 MB
                created: new Date('2023-01-01T10:00:00Z'),
                modified: new Date('2023-01-01T10:00:00Z'),
            },
            {
                name: 'backup2.dump',
                path: '/test/backup2.dump',
                size: 2097152, // 2 MB
                created: new Date('2023-01-02T15:30:00Z'),
                modified: new Date('2023-01-02T15:30:00Z'),
            },
        ];
        mockGetBackupDirectory.mockReturnValue('/test/backup/path');
        mockExistsSync.mockReturnValue(true);
        mockGetDetailedBackupFiles.mockReturnValue(mockFiles);
        (0, list_1.listCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Found 2 backup(s):');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('📁 backup1.dump');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('   Size: 1.00 MB');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('📁 backup2.dump');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('   Size: 2.00 MB');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should format file sizes correctly', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            {
                name: 'small.dump',
                path: '/test/small.dump',
                size: 512000, // 0.5 MB
                created: new Date('2023-01-01T10:00:00Z'),
                modified: new Date('2023-01-01T10:00:00Z'),
            },
            {
                name: 'large.dump',
                path: '/test/large.dump',
                size: 10485760, // 10 MB
                created: new Date('2023-01-01T10:00:00Z'),
                modified: new Date('2023-01-01T10:00:00Z'),
            },
        ];
        mockGetBackupDirectory.mockReturnValue('/test/backup/path');
        mockExistsSync.mockReturnValue(true);
        mockGetDetailedBackupFiles.mockReturnValue(mockFiles);
        (0, list_1.listCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('   Size: 0.49 MB');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('   Size: 10.00 MB');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should display creation dates and times', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            {
                name: 'test.dump',
                path: '/test/test.dump',
                size: 1024,
                created: new Date('2023-12-25T14:30:45Z'),
                modified: new Date('2023-12-25T14:30:45Z'),
            },
        ];
        mockGetBackupDirectory.mockReturnValue('/test/backup/path');
        mockExistsSync.mockReturnValue(true);
        mockGetDetailedBackupFiles.mockReturnValue(mockFiles);
        (0, list_1.listCommand)();
        // The exact format will depend on locale, but should contain date and time
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith(globals_1.expect.stringMatching(/Created: .* .*/));
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should handle errors and exit with code 1', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
        mockGetBackupDirectory.mockImplementation(() => {
            throw new Error('Access denied');
        });
        (0, list_1.listCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Error listing backups:', 'Access denied');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
    });
});
