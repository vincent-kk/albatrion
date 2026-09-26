/**
 * Spike: round-5 C-10 on the v4c prototype ("onChange once per outermost
 * synchronous entry"). A keystroke in `a` commits; a component's layout
 * effect (or passive effect) then writes `b`. Counted per keystroke: entries,
 * onChange calls, validation requests, React commits, and whether the DOM,
 * the emit and the onChange payloads agree at the end.
 *
 * Nothing is "fixed" here — the numbers are the deliverable.
 *
 * `./commit-counter` must stay the first import: it installs the DevTools
 * hook that react-dom/client reads at module evaluation.
 */
import { commitCount, hookInjected } from './commit-counter';

import { act, fireEvent, render } from '@testing-library/react';
import { afterAll, describe, expect, it } from 'vitest';

// @ts-expect-error — untyped .mjs prototype module
import * as L from '../work-loop/proto/loop-v4c.mjs';
import { DerivedField, type EffectKind, LeafInput } from './entry-binding';

const observations: string[] = [];
const note = (line: string) => observations.push(line);
afterAll(() => {
  console.log('\nOBSERVATIONS\n' + observations.join('\n') + '\n');
});

const nativeValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

/** Sets the DOM value the way a browser does (bypassing React's tracker) and dispatches `input`. */
const inputNative = (el: HTMLInputElement, value: string, viaAct: boolean) => {
  nativeValueSetter.call(el, value);
  if (viaAct) fireEvent.input(el);
  else el.dispatchEvent(new Event('input', { bubbles: true }));
};

interface Seen {
  onChange: { emit: string; commit: number; phase: string }[];
  validations: { commit: number; phase: string }[];
  effects: string[];
}

/** `{a, b}` form on v4c with onChange / onValidate recorders stamped with the current phase. */
function makeForm(phase: { current: string }) {
  const root = L.object('root');
  const a = L.leaf('a');
  const b = L.leaf('b');
  L.attach(root, a);
  L.attach(root, b);
  L.prime(root, { a: '', b: '' });
  const seen: Seen = { onChange: [], validations: [], effects: [] };
  root.onChange = (emit: unknown, payload: { commit: number }) => {
    seen.onChange.push({ emit: JSON.stringify(emit), commit: payload.commit, phase: phase.current });
  };
  root.onValidate = (commit: number) => {
    seen.validations.push({ commit, phase: phase.current });
  };
  return { root, a, b, seen };
}

const drain = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

async function keystrokeCase(kind: EffectKind, viaAct: boolean) {
  const phase = { current: 'idle' };
  const { root, a, b, seen } = makeForm(phase);
  const { getByRole } = render(
    <div>
      <LeafInput node={a} />
      <DerivedField source={a} target={b} kind={kind} log={seen.effects} />
    </div>,
  );
  const el = getByRole('textbox') as HTMLInputElement;
  L.resetCounters();
  const commitsBefore = commitCount();
  const g = globalThis as any;
  const previousActFlag = g.IS_REACT_ACT_ENVIRONMENT;
  if (!viaAct) g.IS_REACT_ACT_ENVIRONMENT = false;
  let commitsSync = 0;
  let entriesSync = 0;
  let onChangeSync = 0;
  try {
    phase.current = 'during-dispatch';
    inputNative(el, 'x', viaAct);
    commitsSync = commitCount() - commitsBefore;
    entriesSync = L.counters.entries;
    onChangeSync = seen.onChange.length;
    phase.current = 'after-dispatch';
    await drain();
    phase.current = 'drained';
  } finally {
    if (!viaAct) g.IS_REACT_ACT_ENVIRONMENT = previousActFlag;
  }
  const commits = commitCount() - commitsBefore;
  const domA = (document.getElementById('a') as HTMLInputElement).value;
  const domB = document.getElementById('b')!.textContent;
  const emit = JSON.stringify(L.valueOf(root));
  const consistent = domA === 'x' && domB === 'derived:x' && emit === JSON.stringify({ a: 'x', b: 'derived:x' });
  const staleFirst = seen.onChange.length > 0 && seen.onChange[0].emit !== emit;
  const line =
    `[${kind} / ${viaAct ? 'act' : 'native'}] keystroke 'x': entries=${L.counters.entries} (sync ${entriesSync})` +
    ` onChange=${seen.onChange.length} (sync ${onChangeSync}) validations=${seen.validations.length}` +
    ` commits=${commits} (sync ${commitsSync}) settles=${L.counters.settles} waves=${L.counters.waves}` +
    ` | onChange payloads=${JSON.stringify(seen.onChange)}` +
    ` | validation stamps=${JSON.stringify(seen.validations.map((v) => v.commit))}` +
    ` | effects=${JSON.stringify(seen.effects)}` +
    ` | DOM a=${JSON.stringify(domA)} b=${JSON.stringify(domB)} emit=${emit} consistent=${consistent} firstOnChangeStale=${staleFirst}`;
  note(line);
  return { entries: L.counters.entries, onChange: seen.onChange.length, validations: seen.validations.length, commits, commitsSync, consistent, staleFirst, seen };
}

