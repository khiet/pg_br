import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { BackupFile, BackupFileBasic } from '../types/index.js';
import { loadConfig } from './config.js';

export function getBackupDirectory(): string {
  const config = loadConfig();

  if (config.destination) {
    return resolve(config.destination);
  }
  return process.cwd();
}

export function getBackupFiles(): BackupFileBasic[] {
  const backupDir = getBackupDirectory();

  if (!existsSync(backupDir)) {
    return [];
  }

  try {
    const files = readdirSync(backupDir)
      .filter(file => file.endsWith('.dump'))
      .map(file => {
        const filePath = join(backupDir, file);
        const stats = statSync(filePath);
        return {
          name: file,
          path: filePath,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    return files.map(f => ({ name: f.name, path: f.path }));
  } catch (error) {
    console.error(
      'Error reading backup directory:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

export function getDetailedBackupFiles(): BackupFile[] {
  const backupDir = getBackupDirectory();

  if (!existsSync(backupDir)) {
    return [];
  }

  try {
    return readdirSync(backupDir)
      .filter(file => file.endsWith('.dump'))
      .map(file => {
        const filePath = join(backupDir, file);
        const stats = statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error(
      'Error reading backup directory:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}
