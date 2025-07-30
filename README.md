# pg_br

A simple Node.js TypeScript CLI tool that echoes command line arguments.

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

Example:
```bash
npm run dev hello world
# Output: hello world
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

Example:
```bash
./dist/cli.js hello world
# Output: hello world
```

### Global Usage

After global installation:

```bash
pg_br <arguments>
```

Example:
```bash
pg_br hello world
# Output: hello world
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev <args>` - Run with ts-node for development

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