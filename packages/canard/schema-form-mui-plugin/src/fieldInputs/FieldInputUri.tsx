import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
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


const normalizeProtocol = (protocol: string): string => {
  return protocol.replace(/:\/\/$/, '').replace(/:$/, '');
};


const getProtocolSeparator = (protocol: string): string => {
  const normalizedProtocol = normalizeProtocol(protocol);

  return ['mailto', 'tel'].includes(normalizedProtocol) ? ':' : '://';
};


const formatProtocolDisplay = (protocol: string): string => {
  const normalizedProtocol = normalizeProtocol(protocol);
  const separator = getProtocolSeparator(normalizedProtocol);
  return `${normalizedProtocol}${separator}`;
};


const parseUri = (uri: string) => {

  const singleColonMatch = uri.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):(.*)$/);
  if (singleColonMatch && ['mailto', 'tel'].includes(singleColonMatch[1])) {
    return {
      protocol: singleColonMatch[1],
      path: singleColonMatch[2],
    };
  }


  const doubleColonMatch = uri.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
  if (doubleColonMatch) {
    return {
      protocol: doubleColonMatch[1],
      path: doubleColonMatch[2],
    };
  }

  return null;
};

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
    return rawProtocols.map(normalizeProtocol);
  }, [protocolsProp]);


  const textFieldRef = useRef<HTMLInputElement>(null);

  // Only the protocol is stateful; the URI input remains uncontrolled.
  const [protocol, setProtocol] = useState<string>(normalizedProtocols[0]);


  const { initialProtocol, initialUri } = useMemo(() => {
    if (typeof defaultValue !== 'string' || !defaultValue) {
      return {
        initialProtocol: normalizedProtocols[0],
        initialUri: '',
      };
    }

    const parsed = parseUri(defaultValue);
    if (parsed) {
      const normalizedDetected = normalizeProtocol(parsed.protocol);
      return {
        initialProtocol: normalizedProtocols.includes(normalizedDetected)
          ? normalizedDetected
          : normalizedProtocols[0],
        initialUri: parsed.path,
      };
    }

    return {
      initialProtocol: normalizedProtocols[0],
      initialUri: defaultValue,
    };
  }, [defaultValue, normalizedProtocols]);


  useEffect(() => {
    setProtocol(initialProtocol);
  }, [initialProtocol]);

  const handleProtocolChange = useHandle((event: SelectChangeEvent<string>) => {
    const newProtocol = event.target.value;
    setProtocol(newProtocol);

    const currentUri = textFieldRef.current?.value || '';
    const separator = getProtocolSeparator(newProtocol);
    const newValue = currentUri
      ? `${newProtocol}${separator}${currentUri}`
      : undefined;
    onChange(newValue);
  });

  const handleUriChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const newUri = event.target.value;
    const separator = getProtocolSeparator(protocol);
    const newValue = newUri ? `${protocol}${separator}${newUri}` : undefined;
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
          {normalizedProtocols.map((prot) => (
            <MenuItem key={prot} value={prot}>
              {formatProtocolDisplay(prot)}
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
