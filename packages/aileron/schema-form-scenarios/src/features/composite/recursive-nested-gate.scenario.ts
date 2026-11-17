import type { FormScenario } from '../../types';
import { treeSchema } from './cx14-recursive-conditions.scenario';

/** Regression (from CX-14): every instance of a recursive $ref applies its own if/then/else gate. */
export const recursiveNestedGateScenario: FormScenario = {
  name: 'composite.recursive-nested-gate',
  description: 'FRAGMENT-009 and FRAGMENT-003 gate then and else per node, and LANDING-018 keeps an inactive branch out of the shape and the output: in a recursive $ref tree a nested file shows no children list, and turning the middle folder into a file drops its children from the shape and the output, as the outermost instance does.',
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
