import type { BlueprintNodeKind, PropertyDeclaration } from '../../type';
import { readSchemaObject } from '../analyze/readSchemaObject';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';

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
): 'branch' | 'terminal' => {
  const count = declarations.filter(
    (declaration) => declaration.role === 'declaration',
  ).length;
  const relevant = declarations.filter(
    (declaration) =>
      declaration.context === 'conjunction' ||
      declaration.gates.length > 0 ||
      count === 1,
  );
  if (kind !== 'object' && kind !== 'array') {
    const terminal = kind !== 'virtual';
    for (const declaration of relevant) {
      const value = readSchemaObject(declaration.schema).options?.terminal;
      if (value !== undefined && value !== terminal)
        throwBlueprintError(
          BlueprintErrorCode.TerminalOptionUnsupported,
          declaration.schemaPath,
          { type: kind, value },
          context.options,
        );
    }
    return terminal ? 'terminal' : 'branch';
  }
  const root: StrategyCase = { children: new Map(), hasDeclaration: false };
  relevant.forEach((declaration, index) => {
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
    if (explicit !== undefined) current.explicit = { index, value: explicit };
    if (renderer !== undefined) current.renderer = { index, value: renderer };
    current.hasDeclaration ||= declaration.role === 'declaration';
    current.schemaPath = declaration.schemaPath;
  });
  let strategy: boolean | undefined;
  const pending = [root];
  while (pending.length) {
    const current = pending.pop()!;
    if (current.hasDeclaration && current.schemaPath !== undefined) {
      const terminal =
        current.explicit?.value ?? current.renderer?.value ?? false;
      if (strategy !== undefined && strategy !== terminal)
        throwBlueprintError(
          BlueprintErrorCode.TerminalStrategyMismatch,
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
