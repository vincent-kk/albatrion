import { type CompositeCase, type CompositePropStage, compositeCases, playScenario } from '@aileron/schema-form-scenarios';
import type { StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { type FormHandle, ShowError, ValidationMode, VirtualizationBackfill } from '../../../src';

import type { FeatureFormProps, FeaturePropStage, FeatureStory, FeatureStoryProps } from '../../features/components/FeatureStory';
import { createHandleProbe } from '../../features/components/createHandleProbe';
import { createHeldValidator } from './createHeldValidator';
import { runStoryTail } from './runStoryTail';

/** Extra wiring a case's story adds around the shared steps and tail. */
export interface CompositeStoryOptions {
  /** Form props the case needs beyond its plain props, such as consumer inputs. */
  readonly formProps?: FeatureFormProps;
  /** Layout drawn inside the Form instead of the default group. */
  readonly layout?: FeatureStoryProps['layout'];
  /** Consumer checks before the shared steps. */
  readonly before?: (context: { readonly canvasElement: HTMLElement; readonly handle: FormHandle }) => Promise<void>;
  /** Consumer checks after the tail. */
  readonly after?: (context: { readonly canvasElement: HTMLElement; readonly handle: FormHandle; readonly submitted: readonly unknown[] }) => Promise<void>;
}

/**
 * Find a composite case by its scenario name.
 * @param name - Stable scenario name.
 * @returns The case; throws when the data was renamed.
 */
export const findCompositeCase = (name: string): CompositeCase => {
  const item = compositeCases.find((entry) => entry.scenario.name === name);
  if (!item) throw new Error(`Missing composite case: ${name}`);
  return item;
};

/**
 * Map a showError name or boolean to the Form prop.
 * @param showError - Plain value from case data.
 * @returns The Form showError prop, or undefined when the data sets none.
 */
const toShowError = (showError: CompositePropStage['showError']): FeatureFormProps['showError'] =>
  typeof showError === 'string' ? ShowError[showError] : showError;

/**
 * Map a case's mount props to Form props; the errors prop goes to the first prop stage instead.
 * @param props - Plain mount props from the case data.
 * @returns Form props for FeatureStory.
 */
const toMountProps = (props: CompositeCase['props']): FeatureFormProps => ({
  ...(props?.context && { context: props.context }),
  ...(props?.showError !== undefined && { showError: toShowError(props.showError) }),
  ...(props?.validationMode && { validationMode: ValidationMode[props.validationMode] }),
  ...(props?.virtualization && {
    virtualization: { ...props.virtualization, backfill: props.virtualization.backfill === 'idle' ? VirtualizationBackfill.Idle : VirtualizationBackfill.None },
  }),
});

/**
 * Map one plain prop stage to a FeatureStory prop stage; errors stays untyped so malformed input reaches the Form.
 * @param stage - Plain stage from case data.
 * @returns The FeatureStory stage.
 */
const toStage = (stage: CompositePropStage): FeaturePropStage => ({
  ...('errors' in stage && { errors: stage.errors }),
  ...(stage.context && { context: stage.context }),
  ...(stage.showError !== undefined && { showError: toShowError(stage.showError) }),
});

/**
 * Build the story of one composite case: shared steps through playScenario, then the consumer tail.
 * @param name - Scenario name of the case.
 * @param options - Consumer wiring around the shared steps.
 * @returns The story; tail prop stages accumulate, and the first stage is the mount.
 */
export const createCompositeStory = (name: string, options: CompositeStoryOptions = {}): StoryObj<typeof FeatureStory> => {
  const item = findCompositeCase(name);
  const probe = createHandleProbe();
  const submitted: unknown[] = [];
  const held = item.tail?.some((step) => step.act === 'holdValidation') ? createHeldValidator() : undefined;
  const mountProps = toMountProps(item.props);
  // Stage 0 mounts without the errors prop so the shared steps see validator issues only; the tail opens on stage 1, which
  // adds the errors prop and the tailStart value that a reset then loads, as the jsdom tail mounts with them.
  const tailOpening: FeaturePropStage = {
    ...(item.props && 'errors' in item.props && { errors: item.props.errors }),
    ...(item.tailStart !== undefined && { defaultValue: item.tailStart }),
  };
  const opensTail = Object.keys(tailOpening).length > 0;
  const propStages = (item.tail ?? []).reduce<FeaturePropStage[]>((stages, step) => {
    if (step.act !== 'props') return stages;
    return [...stages, { ...stages.at(-1), ...toStage(step.stage) }];
  }, opensTail ? [{}, tailOpening] : [{}]);

  return {
    args: {
      scenario: item.scenario, onHandle: probe.onHandle, propStages, ...(options.layout && { layout: options.layout }),
      formProps: { ...mountProps, ...(held && { validatorFactory: held.factory }), onSubmit: (value) => { submitted.push(value); }, ...options.formProps },
    },
    parameters: { docs: { description: { story: item.scenario.description } } },
    async play({ args, canvasElement }) {
      const handle = await probe.handle(canvasElement);
      await options.before?.({ canvasElement, handle });
      await playScenario(args.scenario, canvasElement);
      if (opensTail) {
        await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Apply next form props"]')!);
        if (item.tailStart !== undefined) handle.reset();
      }
      if (item.tail) await runStoryTail(item.tail, { handle, canvasElement, submitted, held });
      await options.after?.({ canvasElement, handle, submitted });
    },
  };
};
