import { execSync } from 'child_process';
import {
  getBackupsByDatabase,
  promptMultiFileSelection,
  promptConfirmation,
} from '../utils/index.js';
import { BackupFileBasic } from '../types/index.js';

export async function removeCommand(): Promise<void> {
  try {
    console.log('Preparing to remove backup files...');

    const backupsByDb = getBackupsByDatabase();
    const databases = Object.keys(backupsByDb);

    if (databases.length === 0) {
      console.log('No backup files found in the destination directory.');
      console.log('Use "pg_br ls" to check available backups.');
      return;
    }

    // Create a flat list of files with database context for selection
    const allBackupFiles: BackupFileBasic[] = [];
    databases.sort().forEach(dbName => {
      backupsByDb[dbName].forEach(file => {
        allBackupFiles.push({
          name: `[${dbName}] ${file.name}`,
          path: file.path,
        });
      });
    });

    const selectedPaths = await promptMultiFileSelection(allBackupFiles);

    if (selectedPaths.length === 0) {
      console.log('No files selected.');
      return;
    }

    const confirmed = await promptConfirmation(selectedPaths);

    if (!confirmed) {
      console.log('Operation cancelled.');
      return;
    }

    console.log('\nRemoving selected files...');

    let successCount = 0;
    let errorCount = 0;

    for (const filePath of selectedPaths) {
      try {
        const fileName = filePath.split('/').pop() || filePath;
        execSync(`rm "${filePath}"`, { stdio: 'pipe' });
        console.log(`✓ Removed: ${fileName}`);
        successCount++;
      } catch {
        const fileName = filePath.split('/').pop() || filePath;
        console.error(`✗ Failed to remove: ${fileName}`);
        errorCount++;
      }
    }

    console.log(`\nOperation completed: ${successCount} removed, ${errorCount} failed.`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Remove failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
