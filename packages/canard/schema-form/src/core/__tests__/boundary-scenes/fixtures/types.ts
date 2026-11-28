import type { AuthoredSchema } from '../../../engine';

/**
 * How one scene runs its steps.
 * - `sequential`: every step is a separate public call.
 * - `batch`: the steps after the leading `note` steps run inside one `root.batch`.
 * - `fresh`: a new form loads the sources the sequential run ends with; only path probes are read.
 */
export type SceneMode = 'sequential' | 'batch' | 'fresh';

/**
 * Readings of one run, keyed by probe token. A reading taken at a `note` step is keyed `<label>: <token>`.
 * Path probes of an absent node read {@link ABSENT}.
 */
export type Observation = Readonly<Record<string, unknown>>;

/** The exact readings of every mode a scene lists. */
export type ModeObservations = Readonly<
  Partial<Record<SceneMode, Observation>>
>;

/** Reading of a path probe whose node does not exist. */
export const ABSENT = '(absent)';

/**
 * One public operation of a scene, applied to the node at a JSON Pointer of the root.
 * A step that throws is recorded under the `thrown` probe and the run continues.
 */
export type SceneStep =
  /** `setValue`, as Merge when `merge` is set; `hidden` adds non-enumerable own keys, `throwAt` a throwing getter. */
  | {
      set: string;
      value: unknown;
      merge?: true;
      hidden?: Readonly<Record<string, unknown>>;
      throwAt?: string;
    }
  /** `setValue` with an updater that appends `value` to the array it receives; the received value is read by `updater`. */
  | { append: string; value: unknown }
  /** An input-origin write, as a bound input delivers it. */
  | { input: string; value: unknown }
  /** `push` on an array node. */
  | { push: string; value: unknown }
  /** `resetSubtree` on the node. */
  | { reset: string }
  /** A form reload with a new load snapshot. */
  | { reload: unknown }
  /** A context change of the form. */
  | { context: Readonly<Record<string, unknown>> }
  /** `setValue` through a reference taken right after the load (see `BoundarySceneBase.hold`). */
  | { setHeld: string; value: unknown }
  /** Run the form validation and wait for it (needs `BoundarySceneBase.validates`). */
  | { validate: true }
  /** Read every probe now, keyed `<label>: <token>`; the `refresh` probes then start over. */
  | { note: string };

/**
 * Shared fields of a boundary scene: what is run and what is read.
 * Probe tokens (`<path>` is a JSON Pointer, `<name>` a held reference):
 * `value <path>`, `types <path>` (effective type list), `source <path>`, `schema.<keyword> <path>`,
 * `inactive <path>` (retained inactive values at the path), `find <path>` (whether `find` returns a node),
 * `errors <path>` (schema paths of the node's validation errors), `refresh <path>` (whether the node received a
 * Refresh since the load or the last `note`), `detached <name>`,
 * `log` (values the schema callbacks received after the load), `updater` (values `append` updaters received),
 * `thrown` (`<where> <code or message>` of thrown errors), `reports` (`<level> <code> <origin>` of every
 * delivered record), `status` and `budget` (the root diagnostics), `names <path>` (whether the details of the last
 * thrown error name the path).
 */
export interface BoundarySceneBase {
  /** Stable `<area>/<what-it-guards>`; never reused for another scene. */
  id: string;
  /** What reported the scene, in one line. */
  origin: string;
  /** The authored schema; a function receives the log that the `log` probe reads. */
  schema: AuthoredSchema | ((log: (value: unknown) => void) => AuthoredSchema);
  /** The load snapshot of the mount. */
  load: unknown;
  /** The form context at the mount. */
  context?: Readonly<Record<string, unknown>>;
  /** Mount with validation on request; every scene has the AJV test validator, which `if` gates need. */
  validates?: true;
  /** References taken right after the load, by name. */
  hold?: Readonly<Record<string, string>>;
  steps: readonly SceneStep[];
  probes: readonly string[];
  /** Modes the scene runs in; `fresh` only where no documented class of difference applies. */
  modes: readonly SceneMode[];
}

/**
 * A boundary scene: a place where two features meet and a wrong result was once observed.
 * Exactly one state applies:
 * - `expected`: the correct result; every mode must read `expected`.
 * - `known`: the engine is wrong today; every mode must read its `known` entry exactly, which differs from
 *   `expected` and names the defect. The change that fixes the defect turns the scene into `expected`.
 * - `open`: the correct result is not decided; every mode must read its `pinned` entry exactly.
 * The ledger test lists the ids of each state, so a change of state shows in review.
 */
export type BoundaryScene = BoundarySceneBase &
  (
    | { state: 'expected'; expected: Observation }
    | {
        state: 'known';
        expected: Observation;
        known: ModeObservations;
        defect: string;
      }
    | { state: 'open'; pinned: ModeObservations; reason: string }
  );
