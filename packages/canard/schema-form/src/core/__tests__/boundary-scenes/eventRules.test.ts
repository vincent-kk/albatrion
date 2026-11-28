import { describe, it } from 'vitest';

import { assertBoundaryScene } from './fixtures/assertBoundaryScene';
import { eventRuleScenes } from './fixtures/scenes/eventRules';

describe('boundary scenes: event-rules', () => {
  it.each(eventRuleScenes)('$id', assertBoundaryScene);
});
