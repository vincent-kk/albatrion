import { useEffect, useMemo, useRef, useState } from 'react';

import type { FormScenario } from '@aileron/schema-form-scenarios';
import { registerScenarioHandle } from '@aileron/schema-form-scenarios';

import { Form, ValidationMode, type FormHandle, type JSONSchema, type ValidatorFactory } from '../../../src';

import { ajvValidatorPlugin } from '../validator';
import { useStoryPanelsReport } from '../panels/useStoryPanelsReport';
import { createStoryScenarioAdapter } from './createStoryScenarioAdapter';
import type { StoryObservations } from './types';

/**
 * Render the package's public Form and register its handle on the wrapper root.
 * @param props - Shared scenario data; React owns handle and registration lifetime.
 * @returns A form with a live output readout; registration is removed on unmount.
 */
export function ScenarioStory({ scenario }: { scenario: FormScenario }) {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<FormHandle | null>(null);
  const report = useStoryPanelsReport();
  const [observations] = useState<StoryObservations>(() => ({ changes: [], errorCodes: [], validationRequests: 0 }));
  const validatorFactory = useMemo<ValidatorFactory>(() => ({
    compile(schema) {
      const validate = ajvValidatorPlugin.compile(schema as JSONSchema);
      return (value) => { observations.validationRequests++; return validate(value); };
    },
    compileGuard: ajvValidatorPlugin.compileGuard,
  }), [observations]);
  useEffect(() => {
    const element = root.current;
    if (!element || !handle) return;
    return registerScenarioHandle(element, handle, createStoryScenarioAdapter({ handle, element, observations }));
  }, [handle, observations]);
  useEffect(() => {
    report({ value: handle ? handle.getValue() : scenario.initialValue, errors: handle?.getErrors() ?? [],
      defaultValue: { initialValue: scenario.initialValue, defaultValue: scenario.initialValue },
      settings: { validator: 'ajv validatorFactory (counted)', validationMode: 'OnChange | OnRequest', showError: 'EditedTouched',
        virtualization: scenario.name === 'controls.virtualization', FormProvider: false, context: undefined, fieldInputMap: [], fieldInputDefinitions: [] },
      stage: { current: 1, total: 1, schema: scenario.schema },
    });
  }, [report, handle, scenario]);
  return <div ref={root} data-scenario-name={scenario.name}>
    <Form key={scenario.name} ref={setHandle} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue}
      validatorFactory={validatorFactory} validationMode={ValidationMode.OnChange | ValidationMode.OnRequest}
      virtualization={scenario.name === 'controls.virtualization'}
      onChange={(value) => { observations.changes.push(value); report({ value, errors: handle?.getErrors() ?? [] }); }}
      onValidate={(errors) => report({ errors })} onError={({ code }) => { observations.errorCodes.push(code); }}>
      {({ value }) => <><Form.Field /><output aria-label="Form output">{JSON.stringify(value)}</output></>}
    </Form>
  </div>;
}
