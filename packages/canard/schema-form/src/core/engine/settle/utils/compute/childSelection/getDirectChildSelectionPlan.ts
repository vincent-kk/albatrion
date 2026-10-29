import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Nullable, Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type {
  Blueprint,
  BlueprintChildEntry,
  BlueprintGate,
  BlueprintNode,
} from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { engineModes } from '../../../../utils/cache/engineModes';
import { getGateExpression } from '../../gates/getGateExpression';
import { getIfGateReadNames } from '../../gates/predicates/getIfGateReadNames';
import { isStableDiscriminatorEntry } from './utils/isStableDiscriminatorEntry';
import { prepareDiscriminatorEntrySelection } from './utils/prepareDiscriminatorEntrySelection';
import type { DiscriminatorEntrySelection } from './utils/prepareDiscriminatorEntrySelection';

/** One authored evaluation position; eligible table gates use their bucket verdict. */
export interface DirectChildSelection {
  /** A discriminator's hoisted tag keeps its authored multi-declaration selector. */
  readonly general?: boolean;
  /** Strict tag-to-declaration metadata for a stable hoisted discriminator key. */
  readonly discriminatorSelection?: DiscriminatorEntrySelection;
  /** Original edge retained for creation and inactive-exit handling. */
  readonly entry: BlueprintChildEntry;
  /** Inherited host gate, absent for an ungated declaration. */
  readonly gate: Optional<BlueprintGate>;
  /** Stable declaration-ID list for an admitted edge. */
  readonly ids: readonly number[];
}

/** Single-reader metadata containing no live value or gate result. */
interface DirectChildSelectionPlan {
  /** Evaluation positions in authored candidate order. */
  readonly steps: readonly DirectChildSelection[];
  /** Ungated candidates in their original baseline order. */
  readonly baseline: readonly BlueprintChildEntry[];
}

/**
 * Prepared plans, or null for a host the general selector keeps; immutable blueprint
 * hosts own the lifetime and live records are never retained. Callers read an entry
 * here first and call {@link getDirectChildSelectionPlan} only while it is `undefined`.
 */

/**
 * Read a prepared baseline or lazily prepare eligible multi-branch union candidates.
 * A prepared decision, including null for an ineligible host, is cached; an unprepared
 * read leaves the entry absent so a later selection can still prepare it.
 * @param host - Immutable object host providing authored candidates
 * @param blueprint - Owning analysis providing compiled expression descriptors
 * @param prepare - True during mount preparation or a non-load selection visiting candidates
 * @returns Ordered metadata, or null when the general selector remains necessary
 */
export const getDirectChildSelectionPlan = (
  host: BlueprintNode,
  blueprint: Blueprint,
  prepare: boolean,
): Nullable<DirectChildSelectionPlan> => {
  const cached = getHostDerived<
    'directChildSelectionPlan',
    Nullable<DirectChildSelectionPlan>
  >(host).directChildSelectionPlan;
  if (cached !== undefined) return cached;
  if (!prepare) return null;
  const schema = host.declarations[0]?.schema;
  if (
    typeof schema !== 'object' ||
    schema === null ||
    !(
      (isArray(schema.oneOf) && schema.oneOf.length > 1) ||
      (isArray(schema.anyOf) && schema.anyOf.length > 1) ||
      (isArray(schema.allOf) &&
        schema.allOf.length > 1 &&
        (() => {
          const collection = host.childEntries;
          for (
            let cursor = 0, end = collection.length;
            cursor < end;
            cursor++
          ) {
            if (!(cursor in collection)) continue;
            const entry = collection[cursor];
            if (
              (() => {
                const values = entry.declarations;
                for (
                  let position = 0, limit = values.length;
                  position < limit;
                  position++
                ) {
                  if (!(position in values)) continue;
                  const declaration = values[position];
                  if (
                    (() => {
                      const items = declaration.gates;
                      for (
                        let index = 0, count = items.length;
                        index < count;
                        index++
                      ) {
                        if (!(index in items)) continue;
                        const gate = items[index];
                        if (gate.kind === 'if') return true;
                      }
                      return false;
                    })()
                  )
                    return true;
                }
                return false;
              })()
            )
              return true;
          }
          return false;
        })())
    )
  ) {
    getHostDerived<
      'directChildSelectionPlan',
      Nullable<DirectChildSelectionPlan>
    >(host).directChildSelectionPlan = null;
    return null;
  }
  const steps: DirectChildSelection[] = [];
  const baseline: BlueprintChildEntry[] = [];
  const names: Dictionary<true> = Object.create(null);
  for (let index = 0; index < host.childEntries.length; index++) {
    const entry = host.childEntries[index];
    const declarations = entry.declarations;
    if (
      engineModes.gatePredicate !== 'off' &&
      !hasOwnProperty(names, entry.name) &&
      isStableDiscriminatorEntry(entry, host)
    ) {
      names[entry.name] = true;
      baseline.push(entry);
      steps.push({
        entry,
        gate: undefined,
        ids: [],
        general: true,
        discriminatorSelection: prepareDiscriminatorEntrySelection(entry),
      });
      continue;
    }
    if (
      hasOwnProperty(names, entry.name) ||
      declarations.length !== 1 ||
      entry.node.kind === 'virtual' ||
      entry.node.childEntries.length > 0 ||
      entry.node.item ||
      entry.node.prefixItems?.length ||
      entry.node.declarations.length !== 1 ||
      entry.node.declarations[0].id !== declarations[0].id ||
      declarations[0].gates.length > 1 ||
      entry.node.declarations[0].gates.length !==
        declarations[0].gates.length ||
      entry.node.declarations[0].gates[0] !== declarations[0].gates[0]
    ) {
      getHostDerived<
        'directChildSelectionPlan',
        Nullable<DirectChildSelectionPlan>
      >(host).directChildSelectionPlan = null;
      return null;
    }
    const declaration = declarations[0];
    const gate = declaration.gates[0];
    if (gate) {
      const expression = getGateExpression(blueprint, gate.schemaPath);
      if (
        (engineModes.gatePredicate === 'off' && gate.kind !== 'active') ||
        gate.appliesWhen?.length ||
        gate.hostPath !== host.path ||
        gate.schemaPath ===
          appendSegment(
            appendSegment(declaration.schemaPath, 'controls'),
            'active',
          ) ||
        (gate.kind === 'active' &&
          (!expression ||
            (expression.dependencies.length !== 1 &&
              !expression.completeReads))) ||
        (gate.kind === 'if' &&
          getIfGateReadNames(gate.condition, blueprint) === undefined)
      ) {
        getHostDerived<
          'directChildSelectionPlan',
          Nullable<DirectChildSelectionPlan>
        >(host).directChildSelectionPlan = null;
        return null;
      }
    } else baseline.push(entry);
    names[entry.name] = true;
    steps.push({ entry, gate, ids: [declaration.id] });
  }
  const plan = { steps, baseline };
  getHostDerived<
    'directChildSelectionPlan',
    Nullable<DirectChildSelectionPlan>
  >(host).directChildSelectionPlan = plan;
  return plan;
};
