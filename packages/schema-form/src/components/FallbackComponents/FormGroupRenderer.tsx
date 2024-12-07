import { isBranchNode } from '@lumy-form/core';
import type { FormTypeRendererProps } from '@lumy-form/types';

export const FormGroupRenderer = ({
  node,
  depth,
  path,
  name,
  Input,
  errorMessage,
}: FormTypeRendererProps) => {
  if (depth === 0) return <Input />;

  if (isBranchNode(node)) {
    return (
      <fieldset
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
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
        }}
      >
        {node.parentNode?.type !== 'array' && (
          <label htmlFor={path} style={{ marginRight: 5 }}>
            {name}
          </label>
        )}
        <Input />
        <br />
        <em style={{ fontSize: '0.85em' }}>{errorMessage}</em>
      </div>
    );
  }
};
