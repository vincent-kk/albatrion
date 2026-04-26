import { render } from 'ink-testing-library';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { StepTracker } from '../../src/ui/components/StepTracker.js';
import type { Phase } from '../../src/ui/types/index.js';

const SPINNER_FRAMES = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/u;
const BULLET_DONE = '●';

function bulletCount(output: string): number {
  return (output.match(/●/g) ?? []).length;
}

describe('StepTracker — terminal phase rendering', () => {
  it("summary phase renders the final 'done' step as a solid dot, not a spinner", () => {
    const phase: Phase = {
      kind: 'summary',
      reports: [],
      plans: [],
      exitCode: 0,
      scope: 'project',
      dryRun: false,
    };
    const { lastFrame } = render(<StepTracker phase={phase} />);
    const output = lastFrame() ?? '';
    expect(output).not.toMatch(SPINNER_FRAMES);
    expect(bulletCount(output)).toBe(5);
    expect(output).toContain(BULLET_DONE + ' done');
  });

  it("error phase renders the final 'done' step as a solid dot, not a spinner", () => {
    const phase: Phase = { kind: 'error', error: new Error('boom') };
    const { lastFrame } = render(<StepTracker phase={phase} />);
    const output = lastFrame() ?? '';
    expect(output).not.toMatch(SPINNER_FRAMES);
    expect(bulletCount(output)).toBe(5);
    expect(output).toContain(BULLET_DONE + ' done');
  });
});

describe('StepTracker — active phase rendering (regression guard)', () => {
  it("applying phase still renders the 'apply' step as a spinner", () => {
    const phase: Phase = {
      kind: 'applying',
      plans: [],
      progress: { total: 1, done: 0, startedAt: Date.now() },
      scope: 'project',
    };
    const { lastFrame } = render(<StepTracker phase={phase} />);
    const output = lastFrame() ?? '';
    expect(output).toMatch(SPINNER_FRAMES);
    expect(bulletCount(output)).toBe(3);
  });
});
