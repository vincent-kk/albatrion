import { resetEngineDerivedRecords } from './derivedRecords';

/** Internal controls; package entry points never expose modes or reset hooks. */
interface Modes {
  gateSelection: 'table' | 'off' | 'verify';
  gateWheel: 'skip' | 'record' | 'shadow';
  deriveShadow: boolean;
}
const modes: Modes = {
  gateSelection: 'table',
  gateWheel: 'skip',
  deriveShadow: false,
};
/** All mode changes pass through setMode; counters remain with their producers. */
export const engineModes = {
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
