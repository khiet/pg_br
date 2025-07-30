# pg_br

A Node.js TypeScript CLI tool for PostgreSQL database backup management with interactive prompts and YAML configuration support.

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

Run directly with tsx:

```bash
npm run dev <arguments>
```

Examples:

```bash
npm run dev backup <database_name> <backup_name>
# Creates backup: <backup_name>.dump

npm run dev ls
# Lists all backup files

npm run dev restore <database_name>
# Interactive restore from backup files

npm run dev remove
# Interactive removal of backup files
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
./dist/cli.js backup <database_name> <backup_name>
# Creates backup: <backup_name>.dump

./dist/cli.js ls
# Lists all backup files

./dist/cli.js restore <database_name>
# Interactive restore from backup files

./dist/cli.js remove
# Interactive removal of backup files
```

### Global Usage

After global installation:

```bash
pg_br <arguments>
```

Examples:

```bash
pg_br backup <database_name> <backup_name>
# Creates backup: <backup_name>.dump

pg_br ls
# Lists all backup files

pg_br restore <database_name>
# Interactive restore from backup files

pg_br remove
# Interactive removal of backup files
```

## Commands

### Database Backup

```bash
pg_br backup <database_name> <backup_name>
```

Creates a PostgreSQL database backup using `pg_dump` with the following flags:

- `--verbose` - Verbose output
- `--clean` - Include clean (drop) commands
- `--no-acl` - Skip access control lists
- `--no-owner` - Skip object ownership

The backup file will be named `<backup_name>.dump` and saved to:

- The directory specified in `~/.pg_br.yml` config file (if configured)
- The current working directory (if no config file exists)

The destination directory will be created automatically if it doesn't exist.

### List Backups

```bash
pg_br ls
```

Lists all available backup files from the configured destination directory.

### Restore Database

```bash
pg_br restore <database_name>
```

Interactively restore a database from available backup files. Prompts you to select from available backup files.

### Remove Backups

```bash
pg_br remove
```

Interactively remove backup files. Supports individual selections and ranges (e.g., `1,3,5` or `1-3,7-9`).

### Help

```bash
pg_br help
pg_br --help
pg_br -h
```

Shows usage information.

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev <args>` - Run with tsx for development
- `npm run test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run typecheck` - Run TypeScript type checking without emit

## Configuration

`pg_br` supports a YAML configuration file located at `~/.pg_br.yml` for customizing backup behavior. Create the file at `~/.pg_br.yml`, using `.pg_br.yml.example` as a reference.

## Prerequisites

- Node.js (for running the CLI)
- PostgreSQL with `pg_dump` and `pg_restore` utilities (for database operations)

## Project Structure

```
pg_br/
├── src/
│   ├── cli.ts              # CLI entry point and main router
│   ├── commands/           # Command implementations
│   │   ├── index.ts        # Command exports
│   │   ├── backup.ts       # Database backup functionality
│   │   ├── list.ts         # List backup files
│   │   ├── restore.ts      # Interactive restore from backups
│   │   └── remove.ts       # Interactive backup file removal
│   ├── utils/              # Shared utilities
│   │   ├── index.ts        # Utility exports
│   │   ├── config.ts       # YAML configuration loading
│   │   ├── files.ts        # File operations and backup management
│   │   └── prompts.ts      # Interactive CLI prompts
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── tests/                  # Jest test suite
│   ├── unit/               # Unit tests for commands and utils
│   ├── integration/        # Integration tests
│   └── __fixtures__/       # Test fixtures and mock data
├── dist/                   # Built JavaScript (generated)
├── coverage/               # Test coverage reports (generated)
├── package.json            # Node.js package configuration
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest testing configuration
├── eslint.config.js        # ESLint configuration
├── CLAUDE.md              # Claude Code guidance
├── TESTING.md             # Testing documentation
└── README.md              # This file
```

## License

MIT
