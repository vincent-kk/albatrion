import { readSchemaObject } from './readSchemaObject';
import { resolveReference } from './resolveReference';
import type { AnalysisContext, SchemaInput } from './type';

/**
 * Identify a reusable authored template without following a growing runtime path.
 * @param context - Root reference resolver
 * @param inputs - Authored schema/overlay and gate combination
 * @returns Stable key that separates sibling overlays while cutting repeated references
 */
export const getTemplateKey = (
  context: AnalysisContext,
  inputs: readonly SchemaInput[],
): string =>
  JSON.stringify(
    inputs.map((input) => {
      const schema = readSchemaObject(input.schema);
      const location =
        typeof schema.$ref === 'string' && Object.keys(schema).length === 1
          ? resolveReference(context, schema.$ref, input.schemaPath).schemaPath
          : input.schemaPath;
      const gates = input.gates.map(
        (gate) =>
          `${gate.kind}:${gate.schemaPath}:${Boolean(gate.negated)}:${
            gate.appliesWhen
              ?.map((owner) => owner.schemaPath)
              .filter((path, index, paths) => paths.indexOf(path) === index)
              .join(',') ?? ''
          }`,
      );
      return [
        location,
        input.context,
        gates.filter((gate, index) => gates.indexOf(gate) === index),
      ];
    }),
  );
