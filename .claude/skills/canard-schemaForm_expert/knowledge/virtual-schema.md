
# Virtual Schema Skill

Expert skill for @canard/schema-form's Virtual Schema feature.

## Skill Info

- **Name**: virtual-schema
- **Purpose**: Guide for grouping virtual fields using the virtual property
- **Triggers**: Questions about virtual, VirtualNode, field grouping, date ranges, multi-field combinations


## Basic Syntax

```typescript
{
  type: 'object',
  properties: {
    field1: { type: 'string' },
    field2: { type: 'string' },
  },
  virtual: {
    virtualFieldName: {
      fields: ['field1', 'field2'],
      FormTypeInput?: ComponentType,  // Optional
      computed?: ComputedProps,        // Optional
    },
  },
}
```


## Virtual Field Value Structure

Virtual field values are in tuple form, ordered according to the `fields` array.

```typescript
virtual: {
  period: {
    fields: ['startDate', 'endDate'],
  },
}

// Value received in FormTypeInput:
// [startDateValue, endDateValue]

// Calling onChange:
onChange(['2025-01-01', '2025-01-31']);
// → Sets startDate: '2025-01-01', endDate: '2025-01-31' separately
```


## Required with Virtual

When a virtual field is included in required, all fields it contains become required.

```typescript
const schema = {
  type: 'object',
  properties: {
    control: { type: 'string' },
    virtualFiled_A1: { type: 'string' },
    virtualFiled_A2: { type: 'string' },
  },
  virtual: {
    virtualField_A: {
      fields: ['virtualFiled_A1', 'virtualFiled_A2'],
    },
  },
  // When virtualField_A is marked as required,
  // both virtualFiled_A1 and virtualFiled_A2 become required
  required: ['control', 'virtualField_A'],
};
```


## FormTypeInputProps for Virtual

Props received by a virtual field's FormTypeInput:

```typescript
interface VirtualFormTypeInputProps {
  // Value: array ordered by fields
  value: [T1, T2, ...] | undefined;

  // Change handler
  onChange: (value: [T1, T2, ...]) => void;

  // Node information
  node: VirtualNode;

  // Access individual field nodes (via node.children)
  // node.children[0]?.node → firstName node
  // node.children[1]?.node → lastName node

  // Other FormTypeInputProps
  readOnly: boolean;
  disabled: boolean;
  errors: JsonSchemaError[];
  // ...
}
```


## VirtualNode Characteristics

### VirtualNode vs Regular Node

| Characteristic | VirtualNode | Regular Node |
|----------------|-------------|--------------|
| Value storage | Distributed to child fields | Direct storage |
| Value form | Tuple array | Single value |
| Schema location | virtual object | properties object |
| Rendering | Custom FormTypeInput | Default or custom |

### VirtualNode Access

```typescript
import { isVirtualNode } from '@canard/schema-form';

// Access from FormHandle
const virtualNode = formRef.current?.findNode('/period');

if (isVirtualNode(virtualNode)) {
  // Use as VirtualNode type
  console.log('Fields:', virtualNode.children.map(c => c.node.name));
  console.log('Value:', virtualNode.value);  // [startDate, endDate]
}
```


## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Related story: `stories/08.VirtualSchema.stories.tsx`
