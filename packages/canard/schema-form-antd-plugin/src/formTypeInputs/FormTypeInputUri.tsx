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
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringJsonSchema extends StringSchema {
  format?: 'uri';
  formType?: 'uri';
  options?: {
    protocols?: string[];
  };
}

const DEFAULT_PROTOCOLS = ['http', 'https', 'ftp', 'mailto', 'tel'];

// 프로토콜 정규화: '://' 또는 ':' 제거하여 순수 프로토콜명으로 변환
const normalizeProtocol = (protocol: string): string => {
  return protocol.replace(/:\/\/$/, '').replace(/:$/, '');
};

// 프로토콜별 구분자 결정
const getProtocolSeparator = (protocol: string): string => {
  const normalizedProtocol = normalizeProtocol(protocol);
  // mailto, tel 등은 ':' 사용, 나머지는 '://' 사용
  return ['mailto', 'tel'].includes(normalizedProtocol) ? ':' : '://';
};

// 표시용 프로토콜 문자열 생성
const formatProtocolDisplay = (protocol: string): string => {
  const normalizedProtocol = normalizeProtocol(protocol);
  const separator = getProtocolSeparator(normalizedProtocol);
  return `${normalizedProtocol}${separator}`;
};

// URI 파싱용 정규식 (mailto: 형태와 http:// 형태 모두 지원)
const parseUri = (uri: string) => {
  // mailto:, tel: 등 단일 콜론 형태
  const singleColonMatch = uri.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):(.*)$/);
  if (singleColonMatch && ['mailto', 'tel'].includes(singleColonMatch[1])) {
    return {
      protocol: singleColonMatch[1],
      path: singleColonMatch[2],
    };
  }

  // http://, https:// 등 더블 콜론 형태
  const doubleColonMatch = uri.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
  if (doubleColonMatch) {
    return {
      protocol: doubleColonMatch[1],
      path: doubleColonMatch[2],
    };
  }

  return null;
};

interface FormTypeInputUriProps
  extends FormTypeInputPropsWithSchema<
    string,
    StringJsonSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputUri = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputUriProps) => {
  // 프로토콜 배열 정규화 및 준비
  const normalizedProtocols = useMemo(() => {
    const rawProtocols = jsonSchema.options?.protocols || DEFAULT_PROTOCOLS;
    return rawProtocols.map(normalizeProtocol);
  }, [jsonSchema]);

  // Input 참조를 위한 ref
  const inputRef = useRef<any>(null);

  // 프로토콜만 내부 상태로 관리, URI는 비제어 컴포넌트로 유지
  const [protocol, setProtocol] = useState<string>(normalizedProtocols[0]);

  // defaultValue에서 초기 프로토콜과 URI 추출
  const { initialProtocol, initialUri } = useMemo(() => {
    if (!defaultValue) {
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

  // 초기 프로토콜 설정
  useEffect(() => {
    setProtocol(initialProtocol);
  }, [initialProtocol]);

  const handleProtocolChange = useCallback(
    (value: string) => {
      setProtocol(value);
      // 현재 Input에 입력된 값을 ref로 읽어오기
      const currentUri = inputRef.current?.input?.value || '';
      const separator = getProtocolSeparator(value);
      const newValue = currentUri
        ? `${value}${separator}${currentUri}`
        : `${value}${separator}`;
      onChange(newValue);
    },
    [onChange],
  );

  const handleUriChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newUri = event.target.value;
      const separator = getProtocolSeparator(protocol);
      const newValue = newUri ? `${protocol}${separator}${newUri}` : '';
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
      placeholder={jsonSchema.placeholder}
      defaultValue={initialUri}
      onChange={handleUriChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputUriDefinition = {
  Component: FormTypeInputUri,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'uri' || formType === 'uri'),
} satisfies FormTypeInputDefinition;
