import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Input, Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@lumy-pack/schema-form';

interface StringJsonSchema extends StringSchema {
  format?: 'uri';
  formType?: 'uri';
  options?: {
    protocols?: string[];
  };
}

const DEFAULT_PROTOCOLS = ['http://', 'https://'];

const FormTypeInputUri = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  string,
  StringJsonSchema,
  { size?: SizeType }
>) => {
  const protocols = useMemo(
    () =>
      Array.from(
        new Set(jsonSchema.options?.protocols ?? DEFAULT_PROTOCOLS),
      ).sort((a, b) => b.length - a.length),
    [jsonSchema],
  );

  const parseUri = useCallback(
    (value: string = ''): [protocol: string | undefined, path: string] => {
      if (value) {
        for (const protocol of protocols) {
          if (value.startsWith(protocol))
            return [protocol, value.slice(protocol.length)];
        }
      }
      return [undefined, value || ''];
    },
    [protocols],
  );

  const [defaultProtocol, defaultPathBody] = useMemo(() => {
    const [protocol, uri] = parseUri(defaultValue);
    return [protocol || protocols[0], uri];
  }, [defaultValue, parseUri, protocols]);

  const [protocol, setProtocol] = useState(defaultProtocol);

  const handleChangeProtocol = useCallback((value: string) => {
    setProtocol(value);
  }, []);

  const [uriBody, setUriBody] = useState(defaultPathBody);
  const handleChangeUriBody = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [nextProtocol, nextUriBody] = parseUri(event.target.value);
      if (nextProtocol && protocol !== nextProtocol) {
        setProtocol(nextProtocol);
      }
      if (nextUriBody !== uriBody) {
        setUriBody(nextUriBody);
      }
    },
    [parseUri, protocol, uriBody],
  );

  const ProtocolDropdown = useMemo(() => {
    return (
      <Select
        value={protocol}
        onChange={handleChangeProtocol}
        disabled={disabled}
      >
        {protocols.map((protocol) => (
          <Select.Option key={protocol} value={protocol}>
            {protocol}
          </Select.Option>
        ))}
      </Select>
    );
  }, [disabled, protocol, protocols, handleChangeProtocol]);

  useEffect(() => {
    if (!protocol) return;
    if (!uriBody) onChange(protocol);
    onChange(protocol + uriBody);
  }, [protocol, uriBody, onChange]);

  return (
    <Input
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      addonBefore={ProtocolDropdown}
      placeholder={jsonSchema.placeholder}
      defaultValue={defaultPathBody}
      onChange={handleChangeUriBody}
      size={context?.size}
    />
  );
};

export const FormTypeInputUriDefinition = {
  Component: FormTypeInputUri,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'uri' || formType === 'uri'),
} satisfies FormTypeInputDefinition;
