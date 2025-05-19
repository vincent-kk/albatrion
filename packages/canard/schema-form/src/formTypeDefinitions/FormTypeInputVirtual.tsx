import { Fragment } from 'react/jsx-runtime';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputVirtual = ({
  ChildComponents,
}: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {ChildComponents &&
        map(ChildComponents, (ChildComponent) => (
          <ChildComponent key={ChildComponent.key} />
        ))}
    </Fragment>
  );
};

export const FormTypeInputVirtualDefinition = {
  Component: FormTypeInputVirtual,
  test: { type: 'virtual' },
} satisfies FormTypeInputDefinition;
