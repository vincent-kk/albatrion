// @ts-nocheck — throwaway spike outside tsconfig `include`
/**
 * React 19 + jsdom attacks on round-4-spec.md §B, driven against model.mjs.
 * Each test prints `##RESULT## <item>` lines; assertions only pin the shape.
 */
import {
  Profiler,
  StrictMode,
  memo,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { flushSync } from 'react-dom';

import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EV, Root, flat } from './model.mjs';

const out = (item: string, data: unknown) =>
  console.log(`##RESULT## ${item} ${JSON.stringify(data)}`);

const useNode = (node, mask = EV.UpdateValue) =>
  useSyncExternalStore(
    (cb) => node.subscribe(({ type }) => (type & mask ? cb() : undefined)),
    () => node.revision(mask),
    () => node.revision(mask),
  );

const renders = new Map<string, number>();
const count = (k: string) => renders.set(k, (renders.get(k) ?? 0) + 1);
const resetRenders = () => renders.clear();
const total = () => [...renders.values()].reduce((a, b) => a + b, 0);

const Leaf = ({ node }) => {
  const rev = useNode(node);
  count(node.path);
  return (
    <span data-path={node.path} data-rev={rev}>
      {String(node.value ?? '')}
    </span>
  );
};
const MemoLeaf = memo(Leaf);

describe('1. B2 synchronous notify inside a React event handler', () => {
  it('1a. listener calls flushSync mid-wave (setState of another component)', () => {
    const root = flat(3);
    const [f0, f1, f2] = root.children;
    let setOther;
    const Other = () => {
      const [n, set] = useState(0);
      setOther = set;
      count('other');
      return <i>{n}</i>;
    };
    const Form = () => {
      count('form');
      return (
        <div>
          <Other />
          {root.children.map((c) => (
            <Leaf key={c.key} node={c} />
          ))}
        </div>
      );
    };
    const ui = render(<Form />);
    const snapshots: any[] = [];
    f0.subscribe(() => {
      flushSync(() => setOther(1));
      snapshots.push({
        domF2: ui.container.querySelector('[data-path="/f2"]').textContent,
        revF2: f2.revision(EV.UpdateValue),
        valueF2: f2.value,
      });
    });
    resetRenders();
    act(() => {
      root.batch(() => {
        f0.setValue('a');
        f1.setValue('b');
        f2.setValue('c');
      });
    });
    out('1a', {
      renders: Object.fromEntries(renders),
      midWave: snapshots,
      finalDom: [...ui.container.querySelectorAll('[data-path]')].map((e) => e.textContent),
    });
    expect(ui.container.querySelector('[data-path="/f2"]').textContent).toBe('c');
  });

  it('1b. node.setValue during render and inside getSnapshot', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(String(a[0]).slice(0, 90)));
    const root = flat(2);
    const [f0, f1] = root.children;
    const trace: string[] = [];
    f1.subscribe((e) => trace.push(`f1-listener wave=${e.wave} waveActiveAtWrite=${e.node.root.waveActive}`));
    const WriterInRender = () => {
      const rev = useNode(f0);
      count('writer');
      if (rev === 1) {
        trace.push(`write-in-render waveActive=${root.waveActive}`);
        f1.setValue('from-render'); // not a listener write: spec says nothing
      }
      return <b>{rev}</b>;
    };
    const ui = render(
      <div>
        <WriterInRender />
        <Leaf node={f1} />
      </div>,
    );
    act(() => f0.setValue('x'));
    out('1b-render', {
      trace,
      f1Dom: ui.container.querySelector('[data-path="/f1"]').textContent,
      renders: Object.fromEntries(renders),
      consoleErrors: errors,
    });

    // getSnapshot that writes
    errors.length = 0;
    const root2 = flat(2);
    const [g0, g1] = root2.children;
    let snapCalls = 0;
    const Snap = () => {
      const rev = useSyncExternalStore(
        (cb) => g0.subscribe(cb),
        () => {
          snapCalls++;
          if (snapCalls < 50) g1.setValue(snapCalls);
          return g0.revision(EV.UpdateValue);
        },
      );
      return <b>{rev}</b>;
    };
    let thrown = null;
    try {
      render(
        <div>
          <Snap />
          <Leaf node={g1} />
        </div>,
      );
    } catch (e) {
      thrown = String(e).slice(0, 80);
    }
    out('1b-getSnapshot', { snapCalls, g1: g1.value, thrown, consoleErrors: errors.slice(0, 3) });
    spy.mockRestore();
  });

  for (const bumpAllFirst of [false, true]) {
    it(`1c. tearing with 1,000 nodes, flushSync mid-wave, bumpAllFirst=${bumpAllFirst}`, () => {
      const root = flat(1000, { bumpAllFirst });
      let setTick;
      const Form = () => {
        const [t, set] = useState(0);
        setTick = set;
        count('form');
        return (
          <div data-tick={t}>
            {root.children.map((c) => (
              <Leaf key={c.key} node={c} />
            ))}
          </div>
        );
      };
      let commits = 0;
      const ui = render(
        <Profiler id="p" onRender={() => commits++}>
          <Form />
        </Profiler>,
      );
      // consumer listener on the first delivered node (root, B3-1) forces a render mid-wave
      root.subscribe(() => flushSync(() => setTick((t) => t + 1)));
      resetRenders();
      commits = 0;
      const t0 = performance.now();
      act(() => {
        root.batch(() => root.children.forEach((c, i) => c.setValue(`v${i}`)));
      });
      const ms = performance.now() - t0;
      const stale = [...ui.container.querySelectorAll('[data-path]')].filter(
        (e, i) => e.textContent !== `v${i}`,
      ).length;
      out(`1c bumpAllFirst=${bumpAllFirst}`, {
        commits,
        leafRenders: total() - (renders.get('form') ?? 0),
        formRenders: renders.get('form'),
        staleDom: stale,
        ms: +ms.toFixed(1),
      });
      expect(stale).toBe(0);
    });
  }

  it('1c-plain. 1,000 nodes, no flushSync: commits per handler', () => {
    const root = flat(1000);
    let commits = 0;
    const ui = render(
      <Profiler id="p" onRender={() => commits++}>
        <div>
          {root.children.map((c) => (
            <Leaf key={c.key} node={c} />
          ))}
        </div>
      </Profiler>,
    );
    resetRenders();
    commits = 0;
    act(() => root.batch(() => root.children.forEach((c, i) => c.setValue(`v${i}`))));
    out('1c-plain', { commits, leafRenders: total() });
    expect(commits).toBe(1);
  });
});

