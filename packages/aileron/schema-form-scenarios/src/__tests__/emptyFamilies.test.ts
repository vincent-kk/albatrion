import { describe, expect, it } from 'vitest';

import { fillScenarios } from '../fill/empty.scenario';
import { narrowingScenarios } from '../narrowing/empty.scenario';
import { unionScenarios } from '../union/empty.scenario';
import { runScenario } from '../utils/runScenario';

// filid:contract scenario-data
describe('empty scenario families', () => {
  it('reserves union, fill, and narrowing without claiming engine coverage', async () => {
    const results = await Promise.all([...unionScenarios, ...fillScenarios, ...narrowingScenarios]
      .map((scenario) => runScenario(scenario, {
        execute() { throw new Error('An empty family must not execute.'); },
        assert() { throw new Error('An empty family must not assert.'); },
      })));
    expect(results).toEqual([]);
  });
});
