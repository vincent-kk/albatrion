# @slats/claude-assets-sync

CLI tool to sync Claude commands and skills from npm packages to your project's `.claude/` directory.

## Overview

This tool allows npm package authors to distribute Claude Code commands and skills alongside their packages. When users install these packages, they can sync the Claude assets to their local `.claude/` directory for immediate use with Claude Code.

## Installation

```bash
# Using npx (recommended for one-time use)
npx @slats/claude-assets-sync -p @canard/schema-form

# Or install globally
npm install -g @slats/claude-assets-sync
```

## Usage

### Basic Usage

```bash
# Sync a single package
npx @slats/claude-assets-sync -p @canard/schema-form

# Sync multiple packages
npx @slats/claude-assets-sync -p @canard/schema-form -p @lerx/promise-modal
```

### Options

| Option | Description |
|--------|-------------|
| `-p, --package <name>` | Package name to sync (can be specified multiple times) |
| `-f, --force` | Force sync even if version matches |
| `--dry-run` | Preview changes without writing files |
| `--help` | Show help |
| `--version` | Show version |

### Examples

```bash
# Preview what would be synced
npx @slats/claude-assets-sync -p @canard/schema-form --dry-run

# Force sync (ignore version check)
npx @slats/claude-assets-sync -p @canard/schema-form --force

# Sync with GitHub token (for higher rate limits)
GITHUB_TOKEN=ghp_xxx npx @slats/claude-assets-sync -p @canard/schema-form
```

## For Package Authors

To make your package compatible with `claude-assets-sync`, add a `claude` field to your `package.json`:

```json
{
  "name": "@your-scope/your-package",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-repo.git",
    "directory": "packages/your-package"
  },
  "claude": {
    "assetPath": "docs/claude"
  }
}
```

### Directory Structure

Your package should have the following structure:

```
your-package/
├── docs/
│   └── claude/
│       ├── commands/
│       │   └── your-command.md
│       └── skills/
│           └── your-skill.md
└── package.json
```

### File Format

- Commands and skills should be Markdown files (`.md`)
- Files are synced directly without modification
- Use the standard Claude Code command/skill format

## Destination Structure

Synced files are organized in your project's `.claude/` directory:

```
your-project/
└── .claude/
    ├── commands/
    │   └── @your-scope/
    │       └── your-package/
    │           ├── your-command.md
    │           └── .sync-meta.json
    └── skills/
        └── @your-scope/
            └── your-package/
                ├── your-skill.md
                └── .sync-meta.json
```

## Version Management

The tool creates `.sync-meta.json` files to track synced versions:

```json
{
  "version": "1.0.0",
  "syncedAt": "2025-02-01T12:00:00.000Z",
  "files": ["your-command.md"]
}
```

- Sync is skipped if the local version matches the package version
- Use `--force` to override version checking

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token for higher API rate limits |
| `VERBOSE` | Enable debug logging |

## Rate Limits

- **Without token**: 60 requests/hour (GitHub API limit)
- **With token**: 5,000 requests/hour

For most use cases, the unauthenticated limit is sufficient. If syncing many packages, set `GITHUB_TOKEN`.

## License

MIT License - see [LICENSE](./LICENSE) for details.
