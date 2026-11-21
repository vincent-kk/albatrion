import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';

import type { SelectChangeEvent } from '@mui/material';
import { Box, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';
import { formatProtocol } from './utils/uri/formatProtocol';
import { parseUri } from './utils/uri/parseUri';

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
  inputId,
  labelId: fieldTitleId,
  getInputId,
  name,
  required,
  readOnly,
  disabled,
  value,
  onChange,
  context,
  jsonSchema,
  label: labelProp,
  placeholder,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  protocols: protocolsProp,
  hideLabel,
  misfit,
}: FieldInputUriProps) => {
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    jsonSchema,
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

  const parsed = useMemo(
    () => (typeof value === 'string' ? parseUri(value) : undefined),
    [value],
  );
  const [lastProtocol, setLastProtocol] = useState(
    parsed?.protocol ?? normalizedProtocols[0] ?? '',
  );
  const protocol = parsed?.protocol ?? lastProtocol;
  const uri = parsed?.path ?? '';
  const protocolOptions = useMemo(
    () =>
      normalizedProtocols.includes(protocol)
        ? normalizedProtocols
        : [protocol, ...normalizedProtocols],
    [normalizedProtocols, protocol],
  );

  const handleProtocolChange = useHandle((event: SelectChangeEvent<string>) => {
    const newProtocol = event.target.value;
    setLastProtocol(newProtocol);

    const currentUri = uri;
    const newValue = currentUri ? `${newProtocol}${currentUri}` : undefined;
    onChange(newValue);
  });

  const handleUriChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const newUri = event.target.value;
    setLastProtocol(protocol);
    const newValue = newUri ? `${protocol}${newUri}` : undefined;
    onChange(newValue);
  });

  return (
    <Box role="group" aria-labelledby={fieldTitleId} aria-label={fieldName}>
      <InputLabel htmlFor={inputId} required={required}>
        {label}
      </InputLabel>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Select
          inputProps={{ 'aria-label': 'Protocol' }}
          id={getInputId('protocol')}
          MenuProps={{ id: getInputId('protocol-menu') }}
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
          id={inputId}
          name={name}
          variant={variant}
          fullWidth={fullWidth}
          size={size}
          placeholder={placeholder}
          value={uri}
          onChange={handleUriChange}
          disabled={disabled}
          error={misfit}
          slotProps={{
            htmlInput: {
              'aria-labelledby': fieldTitleId,
              'aria-label': fieldName,
            },
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
  controlled: true,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'uri' || inputType === 'uri'),
} satisfies FieldInputDefinition;
