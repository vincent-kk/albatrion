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
      <label>
        <span>{name}</span>
        <Input />
      </label>
      <br />
      <em>{errors && errors.length > 0 && formatError?.(errors[0])}</em>
    </div>
  );
};
