import { Fragment, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

const FieldInputObject = ({ ChildNodeComponents }: FieldInputProps<object>) => {
  const children = useMemo(() => {
    return ChildNodeComponents
      ? map(ChildNodeComponents, (ChildNodeComponent) => (
          <ChildNodeComponent key={ChildNodeComponent.key} />
        ))
      : null;
  }, [ChildNodeComponents]);

  return <Fragment>{children}</Fragment>;
};

export const FieldInputObjectDefinition = {
  Component: FieldInputObject,
  test: { type: 'object' },
} satisfies FieldInputDefinition;
