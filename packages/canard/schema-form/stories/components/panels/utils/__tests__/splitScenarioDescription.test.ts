import { describe, expect, it } from 'vitest';

import { compositionFeatureScenarios } from '@aileron/schema-form-scenarios';

import { splitScenarioDescription } from '../splitScenarioDescription';

describe('splitScenarioDescription', () => {
  it('returns each cleaned clause of a real description as its own sentence', () => {
    const description = compositionFeatureScenarios.find(
      ({ name }) => name === 'composition.if-then-else-guard',
    )!.description!;
    expect(splitScenarioDescription(description)).toEqual([
      'If gates use compileGuard.',
      'Then and else are gated declarations.',
      'The form does not interpret if.',
      'Retains inactive source values.',
    ]);
  });
  it('keeps a parenthesized semicolon inside its sentence and drops empty clauses', () => {
    expect(
      splitScenarioDescription('TEST-018: keep (a; b) together;; then stop'),
    ).toEqual(['Keep (a; b) together.', 'Then stop.']);
  });
  it('returns no sentences for prose made only of provenance markers', () => {
    expect(splitScenarioDescription('TEST-018 NODE-051:')).toEqual([]);
  });
});
