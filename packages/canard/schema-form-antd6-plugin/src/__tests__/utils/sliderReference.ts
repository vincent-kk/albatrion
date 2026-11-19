/** Independent decimal reference: every input number is an integer count of billionths. */
export const sliderReference = (schema: {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}) => {
  const scale = 1000000000n;
  const units = (value: number) => BigInt(Math.round(value * Number(scale)));
  const lower = Math.max(
    schema.minimum ?? -Infinity,
    schema.exclusiveMinimum ?? -Infinity,
  );
  const upper = Math.min(
    schema.maximum ?? Infinity,
    schema.exclusiveMaximum ?? Infinity,
  );
  const low = units(Number.isFinite(lower) ? lower : 0);
  const high = units(Number.isFinite(upper) ? upper : 100);
  const strictLow =
    schema.exclusiveMinimum !== undefined && lower === schema.exclusiveMinimum;
  const strictHigh =
    schema.exclusiveMaximum !== undefined && upper === schema.exclusiveMaximum;
  let increment = units(schema.multipleOf ?? 1);
  if (schema.type === 'integer') {
    let a = increment,
      b = scale;
    while (b) {
      const rest = a % b;
      a = b;
      b = rest;
    }
    increment = (increment / a) * scale;
  }
  const anchor =
    schema.multipleOf !== undefined || schema.type === 'integer' ? 0n : low;
  const floor = (n: bigint) =>
    n >= 0n ? n / increment : -((-n + increment - 1n) / increment);
  let start = floor(low - anchor);
  while (
    anchor + start * increment < low ||
    (strictLow && anchor + start * increment === low)
  )
    start++;
  let finish = floor(high - anchor);
  while (
    anchor + finish * increment > high ||
    (strictHigh && anchor + finish * increment === high)
  )
    finish--;
  const first = anchor + start * increment;
  const last =
    schema.multipleOf === undefined && schema.type === 'number' && !strictHigh
      ? high
      : anchor + finish * increment;
  const empty = first > high || (strictHigh && first === high) || first > last;
  const number = (value: bigint) => Number(value) / Number(scale);
  const valid = (value: number) => {
    const n = units(value);
    if (Number(n) / Number(scale) !== value) return false;
    return (
      !empty &&
      n >= low &&
      n <= high &&
      (!strictLow || n > low) &&
      (!strictHigh || n < high) &&
      (schema.type !== 'integer' || Number.isInteger(value)) &&
      (schema.multipleOf === undefined || n % units(schema.multipleOf) === 0n)
    );
  };
  const expected = (
    current: number | undefined,
    key: string,
    shift = false,
  ) => {
    if (empty) return undefined;
    if (key === 'Home') return number(first);
    if (key === 'End') return number(last);
    const currentUnits = units(current ?? number(first));
    const up = key === 'ArrowRight' || key === 'ArrowUp' || key === 'PageUp';
    const count = key.startsWith('Page') || shift ? 10n : 1n;
    const index = up
      ? floor(currentUnits - anchor) + count
      : -floor(anchor - currentUnits) - count;
    const target = anchor + index * increment;
    return number(target < first ? first : target > last ? last : target);
  };
  return {
    min: number(first),
    max: number(last),
    step: number(increment),
    anchor: number(anchor),
    empty,
    valid,
    expected,
  };
};
