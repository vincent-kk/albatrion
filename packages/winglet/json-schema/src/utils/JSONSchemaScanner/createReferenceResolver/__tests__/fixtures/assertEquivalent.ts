import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { expect } from 'vitest';

/** Compile both documents independently and compare finite witnesses in the declared dialect. */
export function assertEquivalent(
  before: any,
  after: any,
  samples: unknown[],
  dialect: 'draft-07' | '2019-09' | '2020-12' = '2020-12',
  resources: any[] = [],
) {
  const Constructor =
    dialect === 'draft-07' ? Ajv : dialect === '2019-09' ? Ajv2019 : Ajv2020;
  const original = new Constructor({ strict: false, validateFormats: false })
    .addSchema(resources)
    .compile(before);
  const transformed = new Constructor({ strict: false, validateFormats: false })
    .addSchema(resources)
    .compile(after);
  expect(samples.map((value) => transformed(value))).toEqual(
    samples.map((value) => original(value)),
  );
}
