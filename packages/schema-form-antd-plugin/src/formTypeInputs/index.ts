import type { FormTypeInputDefinition } from '@lumy-pack/schema-form';

import { FormTypeInputArrayDefinition } from './FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from './FormTypeInputBoolean';
import { FormTypeInputBooleanSwitchDefinition } from './FormTypeInputBooleanSwitch';
import { FormTypeInputDateDefinition } from './FormTypeInputDate';
import { FormTypeInputDateRangeDefinition } from './FormTypeInputDateRange';
import { FormTypeInputMonthDefinition } from './FormTypeInputMonth';
import { FormTypeInputMonthRangeDefinition } from './FormTypeInputMonthRange';
import { FormTypeInputNumberDefinition } from './FormTypeInputNumber';
import { FormTypeInputRadioGroupDefinition } from './FormTypeInputRadioGroup';
import { FormTypeInputSliderDefinition } from './FormTypeInputSlider';
import { FormTypeInputStringDefinition } from './FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from './FormTypeInputStringCheckbox';
import { FormTypeInputStringEnumDefinition } from './FormTypeInputStringEnum';
import { FormTypeInputStringSwitchDefinition } from './FormTypeInputStringSwitch';
import { FormTypeInputTextareaDefinition } from './FormTypeInputTextarea';
import { FormTypeInputTimeDefinition } from './FormTypeInputTime';
import { FormTypeInputTimeRangeDefinition } from './FormTypeInputTimeRange';
import { FormTypeInputUriDefinition } from './FormTypeInputUri';

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  FormTypeInputBooleanSwitchDefinition,
  FormTypeInputStringCheckboxDefinition,
  FormTypeInputStringSwitchDefinition,
  FormTypeInputUriDefinition,
  FormTypeInputMonthDefinition,
  FormTypeInputDateDefinition,
  FormTypeInputTimeDefinition,
  FormTypeInputMonthRangeDefinition,
  FormTypeInputDateRangeDefinition,
  FormTypeInputTimeRangeDefinition,
  FormTypeInputRadioGroupDefinition,
  FormTypeInputStringEnumDefinition,
  FormTypeInputArrayDefinition,
  FormTypeInputSliderDefinition,
  FormTypeInputTextareaDefinition,
  FormTypeInputStringDefinition,
  FormTypeInputNumberDefinition,
  FormTypeInputBooleanDefinition,
];
