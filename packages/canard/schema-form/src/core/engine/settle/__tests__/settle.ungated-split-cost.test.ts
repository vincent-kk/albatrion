import { createHash } from 'node:crypto';
import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';
import * as registration from '../utils/dependencies/registerRecalculation';
import { DirtyPathSet } from '../utils/scratch/DirtyPathSet';

/** Canonical buildNestedSchema(6, 4) fixture, pinned by the schema hash below. */
const nestedSchema = (depth: number): BlueprintSchema => {
  if (!depth) return { type: 'string', default: 'leaf' };
  const properties: Record<string, BlueprintSchema> = {};
  for (let index = 0; index < 4; index++)
    properties['n' + index] = nestedSchema(depth - 1);
  return { type: 'object', properties };
};

/** Apply the measurement's bulk transform to this string-leaf fixture. */
const changed = (value: unknown): unknown =>
  value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, changed(item)]),
      )
    : String(value) + '-changed';

it('nested-d6-f4 bulk has no split release, shadow read or split registration in table mode', () => {
  const mode = engineModes.gateSelection;
  engineModes.setMode('gateSelection', 'table');
  try {
    const schema = nestedSchema(6);
    expect(
      createHash('sha256').update(JSON.stringify(schema)).digest('hex'),
    ).toBe('fbd03ab6337cc6d81692519816c5778f7f6f907f346dba9dc00261f5c37cc1f2');
    const { root } = createDispatchTree(schema);
    dispatchMount(root, undefined);
    const value = changed(structuredClone(root.emit));
    const release = vi.spyOn(
      DirtyPathSet.prototype as unknown as {
        releaseSplitMember(path: string): void;
      },
      'releaseSplitMember',
    );
    const index = getDependencyIndex(root.runtime.blueprint);
    const split = vi.spyOn(
      Object.getPrototypeOf(index) as typeof index,
      'affectedForRegistration',
    );
    const register = registration.registerRecalculation;
    let shadowReads = 0;
    vi.spyOn(registration, 'registerRecalculation').mockImplementation(
      (context) => {
        Object.defineProperty(context, 'registrationShadow', {
          configurable: true,
          get: () => {
            shadowReads++;
            return undefined;
          },
        });
        register(context);
      },
    );
    dispatchSetValue(root, value);
    console.log(
      'UNGATED_SPLIT_COST',
      JSON.stringify({
        releaseCalls: release.mock.calls.length,
        shadowReads,
        splitCalls: split.mock.calls.length,
      }),
    );
    expect.soft(release).not.toHaveBeenCalled();
    expect.soft(shadowReads).toBe(0);
    expect(split).not.toHaveBeenCalled();
    expect(root.emit).toEqual(value);
  } finally {
    engineModes.setMode('gateSelection', mode);
    vi.restoreAllMocks();
  }
});
