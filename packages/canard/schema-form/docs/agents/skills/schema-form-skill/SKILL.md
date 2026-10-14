---
name: schema-form-skill
description: 'Expert knowledge base for @canard/schema-form. Triggers on FieldInput, controls (controls.active/visible/readOnly/derived/watch/resetInteraction), conditional schemas (oneOf/anyOf/allOf/if-then-else), JSONPointer (.., ., *, @), FormHandle, ShowError, virtual schemas, plugins (AJV/Antd/MUI), validation, state, injectTo, arrays, array output filters (omitTrailing/omitEmpty/outputValue), virtualization, context, events, troubleshooting.'
---

# Schema Form Expert

Knowledge base for `@canard/schema-form`. Answer questions, show usage examples, and diagnose issues by routing to the right knowledge file. For exact API shapes (props, interfaces, enums), read the installed package's `dist/index.d.ts` and README — do not guess symbol names from memory; this skill documents behavior the types cannot show.

## How to Use This Skill

1. Match the question's topic in the router below and load that knowledge file (plus related ones it references).
2. Answer with a concept explanation, one minimal TSX example that compiles against the public API, and the reference used.
3. Quote only the smallest relevant snippet — cite files instead of inlining them.

## Topic Router

| Topic keywords                                                                                                                                                                                                                | Knowledge file                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `controls`, `watch`, `active`, `visible`, `readOnly`, `disabled`, `resetInteraction`, `derived`, `discriminator`, expression syntax, `oneOf`, `anyOf`, `allOf`, `if/then/else`, conditional fields, `context`, `@` references | `knowledge/expressions.md`           |
| `ArrayNode`, `push`, `remove`, `clear`, `minItems`, `maxItems`, `prefixItems`, tuple, `terminal`, strategy, `omitTrailing`, `omitEmpty`, `outputValue`, performance, slow, large forms, `virtualization`                      | `knowledge/arrays-and-scale.md`      |
| `validate`, `ValidationMode`, `errorMessages`, `formatError`, `ShowError`, `showError`, `NodeState`, `dirty`, `touched`, `globalState`, `onStateChange`, `clearState`, `useChildFieldErrors`                                  | `knowledge/validation-and-state.md`  |
| `FormHandle`, `getValue`, `setValue`, `reset`, `submit`, `focus`, `getAttachedFilesMap`, `Form.Render`, `Form.Input`, `Form.Label`, custom layout                                                                             | `knowledge/imperative-and-layout.md` |
| `FieldInput`, `fieldInputDefinitions`, `fieldInputMap`, `inputType`, custom input, `ChildFields`                                                                                                                              | `knowledge/field-input.md`           |
| JSONPointer paths, `..`, `.`, `*`, `~0`/`~1` escaping, `find`, `findNodes`                                                                                                                                                    | `knowledge/jsonpointer.md`           |
| `registerPlugin`, plugin development, AJV, Antd, MUI, custom validator                                                                                                                                                        | `knowledge/plugin-system.md`         |
| `injectTo`, value propagation, auto-populate, circular injection                                                                                                                                                              | `knowledge/inject-to.md`             |
| nullable object/array, `type: [..., 'null']`, `null` vs `{}`/`[]`, `setValue(null)`, null turns into an object, empty child fields, required key disappears                                                                   | `knowledge/nullable-branch-nodes.md` |
| `virtual`, `VirtualNode`, field grouping, date range                                                                                                                                                                          | `knowledge/virtual-schema.md`        |
| `FieldNodeEventType`, `subscribe`, `revision`, batching, `RequestRemount`, stale reads                                                                                                                                        | `knowledge/event-system.md`          |
| errors, not working, bug, debug, unexpected behavior, testing                                                                                                                                                                 | `knowledge/troubleshooting.md`       |

## Architecture Cheat Sheet

### Node System

- Terminal nodes: `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`. Branch nodes: `ObjectNode`, `ArrayNode` (each with a Branch or Terminal strategy). Special: `VirtualNode`.
- The JSON Schema is the contract; the node tree derives from it; the UI is a projection of the node tree.

### FieldInput Resolution Priority (highest → lowest)

1. `presentation.FieldInput` set directly on a schema node
2. `fieldInputMap` path mapping
3. `Form`-level `fieldInputDefinitions`
4. `FormProvider`-level `fieldInputDefinitions`
5. Plugin-provided `fieldInputDefinitions`

### JSONPointer Extensions by Context

| Syntax             | controls expressions | `node.find()`                  | `fieldInputMap` |
| ------------------ | -------------------- | ------------------------------ | --------------- |
| Absolute `/a/b`    | ✓                    | ✓                              | ✓               |
| Relative `..`, `.` | ✓                    | ✓                              | ✗               |
| Wildcard `*`       | ✗                    | ✗ (plural `findNodes` ✓)       | ✓               |
| Context `@`        | ✓                    | bare `'@'` only → context node | ✗               |

### Controls

Keys of the `controls` object (closed list, no aliases; an unknown key throws a schema error (recognized by `isJSONSchemaError`) with code `UNKNOWN_GROUP_KEY` when the blueprint is built): `active` | `visible` | `readOnly` | `disabled` | `default` | `derived` | `unsetValue` | `resetInteraction` | `unsetOnInactive` | `fields` | `injectTo` | `discriminator` | `watch` (array of paths). Inside `controls.fields[].controls` and on fragment `controls` (`oneOf`/`anyOf`/`allOf` branches, `then`, `else`), only the first nine are allowed; the other four throw.

**active vs visible** — `active: false` removes the value from form data; `visible: false` hides UI but keeps the value. Full decision table: `knowledge/expressions.md`.

### ValidationMode

`ValidationMode.None | OnChange | OnRequest` — bit flags, combinable: `OnChange | OnRequest`.

### Available Plugins

Validators: `@canard/schema-form-ajv8-plugin`, `-ajv7-`, `-ajv6-`. UI: `@canard/schema-form-antd5-plugin`, `-antd6-`, `-antd-mobile-`, `-mui-`. Register via `registerPlugin()` before first render, UI before validator.

## Reference Map

| Resource                              | Path                                            |
| ------------------------------------- | ----------------------------------------------- |
| Full specification                    | `docs/en/SPECIFICATION.md` (Korean: `docs/ko/`) |
| Quick reference (Korean, table-first) | `docs/QUICK_REFERENCE.md`                       |
| API shapes (authoritative)            | `dist/index.d.ts`                               |
| Storybook examples                    | `stories/*.stories.tsx` (repository)            |
