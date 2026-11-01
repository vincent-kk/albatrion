import { createRef, startTransition, useState } from 'react';
import type { ReactNode } from 'react';

import { createRoot } from 'react-dom/client';

import { Form, registerPlugin } from '@canard/schema-form';
import type {
  FieldRendererProps,
  FormHandle,
  JSONSchema,
} from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv8-plugin';

import type { InputFixture } from '../../../fixtures/input-responsiveness/types';
import type { MountRecord } from '../types';
import { afterPaint } from './afterPaint';
import type { observePage } from './observePage';

/** Use the existing mount lane's input-only rendering to keep DOM work comparable. */
const PassRenderer = ({ Input }: FieldRendererProps): ReactNode => <Input />;

/** React owns state and browser clocks; the component deliberately exposes the consumer lever. */
function CounterForm({
  fixture,
  formRef,
  observation,
}: {
  fixture: InputFixture;
  formRef: React.RefObject<FormHandle | null>;
  observation: ReturnType<typeof observePage>;
}) {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <output id="parent-counter">{counter}</output>
      <Form
        ref={formRef as never}
        jsonSchema={fixture.schema}
        {...{
          [__IR0_LANE__ === 'E' ? 'FieldRenderer' : 'CustomFormTypeRenderer']:
            PassRenderer,
        }}
        {...(fixture.validationMode !== undefined
          ? { validationMode: fixture.validationMode }
          : fixture.defaultValidation
            ? {}
            : { validationMode: fixture.validation ? 1 : 0 })}
        {...(fixture.showError ? { showError: true } : {})}
        virtualization={fixture.virtualization || false}
        onValidate={(errors) => observation.delivery(errors.length)}
        onChange={() => {
          if (fixture.parentState === 'plain') setCounter((value) => value + 1);
          if (fixture.parentState === 'transition')
            startTransition(() => setCounter((value) => value + 1));
        }}
      />
    </>
  );
}

/**
 * Mount a fresh form and measure the existing wall boundary plus paint/reveal milestones.
 * @param container - Fresh page form root
 * @param fixture - Requested lane-specific schema and validation mode
 * @param observation - Passive page measurements and callback sink
 * @returns Public Form handle and complete mount evidence
 * @throws If input readiness or full placeholder reveal does not complete within 30 seconds
 */
export async function mountFixture(
  container: HTMLElement,
  fixture: InputFixture,
  observation: ReturnType<typeof observePage>,
  options?: {
    onFirstPaint?: () => void;
    onValidationRun?: () => void;
    onValidatorWork?: (
      kind: 'compile' | 'validate',
      start: number,
      end: number,
    ) => void;
  },
): Promise<{
  handle: FormHandle;
  mount: MountRecord;
  currentHandle(): FormHandle;
  rerender(schema: JSONSchema): Promise<void>;
}> {
  registerPlugin(
    options?.onValidatorWork
      ? {
          ...plugin,
          validator: {
            ...plugin.validator,
            compile(schema: Parameters<typeof plugin.validator.compile>[0]) {
              const start = performance.now();
              const validate = plugin.validator.compile(schema);
              options.onValidatorWork?.('compile', start, performance.now());
              return (value: Parameters<typeof validate>[0]) => {
                const at = performance.now();
                options.onValidationRun?.();
                const result = validate(value);
                options.onValidatorWork?.('validate', at, performance.now());
                return result;
              };
            },
          },
        }
      : options?.onValidationRun
        ? {
            ...plugin,
            validator: {
              ...plugin.validator,
              compile(schema: Parameters<typeof plugin.validator.compile>[0]) {
                const validate = plugin.validator.compile(schema);
                return (value: Parameters<typeof validate>[0]) => {
                  options.onValidationRun?.();
                  return validate(value);
                };
              },
            },
          }
        : plugin,
  );
  const formRef = createRef<FormHandle>();
  const root = createRoot(container);
  const started = performance.now();
  let firstPaintedMs: number | undefined;
  let firstPaint: Promise<void> | undefined;
  if (options?.onFirstPaint)
    firstPaint = new Promise<void>((resolve) => {
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
          firstPaintedMs = performance.now() - started;
          options.onFirstPaint!();
          resolve();
        });
      });
      observer.observe(container, { childList: true, subtree: true });
    });
  root.render(
    <CounterForm
      fixture={fixture}
      formRef={formRef}
      observation={observation}
    />,
  );
  let eager:
    | Promise<{
        eagerPaintedMs: number;
        eagerNodes: number;
        eagerDeferred: number;
        eagerInputs: number;
      }>
    | undefined;
  let previous = -1,
    stable = 0;
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const count = container.querySelectorAll('input,select').length;
    if (count >= 1 && !eager)
      eager = afterPaint().then(() => ({
        eagerPaintedMs: performance.now() - started,
        eagerNodes: container.querySelectorAll('*').length,
        eagerDeferred: container.querySelectorAll('[data-deferred]').length,
        eagerInputs: container.querySelectorAll('input,select').length,
      }));
    if (count >= 1 && count === previous) stable++;
    else stable = 0;
    previous = count;
    if (stable >= 3) break;
    if (performance.now() - started > 30000)
      throw new Error('Mount readiness timeout');
  }
  const wallMs = performance.now() - started;
  const { eagerInputs, ...eagerRecord } = await eager!;
  if (firstPaint) await firstPaint;
  const completeAtEager =
    eagerRecord.eagerDeferred === 0 && eagerInputs >= fixture.expectedInputs;
  while (
    container.querySelector('[data-deferred]') ||
    container.querySelectorAll('input,select').length < fixture.expectedInputs
  ) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (performance.now() - started > 30000)
      throw new Error('Full reveal timeout');
  }
  if (!completeAtEager) await afterPaint();
  const mount: MountRecord = {
    startedAt: started,
    ...(firstPaintedMs === undefined ? {} : { firstPaintedMs }),
    wallMs,
    ...eagerRecord,
    allRevealedMs: completeAtEager
      ? eagerRecord.eagerPaintedMs
      : performance.now() - started,
    allNodes: container.querySelectorAll('*').length,
    allDeferred: container.querySelectorAll('[data-deferred]').length,
    inputs: container.querySelectorAll('input,select').length,
  };
  if (!formRef.current) throw new Error('Form handle missing after mount');
  return {
    handle: formRef.current,
    mount,
    currentHandle() {
      if (!formRef.current) throw new Error('Form handle missing');
      return formRef.current;
    },
    async rerender(schema: JSONSchema) {
      root.render(
        <CounterForm
          fixture={{ ...fixture, schema }}
          formRef={formRef}
          observation={observation}
        />,
      );
      await afterPaint();
    },
  };
}
