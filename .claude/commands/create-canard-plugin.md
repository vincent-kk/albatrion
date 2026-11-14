# Canard Schema Form Plugin Development

**Usage**:

- `/create-canard-plugin <UI_LIBRARY_NAME>` - Full plugin development process
- `/create-canard-plugin <UI_LIBRARY_NAME> --compatibility-only` - Compatibility analysis only

**Examples**:

- `/create-canard-plugin "Chakra UI v2"` - Execute full plugin development process
- `/create-canard-plugin "Chakra UI v2" --compatibility-only` - Execute compatibility analysis only
- `/create-canard-plugin "Material-UI v5"` - Full development
- `/create-canard-plugin "Ant Design v5" --compatibility-only` - Quick compatibility check

---

This command develops UI library plugins for @canard/schema-form by combining the following skills:

## Skills Used

Paths marked `<new-plugin>` or shown in generated output are scaffold destinations, not existing repository references.

### 1. **ui-plugin-guidelines** (`.claude/skills/ui-plugin-guidelines/`)

- Role: UI library compatibility verification and project structure design
- Usage: Initial analysis stage, compatibility mapping

### 2. **react-plugin-implementation** (`.claude/skills/react-plugin-implementation/`)

- Role: Provides React component implementation patterns and optimization strategies
- Usage: Component implementation stage

Types come from `packages/canard/schema-form/src/index.ts` and
`packages/canard/schema-form/src/types/field/`; consumer guidance lives in
`packages/canard/schema-form/docs/agents/`. Use
`packages/canard/schema-form-antd5-plugin/package.json` as the dependency reference.
Roadmap priorities come from the compatibility analysis, not an additional skill.

## Execution Flow

### `/create-canard-plugin <UI_LIBRARY_NAME>` (Full Development)

Execution order:

1. **ui-plugin-guidelines skill**: Compatibility analysis
   - UI library component mapping
   - Compatibility grading (✅ / ⚠️ / ❌)
   - Priority determination

2. **Current public type declarations**: Type definition reference
   - FieldInputProps, FieldRendererProps, etc.
   - Context type design
   - Public export validation

3. **Compatibility-based roadmap**: Development roadmap planning
   - 5-phase development plan
   - Priority-based schedule
   - Milestone setting

4. **Reference plugin manifest**: package.json generation
   - dependencies/peerDependencies configuration
   - Version specification

5. **react-plugin-implementation skill**: Implementation guide
   - Component pattern provision
   - Optimization strategy guide
   - Test condition writing

### `/create-canard-plugin <UI_LIBRARY_NAME> --compatibility-only` (Compatibility Analysis Only)

**Purpose**: Quick compatibility check without full development setup

Execution order:

1. **ui-plugin-guidelines skill** (Primary)
   - Compatibility matrix creation
   - Implementation feasibility assessment
   - Priority determination

2. **Current public type declarations** (Supporting)
   - Type requirements reference
   - Basic type compatibility check

**Output**: Compatibility report only (no code generation, no package setup)

## Output Example

### When executing `/create-canard-plugin "Chakra UI v2"`

````markdown
# Chakra UI v2 Plugin Development Plan

## Stage 1: Compatibility Analysis [ui-plugin-guidelines]

| Schema Form Requirement | Chakra UI Component | Compatibility | Priority      |
| ----------------------- | ------------------- | ------------- | ------------- |
| String Input            | Input               | ✅ Direct     | P1            |
| Date Selection          | -                   | ❌ Missing    | P3 (Fallback) |

...

## Stage 2: Type System [public declarations]

```typescript
interface ChakraContext {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
}
```

## Stage 3: Development Roadmap [compatibility priorities]

- Phase 1: Design and Verification (1-2 days)
- Phase 2: Basic Infrastructure (2-3 days)
  ...

