import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputArrayDefinition } from './FieldInputArray';
import { FieldInputBooleanDefinition } from './FieldInputBoolean';
import { FieldInputDateFormatDefinition } from './FieldInputDateFormat';
import { FieldInputNumberDefinition } from './FieldInputNumber';
import { FieldInputObjectDefinition } from './FieldInputObject';
import { FieldInputStringDefinition } from './FieldInputString';
import { FieldInputStringCheckboxDefinition } from './FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from './FieldInputStringEnum';
import { FieldInputStringRadioDefinition } from './FieldInputStringRadio';
import { FieldInputUnionDefinition } from './FieldInputUnion';
import { FieldInputVirtualDefinition } from './FieldInputVirtual';

/** Ordered default input fallbacks; union precedes the ordinary string definition. */
export const builtinFieldInputDefinitions = [
  FieldInputDateFormatDefinition,
  FieldInputStringCheckboxDefinition,
  FieldInputStringRadioDefinition,
  FieldInputStringEnumDefinition,
  FieldInputVirtualDefinition,
  FieldInputArrayDefinition,
  FieldInputObjectDefinition,
  FieldInputBooleanDefinition,
  FieldInputUnionDefinition,
  FieldInputStringDefinition,
  FieldInputNumberDefinition,
] satisfies FieldInputDefinition[];
