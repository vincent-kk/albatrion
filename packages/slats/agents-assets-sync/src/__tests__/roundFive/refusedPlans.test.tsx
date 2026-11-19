import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { runSurface } from '../roundFour/helpers/runSurface.js';
import { consumerOf, installPackage, makeRoot, removeRoot, writeAt } from '../roundThree/fixture.js';
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) removeRoot(root); vi.restoreAllMocks(); });
it.each([false, true])('refused diagnostic plans and executable siblings agree across views, force=%s', async (force) => {
  const outcomes = [];
  for (const mode of ['plain', 'json', 'ink'] as const) {
    const root = makeRoot('refused-plan'); roots.push(root);
    const targets = ['a', 'b', 'good'].map((name) => consumerOf(installPackage(root, { name: `@probe/${name}`, assets: name === 'good' ? { 'skills/shared/good.md': 'good' } : { 'skills/shared/conflict.md': name } }), `@probe/${name}`, 'directory'));
    writeAt(join(root, '.claude/skills/shared/orphan.md'), 'keep');
    let transcript = '';
    const result = await runSurface(mode, root, targets, { agent: ['claude'], scope: 'project', force, yes: true }, false, undefined, (out) => { transcript = mode === 'ink' ? out.frame : out.stdout + out.stderr; });
    const refused = result.model.units.filter((unit) => unit.error);
    expect(refused).toHaveLength(2);
    for (const unit of refused) {
      expect(unit.refused).toBe(true);
      expect(unit.plan.requiresForce).toBe(false);
      expect(unit.plan.actions.some((action) => action.kind === (force ? 'delete' : 'warn-orphan'))).toBe(true);
      expect(unit.report?.created).toEqual([]); expect(unit.report?.deleted).toEqual([]);
    }
    const good = result.model.units.find((unit) => unit.target.name === '@probe/good');
    expect(good?.plan.actions.some((action) => action.kind === 'delete' || action.kind === 'warn-orphan')).toBe(false);
    expect(good?.notices?.length).toBeGreaterThan(0);
    expect(transcript).toContain(mode === 'json' ? 'diagnosticOnly' : 'diagnostic');
    outcomes.push(result);
  }
  expect(outcomes[1]).toEqual(outcomes[0]); expect(outcomes[2]).toEqual(outcomes[0]);
});
