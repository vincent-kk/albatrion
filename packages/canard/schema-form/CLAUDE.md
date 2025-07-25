# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies
yarn install

# Build the library
yarn build        # Builds both JS bundles and TypeScript declarations
yarn build:types  # Build TypeScript declarations only

# Development
yarn storybook    # Start Storybook dev server on port 6006
yarn start        # Build and then start Storybook

# Testing
yarn test         # Run tests with Vitest
yarn test src/core/nodes/ArrayNode/ArrayNode.test.ts  # Run specific test file
yarn test --coverage  # Run tests with coverage report

# Code Quality
yarn lint         # Run ESLint on TypeScript files
yarn format       # Format code with Prettier
yarn size-limit   # Check bundle size limits (20KB for both CJS and ESM)

# Dependency Analysis
yarn make-dependency-graph  # Generate dependency graph visualization

# Version Management
yarn version:patch   # Bump patch version
yarn version:minor   # Bump minor version
yarn version:major   # Bump major version

# Publishing
yarn build:publish:npm  # Build and publish to npm
yarn publish:npm        # Publish to npm with public access
```

## Architecture Overview

### Core Node System
The library implements a node-based architecture for managing form state:

- **AbstractNode** (`src/core/nodes/AbstractNode/`) - Base class for all nodes
- **Type-specific nodes**: `StringNode`, `NumberNode`, `BooleanNode`, `ArrayNode`, `ObjectNode`, `NullNode`, `VirtualNode`
- **Node Factory** (`src/core/nodeFromJsonSchema.ts`) - Creates appropriate node instances from JSON Schema

### Key Architectural Patterns

1. **Strategy Pattern**: Array and Object nodes use different strategies:
   - `BranchStrategy` - For complex nested structures
   - `TerminalStrategy` - For simple, non-nested structures

2. **Plugin System** (`src/app/plugin/`):
   - Validator plugins for JSON Schema validation
   - UI component plugins for form rendering
   - FormTypeInput plugins for custom input components

3. **Context Providers** (`src/providers/`):
   - `RootNodeContext` - Provides root node access
   - `FormTypeInputsContext` - Manages form input definitions
   - `FormTypeRendererContext` - Manages form rendering components
   - `ExternalFormContext` - External form state management
   - `UserDefinedContext` - User-provided context data

4. **Component Architecture**:
   - `Form` component is the main entry point
   - `Form.Render` for custom layouts using JSONPointer paths
   - `SchemaNode` components handle individual field rendering

### FormTypeInput System

The library uses a powerful FormTypeInput system for component selection:

1. **Priority Order** (highest to lowest):
   - Direct `FormType` property in JSON Schema
   - `formTypeInputMap` path mapping
   - Form-level `formTypeInputDefinitions`
   - FormProvider `formTypeInputDefinitions`
   - Plugin-provided definitions

2. **Test Functions**: Components are selected based on test conditions matching schema properties

### JSONPointer Extensions

Standard JSONPointer (RFC 6901) with custom extensions:
- `..` - Parent navigation (computed properties only)
- `.` - Current node reference
- `*` - Array wildcard (FormTypeInputMap only)

### Event System and Node Communication

- **Event Cascade**: Nodes use an event cascade system for propagating changes through the tree
- **Subscription System**: Components can subscribe to node changes using `useSchemaNodeSubscribe`
- **Node State Management**: Each node maintains its own state flags (dirty, touched, validated)
- **Validation Modes**: Supports OnChange, OnRequest, and None validation modes

## Testing Guidelines

- Unit tests use Vitest and are located in `__tests__` directories
- Test files follow the pattern `*.test.ts` or `*.test.tsx`
- Run specific tests: `yarn test path/to/test`
- Coverage reports are generated in the `coverage/` directory
- Storybook stories in `/coverage` serve as comprehensive integration tests
- Test environment is configured for jsdom with React Testing Library

## Key Dependencies

- **React 18-19**: Core UI framework (peer dependency)
- **@winglet/***: Internal workspace packages for utilities
  - `@winglet/common-utils`: Common utility functions
  - `@winglet/json`: JSON pointer utilities
  - `@winglet/json-schema`: JSON Schema processing
  - `@winglet/react-utils`: React-specific utilities
- **Rollup**: Module bundler for library distribution with esbuild
- **Vitest**: Testing framework with jsdom environment
- **Storybook**: Component development and documentation
- **TypeScript**: Type checking and declarations

## Build Output

The library produces multiple formats:
- CommonJS (`dist/index.cjs`)
- ES Modules (`dist/index.mjs`)
- TypeScript declarations (`dist/index.d.ts`)

Size limits are enforced: 20KB for both CJS and ESM builds.

## Development Tips

1. **Working with Nodes**: When modifying node behavior, check both the node implementation and its strategies (BranchStrategy vs TerminalStrategy)
2. **Adding FormTypeInputs**: Define test conditions carefully to avoid conflicts. Test functions receive `{ jsonSchema, type, format, formType, path }` hint object
3. **Plugin Development**: Follow the `SchemaFormPlugin` interface in `src/app/plugin/type.ts`. Plugins can provide FormTypeInputs, validators, and form renderers
4. **Performance**: Use memoization for expensive computations, especially in computed properties. Consider validation modes to optimize performance
5. **Type Safety**: Leverage TypeScript's type inference with `InferValueType` and `InferSchemaNode` for schema-based type checking
6. **Computed Properties**: Use `computed.watch` with JSONPointer paths to create reactive form logic
7. **Form Submission**: Use `useFormSubmit` hook for managing submission state with loading indicators
8. **Virtual Nodes**: Handle non-schema nodes with `VirtualNode` for conditional fields and computed values
9. **Error Handling**: Implement custom error formatting with `formatError` function or use built-in multilingual support in JSON Schema
10. **Custom Layouts**: Use `Form.Render` with JSONPointer paths for building custom form layouts outside the default structure

## Important Hooks and Utilities

### Core Hooks
- `useSchemaNode`: Primary hook for accessing schema node functionality
- `useSchemaNodeSubscribe`: Subscribe to node state changes
- `useSchemaNodeTracker`: Track node state across renders
- `useFormSubmit`: Handle form submission with loading state
- `useVirtualNodeError`: Manage error states for virtual nodes

### Key Type Utilities
- `InferValueType<Schema>`: Extract TypeScript type from JSON Schema
- `InferSchemaNode<Schema>`: Extract node type from JSON Schema
- `FormHandle<Schema, Value>`: Type-safe form reference handle
- `FormTypeInputProps`: Props interface for custom input components

### Node Type Guards
- `isArrayNode(node)`: Check if node is an ArrayNode
- `isObjectNode(node)`: Check if node is an ObjectNode
- `isVirtualNode(node)`: Check if node is a VirtualNode

## Common Patterns

### Plugin Registration
Always register plugins before rendering forms:
```typescript
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

registerPlugin(ajvValidatorPlugin);
```

### Custom FormTypeInput Components
FormTypeInput components receive standardized props including `node`, `value`, `onChange`, `errors`, and `watchValues` for computed properties.

### Node Navigation
Use JSONPointer paths with `node.find()` for programmatic node access. Extended syntax (`..`, `.`, `*`) available in specific contexts only.

### Error Management
Errors propagate through the node tree. Use `transformErrors` utility for custom error processing and the built-in `errorMessages` JSON Schema property for localized messages.