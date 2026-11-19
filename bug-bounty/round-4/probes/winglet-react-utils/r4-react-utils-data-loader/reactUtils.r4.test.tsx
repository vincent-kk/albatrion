import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  type RefObject,
  Suspense,
  memo,
  startTransition,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as filterByName from '@winglet/common-utils/filter';
import * as libByName from '@winglet/common-utils/lib';
import * as objectByName from '@winglet/common-utils/object';

import * as filterSource from '../../../../common-utils/src/utils/filter/index';
import * as libSource from '../../../../common-utils/src/libs/index';
import * as objectSource from '../../../../common-utils/src/utils/object/index';
import * as portalEntry from '../../components/Portal';
import { ErrorBoundary, withErrorBoundary } from '../../hoc/withErrorBoundary';
import { useConstant } from '../../hooks/useConstant';
import { useDebounce } from '../../hooks/useDebounce';
import { useMemorize } from '../../hooks/useMemorize';
import { useRestProperties } from '../../hooks/useRestProperties';
import { useSnapshot } from '../../hooks/useSnapshot';
import { useSnapshotReference } from '../../hooks/useSnapshotReference';

const neverSettles = new Promise<void>(() => {});

describe('control: workspace dependencies resolve to source', () => {
  it('@winglet/common-utils subpaths used by the hooks are the src modules, not dist', () => {
    expect({
      equals: objectByName.equals === objectSource.equals,
      hasOwnProperty: libByName.hasOwnProperty === libSource.hasOwnProperty,
      isFunction: filterByName.isFunction === filterSource.isFunction,
    }).toEqual({ equals: true, hasOwnProperty: true, isFunction: true });
  });
});

describe('render-time snapshot writes and abandoned renders (sibling of round-3 react-utils 2)', () => {
  it('useSnapshotReference: an event handler reads the committed snapshot, not a suspended transition', async () => {
    let setValue = (_value: { q: string }) => {};
    let committedRef: RefObject<{ q: string }> | null = null;
    const Probe = () => {
      const [value, set] = useState({ q: 'A' });
      setValue = set;
      const ref = useSnapshotReference(value);
      useLayoutEffect(() => {
        committedRef = ref;
      });
      if (value.q === 'B') throw neverSettles;
      return <span>{value.q}</span>;
    };
    const view = render(
      <Suspense fallback="loading">
        <Probe />
      </Suspense>,
    );
    await act(async () => {
      startTransition(() => setValue({ q: 'B' }));
    });
    expect({
      shown: view.container.textContent,
      handled: committedRef!.current.q,
    }).toEqual({ shown: 'A', handled: 'A' });
  });

  const runSnapshotScenario = async (withAbandonedTransition: boolean) => {
    let setValue = (_value: { q: string }) => {};
    const effectRuns: Array<{ q: string }> = [];
    const Probe = () => {
      const [value, set] = useState({ q: 'A' });
      setValue = set;
      const snapshot = useSnapshot(value);
      useEffect(() => {
        effectRuns.push(snapshot);
      }, [snapshot]);
      if (value.q === 'B') throw neverSettles;
      return <span>{value.q}</span>;
    };
    const view = render(
      <Suspense fallback="loading">
        <Probe />
      </Suspense>,
    );
    if (withAbandonedTransition)
      await act(async () => {
        startTransition(() => setValue({ q: 'B' }));
      });
    // An urgent update whose content equals the committed snapshot.
    await act(async () => {
      setValue({ q: 'A' });
    });
    return {
      shown: view.container.textContent,
      effectRuns: effectRuns.length,
      sameIdentity: effectRuns[effectRuns.length - 1] === effectRuns[0],
    };
  };

  it('control: useSnapshot keeps its identity for an equal input without an abandoned render', async () => {
    expect(await runSnapshotScenario(false)).toEqual({
      shown: 'A',
      effectRuns: 1,
      sameIdentity: true,
    });
  });

  it('useSnapshot keeps its identity for an equal input after an abandoned transition render', async () => {
    expect(await runSnapshotScenario(true)).toEqual({
      shown: 'A',
      effectRuns: 1,
      sameIdentity: true,
    });
  });

  const runRestScenario = async (withAbandonedTransition: boolean) => {
    let setValue = (_value: { title: string }) => {};
    let childRenders = 0;
    // The object itself is the prop, as when the stabilized rest object feeds a memoized child.
    const Child = memo((props: { options: { title: string } }) => {
      childRenders++;
      return <span>{props.options.title}</span>;
    });
    const Probe = () => {
      const [value, set] = useState({ title: 'A' });
      setValue = set;
      const rest = useRestProperties(value);
      if (value.title === 'B') throw neverSettles;
      return <Child options={rest} />;
    };
    render(
      <Suspense fallback="loading">
        <Probe />
      </Suspense>,
    );
    if (withAbandonedTransition)
      await act(async () => {
        startTransition(() => setValue({ title: 'B' }));
      });
    await act(async () => {
      setValue({ title: 'A' });
    });
    return { childRenders };
  };

  it('control: useRestProperties keeps the previous object for a shallow-equal input', async () => {
    expect(await runRestScenario(false)).toEqual({ childRenders: 1 });
  });

  it('useRestProperties keeps the previous object for a shallow-equal input after an abandoned transition render', async () => {
    expect(await runRestScenario(true)).toEqual({ childRenders: 1 });
  });
});

