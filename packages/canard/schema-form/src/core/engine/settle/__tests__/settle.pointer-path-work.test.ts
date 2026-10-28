import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as pointer from '@/schema-form/helpers/jsonPointer';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { createFixedBranchSchema } from './fixtures/childSelection/createFixedBranchSchema';

/** Counts every full-pointer decode, including the jsonPointer fractal's own callers. */
const decoder = vi.hoisted(() => vi.fn());

vi.mock(
  '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments',
  async (importOriginal) => {
    const original = await importOriginal<{
      parsePointerSegments: (pointer: string | readonly string[]) => unknown;
    }>();
    return {
      ...original,
      parsePointerSegments: (pointer: string | readonly string[]) => {
        decoder(pointer);
        return original.parsePointerSegments(pointer);
      },
    };
  },
);

const previousModes = {
  gatePredicate: engineModes.gatePredicate,
  gateSelection: engineModes.gateSelection,
  gateWheel: engineModes.gateWheel,
  deriveShadow: engineModes.deriveShadow,
};

beforeEach(() => {
  engineModes.setMode('gatePredicate', 'on');
  engineModes.setMode('gateSelection', 'table');
  engineModes.setMode('gateWheel', 'skip');
  engineModes.setMode('deriveShadow', false);
});

afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gatePredicate', previousModes.gatePredicate);
  engineModes.setMode('gateSelection', previousModes.gateSelection);
  engineModes.setMode('gateWheel', previousModes.gateWheel);
  engineModes.setMode('deriveShadow', previousModes.deriveShadow);
});

/** Observe both entry points so renaming a parser cannot manufacture zero work. */
const observeParsers = () => {
  const wrapper = vi.spyOn(pointer, 'parsePointer');
  decoder.mockClear();
  pointer.parsePointer('/positive-control');
  expect(wrapper).toHaveBeenCalledTimes(1);
  expect(decoder).toHaveBeenCalledTimes(1);
  wrapper.mockClear();
  decoder.mockClear();
  return { wrapper, decoder };
};

// filid:contract settle-static-pointer-work
describe('prepared canonical pointer work', () => {
  it('performs no full parsing from the first actual siblings-0 write', () => {
    const parsers = observeParsers();
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['a', 'b'], default: 'a' },
      },
      oneOf: ['a', 'b'].map((value, index) => ({
        controls: { active: `./type === '${value}'` },
        properties: {
          x: { type: 'string', default: value.toUpperCase() },
          y: { type: 'number', default: index + 1 },
        },
      })),
    });
    dispatchMount(root, undefined, undefined, { deferValidation: true });
    expect(parsers.decoder.mock.calls.length).toBeGreaterThan(0);
    const type = root.structure!.type;
    const registry = getGateRegistry(root.runtime);
    const preparedCount = parsers.decoder.mock.calls.length;
    const typeSegments = registry.pathSegments('/type');
    expect(parsers.decoder.mock.calls.length).toBe(preparedCount);
    for (const value of ['b', 'a', 'b', 'a', 'b', 'a']) {
      parsers.wrapper.mockClear();
      parsers.decoder.mockClear();
      dispatchSetValue(type, value);
      expect(root.emit).toEqual({ type: value, x: 'A', y: 1 });
      expect(root.structure!.type).toBe(type);
      expect(registry.pathSegments('/type')).toBe(typeSegments);
      expect(parsers.wrapper).not.toHaveBeenCalled();
      expect(parsers.decoder).not.toHaveBeenCalled();
    }
  });

  it('performs no full parsing from the first actual oneOf-80 write', () => {
    const parsers = observeParsers();
    const { root } = createDispatchTree(createFixedBranchSchema(80));
    dispatchMount(root, undefined, undefined, { deferValidation: true });
    expect(parsers.decoder.mock.calls.length).toBeGreaterThan(0);
    const kind = root.structure!.kind;
    for (const index of [79, 0, 79, 0, 79, 0]) {
      parsers.wrapper.mockClear();
      parsers.decoder.mockClear();
      dispatchSetValue(kind, `kind_${index}`);
      expect(root.emit).toMatchObject({
        kind: `kind_${index}`,
        [`payload_${index}_a`]: `a_${index}`,
      });
      expect(root.structure!.kind).toBe(kind);
      expect(parsers.wrapper).not.toHaveBeenCalled();
      expect(parsers.decoder).not.toHaveBeenCalled();
    }
  });
});
