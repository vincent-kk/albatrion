import { describe, expect, it } from 'vitest';

import { plugin } from '../../index';

/**
 * Class 22 (composed calls differ from one-by-one calls). AJV 7 compiles a synchronous function
 * that stores its result on the shared `validate.errors` property. The plugin's validator awaits
 * that boolean before reading `validate.errors`, so a second call that starts before the first
 * call's continuation runs overwrites the first call's errors.
 */
const schema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
  required: ['name'],
};

const keywords = (issues: unknown) =>
  ((issues as { keyword?: string; dataPath: string }[] | null) ?? []).map((issue) => `${issue.keyword} ${issue.dataPath}`);

describe('ajv7 validator called again before an earlier call settles', () => {
  it('[control] one call at a time reports the invalid value', async () => {
    const validate = plugin.validator.compile({ ...schema } as any);
    const invalid = await validate({ name: 'x' });
    const valid = await validate({ name: 'valid' });
    expect([keywords(invalid), keywords(valid)]).toEqual([['minLength /name'], []]);
  });

  it('two overlapping calls each report the verdict of their own value', async () => {
    const validate = plugin.validator.compile({ ...schema } as any);
    const [invalid, valid] = await Promise.all([validate({ name: 'x' }), validate({ name: 'valid' })]);
    expect([keywords(invalid), keywords(valid)]).toEqual([['minLength /name'], []]);
  });

  it('two overlapping calls on a root with $id each report their own verdict', async () => {
    const validate = plugin.validator.compile({ ...schema, $id: 'https://example.com/person.json' } as any);
    const [invalid, valid] = await Promise.all([validate({ name: 'x' }), validate({ name: 'valid' })]);
    expect([keywords(invalid), keywords(valid)]).toEqual([['minLength /name'], []]);
  });

  it('a valid call that overlaps an invalid one does not receive its issues', async () => {
    const validate = plugin.validator.compile({ ...schema } as any);
    const [valid, invalid] = await Promise.all([validate({ name: 'valid' }), validate({})]);
    expect([keywords(valid), keywords(invalid)]).toEqual([[], ['required /name']]);
  });
});
