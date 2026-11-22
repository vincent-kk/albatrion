import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

const make = () => new Ajv({ allErrors: true, strict: false });

describe('native AJV parity of reference targets (diagnostics)', () => {
  it('diagnostic: which key native AJV selects for a percent-encoded slash', () => {
    const native = make();
    const validate = native.compile({
      components: {
        'a/b': { type: 'string', minLength: 4 },
        a: { b: { type: 'string', maxLength: 1 } },
      },
      $ref: '#/components/a%2Fb',
    });
    // 'ab' passes minLength 4? no. maxLength 1? no. Record which keyword fails.
    validate('ab');
    expect(validate.errors?.[0]?.keyword).toBe('minLength');
  });

  it.each([
    ['%2F', '#/components/a%2Fb'],
    ['~1', '#/components/a~1b'],
  ])(
    'a key containing a slash referenced with %s imports its application reference',
    async (_kind, ref) => {
      const schema = {
        components: { 'a/b': { $ref: 'app-check' } },
        $ref: ref,
      };
      const native = make();
      native.addSchema({ type: 'string', minLength: 4 }, 'app-check');
      expect(native.compile(structuredClone(schema))('bad')).toBe(false);
      const ajv = make();
      ajv.addSchema({ type: 'string', minLength: 4 }, 'app-check');
      expect(await createValidator(ajv).compile(schema as any)('bad')).toEqual(
        [expect.objectContaining({ keyword: 'minLength' })],
      );
    },
  );

  it.each([
    ['object container', (inner: object) => ({ scope: inner }), '#/components/scope/payload'],
    ['array container', (inner: object) => [inner], '#/components/0/payload'],
  ])(
    'a reference target inside an %s resolves against its enclosing $id',
    async (_kind, wrap, ref) => {
      const schema = {
        components: wrap({
          $id: 'https://r6.invalid/scoped/',
          payload: { $ref: 'check' },
        }),
        $ref: ref,
      };
      const app = { $id: 'https://r6.invalid/scoped/check', type: 'string', minLength: 4 };
      const native = make();
      native.addSchema(structuredClone(app));
      expect(native.compile(structuredClone(schema))('bad')).toBe(false);
      const ajv = make();
      ajv.addSchema(structuredClone(app));
      expect(await createValidator(ajv).compile(schema as any)('bad')).toEqual(
        [expect.objectContaining({ keyword: 'minLength' })],
      );
    },
  );

});
