import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { backupCommand } from '../../../src/commands/backup';
import * as configUtils from '../../../src/utils/config';

jest.mock('child_process');
jest.mock('fs');
jest.mock('../../../src/utils/config');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
const mockLoadConfig = configUtils.loadConfig as jest.MockedFunction<typeof configUtils.loadConfig>;

describe('Backup Command', () => {
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`Process.exit called with code ${code}`);
  }) as any);

  beforeEach(() => {
    jest.clearAllMocks();
    mockProcessExit.mockClear();
  });

  it('should create backup with default directory when no config', () => {
    mockLoadConfig.mockReturnValue({});
    mockExistsSync.mockReturnValue(true);
    
    backupCommand('testdb', 'test-backup');
    
    expect(mockExecSync).toHaveBeenCalledWith(
      `pg_dump -Fc --no-acl --no-owner -h localhost -f "${process.cwd()}/test-backup.dump" "testdb"`,
      { stdio: 'inherit' }
    );
  });

  it('should create backup with configured directory', () => {
    mockLoadConfig.mockReturnValue({ destination: '/custom/backup/path' });
    mockExistsSync.mockReturnValue(true);
    
    backupCommand('testdb', 'test-backup');
    
    expect(mockExecSync).toHaveBeenCalledWith(
      `pg_dump -Fc --no-acl --no-owner -h localhost -f "/custom/backup/path/test-backup.dump" "testdb"`,
      { stdio: 'inherit' }
    );
  });

  it('should create backup directory if it does not exist', () => {
    mockLoadConfig.mockReturnValue({ destination: '/new/backup/path' });
    mockExistsSync.mockReturnValue(false);
    
    backupCommand('testdb', 'test-backup');
    
    expect(mockMkdirSync).toHaveBeenCalledWith('/new/backup/path', { recursive: true });
  });

  it('should verify backup file was created successfully', () => {
    mockLoadConfig.mockReturnValue({});
    mockExistsSync
      .mockReturnValueOnce(true) // Directory exists
      .mockReturnValueOnce(true); // Backup file exists after creation
    
    backupCommand('testdb', 'test-backup');
    
    expect(mockExistsSync).toHaveBeenCalledTimes(2);
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should exit with error if backup file was not created', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockLoadConfig.mockReturnValue({});
    mockExistsSync
      .mockReturnValueOnce(true)  // Directory exists
      .mockReturnValueOnce(false); // Backup file does not exist after creation
    
    backupCommand('testdb', 'test-backup');
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Backup file was not created');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should handle pg_dump execution errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockLoadConfig.mockReturnValue({});
    mockExistsSync.mockReturnValue(true);
    mockExecSync.mockImplementation(() => {
      throw new Error('pg_dump: database "testdb" does not exist');
    });
    
    backupCommand('testdb', 'test-backup');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '✗ Backup failed:',
      'pg_dump: database "testdb" does not exist'
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should handle directory creation errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockLoadConfig.mockReturnValue({ destination: '/protected/path' });
    mockExistsSync.mockReturnValue(false);
    mockMkdirSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    backupCommand('testdb', 'test-backup');
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Backup failed:', 'Permission denied');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should properly escape database and file names', () => {
    mockLoadConfig.mockReturnValue({});
    mockExistsSync.mockReturnValue(true);
    
    backupCommand('test db with spaces', 'backup with spaces');
    
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('"test db with spaces"'),
      { stdio: 'inherit' }
    );
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('"backup with spaces.dump"'),
      { stdio: 'inherit' }
    );
  });
});