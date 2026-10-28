import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { HostStaticPartition } from '../../../../../blueprint';
import type {
  Blueprint,
  BlueprintChildEntry,
  BlueprintNode,
} from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import { getHostDerived } from '../../../../../utils/cache/derivedRecords';
import { engineModes } from '../../../../../utils/cache/engineModes';
import type { GateSelectionTable } from '../../../../types/gateSelectionTable';
import type { SettlementContext } from '../../../../types/settlement';
import type { getDirectChildSelectionPlan } from '../getDirectChildSelectionPlan';
import { staticShape } from '../staticShape';
import type { StaticShapeEntry } from '../staticShape';

/** The fixed baseline contains always-active occurrences, never gate verdicts. */
export interface PreparedStaticHost<Self> {
  readonly blueprint: Blueprint;
  readonly template: BlueprintNode;
  readonly path: string;
  readonly baseline: Record<string, Self>;
  readonly entries: ReadonlyMap<string, StaticShapeEntry>;
  /** Ungated child list, constructed once with the fixed baseline. */
  readonly baselineChildren: readonly Self[];
  /** Dynamic candidates retain blueprint author order even without a direct plan. */
  readonly dynamicEntries: readonly BlueprintChildEntry[];
  /** Last ordinary shape and child list, never mutated by an in-progress selection. */
  selectedStructure: Record<string, Self>;
  selectedChildren: readonly Self[];
  /** Previous dynamic names are used only for cleanup, not to admit children. */
  dynamicNames: readonly string[];
  /** Unsupported always-visited steps remain in authored order. */
  readonly alwaysSteps: readonly number[];
}

/**
 * Validate a fixed static baseline once per eligible live object-host lifetime.
 * @param node - Host with a unique static partition and immutable templates
 * @param prior - Previously published structure used only as occurrence witnesses
 * @param context - Load, distribution and path changes invalidate the witnesses
 * @param hasRelocated - Relocated gates force the original selection path
 * @returns Prepared baseline, or undefined when the original path is required
 */
export const prepareStaticHost = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  prior: Record<string, Self>,
  context: SettlementContext<Self>,
  hasRelocated: boolean,
): PreparedStaticHost<Self> | undefined => {
  const record = getHostDerived<'preparedStaticHost', PreparedStaticHost<Self>>(
    node,
  );
  if (
    node.behavior.type !== 'object' ||
    context.kind === 'load' ||
    context.distributedInputs.has(node) ||
    context.pathChanges.length > 0 ||
    hasRelocated ||
    context.failures?.length
  ) {
    delete record.preparedStaticHost;
    return undefined;
  }
  let prepared = record.preparedStaticHost;
  if (
    prepared &&
    (prepared.blueprint !== node.runtime.blueprint ||
      prepared.template !== node.blueprintNode ||
      prepared.path !== node.path)
  ) {
    delete record.preparedStaticHost;
    prepared = undefined;
  }
  const verify = engineModes.gateSelection === 'verify';
  if (prepared && !verify) {
    (context.preparedStaticHosts ??= new Set()).add(node);
    return prepared;
  }
  const partition = HostStaticPartition.get(node.blueprintNode);
  if (
    !partition.gated ||
    partition.hasGatedOverlays ||
    !partition.staticEntries.length
  )
    return undefined;
  const plan = getHostDerived<
    'directChildSelectionPlan',
    ReturnType<typeof getDirectChildSelectionPlan>
  >(node.blueprintNode).directChildSelectionPlan;
  const shape = staticShape(
    node.blueprintNode,
    node.runtime.blueprint.isAtomic,
    partition.staticEntries,
  );
  if (!shape || shape.length !== partition.staticEntries.length)
    return undefined;
  const baseline: Record<string, Self> = Object.create(null);
  const entries = new Map<string, StaticShapeEntry>();
  for (const selected of shape) {
    const { entry, schema } = selected;
    const child = prior[entry.name];
    if (
      !child ||
      child.parent !== node ||
      child.name !== entry.name ||
      child.path !== appendSegment(node.path, entry.name) ||
      child.blueprintNode !== entry.node ||
      child.schema !== schema ||
      !child.active ||
      child.detached ||
      (prepared && prepared.baseline[entry.name] !== child)
    ) {
      if (prepared && verify) throw new Error('Static host witness mismatch');
      return undefined;
    }
    baseline[entry.name] = child;
    entries.set(entry.name, selected);
  }
  if (prepared) {
    (context.preparedStaticHosts ??= new Set()).add(node);
    return prepared;
  }
  prepared = {
    blueprint: node.runtime.blueprint,
    template: node.blueprintNode,
    path: node.path,
    baseline,
    entries,
    baselineChildren: Object.values(baseline),
    dynamicEntries: node.blueprintNode.childEntries.filter(
      (entry) => !entries.has(entry.name),
    ),
    selectedStructure: prior,
    selectedChildren: node.children ?? [],
    dynamicNames: Object.keys(prior).filter((name) => !entries.has(name)),
    alwaysSteps: (
      getHostDerived<'gateSelectionTable', GateSelectionTable | null>(
        node.blueprintNode,
      ).gateSelectionTable?.alwaysSteps ?? []
    ).filter((index) => plan && !entries.has(plan.steps[index].entry.name)),
  };
  record.preparedStaticHost = prepared;
  (context.preparedStaticHosts ??= new Set()).add(node);
  return prepared;
};
