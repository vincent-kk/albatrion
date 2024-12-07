import {
  type ComponentType,
  type MutableRefObject,
  memo,
  useMemo,
} from 'react';

import { isReactComponent, useSnapshot } from '@lumy-pack/common-react';

import type { SchemaNode } from '@/schema-form/core';
import type { OverridableFormTypeInputProps } from '@/schema-form/types';

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

    const PreferredFormTypeInput = useMemo(() => {
      return isReactComponent(propsRef.current.PreferredFormTypeInput)
        ? memo(propsRef.current.PreferredFormTypeInput)
        : undefined;
    }, []);

    if (!node) return null;

    return (
      <SchemaNodeAdapter
        node={node}
        gridFrom={propsRef.current.gridFrom}
        disabled={propsRef.current.disabled}
        readOnly={propsRef.current.readOnly}
        watchValues={watchValues}
        overridableProps={overridableProps}
        PreferredFormTypeInput={PreferredFormTypeInput}
        NodeProxy={NodeProxy}
      />
    );
  };
};
