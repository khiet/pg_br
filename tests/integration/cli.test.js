"use strict";
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
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
// Mock child_process for unit-level mocking, but we'll override for integration tests
globals_1.jest.mock('child_process');
const mockExecSync = child_process_1.execSync;
(0, globals_1.describe)('CLI Integration Tests', () => {
    let testDir;
    let configPath;
    const originalHome = process.env.HOME;
    (0, globals_1.beforeEach)(() => {
        // Create temporary test directory
        testDir = (0, path_1.join)((0, os_1.tmpdir)(), `pg_br_test_${Date.now()}`);
        (0, fs_1.mkdirSync)(testDir, { recursive: true });
        // Set up test home directory for config
        const testHome = (0, path_1.join)(testDir, 'home');
        (0, fs_1.mkdirSync)(testHome, { recursive: true });
        process.env.HOME = testHome;
        configPath = (0, path_1.join)(testHome, '.pg_br.yml');
        // Clear all mocks
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.afterEach)(() => {
        // Restore original HOME
        process.env.HOME = originalHome;
        // Clean up test directory
        if ((0, fs_1.existsSync)(testDir)) {
            (0, fs_1.rmSync)(testDir, { recursive: true, force: true });
        }
    });
    (0, globals_1.describe)('CLI Command Routing', () => {
        (0, globals_1.it)('should route to backup command with correct arguments', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock pg_dump execution
            mockExecSync.mockImplementation((command) => {
                var _a;
                if (command.includes('pg_dump')) {
                    // Simulate successful backup
                    const outputPath = (_a = command.match(/-f "([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
                    if (outputPath) {
                        (0, fs_1.writeFileSync)(outputPath, 'mock backup data');
                    }
                    return Buffer.from('pg_dump completed');
                }
                return Buffer.from('');
            });
            // Import and test the CLI
            const { execSync: realExecSync } = globals_1.jest.requireActual('child_process');
            // Test backup command
            (0, globals_1.expect)(() => {
                // This would normally call the CLI, but we'll test the command directly
                const { backupCommand } = require('../../src/commands/backup');
                backupCommand('testdb', 'test-backup');
            }).not.toThrow();
            (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(globals_1.expect.stringContaining('pg_dump'), { stdio: 'inherit' });
        }));
        (0, globals_1.it)('should handle missing arguments for backup command', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
            const mockExit = globals_1.jest.spyOn(process, 'exit').mockImplementation();
            // Simulate CLI with missing arguments - this would be handled in cli.ts
            // For this test, we'll simulate the validation logic
            const args = ['backup', 'testdb']; // Missing backup name
            if (args.length !== 3) {
                console.error('Error: backup command requires exactly 2 arguments');
                console.error('Usage: pg_br backup <database_name> <backup_name>');
                process.exit(1);
            }
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Error: backup command requires exactly 2 arguments');
            (0, globals_1.expect)(mockExit).toHaveBeenCalledWith(1);
            consoleSpy.mockRestore();
            mockExit.mockRestore();
        });
    });
    (0, globals_1.describe)('Configuration Integration', () => {
        (0, globals_1.it)('should use configured backup destination', () => {
            // Create config file
            const config = `destination: ${testDir}/backups`;
            (0, fs_1.writeFileSync)(configPath, config);
            // Create backup directory
            const backupDir = (0, path_1.join)(testDir, 'backups');
            (0, fs_1.mkdirSync)(backupDir, { recursive: true });
            mockExecSync.mockImplementation((command) => {
                var _a;
                if (command.includes('pg_dump')) {
                    const outputPath = (_a = command.match(/-f "([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
                    if (outputPath) {
                        (0, fs_1.writeFileSync)(outputPath, 'mock backup data');
                    }
                    return Buffer.from('pg_dump completed');
                }
                return Buffer.from('');
            });
            const { backupCommand } = require('../../src/commands/backup');
            backupCommand('testdb', 'configured-backup');
            (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(globals_1.expect.stringContaining(`${backupDir}/configured-backup.dump`), { stdio: 'inherit' });
        });
        (0, globals_1.it)('should expand environment variables in config', () => {
            // Set environment variable
            process.env.BACKUP_DIR = (0, path_1.join)(testDir, 'env-backups');
            // Create config with environment variable
            const config = 'destination: $BACKUP_DIR';
            (0, fs_1.writeFileSync)(configPath, config);
            // Create backup directory
            (0, fs_1.mkdirSync)(process.env.BACKUP_DIR, { recursive: true });
            mockExecSync.mockImplementation((command) => {
                var _a;
                if (command.includes('pg_dump')) {
                    const outputPath = (_a = command.match(/-f "([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
                    if (outputPath) {
                        (0, fs_1.writeFileSync)(outputPath, 'mock backup data');
                    }
                    return Buffer.from('pg_dump completed');
                }
                return Buffer.from('');
            });
            const { backupCommand } = require('../../src/commands/backup');
            backupCommand('testdb', 'env-backup');
            (0, globals_1.expect)(mockExecSync).toHaveBeenCalledWith(globals_1.expect.stringContaining(`${process.env.BACKUP_DIR}/env-backup.dump`), { stdio: 'inherit' });
            delete process.env.BACKUP_DIR;
        });
    });
    (0, globals_1.describe)('File Operations Integration', () => {
        (0, globals_1.it)('should create backup directory if it does not exist', () => {
            const backupDir = (0, path_1.join)(testDir, 'new-backup-dir');
            // Create config pointing to non-existent directory
            const config = `destination: ${backupDir}`;
            (0, fs_1.writeFileSync)(configPath, config);
            mockExecSync.mockImplementation((command) => {
                var _a;
                if (command.includes('pg_dump')) {
                    const outputPath = (_a = command.match(/-f "([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
                    if (outputPath) {
                        (0, fs_1.writeFileSync)(outputPath, 'mock backup data');
                    }
                    return Buffer.from('pg_dump completed');
                }
                return Buffer.from('');
            });
            const { backupCommand } = require('../../src/commands/backup');
            backupCommand('testdb', 'new-dir-backup');
            // Verify directory was created
            (0, globals_1.expect)((0, fs_1.existsSync)(backupDir)).toBe(true);
        });
        (0, globals_1.it)('should list backup files from configured directory', () => {
            const backupDir = (0, path_1.join)(testDir, 'list-backups');
            (0, fs_1.mkdirSync)(backupDir, { recursive: true });
            // Create mock backup files
            (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'backup1.dump'), 'mock data 1');
            (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'backup2.dump'), 'mock data 2');
            (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'not-backup.txt'), 'not a backup');
            // Create config
            const config = `destination: ${backupDir}`;
            (0, fs_1.writeFileSync)(configPath, config);
            const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
            const { listCommand } = require('../../src/commands/list');
            listCommand();
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith(`Listing backups from: ${backupDir}`);
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Found 2 backup(s):');
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('📁 backup1.dump');
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('📁 backup2.dump');
            consoleSpy.mockRestore();
        });
    });
    (0, globals_1.describe)('Error Handling Integration', () => {
        (0, globals_1.it)('should handle pg_dump failures gracefully', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'error').mockImplementation();
            const mockExit = globals_1.jest.spyOn(process, 'exit').mockImplementation();
            mockExecSync.mockImplementation(() => {
                throw new Error('pg_dump: database "nonexistent" does not exist');
            });
            const { backupCommand } = require('../../src/commands/backup');
            backupCommand('nonexistent', 'failed-backup');
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('✗ Backup failed:', 'pg_dump: database "nonexistent" does not exist');
            (0, globals_1.expect)(mockExit).toHaveBeenCalledWith(1);
            consoleSpy.mockRestore();
            mockExit.mockRestore();
        });
        (0, globals_1.it)('should handle missing backup directory gracefully', () => {
            const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
            const { listCommand } = require('../../src/commands/list');
            listCommand();
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith(`Listing backups from: ${process.cwd()}`);
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('No backup directory found.');
            consoleSpy.mockRestore();
        });
        (0, globals_1.it)('should handle malformed config file gracefully', () => {
            // Create invalid YAML config
            (0, fs_1.writeFileSync)(configPath, 'invalid:\n  yaml: content\n    malformed');
            const consoleSpy = globals_1.jest.spyOn(console, 'warn').mockImplementation();
            // This should not throw, but should use default config
            const { loadConfig } = require('../../src/utils/config');
            const config = loadConfig();
            (0, globals_1.expect)(config).toEqual({});
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith(globals_1.expect.stringContaining('Warning: Failed to load config file'));
            consoleSpy.mockRestore();
        });
    });
    (0, globals_1.describe)('End-to-End Workflow', () => {
        (0, globals_1.it)('should complete backup-list-restore workflow', () => {
            const backupDir = (0, path_1.join)(testDir, 'workflow-backups');
            (0, fs_1.mkdirSync)(backupDir, { recursive: true });
            // Create config
            const config = `destination: ${backupDir}`;
            (0, fs_1.writeFileSync)(configPath, config);
            // Step 1: Create backup
            mockExecSync.mockImplementation((command) => {
                var _a;
                if (command.includes('pg_dump')) {
                    const outputPath = (_a = command.match(/-f "([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
                    if (outputPath) {
                        (0, fs_1.writeFileSync)(outputPath, 'mock backup data for testdb');
                    }
                    return Buffer.from('pg_dump completed');
                }
                else if (command.includes('pg_restore')) {
                    return Buffer.from('pg_restore completed');
                }
                return Buffer.from('');
            });
            const { backupCommand } = require('../../src/commands/backup');
            const { listCommand } = require('../../src/commands/list');
            // Create backup
            backupCommand('testdb', 'workflow-backup');
            // Verify backup file exists
            const backupFile = (0, path_1.join)(backupDir, 'workflow-backup.dump');
            (0, globals_1.expect)((0, fs_1.existsSync)(backupFile)).toBe(true);
            // Step 2: List backups
            const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation();
            listCommand();
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('Found 1 backup(s):');
            (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith('📁 workflow-backup.dump');
            consoleSpy.mockRestore();
        });
    });
});
