import { Fragment } from 'react';

import { map } from '@winglet/common-utils/array';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

const FieldInputVirtual = ({
  ChildNodeComponents,
}: FieldInputProps<object>) => {
  return (
    <Fragment>
      {ChildNodeComponents &&
        map(ChildNodeComponents, (ChildNodeComponent) => (
          <ChildNodeComponent key={ChildNodeComponent.key} />
        ))}
    </Fragment>
  );
};

export const FieldInputVirtualDefinition = {
  Component: FieldInputVirtual,
  test: { type: 'virtual' },
} satisfies FieldInputDefinition;
