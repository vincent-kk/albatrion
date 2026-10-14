import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputArrayDefinition } from './fieldInputDefinitions/FieldInputArray';
import { FieldInputBooleanDefinition } from './fieldInputDefinitions/FieldInputBoolean';
import { FieldInputDateFormatDefinition } from './fieldInputDefinitions/FieldInputDateFormat';
import { FieldInputNumberDefinition } from './fieldInputDefinitions/FieldInputNumber';
import { FieldInputObjectDefinition } from './fieldInputDefinitions/FieldInputObject';
import { FieldInputStringDefinition } from './fieldInputDefinitions/FieldInputString';
import { FieldInputStringCheckboxDefinition } from './fieldInputDefinitions/FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from './fieldInputDefinitions/FieldInputStringEnum';
import { FieldInputStringRadioDefinition } from './fieldInputDefinitions/FieldInputStringRadio';
import { FieldInputUnionDefinition } from './fieldInputDefinitions/FieldInputUnion';
import { FieldInputVirtualDefinition } from './fieldInputDefinitions/FieldInputVirtual';

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
