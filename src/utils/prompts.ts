import * as readline from 'readline';
import { BackupFileBasic } from '../types/index.js';
import { execSync } from 'child_process';

export function promptFileSelection(files: BackupFileBasic[]): Promise<string> {
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

export function promptMultiFileSelection(files: BackupFileBasic[]): Promise<string[]> {
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

    rl.question('Select files to remove (e.g., "1,3,5" or "1-3,5"): ', answer => {
      rl.close();

      try {
        const selectedPaths: string[] = [];
        const selections = answer.trim().split(',');

        for (const selection of selections) {
          const trimmed = selection.trim();

          if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
            if (isNaN(start) || isNaN(end) || start < 1 || end > files.length || start > end) {
              reject(new Error(`Invalid range: ${trimmed}`));
              return;
            }
            for (let i = start; i <= end; i++) {
              selectedPaths.push(files[i - 1].path);
            }
          } else {
            const num = parseInt(trimmed, 10);
            if (isNaN(num) || num < 1 || num > files.length) {
              reject(new Error(`Invalid selection: ${trimmed}`));
              return;
            }
            selectedPaths.push(files[num - 1].path);
          }
        }

        const uniquePaths = [...new Set(selectedPaths)];
        resolve(uniquePaths);
      } catch {
        reject(
          new Error(
            'Invalid selection format. Use numbers separated by commas (e.g., "1,3,5") or ranges (e.g., "1-3,5").'
          )
        );
      }
    });
  });
}

export function promptConfirmation(filePaths: string[]): Promise<boolean> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nFiles to be removed:');
    filePaths.forEach(path => {
      const fileName = path.split('/').pop() || path;
      console.log(`  - ${fileName}`);
    });
    console.log();

    rl.question('Are you sure you want to remove these files? (yes/no): ', answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

export function promptOverwriteConfirmation(fileName: string): Promise<boolean> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`Backup file '${fileName}' already exists. Overwrite? (Y/n): `, answer => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === '' || trimmed === 'y' || trimmed === 'yes');
    });
  });
}

export function getAvailableDatabases(): string[] {
  try {
    const output = execSync('psql -l -t', { encoding: 'utf8' });
    const databases: string[] = [];

    const lines = output.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('|')) {
        const parts = trimmed.split('|');
        if (parts.length > 0) {
          const dbName = parts[0].trim();
          if (dbName && dbName !== 'Name' && !dbName.startsWith('(') && !dbName.startsWith('-')) {
            databases.push(dbName);
          }
        }
      }
    }

    return databases.filter(db => db && db !== 'template0' && db !== 'template1');
  } catch {
    throw new Error(
      'Failed to list databases. Make sure PostgreSQL is running and psql is available.'
    );
  }
}

export function promptDatabaseSelection(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const databases = getAvailableDatabases();

      if (databases.length === 0) {
        reject(new Error('No databases found.'));
        return;
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log('\nAvailable databases:');
      databases.forEach((db, index) => {
        console.log(`  ${index + 1}. ${db}`);
      });
      console.log();

      rl.question('Select a database (enter number): ', answer => {
        rl.close();

        const selection = parseInt(answer.trim(), 10);
        if (isNaN(selection) || selection < 1 || selection > databases.length) {
          reject(new Error('Invalid selection. Please enter a valid number.'));
          return;
        }

        resolve(databases[selection - 1]);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function promptBackupName(): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askForName = () => {
      rl.question('Enter backup name (without .dump extension): ', answer => {
        const trimmed = answer.trim();

        if (!trimmed) {
          console.log('Backup name cannot be empty. Please try again.');
          askForName();
          return;
        }

        if (trimmed.includes('/') || trimmed.includes('\\')) {
          console.log('Backup name cannot contain path separators. Please try again.');
          askForName();
          return;
        }

        if (trimmed.endsWith('.dump')) {
          resolve(trimmed.slice(0, -5));
        } else {
          resolve(trimmed);
        }
        rl.close();
      });
    };

    askForName();
  });
}
