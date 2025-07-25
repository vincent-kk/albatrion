# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies
yarn install

# Build the library
yarn build               # Builds both JS bundles and TypeScript declarations
yarn build:types         # Build TypeScript declarations only

# Testing
yarn test               # Run tests with Vitest
yarn test path/to/test  # Run specific test file

# Code Quality
yarn lint               # Run ESLint on TypeScript files

# Version Management
yarn version:patch      # Bump patch version
yarn version:minor      # Bump minor version  
yarn version:major      # Bump major version

# Publishing
yarn build:publish:npm  # Build and publish to npm
yarn publish:npm        # Publish to npm with public access
```

## Architecture Overview

### Core Modules

The `@winglet/style-utils` package provides three main categories of utilities:

1. **Style Management System** (`src/styleManager/`):
   - **StyleManager** - Core scoped CSS management class with singleton pattern
   - **styleManagerFactory** - Factory function that creates scoped style injection functions
   - **destroyScope** - Utility for complete scope cleanup

2. **CSS Utilities** (`src/utils/compressCss/`):
   - **compressCss** - High-performance CSS compression with single-pass optimization

3. **ClassName Utilities** (`src/utils/cx/`):
   - **cx** - Full-featured className concatenation with arrays and objects support
   - **cxLite** - Lightweight version for simple truthy/falsy filtering

### StyleManager Architecture

The StyleManager implements a sophisticated scoped CSS injection system:

**Key Design Patterns:**
- **Singleton Pattern**: One StyleManager instance per scope ID and target (document/shadow root)
- **Batched Updates**: Uses `requestAnimationFrame` for optimal DOM update performance
- **Dual API Support**: Supports both modern `adoptedStyleSheets` and fallback `<style>` elements
- **Automatic Scoping**: CSS selectors are automatically prefixed with scope classes (`.scopeId .selector`)
- **Shadow DOM Support**: Special handling for Shadow DOM environments without scoping

**Performance Optimizations:**
- CSS compression using single-pass parsing
- Efficient array operations instead of spread operators
- Pre-calculated scope prefixes
- Dirty flag system to avoid unnecessary DOM updates
- Optimized CSS selector parsing without complex regex

### Package Structure

The package uses multiple entry points for tree-shaking optimization:

- **Main export** (`./`): All utilities
- **Style manager** (`./style-manager`): Only scoped CSS management 
- **Utils** (`./util`): Only className and CSS compression utilities

## Build System

### Multi-format Output
- **ES Modules** (`.mjs`) - Modern bundlers and browsers
- **CommonJS** (`.cjs`) - Node.js and legacy environments
- **TypeScript Declarations** (`.d.ts`) - Type information

### Build Process
1. **Rollup** transpiles TypeScript to JavaScript bundles
2. **TypeScript Compiler** generates declaration files with path mapping
3. **tsc-alias** resolves TypeScript path aliases in declarations
4. Shared build configuration from `aileron/script/build/rollup.transpile.mjs`

### Path Aliases
- `@/style-utils/*` - Maps to `src/*` for internal imports
- `@aileron/*` - Maps to shared common utilities

## Testing Strategy

### Test Environment
- **Vitest** with jsdom for DOM manipulation testing
- **@testing-library/react** for React component testing (dev dependency for utilities)
- **@testing-library/jest-dom** for DOM assertion matchers

### Test Categories
1. **Unit Tests**: Individual utility function testing
2. **Integration Tests**: StyleManager DOM manipulation and scoping behavior
3. **Performance Tests**: CSS compression and className generation benchmarks

### Test File Organization
- Tests located in `__tests__` directories alongside source files
- Pattern: `*.test.ts` or `*.test.tsx`
- Coverage reports generated in coverage directory

## Key Implementation Details

### CSS Scoping Algorithm
The StyleManager uses an optimized CSS parser that:
1. Splits CSS into rules using `}` delimiter
2. Extracts selectors before `{` character
3. Applies scoping rules:
   - Skip `@` rules (media queries, keyframes)
   - Skip `:root` and `:host` selectors
   - Prefix all other selectors with `.scopeId `
4. Preserves original declarations

### Memory Management
- StyleManager instances stored in static `Map<string, StyleManager>`
- Shadow DOM instances use Symbol-based unique keys for isolation
- Complete cleanup in `destroy()` method:
  - Cancels pending animation frames
  - Removes DOM elements
  - Clears internal caches
  - Removes from global registry

### Browser Compatibility
- **Modern browsers**: Uses `adoptedStyleSheets` API for efficient style injection
- **Legacy browsers**: Falls back to `<style>` element injection
- **Shadow DOM**: Special handling for both modes
- **Target**: ES2020 syntax (requires transpilation for older environments)

## Development Guidelines

### Adding New Utilities
1. Create utility in appropriate `src/utils/` subdirectory
2. Include comprehensive unit tests in `__tests__/` directory
3. Export from parent `index.ts` files
4. Update package.json exports if creating new sub-path entry
5. Document with JSDoc comments including examples

### StyleManager Modifications
- Maintain singleton pattern consistency
- Preserve batched update system using `requestAnimationFrame`
- Test both regular DOM and Shadow DOM environments
- Ensure proper cleanup in `destroy()` method
- Validate scoping behavior with integration tests

### Performance Considerations
- CSS compression should use single-pass algorithms
- Avoid regex for simple string operations
- Use efficient array operations instead of spread operators
- Pre-calculate values when possible (like scope prefixes)
- Test performance with large CSS inputs

## Common Patterns

### Scoped Style Management
```typescript
// Create scoped style manager
const addStyle = styleManagerFactory('my-component');

// Add styles and get cleanup function
const removeStyles = addStyle('style-id', css);

// Complete scope cleanup
destroyScope('my-component');
```

### Shadow DOM Usage
```typescript
const addStyle = styleManagerFactory('shadow-scope', { 
  shadowRoot: element.shadowRoot 
});
```

### ClassName Generation
```typescript
// Full-featured with objects and arrays
const classes = cx('base', { active: isActive }, ['conditional', 'classes']);

// Lightweight for simple cases
const classes = cxLite('base', isActive && 'active', size);
```

## Dependencies

### Runtime Dependencies
- **None** - Zero-dependency package for minimal bundle impact

### Development Dependencies
- **TypeScript**: Type checking and declaration generation
- **Rollup**: Module bundling with tree-shaking
- **Vitest**: Testing framework with jsdom
- **ESLint**: Code linting with shared configuration
- **Testing Libraries**: React Testing Library ecosystem for comprehensive testing

### Peer Dependencies
- **None** - Framework-agnostic design

## Troubleshooting

### StyleManager Issues
- Verify scope ID uniqueness across components
- Check Shadow DOM configuration for custom elements
- Ensure `destroyScope()` is called in cleanup (React useEffect, custom element disconnectedCallback)
- Test both modern and legacy browser paths

### Build Issues  
- TypeScript path aliases must match between tsconfig.json and build configuration
- Rollup external dependencies configuration in parent build script
- Check that all exports in package.json have corresponding source files

### Testing Issues
- Vitest requires jsdom environment for DOM manipulation tests
- StyleManager tests need proper cleanup between test cases
- CSS compression tests should include edge cases (comments, special selectors)