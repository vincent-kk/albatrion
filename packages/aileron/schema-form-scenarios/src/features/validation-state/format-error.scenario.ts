import type { FormScenario } from '../../types';

/** One field that fails two keywords at once, so formatting order is observable. */
const nicknameSchema = {
  type: 'object',
  properties: { nickname: { type: 'string', minLength: 4, pattern: '^[a-z]+$' } },
};

/** A field holding two issues on load; formatError decides the drawn message. */
export const formatErrorScenario: FormScenario = {
  name: 'validation-state.format-error',
  description: 'REACT-026 formatError translates an issue into the drawn message; the renderer draws the first issue whose formatted message is not null, so a null result falls through to the next issue. Catalogs come from formatErrorCases.',
  schema: nicknameSchema,
  initialValue: { nickname: 'A1' },
  steps: [{ action: 'batch', steps: [], expect: { errors: { '/nickname': [{ keyword: 'minLength' }, { keyword: 'pattern' }] } } }],
};

/** One message catalog and the text drawn under /nickname with it. */
export interface FormatErrorCase {
  /** Story and test label for the catalog. */
  readonly label: string;
  /** Keyword to message template; `{limit}` reads the issue detail of that name. A missing keyword formats to null. */
  readonly catalog: Readonly<Record<string, string>>;
  /** Text drawn under /nickname; an empty string means nothing is drawn. */
  readonly shown: string;
}

/** Form props for formatErrorScenario: each catalog is turned into a formatError by the consumer. */
export const formatErrorCases: readonly FormatErrorCase[] = [
  { label: 'Translated', catalog: { minLength: '최소 {limit}자 이상 입력하세요', pattern: '영문 소문자만 쓸 수 있습니다' }, shown: '최소 4자 이상 입력하세요' },
  { label: 'NullFallsThrough', catalog: { pattern: '영문 소문자만 쓸 수 있습니다' }, shown: '영문 소문자만 쓸 수 있습니다' },
  { label: 'AllNull', catalog: {}, shown: '' },
];
