/** Stable, per-run reference numbering used to compare relationships across independent trees. */
export class ObservationCodec {
  /** Object identities survive multiple captures so retained references stay distinguishable. */
  readonly identities = new WeakMap<object, number>();
  /** Node references use occurrence numbers rather than serializing their cyclic runtimes. */
  readonly nodes = new WeakMap<object, number>();
  /** Next graph-local object number; never shared by forms. */
  private next = 1;

  /** Return a stable graph-local reference number for an object. */
  id(value: unknown): number | null {
    if (
      (typeof value !== 'object' || value === null) &&
      typeof value !== 'function'
    )
      return null;
    const prior = this.identities.get(value);
    if (prior !== undefined) return prior;
    const id = this.next++;
    this.identities.set(value, id);
    return id;
  }

  /** Encode contents and aliases without losing sparse slots, own undefined, NaN or negative zero. */
  encode(value: unknown): unknown {
    const seen = new WeakSet<object>();
    const visit = (input: unknown): unknown => {
      if (input === undefined) return ['undefined'];
      if (typeof input === 'number') {
        if (Number.isNaN(input)) return ['number', 'NaN'];
        if (Object.is(input, -0)) return ['number', '-0'];
        if (!Number.isFinite(input)) return ['number', String(input)];
      }
      if (typeof input === 'function') return ['function', String(input)];
      if (input === null || typeof input !== 'object') return input;
      const node = this.nodes.get(input);
      if (node !== undefined) return ['node', node];
      const id = this.id(input);
      if (seen.has(input)) return ['ref', id];
      seen.add(input);
      if (input instanceof Error) {
        const error = input as Error & { code?: unknown; details?: unknown };
        return [
          'error',
          input.name,
          input.message,
          visit(error.code),
          visit(error.details),
        ];
      }
      if (input instanceof Map)
        return [
          'map',
          id,
          Array.from(input, ([key, item]) => [visit(key), visit(item)]),
        ];
      if (input instanceof Set) return ['set', id, Array.from(input, visit)];
      return [
        Array.isArray(input) ? 'array' : 'object',
        id,
        Array.isArray(input) ? input.length : null,
        Object.keys(input).map((key) => [key, visit(Reflect.get(input, key))]),
      ];
    };
    return visit(value);
  }
}

/** Compare typed observations and fail with the scenario/step that changed. */
export function assertObservationEqual(
  left: unknown,
  right: unknown,
  label: string,
): void {
  if (JSON.stringify(left) !== JSON.stringify(right))
    throw new Error(
      'ITEMLESS_OBSERVATION_DIFFERENCE: ' +
        label +
        ' ' +
        firstDifference(left, right),
    );
}

/** Find the first typed-codec discrepancy without flooding the diagnostic with full graphs. */
function firstDifference(left: unknown, right: unknown, at = '$'): string {
  if (Object.is(left, right)) return '';
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    for (const key of [...Object.keys(left), ...Object.keys(right)]) {
      const difference = firstDifference(
        Reflect.get(left, key),
        Reflect.get(right, key),
        at + '/' + key,
      );
      if (difference) return difference;
    }
    return '';
  }
  return at + ': ' + JSON.stringify([left, right]);
}
