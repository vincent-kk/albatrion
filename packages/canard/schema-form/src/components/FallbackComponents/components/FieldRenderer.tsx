import type { ReactElement } from 'react';
import type { CSSProperties } from 'react';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@/schema-form/types';

/** Smaller text for the error message under a field. */
const LABEL_NOTE_STYLE: CSSProperties = { fontSize: '0.85em' };

/** Space between the label text and the input. */
const LABEL_GAP_STYLE: CSSProperties = { marginRight: 5 };

/**
 * Assemble the default group from bound parts while preserving branch accessibility.
 * A branch shows its name in a legend carrying `labelId`. A leaf under a non-array
 * parent shows `Label`; an array item leaf instead gets a hidden title carrying
 * `labelId` and its index for the inputs that reference it through `aria-labelledby`.
 * @param props - Bound field parts, node strategy, indentation depth and title address.
 * @returns The input alone at the root, otherwise the titled group.
 */
export const FieldRenderer = ({
  node,
  depth,
  labelId,
  Label,
  ErrorMessage,
  Input,
  errorMessage,
  style,
  className,
}: FieldRendererProps): ReactElement => {
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
        <legend id={labelId}>{node.name}</legend>
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
        {node.parentNode && isArraySchema(node.parentNode) === false ? (
          <Label style={LABEL_GAP_STYLE} />
        ) : (
          <span hidden id={labelId}>
            {node.name}
          </span>
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
