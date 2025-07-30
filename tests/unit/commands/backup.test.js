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
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const backup_1 = require("../../../src/commands/backup");
const configUtils = __importStar(require("../../../src/utils/config"));
globals_1.jest.mock('child_process');
globals_1.jest.mock('fs');
globals_1.jest.mock('../../../src/utils/config');
const mockExecSync = child_process_1.execSync;
const mockExistsSync = fs_1.existsSync;
const mockMkdirSync = fs_1.mkdirSync;
const mockLoadConfig = configUtils.loadConfig;
(0, globals_1.describe)('Backup Command', () => {
    const mockProcessExit = globals_1.jest.spyOn(process, 'exit').mockImplementation(((code) => {
        throw new Error(`Process.exit called with code ${code}`);
    }));
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockProcessExit.mockClear();
    });
    (0, globals_1.it)('should create backup with default directory when no config', () => {
        mockLoadConfig.mockReturnValue({});
        mockExistsSync.mockReturnValue(true);
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(`pg_dump -Fc --no-acl --no-owner -h localhost -f "${process.cwd()}/test-backup.dump" "testdb"`, { stdio: 'inherit' });
    });
    (0, globals_1.it)('should create backup with configured directory', () => {
        mockLoadConfig.mockReturnValue({ destination: '/custom/backup/path' });
        mockExistsSync.mockReturnValue(true);
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(`pg_dump -Fc --no-acl --no-owner -h localhost -f "/custom/backup/path/test-backup.dump" "testdb"`, { stdio: 'inherit' });
    });
    (0, globals_1.it)('should create backup directory if it does not exist', () => {
        mockLoadConfig.mockReturnValue({ destination: '/new/backup/path' });
        mockExistsSync.mockReturnValue(false);
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(mockMkdirSync).toHaveBeenCalledWith('/new/backup/path', { recursive: true });
    });
    (0, globals_1.it)('should verify backup file was created successfully', () => {
        mockLoadConfig.mockReturnValue({});
        mockExistsSync
            .mockReturnValueOnce(true) // Directory exists
            .mockReturnValueOnce(true); // Backup file exists after creation
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(mockExistsSync).toHaveBeenCalledTimes(2);
        (0, globals_1.expect)(mockProcessExit).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('should exit with error if backup file was not created', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation(() => { });
        mockLoadConfig.mockReturnValue({});
        mockExistsSync
            .mockReturnValueOnce(true) // Directory exists
            .mockReturnValueOnce(false); // Backup file does not exist after creation
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✗ Backup file was not created');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should handle pg_dump execution errors', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation(() => { });
        mockLoadConfig.mockReturnValue({});
        mockExistsSync.mockReturnValue(true);
        mockExecSync.mockImplementation(() => {
            throw new Error('pg_dump: database "testdb" does not exist');
        });
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✗ Backup failed:', 'pg_dump: database "testdb" does not exist');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should handle directory creation errors', () => {
        const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation(() => { });
        mockLoadConfig.mockReturnValue({ destination: '/protected/path' });
        mockExistsSync.mockReturnValue(false);
        mockMkdirSync.mockImplementation(() => {
            throw new Error('Permission denied');
        });
        (0, backup_1.backupCommand)('testdb', 'test-backup');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✗ Backup failed:', 'Permission denied');
        (0, globals_1.expect)(mockProcessExit).toHaveBeenCalledWith(1);
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should properly escape database and file names', () => {
        mockLoadConfig.mockReturnValue({});
        mockExistsSync.mockReturnValue(true);
        (0, backup_1.backupCommand)('test db with spaces', 'backup with spaces');
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(globals_1.expect.stringContaining('"test db with spaces"'), { stdio: 'inherit' });
        (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(globals_1.expect.stringContaining('"backup with spaces.dump"'), { stdio: 'inherit' });
    });
});
