import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { validationRoutingScenes } from './fixtures/scenes/validationRouting';

describe('boundary scenes: validation-routing', () => {
  it.each(validationRoutingScenes)('$id', assertBoundaryScene);
});
