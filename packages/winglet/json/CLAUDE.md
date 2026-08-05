# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
- `yarn test` - Run all tests using Vitest
- `yarn lint` - Lint TypeScript files using ESLint
- `yarn build` - Build the library (both types and bundles)
- `yarn build:types` - Generate TypeScript declaration files only

### Publishing Commands
- `yarn version:patch` / `yarn version:minor` / `yarn version:major` - Update version
- `yarn build:publish:npm` - Build and publish to npm with public access

### Test Execution
- Tests are located in `__tests__/` directories alongside source files
- Use Vitest with `@/json` alias pointing to `./src`
- Test files follow pattern: `*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`

## Agent Docs Injector

`docs/agents/**` 자산을 선택한 에이전트 위치에 주입. 엔진: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` 로 대상 에이전트를 고른다 — claude 는 `.claude/{skills,rules,commands}`, codex 는 `.codex/skills` + `AGENTS.md` 마커 블록.

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/json --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/agents-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**

## Architecture

### Core Structure
This is a TypeScript library implementing RFC 6901 (JSON Pointer) and RFC 6902 (JSON Patch) standards with security features.

**Two Main Modules:**
1. **JSONPointer** (`src/JSONPointer/`) - Core functionality for JSON Pointer operations
2. **JSONPath** (`src/JSONPath/`) - JSONPath constants and utilities

### JSONPointer Architecture

**Core Utilities:**
- `manipulator/` - Value getting/setting operations (`getValue`, `setValue`)
- `escape/` - Pointer escaping/unescaping utilities (`escapePath`, `unescapePath`)  
- `patch/` - JSON Patch operations:
  - `compare/` - Generate patches between objects
  - `applyPatch/` - Apply patch operations to objects
  - `difference/` - JSON Merge Patch generation
  - `mergePatch/` - Apply JSON Merge Patch

**Security Features:**
- Prototype pollution protection (via `protectPrototype` option)
- Input validation for plain objects/arrays only
- RFC-compliant escape sequence handling (`~0` for `~`, `~1` for `/`)

### Key Design Patterns

**Options Pattern:**
Most functions accept options objects with properties like:
- `strict: boolean` - Strict validation mode
- `immutable: boolean` - Preserve original objects (default: true)
- `protectPrototype: boolean` - Prevent prototype pollution (default: true)

**Error Handling:**
Custom `JSONPointerError` class with structured error codes:
- `INVALID_INPUT` - Invalid input types
- `INVALID_POINTER` - Malformed pointer syntax
- `PROPERTY_NOT_FOUND` - Non-existent paths

**Type Safety:**
Extensive TypeScript generics and type constraints using `Dictionary` and `Array<any>` types.

### Export Strategy

**Sub-path Exports:** The package supports granular imports via package.json exports:
- `@winglet/json` - All utilities
- `@winglet/json/pointer` - JSONPointer core
- `@winglet/json/pointer-manipulator` - getValue/setValue only
- `@winglet/json/pointer-patch` - Patch operations only
- `@winglet/json/pointer-escape` - Escape utilities only

### Build System

**Multi-format Output:**
- ESM (`.mjs`) and CommonJS (`.cjs`) via Rolldown
- TypeScript declarations via `tsc` with `tsc-alias`
- Shared build utilities from `../../aileron/script/build/`

**Monorepo Integration:**
- Part of larger `albatrion` monorepo
- Shared ESLint config from root via `createESLintConfig`
- Workspace dependency on `@winglet/common-utils`

### Testing Strategy

**Test Organization:**
- Tests co-located with source in `__tests__/` directories
- Comprehensive coverage of RFC compliance scenarios
- Idempotency tests for bidirectional operations
- Integration tests combining multiple utilities

**Critical Test Areas:**
- Escape/unescape round-trip validation
- Prototype pollution prevention
- Array manipulation with RFC 6901 `-` syntax
- Complex nested object navigation