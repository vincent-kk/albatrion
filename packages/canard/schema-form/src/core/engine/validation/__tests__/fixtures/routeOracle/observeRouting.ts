import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';

import type { ValidationIssue } from '../../../types/issue';
import { createValidatorCopy } from '../../../utils/copy/createValidatorCopy';
import { readFieldNodeErrors } from '../../../utils/read/readFieldNodeErrors';
import { normalizeValidationIssue } from '../../../utils/route/normalizeValidationIssue';
import { routeValidationIssues } from '../../../utils/route/routeValidationIssues';
import { runFieldNodeValidation } from '../../../utils/run/runFieldNodeValidation';
import { createRoutingTree } from '../createRoutingTree';
import { type UnionSelection, readUnionSelection } from './readUnionSelection';
import type { RouteOracleValidator } from './routeOracleValidators';
import { specialiseSchema } from './specialiseSchema';

/** How the routed issues of one cell compare with the oracle's issues. */
export type RoutingClass = 'agrees' | 'false keep' | 'false drop';

/** The oracle's issues and the form's routed issues for one schema, value and validator. */
export interface RoutingObservation {
  /** Issues of the value against the schema specialised to the form's selection, sorted. */
  readonly truth: readonly string[];
  /** Issues on every node of the form after routing, sorted. */
  readonly shown: readonly string[];
  /** `false drop` when a truth issue is not shown, else `false keep` when a shown issue is not in the truth. */
  readonly routing: RoutingClass;
}

/**
 * Compare key of an issue: instance path, keyword and parameters; schema path and message are not compared.
 * @param issue - Normalized issue.
 * @returns A string equal for issues the consumer cannot tell apart by location and rule.
 */
const toIssueKey = (issue: ValidationIssue): string =>
  `${issue.dataPath} ${issue.keyword ?? ''} ${JSON.stringify(issue.details ?? {})}`;

/**
 * Validate a mounted form with a real validator, route its issues, and compare them with the
 * issues of the same emitted value against the schema specialised to the form's selection.
 * @param schema - Authored schema; the form and the oracle read the same object.
 * @param value - Load value of the form.
 * @param config - Validator configuration used by both the form and the oracle.
 * @param select - Replaces the form's selection; the proof uses it to show the comparison can fail.
 * @returns Sorted issue keys of both sides and the cell's classification.
 * @throws When the form's validator rejects or the oracle cannot specialise the schema.
 */
export const observeRouting = async (
  schema: BlueprintSchema,
  value: unknown,
  config: RouteOracleValidator,
  select?: UnionSelection,
): Promise<RoutingObservation> => {
  const validator = config.create();
  const root = createRoutingTree({
    jsonSchema: schema,
    defaultValue: value,
    validator,
  });
  const issues = (await runFieldNodeValidation(root)) ?? [];
  routeValidationIssues([root], issues);
  const shownIssues = new Set<ValidationIssue>();
  const pending = [root];
  for (let node = pending.pop(); node; node = pending.pop()) {
    for (const issue of readFieldNodeErrors(node)) shownIssues.add(issue);
    pending.push(...(node.children ?? []));
  }
  const emitted = root.__outputValue__;
  const specialised = specialiseSchema(
    root.runtime.blueprint.schema,
    emitted,
    select ?? readUnionSelection(root),
    config.dialect,
  );
  const truthIssues =
    (await validator.compile(createValidatorCopy(specialised))(emitted)) ?? [];
  const truth = truthIssues
    .map(normalizeValidationIssue)
    .map(toIssueKey)
    .sort();
  const shown = [...shownIssues].map(toIssueKey).sort();
  const remaining = shown.slice();
  let routing: RoutingClass = 'agrees';
  for (const key of truth) {
    const index = remaining.indexOf(key);
    if (index < 0) return { truth, shown, routing: 'false drop' };
    remaining.splice(index, 1);
  }
  if (remaining.length) routing = 'false keep';
  return { truth, shown, routing };
};
