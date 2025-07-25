# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building
```bash
# Build the library (rollup + types)
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
yarn test src/utils/JsonSchemaScanner/__tests__/JsonSchemaScanner.test.ts
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

## Architecture Overview

This is a TypeScript library for JSON Schema manipulation with these core architectural patterns:

### Main Entry Points & Sub-path Exports
The package supports granular imports through multiple entry points:
- Main exports (`@winglet/json-schema`): All utilities and types
- Sync scanner (`@winglet/json-schema/scanner`): JsonSchemaScanner
- Async scanner (`@winglet/json-schema/async-scanner`): JsonSchemaScannerAsync  
- Filters (`@winglet/json-schema/filter`): Schema type checking utilities

### Core Components

#### JsonSchemaScanner System
The heart of the library is the schema traversal system located in `src/utils/JsonSchemaScanner/`:

- **JsonSchemaScanner** (`sync/JsonSchemaScanner.ts`): Depth-first traversal with visitor pattern, $ref resolution, and circular reference detection
- **JsonSchemaScannerAsync** (`async/JsonSchemaScannerAsync.ts`): Extends JsonSchemaScanner for async operations
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
- `context`: Shared context across visitor callbacks

### Build System
- **Rollup**: Configured to build both ESM (.mjs) and CJS (.cjs) formats
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