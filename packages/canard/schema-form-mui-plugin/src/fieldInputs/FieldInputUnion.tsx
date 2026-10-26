import {
  type ChangeEvent,
  type CompositionEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import {
  type FieldInputDefinition,
  type FieldInputProps,
  interpretFieldNodeDraft,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { readEffectiveTypes } from './utils/readEffectiveTypes';
import { readUnionDisplay } from './utils/readUnionDisplay';

interface FieldInputUnionProps extends FieldInputProps, MuiContext {
  context: MuiContext;
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputUnion = ({
  node,
  path,
  name,
  value,
  nullable,
  schemaType,
  jsonSchema,
  required,
  readOnly,
  disabled,
  onChange,
  context,
  label: labelProp,
  placeholder,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  hideLabel,
  misfit,
}: FieldInputUnionProps) => {
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      labelProp || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);
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
    <TextField
      id={path}
      name={name}
      variant={variant}
      fullWidth={fullWidth}
      placeholder={placeholder}
      label={label}
      required={required}
      disabled={disabled}
      error={invalid}
      value={text}
      onChange={handleChange}
      onBlur={() => {
        if (composing.current) return;
        if (draft.current !== undefined && !publish(draft.current)) {
          draft.current = undefined;
          setText(readUnionDisplay(node.value, nullable).text);
        }
      }}
      size={size}
      slotProps={{
        input: {
          readOnly: readOnly || !editable,
          inputProps: {
            onCompositionStart: () => {
              composing.current = true;
            },
            onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => {
              composing.current = false;
              draft.current = event.currentTarget.value;
              setText(draft.current);
              publish(draft.current);
            },
          },
        },
      }}
    />
  );
};

export const FieldInputUnionDefinition = {
  Component: FieldInputUnion,
  test: {
    type: 'union',
  },
} satisfies FieldInputDefinition;
