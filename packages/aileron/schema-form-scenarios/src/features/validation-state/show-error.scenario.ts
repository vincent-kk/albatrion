import type { FormScenario } from '../../types';
import type { ShowErrorName } from './types';

/** Two fields invalid on load: /code is typed into and left, /tag is only focused and left. */
const codeSchema = {
  type: 'object',
  properties: { code: { type: 'string', maxLength: 2 }, tag: { type: 'string', maxLength: 2 } },
};

/** A field invalid from the first screen; display policies decide when its message is drawn. */
export const showErrorScenario: FormScenario = {
  name: 'validation-state.show-error',
  description: 'ShowError policies gate only the display of issues the node already holds: Always, Never, Edited after input, Touched after blur (GOAL-061 defers touched to blur), and EditedTouched after both; /tag is focused and left without input, which separates Touched from EditedTouched; the handle showError overrides the policy. Cases come from showErrorCases.',
  schema: codeSchema,
  initialValue: { code: 'abc', tag: 'abc' },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/code': 'abc' }, errors: { '/code': [{ keyword: 'maxLength' }], '/tag': [{ keyword: 'maxLength' }] } } }],
};

/** One display policy and whether /code and /tag show their messages at each interaction point. */
export interface ShowErrorCase {
  /** Policy passed as the showError prop. */
  readonly policy: ShowErrorName;
  /** Message drawn on the first screen, after validation and before any interaction. */
  readonly atLoad: boolean;
  /** Message drawn after typing into /code while it still has focus. */
  readonly afterInput: boolean;
  /** Message drawn after focus leaves /code. */
  readonly afterBlur: boolean;
  /** Message under /tag after focus leaves it without input, which separates Touched from EditedTouched. */
  readonly afterTouchOnly: boolean;
}

/** Form props for showErrorScenario: one case per display policy. */
export const showErrorCases: readonly ShowErrorCase[] = [
  { policy: 'Always', atLoad: true, afterInput: true, afterBlur: true, afterTouchOnly: true },
  { policy: 'Never', atLoad: false, afterInput: false, afterBlur: false, afterTouchOnly: false },
  { policy: 'Edited', atLoad: false, afterInput: true, afterBlur: true, afterTouchOnly: false },
  { policy: 'Touched', atLoad: false, afterInput: false, afterBlur: true, afterTouchOnly: true },
  { policy: 'EditedTouched', atLoad: false, afterInput: false, afterBlur: true, afterTouchOnly: false },
];

/** The handle's showError overrides a Never policy, and showError(false) hides the message again. */
export const forcedShowErrorCase = { policy: 'Never', afterShow: true, afterHide: false } as const;
