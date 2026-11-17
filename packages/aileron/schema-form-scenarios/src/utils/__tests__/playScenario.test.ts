import { describe, expect, it } from 'vitest';

import type { ScenarioAdapter } from '../../types';
import { findScenarioHandle } from '../findScenarioHandle';
import { playScenario } from '../playScenario';
import { registerScenarioHandle } from '../registerScenarioHandle';

// filid:contract scenario-registration scenario-screen
describe('playScenario DOM handoff', () => {
  const adapter: ScenarioAdapter = { execute() {}, assert() {} };

  it('finds a registration on the supplied root', () => {
    const root = document.createElement('div');
    const handle = {};
    const cleanup = registerScenarioHandle(root, handle, adapter);
    expect(findScenarioHandle(root).handle).toBe(handle);
    cleanup();
    expect(() => findScenarioHandle(root)).toThrow('No scenario handle');
  });

  it('finds a descendant registration across independent story contexts', async () => {
    const canvas = document.createElement('div');
    const root = document.createElement('div');
    canvas.append(root);
    const calls: string[] = [];
    registerScenarioHandle(root, {}, { execute: (step) => { calls.push(step.action); }, assert() {} });
    expect(await playScenario({ name: 'screen', schema: {}, steps: [{ action: 'reset' }] }, canvas))
      .toEqual({ executedSteps: 1 });
    expect(calls).toEqual(['reset']);
  });

  it('does not let stale cleanup remove a replacement handle', () => {
    const root = document.createElement('div');
    const cleanup = registerScenarioHandle(root, {}, adapter);
    const replacement = {};
    registerScenarioHandle(root, replacement, adapter);
    cleanup();
    expect(findScenarioHandle(root).handle).toBe(replacement);
  });

  it('rejects ambiguous descendant registrations', () => {
    const canvas = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    canvas.append(first, second);
    registerScenarioHandle(first, {}, adapter);
    registerScenarioHandle(second, {}, adapter);
    expect(() => findScenarioHandle(canvas)).toThrow('Multiple scenario handles');
  });

  it('does not swallow missing registrations or adapter failures', async () => {
    const root = document.createElement('div');
    const scenario = { name: 'failure', schema: {}, steps: [{ action: 'submit' as const }] };
    expect(() => playScenario(scenario, root)).toThrow('No scenario handle');
    registerScenarioHandle(root, {}, { execute() { throw new Error('submit failed'); }, assert() {} });
    await expect(playScenario(scenario, root)).rejects.toThrow('submit failed');
  });
});
