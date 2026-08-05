import { homedir } from 'node:os';
import { join } from 'node:path';

import type { ConsumerPackage } from '../src/types/index.js';
import type { InjectPlan, Action } from '../src/core/buildPlan/index.js';
import type { AgentTarget, InjectReport } from '../src/core/index.js';
import { resolveAgentTarget } from '../src/core/index.js';
import type {
  ApplyProgress,
  InjectEvent,
  Phase,
  PlanStepState,
  TargetPlan,
  Warning,
} from '../src/ui/types/index.js';
import { planStepKey } from '../src/ui/types/target.js';

export const PHASES = [
  'resolving',
  'agent-select',
  'scope-select',
  'planning',
  'diff-review',
  'force-confirm',
  'applying',
  'summary',
  'summary-dry',
  'error',
] as const;

export type PhaseKey = (typeof PHASES)[number];

const MOCK_TARGETS: ConsumerPackage[] = [
  {
    name: '@canard/schema-form',
    version: '0.12.1',
    packageRoot: '/workspace/packages/canard/schema-form',
    assetRoot: '/workspace/packages/canard/schema-form/docs/agents',
    assetPath: 'docs/agents',
    hashesPresent: true,
    hashSource: 'manifest',
  },
  {
    name: '@canard/schema-form-antd-plugin',
    version: '0.12.1',
    packageRoot: '/workspace/packages/canard/schema-form-antd-plugin',
    assetRoot: '/workspace/packages/canard/schema-form-antd-plugin/docs/agents',
    assetPath: 'docs/agents',
    hashesPresent: true,
    hashSource: 'manifest',
  },
  {
    name: '@winglet/common-utils',
    version: '0.12.1',
    packageRoot: '/workspace/packages/winglet/common-utils',
    assetRoot: '/workspace/packages/winglet/common-utils/docs/agents',
    assetPath: 'docs/agents',
    hashesPresent: true,
    hashSource: 'manifest',
  },
];

const agentTargetFixture: AgentTarget = resolveAgentTarget('claude', 'user');
const fixtureSkillsRoot =
  agentTargetFixture.directoryRoots.skills ?? join(homedir(), '.claude', 'skills');

function makeActions(
  baseDstRoot: string,
  options: {
    copy?: number;
    skip?: number;
    diverged?: number;
    orphan?: number;
    del?: number;
  },
): Action[] {
  const actions: Action[] = [];
  let fileIdx = 0;
  for (let i = 0; i < (options.copy ?? 0); i += 1) {
    fileIdx += 1;
    actions.push({
      kind: 'copy',
      relPath: `skills/expert/doc-${fileIdx}.md`,
      target: {
        kind: 'file',
        dstAbs: `${baseDstRoot}/expert/doc-${fileIdx}.md`,
      },
    });
  }
  for (let i = 0; i < (options.skip ?? 0); i += 1) {
    fileIdx += 1;
    actions.push({
      kind: 'skip-uptodate',
      relPath: `skills/expert/existing-${fileIdx}.md`,
      target: {
        kind: 'file',
        dstAbs: `${baseDstRoot}/expert/existing-${fileIdx}.md`,
      },
    });
  }
  for (let i = 0; i < (options.diverged ?? 0); i += 1) {
    fileIdx += 1;
    actions.push({
      kind: 'warn-diverged',
      relPath: `skills/expert/edited-${fileIdx}.md`,
      target: {
        kind: 'file',
        dstAbs: `${baseDstRoot}/expert/edited-${fileIdx}.md`,
      },
    });
  }
  for (let i = 0; i < (options.orphan ?? 0); i += 1) {
    fileIdx += 1;
    actions.push({
      kind: 'warn-orphan',
      relPath: `skills/expert/ghost-${fileIdx}.md`,
      target: {
        kind: 'file',
        dstAbs: `${baseDstRoot}/expert/ghost-${fileIdx}.md`,
      },
    });
  }
  for (let i = 0; i < (options.del ?? 0); i += 1) {
    fileIdx += 1;
    actions.push({
      kind: 'delete',
      relPath: `skills/expert/stale-${fileIdx}.md`,
      target: {
        kind: 'file',
        dstAbs: `${baseDstRoot}/expert/stale-${fileIdx}.md`,
      },
    });
  }
  return actions;
}

function makeTargetPlan(
  target: ConsumerPackage,
  actions: Action[],
  requiresForce = false,
): TargetPlan {
  const plan: InjectPlan = { actions, requiresForce };
  return { target, agentTarget: agentTargetFixture, plan };
}

const TP_CLEAN = makeTargetPlan(
  MOCK_TARGETS[0],
  makeActions(fixtureSkillsRoot, { copy: 4, skip: 2 }),
  false,
);

