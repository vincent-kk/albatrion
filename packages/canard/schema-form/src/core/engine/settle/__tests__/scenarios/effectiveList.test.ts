import { describe, expect, it } from 'vitest';

import type { FormScenario } from '@aileron/schema-form-scenarios';

import { runScenario } from '@/schema-form/core/__tests__/scenarios/utils/runScenario';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { writeFieldNode } from '../../utils/write/writeFieldNode';

// filid:contract scenario-runner-effective-list
describe('core effective-list scenario', () => {
  it('WRITE-099 E26 keeps the un-narrowed effective list identical to scalar schemaType', async () => {
    const schema: BlueprintSchema = {
      type: 'object',
      properties: { enabled: { type: 'boolean' }, a: { type: 'number' } },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { properties: { a: { type: ['number', 'string'] } } },
    };
    const scenario: FormScenario = {
      name: 'WRITE-099 E26 effective list',
      schema,
      steps: [
        {
          action: 'setValue',
          path: '',
          value: { enabled: false, a: 2 },
          expect: { outputValue: { enabled: false, a: 2 } },
        },
        {
          action: 'setValue',
          path: '/enabled',
          value: true,
          expect: { outputValue: { enabled: true, a: 2 } },
        },
      ],
    };
    const { root } = createTestTree(schema);
    const result = await runScenario(scenario, {
      execute: (step) => {
        if (step.action === 'setValue')
          writeFieldNode(
            step.path === '' ? root : root.__childrenByName__!.enabled,
            step.value,
            step.path === ''
              ? FieldNodeWriteKind.CallerReplace
              : FieldNodeWriteKind.Input,
            WriteOption.Overwrite,
          );
      },
      assert: (expected) => {
        expect(root.__outputValue__).toEqual(expected.outputValue);
        expect(root.__childrenByName__?.a?.schemaType).toBe('number');
        expect(root.__childrenByName__?.a?.__schema__.schema).toMatchObject({
          type: 'number',
        });
        const effective = root.__childrenByName__?.a?.__schema__.schema;
        if (
          effective === null ||
          typeof effective !== 'object' ||
          !('type' in effective)
        )
          throw new Error('Missing E26 effective type');
        expect(effective.type).toBe(root.__childrenByName__?.a?.schemaType);
      },
    });
    expect(result.executedSteps).toBe(2);
  });
});
