import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { HostStaticPartition } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as selection from '../utils/compute/childSelection/selectEntryStep';
import { relocatedGates } from '../utils/compute/relocatedGates';
import * as output from '../utils/output/updateOutput';

const wheelMode = engineModes.gateWheel;
afterEach(() => {
  engineModes.setMode('gateWheel', wheelMode);
  vi.restoreAllMocks();
});

it.each(['skip', 'shadow'] as const)(
  'bounds static sibling selection and root assembly in %s with shared x/y branches',
  (mode) => {
    engineModes.setMode('gateWheel', mode);
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        type: { type: 'string' },
        ...Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [
            `pad_${i}`,
            { type: 'number', default: i },
          ]),
        ),
      },
      oneOf: ['a', 'b'].map((type, index) => ({
        controls: { active: `./type === '${type}'` },
        properties: {
          x: { type: 'string', default: type },
          y: { type: 'number', default: index },
        },
      })),
    });
    dispatchMount(root, { type: 'a' });
    const partition = HostStaticPartition.get(root.blueprintNode);
    console.info(
      'H1_SHARED_PROOF',
      JSON.stringify({
        staticCount: partition.staticEntries.length,
        entries: root.blueprintNode.childEntries.length,
        relocated: relocatedGates(root).length,
        duplicate: root.blueprintNode.childEntries
          .filter((e) => e.name === 'x')
          .map((e) => ({
            name: e.name,
            kind: e.node.kind,
            gates: e.declarations.map((d) => d.gates.length),
          })),
      }),
    );
    const spy = vi.spyOn(selection, 'selectEntryStep');
    const assemblies = vi.spyOn(output, 'updateOutput');
    try {
      dispatchSetValue(root.structure!.type, 'b');
      expect(spy.mock.calls.length).toBeLessThanOrEqual(24);
      expect(
        assemblies.mock.calls.filter(([node]) => node === root),
      ).toHaveLength(1);
    } finally {
      spy.mockRestore();
      assemblies.mockRestore();
    }
  },
);
