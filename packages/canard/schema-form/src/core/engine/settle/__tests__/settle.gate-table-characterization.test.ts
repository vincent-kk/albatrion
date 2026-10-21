import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { snapshotGateTableCase } from './fixtures/gate-table/snapshotGateTableCase/snapshotGateTableCase';
import { gateSelectionCases } from './fixtures/gateSelectionCases';

/** Narrow observation fields used to prove that the critical scenes really execute. */
interface GateTableObservation {
  nodes: { path: string; local: unknown }[];
  failure: unknown;
  extra: {
    hosts: { path: string; identity: number }[];
    dirtyChildren: { phase: string; host: string; children: string[] }[];
    timeline: {
      event: string;
      path?: string;
      entered?: boolean;
      revived?: boolean;
      pendingExits?: string[];
      dirty?: string[];
      identity?: number;
    }[];
    commits: { revived: string[] }[];
    revivals: string[];
  };
}

/**
 * Characterization of the pre-extraction engine at 394c284a7 (decision 62 PR-1).
 * PR-1/1b preserve every snapshot. PR-2a changes only the first non-load select visits
 * omitted with declareChildren; every non-visits section remains byte-identical.
 * PR-2b may change gate evaluation counts only;
 * PR-2d may change the pending-path index representation only; PR-3a/3b/5 may
 * remove inactive dirty owners only while preserving every dirtyChildren result.
 * Delivery payloads/order, values, structure, revisions and failures stay fixed.
 * Regenerate on base source 394c284a7 (characterization carrier e73d162db):
 * yarn workspace @canard/schema-form test --run gate-table --update --no-file-parallelism
 */
describe('decision-62 pre-extraction gate-table characterization', () => {
  it.each([
    { index: 0, name: 'root measurement oneOf-5' },
    { index: 1, name: 'root measurement oneOf-80' },
    { index: 2, name: 'nested oneOf under /a' },
    { index: 3, name: 'array-item oneOf' },
    { index: 4, name: 'ancestor A with h and g' },
    { index: 5, name: 'shared literal and non-table gate' },
    { index: 6, name: 'same-settlement revival' },
    { index: 7, name: 'budget recovery' },
    { index: 8, name: 'verified dormant anchor and derived gate' },
    { index: 9, name: 'literal syntax and RFC6901' },
    { index: 10, name: 'strict primitive comparison' },
    { index: 11, name: 'same-name different-kind fallback' },
    { index: 12, name: 'branch-only discriminator' },
    { index: 13, name: 'intersected discriminator values' },
    { index: 14, name: 'FRAGMENT048 combined gate' },
    { index: 15, name: 'throwing exit and derived discriminator' },
    { index: 16, name: 'overlay projection' },
    { index: 17, name: 'same-wheel default and derived key' },
    { index: 18, name: 'shared hosts and array replacement' },
    { index: 19, name: 'wrong-kind ancestor' },
    { index: 20, name: 'unrecognized expressions' },
    { index: 21, name: 'relocated gate' },
    { index: 22, name: 'finite recursive occurrence' },
    { index: 23, name: 'converging revival preserves identity' },
    { index: 24, name: 'verified anchor (derived includes)' },
  ])('$name', async ({ index }) => {
    const cases = [
      ...gateTableCases.slice(0, 9),
      ...gateSelectionCases,
      ...gateTableCases.slice(9),
    ];
    expect(cases).toHaveLength(25);
    const fixture = cases[index];
    const actual = await observeGateTableModes(fixture);
    expect(actual).not.toMatch(/\.ts:\d+:\d+/);
    expect(actual).not.toContain(
      resolve(import.meta.dirname, '../../../../../../../..'),
    );
    const { observations } = JSON.parse(actual) as {
      observations: GateTableObservation[];
    };
    if (fixture.name.startsWith('ancestor A')) {
      const transitionCalls = observations[1].extra.dirtyChildren.filter(
        (call) =>
          call.phase === 'transition' &&
          call.host === '/A' &&
          call.children.length > 0,
      );
      expect(transitionCalls.length).toBeGreaterThan(0);
      for (const call of transitionCalls)
        expect(call.children).toEqual(['/A/h', '/A/g']);
    }
    if (fixture.name.startsWith('verified anchor')) {
      const prefix =
        fixture.name === 'verified anchor (derived includes)' ? '' : '/A';
      for (const phase of ['derive', 'transition']) {
        const calls = observations[1].extra.dirtyChildren.filter(
          (call) =>
            call.phase === phase &&
            call.host === prefix &&
            call.children.length > 0,
        );
        expect(calls.length).toBeGreaterThan(0);
        for (const call of calls)
          expect(call.children).toEqual([`${prefix}/h`, `${prefix}/g`]);
      }
    }
    if (fixture.name.startsWith('revival p')) {
      expect(observations[1].failure).toContain('Derive budget exceeded');
      const { timeline, commits, revivals } = observations[1].extra;
      const entered = timeline.findIndex(
        (event) =>
          event.event === 'computeChild' &&
          event.path === '/p' &&
          event.entered &&
          !event.revived,
      );
      const registered = timeline.findIndex(
        (event, index) =>
          index > entered &&
          event.event === 'registration' &&
          event.pendingExits?.includes('["/p","string"]') &&
          event.dirty?.includes('/p'),
      );
      const revived = timeline.findIndex(
        (event, index) =>
          index > registered &&
          event.event === 'computeChild' &&
          event.path === '/p' &&
          event.revived,
      );
      expect(entered).toBeGreaterThanOrEqual(0);
      expect(registered).toBeGreaterThan(entered);
      expect(revived).toBeGreaterThan(registered);
      expect(
        revivals.filter((path) => path === '/p').length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        commits
          .flatMap((commit) => commit.revived)
          .filter((path) => path === '/p').length,
      ).toBeGreaterThanOrEqual(1);
    }
    if (fixture.name.startsWith('converging revival')) {
      const final = observations[2];
      const before = observations[1].extra.hosts.find(
        (node) => node.path === '/pb',
      )!;
      const after = final.extra.hosts.find((node) => node.path === '/pb')!;
      expect(final.failure).toEqual({ $undefined: true });
      expect(final.nodes.find((node) => node.path === '')?.local).toEqual({
        kind: 'b',
        pb: 'kept',
      });
      expect(
        final.extra.revivals.filter((path) => path === '/pb').length,
      ).toBeGreaterThanOrEqual(1);
      expect(after.identity).toBe(before.identity);
      expect(final.extra.timeline).toContainEqual({
        event: 'revival',
        path: '/pb',
        identity: before.identity,
      });
    }
    await snapshotGateTableCase(`selection-${index}`, actual);
  });
});
