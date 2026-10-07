import { beforeAll, describe, expect, it } from 'vitest';

import headFixture from '../../blueprint/__tests__/fixtures/ownedInlineHead.json';
import type { JSONSchema } from '../../types/jsonSchema';
import { buildChildSelectionRuntime } from './helpers/childSelection/buildChildSelectionRuntime';
import { createFixedBranchSchema } from './helpers/childSelection/createFixedBranchSchema';

/** Owner round 117's reverted baseline; never regenerate from the candidate. */
const HEAD = '3a637c4cd';

// filid:contract settle-child-selection-differential
describe('child selection against pinned HEAD', () => {
  let head: Awaited<ReturnType<typeof buildChildSelectionRuntime>>;
  let working: typeof head;
  beforeAll(async () => {
    head = await buildChildSelectionRuntime(HEAD);
    const scratchSource = process.env.SCHEMA_FORM_CHILD_SELECTION_SOURCE;
    const scratchPaths = process.env.SCHEMA_FORM_GATE_PATH_SOURCE;
    working = await buildChildSelectionRuntime(undefined, {
      ...(scratchSource ? {
      'packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts': scratchSource,
      } : {}),
      ...(scratchPaths ? {
        'packages/canard/schema-form/src/core/settle/utils/gates/getGateRegistry.ts': scratchPaths,
      } : {}),
    });
  }, 240000);

  it('preserves all 59 corpus schemas with root and every-node listeners', () => {
    expect(headFixture.cases).toHaveLength(59);
    for (const sample of headFixture.cases) {
      for (const allListeners of [false, true]) {
        const fixture = { label: sample.label, schema: sample.schema as JSONSchema,
          input: undefined, writes: [{ path: '', value: {} }, { path: '', value: null },
            { path: '', value: undefined }], allListeners };
        expect(working.run(structuredClone(fixture)), `${sample.label}; listeners=${allListeners}`)
          .toEqual(head.run(structuredClone(fixture)));
      }
    }
  }, 120000);

  it.each([5, 10, 20, 40])('preserves B=%i first and prepared transitions with every-node listeners', count => {
    const fixture = { label: `oneOf-${count}`, schema: createFixedBranchSchema(count) as JSONSchema,
      input: { kind: 'kind_0' }, allListeners: true, writes: [
        { path: '/kind', value: 'kind_4' }, { path: '/kind', value: 'kind_0' },
        { path: '/kind', value: 'kind_4' }, { path: '/kind', value: 'kind_0' },
      ] };
    expect(working.run(structuredClone(fixture))).toEqual(head.run(structuredClone(fixture)));
  });

  it.each([false, true])('preserves if-then publication and failures with automatic writes disabled=%s', disabled => {
    for (const guardMode of [undefined, 'normal', 'throw', 'promise'] as const) {
      for (const nested of [false, true]) {
        const host = { type: 'object', properties: { kind: { type: 'string' } },
          if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
          then: { properties: { detail: { type: 'string', default: 'shown' } } },
          else: { properties: { fallback: { type: 'number', default: 7 } } },
        };
        const fixture = { label: `if-then; ${guardMode}; nested=${nested}`, guardMode,
          disableAutomaticWrites: disabled, allListeners: true,
          schema: (nested ? { type: 'object', properties: { 'a/b~c': host } } : host) as JSONSchema,
          input: nested ? { 'a/b~c': { kind: 'off' } } : { kind: 'off' },
          writes: ['on', 'off', 'on'].map(kind => ({
            path: nested ? '/a~1b~0c/kind' : '/kind', value: kind,
          })),
        };
        const expected = head.run(structuredClone(fixture));
        const actual = working.run(structuredClone(fixture));
        expect(actual, fixture.label).toEqual(expected);
      }
    }
  });
});
