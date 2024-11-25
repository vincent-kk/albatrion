import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
import { normalizeFormTypeInputDefinitions } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

import { FormTypeInputArray } from './FormTypeInputArray';
import { FormTypeInputBoolean } from './FormTypeInputBoolean';
import { FormTypeInputDateFormant } from './FormTypeInputDateFormant';
import { FormTypeInputNumber } from './FormTypeInputNumber';
import { FormTypeInputObject } from './FormTypeInputObject';
import { FormTypeInputString } from './FormTypeInputString';
import { FormTypeInputStringCheckbox } from './FormTypeInputStringCheckbox';
import { FormTypeInputStringEnum } from './FormTypeInputStringEnum';
import { FormTypeInputStringRadio } from './FormTypeInputStringRadio';
import { FormTypeInputVirtual } from './FormTypeInputVirtual';

const formTypeDefinitions = [
  {
    Component: FormTypeInputStringCheckbox,
    test: ({ jsonSchema }) =>
      jsonSchema.type === 'array' &&
      jsonSchema.formType === 'checkbox' &&
      jsonSchema.items?.type === 'string' &&
      !!jsonSchema.items?.enum?.length,
  },
  {
    Component: FormTypeInputStringRadio,
    test: ({ jsonSchema }) =>
      jsonSchema.type === 'string' &&
      (jsonSchema.formType === 'radio' ||
        jsonSchema.formType === 'radiogroup') &&
      !!jsonSchema.enum?.length,
  },
  {
    Component: FormTypeInputStringEnum,
    test: ({ jsonSchema }) =>
      jsonSchema.type === 'string' && !!jsonSchema.enum?.length,
  },
  {
    Component: FormTypeInputDateFormant,
    test: ({ jsonSchema }) =>
      jsonSchema.type === 'string' &&
      jsonSchema.format &&
      ['month', 'week', 'date', 'time', 'datetime-local'].includes(
        jsonSchema.format,
      ),
  },
  {
    Component: FormTypeInputString,
    test: { type: 'string' },
  },
  {
    Component: FormTypeInputBoolean,
    test: { type: 'boolean' },
  },
  {
    Component: FormTypeInputNumber,
    test: { type: 'number' },
  },
  {
    Component: FormTypeInputObject,
    test: { type: 'object' },
  },
  {
    Component: FormTypeInputArray,
    test: { type: 'array' },
  },
  {
    Component: FormTypeInputVirtual,
    test: { type: 'virtual' },
  },
] satisfies FormTypeInputDefinition[];

export const fromFallbackFormTypeInputDefinitions =
  normalizeFormTypeInputDefinitions(formTypeDefinitions).map(
    ({ test, Component }) => {
      return {
        test,
        Component: (props: FormTypeInputProps) => (
          <ErrorBoundary>
            <Component {...props} />
          </ErrorBoundary>
        ),
      };
    },
  );
