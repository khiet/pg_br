import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { existsSync, readdirSync, statSync } from 'fs';
import { getBackupDirectory, getBackupFiles, getDetailedBackupFiles } from '../../../src/utils/files';
import * as configUtils from '../../../src/utils/config';

jest.mock('fs');
jest.mock('../../../src/utils/config');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReaddirSync = readdirSync as jest.MockedFunction<typeof readdirSync>;
const mockStatSync = statSync as jest.MockedFunction<typeof statSync>;
const mockLoadConfig = configUtils.loadConfig as jest.MockedFunction<typeof configUtils.loadConfig>;

describe('File Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBackupDirectory', () => {
    it('should return configured destination when available', () => {
      mockLoadConfig.mockReturnValue({ destination: '/custom/backup/path' });
      
      const result = getBackupDirectory();
      
      expect(result).toBe('/custom/backup/path');
    });

    it('should return current working directory when no config', () => {
      mockLoadConfig.mockReturnValue({});
      
      const result = getBackupDirectory();
      
      expect(result).toBe(process.cwd());
    });
  });

  describe('getBackupFiles', () => {
    const mockStats = {
      birthtime: new Date('2023-01-01T10:00:00Z'),
      isDirectory: () => false,
    };

    beforeEach(() => {
      mockLoadConfig.mockReturnValue({ destination: '/test/backups' });
    });

    it('should return empty array when directory does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = getBackupFiles();
      
      expect(result).toEqual([]);
    });

    it('should return backup files sorted by creation date', () => {
      const file1Stats = { ...mockStats, birthtime: new Date('2023-01-01T10:00:00Z') };
      const file2Stats = { ...mockStats, birthtime: new Date('2023-01-02T10:00:00Z') };
      
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['backup1.dump', 'backup2.dump', 'other.txt'] as any);
      mockStatSync
        .mockReturnValueOnce(file1Stats as any)
        .mockReturnValueOnce(file2Stats as any);
      
      const result = getBackupFiles();
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('backup2.dump'); // Newer first
      expect(result[1].name).toBe('backup1.dump');
      expect(result[0].path).toBe('/test/backups/backup2.dump');
    });

    it('should filter out non-dump files', () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['backup.dump', 'readme.txt', 'config.yml'] as any);
      mockStatSync.mockReturnValue(mockStats as any);
      
      const result = getBackupFiles();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('backup.dump');
    });

    it('should handle file reading errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = getBackupFiles();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reading backup directory:',
        'Permission denied'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getDetailedBackupFiles', () => {
    const mockStats = {
      birthtime: new Date('2023-01-01T10:00:00Z'),
      mtime: new Date('2023-01-01T11:00:00Z'),
      size: 1024,
      isDirectory: () => false,
    };

    beforeEach(() => {
      mockLoadConfig.mockReturnValue({ destination: '/test/backups' });
    });

    it('should return detailed backup file information', () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['backup.dump'] as any);
      mockStatSync.mockReturnValue(mockStats as any);
      
      const result = getDetailedBackupFiles();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'backup.dump',
        path: '/test/backups/backup.dump',
        size: 1024,
        created: mockStats.birthtime,
        modified: mockStats.mtime,
      });
    });

    it('should return empty array when directory does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = getDetailedBackupFiles();
      
      expect(result).toEqual([]);
    });

    it('should handle errors and return empty array', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockImplementation(() => {
        throw new Error('Access denied');
      });
      
      const result = getDetailedBackupFiles();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});