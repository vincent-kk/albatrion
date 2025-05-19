import { useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputObject = ({
  ChildComponents,
}: FormTypeInputProps<object>) => {
  const children = useMemo(() => {
    return ChildComponents
      ? map(ChildComponents, (ChildComponent, index) => (
          <ChildComponent key={ChildComponent.key || index} />
        ))
      : null;
  }, [ChildComponents]);

  return <Fragment>{children}</Fragment>;
};

export const FormTypeInputObjectDefinition = {
  Component: FormTypeInputObject,
  test: { type: 'object' },
} satisfies FormTypeInputDefinition;
