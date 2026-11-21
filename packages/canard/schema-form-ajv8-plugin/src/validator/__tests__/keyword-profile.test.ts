import Ajv from 'ajv';
import { expect, it } from 'vitest';
import { makeSibling } from '../utils/makeSibling';
import { createInstanceValidator } from '../createInstanceValidator';

it.each([true, false])('preserves a replaced builtin in guards and same-id compilers (%s)', async (directGuardCompile) => {
  const instance = new Ajv({ strict: false });
  instance.removeKeyword('minimum');
  instance.addKeyword({ keyword: 'minimum', type: 'number', validate: (limit: number, value: number) => value <= limit });
  const validator = createInstanceValidator(instance, "http://json-schema.org/draft-07/schema#", { directGuardCompile });
  const first = { $id: 'https://example.test/keyword-profile', type: 'number' as const, minimum: 10, if: { type: 'number' as const, minimum: 10 } };
  const second = { ...first, if: { ...first.if } };
  for (const root of [first, second]) {
    const validate = validator.compile(root);
    const guard = validator.compileGuard?.(root, '/if');
    expect(await validate(5)).toBeNull();
    expect(await validate(15)).not.toBeNull();
    expect(guard?.(5)).toBe(true);
    expect(guard?.(15)).toBe(false);
  }
  validator.release?.(first);
  validator.release?.(second);
});
it('keeps a removed builtin absent in a sibling', () => {
  const instance = new Ajv({ strict: false });
  instance.removeKeyword('minimum');
  const sibling = makeSibling(instance, false, false);
  expect(sibling.getKeyword('minimum')).toBe(false);
});
