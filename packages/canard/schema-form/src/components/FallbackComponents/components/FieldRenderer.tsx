import type { CSSProperties } from 'react';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@/schema-form/types';

/** Smaller text for the error message under a field. */
const LABEL_NOTE_STYLE: CSSProperties = { fontSize: '0.85em' };

/** Space between the label text and the input. */
const LABEL_GAP_STYLE: CSSProperties = { marginRight: 5 };

/** Assemble the default group from bound parts while preserving branch accessibility. */
export const FieldRenderer = ({
  node,
  depth,
  path,
  Label,
  ErrorMessage,
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
        <legend id={'label:' + path}>{node.name}</legend>
        <div>
          {errorMessage != null && (
            <ErrorMessage style={LABEL_NOTE_STYLE}>{errorMessage}</ErrorMessage>
          )}
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
          <Label style={LABEL_GAP_STYLE} />
        )}
        <Input />
        <br />
        {errorMessage != null && (
          <ErrorMessage style={LABEL_NOTE_STYLE}>{errorMessage}</ErrorMessage>
        )}
      </div>
    );
  }
};
