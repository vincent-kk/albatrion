import type { RunUnit } from '../../core/index.js';
import type { AgentTarget, AgentType, InjectPlan } from '../../core/index.js';
import type { ConsumerPackage } from '../../types/index.js';

export interface PlanStepState {
  readonly packageName: string;
  readonly agent: AgentType;
  readonly status: 'pending' | 'running' | 'done' | 'failed';
  readonly error?: string;
}

/** One plan is one (package, agent) pair — a package can target several. */
export interface TargetPlan {
  /** Core verdict that makes retained actions diagnostic-only. */
  readonly refused?: RunUnit['refused'];
  readonly notices?: RunUnit['notices'];
  /** Core-supplied identity for terminal rendering. */
  readonly key?: string;
  readonly target: ConsumerPackage;
  readonly agentTarget: AgentTarget;
  readonly plan: InjectPlan;
  /** Planning failure retained alongside successful units. */
  readonly error?: string;
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
