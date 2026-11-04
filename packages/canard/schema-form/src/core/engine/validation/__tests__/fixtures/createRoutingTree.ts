import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { dispatchMount } from '@/schema-form/core/engine/write';

import type { Validator } from '../../types/validator';

/** Inputs retained by the routing fixture without exposing internal records publicly. */
interface RoutingTreeProps {
  /** Authored shape selected by the normal blueprint builder. */
  jsonSchema: BlueprintSchema;
  /** Initial loaded input shared by the oracle and merged pass. */
  defaultValue?: unknown;
  /** Validation scheduling mode needed by automatic-run tests. */
  validationMode?: ValidationMode;
  /** Optional validator returning the fixture's ordered issue references. */
  validator?: Validator;
}

/**
 * Mount a shipping tree with the internal record type needed by route assertions.
 * @param props - Shape, load input and optional whole-schema validator
 * @returns Root record using the ordinary factory and mount dispatcher
 */
export const createRoutingTree = (props: RoutingTreeProps) => {
  const { root, runtime } = createDispatchTree(
    props.jsonSchema,
    props.defaultValue,
    props.validator,
  );
  runtime.validationMode = props.validationMode ?? ValidationMode.OnRequest;
  dispatchMount(root, props.defaultValue, undefined, { deferValidation: true });
  return root;
};
