# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@canard/schema-form-antd-plugin` is a plugin for the `@canard/schema-form` library that provides Ant Design UI components for form rendering. This package is part of a larger monorepo (`albatrion`) and specifically extends the schema-form system with pre-built Ant Design components.

## Development Commands

### Build and Development

- `yarn build` - Build the library (Rollup + TypeScript declarations)
- `yarn build:types` - Generate TypeScript declaration files only
- `yarn build:publish:npm` - Build and publish to NPM
- `yarn start` - Build and start Storybook

### Testing and Quality

- `yarn test` - Run tests with Vitest
- `yarn lint` - ESLint with TypeScript support
- `yarn format` - Format code with Prettier

### Storybook

- `yarn storybook` - Start Storybook development server on port 6006
- `yarn build-storybook` - Build Storybook for production

### Versioning

- `yarn version:patch/minor/major` - Version bumping with semantic versioning

## Architecture Overview

### Plugin System Architecture

The plugin exports a `SchemaFormPlugin` object containing:

- **FormGroup**: Main container component for form fields
- **FormLabel**: Label rendering component
- **FormInput**: Input wrapper component
- **FormError**: Error display component
- **formTypeInputDefinitions**: Array of form input type definitions

### FormTypeInput Component Pattern

Each FormTypeInput component follows a consistent pattern:

1. **Component**: React component implementing the input
2. **Definition**: Object with `Component` and `test` properties
3. **Test conditions**: JSON Schema matching criteria to determine when to use the component

### Component Priority System

Components are selected in this order:

1. In-line component (FormTypeInput property in schema)
2. FormTypeInputMap (explicitly mapped components)
3. FormTypeInputDefinition (automatic selection via test conditions)
4. Provider FormTypeInputDefinition
5. Plugin components (this plugin)
6. Fallback components

The plugin's components are prioritized in the order they appear in the `formTypeInputDefinitions` array.

### Core Components Structure

**Base Components** (`src/components/`):

- `FormGroup.tsx` - Container with label, input, and error display
- `FormLabel.tsx` - Label rendering with required field indicators
- `FormInput.tsx` - Input wrapper component
- `FormError.tsx` - Error message display

**FormTypeInputs** (`src/formTypeInputs/`):
Contains 18 specialized input components covering:

- String inputs (text, password, textarea, URI)
- Number inputs (input, slider)
- Boolean inputs (checkbox, switch)
- Date/time inputs (date, time, month, ranges)
- Array inputs (dynamic lists)
- Selection inputs (radio, checkbox groups, dropdowns)

### Monorepo Context

This package depends on other packages in the monorepo:

- `@canard/schema-form` - Core form system (peer dependency)
- `@winglet/common-utils` - Common utilities
- `@winglet/react-utils` - React-specific utilities

## Key Implementation Details

### Schema-to-Component Mapping

Components are selected based on JSON Schema properties:

- `type` - Base type (string, number, boolean, array, object)
- `format` - Specific format (date, time, password, uri, etc.)
- `formType` - Custom form type hint
- `enum` - Available options for selection components

### State Management

Uses the parent `@canard/schema-form` system's state management:

- Node-based architecture for form state
- Subscription-based updates
- JSON Pointer path-based field identification

### TypeScript Integration

- Full TypeScript support with strict typing
- Declaration files generated automatically
- Extends base schema types with component-specific properties

## Development Guidelines

### Adding New FormTypeInput Components

1. Create component file in `src/formTypeInputs/`
2. Export both Component and Definition
3. Add to `formTypeInputDefinitions` array in proper priority order
4. Follow existing patterns for props and schema typing

### Testing Approach

Uses Vitest with jsdom environment for component testing. Coverage stories are available in the `coverage/` directory for visual testing via Storybook.

### Build System

- **Rollup** for bundling (ESM + CJS outputs)
- **TypeScript** for declaration file generation
- **Peer dependencies** externalized (React, Ant Design, dayjs)
- Targets ES2020+ environments

### Integration with Parent Schema System

Components receive standardized props from the parent system including:

- `path` - JSON Pointer path for the field
- `jsonSchema` - The relevant JSON Schema
- `onChange` - Change handler
- `readOnly/disabled` - Control states
- `context` - Additional context (size, etc.)
