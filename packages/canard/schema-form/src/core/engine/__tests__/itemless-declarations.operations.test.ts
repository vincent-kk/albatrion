import { it } from 'vitest';

import { checkSourceScene } from './fixtures/itemlessDeclarationsSource';

it.each([
  'push',
  'insert-start',
  'insert-middle',
  'insert-end',
  'remove',
  'pop',
  'clear',
  'update',
  'out-of-range',
  'overwrite',
  'merge',
  'batch-mixed',
  'same-value-write',
])('preserves public operation and retention history: %s', checkSourceScene);
