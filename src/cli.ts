#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import * as yaml from 'js-yaml';
import * as readline from 'readline';

const args = process.argv.slice(2);
const command = args[0];

interface Config {
  destination?: string;
}

function expandPath(path: string): string {
  // Expand environment variables
  return path
    .replace(/\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, braced, unbraced) => {
      const varName = braced || unbraced;
      return process.env[varName] || match;
    })
    .replace(/^~/, homedir());
}

function loadConfig(): Config {
  const configPath = join(homedir(), '.pg_br.yml');

  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const configContent = readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent) as Config;

    // Expand paths in config
    if (config.destination) {
      config.destination = expandPath(config.destination);
    }

    return config;
  } catch (error) {
    console.warn(
      `Warning: Failed to load config file ${configPath}: ${error instanceof Error ? error.message : String(error)}`
    );
    return {};
  }
}

function showUsage() {
  console.log('Usage:');
  console.log('  pg_br backup <database_name> <backup_name> - Backup PostgreSQL database');
  console.log('  pg_br ls                                 - List all backups from destination');
  console.log('  pg_br restore <database_name>           - Restore database from backup file');
  console.log('');
  console.log('Examples:');
  console.log('  pg_br backup pave_api_development flipper_tu');
  console.log('  pg_br ls');
  console.log('  pg_br restore pave_api_development');
}

function listBackups() {
  try {
    const config = loadConfig();

    // Determine backup destination
    let backupDir: string;
    if (config.destination) {
      backupDir = resolve(config.destination);
    } else {
      backupDir = process.cwd();
    }

    console.log(`Listing backups from: ${backupDir}`);
    console.log();

    if (!existsSync(backupDir)) {
      console.log('No backup directory found.');
      return;
    }

    try {
      const files = readdirSync(backupDir)
        .filter(file => file.endsWith('.dump'))
        .map(file => {
          const filePath = join(backupDir, file);
          const stats = statSync(filePath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      if (files.length === 0) {
        console.log('No backup files found.');
        return;
      }

      console.log(`Found ${files.length} backup(s):`);
      console.log();

      files.forEach(file => {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        const createdDate = file.created.toLocaleDateString();
        const createdTime = file.created.toLocaleTimeString();

        console.log(`📁 ${file.name}`);
        console.log(`   Size: ${sizeInMB} MB`);
        console.log(`   Created: ${createdDate} ${createdTime}`);
        console.log();
      });
    } catch (readError) {
      console.error(
        'Error reading backup directory:',
        readError instanceof Error ? readError.message : String(readError)
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('Error listing backups:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function getBackupFiles(): { name: string; path: string }[] {
  const config = loadConfig();

  // Determine backup destination
  let backupDir: string;
  if (config.destination) {
    backupDir = resolve(config.destination);
  } else {
    backupDir = process.cwd();
  }

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

function promptFileSelection(files: { name: string; path: string }[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nAvailable backup files:');
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
    });
    console.log();

    rl.question('Select a backup file (enter number): ', answer => {
      rl.close();

      const selection = parseInt(answer.trim(), 10);
      if (isNaN(selection) || selection < 1 || selection > files.length) {
        reject(new Error('Invalid selection. Please enter a valid number.'));
        return;
      }

      resolve(files[selection - 1].path);
    });
  });
}

function restoreDatabase(databaseName: string) {
  try {
    console.log(`Preparing to restore database '${databaseName}'...`);

    const backupFiles = getBackupFiles();

    if (backupFiles.length === 0) {
      console.log('No backup files found in the destination directory.');
      console.log('Use "pg_br ls" to check available backups.');
      return;
    }

    promptFileSelection(backupFiles)
      .then(selectedFile => {
        console.log(`\nSelected backup file: ${selectedFile}`);
        console.log(`Restoring to database '${databaseName}'...`);

        const pgRestoreCommand = `pg_restore --verbose --clean --no-acl --no-owner -h localhost -d "${databaseName}" "${selectedFile}"`;

        console.log('Running pg_restore...');
        execSync(pgRestoreCommand, { stdio: 'inherit' });

        console.log(`✓ Database '${databaseName}' restored successfully from ${selectedFile}`);
      })
      .catch(error => {
        console.error('✗ Restore failed:', error.message);
        process.exit(1);
      });
  } catch (error) {
    console.error('✗ Restore failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function backupDatabase(databaseName: string, backupName: string) {
  try {
    const config = loadConfig();
    const fileName = `${backupName}.dump`;

    // Determine backup destination
    let backupDir: string;
    if (config.destination) {
      backupDir = resolve(config.destination);
      console.log(`Using configured backup destination: ${backupDir}`);
    } else {
      backupDir = process.cwd();
      console.log('No config found, using current directory');
    }

    // Ensure backup directory exists
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

if (command === 'backup') {
  if (args.length !== 3) {
    console.error('Error: backup command requires exactly 2 arguments');
    console.error('Usage: pg_br backup <database_name> <backup_name>');
    process.exit(1);
  }

  const [, databaseName, backupName] = args;
  backupDatabase(databaseName, backupName);
} else if (command === 'restore') {
  if (args.length !== 2) {
    console.error('Error: restore command requires exactly 1 argument');
    console.error('Usage: pg_br restore <database_name>');
    process.exit(1);
  }

  const [, databaseName] = args;
  restoreDatabase(databaseName);
} else if (command === 'ls') {
  listBackups();
} else if (command === 'help' || command === '--help' || command === '-h') {
  showUsage();
} else if (args.length === 0) {
  showUsage();
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Use "pg_br help" to see available commands.');
  process.exit(1);
}
