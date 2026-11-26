import type { ReactElement } from 'react';

import { Space } from 'antd-mobile';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Assemble mobile parts without adding Space items for absent message children.
 * A nested branch shows no visible title; under a non-array parent a hidden
 * title carries `labelId` and the name for the branch input's `aria-labelledby`.
 * @param props - Bound field parts, node strategy, indentation depth and title address.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  depth,
  name,
  labelId,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
  readOnly,
  disabled,
  className,
  style,
}: FieldRendererProps): ReactElement => {
  const error =
    errorMessage != null &&
    (errorMessage !== '' || (depth > 0 && node.strategy !== 'branch')) &&
    typeof errorMessage !== 'boolean' ? (
      <ErrorMessage>{errorMessage}</ErrorMessage>
    ) : null;
  if (depth === 0)
    return (
      <>
        <Input
          readOnly={readOnly}
          disabled={disabled}
          {...(className != null && { className })}
          {...(style != null && { style })}
        />
        {error}
      </>
    );

  const titled = node.parentNode != null && !isArraySchema(node.parentNode);
  if (node.strategy === 'branch')
    return (
      <Space direction="vertical" block className={className} style={style}>
        {/* One Space item: a separate item for the hidden title would add a gap. */}
        <>
          {titled && (
            <span hidden id={labelId}>
              {name}
            </span>
          )}
          <Input readOnly={readOnly} disabled={disabled} />
        </>
        {error}
      </Space>
    );

  return (
    <Space direction="vertical" block className={className} style={style}>
      <div>
        {titled && <Label />}
        <Input readOnly={readOnly} disabled={disabled} />
      </div>
      {error}
    </Space>
  );
};
