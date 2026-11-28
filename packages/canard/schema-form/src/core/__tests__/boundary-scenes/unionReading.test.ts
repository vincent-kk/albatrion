import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { unionReadingScenes } from './fixtures/scenes/unionReading';

describe('boundary scenes: union-reading', () => {
  it.each(unionReadingScenes)('$id', assertBoundaryScene);
});
