import type { SchemaNodeRendererProps } from '@lumy/schema-form/types';

export const FallbackSchemaNodeRenderer = ({
  depth,
  name,
  errors,
  Input,
  formatError,
}: SchemaNodeRendererProps) => {
  return depth === 0 ? (
    <Input />
  ) : (
    <div>
      <label>{name}</label>
      <Input />
      {errors && errors.length > 0 && (
        <ul>
          {errors.map((error) => (
            <li key={error.message}>{formatError?.(error) ?? error.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
