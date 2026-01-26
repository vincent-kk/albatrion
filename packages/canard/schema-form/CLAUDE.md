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

   - Direct `FormTypeInput` property in JSON Schema
   - `formTypeInputMap` path mapping
   - Form-level `formTypeInputDefinitions`
   - FormProvider `formTypeInputDefinitions`
   - Plugin-provided definitions

2. **Test Functions**: Components are selected based on test conditions matching schema properties

### JSONPointer Extensions

Standard JSONPointer (RFC 6901) with custom extensions:

- `..` - Parent navigation (computed properties only)
- `.` - Current node reference
- `*` - Wildcard for any segment (FormTypeInputMap only)

### Event System and Node Communication

- **Event Cascade**: Nodes use an event cascade system for propagating changes through the tree
- **Subscription System**: Components can subscribe to node changes using `useSchemaNodeSubscribe`
- **Node State Management**: Each node maintains its own state flags (dirty, touched, validated)
- **Validation Modes**: Supports OnChange, OnRequest, and None validation modes

#### EventCascade Batching Mechanism

**Core Behavior:**
- Each `AbstractNode` has its own `EventCascade` instance for event batching
- Events are merged using microtask queue to prevent recursive triggering
- Batch reuse condition: `if (batch && !batch.resolved) return batch`
- New batches are created with `{ eventEntities: [] }` where `resolved` is `undefined` initially

**Batch Lifecycle:**
```typescript
// Synchronous stack: resolved = undefined → events merged into same batch
schedule(UpdateValue);
schedule(RequestRefresh);
// Both events go to same batch

// Microtask execution:
scheduleMicrotask(() => {
  nextBatch.resolved = true;  // Set at start of microtask
  this.__batchHandler__(mergeEvents(nextBatch.eventEntities));
  // During listener execution:
  //   - if listener calls schedule(), resolved = true → new batch created
});
```

**SetValueOption.Isolate Effect:**
- `SetValueOption.Overwrite` includes `Isolate` option (used by default in `setValue()`)
- When `Isolate` is set, `BranchStrategy.__handleEmitChange__()` calls `updateComputedProperties()` **synchronously** before `publish(UpdateValue)`
- This causes `UpdateComputedProperties` to be scheduled in the **same batch** as `UpdateValue` and `RequestRefresh` in synchronous stack
- Result: `UpdateValue | RequestRefresh | UpdateComputedProperties` merge into a single event

**Important Note on Test Behavior:**
- Test cases that call `objectNode.setValue()` directly use `Overwrite` option (includes `Isolate`)
- This creates synchronous `updateComputedProperties()` call, merging all events into one batch
- In real user scenarios, child nodes trigger parent updates differently, so test behavior may not represent typical usage patterns
- When modifying event timing (e.g., adding `immediate` flag), be aware that it may break `Isolate` option's synchronous merging behavior

## Core Specification (Validated by Tests)

This section documents the **core behavioral specifications** of Schema Form, as validated by 341+ tests in `src/core/__tests__/`. These specifications serve as the source of truth for the system's behavior and can be used as the foundation for user documentation.

### 1. Node System Fundamentals

#### Node Types and Responsibilities

**Terminal Nodes** (Primitive values):
- `StringNode`: String values with format validation (email, date, etc.)
- `NumberNode`: Numeric values with min/max constraints, integer enforcement
- `BooleanNode`: Boolean values with true/false states
- `NullNode`: Explicit null values

**Branch Nodes** (Container structures):
- `ObjectNode`: Key-value structures with nested properties
  - Strategy: `BranchStrategy` (complex) or `TerminalStrategy` (simple)
  - Supports: `required`, `additionalProperties`, `minProperties`, `maxProperties`
- `ArrayNode`: Ordered collections of items
  - Strategy: `BranchStrategy` (complex items) or `TerminalStrategy` (primitive items)
  - Supports: `minItems`, `maxItems`, array manipulation methods (`push`, `remove`, `clear`)

**Special Nodes**:
- `VirtualNode`: Non-schema nodes for conditional fields and computed values

#### Node Initialization

```typescript
const node = nodeFromJsonSchema({
  jsonSchema: { type: 'object', properties: { name: { type: 'string' } } },
  onChange: (value) => console.log('Form value changed:', value)
});

await delay(); // Wait for initialization to complete
```

