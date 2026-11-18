import {
  type ChangeEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { SelectChangeEvent } from '@mui/material';
import { Box, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { formatProtocol } from './utils/uri/formatProtocol';
import { parseUri } from './utils/uri/parseUri';

import type { MuiContext } from '../type';

type UriJSONSchema = StringSchema & { format?: 'uri' };

interface FieldInputUriProps
  extends FieldInputPropsWithSchema<string | null, UriJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  /** Selectable protocols, from `presentation.FieldInputProps.protocols`. */
  protocols?: string[];
  hideLabel?: boolean;
}

const DEFAULT_PROTOCOLS = ['http', 'https'];


const FieldInputUri = ({
  path,
  name,
  required,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  placeholder,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  protocols: protocolsProp,
  hideLabel,
  misfit,
}: FieldInputUriProps) => {
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


  const normalizedProtocols = useMemo(() => {
    const rawProtocols = protocolsProp || DEFAULT_PROTOCOLS;
    return rawProtocols.map(formatProtocol);
  }, [protocolsProp]);


  const textFieldRef = useRef<HTMLInputElement>(null);



  const { initialProtocol, initialUri, protocolOptions } = useMemo(() => {
    if (typeof defaultValue !== 'string') {
      return {
        initialProtocol: normalizedProtocols[0] ?? '',
        initialUri: '',
        protocolOptions: normalizedProtocols,
      };
    }

    const parsed = parseUri(defaultValue);
    return {
      initialProtocol: parsed.protocol,
      initialUri: parsed.path,
      protocolOptions: normalizedProtocols.includes(parsed.protocol)
        ? normalizedProtocols
        : [parsed.protocol, ...normalizedProtocols],
    };
  }, [defaultValue, normalizedProtocols]);


  // The core remounts uncontrolled inputs for external writes and resets.
  const [protocol, setProtocol] = useState<string>(initialProtocol);

  const handleProtocolChange = useHandle((event: SelectChangeEvent<string>) => {
    const newProtocol = event.target.value;
    setProtocol(newProtocol);

    const currentUri = textFieldRef.current?.value || '';
    const newValue = `${newProtocol}${currentUri}` || undefined;
    onChange(newValue);
  });

  const handleUriChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const newUri = event.target.value;
    const newValue = `${protocol}${newUri}` || undefined;
    onChange(newValue);
  });

  return (
    <Box>
      <InputLabel htmlFor={path} required={required}>
        {label}
      </InputLabel>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Select
          value={protocol}
          onChange={handleProtocolChange}
          disabled={disabled || readOnly}
          size={size}
          displayEmpty
        >
          {protocolOptions.map((prot) => (
            <MenuItem key={prot} value={prot}>
              {prot || 'No scheme'}
            </MenuItem>
          ))}
        </Select>
        <TextField
          inputRef={textFieldRef}
          id={path}
          name={name}
          variant={variant}
          fullWidth={fullWidth}
          size={size}
          placeholder={placeholder}
          defaultValue={initialUri}
          onChange={handleUriChange}
          disabled={disabled}
          error={misfit}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export const FieldInputUriDefinition = {
  Component: FieldInputUri,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'uri' || inputType === 'uri'),
} satisfies FieldInputDefinition;
