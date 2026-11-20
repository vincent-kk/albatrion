/**
 * Seed selection for a generated or model test.
 *
 * Locally and in the pre-release tier every seed from 1 to `total` runs. The pr tier's `test:pr`
 * script sets SCHEMA_FORM_TEST_TIER=pr, and then the sampler accepts, in seed order, only the first
 * `quota` seeds of each declared class, so every class is still drawn while the run stays bounded.
 * A test computes a seed's class from its first draws, asks `accept`, and skips the rest of a seed
 * the sampler refuses.
 * @param total - Last seed of the complete range
 * @param classes - Every class a seed can fall into; `accept` throws for an undeclared one
 * @param quota - Seeds per class in the pr profile
 * @returns The sampler: `has` drives the seed loop, `accept` admits a seed of a class, `shortfall`
 * lists the classes the run drew fewer times than its profile requires (`quota` in the pr tier, 1
 * otherwise), and `label` names the profile for the test title
 */
export const createSeedSampler = (
  total: number,
  classes: readonly string[],
  quota: number,
) => {
  const isBounded = process.env.SCHEMA_FORM_TEST_TIER === 'pr';
  const counts = new Map(classes.map((name) => [name, 0]));
  const required = isBounded ? quota : 1;
  return {
    has: (seed: number) =>
      seed <= total &&
      !(isBounded && [...counts.values()].every((count) => count >= quota)),
    accept: (name: string) => {
      const count = counts.get(name);
      if (count === undefined) throw new Error(`undeclared seed class ${name}`);
      if (isBounded && count >= quota) return false;
      counts.set(name, count + 1);
      return true;
    },
    shortfall: () =>
      classes.filter((name) => (counts.get(name) ?? 0) < required),
    label: isBounded
      ? `${classes.length * quota} stratified seeds (${classes.length} classes x ${quota})`
      : `${total} seeds`,
  };
};
