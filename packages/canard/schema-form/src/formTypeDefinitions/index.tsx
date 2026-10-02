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
import { FormTypeInputUnionDefinition } from './FormTypeInputUnion';

/** Ordered default input fallbacks; union precedes the ordinary string definition. */
export const formTypeDefinitions = [
  FormTypeInputDateFormatDefinition,
  FormTypeInputStringCheckboxDefinition,
  FormTypeInputStringRadioDefinition,
  FormTypeInputStringEnumDefinition,
  FormTypeInputVirtualDefinition,
  FormTypeInputArrayDefinition,
  FormTypeInputObjectDefinition,
  FormTypeInputBooleanDefinition,
  FormTypeInputUnionDefinition,
  FormTypeInputStringDefinition,
  FormTypeInputNumberDefinition,
] satisfies FormTypeInputDefinition[];
