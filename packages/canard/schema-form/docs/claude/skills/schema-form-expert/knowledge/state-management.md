
# State Management Skill

Expert skill for node state management in @canard/schema-form.

## Skill Info

- **Name**: state-management
- **Purpose**: Guide for NodeState, dirty, touched, globalState management
- **Triggers**: Questions about NodeState, dirty, touched, state, globalState, onStateChange, clearState

## NodeState Type

```typescript
enum NodeState {
  Dirty = 'dirty',       // Value has changed
  Touched = 'touched',   // User has interacted with field
  Validated = 'validated', // Validation has been performed
  ShowError = 'showError', // Error display enabled
}

type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.Validated]?: boolean;
  [NodeState.ShowError]?: boolean;
};
```

## Global State

Aggregated state of the entire form. If any child node has a state set to true, globalState is also true.

### onStateChange Callback

```typescript
// Based on stories/38.StateManagement.stories.tsx
const [globalState, setGlobalState] = useState<NodeStateFlags>({});

<Form
  jsonSchema={schema}
  onStateChange={(state) => {
    setGlobalState(state);
    console.log('Form dirty:', state[NodeState.Dirty]);
    console.log('Form touched:', state[NodeState.Touched]);
  }}
/>

// Using globalState
{globalState[NodeState.Dirty] && (
  <button onClick={handleSave}>Save Changes</button>
)}
```

### State Management with FormHandle

```typescript
const formRef = useRef<FormHandle<typeof schema>>(null);

// Query state
const state = formRef.current?.getState();
console.log('Is form dirty:', state?.[NodeState.Dirty]);

// Set state
formRef.current?.setState({
  [NodeState.Touched]: true,
});

// Clear state
formRef.current?.clearState();
```

## Touched State

Tracks whether the user has interacted with a field.

### Manual Setting

```typescript
// Typically set on blur event
<input
  onBlur={() => node.setState({ [NodeState.Touched]: true })}
/>
```

### Error Display Conditions

```typescript
// Use touched state as error display condition
const showFieldError = node.touched && node.errors.length > 0;

// Or use showError prop
<Form showError="touched">
  {/* Show errors only for touched fields */}
</Form>
```

## State Change History Tracking

```typescript
// Based on stories/38.StateManagement.stories.tsx
const [stateHistory, setStateHistory] = useState<
  { timestamp: string; state: NodeStateFlags }[]
>([]);

const handleStateChange = (state: NodeStateFlags) => {
  setStateHistory((prev) => [
    ...prev.slice(-9),  // Keep only last 10
    {
      timestamp: new Date().toLocaleTimeString(),
      state: { ...state },
    },
  ]);
};

<Form
  jsonSchema={schema}
  onStateChange={handleStateChange}
/>

// Display history
<ul>
  {stateHistory.map((entry, idx) => (
    <li key={idx}>
      {entry.timestamp}: dirty={entry.state[NodeState.Dirty] ? 'Y' : 'N'}
    </li>
  ))}
</ul>
```

## Array Item State

Array items also have individual states.

```typescript
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

// Check each item's state
arrayNode.children.forEach((child, index) => {
  console.log(`Item ${index} dirty:`, child.node.dirty);
  console.log(`Item ${index} touched:`, child.node.touched);
});

// Dirty state of entire array
console.log('Array dirty:', arrayNode.dirty);  // true if any item changed
```

## Cautions

### 1. State Tracking and Re-rendering

Using `useSchemaNodeTracker` causes component re-renders when events occur. Use only when necessary for performance.

```typescript
// ⚠️ Subscribe to all events (possible performance degradation)
useSchemaNodeTracker(node);

// ✅ Subscribe only to needed events
useSchemaNodeTracker(node, NodeEventType.UpdateState);
```

### 2. Initial Value and dirty

When `defaultValue` changes, the dirty calculation basis also changes.

### 3. clearState vs reset

- `clearState()`: Clear state only (value remains)
- `reset()`: Clear both value and state (restore to defaultValue)
