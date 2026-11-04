import React, { type ComponentType, type ReactNode, createRef } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { settleUpdates } from '../../../src/utils/settleUpdates';
import { drainUntilReady } from '../../../src/utils/setup-env';
import type { BenchHandle, EquivalentFixture } from '../types';

/** JSX props checked against each version's public Form without wrapping its render. */
type EquivalentFormProps = {
  /** Captures only the public handle operations used by equivalent fixtures. */
  ref: (handle: BenchHandle | null) => void;
  /** Disables validation consistently across all compared versions. */
  validationMode: 0;
  /** Counts public root-value notifications. */
  onChange: () => void;
  /** Suppresses field rendering during the core-only measurement. */
  children?: () => null;
};

/**
 * Creates shared JSX using the selected version's exact schema contract.
 * @param Form The public component checked against its matching schema type.
 * @param jsonSchema The authored schema for the selected version.
 * @param props The common measurement callbacks and rendering options.
 * @returns The public Form element without adding a wrapper component.
 */
function renderEquivalentForm<Schema>(
  Form: ComponentType<EquivalentFormProps & { jsonSchema: Schema }>,
  jsonSchema: Schema,
  props: EquivalentFormProps,
) {
  return <Form {...props} jsonSchema={jsonSchema} />;
}

/**
 * Mounts a versioned fixture in the benchmark-owned DOM and captures Profiler commits.
 * @param fixture Authored schemas and interactions with equivalent version behavior.
 * @param version Selects latest, 0.16.0, or the 0.16.1 fallback.
 * @param coreOnly Suppresses field rendering while retaining the public Form lifecycle.
 * @returns The live public handle, timing, commit samples, and required teardown.
 * @throws When mounting fails or the public handle does not become ready.
 */
export async function mountEquivalentForm(
  fixture: EquivalentFixture,
  version: string,
  coreOnly = false,
) {
  const renderForm: (props: EquivalentFormProps) => ReactNode =
    version === 'latest'
      ? await import('@canard/schema-form').then(
          ({ Form }) => (props: EquivalentFormProps) =>
            renderEquivalentForm(Form, fixture.workspace, props),
        )
      : version === '0.16.0'
        ? await import('@canard/schema-form_0.16.0').then(
            ({ Form }) => (props: EquivalentFormProps) =>
              renderEquivalentForm(Form, fixture.legacy, props),
          )
        : await import('@canard/schema-form_0.16.1').then(
            ({ Form }) => (props: EquivalentFormProps) =>
              renderEquivalentForm(Form, fixture.legacy, props),
          );
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
        <React.Profiler
          id={fixture.name}
          onRender={(_id, _phase, duration) => commits.push(duration)}
        >
          {renderForm({
            ref: (handle) => {
              ref.current = handle;
            },
            validationMode: 0,
            onChange: () => {
              changes++;
            },
            children: coreOnly ? () => null : undefined,
          })}
        </React.Profiler>,
      ),
    );
    await drainUntilReady(() => ref.current?.findNode('') != null);
    await settleUpdates();
    const handle = ref.current;
    if (!handle) throw new Error(`Missing Form handle: ${fixture.name}`);
    return {
      container,
      handle,
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
