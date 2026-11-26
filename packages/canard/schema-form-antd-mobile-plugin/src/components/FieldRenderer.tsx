import type { ReactElement } from 'react';

import { Space } from 'antd-mobile';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Assemble mobile parts without adding Space items for absent message children.
 * A nested branch and an array item show no visible title; for each of them a
 * hidden title carries `labelId` and the name (an array item's index) for the
 * input's `aria-labelledby`. A leaf under a non-array parent shows `Label`.
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

  const hiddenTitle = (
    <span hidden id={labelId}>
      {name}
    </span>
  );
  if (node.strategy === 'branch')
    return (
      <Space direction="vertical" block className={className} style={style}>
        {/* One Space item: a separate item for the hidden title would add a gap. */}
        <>
          {hiddenTitle}
          <Input readOnly={readOnly} disabled={disabled} />
        </>
        {error}
      </Space>
    );

  const titled = node.parentNode != null && !isArraySchema(node.parentNode);
  return (
    <Space direction="vertical" block className={className} style={style}>
      <div>
        {titled ? <Label /> : hiddenTitle}
        <Input readOnly={readOnly} disabled={disabled} />
      </div>
      {error}
    </Space>
  );
};
