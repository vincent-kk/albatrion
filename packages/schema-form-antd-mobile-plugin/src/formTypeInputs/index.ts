import type { FormTypeInputDefinition } from '@lumy-pack/schema-form';

import { FormTypeInputArrayDefinition } from './FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from './FormTypeInputBoolean';
import { FormTypeInputBooleanSwitchDefinition } from './FormTypeInputBooleanSwitch';
import { FormTypeInputNumberDefinition } from './FormTypeInputNumber';
import { FormTypeInputRadioGroupDefinition } from './FormTypeInputRadioGroup';
import { FormTypeInputSliderDefinition } from './FormTypeInputSlider';
import { FormTypeInputStringDefinition } from './FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from './FormTypeInputStringCheckbox';
import { FormTypeInputStringSwitchDefinition } from './FormTypeInputStringSwitch';
import { FormTypeInputTextareaDefinition } from './FormTypeInputTextarea';

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  FormTypeInputBooleanSwitchDefinition,
  FormTypeInputStringCheckboxDefinition,
  FormTypeInputStringSwitchDefinition,
  FormTypeInputRadioGroupDefinition,
  FormTypeInputArrayDefinition,
  FormTypeInputSliderDefinition,
  FormTypeInputTextareaDefinition,
  FormTypeInputStringDefinition,
  FormTypeInputNumberDefinition,
  FormTypeInputBooleanDefinition,
];
