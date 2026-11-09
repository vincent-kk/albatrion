import { createRef } from 'react';

import { createRoot } from 'react-dom/client';

import { Form, registerPlugin } from '@canard/schema-form';
import * as schemaForm from '@canard/schema-form';
import type { FormHandle, JSONSchema } from '@canard/schema-form';
import type { plugin } from '@canard/schema-form-ajv8-plugin';

import type { CoreFixture } from '../../../../fixtures/core/types';
import type { MountedCoreFixture } from '../../types';
import { afterCorePaint } from '../afterCorePaint';
import { createCoreFormProps } from './utils/createCoreFormProps';
import { createCoreMarkerRenderer } from './utils/createCoreMarkerRenderer';

/** Page-side callbacks of one mount. */
export interface CoreMountHooks {
  /** Called right before the first render; the caller takes its start mark here. */
  onRenderStart: () => void;
  /** Called in the first rAF after input DOM insertion. */
  onFirstPaint: () => void;
  /** Receives every onValidate report of the form. */
  onValidate: (errors: readonly { dataPath: string }[]) => void;
}

/**
 * Mount one fresh form with public APIs; React owns refs and the browser owns clocks.
 * @param container - Empty element belonging to this fresh browser page.
 * @param fixture - Generated schema, complete native control expectation and measured path.
 * @param validatorPlugin - Already wrapped plugin registered before the first render.
 * @param hooks - Render-start, first-paint and validation callbacks.
 * @returns Painted mount duration and access to the current public form handle.
 * @throws If complete mounting or the public handle is missing after 30 seconds.
 */
export async function mountCoreFixture(
  container: HTMLElement,
  fixture: CoreFixture,
  validatorPlugin: typeof plugin,
  hooks: CoreMountHooks,
): Promise<MountedCoreFixture> {
  registerPlugin(validatorPlugin);
  const Renderer = createCoreMarkerRenderer(fixture.measuredPath);
  const displayProps = createCoreFormProps(schemaForm, Renderer);
  const formRef = createRef<FormHandle>();
  const root = createRoot(container);
  const firstPaint = new Promise<void>((resolve) => {
    const observer = new MutationObserver((records) => {
      if (
        !records.some((record) =>
          [...record.addedNodes].some(
            (node) =>
              node instanceof Element &&
              (node.matches('input,select') ||
                node.querySelector('input,select')),
          ),
        )
      )
        return;
      observer.disconnect();
      requestAnimationFrame(() => {
        hooks.onFirstPaint();
        resolve();
      });
    });
    observer.observe(container, { childList: true, subtree: true });
  });
  hooks.onRenderStart();
  const started = performance.now();
  root.render(
    <Form<JSONSchema>
      ref={formRef}
      jsonSchema={fixture.schema}
      {...displayProps}
      onValidate={hooks.onValidate}
      {...(fixture.defaultValidation
        ? {}
        : { validationMode: fixture.validation ? 1 : 0 })}
      virtualization={false}
    />,
  );
  let previous = -1;
  let stable = 0;
  while (stable < 3) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const count = container.querySelectorAll('input,select').length;
    stable =
      count === fixture.expectedInputs && count === previous ? stable + 1 : 0;
    previous = count;
    if (performance.now() - started > 30000)
      throw new Error('Core mount readiness timeout: ' + fixture.id);
  }
  await firstPaint;
  await afterCorePaint();
  const durationMs = performance.now() - started;
  if (!formRef.current) throw new Error('Core form handle missing after mount');
  return {
    durationMs,
    currentHandle() {
      if (!formRef.current) throw new Error('Core form handle missing');
      return formRef.current;
    },
  };
}
