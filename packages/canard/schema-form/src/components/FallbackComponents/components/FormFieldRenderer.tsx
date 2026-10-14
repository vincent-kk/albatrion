import type { CSSProperties } from 'react';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@/schema-form/types';

/** Smaller text for the error message under a field. */
const LABEL_NOTE_STYLE: CSSProperties = { fontSize: '0.85em' };

/** Space between the label text and the input. */
const LABEL_GAP_STYLE: CSSProperties = { marginRight: 5 };

/** Red marker for a required field. */
const REQUIRED_MARK_STYLE: CSSProperties = { color: 'red' };

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
        <legend id={'label:' + path}>{node.name}</legend>
        <div>
          <em style={LABEL_NOTE_STYLE}>{errorMessage}</em>
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
          <label htmlFor={path} id={'label:' + path} style={LABEL_GAP_STYLE}>
            {name} {required && <span style={REQUIRED_MARK_STYLE}>*</span>}
          </label>
        )}
        <Input />
        <br />
        <em style={LABEL_NOTE_STYLE}>{errorMessage}</em>
      </div>
    );
  }
};
