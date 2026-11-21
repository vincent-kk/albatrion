import { useMemo, useState } from 'react';

import { Input, Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

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

  const parsed = useMemo(
    () => (typeof value === 'string' ? parseUri(value) : undefined),
    [value],
  );
  const [lastProtocol, setLastProtocol] = useState(
    parsed?.protocol ?? normalizedProtocols[0] ?? '',
  );
  const protocol = parsed?.protocol ?? lastProtocol;
  const uri = parsed?.path ?? '';
  const options = useMemo(() => {
    const choices = normalizedProtocols.includes(protocol)
      ? normalizedProtocols
      : [protocol, ...normalizedProtocols];
    return choices.map((value) => ({ value, label: value || 'No scheme' }));
  }, [normalizedProtocols, protocol]);

  const publish = (prefix: string, address: string) => {
    setLastProtocol(prefix);
    onChange(address ? prefix + address : undefined);
  };

  const protocolDropdown = (
    <Select
      aria-label="Protocol"
      id={getInputId('protocol')}
      value={protocol}
      onChange={(prefix) => publish(prefix, uri)}
      disabled={disabled || readOnly}
      options={options}
    />
  );

  return (
    <Input
      addonBefore={protocolDropdown}
      aria-labelledby={labelId}
      id={inputId}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      value={uri}
      onChange={(event) => publish(protocol, event.target.value)}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputUriDefinition = {
  Component: FieldInputUri,
  controlled: true,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'uri' || inputType === 'uri'),
} satisfies FieldInputDefinition;
