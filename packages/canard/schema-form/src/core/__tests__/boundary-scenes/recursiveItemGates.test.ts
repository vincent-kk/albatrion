import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { recursiveItemGateScenes } from './fixtures/scenes/recursiveItemGates';

describe('boundary scenes: recursive-item-gates', () => {
  it.each(recursiveItemGateScenes)('$id', assertBoundaryScene);
});
