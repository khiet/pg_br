import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { expandPath, loadConfig } from '../../../src/utils/config';

jest.mock('fs');
jest.mock('js-yaml');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockYamlLoad = yaml.load as jest.MockedFunction<typeof yaml.load>;

describe('Config Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.TEST_VAR;
    delete process.env.HOME;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('expandPath', () => {
    it('should expand environment variables with braces', () => {
      process.env.TEST_VAR = '/test/path';
      const result = expandPath('${TEST_VAR}/subdir');
      expect(result).toBe('/test/path/subdir');
    });

    it('should expand environment variables without braces', () => {
      process.env.TEST_VAR = '/test/path';
      const result = expandPath('$TEST_VAR/subdir');
      expect(result).toBe('/test/path/subdir');
    });

    it('should expand home directory', () => {
      process.env.HOME = '/home/user';
      const result = expandPath('~/Documents');
      expect(result).toBe('/home/user/Documents');
    });

    it('should handle missing environment variables', () => {
      const result = expandPath('$MISSING_VAR/path');
      expect(result).toBe('$MISSING_VAR/path');
    });

    it('should handle complex path with multiple variables', () => {
      process.env.HOME = '/home/user';
      process.env.PROJECT = 'myproject';
      const result = expandPath('~/${PROJECT}/data');
      expect(result).toBe('/home/user/myproject/data');
    });
  });

  describe('loadConfig', () => {
    it('should return empty config when file does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = loadConfig();
      
      expect(result).toEqual({});
      expect(mockExistsSync).toHaveBeenCalled();
    });

    it('should load and parse YAML config file', () => {
      const mockConfig = { destination: '/test/path' };
      
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('destination: /test/path');
      mockYamlLoad.mockReturnValue(mockConfig);
      
      const result = loadConfig();
      
      expect(result).toEqual(mockConfig);
      expect(mockReadFileSync).toHaveBeenCalled();
      expect(mockYamlLoad).toHaveBeenCalledWith('destination: /test/path');
    });

    it('should expand paths in config', () => {
      process.env.HOME = '/home/user';
      const mockConfig = { destination: '~/backups' };
      
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('destination: ~/backups');
      mockYamlLoad.mockReturnValue(mockConfig);
      
      const result = loadConfig();
      
      expect(result.destination).toBe('/home/user/backups');
    });

    it('should handle YAML parsing errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid: yaml: content');
      mockYamlLoad.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });
      
      const result = loadConfig();
      
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed to load config file')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle file reading errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = loadConfig();
      
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed to load config file')
      );
      
      consoleSpy.mockRestore();
    });
  });
});