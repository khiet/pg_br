#!/usr/bin/env node

import { backupCommand, listCommand, restoreCommand, removeCommand } from './commands';

const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
  console.log('Usage:');
  console.log('  pg_br backup <database_name> <backup_name> - Backup PostgreSQL database');
  console.log('  pg_br ls                                   - List all backups from destination');
  console.log('  pg_br restore <database_name>              - Restore database from backup file');
  console.log(
    '  pg_br remove                               - Remove backup files from destination'
  );
}

if (command === 'backup') {
  if (args.length !== 3) {
    console.error('Error: backup command requires exactly 2 arguments');
    console.error('Usage: pg_br backup <database_name> <backup_name>');
    process.exit(1);
  }

  const [, databaseName, backupName] = args;
  backupCommand(databaseName, backupName);
} else if (command === 'restore') {
  if (args.length !== 2) {
    console.error('Error: restore command requires exactly 1 argument');
    console.error('Usage: pg_br restore <database_name>');
    process.exit(1);
  }

  const [, databaseName] = args;
  restoreCommand(databaseName);
} else if (command === 'remove') {
  if (args.length !== 1) {
    console.error('Error: remove command requires no arguments');
    console.error('Usage: pg_br remove');
    process.exit(1);
  }

  removeCommand();
} else if (command === 'ls') {
  listCommand();
} else if (command === 'help' || command === '--help' || command === '-h') {
  showUsage();
} else if (args.length === 0) {
  showUsage();
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Use "pg_br help" to see available commands.');
  process.exit(1);
}
