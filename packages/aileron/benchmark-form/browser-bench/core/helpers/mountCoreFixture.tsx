import { createRef } from 'react';
import type { ReactNode } from 'react';

import { createRoot } from 'react-dom/client';

import { Form, registerPlugin } from '@canard/schema-form';
import type {
  FieldRendererProps,
  FormHandle,
  JSONSchema,
} from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv8-plugin';

import type { CoreFixture } from '../../../fixtures/core/types';
import type { MountedCoreFixture } from '../types';
import { afterCorePaint } from './afterCorePaint';

/** Match the input-only benchmark renderer without adding label/error DOM. */
const PassRenderer = ({ Input }: FieldRendererProps): ReactNode => <Input />;

/**
 * Mount one fresh form with public APIs; React owns refs and the browser owns clocks.
 * @param container - Empty element belonging to this fresh browser page.
 * @param fixture - Generated schema and complete native control expectation.
 * @param onFirstPaint - Called in the first rAF after input DOM insertion.
 * @param onValidationRun - Count actual validator calls, including deferred validation.
 * @returns Painted mount duration and access to the current public form handle.
 * @throws If complete mounting or the public handle is missing after 30 seconds.
 */
export async function mountCoreFixture(
  container: HTMLElement,
  fixture: CoreFixture,
  onFirstPaint: () => void,
  onValidationRun: () => void,
): Promise<MountedCoreFixture> {
  registerPlugin({
    ...plugin,
    validator: {
      ...plugin.validator,
      compile(schema: Parameters<typeof plugin.validator.compile>[0]) {
        const validate = plugin.validator.compile(schema);
        return (value: Parameters<typeof validate>[0]) => {
          onValidationRun();
          return validate(value);
        };
      },
    },
  });
  const formRef = createRef<FormHandle>();
  const root = createRoot(container);
  const started = performance.now();
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
        onFirstPaint();
        resolve();
      });
    });
    observer.observe(container, { childList: true, subtree: true });
  });
  root.render(
    <Form<JSONSchema>
      ref={formRef}
      jsonSchema={fixture.schema}
      FieldRenderer={PassRenderer}
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
