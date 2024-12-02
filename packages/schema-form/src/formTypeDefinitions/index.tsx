import type { FormTypeInputDefinition } from '@lumy/schema-form/types';

import { FormTypeInputArrayDefinition } from './FormTypeInputArray';
import { FormTypeInputBooleanDefinition } from './FormTypeInputBoolean';
import { FormTypeInputDateFormantDefinition } from './FormTypeInputDateFormant';
import { FormTypeInputNumberDefinition } from './FormTypeInputNumber';
import { FormTypeInputObjectDefinition } from './FormTypeInputObject';
import { FormTypeInputStringDefinition } from './FormTypeInputString';
import { FormTypeInputStringCheckboxDefinition } from './FormTypeInputStringCheckbox';
import { FormTypeInputStringEnumDefinition } from './FormTypeInputStringEnum';
import { FormTypeInputStringRadioDefinition } from './FormTypeInputStringRadio';
import { FormTypeInputVirtualDefinition } from './FormTypeInputVirtual';

export const formTypeDefinitions = [
  FormTypeInputArrayDefinition,
  FormTypeInputBooleanDefinition,
  FormTypeInputDateFormantDefinition,
  FormTypeInputNumberDefinition,
  FormTypeInputObjectDefinition,
  FormTypeInputStringDefinition,
  FormTypeInputStringCheckboxDefinition,
  FormTypeInputStringEnumDefinition,
  FormTypeInputStringRadioDefinition,
  FormTypeInputVirtualDefinition,
] satisfies FormTypeInputDefinition[];
