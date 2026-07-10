import {
  type PropsWithChildren,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { flushSync } from 'react-dom';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  VirtualizationBackfill,
  type VirtualizationPlaceholderProps,
} from '../src';

export default {
  title: 'Form/40. Virtualization',
};

/**
 * Render-level virtualization (deferred mount) demos — issue #319.
 *
 * What to look at:
 * - Placeholders are real DOM boxes carrying `data-path` + `data-deferred`;
 *   the skeleton styling below targets `[data-deferred]` so you can SEE which
 *   fields are not mounted yet.
 * - The node tree is always fully built: the Value pane / defaults exist for
 *   every field even while its input is still a skeleton.
 * - Reveal triggers: scroll near a placeholder (IntersectionObserver,
 *   rootMargin '100%'), idle backfill, or `handle.focus(path)`.
 */

const flatSchema = (count: number): JsonSchema => ({
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `f${index}`,
      { type: 'string', default: `value ${index}` },
    ]),
  ),
});

const SKELETON_CSS = `
  [data-deferred] {
    margin: 4px 0;
    border-radius: 4px;
    background: linear-gradient(90deg, #e9e9e9 25%, #f7f7f7 50%, #e9e9e9 75%);
    background-size: 200% 100%;
    animation: sf-skeleton 1.2s ease-in-out infinite;
  }
  @keyframes sf-skeleton {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }
`;

/** Live counter: actually mounted inputs vs remaining placeholders. */
const MountStatus = ({
  scrollRef,
  total,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  total: number;
}) => {
  const [mounted, setMounted] = useState(0);
  const [deferred, setDeferred] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      const root = scrollRef.current;
      if (!root) return;
      setMounted(root.querySelectorAll('input').length);
      setDeferred(root.querySelectorAll('[data-deferred]').length);
    }, 150);
    return () => clearInterval(id);
  }, [scrollRef]);
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        padding: '6px 10px',
        background: '#1f2937',
        color: '#fff',
        borderRadius: 4,
        fontFamily: 'monospace',
        fontSize: 13,
      }}
    >
      mounted inputs <strong>{mounted}</strong> / {total} · skeleton
      placeholders <strong>{deferred}</strong>
    </div>
  );
};

const ScrollFrame = ({
  scrollRef,
  height = 460,
  styled = true,
  children,
}: PropsWithChildren<{
  scrollRef: RefObject<HTMLDivElement | null>;
  height?: number;
  /** Inject the demo CSS skeleton for bare placeholders (off when a Placeholder component draws its own) */
  styled?: boolean;
}>) => (
  <div
    ref={scrollRef}
    style={{
      height,
      overflow: 'auto',
      border: '1px solid #ddd',
      borderRadius: 6,
      padding: '0 12px 12px',
    }}
  >
    {styled && <style>{SKELETON_CSS}</style>}
    {children}
  </div>
);

const Guide = ({ children }: PropsWithChildren) => (
  <p style={{ maxWidth: 720, lineHeight: 1.5, color: '#374151' }}>{children}</p>
);

const FIELD_COUNT = 500;

/**
 * backfill: VirtualizationBackfill.None — reveals happen ONLY when a placeholder approaches the
 * viewport, so the windowing behavior stays visible while you scroll.
 */
export const ScrollReveal = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <Guide>
        Scroll the frame. Only the first 20 fields (eagerCount) mount as real
        inputs — the other 480 are skeleton placeholders. Each field is replaced
        with its real input the moment it comes within one extra viewport of the
        visible area (rootMargin '100%'), and it never returns to a placeholder
        (defer-once). Backfill is disabled here, so nothing mounts except by
        scrolling.
      </Guide>
      <MountStatus scrollRef={scrollRef} total={FIELD_COUNT} />
      <ScrollFrame scrollRef={scrollRef}>
        <Form
          jsonSchema={flatSchema(FIELD_COUNT)}
          virtualization={{ backfill: VirtualizationBackfill.None }}
        />
      </ScrollFrame>
    </div>
  );
};

/**
 * backfill: VirtualizationBackfill.Idle (default) — the initial mount is O(visible), then the
 * browser's idle time progressively mounts the rest (~25 per slice).
 */
export const IdleBackfill = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [epoch, setEpoch] = useState(0);
  return (
    <div>
      <Guide>
        The default strategy. Right after mount the counter starts at 20 and
        fills up to 500 in slices of ~25 during browser idle time — the total
        work is unchanged, but it never blocks first paint or interaction. Press
        Remount to watch it again.
      </Guide>
      <button onClick={() => setEpoch((prev) => prev + 1)}>Remount</button>
      <MountStatus scrollRef={scrollRef} total={FIELD_COUNT} />
      <ScrollFrame scrollRef={scrollRef}>
        <Form key={epoch} jsonSchema={flatSchema(FIELD_COUNT)} virtualization />
      </ScrollFrame>
    </div>
  );
};

