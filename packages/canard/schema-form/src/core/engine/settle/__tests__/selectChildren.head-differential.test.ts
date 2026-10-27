import { beforeAll, describe, expect, it } from 'vitest';

import { default as headFixture } from '@/schema-form/core/engine/__tests__/fixtures/ownedInlineHead.json';
import type { AuthoredSchema } from '@/schema-form/core/engine/types/jsonSchema';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { alignKeptOutPoints } from './fixtures/childSelection/alignKeptOutPoints';
import { buildChildSelectionRuntime } from './fixtures/childSelection/buildChildSelectionRuntime';
import { createFixedBranchSchema } from './fixtures/childSelection/createFixedBranchSchema';

/** Owner round 117's reverted baseline; never regenerate from the candidate. */
const HEAD = '3a637c4cd';

/**
 * Compare selection observations while retaining error codes, messages and details.
 * @param actual - Candidate selection observations.
 * @param expected - Pinned selection observations.
 * @param label - Optional fixture label for a comparison failure.
 */
const expectSelectionEqual = (
  actual: unknown,
  expected: unknown,
  label?: string,
): void => {
  // Error name is the class group and is not part of the selection contract.
  const [actualSelection, expectedSelection] = [actual, expected].map(
    (observation) =>
      JSON.parse(
        JSON.stringify(observation, (_key, value) => {
          if (
            value &&
            typeof value === 'object' &&
            'message' in value &&
            Array.isArray(value.fields)
          ) {
            const { name: _name, fields, ...error } = value;
            return {
              ...error,
              fields: fields.filter(
                ([key]: [string, unknown]) => key !== 'name',
              ),
            };
          }
          return value;
        }),
      ),
  );
  expect(actualSelection, label).toEqual(expectedSelection);
};

// filid:contract settle-child-selection-differential
describe('child selection against pinned HEAD', () => {
  let head: Awaited<ReturnType<typeof buildChildSelectionRuntime>>;
  let working: typeof head;
  beforeAll(async () => {
    head = await buildChildSelectionRuntime(HEAD);
    const scratchSource = process.env.SCHEMA_FORM_CHILD_SELECTION_SOURCE;
    const scratchPaths = process.env.SCHEMA_FORM_GATE_PATH_SOURCE;
    working = await buildChildSelectionRuntime(undefined, {
      ...(scratchSource
        ? {
            'packages/canard/schema-form/src/core/engine/settle/utils/compute/childSelection/selectChildren.ts':
              scratchSource,
          }
        : {}),
      ...(scratchPaths
        ? {
            'packages/canard/schema-form/src/core/engine/settle/utils/gates/getGateRegistry.ts':
              scratchPaths,
          }
        : {}),
    });
  }, 240000);

  it('preserves all 59 corpus schemas with root and every-node listeners', () => {
    // These assertions inspect latent restoration and its internal stage records.
    pinLatentBaseline();
    expect(headFixture.cases).toHaveLength(59);
    for (const sample of headFixture.cases) {
      for (const allListeners of [false, true]) {
        const fixture = {
          label: sample.label,
          schema: sample.schema as AuthoredSchema,
          input: undefined,
          writes: [
            { path: '', value: {} },
            { path: '', value: null },
            { path: '', value: undefined },
          ],
          allListeners,
        };
        const label = `${sample.label}; listeners=${allListeners}`;
        const actual = working.run(structuredClone(fixture));
        const expected = head.run(structuredClone(fixture));
        expect(expected.keptOut, label).toEqual([]);
        expect(
          actual.keptOut.filter(
            (host) => !host.sameLocal || host.valueDelivery,
          ),
          label,
        ).toEqual([]);
        expectSelectionEqual(
          { results: actual.results, points: actual.points },
          {
            results: expected.results,
            points: alignKeptOutPoints(
              expected.points,
              actual.points,
              actual.keptOut.map((host) => host.path),
            ),
          },
          label,
        );
      }
    }
  }, 120000);

  it.each([5, 10, 20, 40])(
    'preserves B=%i first and prepared transitions with every-node listeners',
    (count) => {
      // These assertions inspect latent restoration and its internal stage records.
      pinLatentBaseline();
      const fixture = {
        label: `oneOf-${count}`,
        schema: createFixedBranchSchema(count) as AuthoredSchema,
        input: { kind: 'kind_0' },
        allListeners: true,
        writes: [
          { path: '/kind', value: 'kind_4' },
          { path: '/kind', value: 'kind_0' },
          { path: '/kind', value: 'kind_4' },
          { path: '/kind', value: 'kind_0' },
        ],
      };
      const { points, ...actual } = working.run(structuredClone(fixture));
      const { points: _expectedPoints, ...expected } = head.run(
        structuredClone(fixture),
      );
      // 400C-03: H1 changes private stage work; public results and every other field remain pinned.
      expectSelectionEqual(actual, expected);
      expect(points.length).toBeLessThanOrEqual(48);
    },
  );

  it.each([false, true])(
    'preserves if-then publication and failures with automatic writes disabled=%s',
    (disabled) => {
      // These assertions inspect latent restoration and its internal stage records.
      pinLatentBaseline();
      for (const guardMode of [
        undefined,
        'normal',
        'throw',
        'promise',
      ] as const) {
        for (const nested of [false, true]) {
          const host = {
            type: 'object',
            properties: { kind: { type: 'string' } },
            if: { properties: { kind: { const: 'on' } }, required: ['kind'] },
            then: {
              properties: { detail: { type: 'string', default: 'shown' } },
            },
            else: { properties: { fallback: { type: 'number', default: 7 } } },
          };
          const fixture = {
            label: `if-then; ${guardMode}; nested=${nested}`,
            guardMode,
            disableAutomaticWrites: disabled,
            allListeners: true,
            schema: (nested
              ? { type: 'object', properties: { 'a/b~c': host } }
              : host) as AuthoredSchema,
            input: nested ? { 'a/b~c': { kind: 'off' } } : { kind: 'off' },
            writes: ['on', 'off', 'on'].map((kind) => ({
              path: nested ? '/a~1b~0c/kind' : '/kind',
              value: kind,
            })),
          };
          const expected = head.run(structuredClone(fixture));
          const actual = working.run(structuredClone(fixture));
          expectSelectionEqual(actual, expected, fixture.label);
        }
      }
    },
  );
});