describe('documentation site page documents/docs/winglet/react-utils/index.mdx', () => {
  const repositoryRoot = resolve(__dirname, '../../../../../../');
  const pages = {
    en: 'documents/docs/winglet/react-utils/index.mdx',
    ko: 'documents/i18n/ko/docusaurus-plugin-content-docs/current/winglet/react-utils/index.mdx',
  };
  const read = (path: string) =>
    readFileSync(resolve(repositoryRoot, path), 'utf8');

  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it("`import { Portal, withPortal } from '@winglet/react-utils/portal'` yields a withPortal function", () => {
    expect(read(pages.en)).toContain(
      "import { Portal, withPortal } from '@winglet/react-utils/portal';",
    );
    expect(read(pages.ko)).toContain(
      "import { Portal, withPortal } from '@winglet/react-utils/portal';",
    );
    // `portalEntry` is the `source` target of the `./portal` export.
    expect(typeof (portalEntry as Record<string, unknown>).withPortal).toBe(
      'function',
    );
  });

  it('`useConstant(() => new ExpensiveManager())` yields the manager', () => {
    expect(read(pages.en)).toContain(
      'const manager = useConstant(() => new ExpensiveManager());',
    );
    class ExpensiveManager {}
    let manager: unknown;
    const Probe = () => {
      manager = useConstant(() => new ExpensiveManager());
      return null;
    };
    render(<Probe />);
    expect(manager).toBeInstanceOf(ExpensiveManager);
  });

  it('`withErrorBoundary(Widget, { fallback: <p>…</p> })` renders the fallback when Widget throws', () => {
    expect(read(pages.en)).toContain(
      'const SafeWidget = withErrorBoundary(Widget, {',
    );
    const Widget = () => {
      throw new Error('boom');
    };
    const SafeWidget = withErrorBoundary(Widget, {
      fallback: <p>Something went wrong.</p>,
    } as never);
    const view = render(
      <ErrorBoundary fallback={<p>outer boundary caught</p>}>
        <SafeWidget />
      </ErrorBoundary>,
    );
    expect(view.container.textContent).toBe('Something went wrong.');
  });

  it('`useMemorize(deps, factory)` returns the factory result', () => {
    expect(read(pages.en)).toContain('| `useMemorize(deps, factory)` |');
    let result: unknown;
    const Probe = () => {
      result = useMemorize([1] as never, (() => 'computed') as never);
      return null;
    };
    render(<Probe />);
    expect(result).toBe('computed');
  });

  it('`useDebounce(value, delay)` returns a debounced value', () => {
    expect(read(pages.en)).toContain(
      '| `useDebounce(value, delay)` | Debounced value |',
    );
    let result: unknown;
    const Probe = () => {
      result = useDebounce('query' as never, 300 as never);
      return null;
    };
    render(<Probe />);
    expect(result).toBe('query');
  });

  it('peer dependency line matches package.json peerDependencies', () => {
    const manifest = JSON.parse(
      read('packages/winglet/react-utils/package.json'),
    ) as { peerDependencies: Record<string, string> };
    const expected = `# peer deps: react ${manifest.peerDependencies.react}, react-dom ${manifest.peerDependencies['react-dom']}`;
    const lines = Object.values(pages).map(
      (page) =>
        read(page)
          .split('\n')
          .find((line) => line.startsWith('# peer deps:')) ?? '',
    );
    expect(lines).toEqual([expected, expected]);
  });
});
