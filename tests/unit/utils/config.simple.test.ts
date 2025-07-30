import { describe, it, expect, beforeEach } from '@jest/globals';
import { expandPath } from '../../../src/utils/config';

describe('Config Utils - Simple Tests', () => {
  beforeEach(() => {
    delete process.env.TEST_VAR;
    delete process.env.HOME;
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
      const result = expandPath('~/Documents');
      // Should use the actual home directory from os.homedir()
      expect(result).toContain('/Documents');
      expect(result).not.toContain('~');
    });

    it('should handle missing environment variables', () => {
      const result = expandPath('$MISSING_VAR/path');
      expect(result).toBe('$MISSING_VAR/path');
    });

    it('should handle complex path with multiple variables', () => {
      process.env.PROJECT = 'myproject';
      const result = expandPath('~/${PROJECT}/data');
      expect(result).toContain('myproject/data');
      expect(result).not.toContain('~');
      expect(result).not.toContain('${PROJECT}');
    });
  });
});