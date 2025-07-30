"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const readline = __importStar(require("readline"));
const prompts_1 = require("../../../src/utils/prompts");
globals_1.jest.mock('readline');
const mockReadline = readline;
(0, globals_1.describe)('Prompt Utils', () => {
    let mockRl;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockRl = {
            question: globals_1.jest.fn(),
            close: globals_1.jest.fn(),
        };
        mockReadline.createInterface.mockReturnValue(mockRl);
    });
    (0, globals_1.describe)('promptFileSelection', () => {
        const mockFiles = [
            { name: 'backup1.dump', path: '/path/backup1.dump' },
            { name: 'backup2.dump', path: '/path/backup2.dump' },
        ];
        (0, globals_1.it)('should return selected file path for valid selection', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('1');
            });
            const result = yield (0, prompts_1.promptFileSelection)(mockFiles);
            (0, globals_1.expect)(result).toBe('/path/backup1.dump');
            (0, globals_1.expect)(mockRl.close).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should reject for invalid selection number', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('3');
            });
            yield (0, globals_1.expect)((0, prompts_1.promptFileSelection)(mockFiles)).rejects.toThrow('Invalid selection. Please enter a valid number.');
        }));
        (0, globals_1.it)('should reject for non-numeric input', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('abc');
            });
            yield (0, globals_1.expect)((0, prompts_1.promptFileSelection)(mockFiles)).rejects.toThrow('Invalid selection. Please enter a valid number.');
        }));
        (0, globals_1.it)('should reject for zero or negative numbers', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('0');
            });
            yield (0, globals_1.expect)((0, prompts_1.promptFileSelection)(mockFiles)).rejects.toThrow('Invalid selection. Please enter a valid number.');
        }));
    });
    (0, globals_1.describe)('promptMultiFileSelection', () => {
        const mockFiles = [
            { name: 'backup1.dump', path: '/path/backup1.dump' },
            { name: 'backup2.dump', path: '/path/backup2.dump' },
            { name: 'backup3.dump', path: '/path/backup3.dump' },
        ];
        (0, globals_1.it)('should handle single file selection', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('2');
            });
            const result = yield (0, prompts_1.promptMultiFileSelection)(mockFiles);
            (0, globals_1.expect)(result).toEqual(['/path/backup2.dump']);
        }));
        (0, globals_1.it)('should handle multiple file selection', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('1,3');
            });
            const result = yield (0, prompts_1.promptMultiFileSelection)(mockFiles);
            (0, globals_1.expect)(result).toEqual(['/path/backup1.dump', '/path/backup3.dump']);
        }));
        (0, globals_1.it)('should handle range selection', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('1-2');
            });
            const result = yield (0, prompts_1.promptMultiFileSelection)(mockFiles);
            (0, globals_1.expect)(result).toEqual(['/path/backup1.dump', '/path/backup2.dump']);
        }));
        (0, globals_1.it)('should handle mixed range and individual selection', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('1-2,3');
            });
            const result = yield (0, prompts_1.promptMultiFileSelection)(mockFiles);
            (0, globals_1.expect)(result).toEqual(['/path/backup1.dump', '/path/backup2.dump', '/path/backup3.dump']);
        }));
        (0, globals_1.it)('should remove duplicates', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('1,1,2');
            });
            const result = yield (0, prompts_1.promptMultiFileSelection)(mockFiles);
            (0, globals_1.expect)(result).toEqual(['/path/backup1.dump', '/path/backup2.dump']);
        }));
        (0, globals_1.it)('should reject invalid range', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('1-5');
            });
            yield (0, globals_1.expect)((0, prompts_1.promptMultiFileSelection)(mockFiles)).rejects.toThrow('Invalid range: 1-5');
        }));
        (0, globals_1.it)('should reject invalid selection number', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('5');
            });
            yield (0, globals_1.expect)((0, prompts_1.promptMultiFileSelection)(mockFiles)).rejects.toThrow('Invalid selection: 5');
        }));
        (0, globals_1.it)('should reject invalid format', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('abc,def');
            });
            yield (0, globals_1.expect)((0, prompts_1.promptMultiFileSelection)(mockFiles)).rejects.toThrow('Invalid selection format. Use numbers separated by commas (e.g., "1,3,5") or ranges (e.g., "1-3,5").');
        }));
    });
    (0, globals_1.describe)('promptConfirmation', () => {
        const mockFilePaths = ['/path/backup1.dump', '/path/backup2.dump'];
        (0, globals_1.it)('should return true for "yes" input', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('yes');
            });
            const result = yield (0, prompts_1.promptConfirmation)(mockFilePaths);
            (0, globals_1.expect)(result).toBe(true);
            (0, globals_1.expect)(mockRl.close).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should return false for "no" input', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('no');
            });
            const result = yield (0, prompts_1.promptConfirmation)(mockFilePaths);
            (0, globals_1.expect)(result).toBe(false);
        }));
        (0, globals_1.it)('should return false for any input other than "yes"', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('maybe');
            });
            const result = yield (0, prompts_1.promptConfirmation)(mockFilePaths);
            (0, globals_1.expect)(result).toBe(false);
        }));
        (0, globals_1.it)('should handle case-insensitive input', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('YES');
            });
            const result = yield (0, prompts_1.promptConfirmation)(mockFilePaths);
            (0, globals_1.expect)(result).toBe(true);
        }));
        (0, globals_1.it)('should trim whitespace from input', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRl.question.mockImplementation((question, callback) => {
                callback('  yes  ');
            });
            const result = yield (0, prompts_1.promptConfirmation)(mockFilePaths);
            (0, globals_1.expect)(result).toBe(true);
        }));
    });
});
