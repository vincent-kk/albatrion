import { withErrorBoundary } from '@winglet/react-utils/hoc';

import { useSchemaNode } from '@/schema-form/hooks/useSchemaNode';
import {
  FormErrorPathContext,
  useBoundaryReporter,
} from '@/schema-form/providers/FormErrorContext';

import { SchemaNodeField } from './components/SchemaNodeField';
import type { SchemaNodeProxyProps } from './type';

/** Field computation and injected formatter errors share the field's boundary. */
const BoundedField = withErrorBoundary(
  SchemaNodeField,
  undefined,
  useBoundaryReporter,
);

/** Resolve a node and isolate its rendering without retiring sibling fields. */
export const SchemaNodeProxy = (props: SchemaNodeProxyProps) => {
  const node = useSchemaNode(props.node || props.path);
  if (!node) return null;
  return (
    <FormErrorPathContext.Provider value={node.path}>
      <BoundedField {...props} node={node} NodeProxy={SchemaNodeProxy} />
    </FormErrorPathContext.Provider>
  );
};
