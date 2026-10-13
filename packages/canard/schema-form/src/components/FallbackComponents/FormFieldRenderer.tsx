import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@/schema-form/types';

export const FormFieldRenderer = ({
  node,
  depth,
  path,
  name,
  required,
  Input,
  errorMessage,
  style,
  className,
}: FieldRendererProps) => {
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <fieldset
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
          ...style,
        }}
        className={className}
      >
        <legend>{node.name}</legend>
        <div>
          <em style={{ fontSize: '0.85em' }}>{errorMessage}</em>
        </div>
        <div>
          <Input />
        </div>
      </fieldset>
    );
  } else {
    return (
      <div
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
          ...style,
        }}
        className={className}
      >
        {node.parentNode && isArraySchema(node.parentNode) === false && (
          <label htmlFor={path} style={{ marginRight: 5 }}>
            {name} {required && <span style={{ color: 'red' }}>*</span>}
          </label>
        )}
        <Input />
        <br />
        <em style={{ fontSize: '0.85em' }}>{errorMessage}</em>
      </div>
    );
  }
};
