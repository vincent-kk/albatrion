import type { FieldInputProps } from '@/schema-form/types';

import { ArrayItems } from './components/ArrayItems';

/** Forward list-affecting props while each child retains its own value subscription. */
export const FieldInputArray = ({
  node,
  jsonSchema,
  readOnly,
  disabled,
  ChildFields,
  style,
  onChange,
}: FieldInputProps<any[]>) => (
  <ArrayItems
    node={node}
    jsonSchema={jsonSchema}
    readOnly={readOnly}
    disabled={disabled}
    ChildFields={ChildFields}
    style={style}
    onChange={onChange}
    childCount={node.children?.length ?? 0}
  />
);
