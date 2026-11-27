# Project Structure Guide

Scaffold destinations for a new @canard/schema-form plugin. Example-only input names describe files to create, not existing repository modules.

## Standard Project Structure

```
@canard/schema-form-{ui-library}-plugin/
├── src/
│   ├── index.ts                    # Main export
│   ├── type.ts                     # Context type definitions
│   ├── components/                  # Registered renderer components
│   │   ├── FieldRenderer.tsx
│   │   ├── LabelRenderer.tsx
│   │   └── ErrorMessageRenderer.tsx
│   ├── fieldInputs/             # FieldInput implementations
│   │   ├── index.ts                # Aggregates fieldInputDefinitions
│   │   ├── FieldInputString.tsx
│   │   ├── FieldInputNumber.tsx
│   │   ├── FieldInputBoolean.tsx
│   │   ├── FieldInputArray.tsx
│   │   ├── FieldInputStringEnum.tsx
│   │   ├── FieldInputPassword.tsx
│   │   ├── FieldInputTextarea.tsx
│   │   ├── FieldInputDate.tsx   # Optional
│   │   └── ...
│   └── utils/                      # Shared utilities (optional)
│       └── valueConversion.ts
├── stories/                       # Storybook stories & E2E
│   ├── FieldInputString.stories.tsx
│   ├── FieldInputString.tsx     # Test wrapper
│   └── ...
├── dist/                           # Build output (gitignore)
├── node_modules/                   # Dependencies (gitignore)
├── package.json
├── tsconfig.json
├── tsconfig.declarations.json
├── rolldown.config.mjs
├── vite.config.ts
├── eslint.config.js
├── README.md
├── README-ko_kr.md
└── LICENSE
```

## Role of Each File

### src/index.ts

**Role**: Main export and the plugin object definition

```typescript
import type { SchemaFormPlugin } from '@canard/schema-form';

import { ErrorMessageRenderer } from './components/ErrorMessageRenderer';
import { FieldRenderer } from './components/FieldRenderer';
import { LabelRenderer } from './components/LabelRenderer';
import { fieldInputDefinitions } from './fieldInputs';

export const plugin = {
  FieldRenderer,
  LabelRenderer,
  ErrorMessageRenderer,
  fieldInputDefinitions,
} satisfies SchemaFormPlugin;
```

### src/type.ts

**Role**: Context type definition for the UI library

```typescript
export interface MuiContext {
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
}
```

### src/components/

**Renderer components** (register the parts the plugin customizes):

1. `FieldRenderer.tsx` - Field group composing bound terminal parts and direct branch legends
2. `LabelRenderer.tsx` - Label rendering (owns the root `<label>`)
3. `ErrorMessageRenderer.tsx` - Error message display

An optional formatError callback formats validation issues; SchemaFormPlugin allows partial plugins.

**Optional input frame (`InputRenderer`)**: an optional frame registered under the `InputRenderer` key, `({ children, node, required, readOnly, disabled, context }: InputRendererProps) => <Wrapper>{children}</Wrapper>`. It must render `children` exactly once, unconditionally, at an unchanging position. The plugin has no pass-through input renderer file.

### src/fieldInputs/index.ts

**Role**: Aggregates the fieldInputDefinitions array

```typescript
import type { FieldInputDefinition } from '@canard/schema-form';

import { FieldInputPasswordDefinition } from './FieldInputPassword';
import { FieldInputStringEnumDefinition } from './FieldInputStringEnum';
// ... imports

export const fieldInputDefinitions: FieldInputDefinition[] = [
  // Specific conditions, then general conditions
  FieldInputPasswordDefinition,
  FieldInputStringEnumDefinition,
  // ...
  FieldInputStringDefinition,  // Last
];

// Individual exports (optional, for reuse)
export { FieldInputStringDefinition } from './FieldInputString';
export { FieldInputNumberDefinition } from './FieldInputNumber';
// ...
```

### src/fieldInputs/FieldInput*.tsx

**Role**: Input component for each type

**Naming rules**:
- PascalCase
- `FieldInput` + `{Type}`
- Examples: `FieldInputString`, `FieldInputNumber`

### stories/

**Role**: Storybook stories and E2E tests

**File naming**:
- `*.stories.tsx` - Storybook story
- `*.tsx` - Test wrapper component (optional)

## Naming Rules

### Directories
- **lowercase + hyphen**: `field-inputs/` (do not use)
- **camelCase**: `fieldInputs/` (use)

### Files
- **Components**: PascalCase (`.tsx`)
  - `FieldInputString.tsx`
  - `FieldRenderer.tsx`
- **Utilities**: camelCase (`.ts`)
  - `valueConversion.ts`
  - `formatError.ts`
- **Types**: camelCase (`.ts`)
  - `type.ts`
- **Config**: kebab-case (`.mjs`, `.json`)
  - `rolldown.config.mjs`
  - `tsconfig.json`

### Exports
- **Prefer named exports**:
  ```typescript
  export { FieldInputStringDefinition } from './FieldInputString';
  ```
- **Avoid default exports**: for clarity

## Import Patterns

### Absolute paths (internal packages)
```typescript
import { useHandle } from '@winglet/react-utils';
import type { FieldInputProps } from '@canard/schema-form';
```

### Relative paths (same package)
```typescript
import { FieldRenderer } from './components/FieldRenderer';
import type { MuiContext } from './type';
```

## README Structure

### README.md (English)

```markdown
# @canard/schema-form-{ui-library}-plugin

{UI Library} plugin for @canard/schema-form

## Installation

...

## Usage

...

## Components

...

## License

MIT
```

### README-ko_kr.md (Korean)

```markdown
# @canard/schema-form-{ui-library}-plugin

{UI Library} plugin for @canard/schema-form.

## Installation

...

## Usage

...
```

---

**Core principles**:
1. Follow the standard structure
2. Keep naming rules consistent
3. Prefer named exports
4. Distinguish absolute and relative paths
5. Support multilingual READMEs
