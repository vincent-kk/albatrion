# Track interaction and unsaved changes

Interaction flags answer whether the user edited or left a field.
Output divergence answers whether the current result differs from the loaded result.
Choose the question first: an edited field can return to its loaded value, and a programmatic write can change the output without user editing.
Use public imports from `@canard/schema-form` for the types, flags and hooks below.

## Record editing and blur in a custom input

FieldInput's `onChange` is the user-input path and marks Edited.
`setValue`, array operations and automatic fills do not mark Edited merely because they change a value.
Touched is recorded by the input's interaction handling; a custom input can set it on blur:

```tsx
function EditableName({ value, onChange, node }: FieldInputProps<string>) {
  return (
    <input
      aria-label="Editable name"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      onBlur={() => node.setState({ [FieldNodeState.Touched]: true })}
    />
  );
}
```

Do not infer touch from validation or force it on every render.
`node.isEdited` and `node.isTouched` read the truthiness of their state flags.
Explicit `setState` can also set these flags, so they are application-controlled interaction state, not an audit log proving a human acted.
For message eligibility, use the centralized policy in [validation UX](validation-ux.md).

## Observe whether any field has been edited

Use Form's `onStateChange` for a form-wide indicator and `getState()` for an imperative read.
They expose the OR-aggregation of state across the tree: one edited descendant makes the form edited even when the root's own state is empty.
A callback reports state changes, not every value change; do not use it alone to maintain an unsaved-value indicator.
Use `setState` on the handle to apply flags across the subtree and `clearState` to clear them across it.
Use `node.setState` when only one field should change; its ancestors' aggregate updates as a consequence.

## Observe whether the output differs from the loaded value

Read `node.isDivergent` after settlement for a field, or read the root's property for the whole form.
The comparison is against the last committed root-load output at the same path, not against Edited or an independently copied React value.
Subscribe to root output/load changes as well as the node's path so array movement and output filtering cannot leave the indicator stale:

```tsx
function UnsavedIndicator({ node }: { node: FieldNode }) {
  useFieldNodeTracker(
    node.rootNode,
    FieldNodeEventType.UpdateValue |
      FieldNodeEventType.UpdateState |
      FieldNodeEventType.RequestRefresh,
  );
  useFieldNodeTracker(node, FieldNodeEventType.UpdatePath);
  return (
    <output aria-label="Unsaved changes">{String(node.isDivergent)}</output>
  );
}
```

Render this component with the current node from Form's children callback or Form.Render.
The hooks bind to the supplied node/root and clean up when they change; retaining a replaced node cannot observe the new tree.
Before the first root load commits the comparison is false; detached nodes also read false because they no longer contribute output.
Mount, Form reset, rebuild, validator replacement and root resetSubtree establish a baseline after their output settles.
Changing `defaultValue` alone, ordinary writes and a child resetSubtree do not move that baseline.
A load that throws before commit leaves the prior baseline; a failure reported after commit leaves the committed degraded output as the baseline.
Reverting output to its loaded value makes divergence false without clearing interaction flags.

To show the indicator outside the form, read the root's property in Form's `onChange` and keep only that boolean in state. `formRef.current` is still empty during the first render, so do not read the root node while rendering.

```tsx
function ProfileEditor({ loaded }: { loaded: Profile }) {
  const formRef = useRef<FormHandle<typeof profileSchema>>(null);
  const [changed, setChanged] = useState(false);
  return (
    <>
      {changed && <p>Changed</p>}
      <Form
        ref={formRef}
        jsonSchema={profileSchema}
        defaultValue={loaded}
        onChange={() => setChanged(formRef.current?.node?.isDivergent ?? false)}
      />
      <button type="button" onClick={() => formRef.current?.reset()}>
        Discard changes
      </button>
    </>
  );
}
```

## Return to the loaded values and interaction state

Keep the intended loaded defaults in `defaultValue` and call the handle's `reset()` to load them and clear interaction state.
Reset reads the latest committed schema/default props; changing those props first means resetting to the newly supplied defaults, not undoing to an older load.
The restored output still follows schema defaults, derivations and projection rules, so it need not be a byte-for-byte copy of the supplied defaultValue.
If the requirement is to restore an older snapshot after props changed, supply that snapshot as defaultValue, let it commit, then reset.
`clearState()` keeps values and the divergence baseline; it is useful for clearing interaction feedback without discarding edits.
`controls.resetInteraction` also clears interaction flags where its condition applies; it does not mean the output returned to its baseline.
A child `resetSubtree()` follows its own load source, which can differ from the baseline value at its current path after array movement.
Dependencies outside that subtree can also leave the restored child divergent.

## Account for output shape

Array items compare by position. A moved or newly added item can match the original output at that position and read false.
Hidden fields still contribute their output; inactive fields and array output filters can change what contributes.
Undeclared object keys restored in a different order can remain divergent because comparison preserves output key order.
A read made during settlement can be transient, just like a value read during settlement; observe after the operation or delivered notification.
Use specific event masks for trackers: omitting the mask listens to all node events and can cause unrelated re-renders.

## Check the distinction

Test a programmatic edit: output becomes divergent while Edited stays false.
Then edit back through the input: divergence becomes false while Edited remains true.
Clear state and verify the value remains; reset and verify the loaded output, cleared interaction flags and false divergence together.
Replace default/schema props without resetting and verify that the tree and baseline remain until reset.
