# @slats/claude-assets-sync

CLI tool to sync Claude commands and skills from npm packages to your project's `.claude/` directory.

## Overview

This tool allows npm package authors to distribute Claude Code commands and skills alongside their packages. When users install these packages, they can sync the Claude assets to their local `.claude/` directory for immediate use with Claude Code.

## Features

- **Multi-package sync**: Sync multiple packages in a single command
- **Version tracking**: Automatically skip re-syncing if versions match
- **Flat structure support**: Modern flat file organization with prefixed filenames
- **Legacy migration**: Migrate from nested to flat directory structure
- **Package management**: List, remove, and inspect synced packages
- **Status monitoring**: Check sync status and available updates
- **Dry-run mode**: Preview changes before applying them
- **GitHub & npm integration**: Fetch from GitHub API and monitor npm registry

## Installation

```bash
# Using npx (recommended for one-time use)
npx @slats/claude-assets-sync -p @canard/schema-form

# Or install globally
npm install -g @slats/claude-assets-sync
```

## Quick Start

```bash
# Sync a single package
npx @slats/claude-assets-sync -p @canard/schema-form

# Sync multiple packages
npx @slats/claude-assets-sync -p @canard/schema-form -p @lerx/promise-modal

# See what would be synced
npx @slats/claude-assets-sync -p @canard/schema-form --dry-run

# Check sync status and available updates
npx @slats/claude-assets-sync status

# List all synced packages
npx @slats/claude-assets-sync list

# Remove a synced package
npx @slats/claude-assets-sync remove -p @canard/schema-form

# Migrate from legacy nested structure to flat structure
npx @slats/claude-assets-sync migrate
```

## Commands

### sync (Default Command)

Synchronize Claude assets from npm packages.

```bash
npx @slats/claude-assets-sync [options] -p <package>
```

**Options:**

| Option | Description |
|--------|-------------|
| `-p, --package <name>` | Package name to sync (can be specified multiple times) |
| `-f, --force` | Force sync even if version matches |
| `--dry-run` | Preview changes without writing files |
| `-l, --local` | Read packages from local workspace instead of node_modules |
| `-r, --ref <ref>` | Git ref (branch, tag, or commit) to fetch from |
| `--no-flat` | Use legacy nested directory structure instead of flat |
| `--help` | Show help |
| `--version` | Show version |

**Examples:**

```bash
# Sync with version check (default behavior)
npx @slats/claude-assets-sync -p @canard/schema-form

# Force sync, ignoring version check
npx @slats/claude-assets-sync -p @canard/schema-form --force

# Preview changes before syncing
npx @slats/claude-assets-sync -p @canard/schema-form --dry-run

# Sync from a specific git ref
npx @slats/claude-assets-sync -p @canard/schema-form -r main

# Sync from local workspace
npx @slats/claude-assets-sync -p @canard/schema-form --local

# Use legacy nested structure
npx @slats/claude-assets-sync -p @canard/schema-form --no-flat
```

### add

Add a package with interactive file selection.

```bash
npx @slats/claude-assets-sync add -p <package> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-p, --package <name>` | Package name to add (required) |
| `-l, --local` | Read packages from local workspace instead of node_modules |
| `-r, --ref <ref>` | Git ref (branch, tag, or commit) to fetch from |

**Interactive Features:**

When running in a TTY environment, the add command provides an interactive tree-select UI:

- **↑/↓**: Navigate items
- **Space**: Toggle file/directory selection
- **→/←**: Expand/collapse directories
- **Enter**: Confirm selection and sync
- **a**: Select all files
- **n**: Deselect all files
- **q**: Cancel operation

**Examples:**

```bash
# Add a package with interactive selection
npx @slats/claude-assets-sync add -p @lerx/promise-modal

# Add from local workspace
npx @slats/claude-assets-sync add -p @lerx/promise-modal --local

# Add from specific git branch
npx @slats/claude-assets-sync add -p @lerx/promise-modal --ref master
```

### list

List all synced packages with interactive tree view and edit mode.

```bash
npx @slats/claude-assets-sync list [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

**Interactive Features (TTY mode):**

When running in a TTY environment, the list command provides an interactive UI:

**View Mode:**
- Tree structure showing all synced packages and their files
- **e**: Enter edit mode
- **r**: Refresh view
- **q**: Quit

**Edit Mode:**
- **d**: Mark file for deletion
- **a**: Add new file to package
- **Esc**: Exit edit mode

**Examples:**

```bash
# Interactive tree view (TTY mode)
npx @slats/claude-assets-sync list

