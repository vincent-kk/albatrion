/// <reference lib="es2021.weakref" />

import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { createValidator } from '../default';

const ROOT: JSONSchema = {
  $id: 'https://example.test/long-lived-root',
  type: 'object',
  properties: { name: { type: 'string' } },
  if: { properties: { name: { const: 'a' } } },
  then: { required: ['name'] },
};

const collectGarbage = async () => {
  setFlagsFromString('--expose_gc');
  const collect = runInNewContext('gc');
  for (let turn = 0; turn < 16; turn++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    collect();
  }
};

it('does not keep a private compiler for every collected adapter of a long-lived root', async () => {
  const tracked: WeakRef<object>[] = [];
  class TrackedAjv extends Ajv {
    constructor(...args: ConstructorParameters<typeof Ajv>) {
      super(...args);
      tracked.push(new WeakRef(this));
    }
  }
  const countLive = () => tracked.filter((ref) => ref.deref()).length;
  const instance = new TrackedAjv({ allErrors: true, strict: false });
  const visit = async () => {
    const adapter = createValidator(instance);
    expect(await adapter.compile(ROOT)({ name: 'a' })).toBeNull();
    expect(adapter.compileGuard(ROOT, '/if')({ name: 'a' })).toBe(true);
  };
  await visit();
  await collectGarbage();
  const baseline = countLive();
  for (let index = 0; index < 40; index++) await visit();
  await collectGarbage();
  expect(countLive()).toBe(baseline);
});
