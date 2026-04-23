
# Computed Properties Skill

Expert skill for Computed Properties features in @canard/schema-form.

## Skill Info

- **Name**: computed-properties
- **Purpose**: Q&A and implementation guide for Computed Properties
- **Triggers**: computed, watch, active, visible, readOnly, disabled, pristine, derived related questions


## Basic Syntax

### Using computed Object

```typescript
const schema = {
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    conditionalField: {
      type: 'string',
      computed: {
        visible: '../toggle === true',
        watch: '../toggle',
      },
    },
  },
};
```

### Shorthand Syntax (Alias Syntax)

```typescript
const schema = {
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    conditionalField: {
      type: 'string',
      '&visible': '../toggle === true',  // Same as computed.visible
    },
  },
};
```

Supported aliases: `&active`, `&visible`, `&readOnly`, `&disabled`, `&pristine`, `&derived`


## active vs visible

### active

When `false`, **value is removed from form data**.

```typescript
const schema = {
  type: 'object',
  properties: {
    hasDiscount: { type: 'boolean', default: false },
    discountRate: {
      type: 'number',
      computed: {
        active: '../hasDiscount === true',
      },
    },
  },
};

// hasDiscount = false → { hasDiscount: false }
// hasDiscount = true  → { hasDiscount: true, discountRate: 10 }
```

### visible

When `false`, **hidden in UI only but value is retained**.

```typescript
const schema = {
  type: 'object',
  properties: {
    showDetails: { type: 'boolean', default: false },
    secretField: {
      type: 'string',
      default: 'hidden-value',
      computed: {
        visible: '../showDetails === true',
      },
    },
  },
};

// showDetails = false → { showDetails: false, secretField: 'hidden-value' }
// showDetails = true  → { showDetails: true, secretField: 'hidden-value' }
```

### Selection Guide: active vs visible

**Decision Flow:**

```
Want to conditionally hide a field
    │
    ├─ Should the value also be removed when hidden?
    │      │
    │      ├─ YES → Use active
    │      │   e.g., Remove discount rate field and value when discount option unchecked
    │      │
    │      └─ NO → Use visible
    │          e.g., Advanced settings toggle, keep existing settings when hidden
    │
```

| Situation | Choice | Reason |
|------|------|------|
| Conditional fields (discount rate, additional options) | `active` | Data unnecessary when condition not met |
| Step-by-step forms (Step 1 → Step 2) | `visible` | Need to retain previous step data |
| Permission-based field hiding | `active` | Data should not exist without permission |
| Collapsible UI | `visible` | Keep data when collapsed |
| Payment method specific fields | `active` | Remove previous input when different payment method selected |
| Preview mode | `visible` | Display read-only, retain data |


## Important Notes

### 1. Prevent Circular References

```typescript
// ❌ Wrong example - circular reference
const badSchema = {
  properties: {
    a: { computed: { derived: '../b' } },
    b: { computed: { derived: '../a' } },
  },
};
```

### 2. pristine Behavior Characteristics

- `pristine` **does not change values**, only resets state (dirty, touched)
- State continues to reset while expression is `true`, so toggle approach is recommended

### 3. Expression Evaluation Timing

- Computed properties are evaluated when `UpdateComputedProperties` event occurs
- Processed asynchronously after value changes (microtask)
