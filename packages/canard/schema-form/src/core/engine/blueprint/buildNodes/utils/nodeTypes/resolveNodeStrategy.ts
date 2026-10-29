import { filter as filterArray } from '@winglet/common-utils/array';

import type { Optional } from '@aileron/declare';

import { FormErrorCode } from '../../../../../../errors';
import type { NodeStrategy } from '../../../../types/strategy';
import type { AnalysisContext } from '../../../types/analysis';
import type { PropertyDeclaration } from '../../../types/node';
import type { BlueprintNodeKind } from '../../../types/schema';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';

/**
 * Compare reduced gate-consistent cases without evaluating any authored control.
 * @param context - Injected renderer predicate and error consumer
 * @param kind - Static dispatch kind
 * @param declarations - Authored contributions in total order
 * @returns A stable terminal/branch strategy, or throws on inconsistent cases
 */

export const resolveNodeStrategy = (
  context: AnalysisContext,
  kind: BlueprintNodeKind,
  declarations: readonly PropertyDeclaration[],
): NodeStrategy => {
  const count = filterArray(
    declarations,
    (declaration) => declaration.role === 'declaration',
  ).length;
  const relevant = filterArray(
    declarations,
    (declaration) =>
      !declaration.validationOnly &&
      (declaration.context === 'conjunction' ||
        (count === 1 && declaration.role === 'declaration')),
  );
  if (kind !== 'object' && kind !== 'array') {
    const terminal = kind !== 'virtual';
    for (const declaration of relevant) {
      const value = readSchemaObject(declaration.schema).options?.terminal;
      if (value !== undefined && value !== terminal)
        throwBlueprintError(
          FormErrorCode.TerminalOptionUnsupported,
          declaration.schemaPath,
          { type: kind, value },
          context.options,
        );
    }
    return terminal ? 'terminal' : 'branch';
  }
  const root: StrategyCase = { children: new Map(), hasDeclaration: false };
  {
    const items = relevant;
    for (let index = 0, count = items.length; index < count; index++) {
      const declaration = items[index];

      {
        let current = root;
        for (const gate of declaration.gates) {
          const key = JSON.stringify([
            gate.kind,
            gate.schemaPath,
            gate.hostPath,
            gate.negated,
          ]);
          let child = current.children.get(key);
          if (!child) {
            child = { children: new Map(), hasDeclaration: false };
            current.children.set(key, child);
          }
          current = child;
        }
        const explicit = readSchemaObject(declaration.schema).options?.terminal;
        const renderer = context.options.isTerminal?.(declaration.schema);
        if (explicit !== undefined)
          current.explicit = { index, value: explicit };
        if (renderer !== undefined)
          current.renderer = { index, value: renderer };
        current.hasDeclaration ||= declaration.role === 'declaration';
        current.schemaPath = declaration.schemaPath;
      }
    }
  }
  let strategy: Optional<boolean>;
  const pending = [root];
  while (pending.length) {
    const current = pending.pop()!;
    if (current.hasDeclaration && current.schemaPath !== undefined) {
      const terminal =
        current.explicit?.value ?? current.renderer?.value ?? false;
      if (strategy !== undefined && strategy !== terminal)
        throwBlueprintError(
          FormErrorCode.TerminalStrategyMismatch,
          current.schemaPath,
          { type: kind },
          context.options,
        );
      strategy = terminal;
    }
    for (const child of current.children.values()) {
      child.hasDeclaration ||= current.hasDeclaration;
      if ((current.explicit?.index ?? -1) > (child.explicit?.index ?? -1))
        child.explicit = current.explicit;
      if ((current.renderer?.index ?? -1) > (child.renderer?.index ?? -1))
        child.renderer = current.renderer;
      pending.push(child);
    }
  }
  return strategy ? 'terminal' : 'branch';
};

/** Gate-prefix summaries keep total work bounded by declarations times ancestry depth. */
interface StrategyCase {
  children: Map<string, StrategyCase>;
  hasDeclaration: boolean;
  schemaPath?: string;
  explicit?: { index: number; value: boolean };
  renderer?: { index: number; value: boolean };
}
