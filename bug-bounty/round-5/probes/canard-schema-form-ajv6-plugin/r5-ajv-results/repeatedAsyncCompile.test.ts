/**
 * r5-ajv-results: compiling the same root object twice (two forms or two calls that share one
 * schema object) when the root has `$id` and an asynchronous keyword, on an application instance.
 * Imports the plugin source (`../../index`) and the AJV 6.12.6 copy the plugin resolves.
 * The `[bisect]` rows load the plugin source of a given commit from `./bisect/<commit>/`.
 */
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import * as current from '../../index';
import * as atB267 from './bisect/b267c050f/index';
import * as beforeB267 from './bisect/b267c050f-parent/index';

type PluginModule = typeof current;

const available = async (_schema: unknown, data: unknown) => data !== 'taken';

const createInstance = () => {
  const ajv = new Ajv({ allErrors: true });
  ajv.addKeyword('available', { async: true, validate: available });
  return ajv;
};

let sequence = 0;
const schemaOf = (options: { id: boolean; asynchronous: boolean }) => ({
  ...(options.id ? { $id: `https://example.com/r5-repeat-${++sequence}.json` } : {}),
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      ...(options.asynchronous ? { available: true } : {}),
    },
  },
});

const summarize = (issues: { keyword?: string; dataPath: string }[] | null) =>
  issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);

const compileTwice = async (
  module: PluginModule,
  schema: object,
  mode: 'createValidator' | 'bind',
) => {
  const results: unknown[] = [];
  const validator =
    mode === 'createValidator'
      ? module.createValidator(createInstance())
      : (module.plugin.validator.bind(createInstance()), module.plugin.validator);
  for (let round = 0; round < 2; round++) {
    try {
      const validate = validator.compile(schema as never);
      results.push(summarize((await validate({ name: 'x' })) as never));
    } catch (error) {
      results.push(`compile threw: ${(error as Error).message}`);
    }
  }
  return results;
};

describe('ajv6: one root object compiled twice', () => {
  it('a root with $id and an asynchronous keyword gives the same verdict on the second compile (createValidator)', async () => {
    const results = await compileTwice(
      current,
      schemaOf({ id: true, asynchronous: true }),
      'createValidator',
    );
    expect(results).toEqual([['minLength /name'], ['minLength /name']]);
  });

  it('a root with $id and an asynchronous keyword gives the same verdict on the second compile (plugin.validator.bind)', async () => {
    const results = await compileTwice(
      current,
      schemaOf({ id: true, asynchronous: true }),
      'bind',
    );
    expect(results).toEqual([['minLength /name'], ['minLength /name']]);
  });

  it('[control] a root with $id and no asynchronous keyword compiles twice', async () => {
    const results = await compileTwice(
      current,
      schemaOf({ id: true, asynchronous: false }),
      'createValidator',
    );
    expect(results).toEqual([['minLength /name'], ['minLength /name']]);
  });

  it('[control] a root without $id and with an asynchronous keyword compiles twice', async () => {
    const results = await compileTwice(
      current,
      schemaOf({ id: false, asynchronous: true }),
      'createValidator',
    );
    expect(results).toEqual([['minLength /name'], ['minLength /name']]);
  });

  it('[control] two adapters that share the instance compile the same root once each', async () => {
    const ajv = createInstance();
    const schema = schemaOf({ id: true, asynchronous: true });
    const first = await current.createValidator(ajv).compile(schema as never)({ name: 'x' });
    const second = await current.createValidator(ajv).compile(schema as never)({ name: 'x' });
    expect([summarize(first as never), summarize(second as never)]).toEqual([
      ['minLength /name'],
      ['minLength /name'],
    ]);
  });
});

describe('ajv6 bisect: one root object with $id and an asynchronous keyword compiled twice', () => {
  it('[bisect] at b267c050f^ the second compile gives the same verdict', async () => {
    const results = await compileTwice(
      beforeB267 as unknown as PluginModule,
      schemaOf({ id: true, asynchronous: true }),
      'createValidator',
    );
    expect(results).toEqual([['minLength /name'], ['minLength /name']]);
  });

  it('[bisect] at b267c050f the second compile gives the same verdict', async () => {
    const results = await compileTwice(
      atB267 as unknown as PluginModule,
      schemaOf({ id: true, asynchronous: true }),
      'createValidator',
    );
    expect(results).toEqual([['minLength /name'], ['minLength /name']]);
  });
});
