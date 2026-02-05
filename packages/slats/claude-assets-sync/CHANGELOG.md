# Changelog

All notable changes to @slats/claude-assets-sync will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-02-05

### Added

#### Phase 1: Version Management Unification
- Unified version management system across all packages
- Single `.sync-meta.json` file replacing per-package metadata
- Comprehensive package tracking with original names and file mappings
- Timestamp tracking for all sync operations
- Version comparison logic to skip unnecessary syncs

#### Phase 2: Code Consolidation & Architecture
- Modular command architecture with pluggable command system
- New `src/commands/` directory for command implementations
- Command registry system (`COMMANDS` export) with metadata
- Centralized command types in `src/commands/types.ts`
- Unified CLI structure using Commander.js
- Better separation of concerns between CLI and command logic

#### Phase 3: Flat Directory Structure Support
- Modern flat file organization with prefixed filenames
- Name transformation system for scoped packages
- Support for both flat and nested directory structures
- `--no-flat` flag to maintain backward compatibility with legacy structure
- Smart detection of directory structure type during sync operations

#### Phase 4: Package Management Features
- **list command**: List all synced packages with asset details
  - Human-readable output with package names, versions, and asset counts
  - JSON output support for scripting and automation
  - Asset breakdown by type (commands, skills, etc.)
  - Sort by package name for consistency

- **remove command**: Remove synced packages safely
  - Support for both flat and nested structures
  - Confirmation prompts (skip with `-y/--yes`)
  - Dry-run mode for preview
  - Automatic metadata cleanup after removal
  - Graceful error handling for missing files

- **status command**: Monitor sync status and check for updates
  - Real-time remote version checking via npm registry
  - Version mismatch detection with visual indicators
  - Cached remote version checks (5-minute TTL)
  - `--no-remote` flag to skip remote checks
  - Summary statistics of sync status

- **migrate command**: Migrate from legacy to flat structure
  - Automatic conversion of nested directories to flat naming
  - Comprehensive dry-run support
  - Metadata preservation during migration
  - Safe multi-run operation

#### Phase 5: Interactive UI Infrastructure
- Ink + React configuration for interactive CLI components
- TypeScript JSX support (jsx: "react-jsx")
- UI component infrastructure with fallback to plain text
- ink (^4.4.1), ink-spinner (^5.0.0), react (^18.2.0) dependencies
- Type definitions for React components (@types/react)
- ESM compatibility maintained with interactive UI support

#### Phase 6: Testing & Documentation
- Comprehensive README documentation for all commands
- Korean translation (README-ko_kr.md) with all features
- Detailed command usage examples and workflows
- Environment variable documentation
- Troubleshooting guide with common issues and solutions
- Architecture documentation explaining data flow
- CI/CD integration examples
- Rate limit documentation with mitigation strategies

### Enhanced

- **Sync Logic**: Extended to support both flat and nested structures
- **Error Handling**: Improved error messages with context-aware suggestions
- **Logging**: Color-coded output with picocolors for better visibility
- **GitHub Integration**: Support for custom git refs (branches, tags, commits)
- **Local Workspace Support**: Option to read packages from local workspace
- **File System Operations**: Safe handling of both file and directory removal

### Changed

- CLI structure: Main sync is now default command with sub-commands (list, remove, status, migrate)
- Version checking: Now compares against unified metadata instead of per-package files
- Directory organization: Flat structure is now default (use `--no-flat` for legacy)
- Metadata format: Unified schema with package prefixes as keys
- File naming: Scoped packages now use hyphen-separated prefixes (e.g., @scope-package-file.md)

### Fixed

- Version comparison for flat structure packages
- Metadata update timing during removal operations
- Directory creation for deeply nested legacy structures
- File path handling for Windows compatibility

### Technical Details

#### New File Mappings
Each file is now tracked with original and transformed names:
```json
{
  "original": "my-command.md",
  "transformed": "@scope-package-my-command.md"
}
```

#### Updated Metadata Structure
```json
{
  "version": "0.0.1",
  "syncedAt": "2025-02-05T10:30:00.000Z",
  "packages": {
    "@scope-package": {
      "originalName": "@scope/package",
      "version": "1.0.0",
      "files": {
        "commands": [...],
        "skills": [...]
      }
    }
  }
}
```

#### Command Dependencies
- **sync**: Core functionality, no command dependencies
- **list**: Depends on unified metadata reading
- **remove**: Depends on unified metadata, file system operations
- **status**: Depends on npm registry API, version caching
- **migrate**: Depends on legacy structure detection, transformation logic

### Dependencies Added

- **ink** (^4.4.1): React renderer for terminal UIs
- **ink-spinner** (^5.0.0): Loading spinner component for ink
- **react** (^18.2.0): UI component framework
- **@types/react** (^18.2.0): TypeScript types for React

### Dependencies Unchanged

- **commander** (^12.1.0): CLI argument parsing
- **picocolors** (^1.1.1): Terminal color output

### Breaking Changes

None. The tool maintains backward compatibility:
- `--no-flat` flag allows using legacy nested structure
- Existing metadata files are automatically migrated
- All previous commands and options continue to work

### Security

- No security vulnerabilities introduced
- Confirmation prompts for destructive operations
- Dry-run mode for all write operations
- Safe file system operations with error handling

### Performance

- Efficient metadata reading and writing
- Cached remote version checks reduce API calls
- Parallel package processing capability ready (infrastructure in place)
- Minimal memory overhead for large package lists

### Compatibility

- Node.js: Compatible with modern Node versions supporting ES modules
- Operating Systems: Windows, macOS, Linux
- npm Packages: Works with all npm packages providing claude assets

## [Unreleased]

### Planned

- Interactive UI components for progress visualization
- Batch operations with progress indication
- Configuration file support (.claude-sync.json)
- Pre/post sync hooks
- Asset validation and schema checking
- Custom asset type support
- Asset versioning and conflict resolution
- Cloud storage integration (optional)
