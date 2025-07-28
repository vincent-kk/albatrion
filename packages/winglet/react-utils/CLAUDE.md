# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@winglet/react-utils` is a React utility library providing custom hooks, higher-order components (HOCs), and utility functions. This is part of the Albatrion monorepo under the `packages/winglet/react-utils` workspace.

## Development Commands

```bash
# Build the library (creates both ESM and CJS outputs)
yarn build

# Build and publish to npm
yarn build:publish:npm

# Run tests (using Vitest)
yarn test

# Run tests in watch mode
yarn test --watch

# Generate type declarations
yarn build:types

# Version bumping
yarn version:patch    # 0.2.6 → 0.2.7
yarn version:minor    # 0.2.6 → 0.3.0
yarn version:major    # 0.2.6 → 1.0.0

# Publish to npm (requires build first)
yarn publish:npm
```

## Architecture Overview

### Module Organization

The library is organized into modular exports supporting sub-path imports:

- **Main exports** (`@winglet/react-utils`): All utilities combined
- **Hooks** (`@winglet/react-utils/hook`): Custom React hooks
- **HOCs** (`@winglet/react-utils/hoc`): Higher-order components
- **Portal** (`@winglet/react-utils/portal`): Portal component system
- **Filter** (`@winglet/react-utils/filter`): React component type checking
- **Object** (`@winglet/react-utils/object`): React-specific object utilities
- **Render** (`@winglet/react-utils/render`): Component rendering utilities

### Core Categories

1. **Hooks** (`src/hooks/`): State management, lifecycle, and utility hooks
2. **Components** (`src/components/`): Reusable React components (primarily Portal system)
3. **HOCs** (`src/hoc/`): Higher-order components for error boundaries and file uploads
4. **Utils** (`src/utils/`): Utility functions for filtering, object manipulation, and rendering

### Build System

- **Rollup** for bundling with dual output (ESM `.mjs` + CJS `.cjs`)
- **TypeScript** for type safety with declaration generation
- **Vitest** for testing with jsdom environment
- **Workspace dependencies**: Uses `@winglet/common-utils` and `@aileron/*` packages

### Key Design Patterns

1. **Portal System**: Context-based portal management with `Portal.Anchor` and `Portal` components
2. **Type Safety**: Extensive use of TypeScript with utility types and proper generics
3. **HOC Pattern**: Functional HOCs following React best practices
4. **Hook Composition**: Custom hooks that combine multiple React primitives

## Development Guidelines

### Code Style (from .cursor/rules)

- Use **arrow function components** (no class components except ErrorBoundary)
- Define props with `interface {ComponentName}Props` pattern
- Use **absolute imports** with `@/react-utils` alias for internal imports
- Place test files in `__tests__/` subdirectories next to source code
- Use `.test.ts` or `.test.tsx` extensions for test files

### Import Patterns

```typescript
// Internal imports (same package)
import { isFunction } from '@winglet/common-utils/filter';

// Cross-package imports
import type { Fn } from '@aileron/declare';

import { usePortalContext } from './context/usePortalContext';
```

### Testing Strategy

- **Vitest** for unit testing with jsdom environment
- Tests located in `__tests__/` directories
- Coverage targets: Core utilities 80%+, UI components 60-80%+
- Use AAA structure (Arrange → Act → Assert)
- Mock external APIs and browser-specific behavior

### File Structure Conventions

- **Directories**: Plural names, lowercase (`hooks/`, `components/`)
- **Files**: Singular names, PascalCase for components (`Portal.tsx`)
- **Exports**: Each directory exposes public API through `index.ts`
- **Types**: Co-located with implementation, exposed through main exports

## Key Components & Hooks

### Portal System

- `withPortal()`: HOC that wraps components with portal context
- `Portal.Anchor`: Defines where portal content renders
- `Portal`: Renders children at the anchor location
- `PortalContext`: Context-based state management for portals

### Error Boundaries

- `withErrorBoundary()`: HOC for error boundary wrapping
- `ErrorBoundary`: Class component handling React errors
- `FallbackMessage`: Default error UI component

### Notable Hooks

- `useConstant()`: Memoizes expensive computations or factory functions
- `useWindowSize()`: Tracks browser window dimensions
- `useMemorize()`: Enhanced memoization with intuitive API
- `useEffectUntil()` / `useLayoutEffectUntil()`: Conditional effect hooks
- `useTruthyConstant()`: Manages constant values that are truthy.

### Utility Functions

- `isReactComponent()`, `isReactElement()`: Type checking utilities
- `renderComponent()`: Safely renders various component types
- `remainOnlyReactComponent()`: Filters object properties to React components

## Package Configuration

- **Peer Dependencies**: React 16-19, React DOM 16-19
- **Module Types**: Supports both ESM and CJS with proper type declarations
- **Side Effects**: Marked as `false` for tree-shaking optimization
- **Exports Map**: Granular sub-path exports for optimal bundle size

## Testing

Run the test suite with coverage:

```bash
yarn test --coverage
```

Tests use `@testing-library/react` for component testing and focus on behavior rather than implementation details.
