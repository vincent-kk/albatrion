import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../../../schema-form-ajv8-plugin/src/default/index';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import type { Validator } from '@/schema-form/core/engine/validation';

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
        return value?.name === 'ok' ? null : [{ dataPath: '/name', keyword: 'x', message: 'x' }];
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({
      jsonSchema: schema as any,
      defaultValue: { name: 'a' } as any,
      validationMode: ValidationMode.OnChange,
      validator,
    });
    await wait(400);
    const afterLoad = runs;
    root.find('/name').setValue('b');
    await wait(600);
    console.log(`[r3-validation] runs after load ${afterLoad}, after one edit ${runs}`);
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
      jsonSchema: schema as any,
      defaultValue: { name: 'a', checked: true } as any,
      validationMode: ValidationMode.OnChange,
      validator,
    });
    await wait(400);
    expect(root.find('/name').errors.map((issue: any) => issue.keyword)).toEqual(['x']);
  });

  it('[control] a validator that writes only when the value differs settles', async () => {
    let runs = 0;
    let root: any;
    const validator: Validator = {
      compile: () => async () => {
        runs++;
        await Promise.resolve();
        if (root?.find('/checked')?.value !== true) root?.find('/checked')?.setValue(true);
        return [{ dataPath: '/name', keyword: 'x', message: 'x' }];
      },
      compileGuard: () => () => true,
    };
    root = nodeFromJSONSchema({
      jsonSchema: schema as any,
      defaultValue: { name: 'a' } as any,
      validationMode: ValidationMode.OnChange,
      validator,
    });
    await wait(400);
    expect(runs).toBeLessThanOrEqual(3);
    expect(root.find('/name').errors.map((issue: any) => issue.keyword)).toEqual(['x']);
  });

  it('[diagnostic] a same-value setValue outside validation and its commit/stamp counters', async () => {
    const root: any = nodeFromJSONSchema({
      jsonSchema: schema as any,
      defaultValue: { name: 'a', checked: true } as any,
      validationMode: ValidationMode.OnRequest,
      validator: { compile: () => () => null, compileGuard: () => () => true },
    });
    const before = {
      commit: root.runtime.commitNumber,
      stamp: root.runtime.validationStamp,
      value: root.value,
    };
    root.find('/checked').setValue(true);
    const after = {
      commit: root.runtime.commitNumber,
      stamp: root.runtime.validationStamp,
      sameValue: root.value === before.value,
    };
    console.log('[r3-validation] same-value write', JSON.stringify({ before: { commit: before.commit, stamp: before.stamp }, after }));
    expect(after.commit).toBe(before.commit);
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
      } as any,
      defaultValue: { name: 'taken' } as any,
      validationMode: ValidationMode.OnChange,
      validator: createValidator(ajv),
    });
    await wait(400);
    console.log(`[r3-validation] async keyword calls in 400 ms: ${calls}`);
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
      jsonSchema: schema as any,
      defaultValue: { name: 'a' } as any,
      validationMode: ValidationMode.OnRequest,
      validator,
    });
    root.find('/name').setValue('b');
    await root.validate();
    expect(seen).toEqual([['b', 'b']]);
  });
});
