# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build
```bash
yarn build                 # Build the package with types
yarn build:types          # Build TypeScript declarations only
yarn build:publish:npm    # Build and publish to npm
```

### Testing
```bash
yarn test                 # Run tests with Vitest
```

### Linting
```bash
yarn lint                 # Lint TypeScript files
```

### Publishing
```bash
yarn version:patch        # Bump patch version
yarn version:minor        # Bump minor version  
yarn version:major        # Bump major version
yarn publish:npm          # Publish to npm with public access
```

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/data-loader --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/data-loader --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/data-loader --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/data-loader --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**

## Architecture Overview

This is a TypeScript package that implements a batching and caching utility for asynchronous data fetching, inspired by GraphQL DataLoader. The implementation is a ground-up rewrite focused on performance optimizations and type safety.

### Core Components

**DataLoader Class** (`src/DataLoader.ts`)
- Main export that provides batching and caching functionality
- Handles automatic request batching through a scheduler system
- Implements a cache system using Map-like interfaces
- Provides methods: `load()`, `loadMany()`, `clear()`, `clearAll()`, `prime()`

**Type Definitions** (`src/type.ts`)
- `BatchLoader<Key, Value>`: Function type for batch loading operations
- `DataLoaderOptions<Key, Value, CacheKey>`: Configuration options
- `Batch<Key, Value>`: Internal batching structure
- `MapLike<Key, Value>`: Cache interface definition

**Utility Modules** (`src/utils/`)
- `dispatch.ts`: Handles batch processing and cache hit resolution
- `error.ts`: Custom error types for DataLoader operations
- `prepare.ts`: Utility functions for preparing configuration options

### Key Design Patterns

**Batching System**: Uses a scheduler-based approach (default: `process.nextTick`) to collect multiple individual requests into batches before execution.

**Caching Strategy**: Implements per-key promise caching to prevent duplicate requests. Cache can be customized or disabled entirely.

**Error Handling**: Each key in a batch can resolve to either a value or an Error object, allowing partial batch failures without affecting other keys.

**Type Safety**: Full TypeScript generics support for keys, values, and cache keys with compile-time validation.

## Package Configuration

- **Build System**: Uses Rolldown for bundling with TypeScript compilation
- **Testing**: Vitest for unit testing with coverage reporting  
- **Module Format**: Dual ESM/CJS output with proper package.json exports
- **Target**: ES2022 with Node.js 14+ and modern browser support
- **Dependencies**: Minimal external dependencies, primarily `@winglet/common-utils`

## Testing Strategy

Tests are located in `src/__tests__/` and cover:
- Basic batching functionality
- Cache behavior and invalidation
- Error handling scenarios
- Configuration options
- Edge cases and performance characteristics

Tests use Vitest with Korean comments and comprehensive mocking of batch loader functions.