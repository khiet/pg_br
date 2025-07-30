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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const child_process_1 = require("child_process");
const remove_1 = require("../../../src/commands/remove");
const fileUtils = __importStar(require("../../../src/utils/files"));
const promptUtils = __importStar(require("../../../src/utils/prompts"));
globals_1.jest.mock('child_process');
globals_1.jest.mock('../../../src/utils/files');
globals_1.jest.mock('../../../src/utils/prompts');
const mockExecSync = child_process_1.execSync;
const mockGetBackupFiles = fileUtils.getBackupFiles;
const mockPromptMultiFileSelection = promptUtils.promptMultiFileSelection;
const mockPromptConfirmation = promptUtils.promptConfirmation;
(0, globals_1.describe)('Remove Command', () => {
    const mockProcessExit = globals_1.jest.spyOn(process, 'exit').mockImplementation();
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockProcessExit.mockClear();
    });
    (0, globals_1.it)('should display message when no backup files found', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        mockGetBackupFiles.mockReturnValue([]);
        (0, remove_1.removeCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('No backup files found in the destination directory.');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Use "pg_br ls" to check available backups.');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should handle cancelled selection', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            { name: 'backup1.dump', path: '/test/backup1.dump' },
        ];
        mockGetBackupFiles.mockReturnValue(mockFiles);
        mockPromptMultiFileSelection.mockResolvedValue([]);
        (0, remove_1.removeCommand)();
        // Wait for async operations
        yield new Promise(resolve => setTimeout(resolve, 0));
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('No files selected.');
        consoleSpy.mockRestore();
    }));
    (0, globals_1.it)('should handle cancelled confirmation', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            { name: 'backup1.dump', path: '/test/backup1.dump' },
        ];
        mockGetBackupFiles.mockReturnValue(mockFiles);
        mockPromptMultiFileSelection.mockResolvedValue(['/test/backup1.dump']);
        mockPromptConfirmation.mockResolvedValue(false);
        (0, remove_1.removeCommand)();
        // Wait for async operations
        yield new Promise(resolve => setTimeout(resolve, 0));
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Operation cancelled.');
        consoleSpy.mockRestore();
    }));
    (0, globals_1.it)('should successfully remove selected files', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            { name: 'backup1.dump', path: '/test/backup1.dump' },
            { name: 'backup2.dump', path: '/test/backup2.dump' },
        ];
        mockGetBackupFiles.mockReturnValue(mockFiles);
        mockPromptMultiFileSelection.mockResolvedValue(['/test/backup1.dump', '/test/backup2.dump']);
        mockPromptConfirmation.mockResolvedValue(true);
        (0, remove_1.removeCommand)();
        // Wait for async operations
        yield new Promise(resolve => setTimeout(resolve, 0));
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith('rm "/test/backup1.dump"', { stdio: 'pipe' });
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith('rm "/test/backup2.dump"', { stdio: 'pipe' });
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup1.dump');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup2.dump');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('\nOperation completed: 2 removed, 0 failed.');
        consoleSpy.mockRestore();
    }));
    (0, globals_1.it)('should handle partial removal failures', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const consoleErrorSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
        const mockFiles = [
            { name: 'backup1.dump', path: '/test/backup1.dump' },
            { name: 'backup2.dump', path: '/test/backup2.dump' },
        ];
        mockGetBackupFiles.mockReturnValue(mockFiles);
        mockPromptMultiFileSelection.mockResolvedValue(['/test/backup1.dump', '/test/backup2.dump']);
        mockPromptConfirmation.mockResolvedValue(true);
        // Mock first file removal success, second file removal failure
        mockExecSync
            .mockImplementationOnce(() => { }) // Success
            .mockImplementationOnce(() => {
            throw new Error('Permission denied');
        }); // Failure
        (0, remove_1.removeCommand)();
        // Wait for async operations
        yield new Promise(resolve => setTimeout(resolve, 0));
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup1.dump');
        (0, globals_1.expect)(consoleErrorSpy).toHaveBeenCalledWith('✗ Failed to remove: backup2.dump');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('\nOperation completed: 1 removed, 1 failed.');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    }));
    (0, globals_1.it)('should handle file selection errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
        const mockFiles = [
            { name: 'backup1.dump', path: '/test/backup1.dump' },
        ];
        mockGetBackupFiles.mockReturnValue(mockFiles);
        mockPromptMultiFileSelection.mockRejectedValue(new Error('Invalid selection'));
        (0, remove_1.removeCommand)();
        // Wait for async operations
        yield new Promise(resolve => setTimeout(resolve, 0));
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✗ Remove failed:', 'Invalid selection');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
    }));
    (0, globals_1.it)('should handle general errors in try-catch', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
        mockGetBackupFiles.mockImplementation(() => {
            throw new Error('File system error');
        });
        (0, remove_1.removeCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✗ Remove failed:', 'File system error');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should properly handle file paths with spaces', () => __awaiter(void 0, void 0, void 0, function* () {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        const mockFiles = [
            { name: 'backup with spaces.dump', path: '/test/backup with spaces.dump' },
        ];
        mockGetBackupFiles.mockReturnValue(mockFiles);
        mockPromptMultiFileSelection.mockResolvedValue(['/test/backup with spaces.dump']);
        mockPromptConfirmation.mockResolvedValue(true);
        (0, remove_1.removeCommand)();
        // Wait for async operations
        yield new Promise(resolve => setTimeout(resolve, 0));
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith('rm "/test/backup with spaces.dump"', { stdio: 'pipe' });
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup with spaces.dump');
        consoleSpy.mockRestore();
    }));
    (0, globals_1.it)('should display preparation message', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
        mockGetBackupFiles.mockReturnValue([]);
        (0, remove_1.removeCommand)();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Preparing to remove backup files...');
        consoleSpy.mockRestore();
    });
});
