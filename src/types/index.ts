export interface Config {
  destination?: string;
}

export interface BackupFile {
  name: string;
  path: string;
  created: Date;
  size: number;
  modified: Date;
}

export interface BackupFileBasic {
  name: string;
  path: string;
}