**Initialization guarantees:**
1. All nodes fire `Initialized` event upon creation
2. Default values are applied during initialization
3. `minItems` arrays are auto-populated with default items
4. Computed properties are evaluated after initialization
5. Initial validation runs based on `validationMode` setting

---

### 2. Value Management

#### Setting Values

**Direct parent setValue** (API data, form initialization):
```typescript
objectNode.setValue({ name: 'Alice', age: 25 });
// ↓ Effects:
// 1. Synchronously calls updateComputedProperties() (Isolate option)
// 2. Fires UpdateValue event (synchronous after initialization)
// 3. Fires RequestRefresh | UpdateComputedProperties (async, merged)
// 4. Event option: { settled: false } (indicates synchronous computed properties)
```

**Child node setValue** (user input, real usage):
```typescript
nameNode.setValue('Alice');
// ↓ Effects:
// 1. Child fires UpdateValue event (synchronous after initialization)
// 2. Parent receives child change notification
// 3. Parent fires UpdateValue event with { settled: true }
// 4. Dependent computed properties update asynchronously
// 5. Sibling nodes with dependencies receive UpdateComputedProperties
```

**Key difference:**
- **Parent direct**: `settled: false` (Isolate mode, synchronous computed properties)
- **Child trigger**: `settled: true` (normal mode, asynchronous computed properties)

#### Getting Values

```typescript
node.value           // Current form value
node.enhancedValue   // Includes virtual/computed fields for validation
```

**Value propagation rules:**
1. Child changes propagate to all ancestor nodes
2. Parent `value` reflects current state of all children
3. Deep nested changes bubble up through all levels
4. Multiple simultaneous changes batch in same synchronous stack

---

### 3. Event System

#### Event Types

```typescript
enum NodeEventType {
  // Lifecycle
  Initialized,              // Node created and initialized

  // Value & State
  UpdateValue,              // Value changed
  UpdateState,              // Node state changed (touched, dirty, etc.)
  UpdateError,              // Validation errors changed
  UpdateComputedProperties, // Computed properties need recalculation
  UpdateChildren,           // Array/Object children changed
  UpdatePath,               // Node path changed (e.g., array item reordering)

  // UI Sync
  RequestRefresh,           // Sync uncontrolled component's defaultValue with UI (internal)
  RequestRemount,           // Force full component remount (external API)

  // System
  RequestEmitChange,        // Request onChange callback
  RequestInjection,         // Request injection propagation
}
```

> **Note**: `RequestRefresh` vs `RequestRemount`:
> - `RequestRefresh`: 내부 시스템에서 사용, 비제어 컴포넌트의 `defaultValue`를 UI와 동기화
> - `RequestRemount`: 외부 API, 사용자가 `node.publish(NodeEventType.RequestRemount)`로 직접 호출

#### Event Timing (After Initialization)

**Synchronous Events** (immediate dispatch):
- `UpdateValue` - fires immediately when `setValue()` is called
- Bypasses EventCascade batching via `immediate` flag

**Asynchronous Events** (batched in microtask):
- `RequestRefresh` - batched with other events
- `UpdateComputedProperties` - batched with other events
- `UpdateChildren` - batched with other events

**Event sequence example:**
```typescript
// User types in name field
nameNode.setValue('Alice');

// Microtask 0 (synchronous):
//   - nameNode fires UpdateValue (immediate)
//   - objectNode receives notification

// Microtask 1 (async):
//   - objectNode fires UpdateValue (batched)
//   - objectNode fires RequestRefresh (batched, merged)
//   - Dependent nodes fire UpdateComputedProperties (batched, merged)
```

#### Event Batching

**Batching rules:**
1. Events scheduled in same synchronous stack merge into one batch
2. Each node has its own EventCascade instance (parent and children separate)
3. Batch lifecycle: `resolved=undefined` (accumulating) → `resolved=true` (executing)
4. Events during batch execution create new batches

**Performance characteristics:**
- **Master branch issue**: Child changes require 2 microtasks for computed properties
- **Current branch (feature/issue-275)**: Child changes require 1 microtask (50% improvement)
- Synchronous UpdateValue enables immediate UI feedback after initialization

---

### 4. Computed Properties

#### Types of Computed Properties

```typescript
{
  type: 'string',
  computed: {
    visible: '../category === "premium"',     // Visibility control
    active: '../price > 0',                   // Active/inactive state
    readOnly: '../locked === true',           // Read-only state
    disabled: '../status === "archived"',     // Disabled state
    watch: ['../category', '../price'],       // Explicit dependencies
  }
}
```

