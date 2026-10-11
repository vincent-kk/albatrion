import { readSchemaObject } from '../../utils/analyze/readSchemaObject';
import { resolveReference } from '../../utils/analyze/resolveReference';
import type { AnalysisContext, SchemaInput } from '../../utils/analyze/type';

/**
 * Encode both lookup keys with the fixed 5f50768e5 oracle.
 * @param context - The same root resolver used by the production invocation
 * @param inputs - Contributions before declaration expansion
 * @returns The two HEAD JSON strings, including host paths before deduplication
 */
export const getTemplateKeysHead = (
  context: AnalysisContext,
  inputs: readonly SchemaInput[],
): { key: string; boundKey: string } => {
  const key = JSON.stringify(inputs.map((input) => {
    const schema = readSchemaObject(input.schema);
    const location = typeof schema.$ref === 'string' && Object.keys(schema).length === 1
      ? resolveReference(context, schema.$ref, input.schemaPath).schemaPath : input.schemaPath;
    const gates = input.gates.map((gate) =>
      `${gate.kind}:${gate.schemaPath}:${Boolean(gate.negated)}:${
        gate.appliesWhen?.map(owner => owner.schemaPath)
          .filter((path, index, paths) => paths.indexOf(path) === index).join(',') ?? ''
      }`);
    return [location, input.context, gates.filter((gate, index) => gates.indexOf(gate) === index)];
  }));
  const hostPaths: string[][] = [];
  for (let index = 0; index < inputs.length; index++) {
    const gates = inputs[index].gates;
    const paths: string[] = [];
    for (let gate = 0; gate < gates.length; gate++) paths.push(gates[gate].hostPath);
    hostPaths.push(paths);
  }
  return { key, boundKey: JSON.stringify([key, hostPaths]) };
};
