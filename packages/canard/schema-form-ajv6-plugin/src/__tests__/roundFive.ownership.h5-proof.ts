import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

const addressId = 'https://round-five.invalid/address';
const address = {
  $id: addressId,
  type: 'object',
  required: ['city'],
  properties: { city: { type: 'string' } },
} satisfies JSONSchema;
const application = {
  $id: 'https://round-five.invalid/application',
  type: 'object',
  properties: { shipTo: { $ref: addressId } },
  definitions: { address },
};
const root = (): JSONSchema => ({
  $id: 'https://round-five.invalid/form',
  type: 'object',
  properties: { home: { $ref: addressId } },
  definitions: { address },
});

it('round-5 class 43: a form lifetime preserves application and later-form resolution', async () => {
  const results = [];
  for (const compileForm of [false, true]) {
    const instance = new Ajv({ allErrors: true });
    instance.addSchema(application);
    instance.validate(application.$id, { shipTo: {} });
    const adapter = createValidator(instance);
    if (compileForm) {
      const schema = root();
      await adapter.compile(schema)({ home: {} });
      adapter.release?.(schema);
    }
    const later: JSONSchema = {
      type: 'object',
      properties: { home: { $ref: addressId } },
    };
    results.push({
      application: instance.validate(addressId, {}),
      newReference: instance.compile({
        properties: { destination: { $ref: addressId } },
      })({ destination: {} }),
      later: (await adapter.compile(later)({ home: {} }))?.map(
        ({ keyword, dataPath }) => ({ keyword, dataPath }),
      ),
    });
  }
  expect(results[1]).toEqual(results[0]);
});

it('round-5 class 44: discarded adapters release their roots and preserve the next visit', async () => {
  setFlagsFromString('--expose_gc');
  const collect = runInNewContext('gc');
  const instance = new Ajv({ allErrors: true });
  const schema: JSONSchema = {
    $id: 'https://round-five.invalid/visit',
    type: 'string',
    minLength: 3,
  };
  const before = Object.keys(instance._refs);
  const visit = async () => {
    const adapter = createValidator(instance);
    return {
      verdict: await adapter.compile({ ...schema })('x'),
      reference: new WeakRef(adapter),
    };
  };
  const first = await visit();
  for (let index = 0; index < 8; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    collect();
  }
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(first.reference.deref()).toBeUndefined();
  expect(Object.keys(instance._refs)).toEqual(before);
  expect((await visit()).verdict).toEqual(first.verdict);
});
