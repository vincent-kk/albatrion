import { JSONPath } from '@winglet/common-utils';

/**
 * computed 하위에 명시된 필드에 대한 alias
 *
 * 예: computed.if -> &if
 */
export const ALIAS = '&';

/**
 * JSON 경로 형식을 찾기 위한 정규 표현식
 *
 * 예: '$.property', '_.property', '@.property' 와 같은 패턴을 찾습니다.
 */
export const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Parent}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
