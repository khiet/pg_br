import { execSync } from 'child_process';
import { getBackupFiles, promptMultiFileSelection, promptConfirmation } from '../utils/index.js';

export function removeCommand(): void {
  try {
    console.log('Preparing to remove backup files...');

    const backupFiles = getBackupFiles();

    if (backupFiles.length === 0) {
      console.log('No backup files found in the destination directory.');
      console.log('Use "pg_br ls" to check available backups.');
      return;
    }

    promptMultiFileSelection(backupFiles)
      .then(selectedPaths => {
        if (selectedPaths.length === 0) {
          console.log('No files selected.');
          return;
        }

        return promptConfirmation(selectedPaths).then(confirmed => {
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
        });
      })
      .catch(error => {
        console.error('✗ Remove failed:', error.message);
        process.exit(1);
      });
  } catch (error) {
    console.error('✗ Remove failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
