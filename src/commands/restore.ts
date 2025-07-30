import { execSync } from 'child_process';
import { getBackupFiles, promptFileSelection } from '../utils';

export function restoreCommand(databaseName: string): void {
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
