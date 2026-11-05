# Track interaction and unsaved changes

Interaction flags answer whether the user edited or left a field.
Output divergence answers whether the current result differs from the loaded result.
Choose the question first: an edited field can return to its loaded value, and a programmatic write can change the output without user editing.
Use public imports from `@canard/schema-form` for the types, flags and hooks below.

## Record editing and blur in a custom input

FieldInput's `onChange` is the user-input path and marks Edited.
`setValue`, array operations and automatic fills do not mark Edited merely because they change a value.
Form records Touched one frame after blur by itself; an input that also sets it on blur, as below, only makes it immediate:

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

Read `node.isDivergent` after the call that changed the value has returned for a field, or read the root's property for the whole form.
The comparison is against the output of the form's last load (see [validation UX](validation-ux.md) for what counts as a load) or of the root's `resetSubtree()`, at the same path, not against Edited or an independently copied React value.
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

Render this component with the `node` from Form's function children or from Form.Render, so it always receives the form's current root.
`reset()` and `rebuild()` on the handle, a new validator, and the root node's `resetSubtree()` make the current output the new comparison point, so `isDivergent` reads false right after them.
Changing the `defaultValue` or `jsonSchema` prop alone, writing values, and calling `resetSubtree()` on a child node leave the comparison point unchanged.
`rebuild()`, a new validator, and `reset()` after a `jsonSchema` change replace the root node, so read `formRef.current.node` again or use the children's `node` afterwards.
A root node kept from before a replacement receives no more events and keeps reporting the divergence it had when it was replaced.
A field node kept after its field becomes inactive reads false and receives no more events; find the field again once it is active.
Returning the output to its loaded value makes `isDivergent` false without clearing `isEdited` or `isTouched`.

To show the indicator outside the form, read `node.isDivergent` in Form's function children and pass the boolean out with an effect. The children re-render with the form's current root after every edit, after `reset()`, and after anything that rebuilds the form: `rebuild()`, a new validator, or `reset()` after a `jsonSchema` change. Do not compute it in `onChange` from `formRef.current.node`: while the form rebuilds, `onChange` runs before the handle points at the new root, and a `reset()` that leaves the value unchanged calls no `onChange`.

```tsx
function ReportDivergence({
  divergent,
  onDivergence,
}: {
  divergent: boolean;
  onDivergence: (divergent: boolean) => void;
}) {
  useEffect(() => {
    onDivergence(divergent);
  }, [divergent, onDivergence]);
  return null;
}

function ProfileEditor({ loaded }: { loaded: Profile }) {
  const formRef = useRef<FormHandle<typeof profileSchema>>(null);
  const [changed, setChanged] = useState(false);
  return (
    <>
      {changed && <p>Changed</p>}
      <Form ref={formRef} jsonSchema={profileSchema} defaultValue={loaded}>
        {({ node }) => (
          <>
            <Form.Field path="" />
            <ReportDivergence
              divergent={node?.isDivergent ?? false}
              onDivergence={setChanged}
            />
          </>
        )}
      </Form>
      <button type="button" onClick={() => formRef.current?.reset()}>
        Discard changes
      </button>
    </>
  );
}
```

## Return to the loaded values and interaction state

Keep the intended loaded defaults in `defaultValue` and call the handle's `reset()` to load them and clear interaction state.
Reset reads the latest committed props, as described in [imperative handle and layout](imperative-and-layout.md).
The restored output still follows schema defaults, derivations and projection rules, so it need not be a byte-for-byte copy of the supplied defaultValue.
If the requirement is to restore an older snapshot after props changed, supply that snapshot as defaultValue, let it commit, then reset.
`clearState()` keeps values and the divergence baseline; it is useful for clearing interaction feedback without discarding edits.
`controls.resetInteraction` also clears interaction flags where its condition applies; it does not mean the output returned to its baseline.
A child `resetSubtree()` follows its own load source, which can differ from the baseline value at its current path after array movement.
Dependencies outside that subtree can also leave the restored child divergent.

## Account for output shape

Array items compare by position. A moved or newly added item can match the original output at that position and `isDivergent` can read false.
Hidden fields still contribute their output; inactive fields and array output filters can change what contributes.
Undeclared object keys restored in a different order can remain divergent because comparison preserves output key order.
Use specific event masks for trackers: omitting the mask listens to all node events and can cause unrelated re-renders.

## Check the distinction

Test a programmatic edit: output becomes divergent while Edited stays false.
Then edit back through the input: divergence becomes false while Edited remains true.
Clear state and verify the value remains; reset and verify the loaded output, cleared interaction flags and false divergence together.
Replace default/schema props without resetting and verify that the tree and baseline remain until reset.
