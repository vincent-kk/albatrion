// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { createCoreFinalFixture } from './checkFinalRun/utils/createCoreFinalFixture';
import { runCoreFinalCheck } from './checkFinalRun/utils/runCoreFinalCheck';

describe('checkFinalRun complete comparison evidence', () => {
  it('accepts a complete nine-case 20-run synthetic fixture', () => {
    const result = runCoreFinalCheck(createCoreFinalFixture());
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('FINAL_RUN_OK');
  });

  it('allows and explicitly lists a void on a named metric before success', () => {
    const fixture = createCoreFinalFixture(20, 'maxLongTaskMs');
    expect(fixture.summary.cases[0].metrics.maxLongTaskMs.verdict).toBe('void');
    expect(runCoreFinalCheck(fixture).status).not.toBe(0);
    const result = runCoreFinalCheck(fixture, ['--allow-void', 'maxLongTaskMs']);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain(
      'allowed void: mount-flat-500-none maxLongTaskMs\nFINAL_RUN_OK',
    );
  });

  it('still rejects a void on a metric outside the allowed list', () => {
    const fixture = createCoreFinalFixture(20, 'durationMs');
    expect(fixture.summary.cases[0].metrics.durationMs.verdict).toBe('void');
    const result = runCoreFinalCheck(fixture, ['--allow-void', 'maxLongTaskMs']);
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain('mount-flat-500-none: durationMs is void');
    expect(result.stdout).toContain('FINAL_RUN_FAILED');
  });

  it('throws for an unknown allowed metric name', () => {
    const result = runCoreFinalCheck(createCoreFinalFixture(), [
      '--allow-void',
      'maxLongTaskMs,unknownMetric',
    ]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Unknown metric in --allow-void: unknownMetric');
    expect(result.stdout).not.toContain('FINAL_RUN_OK');
  });

  it('still rebuilds raw samples under --allow-void', () => {
    const fixture = createCoreFinalFixture();
    fixture.summary.cases[0].metrics.maxLongTaskMs.verdict = 'void';
    const result = runCoreFinalCheck(fixture, ['--allow-void', 'maxLongTaskMs']);
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain(
      'mount-flat-500-none differs from its raw samples',
    );
  });

  it.each(['candidate', 'baseline', 'control'] as const)(
    'rejects a missing %s variant',
    (variant) => {
      const fixture = createCoreFinalFixture();
      Reflect.deleteProperty(
        fixture.samples[fixture.summary.cases[0].id][0].samples,
        variant,
      );
      const result = runCoreFinalCheck(fixture);
      expect(result.status).not.toBe(0);
      expect(result.stdout).toContain(variant);
    },
  );

  it.each(['groups', 'artifact'])(
    'rejects empty samples in %s even when the summary looks complete',
    (level) => {
      const fixture = createCoreFinalFixture();
      if (level === 'artifact') fixture.samples = {};
      else
        for (const groups of Object.values(fixture.samples))
          groups[0].samples = {} as (typeof groups)[0]['samples'];
      expect(runCoreFinalCheck(fixture).status).not.toBe(0);
    },
  );

  it('requires compare mode', () => {
    const fixture = createCoreFinalFixture();
    fixture.summary.mode = 'measure';
    expect(runCoreFinalCheck(fixture).status).not.toBe(0);
  });

  it('rejects missing required metric comparisons', () => {
    const fixture = createCoreFinalFixture();
    Reflect.deleteProperty(fixture.summary.cases[0].metrics, 'frameOverflowMs');
    expect(runCoreFinalCheck(fixture).status).not.toBe(0);
  });

  it('rejects a statistic count that disagrees with the raw measurements', () => {
    const fixture = createCoreFinalFixture();
    const stats = fixture.summary.cases[0].metrics.durationMs.candidate;
    if (stats.kind !== 'numeric') throw new Error('fixture must be numeric');
    stats.samples = 0;
    expect(runCoreFinalCheck(fixture).status).not.toBe(0);
  });
});
