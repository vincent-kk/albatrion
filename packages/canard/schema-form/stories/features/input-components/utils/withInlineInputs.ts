import type { FormScenario } from '@aileron/schema-form-scenarios';
import { isPlainObject } from '@winglet/common-utils/filter';

import { getLabeledInput } from './getLabeledInput';

/**
 * Copy a scenario and set presentation.FormTypeInput on top-level properties, as an author would inline a component.
 * @param scenario - Scenario whose schema is an object with top-level properties.
 * @param inline - Top-level paths ("/name") to a label, or null for no input.
 * @returns A new scenario; the shared data stays untouched.
 * @throws When a path is not a top-level property of the schema.
 */
export function withInlineInputs(scenario: FormScenario, inline: Readonly<Record<string, string | null>>): FormScenario {
  const schema: unknown = structuredClone(scenario.schema);
  if (!isPlainObject<Record<string, unknown>>(schema)) throw new Error('Inline inputs need an object schema');
  const properties = schema.properties;
  for (const [path, label] of Object.entries(inline)) {
    const property = isPlainObject<Record<string, unknown>>(properties) && path.lastIndexOf('/') === 0 ? properties[path.slice(1)] : undefined;
    if (!isPlainObject<Record<string, unknown>>(property)) throw new Error(`Inline input needs a top-level property: ${path}`);
    const presentation = isPlainObject<Record<string, unknown>>(property.presentation) ? property.presentation : {};
    property.presentation = { ...presentation, FormTypeInput: label === null ? null : getLabeledInput(label) };
  }
  return { ...scenario, schema };
}