describe('3. B3-1 top→down: parent renders child value before child listener ran', () => {
  for (const withFlushSync of [false, true]) {
    it(`parent tracks root, child tracks f0; consumer flushSync on root=${withFlushSync}`, () => {
      const root = flat(2);
      const [f0] = root.children;
      const Child = () => {
        const rev = useNode(f0);
        count('child');
        return <span data-path="/f0" data-rev={rev}>{String(f0.value ?? '')}</span>;
      };
      const Parent = () => {
        useNode(root);
        count('parent');
        return (
          <div data-parent-sees={String(root.value.f0 ?? '')}>
            <Child />
          </div>
        );
      };
      const ui = render(<Parent />);
      const mid: any[] = [];
      if (withFlushSync)
        root.subscribe(() => {
          flushSync(() => {});
          const span = ui.container.querySelector('[data-path="/f0"]');
          mid.push({ childDom: span.textContent, childRevAttr: span.getAttribute('data-rev'), f0Rev: f0.revision(EV.UpdateValue) });
        });
      resetRenders();
      act(() => f0.setValue('new'));
      const span = ui.container.querySelector('[data-path="/f0"]');
      out(`3 flushSync=${withFlushSync}`, {
        renders: Object.fromEntries(renders),
        midWave: mid,
        final: { childDom: span.textContent, rev: span.getAttribute('data-rev'), parentSees: ui.container.firstChild.getAttribute('data-parent-sees') },
      });
      expect(span.textContent).toBe('new');
    });
  }
});

