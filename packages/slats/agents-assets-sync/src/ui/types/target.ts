import type { ConsumerPackage } from '../../types/index.js';
import type { AgentTarget, AgentType, InjectPlan } from '../../core/index.js';

export interface PlanStepState {
  readonly packageName: string;
  readonly agent: AgentType;
  readonly status: 'pending' | 'running' | 'done' | 'failed';
  readonly error?: string;
}

/** One plan is one (package, agent) pair — a package can target several. */
export interface TargetPlan {
  readonly target: ConsumerPackage;
  readonly agentTarget: AgentTarget;
  readonly plan: InjectPlan;
}

export interface Warning {
  readonly packageName: string;
  readonly agent: AgentType;
  readonly kind: 'warn-diverged' | 'warn-orphan';
  readonly relPath: string;
  readonly description: string;
}

export interface ApplyProgress {
  readonly total: number;
  readonly done: number;
  readonly current?: string;
  readonly startedAt: number;
}

/**
 * Key that keeps one package's plans apart across agents.
 *
 * @param packageName - consumer package name
 * @param agent - agent the plan targets
 * @returns a key unique per (agent, package) pair
 */
export function planStepKey(packageName: string, agent: AgentType): string {
  return `${agent}:${packageName}`;
}
