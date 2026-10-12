import { useEffect, useRef, useState } from 'react';

import type { FormScenario } from '@aileron/schema-form-scenarios';
import { registerScenarioHandle } from '@aileron/schema-form-scenarios';

import { Form, ValidationMode, registerPlugin, type FormHandle, type FormProps, type JSONSchema } from '../../../src';

import { createStoryScenarioAdapter } from '../../components/scenario/createStoryScenarioAdapter';
import type { StoryObservations } from '../../components/scenario/types';
import { ajv8ValidationRequests, countedAjv8Plugin } from './countedAjv8Plugin';

// Feature and composite stories validate through the registered ajv8 plugin, not a validatorFactory prop.
registerPlugin(countedAjv8Plugin);

/** Form props a feature story maps from scenario case constants; the scenario type itself stays unchanged. */
export type FeatureFormProps = Pick<FormProps, 'validationMode' | 'showError' | 'errors' | 'formatError' | 'onStateChange' | 'onSubmit' | 'context'>;

/** One staged set of Form props; a key that is absent leaves that prop to formProps. */
export interface FeaturePropStage {
  /** errors prop for this stage, untyped on purpose. */
  readonly errors?: unknown;
  /** context prop for this stage. */
  readonly context?: FormProps['context'];
}

/** Props of the feature catalog story; everything beyond the scenario is optional. */
export interface FeatureStoryProps {
  /** Shared scenario data rendered by the public Form. */
  scenario: FormScenario;
  /** Form props for the whole story; validationMode defaults to OnChange | OnRequest. */
  formProps?: FeatureFormProps;
  /**
   * Prop values applied one stage at a time by the "Apply next form props" button, starting at the first stage.
   * errors stays untyped so a story can stage input the prop type forbids (178C-01), as an untyped JavaScript caller would.
   */
  propStages?: readonly FeaturePropStage[];
  /** Called with each whole-form value after the story records it. */
  onChange?: (value: unknown) => void;
  /** Receives the mounted handle and its registration element so a play can drive consumer-only interactions. */
  onHandle?: (handle: FormHandle, element: HTMLElement) => void;
}

/**
 * Render shared scenario data with the public Form and show its schema for the docs catalog.
 * @param props - Shared scenario data plus optional form props; React owns the handle and its DOM registration.
 * @returns The described form, a live output readout, and the authored schema and initial value.
 */
export function FeatureStory({ scenario, formProps, propStages, onChange, onHandle }: FeatureStoryProps) {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<FormHandle | null>(null);
  const [stage, setStage] = useState(0);
  const current = propStages?.[stage];
  const staged: Readonly<Record<string, unknown>> = {
    ...(current && 'errors' in current && { errors: current.errors }),
    ...(current?.context && { context: current.context }),
  };
  const [observations] = useState<StoryObservations>(() => ({
    changes: [], errorCodes: [], get validationRequests() { return ajv8ValidationRequests.count; },
  }));
  useEffect(() => {
    const element = root.current;
    if (!element || !handle) return;
    onHandle?.(handle, element);
    return registerScenarioHandle(element, handle, createStoryScenarioAdapter({ handle, element, observations }));
  }, [handle, observations, onHandle]);
  return <section data-feature-story={scenario.name}>
    {scenario.description && <p>{scenario.description}</p>}
    {propStages && <button type="button" aria-label="Apply next form props" disabled={stage + 1 >= propStages.length}
      onClick={() => setStage(stage + 1)}>Form props stage {stage + 1} / {propStages.length}</button>}
    <div ref={root} data-scenario-name={scenario.name}>
      <Form key={scenario.name} ref={setHandle} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue}
        validationMode={ValidationMode.OnChange | ValidationMode.OnRequest} {...formProps} {...staged}
        onChange={(value) => { observations.changes.push(value); onChange?.(value); }} onError={({ code }) => { observations.errorCodes.push(code); }}>
        {({ value }) => <><Form.Group /><output aria-label="Form output">{JSON.stringify(value)}</output></>}
      </Form>
    </div>
    <details>
      <summary>Schema and initial value</summary>
      <pre aria-label="Scenario schema">{JSON.stringify(scenario.schema, null, 2)}</pre>
      <pre aria-label="Scenario initial value">{JSON.stringify(scenario.initialValue, null, 2) ?? 'undefined'}</pre>
    </details>
  </section>;
}