# JSON output for scripting
npx @slats/claude-assets-sync list --json
```

**Output (TTY mode):**

```
┌─ Synced Packages ─────────────────────────────┐
│                                               │
│ ▼ @canard/schema-form@1.0.0                   │
│   ├─ commands/                                │
│   │  └─ @canard-schema-form-my-command.md     │
│   └─ skills/                                  │
│      └─ @canard-schema-form-my-skill.md       │
│                                               │
│ ▼ @lerx/promise-modal@0.5.0                   │
│   └─ skills/                                  │
│      └─ @lerx-promise-modal-my-skill.md       │
│                                               │
│ [e] Edit  [r] Refresh  [q] Quit               │
└───────────────────────────────────────────────┘
```

**Output (JSON mode):**

```json
{
  "packages": [
    {
      "name": "@canard/schema-form",
      "version": "1.0.0",
      "syncedAt": "2025-02-05T10:30:00.000Z",
      "assets": 2,
      "types": { "commands": 1, "skills": 1 }
    }
  ]
}
```

### remove

Remove a synced package and its assets.

```bash
npx @slats/claude-assets-sync remove [options] -p <package>
```

**Options:**

| Option | Description |
|--------|-------------|
| `-p, --package <name>` | Package name to remove (required) |
| `-y, --yes` | Skip confirmation prompt |
| `--dry-run` | Preview changes without removing files |

**Examples:**

```bash
# Remove a package with confirmation prompt
npx @slats/claude-assets-sync remove -p @canard/schema-form

# Remove without asking for confirmation
npx @slats/claude-assets-sync remove -p @canard/schema-form --yes

