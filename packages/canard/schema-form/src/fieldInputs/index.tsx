import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputArrayDefinition } from './components/FieldInputArray';
import { FieldInputBooleanDefinition } from './components/FieldInputBoolean';
import { FieldInputDateFormatDefinition } from './components/FieldInputDateFormat';
import { FieldInputNumberDefinition } from './components/FieldInputNumber';
import { FieldInputObjectDefinition } from './components/FieldInputObject';
import { FieldInputStringDefinition } from './components/FieldInputString';
import { FieldInputStringCheckboxDefinition } from './components/FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from './components/FieldInputStringEnum';
import { FieldInputStringRadioDefinition } from './components/FieldInputStringRadio';
import { FieldInputUnionDefinition } from './components/FieldInputUnion';
import { FieldInputVirtualDefinition } from './components/FieldInputVirtual';

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
