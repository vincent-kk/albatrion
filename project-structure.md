# Project Structure - Albatrion

## Package Manager
- **Type**: yarn (detected from yarn.lock)
- **Version**: 4.9.2 (from package.json packageManager)

## Available Scripts

### Development
- `developmentHelper`: yarn workspace @aileron/development-helper

### Testing
- `testbed:production`: yarn workspace @aileron/production-testbed
- `import-test`: ./scripts/test-package-import.sh
- `import-test:winglet`: ./scripts/test-winglet-import.sh

### Build & Deploy
- `build:all`: yarn run:all build

### Quality Assurance
- `styleUtils`: yarn workspace @winglet/style-utils
- `sort:packages`: npx sort-package-json '**/package.json'

### Package Management
- `run:all`: yarn workspaces foreach --all --topological-dev run
- `changeset`: changeset
- `changeset:publish`: yarn run:all && changeset publish
- `changeset:version`: changeset version

## Directory Structure
```
albatrion/
├── packages/          # Monorepo packages
├── documents/         # Documentation workspace
├── scripts/           # Build and utility scripts
├── .cursor/           # Cursor IDE rules
└── .tasks/            # Development task documentation
```

## Git Configuration
- **Main Branch**: master
- **Branch Naming**: feature/{description} (inferred pattern)
- **Commit Convention**: [Type](scope): description (from CLAUDE.md)

## Technology Stack
### Core Dependencies (detected from package.json)
- **Build Tools**: Rollup, Vite, TypeScript
- **Testing**: Vitest, Jest DOM, Testing Library
- **Quality**: ESLint, Prettier, Size Limit
- **Documentation**: Storybook
- **Package Management**: Changesets

### Workspaces Structure
- **@canard/schema-form**: Form generation libraries
- **@winglet/***: Utility libraries
- **@lerx/promise-modal**: Modal management
- **@aileron/***: Development and benchmark tools

## Development Workflow

### Monorepo Development
1. Use yarn workspace commands for package-specific operations
2. Use `yarn run:all <command>` for cross-workspace operations
3. Shortcut commands available in root package.json (e.g., `yarn schemaForm`)

### Version Management
1. Use changesets for version management
2. Create changesets with `yarn changeset`
3. Publish with `yarn changeset:publish`

### Quality Assurance
1. Lint: Use workspace-specific lint commands
2. Test: Use workspace-specific test commands
3. Build: Use workspace-specific build commands
4. Format: Use `yarn sort:packages` for package.json formatting

### Common Commands
```bash
# Start working on a specific package
yarn workspace @canard/schema-form <command>

# Run command across all packages
yarn run:all <command>

# Use shortcut commands
yarn schemaForm <command>
yarn reactUtils <command>
yarn promiseModal <command>
```

## Error Handling Procedures

### Build Errors
1. Check workspace dependencies with `yarn why <package>`
2. Verify TypeScript configuration in affected workspace
3. Regenerate types if needed
4. Check import/export consistency across workspaces

### Test Failures
1. Run tests in specific workspace: `yarn workspace <name> test`
2. Check test isolation and mock consistency
3. Verify cross-package dependencies

### Dependency Issues
1. Use `yarn install` to refresh lockfile
2. Check workspace dependency versions
3. Use `yarn why` to trace dependency conflicts

---

> Auto-generated from requirement-driven-development.mdc rule
> Last Updated: 2024-09-29
> Codebase: Yarn monorepo with TypeScript and React components