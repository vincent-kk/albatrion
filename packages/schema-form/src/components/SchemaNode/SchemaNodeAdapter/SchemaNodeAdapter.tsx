import { Fragment, useEffect, useState } from 'react';

import { MethodType } from '@/schema-form/core';

import { SchemaNodeAdapterRow } from './SchemaNodeAdapterRow';
import type { SchemaNodeAdapterProps } from './type';

export const SchemaNodeAdapter = ({
  node,
  readOnly,
  disabled,
  watchValues,
  overridableProps,
  PreferredFormTypeInput,
  NodeProxy,
}: SchemaNodeAdapterProps) => {
  const [children, setChildren] = useState<typeof node.children>(node.children);

  useEffect(() => {
    const unsubscribe = node.subscribe(({ type }) => {
      if (type === MethodType.ChildrenChange) setChildren(node.children);
    });
    return () => unsubscribe();
  }, [node]);

  return (
    <Fragment>
      <SchemaNodeAdapterRow
        node={node}
        readOnly={readOnly}
        disabled={disabled}
        watchValues={watchValues}
        rawChildNodes={children}
        overridableProps={overridableProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        NodeProxy={NodeProxy}
      />
    </Fragment>
  );
};
