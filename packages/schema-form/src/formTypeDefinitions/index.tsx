import { ErrorBoundary } from '@lumy/schema-form/components/utils/ErrorBoundary';
import { normalizeFormTypeInputDefinitions } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

import { FormTypeInputArray } from './FormTypeInputArray';
import { FormTypeInputBoolean } from './FormTypeInputBoolean';
import { FormTypeInputNumber } from './FormTypeInputNumber';
import { FormTypeInputObject } from './FormTypeInputObject';
import { FormTypeInputString } from './FormTypeInputString';
import { FormTypeInputStringEnum } from './FormTypeInputStringEnum';
import { FormTypeInputVirtual } from './FormTypeInputVirtual';

const formTypeDefinitions = [
  {
    Component: FormTypeInputArray,
    test: { type: 'array' },
  },
  {
    Component: FormTypeInputObject,
    test: { type: 'object' },
  },
  {
    Component: FormTypeInputVirtual,
    test: { type: 'virtual' },
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
    Component: FormTypeInputStringEnum,
    test: ({ jsonSchema }) =>
      jsonSchema.type === 'string' && !!jsonSchema.enum?.length,
  },
  {
    Component: FormTypeInputString,
    test: { type: 'string' },
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
