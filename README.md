# pg_br

A Node.js TypeScript CLI tool with PostgreSQL database backup functionality and message echoing.

## Installation

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Global Installation

Install globally to use the `pg_br` command anywhere:

```bash
npm install -g .
```

## Usage

### Development Mode

Run directly with ts-node:

```bash
npm run dev <arguments>
```

Examples:
```bash
npm run dev hello world
# Output: hello world

npm run dev bak pave_api_development flipper_tu
# Creates backup: flipper_tu_2025-01-30.dump
```

### Built Version

Build the TypeScript to JavaScript:

```bash
npm run build
```

Run the built CLI:

```bash
./dist/cli.js <arguments>
```

Examples:
```bash
./dist/cli.js hello world
# Output: hello world

./dist/cli.js bak pave_api_development flipper_tu
# Creates backup: flipper_tu_2025-01-30.dump
```

### Global Usage

After global installation:

```bash
pg_br <arguments>
```

Examples:
```bash
pg_br hello world
# Output: hello world

pg_br bak pave_api_development flipper_tu
# Creates backup: flipper_tu_2025-01-30.dump
```

## Commands

### Database Backup
```bash
pg_br bak <database_name> <backup_name>
```
Creates a PostgreSQL database backup using `pg_dump` with the following flags:
- `-Fc` - Custom format (compressed)
- `--no-acl` - Skip access control lists
- `--no-owner` - Skip object ownership
- `-h localhost` - Connect to localhost

The backup file will be named `<backup_name>_YYYY-MM-DD.dump` and saved in the current directory.

### Message Echo
```bash
pg_br <message>
```
Echoes the provided message to stdout.

### Help
```bash
pg_br help
pg_br --help
pg_br -h
```
Shows usage information.

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev <args>` - Run with ts-node for development

## Prerequisites

- Node.js (for running the CLI)
- PostgreSQL with `pg_dump` utility (for database backups)

## Project Structure

```
pg_br/
├── src/
│   └── cli.ts          # CLI entry point
├── dist/               # Built JavaScript (generated)
├── package.json        # Node.js package configuration
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## License

ISC