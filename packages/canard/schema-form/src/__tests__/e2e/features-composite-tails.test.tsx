import { createRef, useState } from 'react';

import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type CompositeCase, type CompositePropStage, type CompositeTailStep, compositeCases } from '@aileron/schema-form-scenarios';

import {
  type FormHandle,
  Form,
  type JSONSchema,
  FieldNodeState,
  SetValueOption,
  ShowError,
  ValidationMode,
  type ValidatorFactory,
  VirtualizationBackfill,
} from '@/schema-form';

import { createRenderValidator } from '../helpers/createRenderValidator';

import { advanceValidationFrame } from '../helpers/advanceValidationFrame';
import { settleValidation } from '../helpers/settleValidation';

// Consumer tails of the composite cases: each case loads its tailStart and runs the tail steps against the handle and DOM.
// jsdom has no IntersectionObserver or idle callback; inert stubs keep placeholders deferred until a command reveals them.
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestIdleCallback', () => 0);
  vi.stubGlobal('cancelIdleCallback', () => {});
});
afterEach(() => vi.unstubAllGlobals());

/** GOAL-061 touched lands one animation frame after blur; jsdom runs frames on a timer. */
const frameMs = 50;

/**
 * Settle React work and timers in jsdom.
 * @param ms - Extra wait for timer-driven work such as the touched frame.
 * @returns Completion after the act scope.
 */
const settle = (current: () => FormHandle['node'] | undefined, ms = 0) => act(async () => { await settleValidation(current); if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms)); });

/**
 * Build a validator factory over the harness validator whose verdicts can be held until released.
 * @returns The factory and its hold controls.
 */
const createHeldValidator = () => {
  const base = createRenderValidator();
  const pending: (() => void)[] = [];
  let held = false;
  const factory: ValidatorFactory = {
    ...base,
    compile: (schema) => {
      // A boolean schema accepts everything or nothing; the harness validator compiles object schemas only.
      const validate = typeof schema === 'boolean' ? () => (schema ? null : [{ dataPath: '', keyword: 'false' }]) : base.compile(schema);
      return (value) => (held ? new Promise((resolve) => { pending.push(() => resolve(validate(value))); }) : validate(value));
    },
  };
  return {
    factory,
    isHeld: () => held,
    hold: () => { held = true; },
    release: () => { held = false; pending.splice(0).forEach((resume) => resume()); },
  };
};

/**
 * Map plain staged props to Form props; values stay untyped so a malformed errors prop reaches the Form as an untyped caller sends it.
 * @param stage - Accumulated plain props.
 * @returns Props to spread on the Form.
 */
const toStagedProps = (stage: CompositePropStage & CompositeCase['props']): Record<string, unknown> => ({
  ...('errors' in (stage ?? {}) && { errors: stage?.errors }),
  ...(stage?.context && { context: stage.context }),
  ...(typeof stage?.showError === 'boolean' && { showError: stage.showError }),
  ...(typeof stage?.showError === 'string' && { showError: ShowError[stage.showError] }),
  ...(stage?.validationMode && { validationMode: ValidationMode[stage.validationMode] }),
  ...(stage?.virtualization && { virtualization: { ...stage.virtualization, backfill: stage.virtualization.backfill === 'idle' ? VirtualizationBackfill.Idle : VirtualizationBackfill.None } }),
});

/**
 * Load a case's tailStart, then run its tail steps.
 * @param item - Composite case with a tail.
 * @returns Completion after every tail step was checked.
 */
const runTail = async (item: CompositeCase) => {
  const held = createHeldValidator();
  const submitted: unknown[] = [];
  const ref = createRef<FormHandle>();
  let stageProps: (next: CompositePropStage) => void = () => {};
  const Host = () => {
    const [staged, setStaged] = useState<CompositePropStage & CompositeCase['props']>({ ...item.props });
    stageProps = (next) => setStaged((previous) => ({ ...previous, ...next }));
    return <Form<JSONSchema> ref={ref} jsonSchema={item.scenario.schema as JSONSchema} defaultValue={item.tailStart}
      validatorFactory={held.factory} onSubmit={(value) => { submitted.push(value); }} {...toStagedProps(staged)} />;
  };
  const { container, unmount } = render(<Host />);
  const node = (path: string) => ref.current!.findNode(path);
  try {
    await settle(() => ref.current?.node);
    for (const [index, step] of (item.tail ?? []).entries()) {
      const label = `${item.scenario.name} tail ${index} ${step.act}`;
      await runStep(step, { handle: ref.current!, node, container, held, submitted, stageProps }, label);
    }
  } finally {
    unmount();
  }
};

