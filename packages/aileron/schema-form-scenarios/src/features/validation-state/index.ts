import type { FormScenario } from "../../types";
import { errorRoutingScenario } from "./error-routing.scenario";
import { externalErrorsScenario } from "./external-errors.scenario";
import { formatErrorScenario } from "./format-error.scenario";
import { interactionStateScenario } from "./interaction-state.scenario";
import { errorVisibilityScenario } from "./error-visibility.scenario";
import { submitRejectedScenario } from "./submit-rejected.scenario";
import { modeTimingScenario } from "./validation-modes.scenario";

export {
  externalErrorStages,
  nodeExternalError,
} from "./external-errors.scenario";
export type { ExternalErrorStage } from "./external-errors.scenario";
export { formatErrorCases } from "./format-error.scenario";
export type { FormatErrorCase } from "./format-error.scenario";
export { interactionStateStages } from "./interaction-state.scenario";
export type { InteractionStateStage } from "./interaction-state.scenario";
export {
  forcedRevealErrorsCase,
  errorVisibilityCases,
} from "./error-visibility.scenario";
export type { ErrorVisibilityCase } from "./error-visibility.scenario";
export { submitOutcomes } from "./submit-rejected.scenario";
export type {
  InteractionStateNames,
  KeywordsByPath,
  ErrorVisibilityName,
  ValidationModeName,
} from "./types";
export { validationModeCases } from "./validation-modes.scenario";
export type { ValidationModeCase } from "./validation-modes.scenario";

/** Validation and state feature cases; form props and consumer-only interactions sit in the case constants. */
export const validationStateFeatureScenarios: readonly FormScenario[] = [
  modeTimingScenario,
  externalErrorsScenario,
  errorVisibilityScenario,
  formatErrorScenario,
  interactionStateScenario,
  submitRejectedScenario,
  errorRoutingScenario,
];
