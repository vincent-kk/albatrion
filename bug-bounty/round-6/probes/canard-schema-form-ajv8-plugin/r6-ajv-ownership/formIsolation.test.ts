import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../../default/index';

const SHARED = 'https://r6-ownership.invalid/shared';

/** Form A declares an embedded resource id; it never touches the application instance. */
const formA = (): JSONSchema => ({
  type: 'object',
  definitions: { a: { $id: SHARED, type: 'string' } },
  properties: { x: { $ref: SHARED } },
});
/** Form B references an application schema registered under an alias key. */
const formB = (): JSONSchema => ({
  type: 'object',
  properties: { n: { $ref: SHARED } },
});

/** Outcome of compiling and running form B, or the compile error message. */
const runB = async (
  compile: () => (data: unknown) => Promise<unknown>,
): Promise<unknown> => {
  try {
    const validate = compile();
    return {
      number: await validate({ n: 1 }),
      string: ((await validate({ n: 'x' })) as unknown[] | null)?.length,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

it('EQ12 control: form B alone resolves the application alias', async () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addSchema({ type: 'number' }, SHARED);
  const validator = createValidator(ajv);
  expect(await runB(() => validator.compile(formB()))).toEqual({
    number: null,
    string: 1,
  });
});

it('EQ12: a live sibling form with an embedded id does not break form B on the shared instance', async () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(ajv);
  await validator.compile(formA())({ x: 's' });
  ajv.addSchema({ type: 'number' }, SHARED);
  expect(await runB(() => validator.compile(formB()))).toEqual({
    number: null,
    string: 1,
  });
});

it('LC5: a released form with an embedded id does not break a later form B', async () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(ajv);
  const a = formA();
  await validator.compile(a)({ x: 's' });
  validator.release?.(a);
  ajv.addSchema({ type: 'number' }, SHARED);
  expect(await runB(() => validator.compile(formB()))).toEqual({
    number: null,
    string: 1,
  });
});

it('LC5: a released form root id does not break a later guard that references an application alias of that id', () => {
  const ROOT = 'https://r6-ownership.invalid/root';
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(ajv);
  const a: JSONSchema = {
    $id: ROOT,
    type: 'object',
    definitions: { s: { type: 'string' } },
    properties: { x: { $ref: '#/definitions/s' } },
  };
  validator.compileGuard(a, '/properties/x')('s');
  validator.release?.(a);
  ajv.addSchema({ type: 'number' }, ROOT);
  const b: JSONSchema = {
    type: 'object',
    definitions: { n: { $ref: ROOT } },
    properties: { n: { $ref: '#/definitions/n' } },
  };
  let outcome: unknown;
  try {
    const guard = validator.compileGuard(b, '/properties/n');
    outcome = [guard(1), guard('x')];
  } catch (error) {
    outcome = (error as Error).message;
  }
  expect(outcome).toEqual([true, false]);
});
