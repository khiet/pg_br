import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as yaml from 'js-yaml';
import { Config } from '../types';

export function expandPath(path: string): string {
  return path
    .replace(/\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, braced, unbraced) => {
      const varName = braced || unbraced;
      return process.env[varName] || match;
    })
    .replace(/^~/, homedir());
}

export function loadConfig(): Config {
  const configPath = join(homedir(), '.pg_br.yml');

  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const configContent = readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent) as Config;

    if (config.destination) {
      config.destination = expandPath(config.destination);
    }

    return config;
  } catch (error) {
    console.warn(
      `Warning: Failed to load config file ${configPath}: ${error instanceof Error ? error.message : String(error)}`
    );
    return {};
  }
}
