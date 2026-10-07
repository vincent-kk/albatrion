import { beforeAll, describe, expect, it } from 'vitest';

import headFixture from '../../blueprint/__tests__/fixtures/ownedInlineHead.json';
import type { JSONSchema } from '../../types/jsonSchema';
import { buildChildSelectionRuntime } from './helpers/childSelection/buildChildSelectionRuntime';
import { createFixedBranchSchema } from './helpers/childSelection/createFixedBranchSchema';

/** Round 113's working baseline; never regenerate from the candidate. */
const HEAD = '831805d27d8313762afd7ca1f1feca2098c6aa25';

// filid:contract settle-child-selection-differential
describe('child selection against pinned HEAD', () => {
  let head: Awaited<ReturnType<typeof buildChildSelectionRuntime>>;
  let working: typeof head;
  beforeAll(async () => {
    head = await buildChildSelectionRuntime(HEAD);
    const scratchSource = process.env.SCHEMA_FORM_CHILD_SELECTION_SOURCE;
    working = await buildChildSelectionRuntime(undefined, scratchSource ? {
      'packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts': scratchSource,
    } : {});
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
});
