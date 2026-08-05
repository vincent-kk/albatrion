---
name: schema-form-skill
description: "Expert knowledge base for @canard/schema-form. Triggers on FormTypeInput, computed properties (active/visible/readOnly/derived), conditional schemas (oneOf/anyOf/allOf/if-then-else), JSONPointer (.., ., *, @), FormHandle, virtual schemas, plugins (AJV/Antd/MUI), validation, state, injectTo, arrays, context, events, troubleshooting."
user-invocable: false
---

# Schema Form Expert

Knowledge base for `@canard/schema-form`. Answer questions, show usage examples, and diagnose issues by routing to the right knowledge file in `knowledge/`.

## How to Use This Skill

1. Identify the topic in the user's question.
2. Locate the matching knowledge file using the Topic Router below.
3. Load that knowledge file and any related files listed in the router.
4. Answer with a concept explanation, a concrete TSX example, and references to the knowledge file(s) used.

Do not inline the full interface definitions or long examples from knowledge files into the answer — cite them and quote only the minimal relevant snippet.

## Topic Router

| Topic keywords in user question | Knowledge file |
|---|---|
| `computed`, `watch`, `active`, `visible`, `readOnly`, `disabled`, `pristine`, `derived`, `&active`, `&visible` | `knowledge/computed-properties.md` |
| `oneOf`, `anyOf`, `allOf`, `if/then/else`, `&if`, conditional fields, dynamic forms | `knowledge/conditional-schema.md` |
| `FormTypeInput`, `FormTypeInputProps`, `formTypeInputDefinitions`, `formTypeInputMap`, custom input | `knowledge/formtype-input.md` |
| `validate`, `ValidationMode`, `errorMessages`, `formatError`, `useChildNodeErrors`, validation plugin | `knowledge/validation.md` |
| `injectTo`, field value propagation, circular reference, auto-populate | `knowledge/inject-to.md` |
| `ArrayNode`, `push`, `remove`, `clear`, `minItems`, `maxItems`, `prefixItems`, tuple | `knowledge/array-operations.md` |
| `FormHandle`, `useRef`, `getValue`, `setValue`, `validate()`, `reset`, `submit`, `focus`, programmatic control | `knowledge/form-handle.md` |
| `JSONPointer`, paths, `..`, `.`, `*`, `@`, `~0`, `~1`, `find`, `findNode` | `knowledge/jsonpointer.md` |
| `registerPlugin`, plugin development, AJV, Antd, MUI, UI plugin, validator plugin | `knowledge/plugin-system.md` |
| `Form.Render`, `Form.Input`, `Form.Label`, custom layout, path-based rendering | `knowledge/form-render.md` |
| `virtual`, `VirtualNode`, field grouping, date range, multi-field combination | `knowledge/virtual-schema.md` |
| `NodeState`, `dirty`, `touched`, `validated`, `showError`, `globalState`, `onStateChange`, `clearState` | `knowledge/state-management.md` |
| `context`, `@.`, `(@).`, external data, `userRole`, permissions, multi-tenant | `knowledge/context-usage.md` |
| `NodeEventType`, `subscribe`, `EventCascade`, event batching, `UpdateValue`, `RequestRefresh`, `RequestRemount` | `knowledge/event-system.md` |
| errors, not working, bug, debug, unexpected behavior | `knowledge/troubleshooting.md` |
| performance, slow, memory, large data, Strategy, virtualization, bulk operation | `knowledge/performance-optimization.md` |
| testing, unit test, component test, integration test, Vitest, testing-library | `knowledge/testing-guide.md` |

## Architecture Cheat Sheet

Use this section for quick orientation. Load the matching knowledge file for depth.

### Node System

- **Terminal nodes**: `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`
- **Branch nodes**: `ObjectNode`, `ArrayNode` (each with `BranchStrategy` or `TerminalStrategy`)
- **Special**: `VirtualNode` (field grouping, computed values)
- Creation entry: `nodeFromJsonSchema()`

### FormTypeInput Resolution Priority (highest → lowest)

1. `FormTypeInput` property set directly on a JSON Schema node
2. `formTypeInputMap` path mapping (`formTypeInputMap` prop on `Form`)
3. `Form`-level `formTypeInputDefinitions`
4. `FormProvider`-level `formTypeInputDefinitions`
5. Plugin-provided `formTypeInputDefinitions`

### JSONPointer Extensions by Context

| Syntax | computed expressions | `node.find()` | `formTypeInputMap` |
|---|---|---|---|
| Absolute `/a/b` | ✓ | ✓ | ✓ |
| Relative `..`, `.` | ✓ | ✓ | ✗ |
| Wildcard `*` | ✗ | ✗ | ✓ |
| Context `@` | ✓ | ✗ | ✗ |

### Computed Property Keys

`watch` | `active` | `visible` | `readOnly` | `disabled` | `pristine` | `derived`

Shorthand aliases (top-level schema keys): `&active`, `&visible`, `&readOnly`, `&disabled`, `&pristine`, `&derived`, `&if`.

**active vs visible**
- `active: false` → value removed from form data (use for conditional fields, payment methods)
- `visible: false` → UI hidden but value retained (use for collapsible UI, step forms)

See `knowledge/computed-properties.md` for the full decision table.

### ValidationMode

```typescript
enum ValidationMode { None = 0, OnChange = 1, OnRequest = 2 }
// Combinable: ValidationMode.OnChange | ValidationMode.OnRequest
```

### Available Plugins

| Category | Packages |
|---|---|
| Validator | `@canard/schema-form-ajv8-plugin`, `@canard/schema-form-ajv7-plugin`, `@canard/schema-form-ajv6-plugin` |
| UI | `@canard/schema-form-antd5-plugin`, `@canard/schema-form-antd6-plugin`, `@canard/schema-form-antd-mobile-plugin`, `@canard/schema-form-mui-plugin` |

Register via `registerPlugin(plugin)` before the first render. Order: UI plugins before validator plugins.

## Answer Format

Structure every answer as:

1. **Concept** — one-paragraph explanation rooted in the cited knowledge file.
2. **Example** — minimal TSX snippet that compiles against the public API.
3. **References** — `knowledge/<file>.md` and related story (`stories/NN.Topic.stories.tsx`) or test file when applicable.

Keep code examples focused on the single concept being asked. Link to the knowledge file for variants and edge cases instead of inlining them.

## Reference Map

| Resource | Path |
|---|---|
| Full specification (Korean) | `packages/canard/schema-form/docs/ko/SPECIFICATION.md` |
| Full specification (English) | `packages/canard/schema-form/docs/en/SPECIFICATION.md` |
| Quick reference | `packages/canard/schema-form/docs/QUICK_REFERENCE.md` |
| Storybook examples | `packages/canard/schema-form/stories/*.stories.tsx` |
| Unit tests | `packages/canard/schema-form/src/core/__tests__/*.test.ts` |
| Package CLAUDE.md (architecture) | `packages/canard/schema-form/CLAUDE.md` |
