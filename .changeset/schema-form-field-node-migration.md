---
"@canard/schema-form": minor
---

Breaking change: the node and input APIs use FieldNode and FieldInput names. Update named imports and their call sites using this migration table.

| Before | After |
| --- | --- |
| `SchemaNode` | `FieldNode` |
| `InferSchemaNode` | `InferFieldNode` |
| `NodeEventType` | `FieldNodeEventType` |
| `NodeState` | `FieldNodeState` |
| `ShowError` | `ErrorVisibility` |
| `isSchemaNode` | `isFieldNode` |
| `useSchemaNodeSubscribe` | `useFieldNodeSubscribe` |
| `SchemaNodeSubscribeOptions` | `FieldNodeSubscribeOptions` |
| `useSchemaNodeTracker` | `useFieldNodeTracker` |
| `useChildNodeComponentMap` | `useChildFieldMap` |
| `useChildNodeErrors` | `useChildFieldErrors` |
| `ChildNodeComponentProps` | `ChildFieldProps` |
| `FormTypeInputDefinition` | `FieldInputDefinition` |
| `FormTypeInputMap` | `FieldInputMap` |
| `FormTypeInputProps` | `FieldInputProps` |
| `FormTypeInputPropsWithNode` | `FieldInputPropsWithNode` |
| `FormTypeInputPropsWithSchema` | `FieldInputPropsWithSchema` |
| `FormTypeTestFn` | `FieldInputTestFn` |
| `FormTypeTestObject` | `FieldInputTestObject` |
| `Hint` | `FieldInputHint` |
| `FormErrorProps` | `FormErrorMessageProps` |

Before:

```ts
import { isSchemaNode, type SchemaNode } from '@canard/schema-form';
const isNode = (value: unknown): value is SchemaNode => isSchemaNode(value);
```

After:

```ts
import { isFieldNode, type FieldNode } from '@canard/schema-form';
const isNode = (value: unknown): value is FieldNode => isFieldNode(value);
```

These are migration targets, not compatibility aliases. Review event members, node operations and hook results against the new declarations when updating call sites.
