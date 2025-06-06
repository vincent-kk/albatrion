import type { FormTypeInputDefinition } from '@canard/schema-form';

import { FormTypeInputArrayDefinition } from './FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from './FormTypeInputBoolean';
import { FormTypeInputBooleanSwitchDefinition } from './FormTypeInputBooleanSwitch';
import { FormTypeInputDateDefinition } from './FormTypeInputDate';
import { FormTypeInputMonthDefinition } from './FormTypeInputMonth';
import { FormTypeInputNumberDefinition } from './FormTypeInputNumber';
import { FormTypeInputRadioGroupDefinition } from './FormTypeInputRadioGroup';
import { FormTypeInputSliderDefinition } from './FormTypeInputSlider';
import { FormTypeInputStringDefinition } from './FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from './FormTypeInputStringCheckbox';
import { FormTypeInputStringEnumDefinition } from './FormTypeInputStringEnum';
import { FormTypeInputStringSwitchDefinition } from './FormTypeInputStringSwitch';
import { FormTypeInputTextareaDefinition } from './FormTypeInputTextarea';
import { FormTypeInputTimeDefinition } from './FormTypeInputTime';
import { FormTypeInputUriDefinition } from './FormTypeInputUri';

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  FormTypeInputBooleanSwitchDefinition,
  FormTypeInputStringCheckboxDefinition,
  FormTypeInputStringSwitchDefinition,
  FormTypeInputUriDefinition,
  FormTypeInputMonthDefinition,
  FormTypeInputDateDefinition,
  FormTypeInputTimeDefinition,
  FormTypeInputRadioGroupDefinition,
  FormTypeInputStringEnumDefinition,
  FormTypeInputArrayDefinition,
  FormTypeInputSliderDefinition,
  FormTypeInputTextareaDefinition,
  FormTypeInputStringDefinition,
  FormTypeInputNumberDefinition,
  FormTypeInputBooleanDefinition,
];
