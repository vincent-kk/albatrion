import { type ReactNode, useMemo, useState } from 'react';

import { Box, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';
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
  label: labelProp,
  placeholder,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  protocols: protocolsProp,
  hideLabel,
  misfit,
  className,
  style,
}: FieldInputUriProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );

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

  const captionId = label ? getInputId('legend') : undefined;
  const publish = (prefix: string, address: string) => {
    setLastProtocol(prefix);
    onChange(address ? prefix + address : undefined);
  };

  return (
    <Box
      className={className}
      style={style}
      role="group"
      aria-labelledby={captionId ?? fieldTitleId}
    >
      <InputLabel id={captionId} htmlFor={inputId} required={required}>
        {label}
      </InputLabel>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Select
          inputProps={{ 'aria-label': 'Protocol' }}
          SelectDisplayProps={{ id: getInputId('protocol') }}
          MenuProps={{ id: getInputId('protocol-menu') }}
          value={protocol}
          onChange={(event) => publish(event.target.value, uri)}
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
          onChange={(event) => publish(protocol, event.target.value)}
          disabled={disabled}
          error={misfit}
          slotProps={{
            htmlInput: { 'aria-labelledby': captionId ?? fieldTitleId },
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
