import { createRef, startTransition, useState } from 'react';
import type { ReactNode } from 'react';

import { createRoot } from 'react-dom/client';

import { Form, registerPlugin } from '@canard/schema-form';
import type { FieldRendererProps, FormHandle } from '@canard/schema-form';
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
        validationMode={fixture.validation ? 1 : 0}
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
): Promise<{ handle: FormHandle; mount: MountRecord }> {
  registerPlugin(plugin);
  const formRef = createRef<FormHandle>();
  const root = createRoot(container);
  const started = performance.now();
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
  return { handle: formRef.current, mount };
}
