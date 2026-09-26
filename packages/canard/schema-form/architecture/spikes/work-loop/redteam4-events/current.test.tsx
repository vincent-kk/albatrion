// @ts-nocheck — throwaway spike outside tsconfig `include`
/**
 * Item 9 against the CURRENT library (src/core): 10,000 subscribed nodes,
 * one root setValue inside a React event-handler-equivalent act().
 */
import { Profiler, memo, useSyncExternalStore } from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NodeEventType, nodeFromJSONSchema } from '@/schema-form/core';

const out = (item: string, data: unknown) =>
  console.log(`##RESULT## ${item} ${JSON.stringify(data)}`);

const Leaf = memo(({ node }) => {
  const rev = useSyncExternalStore(
    (cb) => node.subscribe(({ type }) => (type & NodeEventType.UpdateValue ? cb() : undefined)),
    () => node.revision(NodeEventType.UpdateValue),
    () => node.revision(NodeEventType.UpdateValue),
  );
  return (
    <span data-path={node.path} data-rev={rev}>
      {String(node.value ?? '')}
    </span>
  );
});

describe('9. current library: root.setValue with 10,000 subscribed leaves', () => {
  it('commits and timing', async () => {
    const N = 10_000;
    const jsonSchema = {
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: N }, (_, i) => [`f${i}`, { type: 'string', default: `d${i}` }]),
      ),
    };
    const changes: number[] = [];
    const t0 = performance.now();
    const root = nodeFromJSONSchema({ jsonSchema, onChange: () => changes.push(performance.now()) });
    await new Promise((r) => setTimeout(r, 0));
    const buildMs = performance.now() - t0;
    const leaves = root.children.map((c) => c.node);
    let commits = 0;
    render(
      <Profiler id="p" onRender={() => commits++}>
        <div>
          {leaves.map((n) => (
            <Leaf key={n.path} node={n} />
          ))}
        </div>
      </Profiler>,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    commits = 0;
    const next = Object.fromEntries(leaves.map((n, i) => [`f${i}`, `v${i}`]));
    const t1 = performance.now();
    act(() => {
      root.setValue(next);
    });
    const syncMs = performance.now() - t1;
    const syncCommits = commits;
    const t2 = performance.now();
    await act(async () => {
      await Promise.resolve();
    });
    const microCommits = commits;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const drainedMs = performance.now() - t2;
    const stale = leaves.filter((n, i) => n.value !== `v${i}`).length;
    const domStale = [...document.querySelectorAll('[data-path]')].filter((e, i) => e.textContent !== `v${i}`).length;
    out('9-current', {
      N,
      buildMs: +buildMs.toFixed(0),
      syncMs: +syncMs.toFixed(1),
      syncCommits,
      microCommits,
      totalCommits: commits,
      drainedMs: +drainedMs.toFixed(1),
      treeStale: stale,
      domStale,
      rootOnChangeCalls: changes.length,
    });
    expect(domStale).toBe(0);
  });
});
