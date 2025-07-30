import { describe, it, expect } from '@jest/globals';

describe('Basic Tests', () => {
  it('should import and run CLI components', () => {
    // Test that the main modules can be imported without errors
    expect(() => {
      const { expandPath } = require('../src/utils/config');
      const result = expandPath('test/path');
      expect(result).toBe('test/path');
    }).not.toThrow();
  });

  it('should validate CLI module structure', () => {
    // Test that all commands can be imported
    expect(() => {
      const commands = require('../src/commands');
      expect(typeof commands.backupCommand).toBe('function');
      expect(typeof commands.listCommand).toBe('function');
      expect(typeof commands.restoreCommand).toBe('function');
      expect(typeof commands.removeCommand).toBe('function');
    }).not.toThrow();
  });

  it('should validate utility module structure', () => {
    // Test that all utilities can be imported
    expect(() => {
      const utils = require('../src/utils');
      expect(typeof utils.expandPath).toBe('function');
      expect(typeof utils.loadConfig).toBe('function');
      expect(typeof utils.getBackupFiles).toBe('function');
      expect(typeof utils.getDetailedBackupFiles).toBe('function');
      expect(typeof utils.promptFileSelection).toBe('function');
      expect(typeof utils.promptMultiFileSelection).toBe('function');
      expect(typeof utils.promptConfirmation).toBe('function');
    }).not.toThrow();
  });

  it('should validate type definitions', () => {
    // Test that types can be imported
    expect(() => {
      const types = require('../src/types');
      expect(types).toBeDefined();
    }).not.toThrow();
  });
});