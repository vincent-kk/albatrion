import { describe, expect, it } from 'vitest';

import * as coreByName from '@canard/schema-form';
import * as filterByName from '@winglet/common-utils/filter';

import * as coreBySource from '../../../../schema-form/src/index';
import * as filterBySource from '../../../../../winglet/common-utils/src/utils/filter/index';

/**
 * Control for the probe-local config: package-name imports must be the same module instances as
 * the workspace `src` files, never a built `dist`.
 */
describe('[control] workspace packages resolve to source', () => {
  it('@canard/schema-form is the src module', () => {
    expect(coreByName.FormErrorCode).toBe(coreBySource.FormErrorCode);
  });
  it('@winglet/common-utils/filter is the src module', () => {
    expect(filterByName.isArray).toBe(filterBySource.isArray);
  });
});
