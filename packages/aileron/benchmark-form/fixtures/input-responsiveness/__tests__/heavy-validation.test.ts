import { describe, expect, it } from 'vitest';

import { buildFlatSchema } from '../../../src/fixtures/scale-schemas';
import { getInputFixture } from '../getInputFixture';
import cases from '../ir-2-cases.json';

describe('heavy validation measurement fixtures', () => {
  it.each([
    ['array-1000', '/items/0/name', 3000],
    ['nested-d5-f4', '/n0/n0/n0/n0/n0', 1024],
    ['flat-2000', '/field_000', 2000],
  ] as const)(
    'types into the specified %s leaf with separate input modes',
    (shape, target, expectedInputs) => {
      for (const lane of ['L', 'E']) {
        const nonburst = getInputFixture(
          `type-${shape}-validate-nonburst`,
          lane,
        );
        const burst = getInputFixture(`type-${shape}-validate-burst`, lane);
        expect(nonburst).toMatchObject({
          target,
          expectedInputs,
          validation: true,
          intervalMs: 100,
        });
        expect(burst).toMatchObject({
          target,
          expectedInputs,
          validation: true,
          intervalMs: 0,
        });
        expect(nonburst.schema).toEqual(burst.schema);
      }
    },
  );

  it('extends the canonical flat generator only at the typing leaf', () => {
    const fixture = getInputFixture('type-flat-2000-validate-nonburst', 'E');
    const expected = buildFlatSchema(2000);
    expected.properties!.field_000!.pattern = '^(?:..)*$';
    expect(fixture.schema).toEqual(expected);
  });

  it('rebuilds the documented IR-1 if shape without padding or defaults', () => {
    const fixture = getInputFixture('mount-if-flat-500-validate', 'E');
    expect(Object.keys(fixture.schema.properties!)).toHaveLength(501);
    expect(fixture.schema.properties!.field_0).toEqual({ type: 'string' });
    expect(fixture.schema.properties!.field_499).toEqual({ type: 'string' });
    expect(fixture.schema.properties!.kind).toEqual({
      type: 'string',
      default: 'a',
    });
    expect(fixture.schema.if).toEqual({ properties: { kind: { const: 'a' } } });
    expect(fixture.schema.then).toEqual({
      properties: { field_0: { minLength: 2 } },
    });
  });

  it('observes mount first seconds using the public default validation mode', () => {
    for (const id of cases.filter((id) => id.startsWith('mount-')))
      expect(getInputFixture(id, 'E')).toMatchObject({
        mount: true,
        validation: true,
        defaultValidation: true,
        virtualization: false,
        mountObservationMs: 1000,
      });
    expect(getInputFixture('mount-flat-500-off', 'E').validation).toBe(false);
  });
});