describe('7. T-3 virtualization: RequestFocus to a deferred node, re-publish on reveal', () => {
  const build = (root, node, trace) => {
    const Inner = () => {
      useLayoutEffect(
        () =>
          node.subscribe(({ type }) => {
            if (type & EV.RequestFocus) trace.push(`inner-got-focus waveActive=${root.waveActive} wave=${root.waveCount}`);
          }),
        [],
      );
      return <input data-path={node.path} />;
    };
    const Deferrable = () => {
      const [revealed, setRevealed] = useState(false);
      const pending = useRef(0);
      useLayoutEffect(() => {
        if (revealed) return;
        return node.subscribe(({ type }) => {
          if (type & EV.RequestFocus) {
            pending.current |= EV.RequestFocus;
            setRevealed(true);
          }
        });
      }, [revealed]);
      useLayoutEffect(() => {
        if (!revealed || !pending.current) return;
        pending.current = 0;
        trace.push(`re-publish waveActive=${root.waveActive} wave=${root.waveCount}`);
        node.publish(EV.RequestFocus);
      }, [revealed]);
      return revealed ? <Inner /> : <div data-deferred />;
    };
    return Deferrable;
  };

  it('7a. focus() from outside a React handler (act) — is the re-publish nested?', () => {
    const root = flat(1);
    const node = root.children[0];
    const trace: string[] = [];
    const D = build(root, node, trace);
    render(<D />);
    act(() => node.publish(EV.RequestFocus));
    out('7a', { trace });
    expect(trace.some((t) => t.startsWith('inner-got-focus'))).toBe(true);
  });

  it('7b. focus() inside a React event handler', () => {
    const root = flat(1);
    const node = root.children[0];
    const trace: string[] = [];
    const D = build(root, node, trace);
    const ui = render(
      <div>
        <button onClick={() => node.publish(EV.RequestFocus)}>go</button>
        <D />
      </div>,
    );
    act(() => ui.container.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    out('7b', { trace });
    expect(trace.some((t) => t.startsWith('inner-got-focus'))).toBe(true);
  });

  it('7c. focus() published by a listener that then flushSyncs — reveal commit inside the wave', () => {
    const root = flat(2);
    const [trigger, node] = root.children;
    const trace: string[] = [];
    const D = build(root, node, trace);
    render(<D />);
    trigger.subscribe(() => {
      node.publish(EV.RequestFocus); // in-wave signal → queued
      flushSync(() => {});
    });
    act(() => trigger.setValue(1));
    out('7c', { trace, waves: root.waveCount });
    expect(trace.some((t) => t.startsWith('inner-got-focus'))).toBe(true);
  });

  it('7d. consumer listener on the deferred node flushSyncs after the reveal setState — reveal commit inside the wave', () => {
    const root = flat(1);
    const node = root.children[0];
    const trace: string[] = [];
    const D = build(root, node, trace);
    render(<D />);
    node.subscribe(({ type }) => {
      if (type & EV.RequestFocus) {
        trace.push(`consumer waveActive=${root.waveActive} wave=${root.waveCount}`);
        flushSync(() => {});
      }
    });
    act(() => node.publish(EV.RequestFocus));
    out('7d', { trace, waves: root.waveCount });
    expect(trace.filter((t) => t.startsWith('inner-got-focus')).length).toBe(1);
  });

  it('7e. discrete click publishes focus; consumer flushSync mid-wave — reveal commit nests inside the wave', () => {
    const root = flat(1);
    const node = root.children[0];
    const trace: string[] = [];
    const D = build(root, node, trace);
    const ui = render(
      <div>
        <button onClick={() => node.publish(EV.RequestFocus)}>go</button>
        <D />
      </div>,
    );
    node.subscribe(({ type }) => {
      if (type & EV.RequestFocus) {
        trace.push(`consumer waveActive=${root.waveActive} wave=${root.waveCount}`);
        flushSync(() => {});
      }
    });
    act(() => ui.container.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    out('7e', { trace, waves: root.waveCount, innerMounted: !!ui.container.querySelector('input') });
    // Observed: the inner control receives the ORIGINAL command (live listener-set
    // iteration, subscribed mid-delivery) AND the re-published one → duplicate.
    expect(trace.filter((t) => t.startsWith('inner-got-focus')).length).toBe(2);
  });

  it('7f. wave cap vs React-mediated loops: layout effect writes back on every render', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(String(a[0]).slice(0, 60)));
    const root = flat(2);
    const [a, b] = root.children;
    let loops = 0;
    const waveCounts: number[] = [];
    const Effectful = () => {
      const rev = useNode(a);
      useLayoutEffect(() => {
        if (rev === 0 || loops >= 200) return; // 200 = "unbounded" sentinel
        loops++;
        waveCounts.push(root.waveCount);
        b.setValue(rev); // outside any wave: starts a fresh wave loop
      }, [rev]);
      return <b>{rev}</b>;
    };
    b.subscribe(() => a.setValue((a.value ?? 0) + 1)); // b → a → render → effect → b …
    render(<Effectful />);
    let thrown = null;
    try {
      act(() => a.setValue(1));
    } catch (e) {
      thrown = String(e.message).slice(0, 60);
    }
    out('7f', { loops, maxWaveCountSeen: Math.max(...waveCounts), thrown, consoleErrors: errors.slice(0, 2), a: a.value });
    spy.mockRestore();
  });
});