#### Dependency Resolution

**Automatic dependencies:**
- Computed expressions are parsed for JSONPointer references
- Dependencies are automatically tracked
- Changes to dependency trigger re-evaluation

**Manual dependencies:**
- Use `computed.watch` array for complex dependencies
- Supports parent navigation (`..`), current node (`.`)
- Array length access: `../items.length`

**Update timing:**
```typescript
categoryNode.setValue('premium');
// ↓
// Microtask 1: UpdateValue (synchronous)
// Microtask 2: premiumFeatureNode.visible updates (async)
```

#### Sibling Reactivity

```typescript
{
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    dependent: {
      type: 'string',
      computed: { visible: '../toggle === true' }
    }
  }
}

// User interaction:
toggleNode.setValue(true);
// ↓ Result:
dependentNode.visible === true  // Sibling updated
```

---

### 5. Validation System

#### Validation Modes

```typescript
enum ValidationMode {
  OnChange,    // Validate on every value change
  OnRequest,   // Validate only when explicitly requested
  None,        // No automatic validation
}
```

#### Validation Behavior

**Field-level validation:**
```typescript
node.validate();              // Returns validation errors for this node
node.errors;                  // Current validation errors
node.validated;               // Whether node has been validated
```

**Form-level validation:**
```typescript
rootNode.validate();          // Validates entire form tree
rootNode.enhancedValue;       // Value used for validation (includes virtual fields)
```

**Validation timing:**
- `OnChange` mode: Validates after every `setValue()`
- `OnRequest` mode: Validates only when `validate()` is called
- Errors propagate up the tree to root node
- Individual node errors accessible via `node.errors`

#### Enhanced Value for Validation

**Purpose:** Include virtual/computed fields in validation

```typescript
// Schema with virtual fields
{
  type: 'object',
  properties: {
    userType: { type: 'string', enum: ['student', 'teacher'] }
  },
  oneOf: [
    {
      '&if': "./userType === 'student'",
      properties: {
        studentId: { type: 'string', pattern: '^STU[0-9]+$' }
      }
    }
  ]
}

// When userType='student':
node.value          // { userType: 'student' }
node.enhancedValue  // { userType: 'student', studentId: 'STU123' }
```

**Validation uses `enhancedValue`** to validate conditional/virtual fields that don't exist in base value.

---

### 6. Schema Composition

#### Conditional Schemas

**if-then-else:**
```typescript
{
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['game', 'movie'] }
  },
  if: {
    properties: { category: { enum: ['movie'] } }
  },
  then: {
    properties: { openingDate: { type: 'string', format: 'date' } }
  },
  else: {
    properties: { releaseDate: { type: 'string', format: 'date' } }
  }
}
```

**oneOf (exclusive choice):**
```typescript
{
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'] }
  },
  oneOf: [
    {
      '&if': "./type === 'A'",
      properties: { fieldA: { type: 'string' } }
    },
    {
      '&if': "./type === 'B'",
      properties: { fieldB: { type: 'string' } }
    }
  ]
}
```

**anyOf (non-exclusive choice):**
```typescript
{
  type: 'object',
  properties: {
    flag1: { type: 'boolean' },
    flag2: { type: 'boolean' }
  },
  anyOf: [
    {
      '&if': './flag1 === true',
      properties: { field1: { type: 'string' } }
    },
    {
      '&if': './flag2 === true',
      properties: { field2: { type: 'string' } }
    }
  ]
}
```

**allOf (composition):**
```typescript
{
  type: 'object',
  allOf: [
    { properties: { firstName: { type: 'string' } } },
    { properties: { lastName: { type: 'string' } } },
    { required: ['firstName', 'lastName'] }
  ]
}
```

#### Conditional Schema Guarantees

**Event stability:**
1. No event loops when conditions change rapidly
2. Computed properties update in first microtask cycle
3. Event order maintained across schema switches
4. Proper batching across conditional branches

**Performance:**
- Schema condition changes complete within reasonable time (< 50ms for simple cases)
- No memory leaks through conditional field creation/destruction

#### Conditional Schema setValue Behavior

Schema Form automatically removes fields that don't match oneOf/anyOf conditions when `setValue()` is called. However, the behavior differs significantly between parent and child `setValue()` calls.

