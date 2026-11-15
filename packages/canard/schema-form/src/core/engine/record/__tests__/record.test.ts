import { describe, expect, it } from 'vitest';

import { blueprint } from '@/schema-form/core/engine/blueprint';
import { PathKeyedSet } from '@/schema-form/core/engine/utils/pathIndex/PathKeyedSet';

import { FieldNodeEventType } from '../constants/FieldNodeEventType';
import { EMPTY_REVISION_LEDGER } from '../constants/emptyRevisionLedger';
import type { FieldNodeRecord } from '../types/record';
import { captureFieldNodeChange } from '../utils/captureFieldNodeChange';
import { clearFieldNodeChanges } from '../utils/clearFieldNodeChanges';
import { patchFieldNodeInteractionState } from '../utils/patchFieldNodeInteractionState';
import { shallowPatch } from '../utils/shallowPatch';
import { updateFieldNodeNameAndPath } from '../utils/updateFieldNodeNameAndPath';

/** The smallest structural self type needed by the path operation. */
interface PathNode {
  /** Canonical address used when deriving a child address. */
  path: string;
  /** Depth used when deriving a child depth. */
  depth: number;
}

/** Build a plain record with all required slots and no engine implementation. */
const makeRecord = (): FieldNodeRecord<PathNode> => {
  const analysis = blueprint({ type: 'object' });
  const blueprintNode = analysis.root;
  return {
    behavior: {
      interpret: (input) => input,
      assemble: (_node, children) => children,
      project: (_node, value) => value,
      finishInput: () => undefined,
      declareChildren: (node) => node.blueprintNode.childEntries,
      arrange: () => ({ kind: 'noop' }),
      type: 'object',
      strategy: 'branch',
    },
    runtime: {
      blueprint: analysis,
      diagnostics: { status: 'stable' },
      context: {},
      nodeFactory: (_entry, parent) => ({
        path: parent?.path ?? '',
        depth: parent?.depth ?? 0,
      }),
      globalStateCounts: new Map(),
      globalState: {},
      loadSnapshot: undefined,

      misfitPaths: new PathKeyedSet(),
    },
    blueprintNode,
    parent: null,
    rootNode: { path: '', depth: 0 },
    name: '',
    escapedName: '',
    path: '',
    depth: 0,
    isRequired: false,
    isNullable: false,
    schemaType: blueprintNode.schemaType,
    childrenByName: {},
    children: [],
    itemKey: null,
    itemCount: 0,
    nextItemKey: 0,
    source: undefined,
    extras: undefined,
    isActive: true,
    isVisible: true,
    isReadOnly: false,
    isDisabled: false,
    storedValue: undefined,
    storedOutputValue: undefined,
    divergenceCurrent: undefined,
    divergencePath: undefined,
    divergenceSegments: undefined,
    divergenceBase: undefined,
    storedIsDivergent: false,
    schema: { schema: {}, hasTypeConflict: false },
    interactionState: {},
    revisionLedger: EMPTY_REVISION_LEDGER,
    isDeliveryInitialized: false,
    deliveryChanges: 0,
    pendingRevisionMask: 0,
    isDetached: false,
    isDisposed: false,
    interactionEpoch: 0,
  };
};

