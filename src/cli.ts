#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import * as yaml from 'js-yaml';

const args = process.argv.slice(2);
const command = args[0];

interface Config {
  destination?: string;
}

function expandPath(path: string): string {
  // Expand environment variables
  return path.replace(/\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, braced, unbraced) => {
    const varName = braced || unbraced;
    return process.env[varName] || match;
  }).replace(/^~/, homedir());
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
    console.warn(`Warning: Failed to load config file ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}

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
    const config = loadConfig();
    const timestamp = formatDate();
    const fileName = `${timestamp}_${backupName}.dump`;
    
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