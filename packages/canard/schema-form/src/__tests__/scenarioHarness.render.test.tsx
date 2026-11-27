import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  type FormScenario,
  ScenarioForm,
  findScenarioHandle,
  playScenario,
} from '@aileron/schema-form-scenarios';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { type JSONSchema } from '@/schema-form/types';

describe('scenario harness with the public Form', () => {
  afterEach(cleanup);

  it('accepts the real form through structural injection and shares its DOM handle', async () => {
    const scenario: FormScenario<JSONSchema, Record<string, unknown>> = {
      name: 'legacy handle handoff',
      schema: { type: 'object', properties: { name: { type: 'string' } } },
      initialValue: { name: 'initial' },
      steps: [
        { action: 'reset', expect: { outputValue: { name: 'initial' } } },
      ],
    };
    const rendered = render(
      <ScenarioForm<
        JSONSchema,
        Record<string, unknown>,
        FormHandle<JSONSchema, Record<string, unknown>>
      >
        scenario={scenario}
        Form={Form}
        createAdapter={(handle) => ({
          execute: async (step) => {
            if (step.action !== 'reset')
              throw new Error('Unexpected scaffold action.');
            await act(async () => {
              await handle.reset();
            });
          },
          assert: (observation) => {
            expect(handle.getValue()).toEqual(observation.outputValue);
          },
        })}
      />,
    );
    await act(async () => {});
    expect(findScenarioHandle(rendered.container).handle).toHaveProperty(
      'reset',
    );
    expect(await playScenario(scenario, rendered.container)).toEqual({
      executedSteps: 1,
    });
  });
});
