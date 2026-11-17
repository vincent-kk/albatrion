import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildPlan } from '../../core/buildPlan/index.js';
import { requestForceConfirm } from '../../ui/hooks/useForceConfirmStep.js';
import type { TargetPlan } from '../../ui/types/index.js';

let root: string;

describe('periphery Ink --force confirm with orphans', () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'periphery-confirm-'));
    mkdirSync(join(root, 'skills/pp'), { recursive: true });
    writeFileSync(join(root, 'skills/pp/stale.md'), 'stale', 'utf-8');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('TTY --force without --yes asks before deleting an orphan', async () => {
    const plan = await buildPlan({
      sourceHashes: {},
      destinations: new Map(),
      orphanScans: [
        {
          kind: 'directory',
          scanRoot: join(root, 'skills/pp'),
          relPathPrefix: 'skills/pp/',
        },
      ],
      force: true,
    });
    expect(plan.actions.map((a) => a.kind)).toEqual(['delete']);

    const events: string[] = [];
    const outcome = await Promise.race([
      requestForceConfirm({
        plans: [{ plan } as unknown as TargetPlan],
        warnings: [],
        force: true,
        autoApprove: false,
        dispatch: (event) => events.push(event.type),
      }),
      new Promise<'pending'>((resolve) => setTimeout(() => resolve('pending'), 50)),
    ]);
    // README: "--force on TTY opens an interactive confirm ..., listing ... diverged/orphan paths."
    expect(events).toContain('force-confirm-required');
    expect(outcome).toBe('pending');
  });
});
