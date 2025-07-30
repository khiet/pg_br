import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as readline from 'readline';
import { promptFileSelection, promptMultiFileSelection, promptConfirmation } from '../../../src/utils/prompts';

jest.mock('readline');

const mockReadline = readline as jest.Mocked<typeof readline>;

describe('Prompt Utils', () => {
  let mockRl: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRl = {
      question: jest.fn(),
      close: jest.fn(),
    };
    mockReadline.createInterface.mockReturnValue(mockRl);
  });

  describe('promptFileSelection', () => {
    const mockFiles = [
      { name: 'backup1.dump', path: '/path/backup1.dump' },
      { name: 'backup2.dump', path: '/path/backup2.dump' },
    ];

    it('should return selected file path for valid selection', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('1');
      });

      const result = await promptFileSelection(mockFiles);

      expect(result).toBe('/path/backup1.dump');
      expect(mockRl.close).toHaveBeenCalled();
    });

    it('should reject for invalid selection number', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('3');
      });

      await expect(promptFileSelection(mockFiles)).rejects.toThrow(
        'Invalid selection. Please enter a valid number.'
      );
    });

    it('should reject for non-numeric input', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('abc');
      });

      await expect(promptFileSelection(mockFiles)).rejects.toThrow(
        'Invalid selection. Please enter a valid number.'
      );
    });

    it('should reject for zero or negative numbers', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('0');
      });

      await expect(promptFileSelection(mockFiles)).rejects.toThrow(
        'Invalid selection. Please enter a valid number.'
      );
    });
  });

  describe('promptMultiFileSelection', () => {
    const mockFiles = [
      { name: 'backup1.dump', path: '/path/backup1.dump' },
      { name: 'backup2.dump', path: '/path/backup2.dump' },
      { name: 'backup3.dump', path: '/path/backup3.dump' },
    ];

    it('should handle single file selection', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('2');
      });

      const result = await promptMultiFileSelection(mockFiles);

      expect(result).toEqual(['/path/backup2.dump']);
    });

    it('should handle multiple file selection', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('1,3');
      });

      const result = await promptMultiFileSelection(mockFiles);

      expect(result).toEqual(['/path/backup1.dump', '/path/backup3.dump']);
    });

    it('should handle range selection', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('1-2');
      });

      const result = await promptMultiFileSelection(mockFiles);

      expect(result).toEqual(['/path/backup1.dump', '/path/backup2.dump']);
    });

    it('should handle mixed range and individual selection', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('1-2,3');
      });

      const result = await promptMultiFileSelection(mockFiles);

      expect(result).toEqual(['/path/backup1.dump', '/path/backup2.dump', '/path/backup3.dump']);
    });

    it('should remove duplicates', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('1,1,2');
      });

      const result = await promptMultiFileSelection(mockFiles);

      expect(result).toEqual(['/path/backup1.dump', '/path/backup2.dump']);
    });

    it('should reject invalid range', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('1-5');
      });

      await expect(promptMultiFileSelection(mockFiles)).rejects.toThrow('Invalid range: 1-5');
    });

    it('should reject invalid selection number', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('5');
      });

      await expect(promptMultiFileSelection(mockFiles)).rejects.toThrow('Invalid selection: 5');
    });

    it('should reject invalid format', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('abc,def');
      });

      await expect(promptMultiFileSelection(mockFiles)).rejects.toThrow(
        'Invalid selection format. Use numbers separated by commas (e.g., "1,3,5") or ranges (e.g., "1-3,5").'
      );
    });
  });

  describe('promptConfirmation', () => {
    const mockFilePaths = ['/path/backup1.dump', '/path/backup2.dump'];

    it('should return true for "yes" input', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('yes');
      });

      const result = await promptConfirmation(mockFilePaths);

      expect(result).toBe(true);
      expect(mockRl.close).toHaveBeenCalled();
    });

    it('should return false for "no" input', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('no');
      });

      const result = await promptConfirmation(mockFilePaths);

      expect(result).toBe(false);
    });

    it('should return false for any input other than "yes"', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('maybe');
      });

      const result = await promptConfirmation(mockFilePaths);

      expect(result).toBe(false);
    });

    it('should handle case-insensitive input', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('YES');
      });

      const result = await promptConfirmation(mockFilePaths);

      expect(result).toBe(true);
    });

    it('should trim whitespace from input', async () => {
      mockRl.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('  yes  ');
      });

      const result = await promptConfirmation(mockFilePaths);

      expect(result).toBe(true);
    });
  });
});