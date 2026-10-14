import React, { Profiler, createRef } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { drainTicks, drainUntilReady } from '../../../src/utils/setup-env';
import type { BenchHandle, EquivalentFixture } from '../types';

/** Mounts a versioned fixture and returns its handle, Profiler commits and teardown. */
export async function mountEquivalentForm(
  fixture: EquivalentFixture,
  version: string,
  coreOnly = false,
) {
  const { Form } =
    version === 'latest'
      ? await import('@canard/schema-form')
      : await import('@canard/schema-form_0.16.0');
  const ref = createRef<BenchHandle>();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const commits: number[] = [];
  let changes = 0;
  const start = performance.now();
  try {
    flushSync(() =>
      root.render(
        <Profiler
          id={fixture.name}
          onRender={(_id, _phase, duration) => commits.push(duration)}
        >
          <Form
            ref={ref as never}
            jsonSchema={
              version === 'latest' ? fixture.workspace : fixture.legacy
            }
            validationMode={0}
            onChange={() => {
              changes++;
            }}
            children={coreOnly ? () => null : undefined}
          />
        </Profiler>,
      ),
    );
    await drainUntilReady(() => ref.current?.findNode('') != null);
    await drainTicks();
    return {
      container,
      handle: ref.current!,
      commits,
      changes: () => changes,
      mountMs: performance.now() - start,
      teardown() {
        flushSync(() => root.unmount());
        container.remove();
      },
    };
  } catch (error) {
    flushSync(() => root.unmount());
    container.remove();
    throw error;
  }
}