describe('v4c onChange per outermost entry under React 19 + jsdom (C-10)', () => {
  it('commit counter hook is live', () => {
    expect(hookInjected()).toBe(true);
  });

  for (const kind of ['layout', 'passive'] as EffectKind[]) {
    for (const viaAct of [true, false]) {
      it(`[${kind} / ${viaAct ? 'act' : 'native'}] keystroke in a; ${kind} effect writes b`, async () => {
        const r = await keystrokeCase(kind, viaAct);
        expect(r.consistent).toBe(true);
        expect(r.entries).toBe(2);
        expect(r.onChange).toBe(2);
        expect(r.validations).toBe(2);
        expect(r.staleFirst).toBe(true);
      });
    }
  }

  it('[control] keystroke in a with no effect writer -> 1 entry, 1 onChange', async () => {
    const phase = { current: 'idle' };
    const { root, a, seen } = makeForm(phase);
    const { getByRole } = render(<LeafInput node={a} />);
    const el = getByRole('textbox') as HTMLInputElement;
    L.resetCounters();
    const commitsBefore = commitCount();
    inputNative(el, 'x', true);
    await drain();
    const commits = commitCount() - commitsBefore;
    note(`[control] keystroke, no effect writer: entries=${L.counters.entries} onChange=${seen.onChange.length} validations=${seen.validations.length} commits=${commits} emit=${JSON.stringify(L.valueOf(root))}`);
    expect(L.counters.entries).toBe(1);
    expect(seen.onChange.length).toBe(1);
    expect(commits).toBe(1);
  });

  it('[listener] keystroke in a; a store listener (not React) writes b -> 1 entry, 1 onChange, 2 waves', async () => {
    const phase = { current: 'idle' };
    const { root, a, b, seen } = makeForm(phase);
    L.subscribe(a, (payload: { current: string }) => {
      if (payload.current !== '') L.setValue(b, `derived:${payload.current}`);
    });
    const { getByRole } = render(
      <div>
        <LeafInput node={a} />
        <DerivedField source={a} target={b} kind="layout" log={seen.effects} />
      </div>,
    );
    const el = getByRole('textbox') as HTMLInputElement;
    L.resetCounters();
    const commitsBefore = commitCount();
    inputNative(el, 'x', true);
    await drain();
    const commits = commitCount() - commitsBefore;
    const domB = document.getElementById('b')!.textContent;
    note(
      `[listener] store listener derives b: entries=${L.counters.entries} onChange=${seen.onChange.length} validations=${seen.validations.length} commits=${commits} settles=${L.counters.settles} waves=${L.counters.waves} effects=${JSON.stringify(seen.effects)} DOM b=${JSON.stringify(domB)} emit=${JSON.stringify(L.valueOf(root))}`,
    );
    expect(L.counters.entries).toBe(1);
    expect(seen.onChange.length).toBe(1);
    expect(L.counters.waves).toBe(2);
    expect(seen.effects).toEqual([]);
    expect(domB).toBe('derived:x');
  });
});