**Parent setValue (filtering enabled):**
```typescript
// Category is 'movie', price field doesn't match oneOf condition
objectNode.setValue({ category: 'movie', price: 200 });
await delay();

objectNode.value; // { category: 'movie' }
// price is automatically removed because oneOf condition not met
```

**Child setValue (filtering bypassed):**
```typescript
const priceNode = objectNode.find('./price') as NumberNode;

// Even when category is 'movie', child setValue propagates the value
priceNode.setValue(999);
await delay();

objectNode.value; // { category: 'movie', price: 999 }
// price appears because child updates bypass conditional filtering
```

**Key differences:**
1. **Parent setValue**: Applies conditional filtering, removes non-matching fields
2. **Child setValue**: Bypasses filtering, value propagates regardless of conditions
3. **Node existence**: Conditional field nodes exist in tree even when conditions don't match
4. **Re-filtering**: Subsequent parent `setValue()` will re-apply filtering

**Partial updates:**
```typescript
// Set with multiple fields
node.setValue({ category: 'game', price: 100, platform: 'PC' });

// Partial update - only change category
node.setValue({ category: 'movie' });
await delay();

// All conditional fields are removed (price, platform)
node.value; // { category: 'movie' }
```

**Cascading behavior:**
```typescript
{
  oneOf: [
    { '&if': "./levelA === 'A1'", properties: { levelB: {...} } }
  ],
  anyOf: [
    { '&if': "./levelB === 'B1'", properties: { levelC: {...} } }
  ]
}

// oneOf removes levelB, but levelC is NOT automatically removed
node.setValue({ levelA: 'A2', levelB: 'B1', levelC: 'value' });
await delay();

node.value; // { levelA: 'A2', levelC: 'value' }
// levelB removed by oneOf, levelC remains (anyOf evaluated independently)

// To remove levelC, explicitly omit it or change its dependency
node.setValue({ levelA: 'A2' });
await delay();

node.value; // { levelA: 'A2' }
// Now levelC is removed by explicit omission
```

**Testing coverage:**
- Validated by 11 tests in `src/core/__tests__/ConditionalSchema.setValue.test.ts`
- Tests cover: shallow/nested/deep levels, multiple fields, oneOf/anyOf/combined, edge cases
- Edge cases: child node modification, partial updates, cascading removals, sync/async timing

---

### 7. Array Operations

#### Array Manipulation Methods

```typescript
const arrayNode = node.find('./items') as ArrayNode;

arrayNode.push();              // Add item with default value
arrayNode.push('custom');      // Add item with custom value
arrayNode.remove(index);       // Remove item at index
arrayNode.clear();             // Remove all items

arrayNode.length;              // Current number of items
arrayNode.children;            // Array of child nodes
arrayNode.children[0]?.node;   // Access specific child node
```

**Constraints:**
- `minItems`: Auto-populate array with defaults during initialization
- `maxItems`: Prevent adding items beyond limit
- `push()` respects `maxItems`
- `clear()` respects `minItems` (may not fully clear)

#### Array Item Changes

**Primitive items:**
```typescript
const firstItem = arrayNode.children[0]?.node as StringNode;
firstItem.setValue('new value');
// ↓
// Parent arrayNode receives UpdateValue event
// arrayNode.value reflects change
```

**Object items:**
```typescript
const firstItem = arrayNode.children[0]?.node as ObjectNode;
const nameNode = firstItem.find('./name') as StringNode;
nameNode.setValue('Alice');
// ↓
// Propagates through: nameNode → objectItem → arrayNode → root
```

---

### 8. Node State Flags

#### State Properties

```typescript
node.dirty;        // Has value changed since initialization?
node.touched;      // Has user interacted with this field?
node.validated;    // Has validation been run?
node.errors;       // Current validation errors
node.visible;      // Is field visible? (computed property)
node.active;       // Is field active? (computed property)
node.readOnly;     // Is field read-only? (computed property)
node.disabled;     // Is field disabled? (computed property)
node.initialized;  // Has node completed initialization?
```

#### State Management

**Dirty tracking:**
```typescript
node.dirty === false;  // Initial state
node.setValue('value');
node.dirty === true;   // After change
```

**Touched tracking:**
```typescript
node.touched === false;  // Initial state
// User interaction (component-specific)
node.touched === true;   // After interaction
```

**Reset behavior:**
```typescript
node.setValue(initialValue);
node.dirty === false;    // Dirty flag resets to initial value
```

