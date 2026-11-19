---
'@canard/schema-form': major
---

Breaking change: derived DOM identifiers, including `FieldRendererProps.labelId`, use an opaque collision-free spelling. Read `labelId` from renderer props or use the new `getFieldPartId(id, part)` export for labels, options and other control parts. Code that concatenates `label:` or an option suffix must migrate; do not recover an input id by slicing a derived id.

Before:

```ts
const labelId = 'label:' + id;
const optionId = id + '-' + index;
```

After:

```ts
import { getFieldPartId } from '@canard/schema-form';

const labelId = getFieldPartId(id, 'label');
const optionId = getFieldPartId(id, 'option:' + index);
```

`FieldInputProps.id` remains the control id, `path` remains the JSON Pointer, and radio inputs keep the scoped control id as their native group name. Custom `identifierPrefix` values containing a tilde are escaped in the Form scope. Use `CSS.escape` when constructing CSS selectors from any of these ids.
