import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputArrayDefinition } from './fieldInputDefinitions/FieldInputArray/FieldInputArray';
import { FieldInputBooleanDefinition } from './fieldInputDefinitions/FieldInputBoolean/FieldInputBoolean';
import { FieldInputDateFormatDefinition } from './fieldInputDefinitions/FieldInputDateFormat/FieldInputDateFormat';
import { FieldInputNumberDefinition } from './fieldInputDefinitions/FieldInputNumber/FieldInputNumber';
import { FieldInputObjectDefinition } from './fieldInputDefinitions/FieldInputObject/FieldInputObject';
import { FieldInputStringDefinition } from './fieldInputDefinitions/FieldInputString/FieldInputString';
import { FieldInputStringCheckboxDefinition } from './fieldInputDefinitions/FieldInputStringCheckbox/FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from './fieldInputDefinitions/FieldInputStringEnum/FieldInputStringEnum';
import { FieldInputStringRadioDefinition } from './fieldInputDefinitions/FieldInputStringRadio/FieldInputStringRadio';
import { FieldInputUnionDefinition } from './fieldInputDefinitions/FieldInputUnion/FieldInputUnion';
import { FieldInputVirtualDefinition } from './fieldInputDefinitions/FieldInputVirtual/FieldInputVirtual';

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
