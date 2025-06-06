import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Box,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface UriJsonSchema
  extends StringSchema<{
    protocols?: string[];
  }> {
  format?: 'uri';
  formType?: 'uri';
}

interface FormTypeInputUriProps
  extends FormTypeInputPropsWithSchema<string, UriJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  protocols?: string[];
  hideLabel?: boolean;
}

const DEFAULT_PROTOCOLS = ['http', 'https'];

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

const FormTypeInputUri = ({
  path,
  name,
  jsonSchema,
  required,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  protocols: protocolsProp,
  hideLabel,
}: FormTypeInputUriProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

  // 프로토콜 배열 정규화 및 준비
  const normalizedProtocols = useMemo(() => {
    const rawProtocols =
      protocolsProp || jsonSchema.options?.protocols || DEFAULT_PROTOCOLS;
    return rawProtocols.map(normalizeProtocol);
  }, [protocolsProp, jsonSchema]);

  // TextField 참조를 위한 ref
  const textFieldRef = useRef<HTMLInputElement>(null);

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

  const handleProtocolChange = useHandle((event: SelectChangeEvent<string>) => {
    const newProtocol = event.target.value;
    setProtocol(newProtocol);
    // 현재 TextField에 입력된 값을 ref로 읽어오기
    const currentUri = textFieldRef.current?.value || '';
    const separator = getProtocolSeparator(newProtocol);
    const newValue = currentUri
      ? `${newProtocol}${separator}${currentUri}`
      : `${newProtocol}${separator}`;
    onChange(newValue);
  });

  const handleUriChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const newUri = event.target.value;
    const separator = getProtocolSeparator(protocol);
    const newValue = newUri ? `${protocol}${separator}${newUri}` : '';
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
          variant="outlined"
          fullWidth
          size={size}
          placeholder={jsonSchema.placeholder}
          defaultValue={initialUri}
          onChange={handleUriChange}
          disabled={disabled}
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

export const FormTypeInputUriDefinition = {
  Component: FormTypeInputUri,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'uri' || formType === 'uri'),
} satisfies FormTypeInputDefinition;
