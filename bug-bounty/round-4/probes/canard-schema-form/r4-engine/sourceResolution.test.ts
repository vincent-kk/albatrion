import { expect, it } from 'vitest';

/**
 * Control for vitest.config.ts in this folder: the @winglet/* specifiers that schema-form's own
 * source imports must resolve to the same module instances as the packages' src entry files.
 * Fails under the package's default config, where they resolve to the stale dist.
 */
it('control: @winglet subpaths imported by schema-form resolve to src', async () => {
  const pairs = await Promise.all([
    Promise.all([
      import('@winglet/common-utils/filter'),
      import('../../../../../winglet/common-utils/src/utils/filter/index.ts'),
    ]),
    Promise.all([
      import('@winglet/json-schema/filter'),
      import('../../../../../winglet/json-schema/src/filters/index.ts'),
    ]),
    Promise.all([
      import('@winglet/json/pointer'),
      import('../../../../../winglet/json/src/JSONPointer/index.ts'),
    ]),
  ]);
  expect(pairs.map(([byName, bySource]) => byName === bySource)).toEqual([true, true, true]);
});
