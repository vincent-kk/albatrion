import {
  type ChangeEvent,
  useCallback,
  useEffect,
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

type StringJSONSchema = StringSchema & {
  format?: 'uri';
};

const DEFAULT_PROTOCOLS = ['http', 'https', 'ftp', 'mailto', 'tel'];


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
    return rawProtocols.map(normalizeProtocol);
  }, [protocols]);


  const inputRef = useRef<any>(null);

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

  const handleProtocolChange = useCallback(
    (value: string) => {
      setProtocol(value);

      const currentUri = inputRef.current?.input?.value || '';
      const separator = getProtocolSeparator(value);
      const newValue = currentUri
        ? `${value}${separator}${currentUri}`
        : undefined;
      onChange(newValue);
    },
    [onChange],
  );

  const handleUriChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newUri = event.target.value;
      const separator = getProtocolSeparator(protocol);
      const newValue = newUri ? `${protocol}${separator}${newUri}` : undefined;
      onChange(newValue);
    },
    [protocol, onChange],
  );

  const ProtocolDropdown = useMemo(() => {
    return (
      <Select
        value={protocol}
        onChange={handleProtocolChange}
        disabled={disabled || readOnly}
      >
        {map(normalizedProtocols, (prot) => (
          <Select.Option key={prot} value={prot}>
            {formatProtocolDisplay(prot)}
          </Select.Option>
        ))}
      </Select>
    );
  }, [protocol, normalizedProtocols, disabled, readOnly, handleProtocolChange]);

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
