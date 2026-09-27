import { describe, expect, it } from 'vitest';

import { fillScenarios } from '../fill/empty.scenario';
import { narrowingScenarios } from '../narrowing/empty.scenario';
import { unionScenarios } from '../union/empty.scenario';

// filid:contract scenario-data
describe('empty scenario families', () => {
  it('reserves union, fill, and narrowing without claiming engine coverage', () => {
    expect([...unionScenarios, ...fillScenarios, ...narrowingScenarios]).toEqual([]);
  });
});
