import type { FieldInputDefinition } from '@canard/schema-form';

import { FieldInputArrayDefinition } from './FieldInputArray';
import { FieldInputBooleanDefinition } from './FieldInputBoolean';
import { FieldInputBooleanSwitchDefinition } from './FieldInputBooleanSwitch';
import { FieldInputDateDefinition } from './FieldInputDate';
import { FieldInputMonthDefinition } from './FieldInputMonth';
import { FieldInputNumberDefinition } from './FieldInputNumber';
import { FieldInputRadioGroupDefinition } from './FieldInputRadioGroup';
import { FieldInputSliderDefinition } from './FieldInputSlider';
import { FieldInputStringDefinition } from './FieldInputString';
import { FieldInputStringCheckboxDefinition } from './FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from './FieldInputStringEnum';
import { FieldInputStringSwitchDefinition } from './FieldInputStringSwitch';
import { FieldInputTextareaDefinition } from './FieldInputTextarea';
import { FieldInputTimeDefinition } from './FieldInputTime';
import { FieldInputUnionDefinition } from './FieldInputUnion';
import { FieldInputUriDefinition } from './FieldInputUri';

export const fieldInputDefinitions: FieldInputDefinition[] = [
  FieldInputBooleanSwitchDefinition,
  FieldInputStringCheckboxDefinition,
  FieldInputStringSwitchDefinition,
  FieldInputUriDefinition,
  FieldInputMonthDefinition,
  FieldInputDateDefinition,
  FieldInputTimeDefinition,
  FieldInputRadioGroupDefinition,
  FieldInputStringEnumDefinition,
  FieldInputArrayDefinition,
  FieldInputSliderDefinition,
  FieldInputTextareaDefinition,
  FieldInputUnionDefinition,
  FieldInputStringDefinition,
  FieldInputNumberDefinition,
  FieldInputBooleanDefinition,
];
