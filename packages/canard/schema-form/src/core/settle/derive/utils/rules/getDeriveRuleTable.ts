import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintNode } from '../../../../blueprint';
import type { DeriveRule, DeriveRuleTable } from '../../type';
import { getWatchPaths } from './utils/getWatchPaths';

/** Rule tables follow the immutable analysis lifetime. */
const TABLES = new WeakMap<Blueprint, DeriveRuleTable>();
/** Rule-free analyses share a read-only empty table. */
const EMPTY_TABLE: DeriveRuleTable = { rules: Object.freeze([]), byDeclaration: new Map() };
/** Keys whose string expression is evaluated by the first derive unit. */
const RULE_KEYS = ['derived', 'unsetValue', 'resetInteraction'] as const;

/** One control group and one directly addressed target. */
interface RuleGroup {
  /** Controls object containing the authored values. */
  readonly controls: object;
  /** Schema location used to match the compiled expression. */
  readonly schemaPath: string;
  /** Specificity of the addressed declaration. */
  readonly layer: DeriveRule['layer'];
  /** Target name for a parent-scoped rule. */
  readonly targetName?: string;
  /** Fragment child declarations that must still be selected. */
  readonly targetDeclarationIds?: readonly number[];
  /** Target template whose watches extend a derived expression. */
  readonly targetNode: BlueprintNode;
}

/**
 * Build the authored rule templates once for one analysis.
 * @param blueprint - Immutable schema analysis and compiled expressions
 * @returns Memoized templates, with an empty rule list for rule-free schemas
 */
export const getDeriveRuleTable = (blueprint: Blueprint): DeriveRuleTable => {
  const cached = TABLES.get(blueprint);
  if (cached) return cached;
  const rules: DeriveRule[] = [];
  const byDeclaration = new Map<number, DeriveRule[]>();
  for (const node of blueprint.nodes)
    for (const declaration of node.declarations) {
      const schema = declaration.schema;
      const controls = schema && typeof schema === 'object' ?
        Reflect.get(schema, 'controls') : undefined;
      if (!controls || typeof controls !== 'object' || isArray(controls)) continue;
      const groups: RuleGroup[] = [];
      if (declaration.scope === 'fragment') {
        for (const entry of node.childEntries) {
          const selected = entry.declarations.filter((child) =>
            child.schemaPath.startsWith(`${declaration.schemaPath}/properties/`) ||
            child.schemaPath.startsWith(`${declaration.schemaPath}/items/`) ||
            child.schemaPath.startsWith(`${declaration.schemaPath}/prefixItems/`));
          if (selected.length) groups.push({ controls,
            schemaPath: `${declaration.schemaPath}/controls`, layer: 'fragment',
            targetName: entry.name,
            targetDeclarationIds: selected.map((child) => child.id),
            targetNode: entry.node });
        }
      } else groups.push({ controls,
        schemaPath: `${declaration.schemaPath}/controls`, layer: 'node',
        targetNode: node });
      const children: unknown = Reflect.get(controls, 'children');
      if (isArray(children))
        for (let index = 0; index < children.length; index++) {
          const item: unknown = children[index];
          if (!item || typeof item !== 'object') continue;
          const itemControls: unknown = Reflect.get(item, 'controls');
          const names: unknown = Reflect.get(item, 'targets');
          if (!itemControls || typeof itemControls !== 'object' || !isArray(names))
            continue;
          for (const name of names) {
            if (typeof name !== 'string') continue;
            const target = node.childEntries.find((entry) => entry.name === name);
            if (target) groups.push({ controls: itemControls,
              schemaPath: `${declaration.schemaPath}/controls/children/${index}/controls`,
              layer: 'children', targetName: name, targetNode: target.node });
          }
        }
      for (const group of groups)
        for (const kind of RULE_KEYS) {
          const literal: unknown = Reflect.get(group.controls, kind);
          if (literal === undefined) continue;
          const schemaPath = `${group.schemaPath}/${kind}`;
          const expression = blueprint.expressions.find((candidate) =>
            candidate.declarationId === declaration.id &&
            candidate.schemaPath === schemaPath && candidate.key === kind);
          if (typeof literal === 'string' && !expression) continue;
          const dependencies = [...expression?.dependencies ?? []];
          const watchDependencies = kind === 'derived' ?
            getWatchPaths(group.targetNode) : [];
          if (kind === 'derived')
            for (const watch of watchDependencies)
              if (!dependencies.includes(watch)) dependencies.push(watch);
          const rule: DeriveRule = { declarationId: declaration.id, kind,
            schemaPath, layer: group.layer, targetName: group.targetName,
            targetDeclarationIds: group.targetDeclarationIds,
            dependencies, watchDependencies, expression, literal };
          rules.push(rule);
          const owned = byDeclaration.get(declaration.id) ?? [];
          owned.push(rule);
          byDeclaration.set(declaration.id, owned);
        }
    }
  const table: DeriveRuleTable = rules.length ? { rules, byDeclaration } : EMPTY_TABLE;
  TABLES.set(blueprint, table);
  return table;
};
