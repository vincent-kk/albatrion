import { isBranchNode } from '@/schema-form/core';
import type { FormTypeRendererProps } from '@/schema-form/types';

export const FormGroupRenderer = ({
  node,
  depth,
  path,
  name,
  required,
  Input,
  errorMessage,
  style,
  className,
}: FormTypeRendererProps) => {
  if (depth === 0) return <Input />;

  if (isBranchNode(node)) {
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
        {node.parentNode?.type !== 'array' && (
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
