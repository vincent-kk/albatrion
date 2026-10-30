import type { Optional } from '@aileron/declare';

import type { NodeStrategy } from '../../types/strategy';
import type {
  BlueprintNodeKind,
  BlueprintSchema,
  BlueprintSchemaType,
} from './schema';

/** Location and ownership metadata shared by every declarative gate. */
interface BlueprintGateBase {
  /** Authored location of the condition. */
  readonly schemaPath: string;
  /** First template host; settlement rebinds it for each live occurrence. */
  readonly hostPath: string;
  /** Absolute read paths or relative parent-climb counts; context reads are excluded. */
  readonly evaluationReads: readonly (string | number)[];
  /** Select the complementary if branch without executing it. */
  readonly negated?: boolean;
  /** A `controls.fields` rule applies only while its owning declaration is active. */
  readonly appliesWhen?: readonly BlueprintGate[];
}

/** Validated tag metadata produced from explicit discriminator branches. */
type DiscriminatorCondition = {
  /** Property whose value selects the branch. */
  readonly propertyName: string;
  /** Authored tag values retained without coercion. */
  readonly values: readonly unknown[];
};

/** Declarative gate; analysis stores kind-specific conditions but never evaluates them. */
export type BlueprintGate = BlueprintGateBase &
  (
    | {
        /** Schema condition that the settlement engine must interpret. */
        readonly kind: 'if';
        /** Original condition schema remains opaque to analysis. */
        readonly condition: unknown;
      }
    | {
        /** Expression condition that the settlement engine must interpret. */
        readonly kind: 'active';
        /** Original control expression remains opaque to analysis. */
        readonly condition: unknown;
      }
    | {
        /** Explicit tag condition that the settlement engine must interpret. */
        readonly kind: 'discriminator';
        /** Validated property name and authored branch tag values. */
        readonly condition: DiscriminatorCondition;
      }
  );

/** One authored contribution to a property's existence or effective schema. */
export interface PropertyDeclaration {
  /** Root-local identity used for active declaration selection. */
  readonly id: number;
  /** Direct child name, or the empty string for the root. */
  readonly name: string;
  /** Data path of this contribution's host property. */
  readonly path: string;
  /** Authored schema location retained in diagnostics. */
  readonly schemaPath: string;
  /** Original immutable-by-contract authored object. */
  readonly schema: BlueprintSchema;
  /** Owning fragment identity; every declaration belongs to an explicit fragment. */
  readonly fragmentId: number;
  /** Separate shape declarations from constraint-only overlays. */
  readonly role: 'declaration' | 'overlay';
  /** Fragment controls govern declared direct children, never the host input. */
  readonly scope: 'node' | 'fragment';
  /** Primitive/union disjunctive constraints remain validator-only schema data. */
  readonly validationOnly: boolean;
  /** Disjunctive declarations do not constrain shared nodes. */
  readonly context: 'conjunction' | 'declaration';
  /** All conditions that must hold for this contribution. Empty means always active. */
  readonly gates: readonly BlueprintGate[];
  /** Lexicographic keyword-rank/index path, independent of object key order. */
  readonly order: readonly number[];
  /** True for overlays inherited from a referring host. */
  readonly inherited: boolean;
  /** Referring host owning inherited overlays, including reused reference templates. */
  readonly hostPath: string;
}

/** A finite authored fragment with its declaration and overlay ownership. */
export interface SchemaFragment {
  /** Root-local fragment identity. */
  readonly id: number;
  /** Referring data host retaining inherited-overlay ownership. */
  readonly hostPath: string;
  /** Original schema location. */
  readonly schemaPath: string;
  /** Authored fragment object. */
  readonly schema: BlueprintSchema;
  /** Conjunctive overlay or declaration-only branch. */
  readonly context: PropertyDeclaration['context'];
  /** Total-order keyword rank and position path. */
  readonly order: readonly number[];
  /** Conditions inherited from outer fragments and local active controls. */
  readonly gates: readonly BlueprintGate[];
  /** Property declaration IDs created directly by this fragment. */
  readonly declares: readonly number[];
  /** Constraint-only declaration IDs contributed by this fragment. */
  readonly overlays: readonly number[];
  /** Inherited overlay IDs whose owner remains hostPath. */
  readonly inheritedOverlays: readonly number[];
  /** Nested fragment IDs; references never recursively copy the target graph. */
  readonly children: readonly number[];
}

/** A schema-location template, shared rather than expanded through recursive references. */
export interface BlueprintNode {
  /** Root-local template identity. */
  readonly id: number;
  /** Data path of the first occurrence; array templates use an asterisk segment. */
  readonly path: string;
  /** Authored location used to share reference templates. */
  readonly schemaPath: string;
  /** Stable dispatch kind independent of gate state. */
  readonly kind: BlueprintNodeKind;
  /** Static accepted JSON type restriction, with null represented by nullable; undefined on virtual nodes, which have no JSON type. */
  readonly schemaType: Optional<BlueprintSchemaType>;
  /** Whether the static accepted set contains null. */
  readonly nullable: boolean;
  /** Fixed branch or terminal strategy. */
  readonly strategy: NodeStrategy;
  /** All authored contributions in total order. */
  readonly declarations: readonly PropertyDeclaration[];
  /** Canonical named edges; host bindings stay separate from reusable templates. */
  readonly childEntries: readonly BlueprintChildEntry[];
  /** At least one named property binds multiple candidate templates. */
  readonly hasPropertyCandidates?: boolean;
  /** A reachable host, including this one, binds multiple slot candidates. */
  readonly hasCandidateDescendants?: boolean;
  /** A template strictly below this one, or a control addressing its children, declares a possible explicit `unsetOnInactive` keep. */
  readonly hasKeepDescendants?: boolean;
  /** Some own or parent-addressed declaration can provide a retained exit value. */
  readonly hasInactiveValue?: boolean;
  /**
   * First repeated item candidate, retained for single-candidate consumers.
   * First candidate; paths that distinguish folds use the candidate list (itemCandidates / prefixItemCandidates / getItemEntries).
   */
  readonly item?: BlueprintNode;
  /** Repeated candidates in authored fold order, present only for multiple folds. */
  readonly itemCandidates?: readonly BlueprintNode[];
  /**
   * First tuple candidate at each position.
   * First candidate; paths that distinguish folds use the candidate list (itemCandidates / prefixItemCandidates / getItemEntries).
   */
  readonly prefixItems?: readonly BlueprintNode[];
  /** Tuple candidates in authored fold order, present when any position has multiple folds. */
  readonly prefixItemCandidates?: readonly (readonly BlueprintNode[])[];
  /** Ordered real-field names backing a virtual node. */
  readonly fields?: readonly string[];
}

/** One data-host binding of a child template, including recursive references. */
export interface BlueprintChildEntry {
  /** Direct property name, preserved even when several edges share one template. */
  readonly name: string;
  /** Reusable schema-location template; its path is an origin, not this edge's address. */
  readonly node: BlueprintNode;
  /** Referring host's authored contributions and gates; never added to another host's node. */
  readonly declarations: readonly PropertyDeclaration[];
  /** Referring data host; relative template paths are rebound at this edge. */
  readonly hostPath: string;
}
