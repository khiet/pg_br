import { execSync } from 'child_process';
import {
  getBackupFilesForDatabase,
  promptFileSelection,
  promptDatabaseSelection,
} from '../utils/index.js';

export async function restoreCommand(databaseName?: string): Promise<void> {
  try {
    // Interactive mode: prompt for database name if not provided
    if (!databaseName) {
      try {
        databaseName = await promptDatabaseSelection();
        console.log(`Selected database: ${databaseName}`);
      } catch (error) {
        console.error('✗', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    }

    console.log(`Preparing to restore database '${databaseName}'...`);

    const backupFiles = getBackupFilesForDatabase(databaseName);

    if (backupFiles.length === 0) {
      console.log(`No backup files found for database '${databaseName}'.`);
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
