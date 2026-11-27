import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it, vi } from 'vitest';

/** Evaluate a separate plugin copy while retaining the shared AJV instance. */
const loadCopy = async () => {
  vi.resetModules();
  return import('../default/index');
};

/** Compare the public behavior of one module copy with separately evaluated copies. */
const verdicts = async (separateCopies: boolean, sameId: boolean) => {
  const firstCopy = await loadCopy();
  const secondCopy = separateCopies ? await loadCopy() : firstCopy;
  const instance = new Ajv({ allErrors: true, strict: false });
  if (sameId && separateCopies) {
    const independent = secondCopy.createValidator(
      new Ajv({ allErrors: true, strict: false }),
    );
    const warmup: JSONSchema = {
      $id: 'https://round-four.invalid/warmup',
      type: 'string',
    };
    independent.compile(warmup);
    independent.release?.(warmup);
  }
  const first = firstCopy.createValidator(instance);
  const second = secondCopy.createValidator(instance);
  const schemaA: JSONSchema = {
    $id: 'https://round-four.invalid/copy-a',
    type: 'object',
    properties: { x: { type: 'string' } },
  };
  const schemaB: JSONSchema = {
    $id: sameId
      ? 'https://round-four.invalid/copy-a'
      : 'https://round-four.invalid/copy-b',
    type: 'object',
    properties: { z: { type: 'string' } },
  };
  const validateA = first.compile(schemaA);
  const validateB = second.compile(schemaB);
  const before = [
    (await validateA({ x: 1 }))?.map(({ keyword, dataPath }) => [
      keyword,
      dataPath,
    ]),
    (await validateB({ z: 1 }))?.map(({ keyword, dataPath }) => [
      keyword,
      dataPath,
    ]),
  ];
  first.release?.(schemaA);
  const retained = (await validateB({ z: 1 }))?.map(({ keyword, dataPath }) => [
    keyword,
    dataPath,
  ]);
  second.release?.(schemaB);
  return { before, retained };
};

it.each([false, true])(
  'separate copies agree with one copy before and after release, sameId=%s',
  async (sameId) => {
    const expected = await verdicts(false, sameId);
    expect(expected.before).toEqual([[['type', '/x']], [['type', '/z']]]);
    expect(await verdicts(true, sameId)).toEqual(expected);
  },
);
