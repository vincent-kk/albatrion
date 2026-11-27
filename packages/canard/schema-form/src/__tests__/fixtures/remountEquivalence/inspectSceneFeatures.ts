import type { RemountScene, RemountWrite } from './types';

/**
 * Derive coverage from authored schema and writes, without trusting generator tags.
 * @param scene - Pure schema and operation data.
 * @returns Unique feature names in discovery order.
 */
export function inspectSceneFeatures(scene: RemountScene): string[] {
  const features: string[] = [];
  const references: string[] = [];
  const pending: { value: unknown; arrays: number }[] = [
    { value: scene.schema, arrays: 0 },
  ];
  while (pending.length) {
    const { value, arrays } = pending.pop()!;
    if (!value || typeof value !== 'object') continue;
    const record = value as Record<string, unknown>;
    const depth = arrays + (record.type === 'array' ? 1 : 0);
    if (depth > 1) features.push('schema.nestedArrays');
    if (Array.isArray(record.type)) {
      features.push('schema.union');
      if (record.type.includes('null')) features.push('schema.nullable');
    }
    if (typeof record.$ref === 'string') references.push(record.$ref);
    for (const [key, child] of Object.entries(record)) {
      if (
        [
          'if',
          'then',
          'else',
          'dependentSchemas',
          'oneOf',
          'anyOf',
          'items',
          'prefixItems',
          'additionalItems',
        ].includes(key)
      )
        features.push(`schema.${key}`);
      if (key === 'controls' && child && typeof child === 'object')
        features.push(...Object.keys(child).map((name) => `control.${name}`));
      if (key === 'options' && child && typeof child === 'object')
        features.push(...Object.keys(child).map((name) => `option.${name}`));
      if (key === 'properties' && child && typeof child === 'object')
        features.push(
          ...Object.keys(child)
            .filter((name) => ['*', '*x', '~', '/'].includes(name))
            .map((name) => `name.${name}`),
        );
      if (typeof child === 'string') {
        if (child.includes('||')) features.push('expression.or');
        if (child.includes('.includes(')) features.push('expression.includes');
        if (child.includes('#/')) features.push('expression.absolute');
        if (child.includes('../../')) features.push('expression.ancestor');
        if (child.includes('(@)')) features.push('expression.context');
      }
      if (typeof child === 'object')
        pending.push({ value: child, arrays: depth });
    }
  }
  if (
    references.some(
      (reference, index) => references.indexOf(reference) !== index,
    )
  )
    features.push('schema.recursiveRef');
  const root = scene.schema as { properties?: object };
  if (
    scene.initialValue &&
    typeof scene.initialValue === 'object' &&
    Object.keys(scene.initialValue).some(
      (key) => !Object.keys(root.properties ?? {}).includes(key),
    )
  )
    features.push('value.extras');
  const writes: RemountWrite[] = [...scene.writes];
  while (writes.length) {
    const write = writes.pop()!;
    features.push(`write.${write.action}`);
    if (write.value === null) features.push('write.null');
    if (write.path === '/n' && write.value && typeof write.value === 'object')
      features.push('write.wrongKind');
    if (write.option === 4) features.push('write.disableAutomaticWrites');
    if (write.writes) writes.push(...write.writes);
  }
  return features.filter(
    (feature, index) => features.indexOf(feature) === index,
  );
}
