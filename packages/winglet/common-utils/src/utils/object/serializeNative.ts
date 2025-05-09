/**
 * 네이티브 JSON.stringify를 사용하여 값을 직렬화합니다.
 * JSON.stringify의 별칭입니다.
 *
 * @param value - 직렬화할 값
 * @param replacer - 직렬화 중 값을 변경하는 함수 또는 포함할 속성 이름 배열 (선택사항)
 * @param space - 서식 지정을 위한 공백 문자열 또는 들여쓰기 수 (선택사항)
 * @returns 직렬화된 JSON 문자열
 *
 * @example
 * serializeNative({a: 1, b: 2}); // '{"a":1,"b":2}'
 * serializeNative({a: 1, b: undefined}); // '{"a":1}'
 */
export const serializeNative = JSON.stringify;