/** Everything one tail step may touch. */
interface TailContext {
  /** Form handle. */
  readonly handle: FormHandle;
  /** Node lookup by JSON Pointer. */
  readonly node: (path: string) => ReturnType<FormHandle['findNode']>;
  /** Render container. */
  readonly container: HTMLElement;
  /** Held validator controls. */
  readonly held: ReturnType<typeof createHeldValidator>;
  /** Values received by onSubmit, in order. */
  readonly submitted: unknown[];
  /** Merge plain props into the mounted Form. */
  readonly stageProps: (next: CompositePropStage) => void;
}

/**
 * Run and check one tail step in jsdom.
 * @param step - Tail step.
 * @param context - Handle, DOM, and controls of the mounted case.
 * @param label - Assertion label.
 * @returns Completion after the step settled and its expectation was checked.
 */
const runStep = async (step: CompositeTailStep, context: TailContext, label: string) => {
  const { handle, node, container, held, submitted, stageProps } = context;
  if (step.act === 'write') act(() => { node(step.path)!.setValue(step.value); });
  else if (step.act === 'type') await userEvent.type(container.querySelector<HTMLInputElement>(`input[id="${step.path}"]`)!, step.text);
  else if (step.act === 'merge') act(() => { handle.setValue(step.value, SetValueOption.Merge); });
  else if (step.act === 'batch') act(() => { handle.node!.batch(() => { for (const write of step.writes) node(write.path)!.setValue(write.value); }); });
  else if (step.act === 'props') act(() => { stageProps(step.stage); });
  else if (step.act === 'reset') act(() => { handle.reset(); });
  else if (step.act === 'holdValidation') held.hold();
  else if (step.act === 'releaseValidation') act(() => { held.release(); });
  else if (step.act === 'focus') act(() => { handle.focus(step.path); });
  else if (step.act === 'blur') act(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  else if (step.act === 'submit') {
    // Submit stays outside act: a rejected promise inside act leaves React's act queue open for the next test.
    if ('rejected' in step) await expect(handle.submit(), label).rejects.toMatchObject({ specific: step.rejected });
    else {
      await handle.submit();
      expect(submitted.at(-1), label).toEqual(step.submitted);
    }
  }
  if (held.isHeld()) await advanceValidationFrame();
  else await settle(() => handle.node, step.act === 'blur' ? frameMs : 0);
  if (step.act === 'values') for (const [path, value] of Object.entries(step.values)) expect(node(path)?.value, `${label} ${path}`).toEqual(value);
  if (step.act === 'states')
    for (const [path, expected] of Object.entries(step.states)) {
      const target = node(path)!;
      const actual = {
        ...('edited' in expected && { edited: Boolean(target.state?.[FieldNodeState.Edited]) }),
        ...('touched' in expected && { touched: Boolean(target.state?.[FieldNodeState.Touched]) }),
        ...('isReadOnly' in expected && { isReadOnly: target.isReadOnly }),
        ...('isVisible' in expected && { isVisible: target.isVisible }),
      };
      expect(actual, `${label} ${path}`).toEqual(expected);
    }
  if (step.act === 'errors') for (const [path, keywords] of Object.entries(step.errors)) expect((node(path)?.errors ?? []).map((issue) => issue.keyword), `${label} ${path}`).toEqual(keywords);
  if (step.act === 'globalErrors') expect(handle.getErrors().map((issue) => issue.keyword), label).toEqual(step.keywords);
  if (step.act === 'shown') for (const [path, shown] of Object.entries(step.shown)) expect(Boolean(container.querySelector(`[data-path="${path}"] em`)?.textContent?.trim()), `${label} ${path}`).toBe(shown);
  if (step.act === 'mounted' && !step.browserOnly) for (const [path, mounted] of Object.entries(step.mounted)) expect(Boolean(container.querySelector(`input[id="${path}"]`)), `${label} ${path}`).toBe(mounted);
};

describe('features — composite consumer tails', () => {
  it.each(compositeCases.filter((item) => item.tail).map((item) => [item.scenario.name, item] as const))('%s', async (_, item) => {
    await runTail(item);
  });
});
