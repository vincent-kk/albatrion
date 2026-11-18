import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Input, Select } from 'antd';
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
  path,
  name,
  readOnly,
  disabled,
  defaultValue,
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


  const inputRef = useRef<any>(null);

  const { initialProtocol, initialUri } = useMemo(() => {
    if (typeof defaultValue !== 'string') {
      return {
        initialProtocol: normalizedProtocols[0] ?? '',
        initialUri: '',
      };
    }

    const parsed = parseUri(defaultValue);
    return { initialProtocol: parsed.protocol, initialUri: parsed.path };
  }, [defaultValue, normalizedProtocols]);

  // Only the protocol is stateful; the URI input remains uncontrolled.
  const [protocol, setProtocol] = useState<string>(initialProtocol);


  const handleProtocolChange = useCallback(
    (value: string) => {
      setProtocol(value);

      const currentUri = inputRef.current?.input?.value || '';
      const newValue = `${value}${currentUri}` || undefined;
      onChange(newValue);
    },
    [onChange],
  );

  const handleUriChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newUri = event.target.value;
      const newValue = `${protocol}${newUri}` || undefined;
      onChange(newValue);
    },
    [protocol, onChange],
  );

  const ProtocolDropdown = useMemo(() => {
    // A stored scheme outside `protocols` stays selectable, so editing the path keeps it.
    const protocolOptions = normalizedProtocols.includes(initialProtocol)
      ? normalizedProtocols
      : [initialProtocol, ...normalizedProtocols];
    return (
      <Select
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
    protocol,
    initialProtocol,
    normalizedProtocols,
    disabled,
    readOnly,
    handleProtocolChange,
  ]);

  return (
    <Input
      ref={inputRef}
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      addonBefore={ProtocolDropdown}
      placeholder={placeholder}
      defaultValue={initialUri}
      onChange={handleUriChange}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputUriDefinition = {
  Component: FieldInputUri,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'uri' || inputType === 'uri'),
} satisfies FieldInputDefinition;