---

### 9. JSONPointer Navigation

#### Standard JSONPointer (RFC 6901)

```typescript
node.find('/path/to/field');     // Absolute path from root
node.find('./childField');       // Relative path from current node
node.find('../siblingField');    // Parent navigation (computed properties only)
```

#### Extended Syntax

**Parent navigation (`..`)**:
- Available in: computed property expressions
- Not available in: general `node.find()` calls
```typescript
computed: {
  visible: '../parentField === "value"'  // ✅ Valid
}
```

**Current node (`.`)**:
- Reference to current node in conditional schemas
```typescript
'&if': "./type === 'A'"  // ✅ Valid
```

**Wildcard (`*`)**:
- Available in: FormTypeInputMap only
- Matches any segment (array indices or dynamic object keys)
```typescript
formTypeInputMap: {
  '/items/*/name': CustomNameInput,  // ✅ Array indices: /items/0/name, /items/1/name
  '/config/*/value': ConfigInput     // ✅ Object keys: /config/theme/value, /config/lang/value
}
```

#### Path Escaping

**Special characters in keys:**
```typescript
// Keys with slashes, tildes
{ 'path/to/key': 'value', '~tilde': 'value' }

// Escaped paths
node.find('/path~1to~1key');  // Finds 'path/to/key'
node.find('/~0tilde');        // Finds '~tilde'
```

**Escaping rules:**
- `/` → `~1`
- `~` → `~0`

---

### 10. Performance Characteristics

#### Event Timing Improvements

**Master branch (before feature/issue-275):**
```
title.setValue('wow')
  ↓ Microtask 1: title UpdateValue
  ↓ Microtask 2: computed properties UpdateComputedProperties
Total: 2 microtasks
```

**Current branch (feature/issue-275):**
```
title.setValue('wow')
  ↓ Microtask 0 (sync): title UpdateValue (immediate)
  ↓ Microtask 1: computed properties UpdateComputedProperties
Total: 1 microtask (50% improvement)
```

#### Memory Management

**Subscription cleanup:**
```typescript
const unsubscribe = node.subscribe((event) => {
  console.log('Event:', event);
});

// Must unsubscribe to prevent memory leaks
unsubscribe();
```

**Memory leak prevention:**
- All subscriptions return cleanup function
- Unsubscribed listeners are not called
- Node tree can be garbage collected after unsubscribing all listeners

#### Validation Performance

**Modes for optimization:**
- `OnChange`: Best for real-time feedback, higher CPU usage
- `OnRequest`: Best for performance, validate only on submit
- `None`: No validation overhead

---

### 11. Test Coverage Summary

**Total tests:** 352 passing tests across 35 test files

**Test categories:**
1. **Node functionality** (80+ tests)
   - Value setting, getting, defaults
   - Type-specific behavior (string, number, boolean, array, object)
   - Nullable node handling

2. **Event system** (60+ tests)
   - Event timing and order
   - Event batching and merging
   - Child-to-parent propagation
   - Conditional schema event stability

3. **Computed properties** (40+ tests)
   - Dependency tracking
   - Sibling reactivity
   - Complex expressions

4. **Validation** (50+ tests)
   - Field-level validation
   - Form-level validation
   - Enhanced value validation
   - Conditional field validation

5. **Schema composition** (51+ tests)
   - oneOf, anyOf, allOf
   - if-then-else
   - Nested conditions
   - **Conditional setValue behavior** (11 tests)
     - Parent vs child setValue filtering
     - Shallow, nested, deep levels
     - Partial updates and cascading
     - Edge cases and timing

6. **Array operations** (30+ tests)
   - Push, remove, clear
   - Item changes
   - Nested arrays

7. **Edge cases** (40+ tests)
   - JSONPointer escaping
   - Deep nesting
   - Performance bounds
   - Memory leak prevention

---

## Testing Guidelines

- Unit tests use Vitest and are located in `__tests__` directories
- Test files follow the pattern `*.test.ts` or `*.test.tsx`
- Run specific tests: `yarn test path/to/test`
- Coverage reports are generated in the `coverage/` directory
- Storybook stories in `/coverage` serve as comprehensive integration tests
- Test environment is configured for jsdom with React Testing Library

