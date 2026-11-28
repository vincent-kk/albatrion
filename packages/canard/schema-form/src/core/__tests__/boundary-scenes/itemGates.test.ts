import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { itemGateScenes } from './fixtures/scenes/itemGates';

describe('boundary scenes: item-gates', () => {
  it.each(itemGateScenes)('$id', assertBoundaryScene);
});
