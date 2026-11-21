import { describe, expect, it } from 'vitest';

import * as filterByName from '@winglet/common-utils/filter';
import * as jsonSchemaByName from '@winglet/json-schema';

import * as filterBySource from '../../../../../winglet/common-utils/src/utils/filter/index';
import * as jsonSchemaBySource from '../../../../../winglet/json-schema/src/index';

/**
 * Control for the probe-local config: package-name imports used by schema-form source must be the
 * same module instances as the workspace `src` files, never a built `dist`.
 */
describe('[control] workspace packages resolve to source', () => {
  it('@winglet/common-utils/filter is the src module', () => {
    expect(filterByName.isArray).toBe(filterBySource.isArray);
  });
  it('@winglet/json-schema is the src module', () => {
    const name = Object.keys(jsonSchemaBySource).find(
      (key) => typeof (jsonSchemaBySource as Record<string, unknown>)[key] === 'function',
    )!;
    expect((jsonSchemaByName as Record<string, unknown>)[name]).toBe(
      (jsonSchemaBySource as Record<string, unknown>)[name],
    );
  });
});
