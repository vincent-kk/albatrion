# Canard Schema Form Plugin Development

**Usage**: `/plugin <UI_LIBRARY_NAME>` or `/plugin-compatibility <UI_LIBRARY_NAME>`

**Examples**:

- `/plugin "Chakra UI v2"` - Execute full plugin development process
- `/plugin-compatibility "Chakra UI v2"` - Execute compatibility analysis only

---

This command develops UI library plugins for @canard/schema-form by combining the following skills:

## Skills Used

### 1. **canard-type-system** (`.claude/skills/canard-type-system/`)

- Role: Provides TypeScript type system for @canard/schema-form
- Usage: Type definition stage, legacy type validation

### 2. **ui-plugin-guidelines** (`.claude/skills/ui-plugin-guidelines/`)

- Role: UI library compatibility verification and project structure design
- Usage: Initial analysis stage, compatibility mapping

### 3. **react-plugin-implementation** (`.claude/skills/react-plugin-implementation/`)

- Role: Provides React component implementation patterns and optimization strategies
- Usage: Component implementation stage

### 4. **dependency-management** (`.claude/skills/dependency-management/`)

- Role: package.json dependency configuration and version management
- Usage: Project setup stage

### 5. **phased-development** (`.claude/skills/phased-development/`)

- Role: 5-phase development process and priority guide
- Usage: Overall project roadmap planning

## Execution Flow

### `/plugin <UI_LIBRARY_NAME>` (Full Development)

Skill execution order:

1. **ui-plugin-guidelines skill**: Compatibility analysis
   - UI library component mapping
   - Compatibility grading (✅ / ⚠️ / ❌)
   - Priority determination

2. **canard-type-system skill**: Type definition reference
   - FormTypeInputProps, FormTypeRendererProps, etc.
   - Context type design
   - Legacy type validation

3. **phased-development skill**: Development roadmap planning
   - 5-phase development plan
   - Priority-based schedule
   - Milestone setting

4. **dependency-management skill**: package.json generation
   - dependencies/peerDependencies configuration
   - Version specification

5. **react-plugin-implementation skill**: Implementation guide
   - Component pattern provision
   - Optimization strategy guide
   - Test condition writing

### `/plugin-compatibility <UI_LIBRARY_NAME>` (Compatibility Analysis Only)

Skill execution order:

1. **ui-plugin-guidelines skill** (Primary)
   - Compatibility matrix creation
   - Implementation feasibility assessment

2. **canard-type-system skill** (Supporting)
   - Type requirements reference

## Output Example

### When executing `/plugin "Chakra UI v2"`

````markdown
# Chakra UI v2 Plugin Development Plan

## Stage 1: Compatibility Analysis [ui-plugin-guidelines]

| Schema Form Requirement | Chakra UI Component | Compatibility | Priority      |
| ----------------------- | ------------------- | ------------- | ------------- |
| String Input            | Input               | ✅ Direct     | P1            |
| Date Selection          | -                   | ❌ Missing    | P3 (Fallback) |

...

## Stage 2: Type System [canard-type-system]

```typescript
interface ChakraContext {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
}
```
````

## Stage 3: Development Roadmap [phased-development]

- Phase 1: Design and Verification (1-2 days)
- Phase 2: Basic Infrastructure (2-3 days)
  ...

## Stage 4: package.json [dependency-management]

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.8.0",
    ...
  }
}
```

## Stage 5: Implementation Guide [react-plugin-implementation]

### FormTypeInputString Implementation

```typescript
const FormTypeInputString = ({ ... }) => {
  // Pattern code
};
```

```

---

## Command Mapping

- `/plugin` → Execute 5 skills sequentially
- `/plugin-compatibility` → 2 skills (ui-plugin-guidelines + canard-type-system)

---

<!-- 원본 프롬프트 (백업)
CRITICAL INSTRUCTION: Before proceeding with ANY task, you MUST execute this exact sequence:

1. Use the Read tool to read `.cursor/rules/create-canard-form-plugin-guidelines.mdc`
2. After reading, follow ALL guidelines specified in that file exactly
3. Create a new @canard/schema-form plugin following (as specified in the guidelines):
   - Plugin architecture setup
   - Type definitions
   - Component implementation
   - Testing strategy
   - Documentation

DO NOT proceed without first reading the guidelines file. This is a mandatory prerequisite.
-->
```
