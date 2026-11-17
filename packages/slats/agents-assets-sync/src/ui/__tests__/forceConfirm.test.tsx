import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AssetKind } from '../../core/index.js';
import type { ConsumerPackage } from '../../types/index.js';
import { requestForceConfirm } from '../hooks/useForceConfirmStep.js';
import { usePlanStep } from '../hooks/usePlanStep.js';
import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';

const ALL_KINDS: ReadonlySet<AssetKind> = new Set([
  'skills',
  'rules',
  'commands',
]);

let root: string;
let target: ConsumerPackage;

function writeAt(rel: string, body: string): void {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
}

interface PlanProbeProps {
  readonly force: boolean;
  readonly onPlansReady: (
    plans: readonly TargetPlan[],
    warnings: readonly Warning[],
  ) => void;
}

function PlanProbe({ force, onPlansReady }: PlanProbeProps): null {
  usePlanStep({
    targets: [target],
    agents: ['claude'],
    scope: 'project',
    originCwd: root,
    assetKinds: ALL_KINDS,
    force,
    dispatch: () => {},
    onPlansReady,
  });
  return null;
}

function planWith(
  force: boolean,
): Promise<{ plans: readonly TargetPlan[]; warnings: readonly Warning[] }> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <PlanProbe
        force={force}
        onPlansReady={(plans, warnings) => {
          unmount();
          resolve({ plans, warnings });
        }}
      />,
    );
  });
}

describe('ui — force confirmation covers what the run deletes', () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'slats-confirm-'));
    // Project-scope anchor, so the plan resolves inside the scratch root.
    writeAt('AGENTS.md', '');
    writeAt('pkg/agents/skills/pp/SKILL.md', '# skill\n');
    writeAt('.claude/skills/pp/SKILL.md', '# skill\n');
    writeAt('.claude/skills/pp/stale.md', 'stale');
    target = {
      name: '@slats-test/confirm',
      version: '1.0.0',
      packageRoot: join(root, 'pkg'),
      assetRoot: join(root, 'pkg/agents'),
      assetPath: 'agents',
      hashesPresent: false,
      hashSource: 'directory',
    };
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('lists an orphan the --force run deletes and asks before deleting it', async () => {
    const { plans, warnings } = await planWith(true);
    expect(warnings.map((warning) => [warning.kind, warning.relPath])).toEqual([
      ['warn-orphan', 'skills/pp/stale.md'],
    ]);

    const events: InjectEvent['type'][] = [];
    const outcome = await Promise.race([
      requestForceConfirm({
        plans,
        warnings,
        force: true,
        autoApprove: false,
        dryRun: false,
        dispatch: (event) => events.push(event.type),
      }),
      new Promise<'pending'>((resolve) =>
        setTimeout(() => resolve('pending'), 50),
      ),
    ]);
    expect(events).toContain('force-confirm-required');
    expect(outcome).toBe('pending');
  });

  it('lets --dry-run preview a plan that needs --force without failing', async () => {
    writeAt('.claude/skills/pp/SKILL.md', '# edited\n');
    const { plans, warnings } = await planWith(false);
    expect(plans[0]?.plan.requiresForce).toBe(true);

    const events: InjectEvent['type'][] = [];
    const ok = await requestForceConfirm({
      plans,
      warnings,
      force: false,
      autoApprove: false,
      dryRun: true,
      dispatch: (event) => events.push(event.type),
    });
    expect(events).not.toContain('fail');
    expect(ok).toBe(true);
  });
});
