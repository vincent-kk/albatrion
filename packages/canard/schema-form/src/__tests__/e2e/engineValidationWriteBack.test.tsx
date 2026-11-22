import { expect, it } from 'vitest';

import { type FieldNode, ValidationMode } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it.each([false, true])(
  'publishes explicit validation after a validator write-back (value changed=%s)',
  async (changeValue) => {
    let root: FieldNode | undefined;
    let calls = 0;
    root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: { name: { type: 'string' }, checked: { type: 'boolean' } },
      },
      defaultValue: { name: 'a', checked: !changeValue },
      validationMode: ValidationMode.OnRequest,
      validatorFactory: {
        compile: () => async () => {
          calls++;
          root?.find('/checked')!.setValue(true);
          return [{ dataPath: '/name', keyword: 'write-back' }];
        },
        compileGuard: () => () => true,
      },
    });
    await root.validate();
    expect(root.find('/checked')!.value).toBe(true);
    if (changeValue) await root.validate();
    expect(root.find('/name')!.errors.map((issue) => issue.keyword)).toEqual([
      'write-back',
    ]);
    expect(calls).toBe(changeValue ? 2 : 1);
  },
);

it('publishes a virtual field validation issue on the addressed constituent', async () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      options: { virtual: { pair: { fields: ['a', 'b'] } } },
    },
    defaultValue: { a: 'a', b: 'b' },
    validationMode: ValidationMode.OnRequest,
    validatorFactory: {
      compile: () => () => [{ dataPath: '/b', keyword: 'constituent' }],
      compileGuard: () => () => true,
    },
  });
  await root.find('/pair')!.validate();
  expect(root.find('/a')!.errors).toEqual([]);
  expect(root.find('/b')!.errors.map((issue) => issue.keyword)).toEqual([
    'constituent',
  ]);
});

it('does not publish an explicit validation whose validator always replaces its input', async () => {
  let root: FieldNode | undefined;
  let writes = 0;
  root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: { n: { type: 'number' } },
    },
    defaultValue: { n: 0 },
    validationMode: ValidationMode.OnRequest,
    validatorFactory: {
      compile: () => () => {
        root?.find('/n')!.setValue(++writes);
        return [{ dataPath: '/n', keyword: 'outdated' }];
      },
      compileGuard: () => () => true,
    },
  });
  for (const expected of [1, 2]) {
    await root.validate();
    expect(root.find('/n')!.value).toBe(expected);
    expect(root.find('/n')!.errors).toEqual([]);
  }
});
