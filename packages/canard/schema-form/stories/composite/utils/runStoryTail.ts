import type { CompositeTailStep } from '@aileron/schema-form-scenarios';
import { expect, userEvent } from 'storybook/test';

import { type FormHandle, SchemaNodeState, SetValueOption } from '../../../src';

import { expectEventually } from '../../features/components/expectEventually';
import type { HeldValidator } from './createHeldValidator';

/** Everything a story tail step may touch. */
export interface StoryTailContext {
  /** Form handle of the current canvas. */
  readonly handle: FormHandle;
  /** Story canvas. */
  readonly canvasElement: HTMLElement;
  /** Values received by onSubmit, in order. */
  readonly submitted: readonly unknown[];
  /** Held validator, when the case holds verdicts. */
  readonly held?: HeldValidator;
}

/** Wait one animation frame so committed work lands. */
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Run a composite tail in the browser after the shared steps; reads wait with expectEventually.
 * @param tail - Tail steps from the case data.
 * @param context - Handle, canvas, submit log, and held validator.
 * @returns Completion after every step was checked; throws on the first mismatch.
 */
export const runStoryTail = async (tail: readonly CompositeTailStep[], context: StoryTailContext): Promise<void> => {
  const { handle, canvasElement, submitted, held } = context;
  const node = (path: string) => handle.findNode(path);
  const input = (path: string) => canvasElement.querySelector<HTMLInputElement>(`input[id="${path}"]`);
  for (const [index, step] of tail.entries()) {
    const label = `tail ${index} ${step.act}`;
    if (step.act === 'write') node(step.path)!.setValue(step.value);
    else if (step.act === 'type') {
      await expectEventually(() => Boolean(input(step.path)), true, `${label} input ${step.path}`);
      await userEvent.type(input(step.path)!, step.text);
    } else if (step.act === 'merge') handle.setValue(step.value, SetValueOption.Merge);
    else if (step.act === 'batch') handle.node!.batch(() => { for (const write of step.writes) node(write.path)!.setValue(write.value); });
    else if (step.act === 'props') await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Apply next form props"]')!);
    else if (step.act === 'reset') handle.reset();
    else if (step.act === 'holdValidation') held!.hold();
    else if (step.act === 'releaseValidation') held!.release();
    else if (step.act === 'focus') handle.focus(step.path);
    else if (step.act === 'blur') { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }
    else if (step.act === 'submit') {
      if ('rejected' in step) await expect(handle.submit(), label).rejects.toMatchObject({ specific: step.rejected });
      else {
        await handle.submit();
        await expectEventually(() => submitted.at(-1), step.submitted, label);
      }
    }
    await nextFrame();
    if (step.act === 'values') await expectEventually(() => Object.fromEntries(Object.keys(step.values).map((path) => [path, node(path)?.value])), step.values, label);
    if (step.act === 'states')
      await expectEventually(() => Object.fromEntries(Object.entries(step.states).map(([path, expected]) => {
        const target = node(path)!;
        return [path, {
          ...('dirty' in expected && { dirty: Boolean(target.state?.[SchemaNodeState.Dirty]) }),
          ...('touched' in expected && { touched: Boolean(target.state?.[SchemaNodeState.Touched]) }),
          ...('readOnly' in expected && { readOnly: target.readOnly }),
          ...('visible' in expected && { visible: target.visible }),
        }];
      })), step.states, label);
    if (step.act === 'errors')
      await expectEventually(() => Object.fromEntries(Object.keys(step.errors).map((path) => [path, (node(path)?.errors ?? []).map((issue) => issue.keyword)])), step.errors, label);
    if (step.act === 'globalErrors') await expectEventually(() => handle.getErrors().map((issue) => issue.keyword), step.keywords, label);
    if (step.act === 'shown')
      await expectEventually(() => Object.fromEntries(Object.keys(step.shown).map((path) => [path, Boolean(canvasElement.querySelector(`[data-path="${path}"] em`)?.textContent?.trim())])), step.shown, label);
    if (step.act === 'mounted') await expectEventually(() => Object.fromEntries(Object.keys(step.mounted).map((path) => [path, Boolean(input(path))])), step.mounted, label);
  }
};