// filid:contract record-layout
describe('record layout operations', () => {
  it('captures the first value baseline while later writes and A-B-A retain it', () => {
    const node = makeRecord();
    node.isDeliveryInitialized = true;
    node.storedValue = node.storedOutputValue = 'A';
    node.storedValue = captureFieldNodeChange(node, 'storedValue', 'B');
    node.storedOutputValue = captureFieldNodeChange(
      node,
      'storedOutputValue',
      'C',
    );
    expect(node.deliveryChanges).toBe(FieldNodeEventType.UpdateValue);
    expect(node.deliveryPreviousValue).toBe('A');
    expect(node.deliveryPreviousOutputValue).toBe('A');
    node.storedValue = captureFieldNodeChange(node, 'storedValue', 'A');
    node.storedOutputValue = captureFieldNodeChange(
      node,
      'storedOutputValue',
      'A',
    );
    expect(node.deliveryPreviousValue).toBe(node.storedValue);
    expect(node.deliveryPreviousOutputValue).toBe(node.storedOutputValue);
    clearFieldNodeChanges(node);
    expect(node.deliveryChanges).toBe(0);
    expect(node.deliveryPreviousValue).toBeUndefined();
    expect(node.deliveryPreviousOutputValue).toBeUndefined();
  });

  it('keeps distinct first baselines for path, children, computed, schema and state', () => {
    const node = makeRecord();
    node.isDeliveryInitialized = true;
    const children = node.children,
      schema = node.schema,
      state = node.interactionState;
    node.path = captureFieldNodeChange(node, 'path', '/next');
    node.children = captureFieldNodeChange(node, 'children', []);
    node.isVisible = captureFieldNodeChange(node, 'isVisible', false);
    node.isDisabled = captureFieldNodeChange(node, 'isDisabled', true);
    node.schema = captureFieldNodeChange(node, 'schema', {
      schema: { title: 'next' },
      hasTypeConflict: false,
    });
    node.interactionState = captureFieldNodeChange(node, 'interactionState', {
      edited: true,
    });
    expect(node.deliveryPreviousPath).toBe('');
    expect(node.deliveryPreviousChildren).toBe(children);
    expect(node.deliveryPreviousComputedBits).toBe(3);
    expect(node.deliveryPreviousSchema).toBe(schema);
    expect(node.deliveryPreviousState).toBe(state);
    clearFieldNodeChanges(node);
    expect([
      node.deliveryPreviousPath,
      node.deliveryPreviousChildren,
      node.deliveryPreviousComputedBits,
      node.deliveryPreviousSchema,
      node.deliveryPreviousState,
    ]).toEqual([undefined, undefined, undefined, undefined, undefined]);
    expect(node.path).toBe('/next');
    expect(node.isVisible).toBe(false);
    expect(node.interactionState).toEqual({ edited: true });
  });

  it('allocates no change records for initialization or equal assignments', () => {
    const node = makeRecord();
    expect(captureFieldNodeChange(node, 'storedValue', 'first')).toBe('first');
    expect(node.deliveryChanges).toBe(0);
    expect(node.storedValue).toBeUndefined();
    node.isDeliveryInitialized = true;
    expect(
      captureFieldNodeChange(node, 'storedValue', undefined),
    ).toBeUndefined();
    expect(node.deliveryChanges).toBe(0);
    expect(node.runtime.deliveryAffectedPaths).toBeUndefined();
  });

  it('keeps the same state reference for an unchanged shallow patch', () => {
    const state = { touched: true };
    expect(shallowPatch(state, { touched: true })).toBe(state);
  });

  it('copies changed state and removes keys patched with undefined', () => {
    const state = { touched: true, edited: true };
    const next = shallowPatch(state, { touched: undefined, edited: false });
    expect(next).toEqual({ edited: false });
    expect(next).not.toBe(state);
    expect(state).toEqual({ touched: true, edited: true });
  });

  it('escapes pointer names and derives the child path and depth', () => {
    const node = makeRecord();
    updateFieldNodeNameAndPath<PathNode>(node, 'a~/b', {
      path: '/root',
      depth: 2,
    });
    expect([node.name, node.escapedName, node.path, node.depth]).toEqual([
      'a~/b',
      'a~0~1b',
      '/root/a~0~1b',
      3,
    ]);
  });

  it('uses an empty absolute path for the root', () => {
    const node = makeRecord();
    updateFieldNodeNameAndPath<PathNode>(node, '', null);
    expect([node.path, node.depth, node.parent]).toEqual(['', 0, null]);
  });

  it('leaves a detached reference unchanged when interaction flags are patched', () => {
    const node = makeRecord();
    node.isDetached = true;
    const state = node.interactionState;
    patchFieldNodeInteractionState(node, { touched: true });
    expect(node.interactionState).toBe(state);
    expect(node.interactionState).toEqual({});
  });

  it('retains the state reference for a no-op interaction patch', () => {
    const node = makeRecord();
    node.interactionState = { touched: true };
    const state = node.interactionState;
    patchFieldNodeInteractionState(node, { touched: true });
    expect(node.interactionState).toBe(state);
  });
});
