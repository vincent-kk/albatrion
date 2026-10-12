import type { LabeledDefinition } from '@aileron/schema-form-scenarios';

import type { FormTypeInputDefinition } from '../../../../src';

import { getLabeledInput } from './getLabeledInput';

/**
 * Build real FormTypeInput definitions from labelled scenario definitions.
 * @param definitions - Labelled definitions in priority order.
 * @returns Definitions whose components mark themselves with their label.
 */
export function toDefinitions(definitions: readonly LabeledDefinition[]): FormTypeInputDefinition[] {
  return definitions.map(({ test, label }) => ({ test, Component: getLabeledInput(label) }));
}
