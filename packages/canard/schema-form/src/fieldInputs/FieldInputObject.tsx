import { Fragment, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

const FieldInputObject = ({ ChildFields }: FieldInputProps<object>) => {
  const children = useMemo(() => {
    return ChildFields
      ? map(ChildFields, (ChildField) => <ChildField key={ChildField.key} />)
      : null;
  }, [ChildFields]);

  return <Fragment>{children}</Fragment>;
};

export const FieldInputObjectDefinition = {
  Component: FieldInputObject,
  test: { type: 'object' },
} satisfies FieldInputDefinition;
