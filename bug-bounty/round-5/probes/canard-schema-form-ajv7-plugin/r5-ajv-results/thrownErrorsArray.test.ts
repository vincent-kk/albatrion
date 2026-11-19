/**
 * r5-ajv-results: a keyword that fails with an exception carrying an `errors` array
 * (an `AggregateError` from `Promise.any`, or a library validation error) in the middle of a run.
 * Imports the plugin source (`../../index`) and the AJV 7.2.4 copy the plugin resolves.
 */
import AjvModule from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

const Ajv = ((AjvModule as unknown as { default?: unknown }).default ?? AjvModule) as new (
  options: object,
) => { addKeyword(definition: object): void };

const aggregate = () =>
  new AggregateError([new Error('server a down'), new Error('server b down')], 'all down');
const libraryError = () =>
  Object.assign(new Error('2 errors occurred'), {
    name: 'ValidationError',
    errors: ['name is taken', 'name is reserved'],
  });

let failure: () => unknown = aggregate;

const createInstance = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addKeyword({
    keyword: 'remoteCheck',
    async: true,
    validate: async () => {
      throw failure();
    },
  });
  ajv.addKeyword({
    keyword: 'localCheck',
    validate: () => {
      throw failure();
    },
  });
  return ajv;
};

let sequence = 0;
const schemaOf = (keyword: 'remoteCheck' | 'localCheck', withId: boolean) => ({
  ...(withId ? { $id: `https://example.com/r5-ajv7-thrown-${++sequence}.json` } : {}),
  type: 'object',
  properties: { name: { type: 'string', minLength: 3, [keyword]: true } },
});

const settle = async (schema: object) => {
  const validate = createValidator(createInstance() as never).compile(schema as never);
  try {
    const issues = (await validate({ name: 'x' })) as
      | { keyword?: string; dataPath: string; message?: string }[]
      | null;
    return {
      resolved: issues?.map((issue) => [issue.keyword, issue.dataPath, issue.message]) ?? null,
    };
  } catch (error) {
    return { rejected: error };
  }
};

describe('ajv7: a keyword exception that carries an errors array', () => {
  for (const withId of [false, true]) {
    const root = withId ? 'root with $id' : 'root without $id';

    it(`an asynchronous keyword rejecting with AggregateError rejects validation with that error (${root})`, async () => {
      failure = aggregate;
      const outcome = await settle(schemaOf('remoteCheck', withId));
      expect(outcome).toEqual({ rejected: expect.any(AggregateError) });
      expect((outcome as { rejected?: Error }).rejected?.message).toBe('all down');
    });

    it(`an asynchronous keyword rejecting with a library ValidationError rejects validation with that error (${root})`, async () => {
      failure = libraryError;
      const outcome = await settle(schemaOf('remoteCheck', withId));
      expect((outcome as { rejected?: Error }).rejected?.message).toBe('2 errors occurred');
    });

    it(`a synchronous keyword throwing AggregateError rejects validation with that error (${root})`, async () => {
      failure = aggregate;
      const outcome = await settle(schemaOf('localCheck', withId));
      expect((outcome as { rejected?: Error }).rejected?.message).toBe('all down');
    });

    it(`[control] an asynchronous keyword rejecting with a plain Error rejects validation with that error (${root})`, async () => {
      failure = () => new Error('network');
      const outcome = await settle(schemaOf('remoteCheck', withId));
      expect((outcome as { rejected?: Error }).rejected?.message).toBe('network');
    });
  }
});
