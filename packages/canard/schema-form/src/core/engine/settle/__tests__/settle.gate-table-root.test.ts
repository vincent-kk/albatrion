import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-gate-table-root
describe('root declaration tables retain selection and warning observations', () => {
  it.each(['oneOf', 'anyOf'] as const)(
    '%s preserves multi-active declarations, schema and warnings',
    (keyword) => {
      const before = engineModes.gateSelection;
      const observed: unknown[][] = [];
      try {
        for (const mode of ['off', 'table', 'verify'] as const) {
          engineModes.setMode('gateSelection', mode);
          const { root } = createTestTree({
            type: 'object',
            properties: { kind: { type: 'string' }, other: { type: 'string' } },
            [keyword]: [
              {
                controls: { active: "./kind === 'both'" },
                properties: { a: { type: 'string', default: 'A' } },
              },
              {
                controls: { active: "./kind === 'both' || ./kind === 'b'" },
                properties: { b: { type: 'string', default: 'B' } },
              },
              {
                controls: { active: "./other === 'on'" },
                properties: { c: { type: 'string', default: 'C' } },
              },
            ],
          });
          root.runtime.errorReporter = {
            hasConsumer: () => true,
            report: () => {},
          };
          const history: unknown[] = [];
          loadFieldNodeAtMount(
            root,
            { kind: 'none', other: 'on' },
            WriteOption.Overwrite,
          );
          for (const kind of ['both', 'b', 'none', 'both']) {
            writeFieldNode(
              root.structure!.kind,
              kind,
              'input',
              WriteOption.Overwrite,
            );
            history.push({
              emit: root.emit,
              schema: root.schema,
              ids: [...(root.runtime.committedDeclarationIds ?? [])],
              warnings: [...(root.runtime.warningKeys ?? [])],
              revision: root.revisionLedger,
            });
          }
          if (keyword === 'oneOf')
            expect(root.runtime.warningKeys?.size).toBeGreaterThan(0);
          observed.push(history);
        }
        expect(observed[1]).toEqual(observed[0]);
        expect(observed[2]).toEqual(observed[0]);
      } finally {
        engineModes.setMode('gateSelection', before);
      }
    },
  );
});