**Key test principles:**
1. Tests validate specifications, not implementation details
2. Real user scenarios (child node changes) are prioritized over artificial scenarios (direct parent setValue)
3. Event assertions check behavior (value updates, visibility changes) rather than exact event combinations
4. Performance bounds are enforced (< 50ms for simple operations)

## Key Dependencies

- **React 18-19**: Core UI framework (peer dependency)
- **@winglet/\***: Internal workspace packages for utilities
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
2. **Adding FormTypeInputs**: Define test conditions carefully to avoid conflicts. Test functions receive `{ jsonSchema, type, format, formType, path, nullable }` hint object
3. **Plugin Development**: Follow the `SchemaFormPlugin` interface in `src/app/plugin/type.ts`. Plugins can provide FormTypeInputs, validators, and form renderers
4. **Performance**: Use memoization for expensive computations, especially in computed properties. Consider validation modes to optimize performance
5. **Type Safety**: Leverage TypeScript's type inference with `InferValueType` and `InferSchemaNode` for schema-based type checking
6. **Computed Properties**: Use `computed.watch` with JSONPointer paths to create reactive form logic
7. **Form Submission**: Use `useFormSubmit` hook for managing submission state with loading indicators
8. **Virtual Nodes**: Handle non-schema nodes with `VirtualNode` for conditional fields and computed values
9. **Error Handling**: Implement custom error formatting with `formatError` function or use built-in multilingual support in JSON Schema
10. **Custom Layouts**: Use `Form.Render` with JSONPointer paths for building custom form layouts outside the default structure

## Class Member Ordering Convention

All classes in this project follow a **Domain-First** ordering approach. Members are grouped by functional domain rather than by access modifiers.

### Ordering Principles

1. **Domain Cohesion**: Related functionality is grouped together regardless of access modifiers
2. **Within Each Domain**: `private fields` → `protected methods` → `public getters/setters` → `public methods`
3. **Constructor Position**: Always placed at the bottom of the class
4. **No Section Comments**: Do not add separator comments between sections

### Standard Domain Order

For node classes (AbstractNode, StringNode, ObjectNode, etc.):

```
1. Identity (type, schemaType, jsonSchema, required, nullable)
2. Tree Structure (depth, isRoot, parentNode, children, name, path)
3. Value Management (defaultValue, value, setValue, onChange)
4. Computed Properties (active, visible, enabled, readOnly, disabled)
5. State Management (state, globalState, setState)
6. Validation & Errors (errors, globalErrors, validate, setErrors)
7. Events (publish, subscribe, saveUnsubscribe)
8. Injection (injection guards, handlers)
9. Lifecycle (initialized, __initialize__, __cleanUp__, __reset__)
10. Constructor
```

For strategy classes (BranchStrategy, TerminalStrategy):

```
1. Host & Dependencies (private references)
2. Internal State (flags, caches)
3. Value Management (value getter, applyValue)
4. Children Management (children getter, child operations)
5. Composition Operations (push, remove, clear, update)
6. Lifecycle (initialize)
7. Constructor
```

For manager classes (EventCascadeManager, ValidationManager, etc.):

```
1. Internal State (private fields)
2. Core Operations (primary public methods)
3. Helper Methods (private/protected utilities)
4. Lifecycle (cleanup methods)
5. Constructor
```

### Example

```typescript
class ExampleNode {
  // 1. Identity
  public readonly type = 'example';
  private readonly __schema__: JsonSchema;

  // 2. Tree Structure
  public readonly parentNode: AbstractNode | null;
  private __name__: string;
  public get name() { return this.__name__; }

  // 3. Value Management
  private __value__: string;
  public get value() { return this.__value__; }
  public setValue(value: string) { /* ... */ }

  // 4. Computed Properties
  public get visible() { return this.__computeManager__.visible; }

  // 5. State Management
  private __state__: NodeState;
  public get state() { return this.__state__; }

  // 6. Validation & Errors
  private __errorManager__: ValidationErrorManager;
  public get errors() { return this.__errorManager__.mergedLocalErrors; }

  // 7. Events
  public subscribe(listener: NodeListener) { /* ... */ }

  // 8. Lifecycle
  private __initialized__ = false;
  public get initialized() { return this.__initialized__; }

  // 9. Constructor (always at the bottom)
  constructor(options: NodeOptions) {
    // initialization logic
  }
}
```

## JSDoc Convention

All classes and methods in this project follow a consistent JSDoc documentation style.

### Tag Usage

