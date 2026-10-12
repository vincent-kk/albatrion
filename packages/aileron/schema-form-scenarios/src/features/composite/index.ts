import type { FormScenario } from '../../types';
import type { CompositeCase } from './types';
import { cx01OrderForm } from './cx01-order-form.scenario';
import { cx02OrgChart } from './cx02-org-chart.scenario';
import { cx03Profile } from './cx03-profile.scenario';
import { cx04AmountInput } from './cx04-amount-input.scenario';
import { cx05Permissions } from './cx05-permissions.scenario';
import { cx06PluginForm } from './cx06-plugin-form.scenario';
import { cx07SetupWizard } from './cx07-setup-wizard.scenario';
import { cx08SwitchWithArrayVerbs } from './cx08-switch-with-array-verbs.scenario';
import { cx09ResetDuringValidation } from './cx09-reset-during-validation.scenario';
import { cx10InjectChainInBatch } from './cx10-inject-chain-in-batch.scenario';
import { cx11ImeDuringSwitch } from './cx11-ime-during-switch.scenario';
import { cx12DeferredDirtyTouched } from './cx12-deferred-dirty-touched.scenario';
import { cx13NestedOneofAnyof } from './cx13-nested-oneof-anyof.scenario';
import { cx14RecursiveConditions } from './cx14-recursive-conditions.scenario';
import { cx15ExternalAndValidationErrors } from './cx15-external-and-validation-errors.scenario';
import { cx16RapidMixedToggles } from './cx16-rapid-mixed-toggles.scenario';
import { cx17BranchArrayItemErrors } from './cx17-branch-array-item-errors.scenario';
import { cx18SwitchRecomputesDerived } from './cx18-switch-recomputes-derived.scenario';
import { cx19BranchDefaultsAndReset } from './cx19-branch-defaults-and-reset.scenario';
import { cx20ArrayOfOneofItems } from './cx20-array-of-oneof-items.scenario';
import { cx21GuardInsideArrayItems } from './cx21-guard-inside-array-items.scenario';
import { cx22VisibleVersusActiveInBranch } from './cx22-visible-versus-active-in-branch.scenario';
import { cx23NullableBranchObject } from './cx23-nullable-branch-object.scenario';
import { cx24EnterSubmitAndBranch } from './cx24-enter-submit-and-branch.scenario';

import { batchPushFindingScenario } from './finding-batch-push.scenario';
import { recursiveNestedGateFindingScenario } from './finding-recursive-nested-gate.scenario';

export { amountInputPlan } from './cx04-amount-input.scenario';
export { pluginFormPlan } from './cx06-plugin-form.scenario';
export { imeSwitchPlan } from './cx11-ime-during-switch.scenario';
export type { CompositeCase, CompositeNodeState, CompositePropStage, CompositeTailStep } from './types';

/** Composite cases CX-01 to CX-24 in order; each pairs shared steps with an optional consumer tail. */
export const compositeCases: readonly CompositeCase[] = [
  cx01OrderForm, cx02OrgChart, cx03Profile, cx04AmountInput, cx05Permissions, cx06PluginForm, cx07SetupWizard, cx08SwitchWithArrayVerbs, cx09ResetDuringValidation, cx10InjectChainInBatch, cx11ImeDuringSwitch, cx12DeferredDirtyTouched, cx13NestedOneofAnyof, cx14RecursiveConditions, cx15ExternalAndValidationErrors, cx16RapidMixedToggles, cx17BranchArrayItemErrors, cx18SwitchRecomputesDerived, cx19BranchDefaultsAndReset, cx20ArrayOfOneofItems, cx21GuardInsideArrayItems, cx22VisibleVersusActiveInBranch, cx23NullableBranchObject, cx24EnterSubmitAndBranch,
];

/** Composite findings: expectations state the ledger contract and fail against the current engine. */
export const compositeFindingScenarios: readonly FormScenario[] = [batchPushFindingScenario, recursiveNestedGateFindingScenario];
