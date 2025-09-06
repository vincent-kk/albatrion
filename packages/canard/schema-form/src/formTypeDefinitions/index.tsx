import type { FormTypeInputDefinition } from '@/schema-form/types';

import { FormTypeInputArrayDefinition } from './FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from './FormTypeInputBoolean';
import { FormTypeInputDateFormatDefinition } from './FormTypeInputDateFormat';
import { FormTypeInputNumberDefinition } from './FormTypeInputNumber';
import { FormTypeInputObjectDefinition } from './FormTypeInputObject';
import { FormTypeInputStringDefinition } from './FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from './FormTypeInputStringCheckbox';
import { FormTypeInputStringEnumDefinition } from './FormTypeInputStringEnum';
import { FormTypeInputStringRadioDefinition } from './FormTypeInputStringRadio';
import { FormTypeInputVirtualDefinition } from './FormTypeInputVirtual';

export const formTypeDefinitions = [
  FormTypeInputDateFormatDefinition,
  FormTypeInputStringCheckboxDefinition,
  FormTypeInputStringRadioDefinition,
  FormTypeInputStringEnumDefinition,
  FormTypeInputVirtualDefinition,
  FormTypeInputArrayDefinition,
  FormTypeInputObjectDefinition,
  FormTypeInputBooleanDefinition,
  FormTypeInputStringDefinition,
  FormTypeInputNumberDefinition,
] satisfies FormTypeInputDefinition[];
