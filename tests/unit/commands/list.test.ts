import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { existsSync } from 'fs';
import { listCommand } from '../../../src/commands/list';
import * as fileUtils from '../../../src/utils/files';

jest.mock('fs');
jest.mock('../../../src/utils/files');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockGetBackupDirectory = fileUtils.getBackupDirectory as jest.MockedFunction<typeof fileUtils.getBackupDirectory>;
const mockGetDetailedBackupFiles = fileUtils.getDetailedBackupFiles as jest.MockedFunction<typeof fileUtils.getDetailedBackupFiles>;

describe('List Command', () => {
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);

  beforeEach(() => {
    jest.clearAllMocks();
    mockProcessExit.mockClear();
  });

  it('should display backup directory path', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    mockGetBackupDirectory.mockReturnValue('/test/backup/path');
    mockExistsSync.mockReturnValue(true);
    mockGetDetailedBackupFiles.mockReturnValue([]);
    
    listCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('Listing backups from: /test/backup/path');
    
    consoleSpy.mockRestore();
  });

  it('should display message when backup directory does not exist', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    mockGetBackupDirectory.mockReturnValue('/nonexistent/path');
    mockExistsSync.mockReturnValue(false);
    
    listCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('No backup directory found.');
    
    consoleSpy.mockRestore();
  });

  it('should display message when no backup files found', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    mockGetBackupDirectory.mockReturnValue('/test/backup/path');
    mockExistsSync.mockReturnValue(true);
    mockGetDetailedBackupFiles.mockReturnValue([]);
    
    listCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('No backup files found.');
    
    consoleSpy.mockRestore();
  });

  it('should display backup files with details', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
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
    
    listCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('Found 2 backup(s):');
    expect(consoleSpy).toHaveBeenCalledWith('📁 backup1.dump');
    expect(consoleSpy).toHaveBeenCalledWith('   Size: 1.00 MB');
    expect(consoleSpy).toHaveBeenCalledWith('📁 backup2.dump');
    expect(consoleSpy).toHaveBeenCalledWith('   Size: 2.00 MB');
    
    consoleSpy.mockRestore();
  });

  it('should format file sizes correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
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
    
    listCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('   Size: 0.49 MB');
    expect(consoleSpy).toHaveBeenCalledWith('   Size: 10.00 MB');
    
    consoleSpy.mockRestore();
  });

  it('should display creation dates and times', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
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
    
    listCommand();
    
    // The exact format will depend on locale, but should contain date and time
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Created: .* .*/));
    
    consoleSpy.mockRestore();
  });

  it('should handle errors and exit with code 1', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockGetBackupDirectory.mockImplementation(() => {
      throw new Error('Access denied');
    });
    
    listCommand();
    
    expect(consoleSpy).toHaveBeenCalledWith('Error listing backups:', 'Access denied');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
    
    consoleSpy.mockRestore();
  });
});