# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AJV 7.x validator plugin for `@canard/schema-form` that provides JSON Schema validation with Draft-07 and Draft 2019-09 support. The plugin acts as a bridge between the schema-form library and AJV 7.x validation engine.

## Key Architecture

### Core Components

- **ValidatorPlugin Interface**: Main plugin entry point that implements `bind()` and `compile()` methods
- **AJV Instance Management**: Singleton pattern for managing AJV instances with lazy initialization
- **Error Transformation Layer**: Converts AJV errors to schema-form compatible format
- **Async Validation**: All validators are compiled with `$async: true` for consistent API

### Plugin Structure

```
src/
├── index.ts                    # Main export (plugin object)
├── validator/
│   ├── validatorPlugin.ts      # Core plugin implementation
│   ├── createValidatorFactory.ts # Validator factory function
│   └── utils/
│       └── transformErrors.ts  # AJV error transformation
```

### Error Handling Architecture

The plugin transforms AJV 7.x errors (which use JSONPointer format by default) to schema-form format:
- Handles `required` field errors by appending missing property names
- Preserves JSONPointer format for dataPath consistency
- Maintains error source references for debugging

## Development Commands

### Building
```bash
yarn build              # Build both ESM and CJS bundles + type declarations
yarn build:types        # Generate TypeScript declarations only
```

### Testing
```bash
yarn test              # Run all tests with Vitest
yarn test --watch      # Run tests in watch mode
```

### Code Quality
```bash
yarn lint              # ESLint check
yarn format            # Format code with Prettier
```

### Storybook (Development)
```bash
yarn storybook         # Run Storybook dev server on port 6006
yarn build-storybook   # Build static Storybook
```

### Publishing
```bash
yarn version:patch     # Bump patch version
yarn version:minor     # Bump minor version
yarn version:major     # Bump major version
yarn build:publish:npm # Build and publish to npm
```

## Testing Strategy

### Unit Tests
- Located in `src/validator/__tests__/`
- Focus on validator factory creation and error transformation
- Test complex nested object and array validation scenarios
- Verify AJV instance binding and default configuration

### Integration Tests (Storybook)
- Located in `coverage/` directory
- 19 comprehensive story files covering different use cases
- Test real-world form scenarios with the plugin
- Examples include: normal use, terminal mode, virtual schemas, oneOf validation

## Key Configuration

### Default AJV Settings
```typescript
{
  allErrors: true,          // Collect all validation errors
  strict: false,           // Better compatibility with existing schemas  
  validateFormats: false   // Disabled for performance
}
```

### Build Configuration
- **Target**: ES2022 (both TypeScript and Vite)
- **Formats**: ESM (.mjs) and CJS (.cjs) bundles
- **External Dependencies**: AJV 7.x, peer dependency on @canard/schema-form
- **Bundle Tool**: Rollup with custom build configuration

## Plugin Integration Pattern

The plugin follows the schema-form plugin architecture:
1. **Registration**: `registerPlugin(plugin)` - Global registration
2. **Binding**: Optional custom AJV instance via `plugin.validator.bind(ajv)`
3. **Compilation**: Schema validation via `plugin.validator.compile(schema)`
4. **Validation**: Async validation with standardized error format

## Important Implementation Details

### AJV 7.x Specific Behavior
- Uses JSONPointer format for error paths by default
- Requires minimal transformation compared to AJV 6.x
- Maintains backward compatibility with Draft-07 schemas

### Error Transformation Logic
- Required field errors: Appends missing property to dataPath
- Other errors: Uses dataPath as-is (already JSONPointer format)
- Preserves original AJV error object as `source` property

### Async Validation Pattern
All validators are compiled with `$async: true` to maintain consistency with the schema-form library's expectation of async validation functions.