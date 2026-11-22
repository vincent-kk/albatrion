import AjvImport from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

// Rejected hypotheses kept from the earlier attempt: macro expansions that reach
// application references compile and report the referenced failure. The local
// fragment and hidden array cases moved to nativeParity.test.ts with a separate
// native instance.
const Ajv = (AjvImport as any).default ?? AjvImport;
const make = () => new Ajv({ allErrors: true });
const add = (ajv: any, name: string, definition: any) =>
  6 === 6 ? ajv.addKeyword(name, definition) : ajv.addKeyword({ keyword: name, ...definition });

describe('compile-facts macro references', () => {
  it.each([false, true])('macro reference to application fragment can retry (id=%s)', async (withId) => {
    const ajv = make();
    ajv.addSchema({ $id: 'https://r6.invalid/macro-target', components: { leaf: { type: 'string', minLength: 4 } } });
    add(ajv, 'lookup', { macro: () => ({ $ref: 'https://r6.invalid/macro-target#/components/leaf' }) });
    const schema: any = { ...(withId ? { $id: 'https://r6.invalid/macro-form' } : {}), lookup: true };
    expect(await createValidator(ajv).compile(schema)('bad')).toEqual(
      expect.arrayContaining([expect.objectContaining({ keyword: 'minLength' })]),
    );
  });

  it('macro local pointer discovers external references (no root id)', async () => {
    const ajv = make();
    ajv.addSchema({ type: 'string', minLength: 4 }, 'app-check');
    add(ajv, 'lookup', { macro: () => ({ $ref: '#/components/leaf' }) });
    const schema: any = { components: { leaf: { $ref: 'app-check' } }, lookup: true };
    expect(await createValidator(ajv).compile(schema)('bad')).toEqual(
      expect.arrayContaining([expect.objectContaining({ keyword: 'minLength' })]),
    );
  });
});
