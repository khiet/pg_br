import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import {
  loadConfig,
  promptOverwriteConfirmation,
  promptDatabaseSelection,
  promptBackupName,
} from '../utils/index.js';

export async function backupCommand(databaseName?: string, backupName?: string): Promise<void> {
  try {
    // Interactive mode: prompt for database and backup name if not provided
    if (!databaseName) {
      try {
        databaseName = await promptDatabaseSelection();
        console.log(`Selected database: ${databaseName}`);
      } catch (error) {
        console.error('✗', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    }

    if (!backupName) {
      try {
        backupName = await promptBackupName();
      } catch (error) {
        console.error('✗', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    }

    const config = loadConfig();
    const fileName = `${backupName}.dump`;

    let baseBackupDir: string;
    if (config.destination) {
      baseBackupDir = resolve(config.destination);
      console.log(`Using configured backup destination: ${baseBackupDir}`);
    } else {
      baseBackupDir = process.cwd();
      console.log('No config found, using current directory');
    }

    // Create database-specific directory
    const backupDir = join(baseBackupDir, databaseName);
    if (!existsSync(backupDir)) {
      console.log(`Creating database-specific backup directory: ${backupDir}`);
      mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = join(backupDir, fileName);

    if (existsSync(backupPath)) {
      const shouldOverwrite = await promptOverwriteConfirmation(fileName);
      if (!shouldOverwrite) {
        console.log('Backup cancelled.');
        process.exit(0);
      }
    }

    console.log(`Creating backup of database '${databaseName}' as '${fileName}'...`);

    const pgDumpCommand = `pg_dump -Fc --no-acl --no-owner -h localhost -f "${backupPath}" "${databaseName}"`;

    execSync(pgDumpCommand, { stdio: 'inherit' });

    if (existsSync(backupPath)) {
      console.log(`✓ Backup created successfully: ${backupPath}`);
    } else {
      console.error('✗ Backup file was not created');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Backup failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
