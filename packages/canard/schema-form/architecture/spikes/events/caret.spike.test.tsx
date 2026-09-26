/**
 * Spike: round-4-spec claims B2-1 / B2-2 and inherited constraint T-1.
 * Standalone — no import from the library. Mode `sync` is the spec; mode
 * `microtask` is the counterexample (notification deferred one microtask).
 *
 * `./commit-counter` must stay the first import: it installs the DevTools
 * hook that react-dom/client reads at module evaluation.
 */
import { commitCount, hookInjected } from './commit-counter';

import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { MiniStore, type NotifyMode } from './mini-store';
import {
  CardFormatterInput,
  CardFormatterNoBookkeeping,
  NodeField,
  PlainControlledInput,
  createRenderLog,
} from './react-binding';

const observations: string[] = [];
const note = (line: string) => observations.push(line);
afterAll(() => {
  console.log('\nOBSERVATIONS\n' + observations.join('\n') + '\n');
});

const drain = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

const nativeValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value',
)!.set!;

/** Sets the DOM value the way a browser does (bypassing React's tracker) and dispatches `input`. */
const inputNative = (el: HTMLInputElement, value: string) => {
  nativeValueSetter.call(el, value);
  fireEvent.input(el);
};

const modes: NotifyMode[] = ['sync', 'microtask'];

/** `it` in mode sync; `it.fails` in mode microtask when the case is expected to break there. */
const itMode = (mode: NotifyMode, breaksInMicrotask: boolean) =>
  mode === 'microtask' && breaksInMicrotask ? it.fails : it;

