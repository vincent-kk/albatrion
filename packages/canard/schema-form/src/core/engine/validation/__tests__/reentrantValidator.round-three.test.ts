import { createValidator } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { readFieldNodeRuntime } from '@/schema-form/__tests__/helpers/readFieldNodeRuntime';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

import type { Validator } from '../types/validator';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    checked: { type: 'boolean' },
  },
} as const;

/**
 * LC2: a validator whose run writes back into the form (for example an async uniqueness check
 * that records "checked" on the form). Writing the same value every run must not keep the form
 * revalidating forever.
 */
describe('r3-validation validator that calls back into the form', () => {
  it('a validator writing the same value back settles after a bounded number of runs (OnChange)', async () => {
    let runs = 0;
    let root: any;
    const validator: Validator = {
      compile: () => async (value: any) => {
        runs++;
        await Promise.resolve();
        root?.find('/checked')?.setValue(true);
        return value?.name === 'ok'
          ? null
          : [{ dataPath: '/name', keyword: 'x', message: 'x' }];
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { name: 'a' },
      validationMode: ValidationMode.OnChange,
      validator,
    });
    await wait(400);
    const afterLoad = runs;
    root.find('/name').setValue('b');
    await wait(600);
    expect(afterLoad).toBeLessThanOrEqual(3);
    expect(runs - afterLoad).toBeLessThanOrEqual(3);
  });

  it('the verdict of a validator that writes the same value back still reaches the field (OnChange)', async () => {
    let root: any;
    const validator: Validator = {
      compile: () => async () => {
        await Promise.resolve();
        root?.find('/checked')?.setValue(true);
        return [{ dataPath: '/name', keyword: 'x', message: 'x' }];
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { name: 'a', checked: true },
      validationMode: ValidationMode.OnChange,
      validator,
    });
    await wait(400);
    expect(
      root.find('/name').errors.map((issue: any) => issue.keyword),
    ).toEqual(['x']);
  });

  it('[control] a validator that writes only when the value differs settles', async () => {
    let runs = 0;
    let root: any;
    const validator: Validator = {
      compile: () => async () => {
        runs++;
        await Promise.resolve();
        if (root?.find('/checked')?.value !== true)
          root?.find('/checked')?.setValue(true);
        return [{ dataPath: '/name', keyword: 'x', message: 'x' }];
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { name: 'a' },
      validationMode: ValidationMode.OnChange,
      validator,
    });
    await wait(400);
    expect(runs).toBeLessThanOrEqual(3);
    expect(
      root.find('/name').errors.map((issue: any) => issue.keyword),
    ).toEqual(['x']);
  });

  it('an AJV8 async keyword that records its check on the form settles (OnChange)', async () => {
    let calls = 0;
    let root: any;
    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addKeyword({
      keyword: 'availableName',
      async: true,
      validate: async (_schema: boolean, data: string) => {
        calls++;
        await Promise.resolve();
        root?.find('/checked')?.setValue(true);
        return data !== 'taken';
      },
    });
    root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', availableName: true },
          checked: { type: 'boolean' },
        },
      },
      defaultValue: { name: 'taken' },
      validationMode: ValidationMode.OnChange,
      validator: createValidator(ajv),
    });
    await wait(400);
    expect({
      boundedCalls: calls <= 3,
      nameErrors: root.find('/name').errors.map((issue: any) => issue.keyword),
    }).toEqual({ boundedCalls: true, nameErrors: ['availableName'] });
  });

  it('a synchronous validator reading the form handle during the run sees the validated value', async () => {
    const seen: unknown[] = [];
    let root: any;
    const validator: Validator = {
      compile: () => (value: any) => {
        seen.push([value?.name, root?.value?.name]);
        return null;
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { name: 'a' },
      validationMode: ValidationMode.OnRequest,
      validator,
    });
    root.find('/name').setValue('b');
    await root.validate();
    expect(seen).toEqual([['b', 'b']]);
  });
});

it('round-3: explicit validation still publishes a same-value validator write-back', async () => {
  let root: any;
  root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { name: 'a', checked: true },
    validationMode: ValidationMode.OnRequest,
    validator: {
      compile: () => async () => {
        root.find('/checked').setValue(true);
        return [{ dataPath: '/name', keyword: 'same' }];
      },
      compileGuard: () => () => true,
    },
  });
  await root.validate();
  expect(root.find('/name').errors.map((issue: any) => issue.keyword)).toEqual([
    'same',
  ]);
});
it('round-3: a same-value NaN root write-back settles using the value equality contract', async () => {
  let root: any;
  let runs = 0;
  root = nodeFromJSONSchema({
    jsonSchema: { type: 'number' },
    defaultValue: NaN,
    validationMode: ValidationMode.OnChange,
    validator: {
      compile: () => async () => {
        runs++;
        root?.setValue(NaN);
        return [{ dataPath: '', keyword: 'finite' }];
      },
      compileGuard: () => () => true,
    },
  });
  await wait(200);
  expect(runs).toBeLessThanOrEqual(3);
  expect(root.errors.map((issue: any) => issue.keyword)).toEqual(['finite']);
  root.setValue(NaN);
  await wait(20);
  expect(readFieldNodeRuntime(root).isValidationPending).toBe(false);
});

it('round-3: node.validate explicitly reruns for the same unchanged input', async () => {
  let runs = 0;
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'string' },
    defaultValue: 'same',
    validationMode: ValidationMode.OnRequest,
    validator: {
      compile: () => () => {
        runs++;
        return null;
      },
      compileGuard: () => () => true,
    },
  });
  await root.validate();
  await root.validate();
  expect(runs).toBe(2);
});
