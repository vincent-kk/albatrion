import type { FormScenario } from '../../types';
import type { KeywordsByPath } from './types';

/** Fields with no validation keywords, so every issue a node holds comes from outside the validator. */
const accountSchema = {
  type: 'object',
  properties: { name: { type: 'string' }, age: { type: 'integer' } },
};

/** A valid form whose issues arrive only through the errors prop or a node's setExternalErrors. */
export const externalErrorsScenario: FormScenario = {
  name: 'validation-state.external-errors',
  description: 'LANDING-210 the errors prop is a read-only list; 79C-01 the root holds the whole list and each issue routes to its dataPath; a path dropped from the next list is cleared; 178C-01 a non-array errors prop reads as an empty list without throwing. Stages come from externalErrorStages.',
  schema: accountSchema,
  initialValue: { name: 'taken', age: 30 },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/name': 'taken', '/age': 30 } } }],
};

/** One errors prop value and the issues each node holds once it applies. */
export interface ExternalErrorStage {
  /** Story button and test label for the stage. */
  readonly label: string;
  /** Value passed as the errors prop, deliberately loose so malformed input can be staged. */
  readonly errors: unknown;
  /** Keywords per node after the stage applies. */
  readonly expected: KeywordsByPath;
  /** Message text drawn under each field after the stage applies; an empty string means none. */
  readonly shown: Readonly<Record<string, string>>;
}

const nameTaken = { dataPath: '/name', keyword: 'server', message: 'Name is taken' };
const retryLater = { dataPath: '', keyword: 'server', message: 'Try again later' };
const ageRejected = { dataPath: '/age', keyword: 'server', message: 'Age rejected' };

/** Errors prop values applied in order to externalErrorsScenario; the first is the mounted value. */
export const externalErrorStages: readonly ExternalErrorStage[] = [
  { label: 'name and root', errors: [nameTaken, retryLater], expected: { '': ['server', 'server'], '/name': ['server'], '/age': [] }, shown: { '/name': 'Name is taken', '/age': '' } },
  { label: 'age only', errors: [ageRejected], expected: { '': ['server'], '/name': [], '/age': ['server'] }, shown: { '/name': '', '/age': 'Age rejected' } },
  { label: 'null', errors: null, expected: { '': [], '/name': [], '/age': [] }, shown: { '/name': '', '/age': '' } },
  { label: 'name again', errors: [nameTaken], expected: { '': ['server'], '/name': ['server'], '/age': [] }, shown: { '/name': 'Name is taken', '/age': '' } },
  { label: 'object', errors: { '/name': nameTaken }, expected: { '': [], '/name': [], '/age': [] }, shown: { '/name': '', '/age': '' } },
];

/** An issue a consumer sets directly on one node through setExternalErrors, then clears. */
export const nodeExternalError = {
  path: '/age',
  issues: [{ dataPath: '/age', keyword: 'server', message: 'Age is locked' }],
} as const;
