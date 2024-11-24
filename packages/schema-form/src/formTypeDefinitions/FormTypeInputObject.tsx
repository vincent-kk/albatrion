import { Fragment } from 'react/jsx-runtime';

import type { FormTypeInputProps } from '@lumy/schema-form/types';

export const FormTypeInputObject = ({
  childNodes,
}: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {childNodes &&
        childNodes.map((Node) => {
          return <Node key={Node.key} />;
        })}
    </Fragment>
  );
};
