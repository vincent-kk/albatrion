import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { childConsistencyScenes } from './fixtures/scenes/childConsistency';

describe('boundary scenes: child-consistency', () => {
  it.each(childConsistencyScenes)('$id', assertBoundaryScene);
});
