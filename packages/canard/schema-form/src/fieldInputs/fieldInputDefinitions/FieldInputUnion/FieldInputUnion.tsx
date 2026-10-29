import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { isArray } from '@winglet/common-utils/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type { Optional } from '@aileron/declare';

import { interpretFieldNodeDraft } from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types';

import { FieldInputString } from '../FieldInputString';
import { readUnionDisplay } from './utils/readUnionDisplay';

/** Wrap the string fallback with a local draft interpreted only against live union types. */

export const FieldInputUnion = (props: FieldInputProps) => {
  const { node, value, nullable, schemaType, jsonSchema, misfit } = props;
  const display = useMemo(
    () => readUnionDisplay(value, nullable),
    [value, nullable],
  );

  const effectiveTypes = useMemo(() => {
    const authored = isArray(schemaType) ? schemaType : [schemaType];
    const type = jsonSchema.type;
    const effective: readonly string[] = isArray(type)
      ? type
      : type === undefined
        ? authored
        : [type];
    const result: Array<(typeof authored)[number]> = [];
    for (let index = 0, count = authored.length; index < count; index++)
      if (index in authored && effective.includes(authored[index]))
        result.push(authored[index]);
    return result;
  }, [schemaType, jsonSchema]);
  const effectiveKey = effectiveTypes.join(',');
  let editable = !display.structured;
  if (editable) {
    editable = false;
    for (let index = 0, count = effectiveTypes.length; index < count; index++) {
      const kind = effectiveTypes[index];

      if (
        kind === 'string' ||
        kind === 'number' ||
        kind === 'integer' ||
        kind === 'boolean'
      ) {
        editable = true;
        break;
      }
    }
  }

  const [text, setText] = useState(display.text);
  const draft = useRef<Optional<string>>(undefined);
  const composing = useRef(false);
  const publish = useHandle((next: string) => {
    if (composing.current || !editable || props.readOnly || props.disabled)
      return false;
    const result = interpretFieldNodeDraft(
      node,
      next === '' ? undefined : next,
    );
    if (!result.isMember) return false;
    props.onChange(result.value);
    return true;
  });
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    draft.current = event.target.value;
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
    <FieldInputString
      {...props}
      defaultValue={display.text}
      readOnly={props.readOnly || !editable}
      inputProps={{
        value: text,
        defaultValue: undefined,
        'aria-invalid': invalid || undefined,
        onChange: handleChange,
        onCompositionStart: () => {
          composing.current = true;
        },
        onCompositionEnd: (event) => {
          composing.current = false;
          draft.current = event.currentTarget.value;
          setText(draft.current);
          publish(draft.current);
        },
        onBlur: () => {
          if (composing.current) return;
          if (draft.current !== undefined && !publish(draft.current)) {
            draft.current = undefined;
            setText(readUnionDisplay(node.value, nullable).text);
          }
        },
      }}
    />
  );
};
