import type { FormScenario } from "../../types";
import type { ErrorVisibilityName } from "./types";

/** Two fields invalid on load: /code is typed into and left, /tag is only focused and left. */
const codeSchema = {
  type: "object",
  properties: {
    code: { type: "string", maxLength: 2 },
    tag: { type: "string", maxLength: 2 },
  },
};

/** A field invalid from the first screen; display policies decide when its message is drawn. */
export const errorVisibilityScenario: FormScenario = {
  name: "validation-state.error-visibility",
  description:
    "ErrorVisibility policies gate only the display of issues the node already holds: Always, Never, AfterEdit after input, AfterTouch after blur (GOAL-061 defers touched to blur), AfterEditAndTouch after both, and AfterEditOrTouch after either; /tag is focused and left without input, which separates AfterTouch from AfterEditAndTouch; the handle errorVisibility overrides the policy. Cases come from errorVisibilityCases.",
  schema: codeSchema,
  initialValue: { code: "abc", tag: "abc" },
  steps: [
    {
      action: "batch",
      steps: [],
      expect: {
        values: { "/code": "abc" },
        errors: {
          "/code": [{ keyword: "maxLength" }],
          "/tag": [{ keyword: "maxLength" }],
        },
      },
    },
  ],
};

/** One display policy and whether /code and /tag show their messages at each interaction point. */
export interface ErrorVisibilityCase {
  /** Policy passed as the errorVisibility prop. */
  readonly policy: ErrorVisibilityName;
  /** Message drawn on the first screen, after validation and before any interaction. */
  readonly atLoad: boolean;
  /** Message drawn after typing into /code while it still has focus. */
  readonly afterInput: boolean;
  /** Message drawn after focus leaves /code. */
  readonly afterBlur: boolean;
  /** Message under /tag after focus leaves it without input, which separates AfterTouch from AfterEditAndTouch. */
  readonly afterTouchOnly: boolean;
}

/** Form props for errorVisibilityScenario: one case per display policy. */
export const errorVisibilityCases: readonly ErrorVisibilityCase[] = [
  {
    policy: "Always",
    atLoad: true,
    afterInput: true,
    afterBlur: true,
    afterTouchOnly: true,
  },
  {
    policy: "AfterEditOrTouch",
    atLoad: false,
    afterInput: true,
    afterBlur: true,
    afterTouchOnly: true,
  },
  {
    policy: "Never",
    atLoad: false,
    afterInput: false,
    afterBlur: false,
    afterTouchOnly: false,
  },
  {
    policy: "AfterEdit",
    atLoad: false,
    afterInput: true,
    afterBlur: true,
    afterTouchOnly: false,
  },
  {
    policy: "AfterTouch",
    atLoad: false,
    afterInput: false,
    afterBlur: true,
    afterTouchOnly: true,
  },
  {
    policy: "AfterEditAndTouch",
    atLoad: false,
    afterInput: false,
    afterBlur: true,
    afterTouchOnly: false,
  },
];

/** The handle's errorVisibility overrides a Never policy, and resetErrorVisibility() hides the message again. */
export const forcedRevealErrorsCase = {
  policy: "Never",
  afterShow: true,
  afterHide: false,
} as const;
