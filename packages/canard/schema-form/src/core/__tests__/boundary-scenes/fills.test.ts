import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { fillScenes } from './fixtures/scenes/fills';

describe('boundary scenes: fills', () => {
  it.each(fillScenes)('$id', assertBoundaryScene);
});
