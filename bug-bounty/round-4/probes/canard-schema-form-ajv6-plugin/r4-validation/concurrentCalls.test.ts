import { describe, expect, it } from 'vitest';

import { plugin } from '../../index';

/**
 * Class 22. A root with `$id` is validated through `getSchema(key)` on its registered copy, which
 * is synchronous and stores its result on the shared `validate.errors`. The plugin awaits the
 * boolean before reading `validate.errors`, so an overlapping second call overwrites the first
 * call's errors. A root without `$id` compiles an `$async` transient and is the control.
 */
const schema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
  required: ['name'],
};

const keywords = (issues: unknown) =>
  ((issues as { keyword?: string; dataPath: string }[] | null) ?? []).map((issue) => `${issue.keyword} ${issue.dataPath}`);

describe('ajv6 validator called again before an earlier call settles', () => {
  it('[control] two overlapping calls on a root without $id each report their own verdict', async () => {
    const validate = plugin.validator.compile({ ...schema } as any);
    const [invalid, valid] = await Promise.all([validate({ name: 'x' }), validate({ name: 'valid' })]);
    expect([keywords(invalid), keywords(valid)]).toEqual([['minLength /name'], []]);
  });

  it('two overlapping calls on a root with $id each report their own verdict', async () => {
    const validate = plugin.validator.compile({ ...schema, $id: 'https://example.com/person.json' } as any);
    const [invalid, valid] = await Promise.all([validate({ name: 'x' }), validate({ name: 'valid' })]);
    expect([keywords(invalid), keywords(valid)]).toEqual([['minLength /name'], []]);
  });
});
