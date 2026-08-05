import { describe, expect, it } from 'vitest';

import { phaseReducer } from '../../src/ui/InjectApp/utils/phaseReducer.js';
import type { ConsumerPackage } from '../../src/commands/runCli/type.js';
import type { InjectEvent, Phase, TargetPlan } from '../../src/ui/types/index.js';

const TARGET: ConsumerPackage = {
  name: '@canard/schema-form',
  version: '0.12.1',
  packageRoot: '/tmp/packages/schema-form',
  assetRoot: '/tmp/packages/schema-form/docs/claude',
  hashesPresent: true,
};

const BOOT: Phase = { kind: 'booting' };

describe('phaseReducer', () => {
  it('transitions booting → scope-select when scope-needed fires', () => {
    const event: InjectEvent = { type: 'scope-needed', pending: () => {} };
    const next = phaseReducer(BOOT, event);
    expect(next.kind).toBe('scope-select');
  });

  it('transitions resolving → planning via planning-started', () => {
    const resolving: Phase = { kind: 'resolving', targets: [TARGET] };
    const next = phaseReducer(resolving, {
      type: 'planning-started',
      targets: [TARGET],
      scope: 'user',
    });
    expect(next.kind).toBe('planning');
    if (next.kind === 'planning') {
      expect(next.scope).toBe('user');
      expect(next.progress.get(TARGET.name)?.status).toBe('pending');
    }
  });

  it('updates a single plan-step without dropping others', () => {
    const planning = phaseReducer(
      { kind: 'resolving', targets: [TARGET] },
      { type: 'planning-started', targets: [TARGET], scope: 'user' },
    );
    const next = phaseReducer(planning, {
      type: 'plan-step',
      step: { packageName: TARGET.name, status: 'done' },
    });
    if (next.kind !== 'planning') throw new Error('expected planning');
    expect(next.progress.get(TARGET.name)?.status).toBe('done');
  });

  it('transitions plans-ready → diff-review', () => {
    const planning: Phase = {
      kind: 'planning',
      targets: [TARGET],
      scope: 'user',
      progress: new Map(),
    };
    const plan: TargetPlan = {
      target: TARGET,
      scope: {
        scope: 'user',
        targetRoot: '/tmp/.claude',
        description: '~/.claude (user)',
      },
      plan: { actions: [], requiresForce: false },
    };
    const next = phaseReducer(planning, { type: 'plans-ready', plans: [plan] });
    expect(next.kind).toBe('diff-review');
  });

  it('force-answer=false collapses to summary with exit 2', () => {
    const confirm: Phase = {
      kind: 'force-confirm',
      plans: [],
      warnings: [],
      pending: () => {},
      scope: 'user',
    };
    const next = phaseReducer(confirm, { type: 'force-answer', ok: false });
    expect(next.kind).toBe('summary');
    if (next.kind === 'summary') expect(next.exitCode).toBe(2);
  });

  it('apply-progress increments done', () => {
    const applying: Phase = {
      kind: 'applying',
      plans: [],
      progress: { total: 5, done: 0, startedAt: 100 },
      scope: 'user',
    };
    const next = phaseReducer(applying, {
      type: 'apply-progress',
      done: 3,
      current: 'x.md',
    });
    if (next.kind !== 'applying') throw new Error('expected applying');
    expect(next.progress.done).toBe(3);
    expect(next.progress.current).toBe('x.md');
  });

  it('fail transitions to error regardless of current phase', () => {
    const err = new Error('boom');
    const phases: Phase[] = [
      { kind: 'booting' },
      { kind: 'resolving', targets: [TARGET] },
    ];
    for (const p of phases) {
      const next = phaseReducer(p, { type: 'fail', error: err });
      expect(next.kind).toBe('error');
      if (next.kind === 'error') expect(next.error).toBe(err);
    }
  });

  it('done with exitCode 0 records summary', () => {
    const applying: Phase = {
      kind: 'applying',
      plans: [],
      progress: { total: 0, done: 0, startedAt: 0 },
      scope: 'project',
    };
    const next = phaseReducer(applying, {
      type: 'done',
      reports: [],
      exitCode: 0,
      dryRun: false,
    });
    expect(next.kind).toBe('summary');
    if (next.kind === 'summary') {
      expect(next.exitCode).toBe(0);
      expect(next.scope).toBe('project');
    }
  });

  it('unknown events return the same phase (idempotent)', () => {
    const phase: Phase = { kind: 'booting' };
    // @ts-expect-error - intentional invalid event
    const next = phaseReducer(phase, { type: '__not_real__' });
    expect(next).toBe(phase);
  });
});