describe('B2-1 caret preservation: controlled input + formatter, sync vs microtask notify', () => {
  for (const microtaskNotify of [false, true]) {
    it(`microtaskNotify=${microtaskNotify}`, async () => {
      const { default: userEvent } = await import('@testing-library/user-event');
      const root = flat(1, { microtaskNotify });
      const node = root.children[0];
      const format = (s: string) => {
        const d = s.replace(/-/g, '');
        return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
      };
      const Input = () => {
        useNode(node);
        return (
          <input
            data-path={node.path}
            value={String(node.value ?? '')}
            onChange={(e) => node.setValue(format(e.target.value))}
          />
        );
      };
      const ui = render(<Input />);
      const user = userEvent.setup();
      const input = ui.container.querySelector('input') as HTMLInputElement;
      await user.type(input, '12345');
      await act(async () => {
        await Promise.resolve();
      });
      const card = { dom: input.value, node: node.value, selectionStart: input.selectionStart };
      // mid-text insertion with no formatting change: 'ab|c' + 'x'
      act(() => node.setValue('abc'));
      await user.click(input);
      input.setSelectionRange(2, 2);
      await user.keyboard('x');
      await act(async () => {
        await Promise.resolve();
      });
      out(`B2-1 microtaskNotify=${microtaskNotify}`, {
        card,
        midText: { dom: input.value, node: node.value, selectionStart: input.selectionStart, expectedCaret: 3 },
      });
    });
  }
});

describe('9. B2-2 cost: 10,000 nodes, one handler, useSyncExternalStore subscribers', () => {
  it('model: synchronous notify', () => {
    const N = 10_000;
    const root = flat(N);
    let commits = 0;
    const ui = render(
      <Profiler id="p" onRender={() => commits++}>
        <div>
          {root.children.map((c) => (
            <MemoLeaf key={c.key} node={c} />
          ))}
        </div>
      </Profiler>,
    );
    resetRenders();
    commits = 0;
    const t0 = performance.now();
    act(() => root.batch(() => root.children.forEach((c, i) => c.setValue(`v${i}`))));
    const ms = performance.now() - t0;
    const t1 = performance.now();
    root.batch(() => root.children.forEach((c, i) => c.setValue(`w${i}`)));
    const notifyOnlyMs = performance.now() - t1;
    out('9-model', { N, commits, leafRenders: total(), handlerMs: +ms.toFixed(1), notifyOnlyMs: +notifyOnlyMs.toFixed(1) });
    expect(commits).toBe(1);
  });
});

describe('2. B3-4 wave cap in React: a node written only by the last wave', () => {
  it('C is committed but never bumped → its component never re-renders', () => {
    const root = flat(3);
    const [A, B, C] = root.children;
    const ui = render(
      <div>
        <Leaf node={A} />
        <Leaf node={B} />
        <Leaf node={C} />
      </div>,
    );
    let calls = 0;
    A.subscribe(() => {
      calls++;
      B.setValue((B.value ?? 0) + 1);
    });
    B.subscribe(() => {
      calls++;
      A.setValue((A.value ?? 0) + 1);
      if (root.waveCount === 26) C.setValue('late');
    });
    act(() => root.batch(() => { A.setValue(1); B.setValue(1); }));
    const dom = (p) => ui.container.querySelector(`[data-path="${p}"]`).textContent;
    out('2-react', { calls, waves: root.waveCount, settle: root.settle, tree: { A: A.value, B: B.value, C: C.value }, dom: { A: dom('/f0'), B: dom('/f1'), C: dom('/f2') }, revC: C.revision(EV.UpdateValue) });
    expect(dom('/f2')).toBe(''); // observed stale DOM: tree says 'late'
  });
});
