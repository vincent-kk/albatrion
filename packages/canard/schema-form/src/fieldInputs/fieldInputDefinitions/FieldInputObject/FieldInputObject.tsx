import { Fragment, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';

import type { FieldInputProps } from '@/schema-form/types';

/** Render an object node's child fields in order. */
export const FieldInputObject = ({ ChildFields }: FieldInputProps<object>) => {
  const children = useMemo(() => {
    return ChildFields
      ? map(ChildFields, (ChildField) => <ChildField key={ChildField.key} />)
      : null;
  }, [ChildFields]);

  return <Fragment>{children}</Fragment>;
};
