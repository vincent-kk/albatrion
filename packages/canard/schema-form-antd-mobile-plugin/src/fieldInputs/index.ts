import type { FieldInputDefinition } from '@canard/schema-form';

import { FieldInputArrayDefinition } from './FieldInputArray';
import { FieldInputBooleanDefinition } from './FieldInputBoolean';
import { FieldInputBooleanSwitchDefinition } from './FieldInputBooleanSwitch';
import { FieldInputNumberDefinition } from './FieldInputNumber';
import { FieldInputRadioGroupDefinition } from './FieldInputRadioGroup';
import { FieldInputSliderDefinition } from './FieldInputSlider';
import { FieldInputStringDefinition } from './FieldInputString';
import { FieldInputStringCheckboxDefinition } from './FieldInputStringCheckbox';
import { FieldInputStringSwitchDefinition } from './FieldInputStringSwitch';
import { FieldInputTextareaDefinition } from './FieldInputTextarea';
import { FieldInputUnionDefinition } from './FieldInputUnion';

export const fieldInputDefinitions: FieldInputDefinition[] = [
  FieldInputBooleanSwitchDefinition,
  FieldInputStringCheckboxDefinition,
  FieldInputStringSwitchDefinition,
  FieldInputRadioGroupDefinition,
  FieldInputArrayDefinition,
  FieldInputSliderDefinition,
  FieldInputTextareaDefinition,
  FieldInputUnionDefinition,
  FieldInputStringDefinition,
  FieldInputNumberDefinition,
  FieldInputBooleanDefinition,
];
