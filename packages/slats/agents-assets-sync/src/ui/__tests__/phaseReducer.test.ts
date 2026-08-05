import { describe, expect, it } from 'vitest';

import { resolveAgentTarget } from '../../core/index.js';
import type { ConsumerPackage } from '../../types/index.js';
import { phaseReducer } from '../reducer/phaseReducer.js';
import type {
  InjectEvent,
  Phase,
  TargetPlan,
} from '../types/index.js';
import { planStepKey } from '../types/target.js';

const TARGET: ConsumerPackage = {
  name: '@canard/schema-form',
  version: '0.12.1',
  packageRoot: '/tmp/packages/schema-form',
  assetRoot: '/tmp/packages/schema-form/docs/agents',
  hashesPresent: true,
};

const BOOT: Phase = { kind: 'booting' };

describe('phaseReducer', () => {
  it('transitions booting → agent-select when agent-needed fires', () => {
    const event: InjectEvent = { type: 'agent-needed', pending: () => {} };
    expect(phaseReducer(BOOT, event).kind).toBe('agent-select');
  });

  it('transitions agent-select → scope-select, carrying the agents', () => {
    const selecting = phaseReducer(
      { kind: 'resolving', targets: [TARGET] },
      { type: 'agent-needed', pending: () => {} },
    );
    const next = phaseReducer(selecting, {
      type: 'scope-needed',
      agents: ['claude', 'codex'],
      pending: () => {},
    });
    expect(next.kind).toBe('scope-select');
    if (next.kind === 'scope-select') {
      expect(next.agents).toEqual(['claude', 'codex']);
      expect(next.targets).toEqual([TARGET]);
    }
  });

  it('transitions resolving → planning with one step per (agent, package)', () => {
    const next = phaseReducer(
      { kind: 'resolving', targets: [TARGET] },
      {
        type: 'planning-started',
        targets: [TARGET],
        agents: ['claude', 'codex'],
        scope: 'user',
      },
    );
    expect(next.kind).toBe('planning');
    if (next.kind === 'planning') {
      expect(next.scope).toBe('user');
      expect(next.progress.size).toBe(2);
      expect(
        next.progress.get(planStepKey(TARGET.name, 'claude'))?.status,
      ).toBe('pending');
      expect(next.progress.get(planStepKey(TARGET.name, 'codex'))?.status).toBe(
        'pending',
      );
    }
  });

  it("updates one agent's step without touching the other's", () => {
    const planning = phaseReducer(
      { kind: 'resolving', targets: [TARGET] },
      {
        type: 'planning-started',
        targets: [TARGET],
        agents: ['claude', 'codex'],
        scope: 'user',
      },
    );
    const next = phaseReducer(planning, {
      type: 'plan-step',
      step: { packageName: TARGET.name, agent: 'codex', status: 'done' },
    });
    if (next.kind !== 'planning') throw new Error('expected planning');
    expect(next.progress.get(planStepKey(TARGET.name, 'codex'))?.status).toBe(
      'done',
    );
    expect(next.progress.get(planStepKey(TARGET.name, 'claude'))?.status).toBe(
      'pending',
    );
  });

  it('transitions plans-ready → diff-review', () => {
    const planning: Phase = {
      kind: 'planning',
      targets: [TARGET],
      agents: ['claude'],
      scope: 'user',
      progress: new Map(),
    };
    const plan: TargetPlan = {
      target: TARGET,
      agentTarget: resolveAgentTarget('claude', 'user', '/'),
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
