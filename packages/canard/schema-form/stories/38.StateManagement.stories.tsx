import { useCallback, useRef, useState } from 'react';

import type { NodeStateFlags } from '@/schema-form/core/nodes';

import {
  type ArrayNode,
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JSONSchema,
  NodeEventType,
  NodeState,
  registerPlugin,
  useSchemaNodeTracker,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

registerPlugin(plugin);

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
  } satisfies JSONSchema;

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
  } satisfies JSONSchema;

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
  } satisfies JSONSchema;

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
  } satisfies JSONSchema;

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
            formHandle.current?.setValue((prev: any) => ({
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
/**
 * Tests setSubtreeState and clearSubtreeState methods on individual nodes.
 * - setSubtreeState: Sets state flags on a node and all its descendants
 * - clearSubtreeState: Clears state flags from a node and all its descendants
 */
export const SubtreeStateManagement = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      author: { type: 'string' },
      metadata: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
          },
          details: {
            type: 'object',
            properties: {
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
  } satisfies JSONSchema;

  const defaultValue = {
    title: 'My Article',
    author: 'John Doe',
    metadata: {
      category: 'Technology',
      tags: ['react', 'typescript'],
      details: {
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
      },
    },
  };

  const [value, setValue] = useState<any>(defaultValue);
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [nodeStates, setNodeStates] = useState<
    Record<string, NodeStateFlags | undefined>
  >({});
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  const refreshNodeStates = () => {
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

    const isSelected = selectedPath === node.path;

    return (
      <div
        style={{
          marginBottom: 4,
          marginLeft: depth * 12,
          padding: 6,
          borderLeft: `3px solid ${isSelected ? '#1976d2' : dirty || touched ? '#ff9800' : '#eee'}`,
          background: isSelected ? '#e3f2fd' : 'transparent',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPath(node.path);
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, minWidth: 80, fontWeight: 500 }}>
            {name}
          </label>
          {schemaType !== 'object' && schemaType !== 'array' && (
            <Input style={{ flex: 1, fontSize: 12, padding: 4 }} />
          )}
          {(schemaType === 'object' || schemaType === 'array') && <Input />}
          <span style={{ fontSize: 10, marginLeft: 'auto' }}>
            {dirty && (
              <span
                style={{
                  color: 'white',
                  background: '#f44336',
                  padding: '1px 4px',
                  borderRadius: 3,
                  marginRight: 4,
                }}
              >
                D
              </span>
            )}
            {touched && (
              <span
                style={{
                  color: 'white',
                  background: '#2196f3',
                  padding: '1px 4px',
                  borderRadius: 3,
                }}
              >
                T
              </span>
            )}
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
          {node.path}
        </div>
      </div>
    );
  };

  const handleSetSubtreeState = (flags: NodeStateFlags) => {
    const rootNode = formHandle.current?.node;
    if (!rootNode) return;

    const targetNode = selectedPath ? rootNode.find(selectedPath) : rootNode;
    if (targetNode) {
      targetNode.setSubtreeState(flags);
      setTimeout(refreshNodeStates, 10);
    }
  };

  const handleClearSubtreeState = () => {
    const rootNode = formHandle.current?.node;
    if (!rootNode) return;

    const targetNode = selectedPath ? rootNode.find(selectedPath) : rootNode;
    if (targetNode) {
      targetNode.clearSubtreeState();
      setTimeout(refreshNodeStates, 10);
    }
  };

  return (
    <div>
      <h3>setSubtreeState() & clearSubtreeState() Test</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        Click on a node to select it, then use the buttons to set or clear state
        flags on the entire subtree.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          padding: 10,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <div style={{ marginRight: 20 }}>
          <strong>Selected:</strong>{' '}
          <code style={{ background: '#e3f2fd', padding: '2px 6px' }}>
            {selectedPath || '(root)'}
          </code>
        </div>

        <button
          onClick={() => handleSetSubtreeState({ [NodeState.Dirty]: true })}
          style={{
            padding: '6px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Set Dirty on Subtree
        </button>
        <button
          onClick={() => handleSetSubtreeState({ [NodeState.Touched]: true })}
          style={{
            padding: '6px 12px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Set Touched on Subtree
        </button>
        <button
          onClick={() =>
            handleSetSubtreeState({
              [NodeState.Dirty]: true,
              [NodeState.Touched]: true,
            })
          }
          style={{
            padding: '6px 12px',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Set Both on Subtree
        </button>
        <button
          onClick={handleClearSubtreeState}
          style={{
            padding: '6px 12px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Clear Subtree State
        </button>
        <button
          onClick={refreshNodeStates}
          style={{
            padding: '6px 12px',
            background: '#607d8b',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🔄 Refresh States
        </button>
        <button
          onClick={() => setSelectedPath('')}
          style={{
            padding: '6px 12px',
            background: '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Select Root
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
                background: '#e8f5e9',
                padding: 10,
                fontSize: 11,
                maxHeight: 100,
                overflow: 'auto',
              }}
            >
              {Object.keys(globalState).length === 0
                ? '(empty)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>All Node States (click Refresh)</legend>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {Object.entries(nodeStates).map(([path, state]) => {
                const hasState = state && Object.keys(state).length > 0;
                return (
                  <div
                    key={path}
                    style={{
                      padding: 6,
                      borderBottom: '1px solid #eee',
                      fontSize: 10,
                      background:
                        path === selectedPath ? '#e3f2fd' : 'transparent',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{path || '(root)'}</div>
                    <div
                      style={{
                        color: hasState ? '#333' : '#999',
                        fontFamily: 'monospace',
                      }}
                    >
                      {hasState ? JSON.stringify(state) : '{}'}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

/**
 * Tests resetSubtree method on individual nodes.
 * - resetSubtree: Resets values of a node and all its descendants to their defaults
 */
export const ResetSubtreeMethod = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', default: 'Default Name' },
      settings: {
        type: 'object',
        properties: {
          theme: { type: 'string', default: 'light' },
          fontSize: { type: 'number', default: 14 },
          notifications: {
            type: 'object',
            properties: {
              email: { type: 'boolean', default: true },
              push: { type: 'boolean', default: false },
            },
          },
        },
      },
      preferences: {
        type: 'object',
        properties: {
          language: { type: 'string', default: 'en' },
          timezone: { type: 'string', default: 'UTC' },
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<any>({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [selectedPath, setSelectedPath] = useState<string>('');
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  const Renderer = ({
    depth,
    name,
    node,
    Input,
    schemaType,
  }: FormTypeRendererProps) => {
    useSchemaNodeTracker(
      node,
      NodeEventType.UpdateState | NodeEventType.UpdateValue,
    );

    if (depth === 0) return <Input />;

    const isSelected = selectedPath === node.path;

    return (
      <div
        style={{
          marginBottom: 4,
          marginLeft: depth * 12,
          padding: 8,
          borderLeft: `3px solid ${isSelected ? '#4caf50' : '#eee'}`,
          background: isSelected ? '#e8f5e9' : 'transparent',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPath(node.path);
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, minWidth: 100, fontWeight: 500 }}>
            {name}
          </label>
          {schemaType !== 'object' && schemaType !== 'array' && (
            <Input style={{ flex: 1, fontSize: 12, padding: 4 }} />
          )}
          {(schemaType === 'object' || schemaType === 'array') && <Input />}
        </div>
        <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
          {node.path}
        </div>
      </div>
    );
  };

  const handleResetSubtree = () => {
    const rootNode = formHandle.current?.node;
    if (!rootNode) return;

    const targetNode = selectedPath ? rootNode.find(selectedPath) : rootNode;
    if (targetNode) {
      targetNode.resetSubtree();
    }
  };

  const handleSetRandomValues = () => {
    // setValue(randomValue);
    formHandle.current?.setValue({
      name: 'Modified Name ' + Math.floor(Math.random() * 100),
      settings: {
        theme: Math.random() > 0.5 ? 'dark' : 'custom',
        fontSize: Math.floor(Math.random() * 20) + 10,
        notifications: {
          email: Math.random() > 0.5,
          push: Math.random() > 0.5,
        },
      },
      preferences: {
        language: ['ko', 'ja', 'zh', 'es'][Math.floor(Math.random() * 4)],
        timezone: ['PST', 'EST', 'KST', 'JST'][Math.floor(Math.random() * 4)],
      },
    });
  };

  return (
    <div>
      <h3>resetSubtree() Method Test</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        1. Click "Set Random Values" to modify the form
        <br />
        2. Select a node by clicking on it
        <br />
        3. Click "Reset Subtree" to reset only that subtree to default values
      </p>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          padding: 10,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <div style={{ marginRight: 20 }}>
          <strong>Selected:</strong>{' '}
          <code style={{ background: '#e8f5e9', padding: '2px 6px' }}>
            {selectedPath || '(root)'}
          </code>
        </div>

        <button
          onClick={handleSetRandomValues}
          style={{
            padding: '8px 16px',
            background: '#673ab7',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🎲 Set Random Values
        </button>
        <button
          onClick={handleResetSubtree}
          style={{
            padding: '8px 16px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🔄 Reset Selected Subtree
        </button>
        <button
          onClick={() => formHandle.current?.reset()}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Reset Entire Form
        </button>
        <button
          onClick={() => setSelectedPath('')}
          style={{
            padding: '8px 16px',
            background: '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Select Root
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
            <legend>Current Value</legend>
            <pre
              style={{
                background: '#fff3e0',
                padding: 10,
                fontSize: 11,
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(value, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>Default Values (reset target)</legend>
            <pre
              style={{
                background: '#e8f5e9',
                padding: 10,
                fontSize: 11,
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(
                {
                  name: 'Default Name',
                  settings: {
                    theme: 'light',
                    fontSize: 14,
                    notifications: {
                      email: true,
                      push: false,
                    },
                  },
                  preferences: {
                    language: 'en',
                    timezone: 'UTC',
                  },
                },
                null,
                2,
              )}
            </pre>
          </fieldset>
          <fieldset>
            <legend>GlobalState</legend>
            <pre
              style={{
                background: '#e8f5e9',
                padding: 10,
                fontSize: 11,
                maxHeight: 100,
                overflow: 'auto',
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

export const ClearStateVsReset = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
  } satisfies JSONSchema;

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

/**
 * ## FormHandle setState 메서드
 *
 * FormHandle의 `setState()` 메서드를 사용하여 전체 폼에 상태를 설정합니다.
 * - `formHandle.setState(state)`: 루트 노드의 setSubtreeState()를 호출하여 전체 폼 트리에 상태 적용
 * - `formHandle.clearState()`: 루트 노드의 clearSubtreeState()를 호출하여 전체 폼 상태 초기화
 * - `formHandle.getState()`: 글로벌 상태 조회
 */
export const FormHandleSetState = () => {
  const formHandleRef = useRef<FormHandle>(null);
  const [formValue, setFormValue] = useState({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev.slice(-19),
      `[${new Date().toISOString().slice(11, 19)}] ${message}`,
    ]);
  }, []);

  const handleSetDirty = useCallback(() => {
    formHandleRef.current?.setState({ [NodeState.Dirty]: true });
    addLog('setState({ Dirty: true }) 호출됨');
  }, [addLog]);

  const handleSetTouched = useCallback(() => {
    formHandleRef.current?.setState({ [NodeState.Touched]: true });
    addLog('setState({ Touched: true }) 호출됨');
  }, [addLog]);

  const handleSetShowError = useCallback(() => {
    formHandleRef.current?.setState({ [NodeState.ShowError]: true });
    addLog('setState({ ShowError: true }) 호출됨');
  }, [addLog]);

  const handleSetMultiple = useCallback(() => {
    formHandleRef.current?.setState({
      [NodeState.Dirty]: true,
      [NodeState.Touched]: true,
      [NodeState.ShowError]: true,
    });
    addLog('setState({ Dirty: true, Touched: true, ShowError: true }) 호출됨');
  }, [addLog]);

  const handleClearState = useCallback(() => {
    formHandleRef.current?.clearState();
    addLog('clearState() 호출됨');
  }, [addLog]);

  const handleRefreshState = useCallback(() => {
    const state = formHandleRef.current?.getState() || {};
    setGlobalState(state);
    addLog(`현재 글로벌 상태: ${JSON.stringify(state)}`);
  }, [addLog]);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20 }}
    >
      <h3>FormHandle setState 메서드 테스트</h3>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <Form
            ref={formHandleRef}
            jsonSchema={formHandleSetStateSchema}
            onChange={setFormValue}
            onStateChange={setGlobalState}
          />
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>FormHandle 상태 설정 (전체 폼)</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleSetDirty}>setState(Dirty: true)</button>
              <button onClick={handleSetTouched}>
                setState(Touched: true)
              </button>
              <button onClick={handleSetShowError}>
                setState(ShowError: true)
              </button>
              <button
                onClick={handleSetMultiple}
                style={{ background: '#e3f2fd' }}
              >
                setState(All: true)
              </button>
              <button
                onClick={handleClearState}
                style={{ background: '#ffebee' }}
              >
                clearState()
              </button>
              <button
                onClick={handleRefreshState}
                style={{ background: '#f5f5f5' }}
              >
                getState() 새로고침
              </button>
            </div>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>GlobalState</legend>
            <pre style={{ background: '#f5f5f5', padding: 10 }}>
              {Object.keys(globalState).length === 0
                ? '(empty)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>Form Value</legend>
            <pre style={{ background: '#e8f5e9', padding: 10 }}>
              {JSON.stringify(formValue, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>로그</legend>
            <div
              style={{
                maxHeight: 200,
                overflow: 'auto',
                fontSize: 12,
                fontFamily: 'monospace',
                background: '#fafafa',
                padding: 8,
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: '#999' }}>(로그 없음)</span>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

const formHandleSetStateSchema: JSONSchema = {
  type: 'object',
  required: ['profile', 'settings'],
  properties: {
    profile: {
      type: 'object',
      title: '프로필',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', title: '이름', minLength: 2 },
        email: { type: 'string', title: '이메일', format: 'email' },
      },
    },
    settings: {
      type: 'object',
      title: '설정',
      required: ['theme'],
      properties: {
        notifications: { type: 'boolean', title: '알림 받기' },
        theme: {
          type: 'string',
          title: '테마',
          enum: ['light', 'dark', 'auto'],
        },
      },
    },
  },
};

/**
 * ## Array 서브트리 상태 관리
 *
 * 배열 노드의 개별 항목에 대해 서브트리 상태 관리를 테스트합니다.
 * - 특정 배열 항목을 선택하여 해당 항목의 서브트리에만 상태 적용
 * - 배열 항목 내의 중첩 객체에 대한 상태 관리
 */
export const ArraySubtreeState = () => {
  const formHandleRef = useRef<FormHandle>(null);
  const [formValue, setFormValue] = useState({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev.slice(-14),
      `[${new Date().toISOString().slice(11, 19)}] ${message}`,
    ]);
  }, []);

  const handleSelectItem = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      addLog(`항목 ${index} 선택됨`);
    },
    [addLog],
  );

  const handleSetItemState = useCallback(
    (state: NodeStateFlags) => {
      if (selectedIndex === null) {
        addLog('먼저 항목을 선택해주세요');
        return;
      }
      const node = formHandleRef.current?.findNode(`/items/${selectedIndex}`);
      if (node) {
        node.setSubtreeState(state);
        addLog(
          `항목 ${selectedIndex}에 setSubtreeState(${JSON.stringify(state)}) 호출됨`,
        );
      }
    },
    [selectedIndex, addLog],
  );

  const handleClearItemState = useCallback(() => {
    if (selectedIndex === null) {
      addLog('먼저 항목을 선택해주세요');
      return;
    }
    const node = formHandleRef.current?.findNode(`/items/${selectedIndex}`);
    if (node) {
      node.clearSubtreeState();
      addLog(`항목 ${selectedIndex}에 clearSubtreeState() 호출됨`);
    }
  }, [selectedIndex, addLog]);

  const handleResetItem = useCallback(() => {
    if (selectedIndex === null) {
      addLog('먼저 항목을 선택해주세요');
      return;
    }
    const node = formHandleRef.current?.findNode(`/items/${selectedIndex}`);
    if (node) {
      node.resetSubtree();
      addLog(`항목 ${selectedIndex}에 resetSubtree() 호출됨`);
    }
  }, [selectedIndex, addLog]);

  const handleAddItem = useCallback(() => {
    const arrayNode = formHandleRef.current?.findNode(
      '/items',
    ) as ArrayNode | null;
    if (arrayNode) {
      arrayNode.push();
      addLog('새 항목 추가됨');
    }
  }, [addLog]);

  const handleSetAllItemsState = useCallback(() => {
    const arrayNode = formHandleRef.current?.findNode(
      '/items',
    ) as ArrayNode | null;
    if (arrayNode) {
      arrayNode.setSubtreeState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
      addLog('모든 항목에 setSubtreeState() 호출됨');
    }
  }, [addLog]);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20 }}
    >
      <h3>Array 서브트리 상태 관리</h3>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <Form
            ref={formHandleRef}
            jsonSchema={arraySubtreeStateSchema}
            onChange={setFormValue}
            onStateChange={setGlobalState}
            defaultValue={{
              items: [
                { name: '항목 1', description: '첫 번째 항목' },
                { name: '항목 2', description: '두 번째 항목' },
              ],
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>배열 항목 선택</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectItem(i)}
                  style={{
                    background: selectedIndex === i ? '#bbdefb' : undefined,
                    fontWeight: selectedIndex === i ? 'bold' : undefined,
                  }}
                >
                  항목 {i} 선택
                </button>
              ))}
              <button onClick={handleAddItem} style={{ background: '#c8e6c9' }}>
                + 새 항목 추가
              </button>
            </div>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>선택된 항목 조작 (항목 {selectedIndex ?? '-'})</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => handleSetItemState({ [NodeState.Dirty]: true })}
                disabled={selectedIndex === null}
              >
                setSubtreeState(Dirty)
              </button>
              <button
                onClick={() =>
                  handleSetItemState({ [NodeState.Touched]: true })
                }
                disabled={selectedIndex === null}
              >
                setSubtreeState(Touched)
              </button>
              <button
                onClick={handleClearItemState}
                disabled={selectedIndex === null}
                style={{ background: '#ffebee' }}
              >
                clearSubtreeState()
              </button>
              <button
                onClick={handleResetItem}
                disabled={selectedIndex === null}
                style={{ background: '#fff3e0' }}
              >
                resetSubtree()
              </button>
            </div>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>전체 배열 조작</legend>
            <button onClick={handleSetAllItemsState} style={{ width: '100%' }}>
              모든 항목에 setSubtreeState()
            </button>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>GlobalState</legend>
            <pre style={{ background: '#f5f5f5', padding: 10, fontSize: 11 }}>
              {Object.keys(globalState).length === 0
                ? '(empty)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>Form Value</legend>
            <pre style={{ background: '#e8f5e9', padding: 10, fontSize: 11 }}>
              {JSON.stringify(formValue, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>로그</legend>
            <div
              style={{
                maxHeight: 150,
                overflow: 'auto',
                fontSize: 11,
                fontFamily: 'monospace',
                background: '#fafafa',
                padding: 8,
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: '#999' }}>(로그 없음)</span>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

const arraySubtreeStateSchema: JSONSchema = {
  type: 'object',
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      title: '항목 목록',
      minItems: 1,
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', title: '이름', minLength: 2 },
          description: { type: 'string', title: '설명', maxLength: 100 },
          tags: {
            type: 'array',
            title: '태그',
            minItems: 1,
            items: { type: 'string', minLength: 1 },
          },
        },
      },
    },
  },
};

/**
 * ## 조건부 스키마 상태 관리
 *
 * oneOf 조건부 스키마와 함께 상태 관리가 어떻게 동작하는지 테스트합니다.
 * - 조건에 따라 표시되는 필드가 달라질 때 상태 관리
 * - 조건 변경 시 이전 조건의 필드 상태 처리
 */
export const ConditionalSchemaState = () => {
  const formHandleRef = useRef<FormHandle>(null);
  const [formValue, setFormValue] = useState({});
  const [globalState, setGlobalState] = useState<NodeStateFlags>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev.slice(-14),
      `[${new Date().toISOString().slice(11, 19)}] ${message}`,
    ]);
  }, []);

  const handleSetTypeState = useCallback(() => {
    const typeNode = formHandleRef.current?.findNode('/type');
    if (typeNode) {
      typeNode.setSubtreeState({ [NodeState.Dirty]: true });
      addLog(`type 노드에 Dirty 상태 설정`);
    }
  }, [addLog]);

  const handleSetConditionalFieldState = useCallback(() => {
    // oneOf 조건에 따라 나타나는 필드들의 상태를 설정
    const possiblePaths = ['/studentId', '/employeeId', '/retiredId'];
    for (const path of possiblePaths) {
      const node = formHandleRef.current?.findNode(path);
      if (node && node.visible !== false) {
        node.setSubtreeState({
          [NodeState.Touched]: true,
          [NodeState.ShowError]: true,
        });
        addLog(`${path} 노드에 Touched, ShowError 상태 설정`);
      }
    }
  }, [addLog]);

  const handleClearAllState = useCallback(() => {
    formHandleRef.current?.clearState();
    addLog('전체 폼 상태 초기화');
  }, [addLog]);

  const handleChangeType = useCallback(
    (type: string) => {
      const typeNode = formHandleRef.current?.findNode('/type');
      if (typeNode) {
        (typeNode as any).setValue(type);
        addLog(`type을 '${type}'로 변경`);
      }
    },
    [addLog],
  );

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20 }}
    >
      <h3>조건부 스키마 상태 관리</h3>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <Form
            ref={formHandleRef}
            jsonSchema={conditionalSchemaStateSchema}
            onChange={setFormValue}
            onStateChange={setGlobalState}
            defaultValue={{ type: 'student' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>타입 변경 (oneOf 조건)</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => handleChangeType('student')}>
                학생으로 변경
              </button>
              <button onClick={() => handleChangeType('employee')}>
                직원으로 변경
              </button>
              <button onClick={() => handleChangeType('retired')}>
                은퇴자로 변경
              </button>
            </div>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>상태 조작</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleSetTypeState}>type 필드 Dirty 설정</button>
              <button onClick={handleSetConditionalFieldState}>
                조건부 필드 Touched/ShowError 설정
              </button>
              <button
                onClick={handleClearAllState}
                style={{ background: '#ffebee' }}
              >
                전체 상태 초기화
              </button>
            </div>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>GlobalState</legend>
            <pre style={{ background: '#f5f5f5', padding: 10, fontSize: 11 }}>
              {Object.keys(globalState).length === 0
                ? '(empty)'
                : JSON.stringify(globalState, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>Form Value</legend>
            <pre style={{ background: '#e8f5e9', padding: 10, fontSize: 11 }}>
              {JSON.stringify(formValue, null, 2)}
            </pre>
          </fieldset>

          <fieldset style={{ marginTop: 10 }}>
            <legend>로그</legend>
            <div
              style={{
                maxHeight: 150,
                overflow: 'auto',
                fontSize: 11,
                fontFamily: 'monospace',
                background: '#fafafa',
                padding: 8,
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: '#999' }}>(로그 없음)</span>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

const conditionalSchemaStateSchema: JSONSchema = {
  type: 'object',
  required: ['name', 'type'],
  properties: {
    name: { type: 'string', title: '이름', minLength: 2 },
    type: {
      type: 'string',
      title: '유형',
      enum: ['student', 'employee', 'retired'],
    },
  },
  oneOf: [
    {
      '&if': "./type === 'student'",
      required: ['studentId', 'major'],
      properties: {
        studentId: { type: 'string', title: '학번', pattern: '^[A-Z][0-9]{8}$' },
        major: { type: 'string', title: '전공', minLength: 2 },
        grade: { type: 'number', title: '학년', minimum: 1, maximum: 4 },
      },
    },
    {
      '&if': "./type === 'employee'",
      required: ['employeeId', 'department'],
      properties: {
        employeeId: { type: 'string', title: '사번', pattern: '^EMP[0-9]{5}$' },
        department: { type: 'string', title: '부서', minLength: 2 },
        position: { type: 'string', title: '직급' },
      },
    },
    {
      '&if': "./type === 'retired'",
      required: ['retiredId', 'retirementDate'],
      properties: {
        retiredId: { type: 'string', title: '은퇴자 ID', pattern: '^RET[0-9]{5}$' },
        retirementDate: { type: 'string', title: '은퇴일', format: 'date' },
      },
    },
  ],
};
