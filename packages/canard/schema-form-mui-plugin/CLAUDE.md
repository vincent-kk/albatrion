# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@canard/schema-form-mui-plugin`, a Material-UI (MUI) plugin for the `@canard/schema-form` library. It provides pre-built form input components with modern MUI styling and MUI X integration for building JSON schema-driven forms.

## Common Development Commands

### Building and Development
```bash
# Build the library (both ESM and CJS bundles + type declarations)
yarn build

# Start development with Storybook
yarn start

# Run Storybook only
yarn storybook

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format
```

### Publishing
```bash
# Build and publish to npm in one step
yarn build:publish:npm

# Version bumping
yarn version:patch  # or version:minor, version:major
```

### Storybook
```bash
# Build Storybook for production
yarn build-storybook

# Upgrade Storybook to latest
yarn storybook:upgrade
```

## Architecture Overview

### Plugin Structure
The plugin exports a single `plugin` object that satisfies the `SchemaFormPlugin` interface:
- **FormGroup**: Layout wrapper with depth-based indentation and fieldset styling for branch nodes
- **FormLabel**: Label component for form fields
- **FormInput**: Input wrapper component
- **FormError**: Error display component
- **formTypeInputDefinitions**: Array of form input component definitions

### Form Type Input Components
Located in `/src/formTypeInputs/`, these components handle different schema types and formats:

**Priority Order** (as defined in `formTypeInputDefinitions` array):
1. `FormTypeInputBooleanSwitch` - Boolean as Switch with custom labels
2. `FormTypeInputStringCheckbox` - String arrays as checkbox groups
3. `FormTypeInputStringSwitch` - Toggle between two string values
4. `FormTypeInputUri` - URI input with protocol dropdown
5. `FormTypeInputMonth` - Month picker using MUI X DatePickers
6. `FormTypeInputDate` - Date picker with range validation
7. `FormTypeInputTime` - Time picker in HH:mm:00Z format
8. `FormTypeInputRadioGroup` - Radio button groups for enums
9. `FormTypeInputStringEnum` - Select dropdown for string enums
10. `FormTypeInputArray` - Dynamic array with add/remove functionality
11. `FormTypeInputSlider` - Numeric slider with marks and lazy updates
12. `FormTypeInputTextarea` - Multi-line text with auto-resize
13. `FormTypeInputString` - Default text input (with password support)
14. `FormTypeInputNumber` - Numeric input with validation
15. `FormTypeInputBoolean` - Checkbox with indeterminate state

### Component Selection Logic
Components are selected based on JSON schema properties using a `test` function that evaluates:
- `type` (string, number, boolean, array, etc.)
- `format` (date, time, month, uri, password, textarea)
- `formType` (switch, radio, checkbox, slider, etc.)
- `enum` presence for select/radio components

### Context System
The `MuiContext` type provides consistent styling across components:
- `size`: 'small' | 'medium'
- `variant`: 'outlined' | 'filled' | 'standard'
- `fullWidth`: boolean

## Key Dependencies

### Runtime Dependencies
- `@mui/material` ^7.0.0 - Core Material-UI components
- `@mui/x-date-pickers` ^8.0.0 - Date/time picker components
- `@mui/icons-material` ^7.0.0 - Material-UI icons
- `@emotion/react` and `@emotion/styled` - MUI styling engine
- `dayjs` ^1.0.0 - Date manipulation library

### Development Dependencies
- `@canard/schema-form` - Core schema form library (workspace dependency)
- Rollup for bundling (ESM + CJS)
- TypeScript with strict configuration
- Vitest for testing
- Storybook for component documentation
- ESLint with monorepo shared configuration

## Build System

### Bundling
- Uses custom Rollup configuration from monorepo (`../../aileron/script/build/rollup.bundle.mjs`)
- Generates both ESM (`dist/index.mjs`) and CJS (`dist/index.cjs`) bundles
- Peer dependencies are externalized
- No minification for better debugging

### Type Generation
- TypeScript declarations generated separately via `tsc -p ./tsconfig.declarations.json`
- Uses `tsc-alias` for path mapping resolution

### Target Environment
- ECMAScript 2022 (ES2022) syntax
- Node.js 14.17.0+ required
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)

## Testing and Documentation

### Testing Setup
- Vitest with jsdom environment
- Coverage reporting (text, json, html)
- Global test utilities available
- No existing test files (tests should be added in `**/*.{test,spec}.{js,ts,tsx}` format)

### Storybook Configuration
- Stories located in `/src/**/*.stories.*` and `/coverage/**/*.stories.*`
- React Vite framework
- TypeScript docgen integration
- Chromatic and docs addons enabled

## Monorepo Context

This package is part of the Albatrion monorepo under `/packages/canard/schema-form-mui-plugin`. It uses:
- Workspace dependencies for internal packages
- Shared ESLint configuration from monorepo root
- Shared build scripts from `../../aileron/script/build/`

## Component Development Guidelines

When adding new FormTypeInput components:
1. Create component in `/src/formTypeInputs/`
2. Export both the component and its definition (with `test` function)
3. Add to the `formTypeInputDefinitions` array in correct priority order
4. Follow the `FormTypeInputPropsWithSchema` interface pattern
5. Support `MuiContext` for consistent styling
6. Handle `readOnly`, `disabled`, and validation states
7. Use `useHandle` from `@winglet/react-utils/hook` for event handlers