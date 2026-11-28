import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { batchedWriteScenes } from './fixtures/scenes/batchedWrites';

describe('boundary scenes: batched-writes', () => {
  it.each(batchedWriteScenes)('$id', assertBoundaryScene);
});
