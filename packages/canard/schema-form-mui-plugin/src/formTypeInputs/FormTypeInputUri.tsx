import { type ChangeEvent, useEffect, useState } from 'react';

import { Box, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface UriJsonSchema extends StringSchema {
  format?: 'uri';
  formType?: 'uri';
  protocols?: string[];
  placeholder?: string;
}

interface FormTypeInputUriProps
  extends FormTypeInputPropsWithSchema<
    string,
    UriJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  protocols?: string[];
}

const DEFAULT_PROTOCOLS = ['http', 'https', 'ftp', 'mailto', 'tel'];

const FormTypeInputUri = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
  onChange,
  context,
  size,
  protocols,
}: FormTypeInputUriProps) => {
  const [protocol, setProtocol] = useState<string>('');
  const [uri, setUri] = useState<string>('');

  const availableProtocols =
    protocols || jsonSchema.protocols || DEFAULT_PROTOCOLS;

  // 외부 value를 파싱하여 내부 상태로 설정
  useEffect(() => {
    if (!value) {
      setProtocol(availableProtocols[0]);
      setUri('');
      return;
    }

    const match = value.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
    if (match) {
      const [, detectedProtocol, restUri] = match;
      setProtocol(
        availableProtocols.includes(detectedProtocol)
          ? detectedProtocol
          : availableProtocols[0],
      );
      setUri(restUri);
    } else {
      setProtocol(availableProtocols[0]);
      setUri(value);
    }
  }, [value, availableProtocols]);

  // 초기값 설정
  useEffect(() => {
    if (!protocol) {
      setProtocol(availableProtocols[0]);
    }
  }, [availableProtocols, protocol]);

  const handleProtocolChange = useHandle((event: any) => {
    const newProtocol = event.target.value;
    setProtocol(newProtocol);
    const newValue = uri ? `${newProtocol}://${uri}` : `${newProtocol}://`;
    onChange(newValue);
  });

  const handleUriChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const newUri = event.target.value;
    setUri(newUri);
    const newValue = newUri ? `${protocol}://${newUri}` : '';
    onChange(newValue);
  });

  const fieldSize = size || context?.size;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      {/* 프로토콜 선택 */}
      <Box sx={{ minWidth: 100 }}>
        <InputLabel shrink htmlFor={`${path}-protocol`}>
          Protocol
        </InputLabel>
        <Select
          id={`${path}-protocol`}
          value={protocol}
          onChange={handleProtocolChange}
          disabled={disabled || readOnly}
          size={fieldSize}
          displayEmpty
        >
          {availableProtocols.map((prot) => (
            <MenuItem key={prot} value={prot}>
              {prot}://
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* URI 입력 */}
      <Box sx={{ flex: 1 }}>
        <InputLabel shrink htmlFor={path}>
          URI
        </InputLabel>
        <TextField
          id={path}
          name={name}
          variant="outlined"
          fullWidth
          size={fieldSize}
          placeholder={jsonSchema.placeholder}
          value={uri}
          defaultValue={
            defaultValue
              ? defaultValue.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
              : ''
          }
          onChange={handleUriChange}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export const FormTypeInputUriDefinition = {
  Component: FormTypeInputUri,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'uri' || formType === 'uri'),
} satisfies FormTypeInputDefinition;
