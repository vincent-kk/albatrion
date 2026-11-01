import { afterEach, expect, it, vi } from 'vitest';

import { FieldNodeEventType, FieldNodeState } from '../../engine';
import * as settlement from '../../engine/settle/utils/settlement/finishSettlement';
import { requireRuntimeFieldNode } from '../runtime/requireRuntimeFieldNode';
import { setContext } from '../runtime/setContext';
import { reloadFieldNodeForm } from '../utils/binding/reloadFieldNodeForm';
import { makeVocabularyTree } from './fixtures/makeVocabularyTree';

afterEach(() => vi.restoreAllMocks());

it('a load that throws before commit keeps the preceding baseline', () => {
  const root = makeVocabularyTree({ type: 'string' }, 'loaded');
  root.setValue('edited');
  const runtime = requireRuntimeFieldNode(root).runtime;
  const baseline: unknown = Reflect.get(runtime, 'loadBaseline');
  expect(baseline).toBeDefined();
  vi.spyOn(settlement, 'finishSettlement').mockImplementationOnce(() => {
    throw new Error('before commit');
  });
  expect(() => reloadFieldNodeForm(root, 'failed load')).toThrow(
    'before commit',
  );
  expect(Reflect.get(runtime, 'loadBaseline')).toBe(baseline);
});

it('a reset to the same output moves the baseline without UpdateValue', () => {
  const root = makeVocabularyTree({ type: 'string' }, 'loaded');
  root.setValue('edited');
  expect(root.isDivergent).toBe(true);
  const events: number[] = [];
  root.subscribe(({ type }) => events.push(type));
  reloadFieldNodeForm(root, 'edited');
  expect(events.some((type) => !!(type & FieldNodeEventType.UpdateValue))).toBe(
    false,
  );
  expect(events.some((type) => !!(type & FieldNodeEventType.UpdateState))).toBe(
    true,
  );
  expect(root.isDivergent).toBe(false);
});

it('detached interaction getters keep their last committed state', () => {
  const root = makeVocabularyTree(
    {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        a: { type: 'string', controls: { active: '../flag' } },
      },
    },
    { flag: true, a: 'loaded' },
  );
  const node = root.find('/a');
  node?.setState({
    [FieldNodeState.Edited]: true,
    [FieldNodeState.Touched]: true,
  });
  root.find('/flag')?.setValue(false);
  expect(node?.isEdited).toBe(true);
  expect(node?.isTouched).toBe(true);
  expect(node?.isDivergent).toBe(false);
});

it('mid-settlement context reads after remove and reset do not poison later reads', () => {
  const root = makeVocabularyTree(
    {
      type: 'object',
      properties: {
        arr: { type: 'array', items: { type: 'string' } },
        a: { type: 'string' },
        d: { type: 'string', controls: { derived: '@.probe(../arr)' } },
      },
    },
    { arr: ['a', 'b'], a: 'loaded' },
    { probe: (value: unknown) => value },
  );
  const observations: {
    divergent: boolean;
    defaultValue: unknown;
    commit: number;
  }[] = [];
  const runtime = requireRuntimeFieldNode(root).runtime;
  setContext(root, {
    probe: (value: unknown) => {
      observations.push({
        divergent: root.isDivergent,
        defaultValue: root.defaultValue,
        commit: runtime.commitNumber ?? 0,
      });
      return value;
    },
  });
  reloadFieldNodeForm(root, { arr: ['a', 'b'], a: 'loaded' });
  observations.length = 0;
  const array = root.find('/arr');
  if (array?.type !== 'array') throw new Error('Expected array');
  array.remove(0);
  expect(observations.length).toBeGreaterThan(0);
  expect(root.isDivergent).toBe(true);
  console.info(
    'state-vocabulary S2 remove',
    JSON.stringify({
      during: observations,
      after: {
        divergent: root.isDivergent,
        defaultValue: root.defaultValue,
        commit: runtime.commitNumber,
      },
    }),
  );
  root.find('/a')?.setValue('edited');
  observations.length = 0;
  root.resetSubtree();
  expect(observations.length).toBeGreaterThan(0);
  expect(
    observations.every(({ divergent }) => typeof divergent === 'boolean'),
  ).toBe(true);
  expect(root.isDivergent).toBe(false);
  console.info(
    'state-vocabulary S2 reset',
    JSON.stringify({
      during: observations,
      after: {
        divergent: root.isDivergent,
        defaultValue: root.defaultValue,
        commit: runtime.commitNumber,
      },
    }),
  );
});
