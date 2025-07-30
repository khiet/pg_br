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

npm run dev bak <database_name> <backup_name>
# Creates backup: <backup_name>.dump
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

./dist/cli.js bak <database_name> <backup_name>
# Creates backup: <backup_name>.dump
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

pg_br bak <database_name> <backup_name>
# Creates backup: <backup_name>.dump
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

The backup file will be named `<backup_name>.dump` and saved to:

- The directory specified in `~/.pg_br.yml` config file (if configured)
- The current working directory (if no config file exists)

The destination directory will be created automatically if it doesn't exist.

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

## Configuration

`pg_br` supports a YAML configuration file located at `~/.pg_br.yml` for customizing backup behavior. Create the file at `~/.pg_br.yml`, using `.pg_br.yml.example` as a reference.

## Prerequisites

- Node.js (for running the CLI)
- PostgreSQL with `pg_dump` utility (for database backups)

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