const MountBench = ({
  label,
  virtualized,
}: {
  label: string;
  virtualized: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const remount = () => {
    flushSync(() => setVisible(false));
    const start = performance.now();
    flushSync(() => setVisible(true));
    setElapsed(performance.now() - start);
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={remount}>Mount</button>
        <strong>{label}</strong>
        <span style={{ fontFamily: 'monospace' }}>
          {elapsed === null ? '—' : `${elapsed.toFixed(1)}ms`}
        </span>
      </div>
      <MountStatus scrollRef={scrollRef} total={FIELD_COUNT} />
      <ScrollFrame scrollRef={scrollRef} height={380}>
        {visible && (
          <Form
            jsonSchema={flatSchema(FIELD_COUNT)}
            virtualization={virtualized ? { backfill: VirtualizationBackfill.None } : undefined}
          />
        )}
      </ScrollFrame>
    </div>
  );
};

/**
 * Side-by-side synchronous mount cost (flushSync commit time, dev build —
 * absolute numbers are inflated vs production; compare relatively).
 */
export const MountTimeComparison = () => (
  <div>
    <Guide>
      Press each Mount button to compare the synchronous commit time of a
      500-field form. This runs the dev build, so absolute numbers are inflated
      — compare them relatively (production measurement: 54.9ms &rarr; 18.9ms).
      Press a few times to warm up before reading the value.
    </Guide>
    <div style={{ display: 'flex', gap: 16 }}>
      <MountBench label="virtualization off" virtualized={false} />
      <MountBench label="virtualization on" virtualized={true} />
    </div>
  </div>
);

/**
 * Command reveal: `handle.focus(path)` on a deferred field force-mounts it,
 * replays the focus command, and the browser scrolls it into view.
 */
export const FocusCommandReveal = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<FormHandle<JsonSchema>>(null);
  return (
    <div>
      <Guide>
        The button publishes handle.focus('/f480') to a field that is still a
        placeholder. The gate receives the command, mounts the real subtree
        immediately, then replays the focus command after mount — the browser
        scrolls to and focuses the input. This is why "jump to the first error
        after submit" keeps working for off-screen fields.
      </Guide>
      <button onClick={() => formRef.current?.focus('/f480')}>
        focus('/f480')
      </button>
      <MountStatus scrollRef={scrollRef} total={FIELD_COUNT} />
      <ScrollFrame scrollRef={scrollRef}>
        <Form
          ref={formRef}
          jsonSchema={flatSchema(FIELD_COUNT)}
          virtualization={{ backfill: VirtualizationBackfill.None }}
        />
      </ScrollFrame>
    </div>
  );
};

/** Light, node-aware skeleton drawn INSIDE each deferred placeholder box */
const FieldSkeleton = ({ height }: VirtualizationPlaceholderProps) => (
  <div style={{ height, display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      style={{ width: 56, height: 12, borderRadius: 3, background: '#e2e2e2' }}
    />
    <div
      style={{
        flex: 1,
        maxWidth: 240,
        height: 22,
        borderRadius: 4,
        background: '#f2f2f2',
        border: '1px solid #e2e2e2',
      }}
    />
  </div>
);

/**
 * React-component placeholders via `virtualization.Placeholder` — the
 * Suspense-fallback-style alternative to CSS attribute styling. The wrapper
 * div still owns observation and space reservation; the component only fills
 * it visually. Keep it light: it mounts once per deferred field.
 */
export const ComponentPlaceholder = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <Guide>
        This story passes a React component through virtualization.Placeholder
        instead of styling the bare box with CSS — the idiomatic way to plug in
        design-system skeletons (like a Suspense fallback). The reserved height
        still comes from estimateHeight; the component only paints inside it.
      </Guide>
      <MountStatus scrollRef={scrollRef} total={FIELD_COUNT} />
      <ScrollFrame scrollRef={scrollRef} styled={false}>
        <Form
          jsonSchema={flatSchema(FIELD_COUNT)}
          virtualization={{ backfill: VirtualizationBackfill.None, Placeholder: FieldSkeleton }}
        />
      </ScrollFrame>
    </div>
  );
};

/**
 * The issue's worst case: a 1000-item array. Row chrome (remove buttons)
 * renders immediately — only each item's field subtree is gated.
 */
export const ArrayItems1000 = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <Guide>
        A 1000-item array — the worst case from issue #319. Row chrome (the
        remove buttons) is rendered directly by the array layout, so it appears
        immediately; only each item's field subtree is gated. Values live in the
        node tree the whole time, so an item shows its existing value the moment
        scrolling reveals it.
      </Guide>
      <MountStatus scrollRef={scrollRef} total={1000} />
      <ScrollFrame scrollRef={scrollRef}>
        <Form
          jsonSchema={{
            type: 'object',
            properties: {
              items: { type: 'array', items: { type: 'string' } },
            },
          }}
          defaultValue={{
            items: Array.from({ length: 1000 }, (_, i) => `item ${i}`),
          }}
          virtualization={{ backfill: VirtualizationBackfill.None }}
        />
      </ScrollFrame>
    </div>
  );
};