## Stage 4: package.json [reference manifest]

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.8.0",
    ...
  }
}
```

## Stage 5: Implementation Guide [react-plugin-implementation]

### FieldInputString Implementation

```typescript
const FieldInputString = ({ defaultValue, onChange }: FieldInputProps<string>) => (
  <Input defaultValue={defaultValue} onChange={(event) => onChange(event.target.value || undefined)} />
);
```
````

---

## Command Modes

### Full Development Mode (Default)

**Command**: `/create-canard-plugin <UI_LIBRARY_NAME>`
**Execution**: 5 stages using 2 skills and current repository sources

1. ui-plugin-guidelines (compatibility analysis)
2. Public declarations (type definitions)
3. Compatibility priorities (roadmap)
4. Reference plugin manifest (package.json)
5. react-plugin-implementation (implementation guide)

### Compatibility-Only Mode

**Command**: `/create-canard-plugin <UI_LIBRARY_NAME> --compatibility-only`
**Execution**: Compatibility skill plus current public declarations

1. ui-plugin-guidelines (Primary - compatibility matrix)
2. Public declarations (Supporting - type requirements)

**Purpose**: Quick assessment before committing to full development

---

## 💡 Usage Scenarios

### Scenario 1: Quick Compatibility Check

```bash
# Situation: Considering a new UI library
# Goal: Check if it's compatible before investing time

/create-canard-plugin "Radix UI" --compatibility-only

# Output: Compatibility matrix in 30 seconds
# Decision: If ✅ > 80%, proceed to full development
```

### Scenario 2: Full Plugin Development

```bash
# Situation: Decided to create a new plugin
# Goal: Complete development roadmap and implementation

/create-canard-plugin "Chakra UI v2"

# Output: 5-stage complete plan
# Next Steps: Follow the generated implementation guide
```

### Scenario 3: Multiple Library Evaluation

```bash
# Situation: Choosing between 3 UI libraries
# Goal: Compare compatibility scores

/create-canard-plugin "Chakra UI" --compatibility-only
/create-canard-plugin "Material-UI" --compatibility-only
/create-canard-plugin "Ant Design" --compatibility-only

# Result: Compare compatibility matrices, choose best fit
```

### Scenario 4: Version Migration Planning

```bash
# Situation: Upgrading from Chakra UI v1 to v2
# Goal: Assess breaking changes impact

/create-canard-plugin "Chakra UI v2" --compatibility-only

# Result: See which components need updates
```

---

## 🔄 Workflow Recommendation

```
1. Quick Check Phase
   ↓
   /create-canard-plugin "Library Name" --compatibility-only
   ↓
   Review compatibility matrix
   ↓
   Decision: Compatible enough? (≥80% ✅)

2. Full Development Phase (if YES)
   ↓
   /create-canard-plugin "Library Name"
   ↓
   Follow 5-stage implementation plan
   ↓
   Build, test, release
```

---

## ⚙️ Command Execution Details

When you run `/create-canard-plugin <UI_LIBRARY_NAME>`, Claude will:

1. **Parse the command**
   - Detect if `--compatibility-only` flag is present
   - Extract UI library name and version

2. **Route to appropriate mode**
   - Full mode: Execute all 5 stages
   - Compatibility-only: Analyze compatibility and check the public declarations

3. **Execute the stages in order**
   - Each skill reads from its knowledge/ directory
   - Tools may be invoked for automation

4. **Generate structured output**
   - Markdown format with clear sections
   - Actionable recommendations
   - Next steps guidance

---

## 🚀 Advanced Features

### 1. Plugin Template Auto-Generation

- **Automatic boilerplate generation**: generate the project structure immediately after compatibility analysis completes
  - Directory structure: `packages/{library-name}-plugin/`
  - File templates: package.json, tsconfig.json, README.md
  - Component scaffolding: one empty component file per input kind
- **Type scaffold**: extend FieldInputProps and define the plugin context
  - Types tailored to each UI library
  - Interfaces that extend props
  - Context type definitions
- **Configuration file generation**: configure the linter, formatter and TypeScript
  - .eslintrc.js (React/TypeScript rules)
  - .prettierrc (project style)
  - tsconfig.json (strict type checking)

### 2. Dependency Version Auto-Detection

- **Automatic latest-version detection**: use WebSearch to detect the latest stable UI library version
  - Query the npm registry
  - Calculate compatible version ranges
  - Configure peerDependencies automatically
- **Dependency conflict detection**: check for conflicts with existing monorepo dependencies in advance
  - React version compatibility
  - TypeScript version compatibility
  - Suggestions for optimizing duplicate dependencies
- **Version range optimization**: recommend appropriate semver ranges automatically
  - ^: allow minor version updates
  - ~: allow patch versions only
  - Exact version: when breaking changes are a concern

### 3. Test Case Auto-Generation

- **Basic tests per input kind**: generate the required behavior checks
  - Rendering test: verify that the component renders correctly
  - Props test: verify that required props are passed
  - Validation test: test input validation logic
- **Snapshot tests**: prevent visual regressions in each component
  - Initial render snapshot
  - Props variant snapshots
  - Error state snapshots
- **Integration tests**: mount Form with the plugin to verify the binding
  - Schema-based rendering
  - Verify context delivery
  - Verify event handling

**Example Template Output**:

```typescript
// Scaffold output: <new-plugin>/src/fieldInputs/FieldInputString.tsx
import type { FieldInputDefinition, FieldInputProps } from '@canard/schema-form';
import { Input } from '@chakra-ui/react';

