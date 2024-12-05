import { useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

const FormTypeInputObject = ({ childNodes }: FormTypeInputProps<object>) => {
  const children = useMemo(() => {
    return (
      childNodes?.map((Node, index) => {
        return <Node key={Node.key || index} />;
      }) || null
    );
  }, [childNodes]);

  return <Fragment>{children}</Fragment>;
};

export const FormTypeInputObjectDefinition = {
  Component: FormTypeInputObject,
  test: { type: 'object' },
} satisfies FormTypeInputDefinition;
