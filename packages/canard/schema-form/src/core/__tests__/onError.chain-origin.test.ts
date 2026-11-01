import { expect, it } from 'vitest';

import { FormErrorCode, type FormErrorRecord } from '@/schema-form/errors';

import { FieldNodeState, ValidationMode } from '../engine';
import {
  adoptFieldNodeTree,
  batchFieldNodeLoad,
  mountFieldNode,
  reloadFieldNodeForm,
} from '../surface';
import { makeFieldNodeTree } from './makeFieldNodeTree';

const schema = {
  type: 'object',
  properties: { first: { type: 'string' }, second: { type: 'string' } },
} as const;

/** Create a loaded core-only tree with observable reports and no scheduled validation. */
const createTree = (records: FormErrorRecord[] = []) => {
  const tree = makeFieldNodeTree(schema, {
    errorReporter: {
      hasConsumer: () => true,
      report: (record) => records.push(record),
    },
  });
  Reflect.set(tree.runtime, 'validationMode', ValidationMode.None);
  mountFieldNode(tree.root, { first: 'initial', second: 'initial' });
  records.length = 0;
  return tree;
};

it('round b core-only reload reports a throwing onChange as load', () => {
  const records: FormErrorRecord[] = [];
  const tree = createTree(records);
  const failure = new Error('reload onChange');
  Reflect.set(tree.runtime, 'onChange', () => {
    throw failure;
  });
  expect(() => reloadFieldNodeForm(tree.root, { first: 'reload' })).toThrow(
    failure,
  );
  expect(
    records.map(({ code, origin, error }) => ({ code, origin, error })),
  ).toEqual([
    { code: FormErrorCode.ListenerThrew, origin: 'load', error: failure },
  ]);
});

it.each([false, true])(
  'round b outermost exit clears the current runtime (throw=%s)',
  (throwing) => {
    const tree = createTree();
    const failure = new Error('outermost');
    if (throwing)
      Reflect.set(tree.runtime, 'onChange', () => {
        throw failure;
      });
    const run = () => tree.root.find('/first')?.setValue('changed');
    if (throwing) expect(run).toThrow(failure);
    else run();
    expect(Reflect.get(tree.runtime, 'chainOrigin')).toBeUndefined();
  },
);

it.each([false, true])(
  'round b load adoption clears current and stale runtimes (throw=%s)',
  (throwing) => {
    const previous = createTree();
    const next = createTree();
    const failure = new Error('adopted load');
    const run = () =>
      batchFieldNodeLoad(previous.root, () => {
        adoptFieldNodeTree(previous.root, next.root);
        mountFieldNode(next.root, { first: 'replacement' });
        if (throwing) throw failure;
      });
    if (throwing) expect(run).toThrow(failure);
    else run();
    expect(Reflect.get(next.runtime, 'chainOrigin')).toBeUndefined();
    expect(Reflect.get(previous.runtime, 'chainOrigin')).toBeUndefined();
  },
);

it('round b standalone state delivery sets write during the listener and restores no origin', () => {
  const tree = createTree();
  const observed: unknown[] = [];
  expect(Reflect.get(tree.runtime, 'chainOrigin')).toBeUndefined();
  tree.root.subscribe(() =>
    observed.push(Reflect.get(tree.runtime, 'chainOrigin')),
  );
  tree.root.find('/first')?.setState({ [FieldNodeState.Touched]: true });
  expect(observed).toEqual(['write']);
  expect(Reflect.get(tree.runtime, 'chainOrigin')).toBeUndefined();
});
