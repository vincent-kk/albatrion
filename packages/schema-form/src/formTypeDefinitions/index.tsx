import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
import {
  type NormalizedFormTypeInputDefinition,
  normalizeFormTypeInputDefinitions,
} from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

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

const formTypeDefinitions = [
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

export const fromFallbackFormTypeInputDefinitions =
  normalizeFormTypeInputDefinitions(
    formTypeDefinitions,
  ).map<NormalizedFormTypeInputDefinition>(({ test, Component }) => {
    return {
      test,
      Component: (props: FormTypeInputProps) => (
        <ErrorBoundary>
          <Component {...props} />
        </ErrorBoundary>
      ),
    };
  });