describe.each(modes)('notify mode: %s', (mode) => {
  const label = mode === 'sync' ? 'A' : 'B';

  // (1)/(2) formatter with layout-effect caret bookkeeping — the library's own test shape
  it(`[${label}-1a] card formatter, typing at the end: caret after each keystroke`, async () => {
    const store = new MiniStore(mode);
    const node = store.createNode('card', '');
    const { getByRole } = render(<CardFormatterInput node={node} />);
    const el = getByRole('textbox') as HTMLInputElement;
    const user = userEvent.setup();
    await user.click(el);
    const steps: [string, string, number][] = [
      ['1', '1', 1],
      ['2', '12', 2],
      ['3', '123', 3],
      ['4', '1234', 4],
      ['5', '1234-5', 6],
      ['6', '1234-56', 7],
    ];
    const seen: string[] = [];
    for (const [ch] of steps) {
      await user.keyboard(ch);
      seen.push(`${el.value}@${el.selectionStart}`);
    }
    note(`[${label}-1a] end-typing 123456 → ${seen.join(' ')}`);
    expect(seen).toEqual(steps.map(([, v, c]) => `${v}@${c}`));
    expect(node.value).toBe('1234-56');
  });

  it(`[${label}-1b] card formatter, inserting mid-text: caret follows the inserted digit`, async () => {
    const store = new MiniStore(mode);
    const node = store.createNode('card', '1234-5678');
    const { getByRole } = render(<CardFormatterInput node={node} />);
    const el = getByRole('textbox') as HTMLInputElement;
    const user = userEvent.setup();
    await user.type(el, '9', {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });
    note(`[${label}-1b] insert 9 at 2 in 1234-5678 → ${el.value}@${el.selectionStart}`);
    expect(el.value).toBe('1293-4567-8');
    expect(el.selectionStart).toBe(3);
  });

  it(`[${label}-1c] card formatter WITHOUT bookkeeping, inserting mid-text: caret jumps to the end in both modes`, async () => {
    const store = new MiniStore(mode);
    const node = store.createNode('card', '1234-5678');
    const { getByRole } = render(<CardFormatterNoBookkeeping node={node} />);
    const el = getByRole('textbox') as HTMLInputElement;
    const user = userEvent.setup();
    await user.type(el, '9', {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });
    note(`[${label}-1c] no-bookkeeping insert 9 at 2 → ${el.value}@${el.selectionStart}`);
    expect(el.value).toBe('1293-4567-8');
    expect(el.selectionStart).toBe(11);
  });

  // (2) plain controlled input (no bookkeeping): the common FormTypeInput shape
  itMode(mode, true)(
    `[${label}-2] plain controlled input, typing "xy" at index 2 of "abcd"`,
    async () => {
      const store = new MiniStore(mode);
      const node = store.createNode('plain', 'abcd');
      const { getByRole } = render(<PlainControlledInput node={node} />);
      const el = getByRole('textbox') as HTMLInputElement;
      const user = userEvent.setup();
      await user.click(el);
      el.setSelectionRange(2, 2);
      const seen: string[] = [];
      for (const ch of ['x', 'y']) {
        await user.keyboard(ch);
        seen.push(`${el.value}@${el.selectionStart}`);
      }
      note(`[${label}-2] plain mid-text xy → ${seen.join(' ')} (node=${node.value})`);
      expect(seen).toEqual(['abxcd@3', 'abxycd@4']);
      expect(node.value).toBe('abxycd');
    },
  );

  // (2c) synchronous observation: DOM value right after the event returns
  itMode(mode, true)(
    `[${label}-2c] DOM value right after the input event returns matches the committed node value`,
    async () => {
      const store = new MiniStore(mode);
      const node = store.createNode('card', '1234');
      const log = createRenderLog();
      const { getByRole } = render(<CardFormatterInput node={node} log={log} />);
      const el = getByRole('textbox') as HTMLInputElement;
      el.focus();
      el.setSelectionRange(4, 4);
      const rendersBefore = log.renders.card.length;
      inputNative(el, '12345');
      const afterEvent = `${el.value}@${el.selectionStart}`;
      const rendersAfterEvent = log.renders.card.length - rendersBefore;
      await drain();
      const afterDrain = `${el.value}@${el.selectionStart}`;
      note(
        `[${label}-2c] after event: dom=${afterEvent} node=${node.value} renders=${rendersAfterEvent}; after microtask: dom=${afterDrain}`,
      );
      expect(node.value).toBe('1234-5');
      expect(afterEvent).toBe('1234-5@6');
      expect(rendersAfterEvent).toBe(1);
    },
  );

  // (5) IME-like flow: compositionstart → input → compositionend
  itMode(mode, true)(
    `[${label}-5] composition: DOM keeps the composed text after the input event returns`,
    async () => {
      const store = new MiniStore(mode);
      const node = store.createNode('ime', '');
      const { getByRole } = render(<PlainControlledInput node={node} />);
      const el = getByRole('textbox') as HTMLInputElement;
      el.focus();
      fireEvent.compositionStart(el, { data: '' });
      inputNative(el, 'ㄱ');
      const midComposition = el.value;
      await drain();
      inputNative(el, '가');
      const secondStep = el.value;
      await drain();
      fireEvent.compositionEnd(el, { data: '가' });
      note(
        `[${label}-5] after input(ㄱ): dom="${midComposition}" node=${node.value === 'ㄱ' || node.value === '가'}; after input(가): dom="${secondStep}"; end: dom="${el.value}" node="${node.value}"`,
      );
      expect(midComposition).toBe('ㄱ');
      expect(secondStep).toBe('가');
      expect(el.value).toBe('가');
      expect(node.value).toBe('가');
    },
  );

  // (3) B2-2: 1,000 setValue calls inside one React event handler
  it(`[${label}-3] 1,000 setValue calls in one click handler → commits and renders`, async () => {
    const store = new MiniStore(mode);
    const nodes = Array.from({ length: 1000 }, (_, i) =>
      store.createNode(`n${i}`, 'init'),
    );
    const counter = { renders: 0 };
    const { getByRole, container } = render(
      <div>
        <button
          onClick={() => {
            for (const n of nodes) n.setValue('next');
          }}
        >
          go
        </button>
        {nodes.map((n) => (
          <NodeField key={n.name} node={n} counter={counter} />
        ))}
      </div>,
    );
    expect(hookInjected()).toBe(true);
    const commitsBefore = commitCount();
    const rendersBefore = counter.renders;
    fireEvent.click(getByRole('button'));
    const commitsSync = commitCount() - commitsBefore;
    await drain();
    const commits = commitCount() - commitsBefore;
    const renders = counter.renders - rendersBefore;
    const stale = container.querySelectorAll('span[data-node]');
    const staleCount = Array.from(stale).filter(
      (s) => s.textContent !== 'next',
    ).length;
    note(
      `[${label}-3] 1000 writes in one handler: commits=${commits} (before microtask: ${commitsSync}) renders=${renders} dispatches=${store.dispatches} stale=${staleCount}`,
    );
    expect(commits).toBe(1);
    expect(renders).toBe(1000);
    expect(staleCount).toBe(0);
  });

  it(`[${label}-3b] 1,000 setValue calls from a native click outside act → one commit`, async () => {
    const store = new MiniStore(mode);
    const nodes = Array.from({ length: 1000 }, (_, i) =>
      store.createNode(`n${i}`, 'init'),
    );
    const counter = { renders: 0 };
    const { getByRole } = render(
      <div>
        <button
          onClick={() => {
            for (const n of nodes) n.setValue('next');
          }}
        >
          go
        </button>
        {nodes.map((n) => (
          <NodeField key={n.name} node={n} counter={counter} />
        ))}
      </div>,
    );
    const g = globalThis as any;
    const previous = g.IS_REACT_ACT_ENVIRONMENT;
    g.IS_REACT_ACT_ENVIRONMENT = false;
    const commitsBefore = commitCount();
    const rendersBefore = counter.renders;
    try {
      getByRole('button').dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      const commitsSync = commitCount() - commitsBefore;
      await new Promise((r) => setTimeout(r, 0));
      const commits = commitCount() - commitsBefore;
      const renders = counter.renders - rendersBefore;
      note(
        `[${label}-3b] native click outside act: commits=${commits} (before microtask: ${commitsSync}) renders=${renders}`,
      );
      expect(commits).toBe(1);
      expect(renders).toBe(1000);
    } finally {
      g.IS_REACT_ACT_ENVIRONMENT = previous;
    }
  });

  it(`[${label}-3c] 1,000 setValue calls inside store.batch → one dispatch, one commit`, async () => {
    const store = new MiniStore(mode);
    const nodes = Array.from({ length: 1000 }, (_, i) =>
      store.createNode(`n${i}`, 'init'),
    );
    const counter = { renders: 0 };
    const { getByRole } = render(
      <div>
        <button
          onClick={() => {
            store.batch(() => {
              for (const n of nodes) n.setValue('next');
            });
          }}
        >
          go
        </button>
        {nodes.map((n) => (
          <NodeField key={n.name} node={n} counter={counter} />
        ))}
      </div>,
    );
    const commitsBefore = commitCount();
    const rendersBefore = counter.renders;
    fireEvent.click(getByRole('button'));
    await drain();
    const commits = commitCount() - commitsBefore;
    note(
      `[${label}-3c] batch: commits=${commits} renders=${counter.renders - rendersBefore} dispatches=${store.dispatches} waves=${store.waves}`,
    );
    expect(commits).toBe(1);
    expect(store.dispatches).toBe(1);
  });

  // (4) listener that writes during notification
  it(`[${label}-4] listener writes another node during the wave → one commit, final values, no tearing`, async () => {
    const store = new MiniStore(mode);
    const a = store.createNode('a', 'a0');
    const b = store.createNode('b', 'b0');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = createRenderLog();
    a.subscribe(({ current }) => {
      b.setValue(`derived:${current}`);
    });
    const { getByRole } = render(
      <div>
        <button onClick={() => a.setValue('a1')}>go</button>
        <PlainControlledInput node={a} log={log} />
        <PlainControlledInput node={b} log={log} />
      </div>,
    );
    const commitsBefore = commitCount();
    const aRenders = log.renders.a.length;
    const bRenders = log.renders.b.length;
    fireEvent.click(getByRole('button'));
    const wavesInHandler = store.waves;
    await drain();
    const commits = commitCount() - commitsBefore;
    const aSeen = log.renders.a.slice(aRenders);
    const bSeen = log.renders.b.slice(bRenders);
    const cacheWarnings = errors.mock.calls.filter((c) =>
      String(c[0]).includes('getSnapshot'),
    ).length;
    errors.mockRestore();
    note(
      `[${label}-4] re-entrant write: commits=${commits} waves=${store.waves} (at handler end: ${wavesInHandler}) a renders=${JSON.stringify(aSeen)} b renders=${JSON.stringify(bSeen)} getSnapshot warnings=${cacheWarnings} listenerErrors=${store.listenerErrors.length}`,
    );
    expect(commits).toBe(1);
    expect(store.waves).toBe(2);
    expect(aSeen).toEqual(['a1']);
    expect(bSeen).toEqual(['derived:a1']);
    expect(
      (document.getElementById('a') as HTMLInputElement).value,
    ).toBe('a1');
    expect(
      (document.getElementById('b') as HTMLInputElement).value,
    ).toBe('derived:a1');
    expect(cacheWarnings).toBe(0);
  });
});
