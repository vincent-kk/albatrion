import { Fragment } from 'react/jsx-runtime';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

const FormTypeInputObject = ({ childNodes }: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {childNodes &&
        childNodes.map((Node) => {
          return <Node key={Node.key} />;
        })}
    </Fragment>
  );
};

export const FormTypeInputObjectDefinition = {
  Component: FormTypeInputObject,
  test: { type: 'object' },
} satisfies FormTypeInputDefinition;
