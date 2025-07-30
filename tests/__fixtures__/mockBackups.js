"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleBackupFiles = void 0;
exports.createMockBackupFiles = createMockBackupFiles;
exports.createTestConfig = createTestConfig;
exports.createTestConfigWithEnvVar = createTestConfigWithEnvVar;
const fs_1 = require("fs");
const path_1 = require("path");
function createMockBackupFiles(directory, files) {
    (0, fs_1.mkdirSync)(directory, { recursive: true });
    files.forEach(file => {
        const filePath = (0, path_1.join)(directory, file.name);
        const content = file.size
            ? file.content.padEnd(file.size, ' ')
            : file.content;
        (0, fs_1.writeFileSync)(filePath, content);
    });
}
exports.sampleBackupFiles = [
    {
        name: 'users_backup_2023_01_01.dump',
        content: 'mock PostgreSQL dump for users database',
        size: 1024 * 1024, // 1MB
    },
    {
        name: 'products_backup_2023_01_02.dump',
        content: 'mock PostgreSQL dump for products database',
        size: 2 * 1024 * 1024, // 2MB
    },
    {
        name: 'orders_backup_2023_01_03.dump',
        content: 'mock PostgreSQL dump for orders database',
        size: 512 * 1024, // 512KB
    },
];
function createTestConfig(path, destination) {
    const configContent = `destination: ${destination}`;
    (0, fs_1.writeFileSync)(path, configContent);
}
function createTestConfigWithEnvVar(path, envVar) {
    const configContent = `destination: \${${envVar}}`;
    (0, fs_1.writeFileSync)(path, configContent);
}
