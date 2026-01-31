# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Common Development Commands

```bash
# Build the library
yarn build        # Builds both JS bundles (ESM/CJS) and TypeScript declarations
yarn build:types  # Build TypeScript declarations only

# Testing
yarn test         # Run all tests with Vitest
yarn test src/__tests__/package.test.ts  # Run specific test file

# Code Quality
yarn lint         # Run ESLint on TypeScript files
yarn format       # Format code with Prettier

# Version Management
yarn version:patch   # Bump patch version
yarn version:minor   # Bump minor version
yarn version:major   # Bump major version

# Publishing
yarn build:publish:npm  # Build and publish to npm
yarn publish:npm        # Publish to npm with public access
```

## Architecture Overview

### Module Structure

```
src/
├── index.ts           # Main entry point (CLI + exports)
├── cli/
│   └── index.ts       # CLI command definitions using commander
├── core/
│   ├── github.ts      # GitHub API client
│   ├── filesystem.ts  # File system operations
│   └── sync.ts        # Main sync logic
└── utils/
    ├── types.ts       # TypeScript type definitions
    ├── package.ts     # Package.json parsing utilities
    └── logger.ts      # Logging utility with colors
```

### Key Components

#### GitHub API Client (`core/github.ts`)
- Fetches directory contents using GitHub Contents API
- Downloads files from raw.githubusercontent.com
- Handles rate limiting and authentication via GITHUB_TOKEN

#### Filesystem Manager (`core/filesystem.ts`)
- Manages destination directory structure
- Creates/updates .sync-meta.json files
- Handles scoped package name parsing (@scope/name)

#### Sync Logic (`core/sync.ts`)
- Orchestrates the entire sync process
- Compares versions to skip unnecessary syncs
- Supports dry-run mode for previewing changes

#### CLI (`cli/index.ts`)
- Uses Commander.js for argument parsing
- Supports multiple package flags (-p)
- Provides --force and --dry-run options

### Sync Flow

```
1. Read package.json from node_modules
2. Extract claude.assetPath configuration
3. Parse repository URL to get GitHub owner/repo
4. Check version against existing .sync-meta.json
5. Fetch file list from GitHub API (commands/ and skills/)
6. Download each file from raw.githubusercontent.com
7. Write files to .claude/{type}/{scope}/{name}/
8. Update .sync-meta.json with version and file list
```

### Type Definitions

Key types in `utils/types.ts`:
- `ClaudeConfig` - Claude field in package.json
- `PackageInfo` - Parsed package.json data
- `GitHubRepoInfo` - Parsed GitHub repository details
- `GitHubEntry` - GitHub API file/directory entry
- `SyncMeta` - Metadata stored in .sync-meta.json
- `SyncResult` - Result of a sync operation
- `CliOptions` - CLI argument options

## Testing Guidelines

- Unit tests use Vitest and are located in `__tests__/` directory
- Test files follow the pattern `*.test.ts`
- Tests focus on utility functions and parsing logic
- GitHub API calls should be mocked in tests

## Development Patterns

### Error Handling
- Custom error classes for specific scenarios (RateLimitError, NotFoundError)
- Graceful handling of missing packages or configurations
- Informative error messages with suggested actions

### Logging
- Uses picocolors for terminal colors
- Structured output with step indicators
- Summary at the end with success/skip/fail counts

### Version Management
- Synced version tracked in .sync-meta.json
- Skip sync if versions match (unless --force)
- Force option bypasses version check

## Key Dependencies

- **commander**: CLI argument parsing
- **picocolors**: Terminal color output

No other runtime dependencies - uses Node.js built-in modules for file system and fetch.

## Build Output

The library produces multiple formats:
- CommonJS (`dist/index.cjs`)
- ES Modules (`dist/index.mjs`) - with CLI shebang
- TypeScript declarations (`dist/index.d.ts`)

## Common Patterns

### Adding New CLI Options
1. Add option to `createProgram()` in `cli/index.ts`
2. Add type to `CliOptions` in `utils/types.ts`
3. Use option in `syncPackage()` or `syncPackages()`

### Extending GitHub Support
1. Update `fetchDirectoryContents()` for new API endpoints
2. Add new entry types to `GitHubEntry` if needed
3. Update error handling for new API responses

### Adding New Asset Types
1. Add type to `AssetType` in `utils/types.ts`
2. Update `fetchAssetFiles()` to fetch new type
3. Update `syncPackage()` to process new type
