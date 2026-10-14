import { isArraySchema } from '@winglet/json-schema/filter';

import { isFieldInputGroup } from '@/schema-form/helpers/fieldInputGroup';
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

  const isGroup = isFieldInputGroup(node.jsonSchema);
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
        <legend id={isGroup ? `${path}-label` : undefined}>{node.name}</legend>
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
          <label
            htmlFor={isGroup ? undefined : path}
            id={isGroup ? `${path}-label` : undefined}
            style={{ marginRight: 5 }}
          >
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
