import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createValidatorFactory, plugin } from '../index';

const repositoryRoot = resolve(__dirname, '../../../../..');
const requireFromPlugin = createRequire(resolve(__dirname, '../index.ts'));
/**
 * A second installed copy of the same ajv release. The repository hoists ajv 8 to the root,
 * so every ajv 6 dependent gets its own nested copy (eslint, file-loader, this plugin, ...);
 * an application workspace that declares `ajv@6` in such a monorepo gets one more.
 */
const foreignAjvPath = createRequire(
  resolve(repositoryRoot, 'node_modules/eslint/package.json'),
).resolve('ajv');
const ownAjvPath = requireFromPlugin.resolve('ajv');

const ownVerdict = async () => {
  const OwnAjv = requireFromPlugin(ownAjvPath);
  return {
    issues: await createValidatorFactory(new OwnAjv({ allErrors: true }))(
      schema,
    )({ age: 'x' }),
  };
};

const schema = {
  type: 'object',
  properties: { age: { type: 'number' } },
} as const;

describe('r3-contracts ajv6: an application Ajv 6 instance from another installed copy', () => {
  it('setup: the two ajv 6.12.6 copies are distinct modules', () => {
    expect(foreignAjvPath).not.toBe(ownAjvPath);
    expect(
      requireFromPlugin(resolve(foreignAjvPath, '../../package.json')).version,
    ).toBe(
      requireFromPlugin(resolve(ownAjvPath, '../../package.json')).version,
    );
  });

  it('control: the plugin own ajv copy reports issues for invalid data', async () => {
    const Ajv = requireFromPlugin(ownAjvPath);
    const validate = createValidatorFactory(new Ajv({ allErrors: true }))(
      schema,
    );
    await expect(validate({ age: 'x' })).resolves.toEqual([
      expect.objectContaining({ dataPath: '/age', keyword: 'type' }),
    ]);
  });

  it('createValidatorFactory reports issues, not a rejection, for an equal Ajv 6 release from another copy', async () => {
    const ForeignAjv = requireFromPlugin(foreignAjvPath);
    const validate = createValidatorFactory(
      new ForeignAjv({ allErrors: true }),
    )(schema);
    const outcome = await Promise.resolve(validate({ age: 'x' })).then(
      (issues) => ({ issues }),
      (error: Error) => ({
        rejected: error.constructor.name + ': ' + error.message,
      }),
    );
    expect(outcome).toEqual(await ownVerdict());
  });

  it('plugin.validator.bind(customAjv), as the README shows, reports issues for invalid data', async () => {
    const ForeignAjv = requireFromPlugin(foreignAjvPath);
    plugin.validator.bind(
      new ForeignAjv({ allErrors: true, nullable: true, format: false }),
    );
    const validate = plugin.validator.compile({ ...schema });
    const outcome = await Promise.resolve(validate({ age: 'x' })).then(
      (issues) => ({ issues }),
      (error: Error) => ({
        rejected: error.constructor.name + ': ' + error.message,
      }),
    );
    expect(outcome).toEqual(await ownVerdict());
  });
});
