import type { FormScenario } from '../../types';
import { treeSchema } from './cx14-recursive-conditions.scenario';

/**
 * Finding (07c composite, from CX-14): inside a recursive $ref, the if/then/else gate of a nested instance is not applied;
 * the expectations state the ledger contract, so this scenario fails until fixed.
 */
export const recursiveNestedGateFindingScenario: FormScenario = {
  name: 'composite.finding-recursive-nested-gate',
  description: 'Finding: FRAGMENT-009 and FRAGMENT-003 gate then and else per node, and LANDING-018 keeps an inactive branch out of the shape and the output. In a recursive $ref tree the outermost instance follows its guard, but a nested instance draws both children and size: a file one level down still shows a children list, and turning the middle folder into a file keeps its children in the shape and in the output. A flat if/then/else and a $ref used once gate correctly.',
  schema: treeSchema,
  initialValue: { 'a/b~c': { kind: 'folder', children: [{ kind: 'folder', children: [{ kind: 'file', size: 1 }] }] } },
  steps: [
    { action: 'batch', steps: [], expect: { shape: { '/a~1b~0c/children/0/children/0/children': 'absent', '/a~1b~0c/children/0/size': 'absent' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/a~1b~0c/children/0/kind', value: 'file' }], expect: {
      shape: { '/a~1b~0c/children/0/children': 'absent', '/a~1b~0c/children/0/size': 'present' },
      outputValue: { 'a/b~c': { kind: 'folder', children: [{ kind: 'file' }] } },
    } },
  ],
};
