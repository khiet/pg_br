import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe.skip('Integration Tests - Simple', () => {
  let testDir: string;
  let configPath: string;
  const originalHome = process.env.HOME;

  beforeEach(() => {
    // Clear require cache for the modules we're testing
    delete require.cache[require.resolve('../src/utils/config')];
    delete require.cache[require.resolve('../src/utils/files')];
    
    // Create temporary test directory
    testDir = join(tmpdir(), `pg_br_test_${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    
    // Set up test home directory for config
    const testHome = join(testDir, 'home');
    mkdirSync(testHome, { recursive: true });
    process.env.HOME = testHome;
    
    configPath = join(testHome, '.pg_br.yml');
  });

  afterEach(() => {
    // Restore original HOME
    process.env.HOME = originalHome;
    
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should load configuration from YAML file', () => {
    // Create config file
    const config = `destination: ${testDir}/backups`;
    writeFileSync(configPath, config);
    
    // Verify file was written
    expect(existsSync(configPath)).toBe(true);
    expect(readFileSync(configPath, 'utf8')).toBe(config);

    const { loadConfig } = require('../src/utils/config');
    const result = loadConfig();
    
    // Debug output
    console.log('Config path:', configPath);
    console.log('Config content:', readFileSync(configPath, 'utf8'));
    console.log('Loaded config:', result);

    expect(result.destination).toBe(`${testDir}/backups`);
  });

  it('should expand environment variables in config', () => {
    // Set environment variable
    process.env.BACKUP_DIR = join(testDir, 'env-backups');
    
    // Create config with environment variable
    const config = 'destination: $BACKUP_DIR';
    writeFileSync(configPath, config);

    const { loadConfig } = require('../src/utils/config');
    const result = loadConfig();

    expect(result.destination).toBe(process.env.BACKUP_DIR);

    delete process.env.BACKUP_DIR;
  });

  it('should handle missing config file gracefully', () => {
    const { loadConfig } = require('../src/utils/config');
    const result = loadConfig();

    expect(result).toEqual({});
  });

  it('should get backup directory from config', () => {
    const backupDir = join(testDir, 'configured-backups');
    
    // Create config
    const config = `destination: ${backupDir}`;
    writeFileSync(configPath, config);

    const { getBackupDirectory } = require('../src/utils/files');
    const result = getBackupDirectory();

    expect(result).toBe(backupDir);
  });

  it('should return current directory when no config', () => {
    const { getBackupDirectory } = require('../src/utils/files');
    const result = getBackupDirectory();

    expect(result).toBe(process.cwd());
  });

  it('should find backup files in directory', () => {
    const backupDir = join(testDir, 'list-backups');
    mkdirSync(backupDir, { recursive: true });

    // Create mock backup files
    writeFileSync(join(backupDir, 'backup1.dump'), 'mock data 1');
    writeFileSync(join(backupDir, 'backup2.dump'), 'mock data 2');
    writeFileSync(join(backupDir, 'not-backup.txt'), 'not a backup');

    // Create config
    const config = `destination: ${backupDir}`;
    writeFileSync(configPath, config);

    const { getBackupFiles } = require('../src/utils/files');
    const files = getBackupFiles();

    expect(files).toHaveLength(2);
    expect(files.map((f: any) => f.name)).toEqual(
      expect.arrayContaining(['backup1.dump', 'backup2.dump'])
    );
    expect(files.every((f: any) => f.path.includes(backupDir))).toBe(true);
  });

  it('should return empty array for non-existent backup directory', () => {
    const { getBackupFiles } = require('../src/utils/files');
    
    // Mock the config to point to non-existent directory
    const nonExistentDir = join(testDir, 'does-not-exist');
    const config = `destination: ${nonExistentDir}`;
    writeFileSync(configPath, config);
    
    const files = getBackupFiles();

    expect(files).toEqual([]);
  });

  it('should get detailed backup file information', () => {
    const backupDir = join(testDir, 'detailed-backups');
    mkdirSync(backupDir, { recursive: true });

    // Create a backup file
    const backupContent = 'detailed mock backup data';
    writeFileSync(join(backupDir, 'detailed.dump'), backupContent);

    // Create config
    const config = `destination: ${backupDir}`;
    writeFileSync(configPath, config);

    const { getDetailedBackupFiles } = require('../src/utils/files');
    const files = getDetailedBackupFiles();

    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({
      name: 'detailed.dump',
      path: join(backupDir, 'detailed.dump'),
      size: expect.any(Number),
      created: expect.any(Date),
      modified: expect.any(Date),
    });
    expect(files[0].size).toBe(backupContent.length);
  });

  it('should handle file path expansion correctly', () => {
    const { expandPath } = require('../src/utils/config');
    
    // Test various path expansion scenarios
    process.env.TEST_PATH = '/test/env/path';
    
    expect(expandPath('$TEST_PATH/subdir')).toBe('/test/env/path/subdir');
    expect(expandPath('${TEST_PATH}/subdir')).toBe('/test/env/path/subdir');
    expect(expandPath('~/documents')).toMatch(/\/documents$/);
    expect(expandPath('/absolute/path')).toBe('/absolute/path');
    
    delete process.env.TEST_PATH;
  });
});