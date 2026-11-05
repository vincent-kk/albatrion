# Write useful field and section messages

Choose copy for an input error separately from the validation rule and its visibility.
Use public imports from `@canard/schema-form`; the examples use `FormProps`, `JSONSchema`, `FieldInputProps`, and `useChildFieldErrors`.
For validation timing and server-error delivery, read [validation UX](validation-ux.md).

## Explain a validation failure in the user's language

With the built-in formatter, put keyword-specific copy under `presentation.errorMessages`.
Use a locale dictionary when the same schema serves multiple languages, and pass `context.locale` on Form or FormProvider.
A `default` message handles a keyword without its own configured message:

```ts
const messageSchema = {
  type: 'string',
  presentation: {
    errorMessages: {
      minLength: { en: 'Use at least {limit} characters: {value}' },
      default: 'Check this value',
    },
  },
} satisfies JSONSchema;
```

The formatter takes the keyword entry unless it is missing or an empty string, otherwise `default`, and then the locale within the entry it took.
A missing locale in a selected keyword dictionary falls back to the issue's original message, not to the default dictionary.
An issue without `error.keyword`, or a selected message that is empty or unresolved, keeps the original message.
Placeholders use `error.details` supplied by the validator and the node's current value for `{value}`.
Each key replaces its first placeholder occurrence; keep each placeholder once rather than treating this as a template engine.
Formatting changes presentation only: raw `getErrors()` and `node.errors` still contain the original issues.

## Include markup or application context in a message

Pass `formatError` when application copy needs React content or information outside the schema.
It replaces the selected default/plugin formatter, so implement the fallback you need instead of assuming schema messages run first:

```tsx
const formatError: NonNullable<FormProps['formatError']> = (
  error,
  node,
  context,
) => (
  <strong>
    {String(context.heading)}: {node.path || 'form'}: {error.message}
  </strong>
);
```

Supply this function as Form's `formatError` and `context={{ heading: 'Please correct' }}`.
Use the [configuration lifetime guidance](field-input.md) when choosing the formatter function.
Read changing application data from its context argument instead of closing over an initial locale.
A custom FieldInput that prints `errors[0].message` bypasses formatting; use Form.Error or let the FieldRenderer display its supplied formatted message.
Keep the formatter free of writes: producing an error message must not edit the field or start another validation.

## Summarize errors for a section

Use `useChildFieldErrors(node)` in a branch input to read the current direct children's errors.
The arrays follow `node.children` order, including changes to that order; they are not a recursive list of all descendant issues.
Pair each formatted message with that child's visibility when a section should show only individually eligible messages:

```tsx
function SectionInput({ node, ChildFields }: FieldInputProps) {
  const { showErrors, formattedErrors } = useChildFieldErrors(node);
  return (
    <section>
      {ChildFields.map((Child, index) => (
        <Child key={index} />
      ))}
      <ul aria-label="Section errors">
        {formattedErrors.map((message, index) =>
          showErrors[index] && message != null ? (
            <li key={node.children![index].path}>{message}</li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
```

Mount this component through a branch's `presentation.FieldInput` or `fieldInputMap`.
It retains ChildFields because a section owns layout, not the whole object value.
Choose whether the section or each input owns the displayed messages to avoid duplicate feedback.
The hook's raw `errorMatrix` is ungated and `formattedErrors` contains the first issue per child.
`formattedError` picks the first non-null formatted child message; `showError` is true when the parent or any child is eligible.
Consequently `errorMessage` can be the first child's message when a different child makes the section eligible; it is a group summary, not a per-child visibility filter.
The hook does not add the renderer's `isActive && isVisible` check. Filter by the child's presence yourself if hidden children must be absent from the summary.
With `disabled=true`, the hook stops error subscriptions and suppresses messages; this React-only switch is not a validation operation.

## Check the result the reader will see

Check configured keyword copy, missing-locale fallback, and a keyword using default copy.
For a custom formatter, assert the returned markup and context-dependent text as well as the unchanged raw issue.
For a section, leave its first invalid child untouched, touch a later invalid child, and check that your chosen per-child policy displays only that later message.
Clear the source errors and check that the summary disappears; a hidden message alone does not prove the issue was removed.
