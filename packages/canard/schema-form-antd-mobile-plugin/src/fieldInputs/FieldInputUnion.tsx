import { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import {
  type FieldInputDefinition,
  type FieldInputProps,
  interpretFieldNodeDraft,
} from '@canard/schema-form';

import { readEffectiveTypes } from './utils/readEffectiveTypes';
import { readUnionDisplay } from './utils/readUnionDisplay';

const FieldInputUnion = ({
  node,
  path,
  name,
  value,
  nullable,
  schemaType,
  jsonSchema,
  readOnly,
  disabled,
  onChange,
  placeholder,
  misfit,
}: FieldInputProps) => {
  const display = useMemo(
    () => readUnionDisplay(value, nullable),
    [value, nullable],
  );
  const effectiveTypes = useMemo(
    () => readEffectiveTypes(schemaType, jsonSchema),
    [schemaType, jsonSchema],
  );
  const effectiveKey = effectiveTypes.join(',');
  const editable =
    !display.structured &&
    effectiveTypes.some(
      (kind) =>
        kind === 'string' ||
        kind === 'number' ||
        kind === 'integer' ||
        kind === 'boolean',
    );
  const [text, setText] = useState(display.text);
  const draft = useRef<string | undefined>(undefined);
  const composing = useRef(false);
  const publish = useHandle((next: string) => {
    if (composing.current || !editable || readOnly || disabled) return false;
    const result = interpretFieldNodeDraft(
      node,
      next === '' ? undefined : next,
    );
    if (!result.isMember) return false;
    onChange(result.value);
    return true;
  });
  const handleChange = useHandle((next: string) => {
    draft.current = next;
    setText(draft.current);
    publish(draft.current);
  });
  useEffect(() => {
    if (draft.current === undefined) setText(display.text);
  }, [display.text]);
  useEffect(() => {
    if (draft.current !== undefined) publish(draft.current);
  }, [effectiveKey, publish]);
  const invalid = misfit || display.invalid;
  return (
    <div role="group" aria-invalid={invalid || undefined}>
      <Input
        id={path}
        name={name}
        value={text}
        readOnly={readOnly || !editable}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          draft.current = event.currentTarget.value;
          setText(draft.current);
          publish(draft.current);
        }}
        onBlur={() => {
          if (composing.current) return;
          if (draft.current !== undefined && !publish(draft.current)) {
            draft.current = undefined;
            setText(readUnionDisplay(node.value, nullable).text);
          }
        }}
      />
    </div>
  );
};

export const FieldInputUnionDefinition = {
  Component: FieldInputUnion,
  test: {
    type: 'union',
  },
} satisfies FieldInputDefinition;
