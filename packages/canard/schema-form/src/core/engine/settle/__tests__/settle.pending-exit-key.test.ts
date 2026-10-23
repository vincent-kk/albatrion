import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as priming from '../utils/compute/primeHost';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Source files whose pending-exit key building is counted. */
const KEY_SITES =
  /\/(childSelection\/(?:selectChildren|selectEntryStep)|compute\/primeHost)\.ts/;

/**
 * Count `JSON.stringify` calls whose nearest engine caller is selection or priming.
 * @returns Live counter read after the history; mocks restore after each case
 */
const countKeySiteEncodings = () => {
  const calls = { count: 0 };
  const stringify = JSON.stringify;
  vi.spyOn(JSON, 'stringify').mockImplementation((...args) => {
    const caller = new Error().stack
      ?.split('\n')
      .find((frame) => frame.includes('/src/') && !frame.includes('__tests__'));
    if (caller && KEY_SITES.test(caller)) calls.count++;
    return Reflect.apply(stringify, JSON, args);
  });
  return calls;
};

/**
 * Build the benchmark oneOf shape: `count` gated branches with three fields each.
 * @param count - Number of oneOf branches; all but the selected one stay inactive
 * @returns Schema whose branch `index` is active while `/kind` is `kind_<index>`
 */
const oneOfSchema = (count: number): BlueprintSchema => ({
  type: 'object',
  properties: {
    common: { type: 'string', default: 'shared' },
    kind: { type: 'string' },
  },
  oneOf: Array.from({ length: count }, (_, index) => ({
    controls: { active: `./kind === 'kind_${index}'` },
    properties: {
      [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
      [`payload_${index}_b`]: { type: 'number', default: index },
      [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
    },
  })),
});

afterEach(() => {
  vi.restoreAllMocks();
});

// filid:contract settle-pending-exit-key
describe('pending-exit keys are built only while an exit is pending', () => {
  it('builds no key in selection or priming when a oneOf-20 form mounts', () => {
    const { root } = createTestTree(oneOfSchema(20));
    const encodings = countKeySiteEncodings();
    loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
    expect(encodings.count).toBe(0);
    expect(Object.keys(root.structure ?? {})).toEqual([
      'common',
      'kind',
      'payload_0_a',
      'payload_0_b',
      'payload_0_c',
    ]);
  });

  it('builds no key when a write reselects 60 inactive entries and nothing exits', () => {
    const { root } = createTestTree(oneOfSchema(20));
    loadFieldNodeAtMount(root, { kind: 'none_1' }, WriteOption.Overwrite);
    const common = root.structure?.common;
    const encodings = countKeySiteEncodings();
    writeFieldNode(
      root.structure!.kind,
      'none_2',
      'input',
      WriteOption.Overwrite,
    );
    expect(encodings.count).toBe(0);
    expect(root.structure?.common === common).toBe(true);
    expect(root.local).toEqual({ common: 'shared', kind: 'none_2' });
  });

  it('marks an exit pending since an earlier wheel when its gate throws in a later wheel', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        t: { type: 'boolean' },
        a: {
          type: 'number',
          default: 1,
          controls: { active: '../t === true' },
        },
        g: {
          type: 'string',
          controls: { active: '@.gate(../a)', unsetOnInactive: true },
        },
      },
    });
    let armed = false;
    root.runtime.context = {
      gate: (a: unknown) => {
        if (a === undefined) return !armed;
        throw new Error('gate');
      },
    };
    loadFieldNodeAtMount(root, { g: 'G' }, WriteOption.Overwrite);
    armed = true;
    expect(() =>
      writeFieldNode(root.structure!.t, true, 'input', WriteOption.Overwrite),
    ).toThrow('Gate evaluation failed');
    expect(root.structure?.g).toBeUndefined();
    expect(root.local).toEqual({ t: true, a: 1 });
    expect(root.runtime.latentRaw.get(JSON.stringify(['/g', 'string']))).toBe(
      'G',
    );
  });

  // Lookup contract check: the only natural hit is a deferred SharedNodeConflict,
  // whose settlement throws, so a spy places the pending exit.
  it('revives a pending ungated child in priming as the same node instance', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        s: { type: 'string' },
        keep: { type: 'string' },
        g: { type: 'string', controls: { active: '../s === "on"' } },
      },
    });
    loadFieldNodeAtMount(root, { s: 'on', keep: 'K' }, WriteOption.Overwrite);
    const keep = root.structure!.keep;
    const original = priming.primeHost;
    let injected = false;
    vi.spyOn(priming, 'primeHost').mockImplementation(
      (node, prior, context) => {
        if (node !== root || injected) return original(node, prior, context);
        injected = true;
        const { keep: pending, ...rest } = prior;
        context.pendingExits.set(JSON.stringify(['/keep', 'string']), pending);
        return original(node, rest, context);
      },
    );
    writeFieldNode(root.structure!.s, 'off', 'input', WriteOption.Overwrite);
    expect(injected).toBe(true);
    expect(root.structure?.keep === keep).toBe(true);
    expect(keep.detached).toBe(false);
    expect(root.local).toEqual({ s: 'off', keep: 'K' });
  });
});
