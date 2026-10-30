import { expect, it } from 'vitest';

import { HostStaticPartition, StaticFirstLoadCapability } from '../blueprint';
import { engineModes } from '../utils/cache/engineModes';
import { createTestTree } from './fixtures/createTestTree';

it('rebuilds derived records only when one engine mode actually changes', () => {
  const { blueprint } = createTestTree({
    type: 'object',
    properties: { value: { type: 'string' } },
  });
  const previous = engineModes.gateSelection;
  const first = HostStaticPartition.get(blueprint.root);
  const firstLoad = StaticFirstLoadCapability.has(blueprint);
  engineModes.setMode('gateSelection', previous);
  expect(HostStaticPartition.get(blueprint.root)).toBe(first);
  try {
    engineModes.setMode('gateSelection', previous === 'off' ? 'table' : 'off');
    expect(HostStaticPartition.get(blueprint.root)).not.toBe(first);
    expect(StaticFirstLoadCapability.has(blueprint)).toBe(firstLoad);
  } finally {
    engineModes.setMode('gateSelection', previous);
  }
});

it('clears derived records for wheel and derivation mode changes too', () => {
  const { blueprint } = createTestTree({ type: 'string' });
  const wheel = engineModes.gateWheel;
  const derive = engineModes.deriveShadow;
  try {
    const first = HostStaticPartition.get(blueprint.root);
    engineModes.setMode('gateWheel', wheel === 'record' ? 'skip' : 'record');
    const second = HostStaticPartition.get(blueprint.root);
    expect(second).not.toBe(first);
    engineModes.setMode('deriveShadow', !derive);
    expect(HostStaticPartition.get(blueprint.root)).not.toBe(second);
  } finally {
    engineModes.setMode('gateWheel', wheel);
    engineModes.setMode('deriveShadow', derive);
  }
});
