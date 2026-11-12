---
"@canard/schema-form": minor
---

Breaking change: real inputs no longer receive `errors` or `errorVisible` props; use `useFieldErrors(node)` wherever an input or presentation renderer needs field feedback. Inputs that do not use the hook no longer re-render on error-only changes when no deferred refresh is pending.

Before:

```tsx
const Feedback = ({ errors, errorVisible }: FieldInputProps) => (
  <span>{errorVisible && errors[0]?.message}</span>
);
```

After:

```tsx
const Feedback = ({ node }: FieldInputProps) => {
  const { errorMessage } = useFieldErrors(node);
  return <span>{errorMessage}</span>;
};
```

The hook returns raw `errors`, resolved `errorVisible`, formatted `errorMessage` and a visibility-gated `formatError`. Use it under the node's own Form in a real input, InputRenderer, LabelRenderer or ErrorMessageRenderer. Its object reference stays stable while those four values are equal. An input without the hook re-renders only when its props change; an error-only or interaction-state-only change (Edited, Touched, an ErrorVisibility override) does not render it unless a deferred Refresh is applied at that moment.

Search custom inputs, destructuring and override payloads for both old prop names. Their deprecated optional-never declarations reject member access and values, but a bare truthiness check can still compile. Validate the displayed message after migrating. The field computes its own message with the same formatter, so a formatter that throws for a field replaces the whole field with the fallback, and replacing formatError or a part renderer retries it. Only a throw raised solely by an input’s own useFieldErrors call is caught by that input’s boundary, which replacing formatError does not retry. During a transition or hydration, React can pause a component’s render while error display becomes permitted. The hook can then lag by one committed render and catches up after that commit. A formatter reading sibling values, module state or time that it does not subscribe to can differ until the next update of the node properties it observes; prefer its arguments.
