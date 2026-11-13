# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building

```bash
# Build the library (rolldown + types)
yarn build

# Build types only
yarn build:types

# Build and publish to npm
yarn build:publish:npm
```

### Testing

```bash
# Run all tests with vitest
yarn test

# Run tests in watch mode
yarn test --watch

# Run specific test file
yarn test src/utils/JSONSchemaScanner/__tests__/JSONSchemaScanner.test.ts
```

### Publishing & Versioning

```bash
# Version bumps
yarn version:patch
yarn version:minor
yarn version:major

# Publish to npm
yarn publish:npm
```

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json-schema --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json-schema --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json-schema --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json-schema --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**

## Architecture Overview

This is a TypeScript library for JSON Schema manipulation with these core architectural patterns:

### Main Entry Points & Sub-path Exports

The package supports granular imports through multiple entry points:

- Main exports (`@winglet/json-schema`): All utilities and types
- Sync scanner (`@winglet/json-schema/scanner`): JSONSchemaScanner
- Async scanner (`@winglet/json-schema/async-scanner`): JSONSchemaScannerAsync
- Filters (`@winglet/json-schema/filter`): Schema type checking utilities

### Core Components

#### JSONSchemaScanner System

The heart of the library is the schema traversal system located in `src/utils/JSONSchemaScanner/`:

- **JSONSchemaScanner** (`sync/JSONSchemaScanner.ts`): Depth-first traversal with visitor pattern, $ref resolution, and circular reference detection
- **JSONSchemaScannerAsync** (`async/JSONSchemaScannerAsync.ts`): Standalone async variant (no inheritance) driving the same shared generator core as JSONSchemaScanner, awaiting async visitors and reference resolution
- **Visitor Pattern**: Uses `enter`/`exit` callbacks for schema node processing
- **Reference Resolution**: Handles `$ref` with configurable resolution functions
- **Stack-based Architecture**: Prevents infinite loops with stack-based circular reference detection

#### Type System

- **Schema Types** (`src/types/jsonSchema.ts`): Complete JSON Schema type definitions (ObjectSchema, ArraySchema, etc.)
- **Value Types** (`src/types/value.ts`): Type inference utilities (`InferValueType`)
- **Type Guards** (`src/filters/`): Runtime type checking functions (`isObjectSchema`, `isArraySchema`, etc.)

#### Key Options & Configuration

- `maxDepth`: Controls traversal depth
- `filter`: Node filtering during traversal
- `mutate`: Schema transformation during traversal
- `resolveReference`: Custom $ref resolution logic
- `cloneResolvedSchema` (default `true`): Deep-clones each resolved `$ref` at inline time for reference isolation; a default behavior change from the previous alias-sharing, so set `false` to restore the old behavior or avoid clone overhead
- `cacheResolvedReference` (default `false`): Memoizes `resolveReference` results per reference string, useful for expensive or remote resolvers
- `keywords` replaces the built-in union vocabulary; `additionalKeywords` appends custom descriptors, with the last duplicate winning
- `defaultDialect` sets the fallback dialect; resource-root `$schema` declarations determine which visited positions are inert
- Boolean schema leaves receive callbacks; array values are never schema nodes
- `context`: Shared context across visitor callbacks

### Build System

- **Rolldown**: Configured to build both ESM (.mjs) and CJS (.cjs) formats
- **TypeScript**: Separate type declaration builds with path aliasing
- **Vitest**: Test runner with coverage reporting
- **Multi-format Support**: Supports both CommonJS and ES modules

### Dependencies

- `@winglet/common-utils`: Internal utility functions
- `@winglet/json`: JSON pointer and path utilities
- Part of larger Albatrion monorepo ecosystem

### Testing Strategy

Tests are organized in `__tests__/` directories with comprehensive coverage of:

- Basic scanner functionality
- Advanced use cases (mutation, async operations)
- Reference resolution
- Error handling and edge cases

The library uses ES2022 syntax and targets Node.js 16.11.0+ and modern browsers.
