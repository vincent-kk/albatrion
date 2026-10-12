import { useEffect, useRef, useState } from 'react';

import type { FormScenario } from '@aileron/schema-form-scenarios';
import { registerScenarioHandle } from '@aileron/schema-form-scenarios';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';

import { Form, ValidationMode, registerPlugin, type FormHandle, type JSONSchema } from '../../../src';

import { createStoryScenarioAdapter } from '../../components/scenario/createStoryScenarioAdapter';
import type { StoryObservations } from '../../components/scenario/types';

// Feature and composite stories validate through the registered ajv8 plugin, not a validatorFactory prop.
registerPlugin(ajv8Plugin);

/**
 * Render shared scenario data with the public Form and show its schema for the docs catalog.
 * @param props - Shared scenario data; React owns the handle and its DOM registration.
 * @returns The described form, a live output readout, and the authored schema and initial value.
 */
export function FeatureStory({ scenario }: { scenario: FormScenario }) {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<FormHandle | null>(null);
  const [observations] = useState<StoryObservations>(() => ({ changes: [], errorCodes: [], validationRequests: 0 }));
  useEffect(() => {
    const element = root.current;
    if (!element || !handle) return;
    return registerScenarioHandle(element, handle, createStoryScenarioAdapter({ handle, element, observations }));
  }, [handle, observations]);
  return <section data-feature-story={scenario.name}>
    {scenario.description && <p>{scenario.description}</p>}
    <div ref={root} data-scenario-name={scenario.name}>
      <Form key={scenario.name} ref={setHandle} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue}
        validationMode={ValidationMode.OnChange | ValidationMode.OnRequest}
        onChange={(value) => { observations.changes.push(value); }} onError={({ code }) => { observations.errorCodes.push(code); }}>
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
