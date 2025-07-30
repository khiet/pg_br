import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import { restoreCommand } from '../../../src/commands/restore';
import * as fileUtils from '../../../src/utils/files';
import * as promptUtils from '../../../src/utils/prompts';

jest.mock('child_process');
jest.mock('../../../src/utils/files');
jest.mock('../../../src/utils/prompts');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockGetBackupFiles = fileUtils.getBackupFiles as jest.MockedFunction<typeof fileUtils.getBackupFiles>;
const mockPromptFileSelection = promptUtils.promptFileSelection as jest.MockedFunction<typeof promptUtils.promptFileSelection>;

describe('Restore Command', () => {
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
    mockProcessExit.mockClear();
  });

  it('should display message when no backup files found', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockGetBackupFiles.mockReturnValue([]);
    
    restoreCommand('testdb');
    
    expect(consoleSpy).toHaveBeenCalledWith('No backup files found in the destination directory.');
    expect(consoleSpy).toHaveBeenCalledWith('Use "pg_br ls" to check available backups.');
    
    consoleSpy.mockRestore();
  });

  it('should prompt for file selection and restore successfully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
      { name: 'backup2.dump', path: '/test/backup2.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptFileSelection.mockResolvedValue('/test/backup1.dump');
    
    restoreCommand('testdb');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockPromptFileSelection).toHaveBeenCalledWith(mockFiles);
    expect(consoleSpy).toHaveBeenCalledWith('\nSelected backup file: /test/backup1.dump');
    expect(consoleSpy).toHaveBeenCalledWith('Restoring to database \'testdb\'...');
    
    expect(mockExecSync).toHaveBeenCalledWith(
      'pg_restore --verbose --clean --no-acl --no-owner -h localhost -d "testdb" "/test/backup1.dump"',
      { stdio: 'inherit' }
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '✓ Database \'testdb\' restored successfully from /test/backup1.dump'
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle file selection rejection', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptFileSelection.mockRejectedValue(new Error('Invalid selection'));
    
    restoreCommand('testdb');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Restore failed:', 'Invalid selection');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should handle pg_restore execution errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptFileSelection.mockResolvedValue('/test/backup1.dump');
    mockExecSync.mockImplementation(() => {
      throw new Error('pg_restore: database "testdb" does not exist');
    });
    
    restoreCommand('testdb');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Restore failed:', 'Invalid selection');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should handle general errors in try-catch', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockGetBackupFiles.mockImplementation(() => {
      throw new Error('File system error');
    });
    
    restoreCommand('testdb');
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Restore failed:', 'File system error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should properly escape database name and file path', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockFiles = [
      { name: 'backup with spaces.dump', path: '/test/backup with spaces.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptFileSelection.mockResolvedValue('/test/backup with spaces.dump');
    
    restoreCommand('test db with spaces');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockExecSync).toHaveBeenCalledWith(
      'pg_restore --verbose --clean --no-acl --no-owner -h localhost -d "test db with spaces" "/test/backup with spaces.dump"',
      { stdio: 'inherit' }
    );
    
    consoleSpy.mockRestore();
  });

  it('should display preparation message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockGetBackupFiles.mockReturnValue([]);
    
    restoreCommand('testdb');
    
    expect(consoleSpy).toHaveBeenCalledWith('Preparing to restore database \'testdb\'...');
    
    consoleSpy.mockRestore();
  });
});