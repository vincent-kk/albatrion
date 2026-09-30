import { describe, expect, it } from 'vitest';

import type { FormScenario } from '@aileron/schema-form-scenarios';
import type { BlueprintSchema } from '../../blueprint';

import { SetValueOption } from '../../types/value';
import { ifPredicate } from '../ifPredicate';
import { writeSchemaNode } from '../../settle';
import { createTestTree } from '../../settle/__tests__/fixtures/createTestTree';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-runner
describe('core effective-list scenario', () => {
  it('WRITE-099 E26 keeps the un-narrowed effective list identical to scalar schemaType', async () => {
    const schema: BlueprintSchema = { type: 'object',
      properties: { enabled: { type: 'boolean' }, a: { type: 'number' } },
      if: {}, then: { properties: { a: { type: ['number', 'string'] } } },
    };
    const scenario: FormScenario = {
      name: 'WRITE-099 E26 effective list',
      schema,
      steps: [
        { action: 'setValue', path: '', value: { enabled: false, a: 2 },
          expect: { outputValue: { enabled: false, a: 2 } } },
        { action: 'setValue', path: '/enabled', value: true,
          expect: { outputValue: { enabled: true, a: 2 } } },
      ],
    };
    const { root } = createTestTree(schema, ifPredicate);
    const result = await runScenario(scenario, {
      execute: (step) => {
        if (step.action === 'setValue')
          writeSchemaNode(step.path === '' ? root : root.structure!.enabled,
            step.value, step.path === '' ? 'callerReplace' : 'input',
            SetValueOption.Overwrite);
      },
      assert: (expected) => {
        expect(root.emit).toEqual(expected.outputValue);
        expect(root.structure?.a?.schemaType).toBe('number');
        expect(root.structure?.a?.schema.schema).toMatchObject({ type: 'number' });
        const effective = root.structure?.a?.schema.schema;
        if (effective === null || typeof effective !== 'object' ||
          !('type' in effective)) throw new Error('Missing E26 effective type');
        expect(effective.type).toBe(root.structure?.a?.schemaType);
      },
    });
    expect(result.executedSteps).toBe(2);
  });
});
