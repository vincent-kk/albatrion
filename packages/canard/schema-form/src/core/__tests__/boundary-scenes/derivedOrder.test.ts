import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { derivedOrderScenes } from './fixtures/scenes/derivedOrder';

describe('boundary scenes: derived-order', () => {
  it.each(derivedOrderScenes)('$id', assertBoundaryScene);
});
