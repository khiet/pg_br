import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { loadConfig } from '../utils';

export function backupCommand(databaseName: string, backupName: string): void {
  try {
    const config = loadConfig();
    const fileName = `${backupName}.dump`;

    let backupDir: string;
    if (config.destination) {
      backupDir = resolve(config.destination);
      console.log(`Using configured backup destination: ${backupDir}`);
    } else {
      backupDir = process.cwd();
      console.log('No config found, using current directory');
    }

    if (!existsSync(backupDir)) {
      console.log(`Creating backup directory: ${backupDir}`);
      mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = join(backupDir, fileName);

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
