import { captureBlueprintObservables } from '../../../__tests__/fixtures/captureBlueprintObservables';
import { blueprint } from '../../blueprint';
import type { BlueprintDiagnostic, BlueprintSchema } from '../../type';
import { mergeEffectiveSchema } from '../../utils/effectiveSchema/mergeEffectiveSchema';

/**
 * Capture authored output independently of internal membership ownership.
 * @param schema - Fresh corpus input whose references may be borrowed by analysis.
 * @param collect - Whether to capture ordered static diagnostics.
 * @returns JSON-compatible graph, normalized schemas, key order, errors and diagnostics.
 */
export const captureOwnedInlineObservables = (
  schema: BlueprintSchema,
  collect: boolean,
): unknown => {
  const diagnostics: BlueprintDiagnostic[] = [];
  let result: unknown;
  try {
    const analysis = blueprint(
      schema,
      collect ? { collect: (value) => diagnostics.push(value) } : {},
    );
    const normalized = [];
    for (let index = 0; index < analysis.nodes.length; index++) {
      const node = analysis.nodes[index];
      const effective = mergeEffectiveSchema(node, []);
      normalized.push({
        id: node.id,
        effective,
        keys:
          typeof effective.schema === 'object'
            ? Object.keys(effective.schema)
            : [],
        fields: node.childEntries.map((entry) => entry.name),
      });
    }
    result = {
      graph: captureBlueprintObservables(analysis),
      normalized,
      root: analysis.root.id,
      schema: analysis.schema,
      capabilities: analysis.capabilities,
      isAtomic: analysis.isAtomic,
      isTerminal: analysis.isTerminal,
      diagnostics,
    };
  } catch (cause) {
    const error = cause as Error;
    result = {
      error: {
        name: error.name,
        message: error.message,
        data: JSON.parse(JSON.stringify(error)),
      },
      diagnostics,
    };
  }
  return JSON.parse(
    JSON.stringify(result, (key, value) =>
      key === 'stack' ? undefined : value,
    ),
  );
};
