#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
  console.log('Usage:');
  console.log('  pg_br <message>          - Echo a message');
  console.log('  pg_br bak <database_name> <backup_name> - Backup PostgreSQL database');
  console.log('');
  console.log('Examples:');
  console.log('  pg_br hello world');
  console.log('  pg_br bak pave_api_development flipper_tu');
}

function formatDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function backupDatabase(databaseName: string, backupName: string) {
  try {
    const timestamp = formatDate();
    const fileName = `${timestamp}_${backupName}.dump`;
    const backupPath = join(process.cwd(), fileName);
    
    console.log(`Creating backup of database '${databaseName}' as '${fileName}'...`);
    
    const pgDumpCommand = `pg_dump -Fc --no-acl --no-owner -h localhost "${databaseName}" > "${backupPath}"`;
    
    execSync(pgDumpCommand, { stdio: 'inherit' });
    
    if (existsSync(backupPath)) {
      console.log(`✓ Backup created successfully: ${fileName}`);
    } else {
      console.error('✗ Backup file was not created');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Backup failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (command === 'bak') {
  if (args.length !== 3) {
    console.error('Error: bak command requires exactly 2 arguments');
    console.error('Usage: pg_br bak <database_name> <backup_name>');
    process.exit(1);
  }
  
  const [, databaseName, backupName] = args;
  backupDatabase(databaseName, backupName);
} else if (command === 'help' || command === '--help' || command === '-h') {
  showUsage();
} else if (args.length === 0) {
  showUsage();
} else {
  const message = args.join(' ');
  console.log(message);
}