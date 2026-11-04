import { expect, it } from 'vitest';

import {
  HostStaticPartition,
  StaticFirstLoadCapability,
  blueprint,
  getFeatureNodeIndex,
} from '../blueprint';
import {
  getBlueprintDerived,
  getHostDerived,
} from '../utils/cache/derivedRecords';
import { engineModes } from '../utils/cache/engineModes';

it('keeps compiler creation facts outside enumerable blueprint observables', () => {
  const analysis = blueprint({
    type: 'object',
    properties: {
      source: { type: 'number' },
      target: { type: 'number', controls: { derived: '../source' } },
    },
  });
  const expression = analysis.expressions.find(
    (item) => item.key === 'derived',
  )!;
  expect(Object.keys(analysis)).not.toContain('staticFirstLoadEligible');
  expect(Object.keys(expression)).not.toContain('completeReads');
  expect(Reflect.get(expression, 'completeReads')).toBe(true);
});

it('retains one record per immutable key and starts without eager slots', () => {
  const first = {};
  const second = {};
  expect(Object.keys(getBlueprintDerived(first))).toEqual([]);
  expect(Object.keys(getHostDerived(first))).toEqual([]);
  expect(getBlueprintDerived(first)).toBe(getBlueprintDerived(first));
  expect(getHostDerived(first)).toBe(getHostDerived(first));
  expect(getBlueprintDerived(first)).not.toBe(getBlueprintDerived(second));
  expect(getHostDerived(first)).not.toBe(getHostDerived(second));
  expect(getBlueprintDerived(first)).not.toBe(getHostDerived(first));
});

it('fills only the requested blueprint slot and reuses its builder result', () => {
  const analysis = blueprint({
    type: 'object',
    properties: { value: { type: 'string', controls: { visible: false } } },
  });
  const record = getBlueprintDerived(analysis);
  expect(Object.keys(record)).toEqual([]);
  const index = getFeatureNodeIndex(analysis);
  expect(record.featureNodeIndex).toBe(index);
  expect(Object.keys(record)).toEqual(['featureNodeIndex']);
  expect(getFeatureNodeIndex(analysis)).toBe(index);
});

it('fills the host partition without filling unrelated host slots', () => {
  const analysis = blueprint({
    type: 'object',
    properties: { value: { type: 'string' } },
  });
  const record = getHostDerived(analysis.root);
  const before = Object.keys(record);
  const partition = HostStaticPartition.get(analysis.root);
  expect(record.staticPartition).toBe(partition);
  expect(Object.keys(record).filter((key) => !before.includes(key))).toEqual([
    'staticPartition',
  ]);
  expect(record.staticShape).toBeUndefined();
  expect(record.readPlans).toBeUndefined();
  expect(HostStaticPartition.get(analysis.root)).toBe(partition);
});

it('replaces both records on mode transitions while preserving creation facts', () => {
  const analysis = blueprint({ type: 'string' });
  const withExpression = blueprint({
    type: 'object',
    properties: {
      source: { type: 'number' },
      target: { type: 'number', controls: { derived: '../source' } },
    },
  });
  const previous = engineModes.gateSelection;
  const first = getBlueprintDerived(analysis);
  const host = getHostDerived(analysis.root);
  const expression = withExpression.expressions.find(
    (item) => item.key === 'derived',
  )!;
  expect(StaticFirstLoadCapability.has(analysis)).toBe(true);
  expect(Reflect.get(expression, 'completeReads')).toBe(true);
  engineModes.setMode('gateSelection', previous);
  expect(getBlueprintDerived(analysis)).toBe(first);
  try {
    engineModes.setMode('gateSelection', previous === 'off' ? 'table' : 'off');
    expect(getBlueprintDerived(analysis)).not.toBe(first);
    expect(getHostDerived(analysis.root)).not.toBe(host);
    expect(StaticFirstLoadCapability.has(analysis)).toBe(true);
    expect(Reflect.get(expression, 'completeReads')).toBe(true);
  } finally {
    engineModes.setMode('gateSelection', previous);
  }
});
