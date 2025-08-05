import { existsSync } from 'fs';
import { getBackupDirectory, getDetailedBackupFiles } from '../utils/index.js';

export function listCommand(): void {
  try {
    const backupDir = getBackupDirectory();

    console.log(`Listing backups from: ${backupDir}`);
    console.log();

    if (!existsSync(backupDir)) {
      console.log('No backup directory found.');
      return;
    }

    const files = getDetailedBackupFiles();

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
      const displayName = file.name.endsWith('.dump') ? file.name.slice(0, -5) : file.name;

      console.log(`📁 ${displayName}`);
      console.log(`   Size: ${sizeInMB} MB`);
      console.log(`   Created: ${createdDate} ${createdTime}`);
      console.log();
    });
  } catch (error) {
    console.error('Error listing backups:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
