import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { supportLimitScenes } from './fixtures/scenes/supportLimits';

describe('boundary scenes: support-limits', () => {
  it.each(supportLimitScenes)('$id', assertBoundaryScene);
});
