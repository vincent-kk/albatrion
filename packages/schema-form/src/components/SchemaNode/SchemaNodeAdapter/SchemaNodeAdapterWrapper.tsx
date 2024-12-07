import { type ComponentType, Fragment, type MutableRefObject } from 'react';

import { useSnapshot } from '@lumy-pack/common-react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type { OverridableFormTypeInputProps } from '@lumy/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';
import { SchemaNodeAdapter } from './SchemaNodeAdapter';
import type { PropsPackage } from './type';

export const SchemaNodeAdapterWrapper = (
  node: SchemaNode | null,
  propsRef: MutableRefObject<PropsPackage>,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
) => {
  return function SchemaNodeAdapterWrapperInner(
    preferredProps: OverridableFormTypeInputProps,
  ) {
    const overridableProps = useSnapshot({
      ...propsRef.current.overridableProps,
      ...preferredProps,
    });
    const watchValues = useSnapshot(propsRef.current.watchValues);

    if (!node) {
      return <Fragment />;
    }
    return (
      <SchemaNodeAdapter
        node={node}
        watchValues={watchValues}
        overridableProps={overridableProps}
        gridFrom={propsRef.current.gridFrom}
        disabled={propsRef.current.disabled}
        readOnly={propsRef.current.readOnly}
        PreferredFormTypeInput={propsRef.current.PreferredFormTypeInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
