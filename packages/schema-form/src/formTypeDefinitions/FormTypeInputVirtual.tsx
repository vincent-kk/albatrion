import { Fragment } from 'react/jsx-runtime';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy-form/types';

const FormTypeInputVirtual = ({ childNodes }: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {childNodes &&
        childNodes.map((Node) => {
          return <Node key={Node.key} />;
        })}
    </Fragment>
  );
};

export const FormTypeInputVirtualDefinition = {
  Component: FormTypeInputVirtual,
  test: { type: 'virtual' },
} satisfies FormTypeInputDefinition;
