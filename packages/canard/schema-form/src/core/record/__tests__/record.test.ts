import { describe, expect, it } from 'vitest';

import { blueprint } from '../../blueprint';
import { EMPTY_REVISION_LEDGER } from '../index';
import type { SchemaNodeRecord } from '../index';
import {
  patchSchemaNodeInteractionState,
  shallowPatch,
  updateSchemaNodeNameAndPath,
} from '../index';

/** The smallest structural self type needed by the path operation. */
interface PathNode {
  /** Canonical address used when deriving a child address. */
  path: string;
  /** Depth used when deriving a child depth. */
  depth: number;
}

/** Build a plain record with all required slots and no engine implementation. */
const makeRecord = (): SchemaNodeRecord<PathNode> => {
  const analysis = blueprint({ type: 'object' });
  const blueprintNode = analysis.root;
  return {
    behavior: {
      interpret: (input) => input,
      assemble: (_node, children) => children,
      project: (_node, local) => local,
      finishInput: () => undefined,
      declareChildren: (node) => node.blueprintNode.childEntries,
      type: 'object',
      strategy: 'branch',
    },
    runtime: {
      blueprint: analysis,
      diagnostics: { status: 'stable' },
      nodeFactory: (_entry, parent) => ({
        path: parent?.path ?? '',
        depth: parent?.depth ?? 0,
      }),
      loadSnapshot: undefined,
      latentRaw: new Map(),
      typeMismatchPaths: new Set(),
      inactiveValuesMemo: new Map(),
    },
    blueprintNode,
    parent: null,
    rootNode: { path: '', depth: 0 },
    name: '',
    escapedName: '',
    path: '',
    depth: 0,
    required: false,
    nullable: false,
    schemaType: blueprintNode.schemaType,
    structure: {},
    children: [],
    raw: undefined,
    extras: undefined,
    active: true,
    visible: true,
    readOnly: false,
    disabled: false,
    local: undefined,
    emit: undefined,
    schema: { schema: {}, typeConflict: false },
    state: {},
    revisionLedger: EMPTY_REVISION_LEDGER,
    detached: false,
  };
};

// filid:contract record-layout
describe('record layout operations', () => {
  it('keeps the same state reference for an unchanged shallow patch', () => {
    const state = { touched: true };
    expect(shallowPatch(state, { touched: true })).toBe(state);
  });

  it('copies changed state and removes keys patched with undefined', () => {
    const state = { touched: true, dirty: true };
    const next = shallowPatch(state, { touched: undefined, dirty: false });
    expect(next).toEqual({ dirty: false });
    expect(next).not.toBe(state);
    expect(state).toEqual({ touched: true, dirty: true });
  });

  it('escapes pointer names and derives the child path and depth', () => {
    const node = makeRecord();
    updateSchemaNodeNameAndPath<PathNode>(node, 'a~/b', {
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
    updateSchemaNodeNameAndPath<PathNode>(node, '', null);
    expect([node.path, node.depth, node.parent]).toEqual(['', 0, null]);
  });

  it('leaves a detached reference unchanged when interaction flags are patched', () => {
    const node = makeRecord();
    node.detached = true;
    const state = node.state;
    patchSchemaNodeInteractionState(node, { touched: true });
    expect(node.state).toBe(state);
    expect(node.state).toEqual({});
  });

  it('retains the state reference for a no-op interaction patch', () => {
    const node = makeRecord();
    node.state = { touched: true };
    const state = node.state;
    patchSchemaNodeInteractionState(node, { touched: true });
    expect(node.state).toBe(state);
  });
});
