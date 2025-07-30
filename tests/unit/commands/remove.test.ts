import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import { removeCommand } from '../../../src/commands/remove';
import * as fileUtils from '../../../src/utils/files';
import * as promptUtils from '../../../src/utils/prompts';

jest.mock('child_process');
jest.mock('../../../src/utils/files');
jest.mock('../../../src/utils/prompts');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockGetBackupFiles = fileUtils.getBackupFiles as jest.MockedFunction<typeof fileUtils.getBackupFiles>;
const mockPromptMultiFileSelection = promptUtils.promptMultiFileSelection as jest.MockedFunction<typeof promptUtils.promptMultiFileSelection>;
const mockPromptConfirmation = promptUtils.promptConfirmation as jest.MockedFunction<typeof promptUtils.promptConfirmation>;

describe('Remove Command', () => {
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
    mockProcessExit.mockClear();
  });

  it('should display message when no backup files found', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockGetBackupFiles.mockReturnValue([]);
    
    removeCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('No backup files found in the destination directory.');
    expect(consoleSpy).toHaveBeenCalledWith('Use "pg_br ls" to check available backups.');
    
    consoleSpy.mockRestore();
  });

  it('should handle cancelled selection', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptMultiFileSelection.mockResolvedValue([]);
    
    removeCommand();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('No files selected.');
    
    consoleSpy.mockRestore();
  });

  it('should handle cancelled confirmation', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptMultiFileSelection.mockResolvedValue(['/test/backup1.dump']);
    mockPromptConfirmation.mockResolvedValue(false);
    
    removeCommand();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('Operation cancelled.');
    
    consoleSpy.mockRestore();
  });

  it('should successfully remove selected files', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
      { name: 'backup2.dump', path: '/test/backup2.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptMultiFileSelection.mockResolvedValue(['/test/backup1.dump', '/test/backup2.dump']);
    mockPromptConfirmation.mockResolvedValue(true);
    
    removeCommand();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockExecSync).toHaveBeenCalledWith('rm "/test/backup1.dump"', { stdio: 'pipe' });
    expect(mockExecSync).toHaveBeenCalledWith('rm "/test/backup2.dump"', { stdio: 'pipe' });
    
    expect(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup1.dump');
    expect(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup2.dump');
    expect(consoleSpy).toHaveBeenCalledWith('\nOperation completed: 2 removed, 0 failed.');
    
    consoleSpy.mockRestore();
  });

  it('should handle partial removal failures', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
      { name: 'backup2.dump', path: '/test/backup2.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptMultiFileSelection.mockResolvedValue(['/test/backup1.dump', '/test/backup2.dump']);
    mockPromptConfirmation.mockResolvedValue(true);
    
    // Mock first file removal success, second file removal failure
    mockExecSync
      .mockImplementationOnce(() => {}) // Success
      .mockImplementationOnce(() => {
        throw new Error('Permission denied');
      }); // Failure
    
    removeCommand();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup1.dump');
    expect(consoleErrorSpy).toHaveBeenCalledWith('✗ Failed to remove: backup2.dump');
    expect(consoleSpy).toHaveBeenCalledWith('\nOperation completed: 1 removed, 1 failed.');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle file selection errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const mockFiles = [
      { name: 'backup1.dump', path: '/test/backup1.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptMultiFileSelection.mockRejectedValue(new Error('Invalid selection'));
    
    removeCommand();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Remove failed:', 'Invalid selection');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should handle general errors in try-catch', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockGetBackupFiles.mockImplementation(() => {
      throw new Error('File system error');
    });
    
    removeCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('✗ Remove failed:', 'File system error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });

  it('should properly handle file paths with spaces', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockFiles = [
      { name: 'backup with spaces.dump', path: '/test/backup with spaces.dump' },
    ];
    
    mockGetBackupFiles.mockReturnValue(mockFiles);
    mockPromptMultiFileSelection.mockResolvedValue(['/test/backup with spaces.dump']);
    mockPromptConfirmation.mockResolvedValue(true);
    
    removeCommand();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockExecSync).toHaveBeenCalledWith('rm "/test/backup with spaces.dump"', { stdio: 'pipe' });
    expect(consoleSpy).toHaveBeenCalledWith('✓ Removed: backup with spaces.dump');
    
    consoleSpy.mockRestore();
  });

  it('should display preparation message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockGetBackupFiles.mockReturnValue([]);
    
    removeCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('Preparing to remove backup files...');
    
    consoleSpy.mockRestore();
  });
});