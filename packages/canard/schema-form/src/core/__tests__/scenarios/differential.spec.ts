// Same-ajv path comparison: form validation versus direct Ajv on the authored schema.
// The cross-implementation oracle (TEST-001) awaits a non-ajv validator plugin.
import { validationScenarios } from '@aileron/schema-form-scenarios';
import Ajv from 'ajv';
import type { AnySchema } from 'ajv';
import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../SchemaNode';
import type { SchemaNode as RuntimeSchemaNode } from '../../SchemaNode/SchemaNode';
import { loadSchemaNodeAtMount } from '../../settle';
import { ValidationMode } from '../../types/state';
import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const uniquePaths = (paths: string[]): string[] => paths
  .filter((path, index) => paths.indexOf(path) === index).sort();

// filid:contract scenario-differential
describe('same-ajv path comparison on the core node tree', () => {
  it.each(validationScenarios)('$name', async (scenario) => {
    const direct = new Ajv({ strict: false, allErrors: true,
      validateSchema: false });
    const validateDirect = direct.compile(scenario.schema as AnySchema);
    const { root, runtime } = makeSchemaNodeTree(scenario.schema as BlueprintSchema);
    Reflect.set(runtime, 'validationMode', ValidationMode.OnRequest);
    loadSchemaNodeAtMount(root as RuntimeSchemaNode, scenario.initialValue,
      SetValueOption.Overwrite);

    for (const step of scenario.steps) {
      if (step.action !== 'setValue')
        throw new Error(`Unsupported path comparison step: ${step.action}`);
      const node = root.find(step.path);
      if (!node) throw new Error(`Missing scenario node: ${step.path}`);
      node.setValue(step.value);
      const issues = await root.validate();
      const emitted = JSON.parse(JSON.stringify(root.outputValue));
      const directValid = validateDirect(emitted);

      expect(issues.length === 0).toBe(directValid);
      expect(directValid).toBe(false);
      expect(uniquePaths(issues.map((issue) => issue.dataPath)))
        .toEqual(uniquePaths((validateDirect.errors ?? [])
          .map((error) => error.instancePath)));
      if (step.expect?.outputValue !== undefined)
        expect(emitted).toEqual(step.expect.outputValue);
      if (scenario.name === 'validation.if-only-oneof-invalid')
        expect(issues.map((issue) => issue.keyword)).toContain('oneOf');
      if (scenario.name === 'validation.union-type-error-on-node')
        expect(root.find('/choice')?.errors).toContainEqual(
          expect.objectContaining({ keyword: 'type', dataPath: '/choice' }),
        );
    }
  });
});