const TP_WARN = makeTargetPlan(
  MOCK_TARGETS[1],
  makeActions(fixtureSkillsRoot, {
    copy: 2,
    skip: 1,
    diverged: 1,
    orphan: 1,
  }),
  true,
);

const TP_THIRD = makeTargetPlan(
  MOCK_TARGETS[2],
  makeActions(fixtureSkillsRoot, { copy: 3, skip: 5 }),
  false,
);

const PLAN_SET: readonly TargetPlan[] = [TP_CLEAN, TP_WARN, TP_THIRD];

const MOCK_WARNINGS: Warning[] = [
  {
    packageName: MOCK_TARGETS[1].name,
    agent: 'claude',
    kind: 'warn-diverged',
    relPath: 'skills/expert/edited-4.md',
    description: 'local differs from source',
  },
  {
    packageName: MOCK_TARGETS[1].name,
    agent: 'claude',
    kind: 'warn-orphan',
    relPath: 'skills/expert/ghost-5.md',
    description: 'exists locally but not in manifest',
  },
];

const MOCK_REPORTS: InjectReport[] = PLAN_SET.map((tp) => {
  const report: InjectReport = {
    created: [],
    updated: [],
    skipped: [],
    warnings: [],
    deleted: [],
    exitCode: 0,
  };
  for (const action of tp.plan.actions) {
    if (action.kind === 'copy') report.created.push(action.relPath);
    else if (action.kind === 'skip-uptodate') report.skipped.push(action.relPath);
    else if (action.kind === 'warn-diverged')
      report.warnings.push({ relPath: action.relPath, reason: 'diverged' });
    else if (action.kind === 'warn-orphan')
      report.warnings.push({ relPath: action.relPath, reason: 'orphan' });
    else if (action.kind === 'delete') report.deleted.push(action.relPath);
  }
  return report;
});

const MOCK_APPLY_PROGRESS: ApplyProgress = {
  total: 18,
  done: 7,
  current: 'skills/expert/doc-8.md',
  startedAt: Date.now() - 2500,
};

function makePlanningProgress(): ReadonlyMap<string, PlanStepState> {
  return new Map([
    [
      planStepKey(MOCK_TARGETS[0].name, 'claude'),
      { packageName: MOCK_TARGETS[0].name, agent: 'claude', status: 'done' },
    ],
    [
      planStepKey(MOCK_TARGETS[1].name, 'claude'),
      { packageName: MOCK_TARGETS[1].name, agent: 'claude', status: 'running' },
    ],
    [
      planStepKey(MOCK_TARGETS[2].name, 'claude'),
      { packageName: MOCK_TARGETS[2].name, agent: 'claude', status: 'pending' },
    ],
  ]);
}

export function buildPhase(kind: PhaseKey): Phase {
  switch (kind) {
    case 'resolving':
      return { kind: 'resolving', targets: MOCK_TARGETS };
    case 'agent-select':
      return {
        kind: 'agent-select',
        targets: MOCK_TARGETS,
        pending: () => {
          /* noop */
        },
      };
    case 'scope-select':
      return {
        kind: 'scope-select',
        targets: MOCK_TARGETS,
        agents: ['claude'],
        pending: () => {
          /* noop */
        },
      };
    case 'planning':
      return {
        kind: 'planning',
        targets: MOCK_TARGETS,
        agents: ['claude'],
        scope: 'user',
        progress: makePlanningProgress(),
      };
    case 'diff-review':
      return {
        kind: 'diff-review',
        plans: PLAN_SET,
        focusedIndex: 0,
        scope: 'user',
      };
    case 'force-confirm':
      return {
        kind: 'force-confirm',
        plans: PLAN_SET,
        warnings: MOCK_WARNINGS,
        pending: () => {
          /* noop */
        },
        scope: 'user',
      };
    case 'applying':
      return {
        kind: 'applying',
        plans: PLAN_SET,
        progress: MOCK_APPLY_PROGRESS,
        scope: 'user',
      };
    case 'summary':
      return {
        kind: 'summary',
        reports: MOCK_REPORTS,
        plans: PLAN_SET,
        exitCode: 0,
        scope: 'user',
        dryRun: false,
      };
    case 'summary-dry':
      return {
        kind: 'summary',
        reports: MOCK_REPORTS,
        plans: PLAN_SET,
        exitCode: 0,
        scope: 'user',
        dryRun: true,
      };
    case 'error':
      return {
        kind: 'error',
        error: new Error(
          'Sample fatal: dist/agents-hashes.json missing at /workspace/packages/canard/schema-form',
        ),
      };
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      throw new Error('unknown phase');
    }
  }
}

export function fixtureEvents(kind: PhaseKey): InjectEvent[] {
  void kind;
  return [];
}
