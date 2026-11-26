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
    __parent__: null,
    rootNode: { path: '', depth: 0 },
    name: '',
    escapedName: '',
    path: '',
    depth: 0,
    isRequired: false,
    isNullable: false,
    schemaType: blueprintNode.schemaType,
    __childrenByName__: {},
    children: [],
    __itemKey__: null,
    __itemCount__: 0,
    __nextItemKey__: 0,
    source: undefined,
    extras: undefined,
    isActive: true,
    isVisible: true,
    isReadOnly: false,
    isDisabled: false,
    __value__: undefined,
    __outputValue__: undefined,
    __divergenceCurrent__: undefined,
    __divergencePath__: undefined,
    __divergenceSegments__: undefined,
    __divergenceBase__: undefined,
    __isDivergent__: false,
    __schema__: { schema: {}, hasTypeConflict: false },
    __state__: {},
    __revisionLedger__: EMPTY_REVISION_LEDGER,
    __isDeliveryInitialized__: false,
    __deliveryChanges__: 0,
    __pendingRevisionMask__: 0,
    isDetached: false,
    isDisposed: false,
    __interactionEpoch__: 0,
  };
};

// filid:contract record-layout
describe('record layout operations', () => {
  it('captures the first value baseline while later writes and A-B-A retain it', () => {
    const node = makeRecord();
    node.__isDeliveryInitialized__ = true;
    node.__value__ = node.__outputValue__ = 'A';
    node.__value__ = captureFieldNodeChange(node, '__value__', 'B');
    node.__outputValue__ = captureFieldNodeChange(node, '__outputValue__', 'C');
    expect(node.__deliveryChanges__).toBe(FieldNodeEventType.UpdateValue);
    expect(node.__deliveryPreviousValue__).toBe('A');
    expect(node.__deliveryPreviousOutputValue__).toBe('A');
    node.__value__ = captureFieldNodeChange(node, '__value__', 'A');
    node.__outputValue__ = captureFieldNodeChange(node, '__outputValue__', 'A');
    expect(node.__deliveryPreviousValue__).toBe(node.__value__);
    expect(node.__deliveryPreviousOutputValue__).toBe(node.__outputValue__);
    clearFieldNodeChanges(node);
    expect(node.__deliveryChanges__).toBe(0);
    expect(node.__deliveryPreviousValue__).toBeUndefined();
    expect(node.__deliveryPreviousOutputValue__).toBeUndefined();
  });

  it('keeps distinct first baselines for path, children, computed, schema and state', () => {
    const node = makeRecord();
    node.__isDeliveryInitialized__ = true;
    const children = node.children,
      schema = node.__schema__,
      state = node.__state__;
    node.path = captureFieldNodeChange(node, 'path', '/next');
    node.children = captureFieldNodeChange(node, 'children', []);
    node.isVisible = captureFieldNodeChange(node, 'isVisible', false);
    node.isDisabled = captureFieldNodeChange(node, 'isDisabled', true);
    node.__schema__ = captureFieldNodeChange(node, '__schema__', {
      schema: { title: 'next' },
      hasTypeConflict: false,
    });
    node.__state__ = captureFieldNodeChange(node, '__state__', {
      edited: true,
    });
    expect(node.__deliveryPreviousPath__).toBe('');
    expect(node.__deliveryPreviousChildren__).toBe(children);
    expect(node.__deliveryPreviousComputedBits__).toBe(3);
    expect(node.__deliveryPreviousSchema__).toBe(schema);
    expect(node.__deliveryPreviousState__).toBe(state);
    clearFieldNodeChanges(node);
    expect([
      node.__deliveryPreviousPath__,
      node.__deliveryPreviousChildren__,
      node.__deliveryPreviousComputedBits__,
      node.__deliveryPreviousSchema__,
      node.__deliveryPreviousState__,
    ]).toEqual([undefined, undefined, undefined, undefined, undefined]);
    expect(node.path).toBe('/next');
    expect(node.isVisible).toBe(false);
    expect(node.__state__).toEqual({ edited: true });
  });

  it('allocates no change records for initialization or equal assignments', () => {
    const node = makeRecord();
    expect(captureFieldNodeChange(node, '__value__', 'first')).toBe('first');
    expect(node.__deliveryChanges__).toBe(0);
    expect(node.__value__).toBeUndefined();
    node.__isDeliveryInitialized__ = true;
    expect(
      captureFieldNodeChange(node, '__value__', undefined),
    ).toBeUndefined();
    expect(node.__deliveryChanges__).toBe(0);
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
    expect([node.path, node.depth, node.__parent__]).toEqual(['', 0, null]);
  });

  it('leaves a detached reference unchanged when interaction flags are patched', () => {
    const node = makeRecord();
    node.isDetached = true;
    const state = node.__state__;
    patchFieldNodeInteractionState(node, { touched: true });
    expect(node.__state__).toBe(state);
    expect(node.__state__).toEqual({});
  });

  it('retains the state reference for a no-op interaction patch', () => {
    const node = makeRecord();
    node.__state__ = { touched: true };
    const state = node.__state__;
    patchFieldNodeInteractionState(node, { touched: true });
    expect(node.__state__).toBe(state);
  });
});
