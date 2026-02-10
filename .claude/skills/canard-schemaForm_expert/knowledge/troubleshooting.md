
# Troubleshooting Skill

Common issues and solutions when using @canard/schema-form.

## Skill Info

- **Name**: troubleshooting
- **Purpose**: Guide for error resolution, debugging, and problem diagnosis
- **Triggers**: Questions about errors, issues, not working, bugs, debugging


### Issue: Plugin Registration Order

**Symptom**: UI renders differently than expected

**Cause**: Order matters when registering multiple plugins

**Solution**:
```tsx
// Correct order: UI plugin → Validator plugin
import { registerPlugin } from '@canard/schema-form';
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

registerPlugin(antd5Plugin);       // 1. UI plugin first
registerPlugin(ajvValidatorPlugin); // 2. Validator plugin second
```


### Issue: formTypeInputMap Wildcard Not Working

**Symptom**: `/items/*/name` path doesn't match

**Cause**: Incorrect wildcard syntax

**Solution**:
```tsx
// ✅ Correct usage
formTypeInputMap: {
  '/items/*/name': ItemNameInput,     // Array items
  '/config/*/value': ConfigValueInput, // Dynamic object keys
}

// ❌ Wrong usage - wildcard only matches single segment
formTypeInputMap: {
  '/items/**/name': ItemNameInput,  // ** is not supported
}
```


## Computed Properties Issues

### Issue: Computed Expression Not Working

**Symptom**: `&active`, `&visible`, etc. not reacting

**Cause 1**: Path syntax error

```tsx
// ❌ Wrong: Missing .. for sibling field reference
computed: { active: '/toggle === true' }

// ✅ Correct
computed: { active: '../toggle === true' }
```

**Cause 2**: Missing watch array (for complex dependencies)

```tsx
// Complex dependencies require explicit watch
computed: {
  active: '../items.length > 0',
  watch: '../items',  // Explicitly watch for length changes
}
```


### Issue: Derived Value Not Updating

**Symptom**: Derived value doesn't change when dependency field changes

**Cause**: Referenced field in expression doesn't exist or path is incorrect

**Solution**:
```tsx
// Debug: Verify path
const schema = {
  properties: {
    price: { type: 'number' },
    quantity: { type: 'number' },
    total: {
      type: 'number',
      // Verify path is correct
      '&derived': '../price * ../quantity',
    },
  },
};

// Use nullish coalescing for safe handling
'&derived': '(../price ?? 0) * (../quantity ?? 1)'
```


### Issue: Conditional Field Disappears After setValue

**Symptom**: Conditional field is removed when parent setValue is called

**Cause**: This is normal behavior (conditional filtering)

**Understanding**:
```tsx
// Parent setValue: applies conditional filtering
objectNode.setValue({ category: 'movie', price: 200 });
// price is removed if it doesn't match movie condition

// Child setValue: bypasses filtering
const priceNode = objectNode.find('./price');
priceNode.setValue(999);  // Value set regardless of conditions
```

**If you don't want filtering**:
- Call setValue on child node directly
- Or redesign schema structure


### Issue: Error Messages Not Displayed

**Symptom**: Validation errors exist but don't show in UI

**Cause 1**: showError setting

```tsx
// Force showError activation
formRef.current?.showError(true);

// Or set via Form prop
<Form showError={true} />
```

**Cause 2**: errorVisible condition

```tsx
// Check errorVisible in FormTypeInput
const MyInput = ({ errors, errorVisible }) => (
  <div>
    <input />
    {errorVisible && errors.length > 0 && (
      <span>{errors[0].message}</span>
    )}
  </div>
);
```


## Array-Related Issues

### Issue: push() Not Working

**Symptom**: Items not being added to array

**Cause**: maxItems constraint

**Verification**:
```tsx
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

console.log('Current length:', arrayNode.length);
console.log('Schema:', arrayNode.jsonSchema);
// Check maxItems
```

**Solution**:
```tsx
// When maxItems is set, push() is ignored when limit is reached
{
  type: 'array',
  items: { type: 'string' },
  maxItems: 5,  // push() won't work when 5 items exist
}
```


## Performance Issues

### Issue: Slow Performance with Large Data

**Symptom**: Rendering lag with 100+ items

**Solution 1**: Use Terminal Strategy

```tsx
{
  type: 'array',
  terminal: true,  // Recommended for simple type arrays
  items: { type: 'string' },
}
```

**Solution 2**: Optimize ValidationMode

```tsx
// Don't validate on every input
<Form validationMode={ValidationMode.OnRequest} />
```

**Solution 3**: Batch Operations

```tsx
// ❌ Slow: Individual push operations
for (let i = 0; i < 100; i++) {
  await arrayNode.push(i);
}

// ✅ Fast: Set value directly
const newItems = Array.from({ length: 100 }, (_, i) => i);
formRef.current?.setValue(prev => ({
  ...prev,
  items: [...(prev.items || []), ...newItems],
}));
```


## Type-Related Issues

### Issue: TypeScript Type Inference Failure

**Symptom**: getValue() returns type any

**Solution**: Use `as const`

```tsx
// ❌ Type inference fails
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
};

// ✅ Type inference succeeds
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
} as const;

// Specify FormHandle type
const formRef = useRef<FormHandle<typeof schema>>(null);
```


## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Quick Reference: `docs/QUICK_REFERENCE.md`
- Event System: `docs/claude/skills/event-system.md`
