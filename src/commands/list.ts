import { existsSync } from 'fs';
import { getBackupDirectory, getBackupsByDatabase } from '../utils/index.js';

export function listCommand(): void {
  try {
    const backupDir = getBackupDirectory();

    console.log(`Listing backups from: ${backupDir}`);
    console.log();

    if (!existsSync(backupDir)) {
      console.log('No backup directory found.');
      return;
    }

    const backupsByDb = getBackupsByDatabase();
    const databases = Object.keys(backupsByDb);

    if (databases.length === 0) {
      console.log('No backup files found.');
      return;
    }

    let totalBackups = 0;
    databases.forEach(db => {
      totalBackups += backupsByDb[db].length;
    });

    console.log(`Found ${totalBackups} backup(s) across ${databases.length} database(s):`);
    console.log();

    databases.sort().forEach((dbName, dbIndex) => {
      const files = backupsByDb[dbName];

      console.log(
        `🗂️  Database: ${dbName} (${files.length} backup${files.length === 1 ? '' : 's'})`
      );
      console.log();

      files.forEach((file, fileIndex) => {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        const createdDate = file.created.toLocaleDateString();
        const createdTime = file.created.toLocaleTimeString();
        const displayName = file.name.endsWith('.dump') ? file.name.slice(0, -5) : file.name;

        console.log(`   📁 ${displayName}`);
        console.log(`      Size: ${sizeInMB} MB`);
        console.log(`      Created: ${createdDate} ${createdTime}`);

        if (fileIndex < files.length - 1) {
          console.log();
        }
      });

      if (dbIndex < databases.length - 1) {
        console.log();
        console.log('─'.repeat(50));
        console.log();
      }
    });
  } catch (error) {
    console.error('Error listing backups:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
