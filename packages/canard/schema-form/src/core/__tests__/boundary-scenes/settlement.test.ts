import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { settlementScenes } from './fixtures/scenes/settlement';

describe('boundary scenes: settlement', () => {
  it.each(settlementScenes)('$id', assertBoundaryScene);
});
