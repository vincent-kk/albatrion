import { Fragment } from 'react';

import { map } from '@winglet/common-utils/array';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

const FieldInputVirtual = ({ ChildFields }: FieldInputProps<object>) => {
  return (
    <Fragment>
      {ChildFields &&
        map(ChildFields, (ChildField) => <ChildField key={ChildField.key} />)}
    </Fragment>
  );
};

export const FieldInputVirtualDefinition = {
  Component: FieldInputVirtual,
  test: { type: 'virtual' },
} satisfies FieldInputDefinition;
