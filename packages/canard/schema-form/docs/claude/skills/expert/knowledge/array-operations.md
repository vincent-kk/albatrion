# Array Operations Skill

Expert skill for array manipulation features in @canard/schema-form.

## Skill Info

- **Name**: array-operations
- **Purpose**: ArrayNode manipulation, array item management guide
- **Triggers**: array, push, remove, clear, minItems, maxItems, prefixItems related questions

---

## Overview

ArrayNode handles JSON Schema's array type and provides manipulation methods for adding/removing/clearing items.

---

## Array Schema Definition

### Basic Array

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
```

### Array with Constraints

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,      // Minimum 1 item required
      maxItems: 10,     // Maximum 10 items allowed
      default: ['initial value'],  // Default value
    },
  },
};
```

### Object Array

```typescript
const schema = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name'],
      },
      minItems: 1,
    },
  },
};
```

---

## Array Manipulation Methods

### Accessing ArrayNode

```typescript
import type { ArrayNode } from '@canard/schema-form';

// Access from FormHandle
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

// Access from FormTypeInput
const MyArrayInput: FC<FormTypeInputProps<string[]>> = ({ node }) => {
  const arrayNode = node as ArrayNode;
  // ...
};
```

### push() - Add Item

```typescript
// Add with default value
const newIndex = await arrayNode.push();

// Add with specific value
const newIndex = await arrayNode.push('new item');

// Add object item
const newIndex = await arrayNode.push({ name: 'John Doe', email: 'john@example.com' });
```

### remove() - Remove Item

```typescript
// Remove by index
await arrayNode.remove(0);  // Remove first item
await arrayNode.remove(2);  // Remove third item
```

### clear() - Remove All

```typescript
// Remove all items
await arrayNode.clear();

// Note: If minItems is set, that number of items will remain
// With minItems: 2, 2 items will exist after clear()
```

---

## Real-World Example

### Dynamic List Management

```typescript
// Based on stories/27.OptimizeArrayUsecase.stories.tsx
const schema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      FormTypeInput: ({ node, value }: FormTypeInputProps<number[]>) => {
        const handlePush = async () => {
          const newIndex = await node.push(Math.random() * 100);
          console.log('Added index:', newIndex);
        };

        const handleRemove = async (index: number) => {
          await node.remove(index);
        };

        const handleClear = () => {
          node.clear();
        };

        return (
          <div>
            <button onClick={handlePush}>Add Item</button>
            <button onClick={handleClear}>Clear All</button>

            {value?.map((item, index) => (
              <div key={index}>
                <span>{item}</span>
                <button onClick={() => handleRemove(index)}>Remove</button>
              </div>
            ))}
          </div>
        );
      },
      items: {
        type: 'number',
      },
    },
  },
};
```

### Accessing Array Properties

```typescript
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

// Current item count
console.log('Length:', arrayNode.length);

// Access child nodes
arrayNode.children.forEach((child, index) => {
  console.log(`Item ${index}:`, child.node.value);
});

// Access specific item node
const firstItem = arrayNode.children[0]?.node;
if (firstItem) {
  console.log('First item value:', firstItem.value);
}
```

---

## Terminal vs Branch Strategy

Arrays use different strategies based on item type.

### Terminal Strategy (Simple Types)

```typescript
// Automatically applied when items are primitive types
const schema = {
  type: 'array',
  items: {
    type: 'string',  // primitive → Terminal Strategy
  },
};

// Good performance and memory efficient
```

### Branch Strategy (Complex Types)

```typescript
// Automatically applied when items are object/array types
const schema = {
  type: 'array',
  items: {
    type: 'object',  // complex → Branch Strategy
    properties: {
      name: { type: 'string' },
    },
  },
};

// Creates node tree for each item
```

### Explicit Strategy Setting

```typescript
const schema = {
  type: 'array',
  terminal: false,  // Force Branch Strategy usage
  items: {
    type: 'string',
  },
};
```

---

## prefixItems (Tuples)

Apply different schemas to fixed positions.

```typescript
const schema = {
  type: 'object',
  properties: {
    coordinate: {
      type: 'array',
      prefixItems: [
        { type: 'number', title: 'X coordinate' },
        { type: 'number', title: 'Y coordinate' },
        { type: 'number', title: 'Z coordinate' },
      ],
      items: false,  // No additional items allowed
    },
  },
};

// Result: [x, y, z] tuple format
```

### prefixItems + items Combination

```typescript
const schema = {
  type: 'array',
  prefixItems: [
    { type: 'string', title: 'Name' },
    { type: 'number', title: 'Age' },
  ],
  items: {
    type: 'string',  // Remaining items are strings
  },
};

// Result: [string, number, ...string[]]
```

---

## Nullable Arrays

```typescript
const schema = {
  type: 'object',
  properties: {
    nullableArray: {
      type: ['array', 'null'],  // Array or null
      items: {
        type: 'string',
      },
    },
  },
};

// Valid values:
// - null
// - []
// - ['a', 'b', 'c']
```

---

## Conditional Schemas in Arrays

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['text', 'number', 'date'],
          },
        },
        oneOf: [
          {
            '&if': "./type === 'text'",
            properties: {
              content: { type: 'string' },
            },
          },
          {
            '&if': "./type === 'number'",
            properties: {
              value: { type: 'number' },
            },
          },
          {
            '&if': "./type === 'date'",
            properties: {
              date: { type: 'string', format: 'date' },
            },
          },
        ],
      },
    },
  },
};
```

---

## Array Rendering in FormTypeInput

### Using ChildNodeComponents

```typescript
const ArrayRenderer: FC<FormTypeInputProps<any[]>> = ({
  node,
  value,
  ChildNodeComponents,
}) => {
  const arrayNode = node as ArrayNode;

  return (
    <div>
      <button onClick={() => arrayNode.push()}>Add</button>

      {ChildNodeComponents.map((ChildNode, index) => (
        <div key={index} style={{ display: 'flex', gap: 8 }}>
          <ChildNode />
          <button onClick={() => arrayNode.remove(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
};
```

### Controlled Approach

```typescript
const ControlledArrayInput: FC<FormTypeInputProps<string[]>> = ({
  value,
  onChange,
}) => (
  <input
    type="text"
    value={value?.join(', ') ?? ''}
    onChange={(e) => onChange(e.target.value.split(', ').filter(Boolean))}
  />
);
```

---

## Performance Optimization

### Handling Bulk Items

```typescript
const BenchmarkArray: FC<FormTypeInputProps<number[]>> = ({ node }) => {
  const handleBenchmark = async () => {
    node.clear();

    // Batch add 100 items
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(node.push(i * 10));
    }
    await Promise.all(promises);
  };

  return <button onClick={handleBenchmark}>Add 100 Items</button>;
};
```

### Recommended Terminal Strategy

```typescript
// Keep terminal for simple type arrays (default)
const schema = {
  type: 'array',
  items: { type: 'string' },
  // terminal: true (default, no need to specify)
};
```

---

## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Related stories: `stories/27.OptimizeArrayUsecase.stories.tsx`, `stories/35.PrefixItems.stories.tsx`
- Test code: `src/core/__tests__/ArrayNode.*.test.ts`
