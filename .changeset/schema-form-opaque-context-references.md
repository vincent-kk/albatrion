---
"@canard/schema-form": major
---

Breaking change: Form and FormProvider context now compare URL, URLSearchParams and opaque class instances by reference. A new instance recomputes dependent controls and validation state even when its enumerable properties look equal; equal-content class replacements may therefore update more often. Plain objects, arrays and supported built-ins retain content comparison.

Before, a replacement query object could leave controls stale:

```tsx
<Form
  context={{ query: new URLSearchParams("mode=advanced") }}
  jsonSchema={schema}
/>
```

After, replace the instance whenever its content changes. Reusing and mutating the same instance is not detected:

```tsx
const query = new URLSearchParams(nextSearch);
<Form context={{ query }} jsonSchema={schema} />;
```
