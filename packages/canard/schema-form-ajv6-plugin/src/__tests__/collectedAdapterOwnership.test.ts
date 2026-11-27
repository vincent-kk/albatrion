/// <reference lib="es2021.weakref" />

import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it('releases a discarded adapter while its original root remains alive', async () => {
  setFlagsFromString('--expose_gc');
  const collect = runInNewContext('gc');
  const instance = new Ajv({ allErrors: true });
  const root: JSONSchema = {
    $id: 'https://example.test/live-root',
    type: 'string',
    minLength: 3,
  };
  const visit = async () => {
    const adapter = createValidator(instance);
    const validate = adapter.compile(root);
    expect(await validate('valid')).toBeNull();
    return new WeakRef(adapter);
  };
  const reference = await visit();
  for (let turn = 0; turn < 16; turn++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    collect();
  }
  expect(reference.deref()).toBeUndefined();
  expect(instance.getSchema(root.$id ?? '')).toBeUndefined();
  expect(root.type).toBe('string');
});
