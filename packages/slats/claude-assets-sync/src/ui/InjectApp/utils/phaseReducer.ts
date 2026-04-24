import type { InjectEvent, Phase, PlanStepState } from '../../types/index.js';

export function phaseReducer(phase: Phase, event: InjectEvent): Phase {
  switch (event.type) {
    case 'scope-needed': {
      if (phase.kind === 'booting' || phase.kind === 'resolving') {
        return {
          kind: 'scope-select',
          targets: phase.kind === 'resolving' ? phase.targets : [],
          pending: event.pending,
        };
      }
      return phase;
    }
    case 'scope-selected': {
      // The 'planning-started' event drives the transition fully;
      // this event is a no-op placeholder for logging/tests.
      return phase;
    }
    case 'planning-started': {
      const progress = new Map<string, PlanStepState>(
        event.targets.map((t) => [t.name, { packageName: t.name, status: 'pending' }]),
      );
      return {
        kind: 'planning',
        targets: event.targets,
        scope: event.scope,
        progress,
      };
    }
    case 'plan-step': {
      if (phase.kind !== 'planning') return phase;
      const next = new Map(phase.progress);
      next.set(event.step.packageName, event.step);
      return { ...phase, progress: next };
    }
    case 'plans-ready': {
      if (phase.kind !== 'planning') return phase;
      return {
        kind: 'diff-review',
        plans: event.plans,
        focusedIndex: 0,
        scope: phase.scope,
      };
    }
    case 'focus-target': {
      if (phase.kind !== 'diff-review') return phase;
      return { ...phase, focusedIndex: event.index };
    }
    case 'force-confirm-required': {
      if (phase.kind !== 'diff-review' && phase.kind !== 'applying') return phase;
      return {
        kind: 'force-confirm',
        plans: phase.kind === 'diff-review' ? phase.plans : phase.plans,
        warnings: event.warnings,
        pending: event.pending,
        scope: phase.scope,
      };
    }
    case 'force-answer': {
      if (phase.kind !== 'force-confirm') return phase;
      if (!event.ok) {
        return {
          kind: 'summary',
          reports: [],
          plans: phase.plans,
          exitCode: 2,
          scope: phase.scope,
          dryRun: false,
        };
      }
      return {
        kind: 'applying',
        plans: phase.plans,
        progress: {
          done: 0,
          total: phase.plans.reduce((acc, tp) => acc + tp.plan.actions.length, 0),
          startedAt: Date.now(),
        },
        scope: phase.scope,
      };
    }
    case 'apply-start': {
      if (phase.kind !== 'diff-review' && phase.kind !== 'force-confirm') return phase;
      const plans = phase.kind === 'diff-review' ? phase.plans : phase.plans;
      return {
        kind: 'applying',
        plans,
        progress: { done: 0, total: event.total, startedAt: Date.now() },
        scope: phase.scope,
      };
    }
    case 'apply-progress': {
      if (phase.kind !== 'applying') return phase;
      return {
        ...phase,
        progress: {
          ...phase.progress,
          done: event.done,
          current: event.current,
        },
      };
    }
    case 'done': {
      const scope =
        phase.kind === 'applying' || phase.kind === 'diff-review'
          ? phase.scope
          : 'user';
      const plans =
        phase.kind === 'applying' || phase.kind === 'diff-review'
          ? phase.plans
          : [];
      return {
        kind: 'summary',
        reports: event.reports,
        plans,
        exitCode: event.exitCode,
        scope,
        dryRun: event.dryRun,
      };
    }
    case 'fail': {
      return { kind: 'error', error: event.error };
    }
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
      return phase;
    }
  }
}
