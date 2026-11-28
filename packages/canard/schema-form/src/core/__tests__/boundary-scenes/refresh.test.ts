import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { refreshScenes } from './fixtures/scenes/refresh';

describe('boundary scenes: refresh', () => {
  it.each(refreshScenes)('$id', assertBoundaryScene);
});
