
# Event System Skill

Expert skill for @canard/schema-form's event system.

## Skill Info

- **Name**: event-system
- **Purpose**: Guide for node events, subscriptions, and event batching mechanism
- **Triggers**: event, subscribe, event batching, UpdateValue, subscription/unsubscription related questions


## Event Types

```typescript
enum NodeEventType {
  // Lifecycle
  Initialized,              // Node created and initialized

  // Value & State
  UpdateValue,              // Value changed
  UpdateState,              // Node state changed (touched, dirty, etc.)
  UpdateError,              // Validation errors changed
  UpdateComputedProperties, // Computed properties need recalculation
  UpdateChildren,           // Array/Object children changed
  UpdatePath,               // Node path changed (e.g., array item reordering)

  // UI Sync
  RequestRefresh,           // Sync uncontrolled component's defaultValue with UI (internal)
  RequestRemount,           // Force full component remount (external API)

  // System
  RequestEmitChange,        // Request onChange callback
  RequestInjection,         // Request injection propagation
}
```

### Event Categories

| Category | Event | Description |
|----------|-------|-------------|
| **Lifecycle** | `Initialized` | Node initialization complete |
| **Value** | `UpdateValue` | Value changed |
| **State** | `UpdateState` | dirty, touched, etc. state changed |
| **Validation** | `UpdateError` | Validation errors updated |
| **Computed** | `UpdateComputedProperties` | Recalculation needed due to dependency change |
| **Structure** | `UpdateChildren`, `UpdatePath` | Child nodes or path changed |
| **UI** | `RequestRefresh`, `RequestRemount` | UI update requests |


## EventCascade Batching Mechanism

### Core Behavior

Each `AbstractNode` has its own `EventCascade` instance. Events are merged through the microtask queue.

```typescript
// Schedule multiple events in the same synchronous stack
schedule(UpdateValue);
schedule(RequestRefresh);
// → Both events merge into the same batch

// During microtask execution:
scheduleMicrotask(() => {
  nextBatch.resolved = true;  // Set at batch start
  this.__batchHandler__(mergeEvents(nextBatch.eventEntities));
  // If new events are scheduled during listener execution:
  //   resolved = true, so → create new batch
});
```

### Batch Lifecycle

```
1. Schedule event
   └─ batch.resolved = undefined (accumulating)

2. Additional events in same stack
   └─ Merge into same batch

3. Microtask execution
   └─ batch.resolved = true (executing)
   └─ Call listeners

4. New events during listener execution
   └─ Create new batch
```

### Batch Reuse Conditions

```typescript
// EventCascade internal logic
if (batch && !batch.resolved) {
  // Add event to existing batch
  return batch;
}
// Create new batch
```


## SetValueOption Impact

### SetValueOption.Overwrite (default)

The default `setValue()` behavior uses the `Overwrite` option, which includes the `Isolate` option.

```typescript
node.setValue({ name: 'Alice' });
// Uses Overwrite option (default)
// → Isolate effect: updateComputedProperties() is called synchronously
// → UpdateValue | RequestRefresh | UpdateComputedProperties merge into same batch
```

### Event Option: settled

```typescript
// Parent direct setValue (Isolate mode)
objectNode.setValue({ name: 'Alice' });
// event.option = { settled: false }
// → Synchronous computed properties update

// Child setValue (normal mode)
nameNode.setValue('Alice');
// event.option = { settled: true }
// → Asynchronous computed properties update
```


## Performance Characteristics

### Microtask Optimization

```
Master branch (previous):
title.setValue('wow')
  ↓ Microtask 1: title UpdateValue
  ↓ Microtask 2: computed properties UpdateComputedProperties
Total: 2 microtasks

After optimization:
title.setValue('wow')
  ↓ Microtask 0 (sync): title UpdateValue (immediate)
  ↓ Microtask 1: computed properties UpdateComputedProperties
Total: 1 microtask (50% improvement)
```

### Benefits of Batching

```typescript
// Multiple simultaneous value changes
node.setValue({ name: 'Alice', age: 25, email: 'alice@example.com' });

// Without batching: 3 separate UpdateValue events
// With batching: 1 merged event
// → Minimize re-renders
```


## RequestRefresh vs RequestRemount

| Event | Purpose | Trigger |
|-------|---------|---------|
| `RequestRefresh` | Sync uncontrolled component's defaultValue with UI | Automatically published by internal system |
| `RequestRemount` | Force full component remount | User explicit call |

### RequestRemount Usage

```typescript
// Request forced remount from external code
node.publish(NodeEventType.RequestRemount);
```


## Event Handling in Tests

### Waiting for Asynchronous Events

```typescript
import { delay } from '@canard/schema-form';

test('value changes propagate correctly', async () => {
  const node = nodeFromJsonSchema({ jsonSchema: schema });

  // Wait for initialization to complete
  await delay();

  node.setValue({ name: 'test' });

  // Wait for asynchronous events to complete
  await delay();

  expect(node.value).toEqual({ name: 'test' });
});
```

### Testing Event Order

```typescript
test('events fire in correct order', async () => {
  const events: NodeEventType[] = [];

  node.subscribe((event) => {
    events.push(event.type);
  });

  node.setValue('test');
  await delay();

  expect(events).toContain(NodeEventType.UpdateValue);
});
```


## References

- Full spec: `docs/ko/SPECIFICATION.md`
- CLAUDE.md: Detailed EventCascade explanation
- Test code: `src/core/__tests__/*.test.ts`
