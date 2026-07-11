/**
 * Browser bench harness — bundled by run.mjs (esbuild) and loaded into a real
 * Chromium page via Playwright. Measures the SAME flat-N string form as
 * `bench:compare`, but in a real engine so browser layout (which jsdom omits)
 * is included.
 *
 * rAF-free by design: headless Chromium throttles requestAnimationFrame, so we
 * poll macrotasks until the DOM settles, then force a synchronous reflow.
 *
 * NOT part of CI / the jsdom suite — invoked only by `yarn bench:browser`.
 */
import type { ReactNode } from 'react';

import { createRoot } from 'react-dom/client';

import {
  Form,
  type FormTypeRendererProps,
  VirtualizationBackfill,
} from '@canard/schema-form';

// Inlined to match schema.ts::flatRjsfSchema exactly (field_000.., default
// value_${i}) — keeps the harness self-contained.
const buildFlatSchema = (n: number) => {
  const properties: Record<string, unknown> = {};
  for (let i = 0; i < n; i++)
    properties[`field_${String(i).padStart(3, '0')}`] = {
      type: 'string',
      default: `value_${i}`,
    };
  return { type: 'object', properties } as const;
};

const PassRenderer = ({ Input }: FormTypeRendererProps): ReactNode => <Input />;
const macrotask = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

type Mode = 'baseline' | 'virtualized';

async function benchMount(mode: Mode, size: number) {
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:0;left:0;width:800px';
  document.body.appendChild(container);

  const schema = buildFlatSchema(size);
  // rootMargin '0px' so, at scroll-top, no placeholder is in-viewport → the
  // virtualized form settles at the eager window (default 20), matching the
  // jsdom bench's eager-only measurement. backfill None = reveal on scroll only.
  const virtualization =
    mode === 'virtualized'
      ? { backfill: VirtualizationBackfill.None, rootMargin: '0px' as const }
      : undefined;

  const t0 = performance.now();
  const root = createRoot(container);
  root.render(
    <Form
      jsonSchema={schema as never}
      CustomFormTypeRenderer={PassRenderer}
      onChange={() => {}}
      virtualization={virtualization as never}
    />,
  );

  // Wait (rAF-free) until the mounted DOM settles: input count stable & >= 1.
  let prev = -1;
  let stable = 0;
  let capped = false;
  for (;;) {
    await macrotask();
    const n = container.querySelectorAll('input').length;
    if (n >= 1 && n === prev) {
      if (++stable >= 3) break;
    } else stable = 0;
    prev = n;
    if (performance.now() - t0 > 6000) {
      capped = true;
      break;
    }
  }
  const mountMs = performance.now() - t0;

  const inputs = container.querySelectorAll('input').length;
  const deferred = container.querySelectorAll('[data-deferred]').length;
  const domNodes = container.querySelectorAll('*').length;

  root.unmount();
  container.remove();
  return { mode, size, mountMs, inputs, deferred, domNodes, capped };
}

(window as unknown as { __benchMount: typeof benchMount }).__benchMount =
  benchMount;
(window as unknown as { __benchReady: boolean }).__benchReady = true;
