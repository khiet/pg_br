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
  const baseBackupDir = getBackupDirectory();

  if (!existsSync(baseBackupDir)) {
    return [];
  }

  try {
    const allFiles: BackupFileBasic[] = [];
    const entries = readdirSync(baseBackupDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dbDir = join(baseBackupDir, entry.name);
        const dbFiles = readdirSync(dbDir)
          .filter(file => file.endsWith('.dump'))
          .map(file => ({
            name: file,
            path: join(dbDir, file),
          }));
        allFiles.push(...dbFiles);
      }
    }

    return allFiles;
  } catch (error) {
    console.error(
      'Error reading backup directory:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

export function getDetailedBackupFiles(): BackupFile[] {
  const baseBackupDir = getBackupDirectory();

  if (!existsSync(baseBackupDir)) {
    return [];
  }

  try {
    const allFiles: BackupFile[] = [];
    const entries = readdirSync(baseBackupDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dbDir = join(baseBackupDir, entry.name);
        const dbFiles = readdirSync(dbDir)
          .filter(file => file.endsWith('.dump'))
          .map(file => {
            const filePath = join(dbDir, file);
            const stats = statSync(filePath);
            return {
              name: file,
              path: filePath,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
            };
          });
        allFiles.push(...dbFiles);
      }
    }

    return allFiles.sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error(
      'Error reading backup directory:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

export function getBackupFilesForDatabase(databaseName: string): BackupFileBasic[] {
  const baseBackupDir = getBackupDirectory();
  const dbDir = join(baseBackupDir, databaseName);

  if (!existsSync(dbDir)) {
    return [];
  }

  try {
    return readdirSync(dbDir)
      .filter(file => file.endsWith('.dump'))
      .map(file => {
        const filePath = join(dbDir, file);
        const stats = statSync(filePath);
        return {
          name: file,
          path: filePath,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .map(f => ({ name: f.name, path: f.path }));
  } catch (error) {
    console.error(
      `Error reading backup directory for database '${databaseName}':`,
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

export function getBackupsByDatabase(): Record<string, BackupFile[]> {
  const baseBackupDir = getBackupDirectory();

  if (!existsSync(baseBackupDir)) {
    return {};
  }

  try {
    const backupsByDb: Record<string, BackupFile[]> = {};
    const entries = readdirSync(baseBackupDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dbName = entry.name;
        const dbDir = join(baseBackupDir, dbName);
        const dbFiles = readdirSync(dbDir)
          .filter(file => file.endsWith('.dump'))
          .map(file => {
            const filePath = join(dbDir, file);
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

        if (dbFiles.length > 0) {
          backupsByDb[dbName] = dbFiles;
        }
      }
    }

    return backupsByDb;
  } catch (error) {
    console.error(
      'Error reading backup directories:',
      error instanceof Error ? error.message : String(error)
    );
    return {};
  }
}
