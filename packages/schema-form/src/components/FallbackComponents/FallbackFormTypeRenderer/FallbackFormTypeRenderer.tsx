import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FallbackFormTypeRenderer = ({
  depth,
  name,
  errors,
  Input,
  formatError,
}: FormTypeRendererProps) => {
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