| Tag | Usage |
|-----|-------|
| `@internal` | Private fields and internal methods not part of public API |
| `@remarks` | Additional context, notes, or implementation details |
| `@param` | Parameter description with format `@param name - Description` |
| `@returns` | Return value description (omit type, TypeScript handles it) |
| `@example` | Code examples for public API methods |

### Documentation Patterns

**Private fields**: Use `@internal` tag with brief description
```typescript
/** @internal Storage for node's name. */
private __name__: string;
```

**Public getters**: Direct description with `@remarks` for additional context
```typescript
/**
 * Node's name (property key or array index).
 * @remarks Readonly externally, but can be changed via `__setName__` by the parent node.
 */
public get name() {
  return this.__name__;
}
```

**Internal methods**: `@internal` tag with description and parameters
```typescript
/**
 * Sets the node's name.
 * @param name - The new name to set
 * @param actor - The node requesting the change (must be parent or self)
 * @internal Only the parent node or self can change the name.
 */
protected __setName__(name: string, actor: SchemaNode) { /* ... */ }
```

**Public methods**: Full documentation with examples for complex APIs
```typescript
/**
 * Sets the node's value with configurable update behavior.
 * @param input - The value to set, or a function receiving the previous value
 * @param option - Bitwise options (default: `Overwrite`)
 * @example
 * ```ts
 * node.setValue('new value');
 * node.setValue(prev => prev + ' updated');
 * node.setValue({ key: 'value' }, SetValueOption.Merge);
 * ```
 */
public setValue(input: Value | Fn, option?: UnionSetValueOption): void { /* ... */ }
```

### Style Guidelines

1. **Concise descriptions**: One sentence or short phrase for the main description
2. **No redundant types**: Don't repeat TypeScript types in `@returns` or `@param`
3. **Use backticks**: Wrap code references like `oneOf`, `setValue()`, `true`/`false` in backticks
4. **Avoid `@note`**: Use standard `@remarks` instead
5. **No section separators**: Do not add `/* ═══════ */` style section comments
6. **Examples for public API**: Add `@example` blocks for complex public methods

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

### Nullable Schema Support

The library supports JSON Schema's array type syntax for nullable fields:

```typescript
// Nullable field using array syntax
const schema = {
  type: 'object',
  properties: {
    // Required field (non-nullable)
    name: { type: 'string' },

    // Optional field (nullable) - use as const for type inference
    nickname: { type: ['string', 'null'] as const },

    // Nullable number
    age: { type: ['number', 'null'] as const },
  },
};
```

**FormTypeInput with nullable conditions:**

```typescript
const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // Match nullable string fields
  {
    test: { type: 'string', nullable: true },
    component: NullableStringInput,
  },
  // Match non-nullable string fields
  {
    test: { type: 'string', nullable: false },
    component: RequiredStringInput,
  },
  // Match all string fields (regardless of nullable)
  {
    test: { type: 'string' },
    component: StringInput,
  },
];
```

**Accessing nullable info in FormTypeInput components:**

```typescript
const MyFormTypeInput: FC<FormTypeInputProps> = ({
  value,
  onChange,
  type,      // 'string', 'number', 'boolean', 'array', 'object'
  nullable,  // true if field accepts null
}) => {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || (nullable ? null : ''))}
      placeholder={nullable ? 'Optional' : 'Required'}
    />
  );
};
```

**Type inference with nullable schemas:**

```typescript
import { InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    nickname: { type: ['string', 'null'] as const },
  },
} as const;

// Type: { name: string; nickname: string | null }
type FormValue = InferValueType<typeof schema>;
```

**Schema filter utilities:**

```typescript
import {
  isStringSchema,           // Matches both nullable and non-nullable
  isNullableStringSchema,   // Matches only { type: ['string', 'null'] }
  isNonNullableStringSchema,// Matches only { type: 'string' }
  hasNullInType,            // Checks if type array contains 'null'
  isSameSchemaType,         // Type comparison (ignores null in array)
} from '@winglet/json-schema';

// Usage
isStringSchema({ type: 'string' });           // true
isStringSchema({ type: ['string', 'null'] }); // true
isNullableStringSchema({ type: ['string', 'null'] }); // true
isNonNullableStringSchema({ type: 'string' }); // true
hasNullInType({ type: ['string', 'null'] });  // true
isSameSchemaType({ type: ['number', 'null'] }, 'number'); // true
```
