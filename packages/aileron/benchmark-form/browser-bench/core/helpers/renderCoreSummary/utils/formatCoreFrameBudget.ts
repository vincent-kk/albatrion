import type { CoreFrameBudget } from '../../../reportTypes';
import { formatCoreNumber } from './formatCoreNumber';

/** Frame budget cell. */
export const formatCoreFrameBudget = (
  value: CoreFrameBudget | undefined,
  part: 'frames' | 'overflowMs',
) =>
  value === null || value === undefined
    ? 'N/A'
    : formatCoreNumber(value[part], part === 'frames' ? 2 : 3);
