import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as create07 } from '../../default';
import { createValidator as create2019 } from '../../2019';
import { createValidator as create2020 } from '../../2020';

const dialects = [
  {
    name: 'draft-07',
    make: () => new Ajv({ allErrors: true, strict: false }),
    create: create07,
    anchor: (name: string) => ({ $id: `#${name}` }),
  },
  {
    name: '2019',
    make: () => new Ajv2019({ allErrors: true, strict: false }),
    create: create2019,
    anchor: (name: string) => ({ $anchor: name }),
  },
  {
    name: '2020',
    make: () => new Ajv2020({ allErrors: true, strict: false }),
    create: create2020,
    anchor: (name: string) => ({ $anchor: name }),
  },
] as const;

/** A non-standard container (OpenAPI-like) holding the reference target. */
const formOf = (
  anchor: object,
  ref: string,
  format: string,
): Record<string, unknown> => ({
  components: { leaf: { ...anchor, type: 'string', format } },
  $ref: ref,
});

describe.each(dialects)('$name: anchor target in a non-standard container', (d) => {
  it.each([
    ['pointer', '#/components/leaf'],
    ['anchor', '#leaf'],
  ])('async format reached by %s compiles and rejects', async (_kind, ref) => {
    const ajv = d.make();
    ajv.addFormat('slow', {
      async: true,
      validate: async (value: string) => value.length > 3,
    });
    const schema = formOf(d.anchor('leaf'), ref, 'slow');
    // Native reference: AJV compiles the same schema once $async is present.
    const native = ajv.compile({ ...schema, $async: true });
    await expect(native('ab')).rejects.toThrow();
    const validate = d.create(ajv).compile(schema as any);
    expect(await validate('ab')).toMatchObject([{ keyword: 'format' }]);
    expect(await validate('abcd')).toBeNull();
  });

  it.each([
    ['pointer', '#/components/leaf'],
    ['anchor', '#leaf'],
  ])('replaced format reached by %s is observed on recompile', async (_kind, ref) => {
    const ajv = d.make();
    ajv.addFormat('even', (value: string) => value.length % 2 === 0);
    const schema = formOf(d.anchor('leaf'), ref, 'even');
    const validator = d.create(ajv);
    expect(await validator.compile(schema as any)('abc')).toMatchObject([
      { keyword: 'format' },
    ]);
    ajv.addFormat('even', (value: string) => value.length % 2 === 1);
    expect(await validator.compile(schema as any)('abc')).toBeNull();
  });
});

describe('draft-07 anchor controls (bounding the gap)', () => {
  it.each([
    ['root $id, non-standard container', { $id: 'https://r6.invalid/anchored', components: { leaf: { $id: '#leaf', type: 'string', format: 'slow' } }, $ref: '#leaf' }],
    ['no root $id, definitions', { definitions: { leaf: { $id: '#leaf', type: 'string', format: 'slow' } }, $ref: '#leaf' }],
  ])('async format reached by anchor with %s compiles', async (_kind, schema) => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addFormat('slow', { async: true, validate: async (value: string) => value.length > 3 });
    const validate = create07(ajv).compile(schema as any);
    expect(await validate('ab')).toMatchObject([{ keyword: 'format' }]);
  });
});
