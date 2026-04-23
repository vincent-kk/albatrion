
# Performance Optimization Skill

Expert skill for performance optimization of @canard/schema-form.

## Skill Info

- **Name**: performance-optimization
- **Purpose**: Guide for large-scale forms, array processing, and memory management optimization
- **Triggers**: Questions about performance, optimization, slow, memory, large data, Strategy

## Strategy Pattern

### Terminal Strategy vs Branch Strategy

Array and object nodes use different strategies based on item complexity.

| Strategy | Applies When | Characteristics |
|----------|--------------|-----------------|
| **Terminal** | Primitive types (string, number, boolean) | Lightweight and fast |
| **Branch** | Complex types (object, array) | Creates node tree for each item |

### Terminal Strategy (Recommended)

```typescript
// Simple type array - automatically applies Terminal Strategy
const schema = {
  type: 'array',
  items: {
    type: 'string',  // primitive → Terminal
  },
};

// Characteristics:
// - Manages values only, no node tree
// - Memory efficient
// - Fast add/delete
```

### Branch Strategy

```typescript
// Complex type array - automatically applies Branch Strategy
const schema = {
  type: 'array',
  items: {
    type: 'object',  // complex → Branch
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
  },
};

// Characteristics:
// - Creates node tree for each item
// - Supports per-item validation, computed properties
// - Higher memory usage
```

### Explicit Strategy Setting

```typescript
// Primitive type but force Branch Strategy
const schema = {
  type: 'array',
  terminal: false,  // Force Branch Strategy
  items: {
    type: 'string',
  },
};

// Use cases:
// - Need individual state tracking per item
// - Need per-item computed properties
```

## Array Processing Optimization

### Bulk Item Addition

```typescript
// ❌ Slow: Individual push (fires event for each)
for (let i = 0; i < 100; i++) {
  await arrayNode.push(createItem(i));
}

// ✅ Fast: Direct value setting (single event)
formRef.current?.setValue(prev => ({
  ...prev,
  items: Array.from({ length: 100 }, (_, i) => createItem(i)),
}));
```

### Batch Operations

```typescript
// ✅ Parallel processing with Promise.all
const addItems = async (count: number) => {
  const promises = Array.from({ length: count }, () =>
    arrayNode.push(Math.random())
  );
  await Promise.all(promises);
};
```

### Virtualization

Use virtualization libraries for rendering large item lists:

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedArrayInput: FC<FormTypeInputProps<any[]>> = ({
  value,
  ChildNodeComponents,
}) => (
  <List
    height={400}
    itemCount={ChildNodeComponents.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {ChildNodeComponents[index]?.()}
      </div>
    )}
  </List>
);
```

## Computed Properties Optimization

### Prevent Unnecessary Recalculation

```typescript
// ❌ Complex expression
{
  '&derived': `
    ../items.filter(i => i.active).reduce((sum, i) => sum + i.price, 0)
  `,
}

// ✅ Simplify or calculate in FormTypeInput
{
  type: 'number',
  '&watch': '../items',
}

// Complex calculation in FormTypeInput
const TotalInput = ({ watchValues }) => {
  const items = watchValues[0] || [];
  const total = useMemo(() =>
    items
      .filter((i) => i.active)
      .reduce((sum, i) => sum + i.price, 0),
    [items]
  );
  return <span>{total}</span>;
};
```

### Minimize watch Paths

```typescript
// ❌ Unnecessary watch
{
  '&watch': ['../field1', '../field2', '../field3', '../field4'],
  '&derived': '../field1 + ../field2',  // field3, field4 not used
}

// ✅ Watch only what's needed
{
  '&watch': ['../field1', '../field2'],
  '&derived': '../field1 + ../field2',
}
```

## Network Optimization

### Debouncing

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const AutoSaveForm = () => {
  const formRef = useRef<FormHandle>(null);

  const debouncedSave = useMemo(
    () => debounce((value) => {
      api.save(value);
    }, 1000),
    []
  );

  return (
    <Form
      ref={formRef}
      jsonSchema={schema}
      onChange={(value) => debouncedSave(value)}
    />
  );
};
```

### Selective Field Transmission

```typescript
// Extract only changed fields
const getChangedFields = (original, current) => {
  const changed = {};
  for (const key in current) {
    if (original[key] !== current[key]) {
      changed[key] = current[key];
    }
  }
  return changed;
};

// Usage
const handleSubmit = async () => {
  const current = formRef.current?.getValue();
  const changedFields = getChangedFields(initialValue, current);
  await api.patch(changedFields);  // Send only changes
};
```

## Performance Checklist

### Basic Optimization

- [ ] Set ValidationMode to OnRequest (when appropriate)
- [ ] Use Terminal Strategy for large arrays
- [ ] Provide cleanup functions for all subscriptions
- [ ] Simplify complex computed expressions

### Advanced Optimization

- [ ] Apply virtualization for large item lists
- [ ] Split large schema sections
- [ ] Optimize FormTypeInput with React.memo
- [ ] Debounce network requests

### Measurement

- [ ] Analyze rendering with React DevTools Profiler
- [ ] Monitor event firing frequency
- [ ] Track memory usage

## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Event System: `docs/claude/skills/event-system.md`
- Array Operations: `docs/claude/skills/array-operations.md`
