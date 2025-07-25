# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@lerx/promise-modal` is a React-based universal modal utility that provides promise-based modal interactions (alert, confirm, prompt) that can be used both inside and outside React components. The library is built with TypeScript and targets ES2022.

## Development Commands

### Building
- `yarn build` - Build the library using Rollup and generate type declarations
- `yarn build:types` - Generate TypeScript declarations using tsc and tsc-alias
- `yarn build:publish:npm` - Build and publish to NPM

### Testing
- `yarn test` - Run tests using Vitest (requires build:chain first)
- Tests are located in `src/core/__tests__/` 
- Test configuration is in `vite.config.ts` with jsdom environment

### Linting and Formatting
- `yarn lint` - Lint TypeScript/TSX files using ESLint
- `yarn format` - Format code using Prettier

### Development
- `yarn storybook` - Run Storybook development server on port 6006
- `yarn start` - Build and run Storybook
- Story files are in the `coverage/` directory

### Bundle Analysis
- `yarn size-limit` - Check bundle size limits
- `yarn make-dependency-graph` - Generate dependency visualization

## Architecture

### Core Structure

The library follows a layered architecture:

1. **Core Layer** (`src/core/`)
   - `handle/` - Contains the main API functions (alert, confirm, prompt)
   - `node/` - Modal node implementations with AbstractNode base class
   - Provides the primary public API

2. **Application Layer** (`src/app/`)
   - `ModalManager` - Singleton class managing modal lifecycle, styling, and DOM anchoring
   - Handles prerendering, style injection, and modal state

3. **Bootstrap Layer** (`src/bootstrap/`)
   - `BootstrapProvider` - Main provider component (exported as `ModalProvider`)
   - Handles initialization and component setup

4. **Provider Layer** (`src/providers/`)
   - Context providers for configuration, modal management, and user-defined data
   - Separate contexts for different concerns

5. **Component Layer** (`src/components/`)
   - Reusable UI components (Anchor, Background, Foreground, etc.)
   - Fallback components for default implementations

### Key Design Patterns

- **Promise-based API**: Modal functions return promises that resolve with user interactions
- **Provider Pattern**: Multiple context providers for different aspects of configuration
- **Factory Pattern**: Node factory for creating different modal types
- **Observer Pattern**: Modal nodes use subscription system for state updates
- **Singleton Pattern**: ModalManager manages global state

### Modal Node System

Modal nodes extend `AbstractNode` which provides:
- Subscription-based state management
- Promise resolution handling  
- Lifecycle management

Three concrete implementations:
- `AlertNode` - Simple notification modals
- `ConfirmNode` - Yes/no confirmation modals  
- `PromptNode` - Input collection modals

### Styling System

Uses `@winglet/style-utils` for dynamic CSS injection:
- Scoped CSS with polynomial hashing
- Runtime style sheet management
- CSS compression for production

## Build System

- **Rollup** for bundling with ESM/CJS dual output
- **TypeScript** compilation with path alias resolution
- **Peer dependencies** for React externalization
- **Bundle analysis** with rollup-plugin-visualizer

## Import Paths

The project uses path aliases:
- `@/promise-modal` maps to `./src`
- Configured in `vite.config.ts` and TypeScript config

## Dependencies

### Runtime Dependencies
- `@winglet/common-utils` - Utility functions (hashing, random strings)
- `@winglet/react-utils` - React hooks and utilities  
- `@winglet/style-utils` - Dynamic CSS management

### Peer Dependencies
- React 18-19
- React DOM 18-19

## Testing Strategy

- Unit tests for core node logic using Vitest
- Storybook for component testing and documentation
- Tests focus on subscription system and modal lifecycle

## Key Files

- `src/index.ts` - Main export file with public API
- `src/app/ModalManager.ts` - Central state and DOM management
- `src/core/handle/` - Promise-based modal functions
- `src/bootstrap/BootstrapProvider/` - Provider component implementation
- `rollup.config.mjs` - Build configuration
- `vite.config.ts` - Test and development configuration