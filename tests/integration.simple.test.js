"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
(0, globals_1.describe)('Integration Tests - Simple', () => {
    let testDir;
    let configPath;
    const originalHome = process.env.HOME;
    (0, globals_1.beforeEach)(() => {
        // Clear require cache for the modules we're testing
        delete require.cache[require.resolve('../src/utils/config')];
        delete require.cache[require.resolve('../src/utils/files')];
        // Create temporary test directory
        testDir = (0, path_1.join)((0, os_1.tmpdir)(), `pg_br_test_${Date.now()}`);
        (0, fs_1.mkdirSync)(testDir, { recursive: true });
        // Set up test home directory for config
        const testHome = (0, path_1.join)(testDir, 'home');
        (0, fs_1.mkdirSync)(testHome, { recursive: true });
        process.env.HOME = testHome;
        configPath = (0, path_1.join)(testHome, '.pg_br.yml');
    });
    (0, globals_1.afterEach)(() => {
        // Restore original HOME
        process.env.HOME = originalHome;
        // Clean up test directory
        if ((0, fs_1.existsSync)(testDir)) {
            (0, fs_1.rmSync)(testDir, { recursive: true, force: true });
        }
    });
    (0, globals_1.it)('should load configuration from YAML file', () => {
        // Create config file
        const config = `destination: ${testDir}/backups`;
        (0, fs_1.writeFileSync)(configPath, config);
        // Verify file was written
        (0, globals_1.expect)((0, fs_1.existsSync)(configPath)).toBe(true);
        (0, globals_1.expect)((0, fs_1.readFileSync)(configPath, 'utf8')).toBe(config);
        const { loadConfig } = require('../src/utils/config');
        const result = loadConfig();
        // Debug output
        console.log('Config path:', configPath);
        console.log('Config content:', (0, fs_1.readFileSync)(configPath, 'utf8'));
        console.log('Loaded config:', result);
        (0, globals_1.expect)(result.destination).toBe(`${testDir}/backups`);
    });
    (0, globals_1.it)('should expand environment variables in config', () => {
        // Set environment variable
        process.env.BACKUP_DIR = (0, path_1.join)(testDir, 'env-backups');
        // Create config with environment variable
        const config = 'destination: $BACKUP_DIR';
        (0, fs_1.writeFileSync)(configPath, config);
        const { loadConfig } = require('../src/utils/config');
        const result = loadConfig();
        (0, globals_1.expect)(result.destination).toBe(process.env.BACKUP_DIR);
        delete process.env.BACKUP_DIR;
    });
    (0, globals_1.it)('should handle missing config file gracefully', () => {
        const { loadConfig } = require('../src/utils/config');
        const result = loadConfig();
        (0, globals_1.expect)(result).toEqual({});
    });
    (0, globals_1.it)('should get backup directory from config', () => {
        const backupDir = (0, path_1.join)(testDir, 'configured-backups');
        // Create config
        const config = `destination: ${backupDir}`;
        (0, fs_1.writeFileSync)(configPath, config);
        const { getBackupDirectory } = require('../src/utils/files');
        const result = getBackupDirectory();
        (0, globals_1.expect)(result).toBe(backupDir);
    });
    (0, globals_1.it)('should return current directory when no config', () => {
        const { getBackupDirectory } = require('../src/utils/files');
        const result = getBackupDirectory();
        (0, globals_1.expect)(result).toBe(process.cwd());
    });
    (0, globals_1.it)('should find backup files in directory', () => {
        const backupDir = (0, path_1.join)(testDir, 'list-backups');
        (0, fs_1.mkdirSync)(backupDir, { recursive: true });
        // Create mock backup files
        (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'backup1.dump'), 'mock data 1');
        (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'backup2.dump'), 'mock data 2');
        (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'not-backup.txt'), 'not a backup');
        // Create config
        const config = `destination: ${backupDir}`;
        (0, fs_1.writeFileSync)(configPath, config);
        const { getBackupFiles } = require('../src/utils/files');
        const files = getBackupFiles();
        (0, globals_1.expect)(files).toHaveLength(2);
        (0, globals_1.expect)(files.map((f) => f.name)).toEqual(globals_1.expect.arrayContaining(['backup1.dump', 'backup2.dump']));
        (0, globals_1.expect)(files.every((f) => f.path.includes(backupDir))).toBe(true);
    });
    (0, globals_1.it)('should return empty array for non-existent backup directory', () => {
        const { getBackupFiles } = require('../src/utils/files');
        // Mock the config to point to non-existent directory
        const nonExistentDir = (0, path_1.join)(testDir, 'does-not-exist');
        const config = `destination: ${nonExistentDir}`;
        (0, fs_1.writeFileSync)(configPath, config);
        const files = getBackupFiles();
        (0, globals_1.expect)(files).toEqual([]);
    });
    (0, globals_1.it)('should get detailed backup file information', () => {
        const backupDir = (0, path_1.join)(testDir, 'detailed-backups');
        (0, fs_1.mkdirSync)(backupDir, { recursive: true });
        // Create a backup file
        const backupContent = 'detailed mock backup data';
        (0, fs_1.writeFileSync)((0, path_1.join)(backupDir, 'detailed.dump'), backupContent);
        // Create config
        const config = `destination: ${backupDir}`;
        (0, fs_1.writeFileSync)(configPath, config);
        const { getDetailedBackupFiles } = require('../src/utils/files');
        const files = getDetailedBackupFiles();
        (0, globals_1.expect)(files).toHaveLength(1);
        (0, globals_1.expect)(files[0]).toMatchObject({
            name: 'detailed.dump',
            path: (0, path_1.join)(backupDir, 'detailed.dump'),
            size: globals_1.expect.any(Number),
            created: globals_1.expect.any(Date),
            modified: globals_1.expect.any(Date),
        });
        (0, globals_1.expect)(files[0].size).toBe(backupContent.length);
    });
    (0, globals_1.it)('should handle file path expansion correctly', () => {
        const { expandPath } = require('../src/utils/config');
        // Test various path expansion scenarios
        process.env.TEST_PATH = '/test/env/path';
        (0, globals_1.expect)(expandPath('$TEST_PATH/subdir')).toBe('/test/env/path/subdir');
        (0, globals_1.expect)(expandPath('${TEST_PATH}/subdir')).toBe('/test/env/path/subdir');
        (0, globals_1.expect)(expandPath('~/documents')).toMatch(/\/documents$/);
        (0, globals_1.expect)(expandPath('/absolute/path')).toBe('/absolute/path');
        delete process.env.TEST_PATH;
    });
});