# Preview what would be removed
npx @slats/claude-assets-sync remove -p @canard/schema-form --dry-run
```

### status

Show sync status of all packages with visual UI and update checking.

```bash
npx @slats/claude-assets-sync status [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--no-remote` | Skip checking remote npm registry for updates |

**Features:**

- Visual box UI with color-coded status indicators (TTY mode)
- Shows local vs synced version comparison
- Checks npm registry for latest versions
- Caches remote version checks (5-minute TTL)
- Includes sync timestamp for each package
- Summary statistics at the bottom

**Status Indicators:**

- **✓** (green): Up-to-date
- **⚠** (yellow): Update available
- **✗** (red): Error or missing

**Examples:**

```bash
# Check status with remote version checks (visual UI)
npx @slats/claude-assets-sync status

# Check status without checking npm registry
npx @slats/claude-assets-sync status --no-remote
```

**Output (TTY mode):**

```
┌─ Package Status ──────────────────────────────┐
│                                               │
│ ✓ @canard/schema-form                         │
│   Local:    1.0.0                             │
│   Synced:   1.0.0                             │
│   Status:   Up to date                        │
│   Updated:  2/5/2025, 10:30 AM                │
│   Assets:   2 files                           │
│                                               │
│ ⚠ @lerx/promise-modal                         │
│   Local:    0.6.0                             │
│   Synced:   0.5.0                             │
│   Status:   Outdated                          │
│   Updated:  2/5/2025, 10:30 AM                │
│   Assets:   1 files                           │
│                                               │
├─ Summary ────────────────────────────────────┤
│   Total: 2 packages                           │
│   ✓ Up-to-date: 1  ⚠ Outdated: 1              │
└───────────────────────────────────────────────┘
```

### migrate

Migrate synced packages from legacy nested structure to flat structure.

```bash
npx @slats/claude-assets-sync migrate [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview migration without making changes |

**Features:**

- Converts nested directory structure to flat file naming
- Preserves all package metadata
- Creates backup of original structure
- Can be run multiple times safely
- Includes comprehensive dry-run preview

**Examples:**

```bash
# Preview migration changes
npx @slats/claude-assets-sync migrate --dry-run

# Perform migration
npx @slats/claude-assets-sync migrate
```

## Directory Structures

### Flat Structure (Default, Modern)

The default flat structure uses prefixed filenames in shared directories:

```
your-project/
└── .claude/
    ├── commands/
    │   ├── @canard-schema-form-my-command.md
    │   └── @lerx-promise-modal-another-command.md
    └── skills/
        ├── @canard-schema-form-my-skill.md
        └── @lerx-promise-modal-another-skill.md
```

**Benefits:**
- Cleaner directory structure
- Easier to share commands across packages
- Single .sync-meta.json per asset type
- Better scalability with many packages

### Nested Structure (Legacy)

The legacy nested structure organizes by package:

```
your-project/
└── .claude/
    ├── commands/
    │   └── @canard/
    │       └── schema-form/
    │           ├── my-command.md
    │           └── .sync-meta.json
    └── skills/
        └── @lerx/
            └── promise-modal/
                ├── my-skill.md
                └── .sync-meta.json
```

**Use case:** Legacy projects or when per-package organization is preferred

## Version Management

The tool tracks synced versions to avoid unnecessary re-syncing. A unified `.sync-meta.json` file stores metadata for all packages:

```json
{
  "version": "0.0.1",
  "syncedAt": "2025-02-05T10:30:00.000Z",
  "packages": {
    "@canard-schema-form": {
      "originalName": "@canard/schema-form",
      "version": "1.0.0",
      "files": {
        "commands": [
          { "original": "my-command.md", "transformed": "@canard-schema-form-my-command.md" }
        ],
        "skills": [
          { "original": "my-skill.md", "transformed": "@canard-schema-form-my-skill.md" }
        ]
      }
    }
  }
}
```

**Features:**

- Sync is automatically skipped if package version hasn't changed
- Use `--force` to override version checking and re-sync
- Each sync updates the `syncedAt` timestamp
- Full file mapping for cleanup and migration

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

### Package Structure

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

### Asset Guidelines

- **Commands and skills**: Must be Markdown files (`.md`)
- **File format**: Use standard Claude Code command/skill format
- **Naming**: Use descriptive, lowercase filenames with hyphens (e.g., `my-command.md`)
- **No modification**: Files are synced as-is without transformation
- **Repository requirement**: Must have valid `repository.type` and `repository.url` in package.json

### Configuration

The `claude.assetPath` in your package.json should point to the directory containing your `commands/` and `skills/` subdirectories:

```json
{
  "claude": {
    "assetPath": "docs/claude"  // Path relative to package root
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub personal access token for higher API rate limits | (unauthenticated) |
| `VERBOSE` | Enable debug logging (set to any value) | (disabled) |

## Rate Limits

- **Without token**: 60 requests/hour (GitHub API limit)
- **With token**: 5,000 requests/hour

For most use cases, the unauthenticated limit is sufficient. If syncing many packages, set a GitHub token:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
npx @slats/claude-assets-sync -p @package1 -p @package2 -p @package3
```

## Workflow Examples

### Initial Setup

```bash
# Sync all packages from your project
npx @slats/claude-assets-sync \
  -p @canard/schema-form \
  -p @lerx/promise-modal \
  -p @winglet/react-utils

# Verify they're synced
npx @slats/claude-assets-sync list

# Check for any available updates
npx @slats/claude-assets-sync status
```

### Regular Maintenance

```bash
# Check which packages have updates available
npx @slats/claude-assets-sync status

# Update a specific package to latest version
npx @slats/claude-assets-sync -p @canard/schema-form --force

# Update all packages from a specific branch
npx @slats/claude-assets-sync \
  -p @canard/schema-form \
  -p @lerx/promise-modal \
  --force -r develop
```

### Cleanup

```bash
# Check what you'll remove before doing it
npx @slats/claude-assets-sync remove -p @old-package --dry-run

# Remove a package
npx @slats/claude-assets-sync remove -p @old-package --yes

# List remaining packages
npx @slats/claude-assets-sync list
```

### CI/CD Integration

```bash
#!/bin/bash
# Script to sync all team packages
PACKAGES=(
  "@canard/schema-form"
  "@lerx/promise-modal"
  "@winglet/react-utils"
)

for pkg in "${PACKAGES[@]}"; do
  npx @slats/claude-assets-sync -p "$pkg" --force
done

# Verify sync
npx @slats/claude-assets-sync list
```

## Troubleshooting

### "Package is not synced"

The specified package hasn't been synced yet. List available packages:

```bash
npx @slats/claude-assets-sync list
```

Then sync it:

```bash
npx @slats/claude-assets-sync -p @your-package
```

### "Rate limit exceeded"

You've hit GitHub's API rate limit (60 requests/hour without authentication). Solutions:

1. **Set GitHub token:** `export GITHUB_TOKEN=ghp_xxxxxxxxxxxx`
2. **Wait 1 hour** for rate limit to reset
3. **Use `--local` flag** if packages are in your local workspace

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx npx @slats/claude-assets-sync -p @package
```

### "Repository information not found"

The package's `package.json` is missing required repository configuration:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-repo.git"
  }
}
```

### Files not appearing in `.claude/`

1. **Check sync status:** `npx @slats/claude-assets-sync list`
2. **Verify package has assets:** Check that the package has a `docs/claude/commands` or `docs/claude/skills` directory
3. **Use dry-run to debug:** `npx @slats/claude-assets-sync -p @package --dry-run`

### Migrating from older versions

If you have a legacy nested structure:

```bash
# Preview migration changes
npx @slats/claude-assets-sync migrate --dry-run

# Perform migration
npx @slats/claude-assets-sync migrate
```

## Architecture

### Command Architecture

The tool uses a modular command structure:

- **sync**: Core synchronization logic with GitHub API integration
- **list**: Query unified metadata and display package information
- **remove**: Safe package removal with confirmation prompts
- **status**: Version checking with npm registry integration
- **migrate**: Structure migration with dry-run support

### Data Flow

```
1. Read package.json → Extract claude.assetPath
2. Parse repository URL → GitHub owner/repo
3. Check version → Skip if unchanged (unless --force)
4. Fetch files → GitHub API (commands/ and skills/)
5. Transform paths → Apply naming conventions
6. Write files → .claude/{type}/{prefixed-name}.md (flat)
7. Update metadata → Unified .sync-meta.json
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
