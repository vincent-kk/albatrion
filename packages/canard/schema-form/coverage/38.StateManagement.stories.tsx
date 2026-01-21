import { useRef, useState } from 'react';

import type { NodeStateFlags } from '@/schema-form/core/nodes';

import {
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JsonSchema,
  NodeEventType,
  NodeState,
  useSchemaNodeTracker,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/38. StateManagement',
};

/**
 * Tests the onStateChange callback that fires when globalState changes.
 * - Tracks dirty/touched state changes across the entire form
 * - Shows real-time globalState updates
 */
export const OnStateChangeCallback = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number' },
      address: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          country: { type: 'string' },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<any>({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [stateChangeHistory, setStateChangeHistory] = useState<
    { timestamp: string; state: NodeStateFlags }[]
  >([]);

  const handleStateChange = (state: NodeStateFlags) => {
    setGlobalState(state);
    setStateChangeHistory((prev) => [
      ...prev.slice(-9),
      {
        timestamp: new Date().toLocaleTimeString(),
        state: { ...state },
      },
    ]);
  };

  const Renderer = ({ depth, name, node, Input }: FormTypeRendererProps) => {
    useSchemaNodeTracker(node, NodeEventType.UpdateState);
    const { [NodeState.Dirty]: dirty, [NodeState.Touched]: touched } =
      node.state || {};

    if (depth === 0) return <Input />;

    return (
      <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ minWidth: 80 }}>{name}</label>
          <Input style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: dirty ? 'red' : '#999' }}>
            {dirty ? '●' : '○'} dirty
          </span>
          <span style={{ fontSize: 12, color: touched ? 'blue' : '#999' }}>
            {touched ? '●' : '○'} touched
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 2 }}>
        <h3>Form with onStateChange</h3>
        <p style={{ color: '#666', fontSize: 14 }}>
          Interact with the form fields to see globalState changes in real-time.
        </p>
        <StoryLayout jsonSchema={jsonSchema} value={value}>
          <Form
            jsonSchema={jsonSchema}
            onChange={setValue}
            onStateChange={handleStateChange}
            CustomFormTypeRenderer={Renderer}
          />
        </StoryLayout>
      </div>

      <div style={{ flex: 1 }}>
        <fieldset>
          <legend>Current GlobalState</legend>
          <pre style={{ background: '#f5f5f5', padding: 10 }}>
            {JSON.stringify(globalState, null, 2)}
          </pre>
        </fieldset>

        <fieldset style={{ marginTop: 10 }}>
          <legend>State Change History (last 10)</legend>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {stateChangeHistory.length === 0 ? (
              <p style={{ color: '#999' }}>No state changes yet</p>
            ) : (
              stateChangeHistory.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 5,
                    borderBottom: '1px solid #eee',
                    fontSize: 12,
                  }}
                >
                  <strong>{entry.timestamp}</strong>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(entry.state, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </fieldset>
      </div>
    </div>
  );
};

/**
 * Tests the clearState method that resets all node states.
 * - Clears dirty/touched flags from all nodes in the tree
 * - Resets globalState to empty
 */
