import { resetEngineDerivedRecords } from './derivedRecords';

/** Internal controls; package entry points never expose modes or reset hooks. */
interface Modes {
  /** Retained instances, the latent reference path, or public-result comparison. */
  slots: 'on' | 'off' | 'verify';
  /** Shipped pure-input reuse or the full-input reference path. */
  gatePredicate: 'on' | 'off';
  gateSelection: 'table' | 'off' | 'verify';
  gateWheel: 'skip' | 'record' | 'shadow';
  deriveShadow: boolean;
}
const modes: Modes = {
  slots: 'on',
  gatePredicate: 'on',
  gateSelection: 'table',
  gateWheel: 'skip',
  deriveShadow: false,
};
/** All mode changes pass through setMode; counters remain with their producers. */
export const engineModes = {
  /** Read the private source representation selected before tree construction. */
  get slots(): Modes['slots'] {
    return modes.slots;
  },
  /** Read the private predicate control selected before tree construction. */
  get gatePredicate(): Modes['gatePredicate'] {
    return modes.gatePredicate;
  },
  get gateSelection(): Modes['gateSelection'] {
    return modes.gateSelection;
  },
  get gateWheel(): Modes['gateWheel'] {
    return modes.gateWheel;
  },
  get deriveShadow(): boolean {
    return modes.deriveShadow;
  },
  /** Set before building trees; changing this test/bench control invalidates existing tree contexts. */
  setMode<Name extends keyof Modes>(name: Name, value: Modes[Name]): void {
    if (modes[name] === value) return;
    modes[name] = value;
    resetEngineDerivedRecords();
  },
};
