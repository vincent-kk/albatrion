
# InjectTo Skill

Expert skill for the injectTo feature of @canard/schema-form.

## Skill Info

- **Name**: inject-to
- **Purpose**: Guide for value injection between fields using injectTo
- **Triggers**: Questions about injectTo, field value propagation, automatic value setting

## injectTo vs derived Selection Guide

### Comparison Table

| Characteristic | injectTo | derived |
|----------------|----------|---------|
| **Direction** | Source → Target | Dependencies → Current Field |
| **Trigger** | On source value change | On dependency value change |
| **User Modification** | Target field **can be modified** | Auto-calculated, **overwrites** changes |
| **Value Sync** | One-time (independent after injection) | Continuous (always calculated) |
| **Use Case** | Initial value copy, default value setting | Automatic derived value calculation |

### Decision Tree

```
I want to set a value based on another field's value
    │
    ├─ Should the user be able to modify it after setting?
    │      │
    │      ├─ YES → Use injectTo
    │      │   Example: name input → auto-copy to nickname (nickname can be edited later)
    │      │
    │      └─ NO → Use derived
    │          Example: price × quantity = total (total is always calculated)
    │
```

### Example Comparison

```typescript
// injectTo: Copy once, then independent
name: {
  type: 'string',
  injectTo: (value) => ({ '../nickname': value }),  // Copy to nickname on name input
}
// nickname can be freely modified by user afterwards

// derived: Always calculated
totalPrice: {
  type: 'number',
  '&derived': '(../price ?? 0) * (../quantity ?? 1)',  // price × quantity
}
// totalPrice is recalculated even if user modifies it
```

## Path Types

### Relative Path (Sibling Fields)

```typescript
// Based on stories/39.InjectTo.stories.tsx
const schema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({
        '../target': `injected: ${value}`,  // Inject to sibling field
      }),
    },
    target: {
      type: 'string',
    },
  },
};
```

### Absolute Path (Root-based)

```typescript
const schema = {
  type: 'object',
  properties: {
    rootTarget: {
      type: 'string',
    },
    nested: {
      type: 'object',
      properties: {
        deep: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              injectTo: (value: string) => ({
                '/rootTarget': `from-deep: ${value}`,  // Inject to root field via absolute path
              }),
            },
          },
        },
      },
    },
  },
};
```

## Circular Reference Prevention

Schema Form automatically detects and blocks circular references.

### Direct Cycle (A ↔ B)

```typescript
const schema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldB': `fromA: ${value}`,
      }),
    },
    fieldB: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldA': `fromB: ${value}`,  // Circular reference automatically blocked
      }),
    },
  },
};

// When Field A is input:
// 1. A → B value injection
// 2. B attempts to inject to A → Blocked as circular reference
```

### Triangle Cycle (A → B → C → A)

```typescript
const schema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldB': `A→B: ${value}`,
      }),
    },
    fieldB: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldC': `B→C: ${value}`,
      }),
    },
    fieldC: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldA': `C→A: ${value}`,  // Circular reference automatically blocked
      }),
    },
  },
};

// When Field A is input:
// 1. A → B injection succeeds
// 2. B → C injection succeeds
// 3. C → A injection attempt → Blocked as circular reference
```

## Conditional Injection

You can use conditional logic within injection functions.

```typescript
const schema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => {
        // Conditional injection
        if (value.length > 5) {
          return {
            '../longTarget': value,
          };
        }
        return {
          '../shortTarget': value,
        };
      },
    },
    shortTarget: { type: 'string' },
    longTarget: { type: 'string' },
  },
};
```

## Object/Array Injection

Complex data types can also be injected.

```typescript
const schema = {
  type: 'object',
  properties: {
    template: {
      type: 'string',
      enum: ['basic', 'advanced'],
      injectTo: (value: string) => ({
        '../config': value === 'basic'
          ? { level: 1, features: [] }
          : { level: 2, features: ['a', 'b', 'c'] },
      }),
    },
    config: {
      type: 'object',
      properties: {
        level: { type: 'number' },
        features: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
};
```

## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Related story: `stories/39.InjectTo.stories.tsx`
- Test code: `src/core/__tests__/AbstractNode.injectTo.test.ts`
