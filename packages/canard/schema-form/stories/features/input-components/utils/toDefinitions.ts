import type { LabeledDefinition } from '@aileron/schema-form-scenarios';

import type { FieldInputDefinition } from '../../../../src';

import { getLabeledInput } from './getLabeledInput';

/**
 * Build real FieldInput definitions from labelled scenario definitions.
 * @param definitions - Labelled definitions in priority order.
 * @returns Definitions whose components mark themselves with their label.
 */
export function toDefinitions(definitions: readonly LabeledDefinition[]): FieldInputDefinition[] {
  return definitions.map(({ test, label }) => ({ test, Component: getLabeledInput(label) }));
}