export const ClearStateMethod = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3 },
      password: { type: 'string', minLength: 8 },
      profile: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          bio: { type: 'string' },
        },
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<any>({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  const Renderer = ({ depth, name, node, Input }: FormTypeRendererProps) => {
    useSchemaNodeTracker(node, NodeEventType.UpdateState);
    const { [NodeState.Dirty]: dirty, [NodeState.Touched]: touched } =
      node.state || {};

    if (depth === 0) return <Input />;

    return (
      <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ minWidth: 100 }}>{name}</label>
          <Input style={{ flex: 1 }} />
          <span
            style={{
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 4,
              background: dirty ? '#ffebee' : '#f5f5f5',
              color: dirty ? '#c62828' : '#999',
            }}
          >
            dirty: {dirty ? 'true' : 'false'}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 4,
              background: touched ? '#e3f2fd' : '#f5f5f5',
              color: touched ? '#1565c0' : '#999',
            }}
          >
            touched: {touched ? 'true' : 'false'}
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
          path: {node.path}
        </div>
      </div>
    );
  };

  const handleClearState = () => {
    formHandle.current?.clearState();
  };

  const handleGetState = () => {
    const state = formHandle.current?.getState();
    alert(`Current globalState:\n${JSON.stringify(state, null, 2)}`);
  };

  return (
    <div>
      <h3>clearState() Method Test</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        1. Interact with form fields to set dirty/touched states
        <br />
        2. Click "Clear State" to reset all states
        <br />
        3. Observe that all dirty/touched flags are cleared
      </p>

      <div
        style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <button
          onClick={handleClearState}
          style={{
            padding: '8px 16px',
            background: '#e53935',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🗑️ Clear State
        </button>
        <button
          onClick={handleGetState}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          📋 Get State (alert)
        </button>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{
            padding: '8px 16px',
            background: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🔄 Reset Form
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <StoryLayout jsonSchema={jsonSchema} value={value}>
            <Form
              ref={formHandle}
              jsonSchema={jsonSchema}
              onChange={setValue}
              onStateChange={setGlobalState}
              CustomFormTypeRenderer={Renderer}
            />
          </StoryLayout>
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>GlobalState</legend>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 10,
                minHeight: 100,
              }}
            >
              {Object.keys(globalState).length === 0
                ? '(empty - no state flags set)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

/**
 * Tests getState method and compares individual node states vs globalState.
 * - Shows difference between node.state and form.getState()
 * - Demonstrates state aggregation
 */
export const GetStateMethod = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      field1: { type: 'string' },
      field2: { type: 'string' },
      nested: {
        type: 'object',
        properties: {
          field3: { type: 'string' },
          field4: { type: 'string' },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<any>({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [nodeStates, setNodeStates] = useState<
    Record<string, NodeStateFlags | undefined>
  >({});
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  const Renderer = ({ depth, name, node, Input }: FormTypeRendererProps) => {
    const updateNodeStates = () => {
      setNodeStates((prev) => ({
        ...prev,
        [node.path]: { ...node.state },
      }));
    };
    useSchemaNodeTracker(node, NodeEventType.UpdateState);

    if (depth === 0) return <Input />;

    return (
      <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ minWidth: 80 }}>{name}</label>
          <Input style={{ flex: 1 }} onBlur={updateNodeStates} />
          <button onClick={updateNodeStates} style={{ fontSize: 11 }}>
            Capture State
          </button>
        </div>
      </div>
    );
  };

  const handleRefreshAllStates = () => {
    const rootNode = formHandle.current?.node;
    if (!rootNode) return;

    const states: Record<string, NodeStateFlags | undefined> = {};
    const collectStates = (node: any) => {
      states[node.path] = { ...node.state };
      node.subnodes?.forEach((child: any) => collectStates(child.node));
    };
    collectStates(rootNode);
    setNodeStates(states);
  };

  return (
    <div>
      <h3>getState() Method & Node State Comparison</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        Compare individual node states with the aggregated globalState.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => {
            const state = formHandle.current?.getState();
            setGlobalState(state || {});
          }}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          📋 formHandle.getState()
        </button>
        <button
          onClick={handleRefreshAllStates}
          style={{
            padding: '8px 16px',
            background: '#388e3c',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🔍 Capture All Node States
        </button>
        <button
          onClick={() => formHandle.current?.clearState()}
          style={{
            padding: '8px 16px',
            background: '#e53935',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🗑️ Clear State
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <StoryLayout jsonSchema={jsonSchema} value={value}>
            <Form
              ref={formHandle}
              jsonSchema={jsonSchema}
              onChange={setValue}
              onStateChange={setGlobalState}
              CustomFormTypeRenderer={Renderer}
            />
          </StoryLayout>
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>GlobalState (from getState / onStateChange)</legend>
            <pre
              style={{
                background: '#e3f2fd',
                padding: 10,
                fontSize: 12,
              }}
            >
              {JSON.stringify(globalState, null, 2) || '{}'}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>Individual Node States</legend>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {Object.entries(nodeStates).map(([path, state]) => (
                <div
                  key={path}
                  style={{
                    padding: 8,
                    borderBottom: '1px solid #eee',
                    fontSize: 11,
                  }}
                >
                  <strong>{path}</strong>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(state, null, 2) || '{}'}
                  </pre>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

/**
 * Tests state management with nested array structures.
 * - Validates clearState works correctly with dynamic array items
 * - Shows state propagation through complex nested structures
 */
export const StateWithNestedArrays = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'number' },
            options: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<any>({
    title: 'Shopping List',
    items: [
      { name: 'Apple', quantity: 5, options: ['organic', 'fresh'] },
      { name: 'Bread', quantity: 2, options: ['whole grain'] },
    ],
  });
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  const Renderer = ({
    depth,
    name,
    node,
    Input,
    schemaType,
  }: FormTypeRendererProps) => {
    useSchemaNodeTracker(node, NodeEventType.UpdateState);
    const { [NodeState.Dirty]: dirty, [NodeState.Touched]: touched } =
      node.state || {};

    if (depth === 0) return <Input />;

    const stateIndicator = (
      <span style={{ fontSize: 10, marginLeft: 8 }}>
        {dirty && <span style={{ color: 'red' }}>●D </span>}
        {touched && <span style={{ color: 'blue' }}>●T</span>}
      </span>
    );

    return (
      <div
        style={{
          marginBottom: 4,
          marginLeft: depth * 16,
          padding: 4,
          borderLeft: `2px solid ${dirty || touched ? '#1976d2' : '#eee'}`,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, minWidth: 60 }}>
            {name}
            {stateIndicator}
          </label>
          {schemaType !== 'object' && schemaType !== 'array' && (
            <Input style={{ flex: 1, fontSize: 12, padding: 4 }} />
          )}
          {(schemaType === 'object' || schemaType === 'array') && <Input />}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3>State Management with Nested Arrays</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        Test clearState with complex nested array structures. Modify items and
        observe state changes.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => formHandle.current?.clearState()}
          style={{
            padding: '8px 16px',
            background: '#e53935',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🗑️ Clear All States
        </button>
        <button
          onClick={() => {
            setValue((prev: any) => ({
              ...prev,
              items: [
                ...(prev.items || []),
                { name: 'New Item', quantity: 1, options: [] },
              ],
            }));
          }}
          style={{
            padding: '8px 16px',
            background: '#388e3c',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ➕ Add Item (external)
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <StoryLayout jsonSchema={jsonSchema} value={value}>
            <Form
              ref={formHandle}
              jsonSchema={jsonSchema}
              defaultValue={value}
              onChange={setValue}
              onStateChange={setGlobalState}
              CustomFormTypeRenderer={Renderer}
            />
          </StoryLayout>
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>GlobalState</legend>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 10,
                fontSize: 12,
              }}
            >
              {Object.keys(globalState).length === 0
                ? '(empty)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

/**
 * Demonstrates the difference between clearState and reset.
 * - clearState: Only clears dirty/touched flags, keeps values
 * - reset: Resets entire form to initial state
 */
export const ClearStateVsReset = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
  } satisfies JsonSchema;

  const defaultValue = { name: 'John', email: 'john@example.com' };

  const [value, setValue] = useState<any>(defaultValue);
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  const Renderer = ({ depth, name, node, Input }: FormTypeRendererProps) => {
    const { [NodeState.Dirty]: dirty, [NodeState.Touched]: touched } =
      node.state || {};
    useSchemaNodeTracker(node, NodeEventType.UpdateState);
    if (depth === 0) return <Input />;

    return (
      <div style={{ marginBottom: 12, padding: 12, border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ minWidth: 80 }}>{name}</label>
          <Input style={{ flex: 1 }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              marginRight: 8,
              borderRadius: 4,
              background: dirty ? '#ffcdd2' : '#e8e8e8',
            }}
          >
            dirty: {String(!!dirty)}
          </span>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              background: touched ? '#bbdefb' : '#e8e8e8',
            }}
          >
            touched: {String(!!touched)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3>clearState() vs reset() Comparison</h3>

      <table style={{ marginBottom: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 10, border: '1px solid #ddd' }}>Method</th>
            <th style={{ padding: 10, border: '1px solid #ddd' }}>Values</th>
            <th style={{ padding: 10, border: '1px solid #ddd' }}>
              State Flags
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: 10, border: '1px solid #ddd' }}>
              <strong>clearState()</strong>
            </td>
            <td style={{ padding: 10, border: '1px solid #ddd' }}>
              ✅ Keeps current values
            </td>
            <td style={{ padding: 10, border: '1px solid #ddd' }}>
              🗑️ Clears dirty/touched
            </td>
          </tr>
          <tr>
            <td style={{ padding: 10, border: '1px solid #ddd' }}>
              <strong>reset()</strong>
            </td>
            <td style={{ padding: 10, border: '1px solid #ddd' }}>
              🔄 Resets to defaultValue
            </td>
            <td style={{ padding: 10, border: '1px solid #ddd' }}>
              🔄 Resets (re-creates form)
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => formHandle.current?.clearState()}
          style={{
            padding: '10px 20px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          clearState() - Keep Values, Clear Flags
        </button>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{
            padding: '10px 20px',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          reset() - Reset Everything
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <StoryLayout jsonSchema={jsonSchema} value={value}>
            <Form
              ref={formHandle}
              jsonSchema={jsonSchema}
              defaultValue={defaultValue}
              onChange={setValue}
              onStateChange={setGlobalState}
              CustomFormTypeRenderer={Renderer}
            />
          </StoryLayout>
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>GlobalState</legend>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 10,
              }}
            >
              {Object.keys(globalState).length === 0
                ? '(empty)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>Default Value (for reset)</legend>
            <pre
              style={{
                background: '#fff3e0',
                padding: 10,
              }}
            >
              {JSON.stringify(defaultValue, null, 2)}
            </pre>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
