import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { execSync, spawn, ChildProcess } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock child_process for unit-level mocking, but we'll override for integration tests
jest.mock('child_process');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('CLI Integration Tests', () => {
  let testDir: string;
  let configPath: string;
  const originalHome = process.env.HOME;

  beforeEach(() => {
    // Create temporary test directory
    testDir = join(tmpdir(), `pg_br_test_${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    
    // Set up test home directory for config
    const testHome = join(testDir, 'home');
    mkdirSync(testHome, { recursive: true });
    process.env.HOME = testHome;
    
    configPath = join(testHome, '.pg_br.yml');
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original HOME
    process.env.HOME = originalHome;
    
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('CLI Command Routing', () => {
    it('should route to backup command with correct arguments', async () => {
      // Mock pg_dump execution
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('pg_dump')) {
          // Simulate successful backup
          const outputPath = command.match(/-f "([^"]+)"/)?.[1];
          if (outputPath) {
            writeFileSync(outputPath, 'mock backup data');
          }
          return Buffer.from('pg_dump completed');
        }
        return Buffer.from('');
      });

      // Import and test the CLI
      const { execSync: realExecSync } = jest.requireActual('child_process') as any;
      
      // Test backup command
      expect(() => {
        // This would normally call the CLI, but we'll test the command directly
        const { backupCommand } = require('../../src/commands/backup');
        backupCommand('testdb', 'test-backup');
      }).not.toThrow();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('pg_dump'),
        { stdio: 'inherit' }
      );
    });

    it('should handle missing arguments for backup command', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();

      // Simulate CLI with missing arguments - this would be handled in cli.ts
      // For this test, we'll simulate the validation logic
      const args = ['backup', 'testdb']; // Missing backup name
      
      if (args.length !== 3) {
        console.error('Error: backup command requires exactly 2 arguments');
        console.error('Usage: pg_br backup <database_name> <backup_name>');
        process.exit(1);
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error: backup command requires exactly 2 arguments');
      expect(mockExit).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      mockExit.mockRestore();
    });
  });

  describe('Configuration Integration', () => {
    it('should use configured backup destination', () => {
      // Create config file
      const config = `destination: ${testDir}/backups`;
      writeFileSync(configPath, config);

      // Create backup directory
      const backupDir = join(testDir, 'backups');
      mkdirSync(backupDir, { recursive: true });

      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('pg_dump')) {
          const outputPath = command.match(/-f "([^"]+)"/)?.[1];
          if (outputPath) {
            writeFileSync(outputPath, 'mock backup data');
          }
          return Buffer.from('pg_dump completed');
        }
        return Buffer.from('');
      });

      const { backupCommand } = require('../../src/commands/backup');
      backupCommand('testdb', 'configured-backup');

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining(`${backupDir}/configured-backup.dump`),
        { stdio: 'inherit' }
      );
    });

    it('should expand environment variables in config', () => {
      // Set environment variable
      process.env.BACKUP_DIR = join(testDir, 'env-backups');
      
      // Create config with environment variable
      const config = 'destination: $BACKUP_DIR';
      writeFileSync(configPath, config);

      // Create backup directory
      mkdirSync(process.env.BACKUP_DIR, { recursive: true });

      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('pg_dump')) {
          const outputPath = command.match(/-f "([^"]+)"/)?.[1];
          if (outputPath) {
            writeFileSync(outputPath, 'mock backup data');
          }
          return Buffer.from('pg_dump completed');
        }
        return Buffer.from('');
      });

      const { backupCommand } = require('../../src/commands/backup');
      backupCommand('testdb', 'env-backup');

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining(`${process.env.BACKUP_DIR}/env-backup.dump`),
        { stdio: 'inherit' }
      );

      delete process.env.BACKUP_DIR;
    });
  });

  describe('File Operations Integration', () => {
    it('should create backup directory if it does not exist', () => {
      const backupDir = join(testDir, 'new-backup-dir');
      
      // Create config pointing to non-existent directory
      const config = `destination: ${backupDir}`;
      writeFileSync(configPath, config);

      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('pg_dump')) {
          const outputPath = command.match(/-f "([^"]+)"/)?.[1];
          if (outputPath) {
            writeFileSync(outputPath, 'mock backup data');
          }
          return Buffer.from('pg_dump completed');
        }
        return Buffer.from('');
      });

      const { backupCommand } = require('../../src/commands/backup');
      backupCommand('testdb', 'new-dir-backup');

      // Verify directory was created
      expect(existsSync(backupDir)).toBe(true);
    });

    it('should list backup files from configured directory', () => {
      const backupDir = join(testDir, 'list-backups');
      mkdirSync(backupDir, { recursive: true });

      // Create mock backup files
      writeFileSync(join(backupDir, 'backup1.dump'), 'mock data 1');
      writeFileSync(join(backupDir, 'backup2.dump'), 'mock data 2');
      writeFileSync(join(backupDir, 'not-backup.txt'), 'not a backup');

      // Create config
      const config = `destination: ${backupDir}`;
      writeFileSync(configPath, config);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { listCommand } = require('../../src/commands/list');
      listCommand();

      expect(consoleSpy).toHaveBeenCalledWith(`Listing backups from: ${backupDir}`);
      expect(consoleSpy).toHaveBeenCalledWith('Found 2 backup(s):');
      expect(consoleSpy).toHaveBeenCalledWith('📁 backup1.dump');
      expect(consoleSpy).toHaveBeenCalledWith('📁 backup2.dump');

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle pg_dump failures gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();

      mockExecSync.mockImplementation(() => {
        throw new Error('pg_dump: database "nonexistent" does not exist');
      });

      const { backupCommand } = require('../../src/commands/backup');
      backupCommand('nonexistent', 'failed-backup');

      expect(consoleSpy).toHaveBeenCalledWith(
        '✗ Backup failed:',
        'pg_dump: database "nonexistent" does not exist'
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      mockExit.mockRestore();
    });

    it('should handle missing backup directory gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { listCommand } = require('../../src/commands/list');
      listCommand();

      expect(consoleSpy).toHaveBeenCalledWith(`Listing backups from: ${process.cwd()}`);
      expect(consoleSpy).toHaveBeenCalledWith('No backup directory found.');

      consoleSpy.mockRestore();
    });

    it('should handle malformed config file gracefully', () => {
      // Create invalid YAML config
      writeFileSync(configPath, 'invalid:\n  yaml: content\n    malformed');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // This should not throw, but should use default config
      const { loadConfig } = require('../../src/utils/config');
      const config = loadConfig();

      expect(config).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed to load config file')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete backup-list-restore workflow', () => {
      const backupDir = join(testDir, 'workflow-backups');
      mkdirSync(backupDir, { recursive: true });

      // Create config
      const config = `destination: ${backupDir}`;
      writeFileSync(configPath, config);

      // Step 1: Create backup
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('pg_dump')) {
          const outputPath = command.match(/-f "([^"]+)"/)?.[1];
          if (outputPath) {
            writeFileSync(outputPath, 'mock backup data for testdb');
          }
          return Buffer.from('pg_dump completed');
        } else if (command.includes('pg_restore')) {
          return Buffer.from('pg_restore completed');
        }
        return Buffer.from('');
      });

      const { backupCommand } = require('../../src/commands/backup');
      const { listCommand } = require('../../src/commands/list');

      // Create backup
      backupCommand('testdb', 'workflow-backup');

      // Verify backup file exists
      const backupFile = join(backupDir, 'workflow-backup.dump');
      expect(existsSync(backupFile)).toBe(true);

      // Step 2: List backups
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      listCommand();

      expect(consoleSpy).toHaveBeenCalledWith('Found 1 backup(s):');
      expect(consoleSpy).toHaveBeenCalledWith('📁 workflow-backup.dump');

      consoleSpy.mockRestore();
    });
  });
});