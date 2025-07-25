# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@canard/schema-form-antd-mobile-plugin` is a mobile-optimized plugin for the `@canard/schema-form` library that provides Ant Design Mobile UI components for form rendering. This package is part of a larger monorepo (`albatrion`) and specifically extends the schema-form system with pre-built mobile-first components optimized for React Native and mobile web applications.

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
- **FormGroup**: Mobile-optimized container component using antd-mobile's Space component
- **FormLabel**: Label rendering component
- **FormInput**: Input wrapper component  
- **FormError**: Error display component
- **formTypeInputDefinitions**: Array of 10 mobile-specific form input type definitions

### FormTypeInput Component Pattern
Each FormTypeInput component follows a consistent pattern:
1. **Component**: React component implementing the mobile input using antd-mobile components
2. **Definition**: Object with `Component` and `test` properties
3. **Test conditions**: JSON Schema matching criteria to determine when to use the component

### Component Priority System
Components are selected in this order:
1. In-line component (FormType property in schema)
2. FormTypeInputMap (explicitly mapped components)
3. FormTypeInputDefinition (automatic selection via test conditions)
4. Provider FormTypeInputDefinition
5. Plugin components (this plugin)
6. Fallback components

The plugin's components are prioritized in the specific order defined in `formTypeInputDefinitions`: BooleanSwitch → StringCheckbox → StringSwitch → RadioGroup → Array → Slider → Textarea → String → Number → Boolean.

### Core Components Structure

**Base Components** (`src/components/`):
- `FormGroup.tsx` - Mobile-optimized container using antd-mobile Space component
- `FormLabel.tsx` - Label rendering with required field indicators
- `FormInput.tsx` - Input wrapper component
- `FormError.tsx` - Error message display

**FormTypeInputs** (`src/formTypeInputs/`):
Contains 10 specialized mobile input components:
- `FormTypeInputBooleanSwitch.tsx` - Switch for boolean values with custom labels
- `FormTypeInputStringCheckbox.tsx` - Checkbox groups for string arrays
- `FormTypeInputStringSwitch.tsx` - Switch toggle between two string values
- `FormTypeInputRadioGroup.tsx` - Radio groups with custom labels
- `FormTypeInputArray.tsx` - Dynamic lists with add/remove functionality
- `FormTypeInputSlider.tsx` - Number input via slider (including range sliders)
- `FormTypeInputTextarea.tsx` - Multi-line text input with auto-resize
- `FormTypeInputString.tsx` - Default string input (includes password mode)
- `FormTypeInputNumber.tsx` - Stepper component for numeric input
- `FormTypeInputBoolean.tsx` - Checkbox for boolean values with indeterminate state

### Mobile-Specific Features
- **Touch-optimized components**: All inputs are designed for mobile interaction
- **Switch components**: Preferred over checkboxes for better mobile UX
- **Slider inputs**: Touch-friendly numeric input with range support
- **Dynamic arrays**: Mobile-optimized add/remove buttons (hidden in read-only mode)
- **Custom labeling**: Support for context-based and schema-based custom labels

### Monorepo Context
This package depends on other packages in the monorepo:
- `@canard/schema-form` - Core form system (peer dependency)
- `@winglet/common-utils` - Common utilities
- `@winglet/react-utils` - React-specific utilities (especially `useHandle` hook)
- `antd-mobile` - Ant Design Mobile components (peer dependency)
- `dayjs` - Date manipulation library (peer dependency)

## Key Implementation Details

### Schema-to-Component Mapping
Components are selected based on JSON Schema properties:
- `type` - Base type (string, number, integer, boolean, array)
- `format` - Specific format (slider, textarea, password)
- `formType` - Custom form type hint (switch, radio, radiogroup, checkbox)
- `enum` - Available options for selection components
- `items.type` - For array validation (checkbox groups, range sliders)

### Mobile UX Patterns
- **Switch over checkbox**: Boolean inputs prefer Switch component when `formType: "switch"`
- **Slider for numeric input**: When `format: "slider"` is specified
- **Range sliders**: Supported for array types with numeric items
- **Touch-friendly sizing**: Components optimized for finger interaction

### Context Support
Components support additional context for customization:
- `checkboxLabels` - Custom labels for switch states
- Size and styling contexts from the form system

### State Management
Uses the parent `@canard/schema-form` system's state management:
- Node-based architecture for form state
- Subscription-based updates
- JSON Pointer path-based field identification
- Mobile-optimized change handlers using `useHandle` hook

### TypeScript Integration
- Full TypeScript support with strict typing
- Declaration files generated automatically
- Extends base schema types with mobile-component-specific properties
- Custom schema interfaces for component-specific options

## Development Guidelines

### Adding New FormTypeInput Components
1. Create component file in `src/formTypeInputs/`
2. Export both Component and Definition
3. Add to `formTypeInputDefinitions` array in proper priority order
4. Follow existing patterns for props and schema typing
5. Ensure mobile-first design and touch optimization

### Testing Approach
Uses Vitest with jsdom environment for component testing. Coverage stories are available in the `coverage/` directory for visual testing via Storybook.

### Build System
- **Rollup** for bundling (ESM + CJS outputs)
- **TypeScript** for declaration file generation
- **Peer dependencies** externalized (React, antd-mobile, dayjs)
- Targets ES2020+ environments
- Uses shared build configuration from `../../aileron/script/build/rollup.bundle.mjs`

### Integration with Parent Schema System
Components receive standardized props from the parent system including:
- `path` - JSON Pointer path for the field
- `jsonSchema` - The relevant JSON Schema with mobile-specific extensions
- `onChange` - Change handler optimized for mobile events
- `readOnly/disabled` - Control states
- `context` - Additional context for mobile customization