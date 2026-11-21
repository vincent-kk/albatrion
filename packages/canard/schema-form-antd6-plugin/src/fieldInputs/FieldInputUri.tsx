import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Input, type InputRef, Select, Space } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { formatProtocol } from './utils/uri/formatProtocol';
import { parseUri } from './utils/uri/parseUri';

type StringJSONSchema = StringSchema & {
  format?: 'uri';
};

const DEFAULT_PROTOCOLS = ['http', 'https', 'ftp', 'mailto', 'tel'];

interface FieldInputUriProps
  extends FieldInputPropsWithSchema<
    string | null,
    StringJSONSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
  /** Selectable protocols, from `presentation.FieldInputProps.protocols`. */
  protocols?: string[];
}

const FieldInputUri = ({
  inputId,
  labelId,
  getInputId,
  name,
  readOnly,
  disabled,
  value,
  onChange,
  context,
  placeholder,
  size,
  protocols,
  misfit,
}: FieldInputUriProps) => {
  const normalizedProtocols = useMemo(() => {
    const rawProtocols = protocols || DEFAULT_PROTOCOLS;
    return rawProtocols.map(formatProtocol);
  }, [protocols]);

  const inputRef = useRef<InputRef>(null);
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

  const handleProtocolChange = useCallback(
    (value: string) => {
      setLastProtocol(value);

      const currentUri = inputRef.current?.input?.value || '';
      const newValue = currentUri ? `${value}${currentUri}` : undefined;
      onChange(newValue);
    },
    [onChange],
  );

  const handleUriChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newUri = event.target.value;
      setLastProtocol(protocol);
      const newValue = newUri ? `${protocol}${newUri}` : undefined;
      onChange(newValue);
    },
    [protocol, onChange],
  );

  const ProtocolDropdown = useMemo(() => {
    return (
      <Select
        aria-label="Protocol"
        id={getInputId('protocol')}
        value={protocol}
        onChange={handleProtocolChange}
        disabled={disabled || readOnly}
      >
        {map(protocolOptions, (prot) => (
          <Select.Option key={prot} value={prot}>
            {prot || 'No scheme'}
          </Select.Option>
        ))}
      </Select>
    );
  }, [
    getInputId,
    protocol,
    protocolOptions,
    disabled,
    readOnly,
    handleProtocolChange,
  ]);

  return (
    <Space.Compact
      role="group"
      aria-labelledby={labelId}
      block
      size={size || context?.size}
    >
      {ProtocolDropdown}
      <Input
        ref={inputRef}
        aria-labelledby={labelId}
        id={inputId}
        name={name}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        value={uri}
        onChange={handleUriChange}
        size={size || context?.size}
        status={misfit ? 'error' : undefined}
        aria-invalid={misfit || undefined}
      />
    </Space.Compact>
  );
};

export const FieldInputUriDefinition = {
  Component: FieldInputUri,
  controlled: true,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'uri' || inputType === 'uri'),
} satisfies FieldInputDefinition;