interface ChakraContext {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
}

const FieldInputString = ({
  path, name, value, onChange, context, required, disabled, readOnly,
}: FieldInputProps<string, ChakraContext>) => (
  <Input
    id={path}
    name={name}
    value={value ?? ''}
    onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.value)}
    size={context.size}
    variant={context.variant}
    isRequired={required}
    isDisabled={disabled}
    isReadOnly={readOnly}
  />
);

export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: { type: 'string' },
  controlled: true,
} satisfies FieldInputDefinition;
```

**Example Test Output**:

```typescript
// Scaffold output: <new-plugin>/src/fieldInputs/__tests__/FieldInputString.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { FieldInputStringDefinition } from '../FieldInputString';

const definitions = [FieldInputStringDefinition];
const schema = { type: 'string' } as const;

describe('FieldInputString', () => {
  it('renders the initial value', () => {
    render(<Form jsonSchema={schema} defaultValue="test@example.com" fieldInputDefinitions={definitions} />);
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('publishes input changes', () => {
    const onChange = vi.fn();
    render(<Form jsonSchema={schema} fieldInputDefinitions={definitions} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new@example.com' } });
    expect(onChange).toHaveBeenCalledWith('new@example.com');
  });

  it('renders the form snapshot', () => {
    const { container } = render(<Form jsonSchema={schema} fieldInputDefinitions={definitions} />);
    expect(container).toMatchSnapshot();
  });
});
```


---

## ⚠️ Troubleshooting

### When a Skill Cannot Be Found

**Problem**: the ui-plugin-guidelines or react-plugin-implementation skill directory is missing.

**Fallback behavior**:

1. ⚠️ Warning message: "The skill is unavailable, so this plugin development guide uses the basic approach"
2. Generate a plugin guide using the native approach:
   - Manual UI library analysis
   - Basic TypeScript type definitions
   - General React component patterns
   - Simple dependency configuration
3. Output quality: no compatibility matrix or phased roadmap

**Resolution**:

```bash
# Check the skill directories
ls -la .claude/skills/ui-plugin-guidelines/
ls -la .claude/skills/react-plugin-implementation/

# Restore from the repository
git checkout .claude/skills/
```

### Insufficient UI Library Information

**Problem**: the supplied UI library name is ambiguous or information is insufficient

**Fallback behavior**:

1. ⚠️ Warn that UI library information is insufficient
2. Start interactive questions:
   - Confirm the exact library name
   - Confirm the version
   - Confirm the official documentation URL
3. Proceed after collecting sufficient information

**Resolution**:

```bash
# Provide the exact library name and version
/create-canard-plugin "Material-UI v5" --compatibility-only

# Check the official names
# - "Material-UI" → "@mui/material"
# - "Ant Design" → "antd"
# - "Chakra UI" → "@chakra-ui/react"
```

### --compatibility-only Mode Errors

**Problem**: an error occurs when running compatibility analysis only

**Fallback behavior**:

1. ⚠️ Report the compatibility analysis failure
2. Suggest switching to full mode
3. Provide a manual compatibility check guide

**Resolution**:

```bash
# Try full mode
/create-canard-plugin "UI Library Name"

# Check compatibility manually
# 1. Read the UI library official documentation
# 2. Check the @canard/schema-form requirements list
# 3. Create a component mapping table
```

### Missing Knowledge Files

**Problem**: UI pattern or type system guide files are missing

**Fallback behavior**:

1. ⚠️ Warn that guide files are missing
2. Apply general React patterns
3. Use basic TypeScript types

**Resolution**:

```bash
# Check the knowledge files
ls -la .claude/skills/*/knowledge/

# Restore from the repository
git checkout .claude/skills/*/knowledge/
```

## 📖 Usage Examples

### Basic Usage

```
/create-canard-plugin "UI_LIBRARY_NAME"
```

### Compatibility Check Only

```
/create-canard-plugin "UI_LIBRARY_NAME" --compatibility-only
```

### Practical Scenarios

#### Scenario 1: Quick Compatibility Check

```
Situation: check in advance whether Radix UI can be used
Command: /create-canard-plugin "Radix UI" --compatibility-only
Output:
  📊 Compatibility matrix
  - String Input: ✅ 100%
  - Select: ✅ 95%
  - DatePicker: ❌ Missing (an alternative is required)
  Overall score: 85% → development is recommended
```

#### Scenario 2: Full Plugin Development

```
Situation: develop a complete Chakra UI v2 plugin
Command: /create-canard-plugin "Chakra UI v2"
Output:
  1. Compatibility analysis (ui-plugin-guidelines)
  2. Check the current public declarations
  3. Prioritize the 5-phase development roadmap from the compatibility findings
  4. Generate package.json using the reference plugin manifest
  5. Provide an implementation guide (react-plugin-implementation)
```

#### Scenario 3: Compare Multiple Libraries

```
Situation: choose the best of 3 UI libraries
Commands:
  /create-canard-plugin "Chakra UI" --compatibility-only
  /create-canard-plugin "Material-UI" --compatibility-only
  /create-canard-plugin "Ant Design" --compatibility-only
Output:
  - Compare compatibility scores (Chakra: 88%, MUI: 92%, Ant: 85%)
  - Final choice: Material-UI
  → /create-canard-plugin "Material-UI v5" (proceed with full development)
```

### Advanced Feature Examples

#### Example 1: Automatic Template Generation

```
Situation: generate Chakra UI plugin boilerplate immediately
Command: /create-canard-plugin "Chakra UI v2"
Output:
  - Compatibility analysis complete (88%)
  - Generated automatically:
    - <new-plugin>/
      - src/fieldInputs/FieldInputString.tsx (empty template)
      - src/types/ChakraContext.ts
      - package.json (including dependencies)
      - tsconfig.json, .eslintrc.js
      - README.md (usage guide)
  - Implementation can start immediately
```

#### Example 2: Automatic Dependency Version Detection

```
Situation: detect the latest stable version automatically
Command: /create-canard-plugin "Material-UI"
Output:
  - Look up the latest version with WebSearch: @mui/material@5.15.0
  - Compatibility check: React 18.x is required
  - Automatically generated package.json:
    {
      "dependencies": {
        "@mui/material": "^5.15.0"
      },
      "peerDependencies": {
        "react": "^18.0.0"
      }
    }
  - Conflict detection: none ✅
```

#### Example 3: Automatic Test Generation

```
Scenario: generate behavior tests for every input kind
Command: /create-canard-plugin "Chakra UI v2"
Output:
  - Generate 3 tests automatically for each component:
    - FieldInputString.test.tsx (rendering, onChange, snapshot)
    - FieldInputNumber.test.tsx (validation, onChange, snapshot)
    - FieldInputStringEnum.test.tsx (options, onChange, snapshot)
  - Integration tests:
    - plugin.integration.test.tsx (schema-driven Form rendering)
  - yarn test can run immediately
```

#### Example 4: Full Workflow Automation

```
Situation: compatibility check → template generation → test generation → start implementation
Commands:
  1. /create-canard-plugin "Radix UI" --compatibility-only
  2. (85% compatibility → decide to proceed)
  3. /create-canard-plugin "Radix UI"
Output:
  - Generate the complete project structure
  - Automatic dependency installation command: yarn install
  - Test framework configuration complete
  - Provide an implementation guide
  - Development can start immediately
```

## 💡 Tips

- **Preliminary check required**: verify with --compatibility-only before starting development
- **Specify the version**: provide the exact version, such as "Chakra UI v2"
- **80% threshold**: development is recommended when compatibility is at least 80%
- **Plan alternatives**: define a fallback strategy for components with low compatibility
- **Use templates**: reduce development time with automatically generated boilerplate
- **Keep dependencies current**: always use the latest stable version through automatic WebSearch detection
- **Test coverage**: ensure basic quality with automatically generated tests

---

## ✅ Success Output

### Compatibility Check Mode (--compatibility-only)

```
✅ Chakra UI v2 compatibility analysis complete!

📊 Compatibility matrix:
| Schema Form requirement | Chakra UI component | Compatibility | Priority |
|---------------------|-------------------|--------|---------|
| String Input        | Input             | ✅ 100% | P1      |
| Select              | Select            | ✅ 95%  | P1      |
| Checkbox            | Checkbox          | ✅ 100% | P1      |
| DatePicker          | -                 | ❌ 0%   | P3      |
| FileUpload          | -                 | ⚠️ 50%  | P2      |

📈 Overall compatibility: 88% ✅ (development is recommended)

💡 Recommendations:
- ✅ Immediate development is possible: String, Select, Checkbox
- ⚠️ An alternative is required: DatePicker (consider react-datepicker integration)
- 📦 Extended implementation: FileUpload (custom implementation based on Chakra Box)

⏱️ Analysis time: 12 seconds

💡 Next steps:
- Compatibility ≥ 80% → /create-canard-plugin "Chakra UI v2" (proceed with full development)
- Compatibility < 80% → consider another UI library
```

### Full Development Mode

```
✅ Chakra UI v2 plugin development plan complete!

📊 5-phase development roadmap:

Phase 1: Design and verification (1-2 days)
- ✅ Compatibility analysis complete (88%)
- ✅ Type system design
- ✅ Context interface definition

Phase 2: Basic infrastructure (2-3 days)
- [ ] Generate package.json
- [ ] Set up the project structure
- [ ] Install dependencies

Phase 3: Core components (3-5 days)
- [ ] Implement FieldInputString
- [ ] Implement FieldInputNumber
- [ ] Implement FieldInputStringEnum

Phase 4: Testing and documentation (2-3 days)
Phase 5: Release preparation (1 day)

📁 Files to generate:
- <new-plugin>/
  - package.json
  - src/components/
  - src/types/
  - README.md

⏱️ Plan generation time: 35 seconds
⏱️ Estimated development time: 9-14 days

💡 Next steps:
1. Review the development roadmap
2. Implement the reviewed roadmap
3. Review each completed phase
```

## ❌ Failure Output

```
❌ Plugin development plan generation failed

🔍 Causes:
- Insufficient UI library information ("Chakra UI" → specify the version)
- Missing required skill: ui-plugin-guidelines or react-plugin-implementation
- Or: WebSearch failure (the latest version information cannot be verified)

💡 Resolution:
1. Provide the exact library name and version:
   /create-canard-plugin "Chakra UI v2.8.0"
   /create-canard-plugin "@chakra-ui/react v2"

2. Check the official documentation URLs:
   - Chakra UI: https://chakra-ui.com
   - Material-UI: https://mui.com
   - Ant Design: https://ant.design

3. Collect information in interactive mode:
   /create-canard-plugin
   (Answer questions to provide library information)

4. Restore the skills:
   git checkout .claude/skills/ui-plugin-guidelines/
   git checkout .claude/skills/react-plugin-implementation/

📚 Additional help: a compatibility check with --compatibility-only is recommended first
```
