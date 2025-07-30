import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface MockBackupFile {
  name: string;
  content: string;
  size?: number;
}

export function createMockBackupFiles(directory: string, files: MockBackupFile[]): void {
  mkdirSync(directory, { recursive: true });
  
  files.forEach(file => {
    const filePath = join(directory, file.name);
    const content = file.size 
      ? file.content.padEnd(file.size, ' ') 
      : file.content;
    
    writeFileSync(filePath, content);
  });
}

export const sampleBackupFiles: MockBackupFile[] = [
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

export function createTestConfig(path: string, destination: string): void {
  const configContent = `destination: ${destination}`;
  writeFileSync(path, configContent);
}

export function createTestConfigWithEnvVar(path: string, envVar: string): void {
  const configContent = `destination: \${${envVar}}`;
  writeFileSync(path, configContent);
}