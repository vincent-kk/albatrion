import { isArray, isPlainObject } from '@/common-utils/utils/filter';
import { getDataProperty } from '../../../getDataProperty';
import { setDataProperty } from '../../../setDataProperty';
import type { merge } from '../../merge';

import { loadMergeModule } from './createMergeImplementation/utils/loadMergeModule';

/**
 * Load compared merge implementations through exactly the same compilation path.
 * @param revision - Pinned local commit for the baseline, or workspace for the candidate
 * @returns The selected merge implementation compiled with installed TypeScript
 */
export const createMergeImplementation = (revision: string): typeof merge => {
  const policy = loadMergeModule(revision, 'merge/utils/mergeWithOptions.ts', {
    '@/common-utils/utils/filter': { isPlainObject },
    '../../getDataProperty': { getDataProperty },
    '../../setDataProperty': { setDataProperty },
  });
  if (revision === 'workspace') {
    const defaults = loadMergeModule(revision, 'merge/utils/mergeDefault.ts', {
      '@/common-utils/utils/filter': { isArray, isPlainObject },
    });
    return loadMergeModule(revision, 'merge/merge.ts', {
      './utils/mergeDefault': defaults,
      './utils/mergeWithOptions': policy,
    }).merge as typeof merge;
  }
  return loadMergeModule(revision, 'merge.ts', {
    '@/common-utils/utils/filter/isArray': { isArray },
    '@/common-utils/utils/filter/isPlainObject': { isPlainObject },
    './merge/utils/mergeWithOptions': policy,
  }).merge as typeof merge;
};
