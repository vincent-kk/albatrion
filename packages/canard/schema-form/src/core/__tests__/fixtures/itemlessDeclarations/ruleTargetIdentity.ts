/** Verification-only owner shape: canonical references belong to the existing capture codec. */
interface RuleOwner {
  /** Current path used by committed rule metadata. */
  path: string;
  /** Blueprint kind used by the producer's full identity. */
  blueprintNode: { kind: string };
}

/** Resolve only existing producer IDs; never guess a latest path or allocate an identity. */
export function createRuleTargetIdentity<Node extends RuleOwner>(
  known: () => readonly Node[],
  readExistingId: (node: Node) => number | undefined,
  nodes: WeakMap<object, number>,
): (key: string) => string {
  return (key) => {
    const parts: unknown = JSON.parse(key);
    if (!Array.isArray(parts) || parts.length !== 8) return key;
    if (typeof parts[7] !== 'number' || !Number.isSafeInteger(parts[7]))
      throw new Error('Invalid rule owner ID: ' + key);
    const owners = known().filter((node) => readExistingId(node) === parts[7]);
    if (owners.length !== 1)
      throw new Error('Unknown or ambiguous rule owner: ' + key);
    const owner = owners[0];
    if (owner.path !== parts[5])
      throw new Error('Conflicting rule owner path: ' + key);
    if (owner.blueprintNode.kind !== String(parts[6]).split(':')[0])
      throw new Error('Conflicting rule owner kind: ' + key);
    const local = nodes.get(owner);
    if (local === undefined)
      throw new Error('Unreachable rule owner codec reference: ' + key);
    return JSON.stringify([...parts.slice(0, 7), ['occurrence', local]]);
  };
}

/** Check independent raw stores before normalization can hide a missing or conflicting edge. */
export function assertRuleIndexes(
  rules: ReadonlyMap<string, unknown> | undefined,
  sources: ReadonlyMap<string, ReadonlySet<string>> | undefined,
  targets: ReadonlyMap<string, ReadonlySet<string>> | undefined,
): void {
  for (const key of rules?.keys() ?? []) {
    const parts = JSON.parse(key) as unknown[];
    if (!sources?.get(String(parts[0]))?.has(key))
      throw new Error('Missing rule source membership: ' + key);
    if (
      parts.length === 8 &&
      typeof parts[5] === 'string' &&
      !targets?.get(parts[5])?.has(key)
    )
      throw new Error('Missing rule target membership: ' + key);
  }
  for (const [source, keys] of sources ?? [])
    for (const key of keys) {
      if (!rules?.has(key)) throw new Error('Orphan rule source key: ' + key);
      if (JSON.parse(key)[0] !== source)
        throw new Error('Conflicting rule source index: ' + key);
    }
  for (const [target, keys] of targets ?? [])
    for (const key of keys) {
      if (!rules?.has(key)) throw new Error('Orphan rule target key: ' + key);
      const parts = JSON.parse(key) as unknown[];
      if (parts.length !== 8 || parts[5] !== target)
        throw new Error('Conflicting rule target index: ' + key);
    }
}
