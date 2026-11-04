import type { BlueprintSchema } from '../../../engine';
import { blueprint } from '../../../engine';
import { mountFieldNode } from '../../utils/binding/mountFieldNode';
import { fieldNodeFactory } from '../../utils/fieldNodeFactory';

/**
 * Mount a genuine node tree for public vocabulary contracts.
 * @param schema - Authored schema compiled by the shipping engine
 * @param value - Root input retained by the load
 * @param context - Functions and values available to authored expressions
 * @returns The public root after its first load commit
 */
export const makeVocabularyTree = (
  schema: BlueprintSchema,
  value: unknown,
  context: Readonly<Record<string, unknown>> = {},
) => {
  const root = fieldNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: value,
    context,
  });
  mountFieldNode(root, value);
  return root;
};
