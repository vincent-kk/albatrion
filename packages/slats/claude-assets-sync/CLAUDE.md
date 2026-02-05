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
├── components/        # ink-based React UI components
│   ├── types.ts           # Shared component types
│   ├── primitives/        # Base UI components
│   │   ├── Box.tsx        # Wrapper around ink Box
│   │   ├── Text.tsx       # Wrapper around ink Text
│   │   └── Spinner.tsx    # Wrapper around ink-spinner
│   ├── status/            # Status command UI
│   │   ├── StatusDisplay.tsx      # Main status UI
│   │   └── PackageStatusCard.tsx  # Individual package card
│   ├── tree/              # Tree UI components
│   │   ├── TreeSelect.tsx         # Interactive tree selection
│   │   ├── AssetTreeNode.tsx      # Single tree item
│   │   └── hooks.ts               # Tree state management hooks
│   ├── add/               # Add command UI
│   │   └── AddCommand.tsx         # Interactive add flow
│   └── list/              # List command UI
│       ├── ListCommand.tsx        # Main list UI
│       ├── SyncedPackageTree.tsx  # Package tree view
│       └── EditableTreeItem.tsx   # Editable tree item
├── commands/          # Command implementations
│   ├── sync.ts        # Main sync command
│   ├── add.ts         # Interactive add command
│   ├── list.ts        # List command with tree UI
│   ├── status.ts      # Status command with visual UI
│   ├── remove.ts      # Remove command
│   └── migrate.ts     # Migration command
├── core/
│   ├── cli.ts         # CLI command definitions using commander
│   ├── github.ts      # GitHub API client
│   ├── filesystem.ts  # File system operations
│   ├── sync.ts        # Main sync logic
│   └── migration.ts   # Migration logic
└── utils/
    ├── types.ts       # TypeScript type definitions
    ├── package.ts     # Package.json parsing utilities
    └── logger.ts      # Logging utility with colors
```

### UI Components (`components/`)

The CLI now uses **ink** (React for CLIs) to provide interactive terminal UI.

#### Primitives (`primitives/`)

Basic building blocks that wrap ink components:

- **Box.tsx**: Layout container with border and padding support
- **Text.tsx**: Text rendering with color and style support
- **Spinner.tsx**: Loading spinner for async operations

#### Status Components (`status/`)

Visual status display for the `status` command:

- **StatusDisplay.tsx**: Main status UI with bordered box layout
  - Renders list of package status cards
  - Shows summary statistics
  - Handles loading and error states
- **PackageStatusCard.tsx**: Individual package status card
  - Color-coded status indicators (✓ ⚠ ✗)
  - Version comparison (local vs synced)
  - Last sync timestamp
  - Asset count

#### Tree Components (`tree/`)

Interactive tree selection for browsing file structures:

- **TreeSelect.tsx**: Main tree selection component
  - Keyboard navigation (↑/↓ arrows)
  - Selection toggle (Space)
  - Expand/collapse (→/← arrows)
  - Batch operations (a=select all, n=deselect all)
  - Submit/cancel (Enter/q)
- **AssetTreeNode.tsx**: Single tree item renderer
  - Displays files and directories
  - Shows selection state (checkboxes)
  - Handles expand/collapse icons
- **hooks.ts**: Tree state management
  - `useTreeSelect`: Manages selection, focus, expansion
  - Keyboard event handling
  - Tree traversal utilities

#### Add Command UI (`add/`)

Interactive add flow with file selection:

- **AddCommand.tsx**: Complete add command flow
  - Discovers available assets from package
  - Renders TreeSelect for file selection
  - Handles asset syncing
  - Shows progress and results

#### List Command UI (`list/`)

Tree view of synced packages with edit mode:

- **ListCommand.tsx**: Main list UI with view/edit modes
  - **View mode**: Browse synced packages
    - Tree structure of all packages and files
    - Keyboard shortcuts (e=edit, r=refresh, q=quit)
  - **Edit mode**: Modify synced assets
    - Mark files for deletion (d key)
    - Add new files (a key)
    - Exit edit mode (Esc)
- **SyncedPackageTree.tsx**: Tree view renderer
  - Displays package hierarchy
  - Shows file types (commands/skills)
  - Expandable/collapsible structure
- **EditableTreeItem.tsx**: Tree item with edit capabilities
  - Selection state in edit mode
  - Delete markers
  - Add file prompts

#### Shared Types (`components/types.ts`)

Common type definitions for UI components:

- **TreeNode**: File/directory tree structure
- **SelectionState**: Track selected items
- **TreeAction**: Keyboard action types
- **PackageStatusInfo**: Status display data

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

#### CLI (`core/cli.ts`)
- Uses Commander.js for argument parsing
- Supports multiple package flags (-p)
- Provides --force and --dry-run options
- Routes to appropriate command implementations

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
1. Add option to `createProgram()` in `core/cli.ts`
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
