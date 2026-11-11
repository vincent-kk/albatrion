# Project Structure Guide

Recommended directory structure for an @canard/schema-form plugin.

## Standard Project Structure

```
@canard/schema-form-{ui-library}-plugin/
├── src/
│   ├── index.ts                    # Main export
│   ├── type.ts                     # Context type definitions
│   ├── renderers/                  # Base renderers (5 required)
│   │   ├── FormGroup.tsx
│   │   ├── FormLabel.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormError.tsx
│   │   └── formatError.ts
│   ├── formTypeInputs/             # FormTypeInput implementations
│   │   ├── index.ts                # Aggregates formTypeInputDefinitions
│   │   ├── FormTypeInputString.tsx
│   │   ├── FormTypeInputNumber.tsx
│   │   ├── FormTypeInputBoolean.tsx
│   │   ├── FormTypeInputArray.tsx
│   │   ├── FormTypeInputStringEnum.tsx
│   │   ├── FormTypeInputPassword.tsx
│   │   ├── FormTypeInputTextarea.tsx
│   │   ├── FormTypeInputDate.tsx   # Optional
│   │   └── ...
│   └── utils/                      # Shared utilities (optional)
│       └── valueConversion.ts
├── coverage/                       # Storybook stories & E2E
│   ├── FormTypeInputString.stories.tsx
│   ├── FormTypeInputString.tsx     # Test wrapper
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

import { FormError } from './renderers/FormError';
import { FormGroup } from './renderers/FormGroup';
import { FormInput } from './renderers/FormInput';
import { FormLabel } from './renderers/FormLabel';
import { formatError } from './renderers/formatError';
import { formTypeInputDefinitions } from './formTypeInputs';

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;

// Type exports
export type * from './type';
// Component exports (optional)
export * from './formTypeInputs';
```

### src/type.ts

**Role**: Context type definition for the UI library

```typescript
export interface MuiContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}
```

### src/renderers/

**5 required files**:
1. `FormGroup.tsx` - Field group wrapper
2. `FormLabel.tsx` - Label rendering
3. `FormInput.tsx` - Input wrapper (passthrough)
4. `FormError.tsx` - Error message display
5. `formatError.ts` - Error format function

### src/formTypeInputs/index.ts

**Role**: Aggregates the formTypeInputDefinitions array

```typescript
import type { FormTypeInputDefinition } from '@canard/schema-form';

import { FormTypeInputPasswordDefinition } from './FormTypeInputPassword';
import { FormTypeInputStringEnumDefinition } from './FormTypeInputStringEnum';
// ... imports

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // Specific conditions, then general conditions
  FormTypeInputPasswordDefinition,
  FormTypeInputStringEnumDefinition,
  // ...
  FormTypeInputStringDefinition,  // Last
];

// Individual exports (optional, for reuse)
export * from './FormTypeInputString';
export * from './FormTypeInputNumber';
// ...
```

### src/formTypeInputs/FormTypeInput*.tsx

**Role**: Input component for each type

**Naming rules**:
- PascalCase
- `FormTypeInput` + `{Type}`
- Examples: `FormTypeInputString`, `FormTypeInputNumber`

### coverage/

**Role**: Storybook stories and E2E tests

**File naming**:
- `*.stories.tsx` - Storybook story
- `*.tsx` - Test wrapper component (optional)

## Naming Rules

### Directories
- **lowercase + hyphen**: `form-type-inputs/` (do not use)
- **camelCase**: `formTypeInputs/` (use)

### Files
- **Components**: PascalCase (`.tsx`)
  - `FormTypeInputString.tsx`
  - `FormGroup.tsx`
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
  export const FormTypeInputString = ...
  export const FormTypeInputStringDefinition = ...
  ```
- **Avoid default exports**: for clarity

## Import Patterns

### Absolute paths (internal packages)
```typescript
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputProps } from '@canard/schema-form';
```

### Relative paths (same package)
```typescript
import { FormGroup } from './renderers/FormGroup';
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
