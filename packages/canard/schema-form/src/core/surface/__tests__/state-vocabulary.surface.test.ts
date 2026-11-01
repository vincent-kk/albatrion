import { expect, it } from 'vitest';

import { FieldNodeState } from '../../engine';
import { FieldNode } from '../runtime/FieldNode';

it('runtime property names and enum keys expose the new vocabulary without aliases', () => {
  const names = Object.getOwnPropertyNames(FieldNode.prototype);
  for (const name of [
    'isRequired',
    'isActive',
    'isVisible',
    'isPresent',
    'isReadOnly',
    'isDisabled',
    'isMisfit',
    'isEdited',
    'isTouched',
    'isDivergent',
  ])
    expect(names).toContain(name);
  for (const name of [
    'required',
    'active',
    'visible',
    'enabled',
    'readOnly',
    'disabled',
    'misfit',
  ])
    expect(names).not.toContain(name);
  expect(FieldNodeState).toHaveProperty('Edited', 1);
  expect(FieldNodeState).not.toHaveProperty('Dirty');
});
