import type { Fn } from '@aileron/declare';

export const voidFunction: Fn = () => void 0;

export const undefinedFunction: Fn<[], undefined> = () => undefined;

export const nullFunction: Fn<[], null> = () => null;

export const falseFunction: Fn<[], false> = () => false;

export const trueFunction: Fn<[], true> = () => true;

export const identityFunction = <T>(value: T): T => value;

export const noopFunction = () => void 0;
