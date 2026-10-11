import { readSchemaObject } from './readSchemaObject';
import { resolveReference } from './resolveReference';
import type { AnalysisContext, SchemaInput } from './type';

/** Fixed contribution contexts in the inner JSON and its enclosing string. */
const CONJUNCTION = { key: '"conjunction"', boundKey: '\\"conjunction\\"' };
const DECLARATION = { key: '"declaration"', boundKey: '\\"declaration\\"' };

/**
 * Quote a tuple leaf once and derive its enclosing-string spelling from that encoding.
 * @param value - Authored location or ordered gate descriptor
 * @returns Identical JSON leaf bytes and their quote/backslash-escaped representation
 */
const encodeLeaf = (value: string): { key: string; boundKey: string } => {
  const key = JSON.stringify(value);
  let boundKey = '\\"';
  let start = 1;
  for (let index = 1; index < key.length - 1; index++) {
    const code = key.charCodeAt(index);
    if (code === 34 || code === 92) {
      boundKey += key.slice(start, index) + '\\' + key[index];
      start = index + 1;
    }
  }
  boundKey += key.slice(start, -1) + '\\"';
  return { key, boundKey };
};

/**
 * Construct both byte-identical lookup keys from one ordered authored tuple traversal.
 * @param context - Root reference resolver
 * @param inputs - Authored schema/overlay and gate combination
 * @returns Stable template and host-bound keys without re-encoding the complete tuple
 */
export const getTemplateKey = (
  context: AnalysisContext,
  inputs: readonly SchemaInput[],
): { key: string; boundKey: string } => {
  let key = '[';
  let boundKey = '["[';
  let hostPaths = '[';
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index];
    const schema = readSchemaObject(input.schema);
    const location =
      typeof schema.$ref === 'string' && Object.keys(schema).length === 1
        ? resolveReference(context, schema.$ref, input.schemaPath).schemaPath
        : input.schemaPath;
    const encoded = encodeLeaf(location);
    const contribution = input.context === 'conjunction' ? CONJUNCTION : DECLARATION;
    if (index > 0) {
      key += ',';
      boundKey += ',';
      hostPaths += ',';
    }
    key += '[' + encoded.key + ',' + contribution.key + ',[';
    boundKey += '[' + encoded.boundKey + ',' + contribution.boundKey + ',[';
    hostPaths += '[';
    const gates: string[] = [];
    for (let gateIndex = 0; gateIndex < input.gates.length; gateIndex++) {
      const gate = input.gates[gateIndex];
      if (gateIndex > 0) hostPaths += ',';
      hostPaths += JSON.stringify(gate.hostPath);
      const owners: string[] = [];
      const appliesWhen = gate.appliesWhen;
      if (appliesWhen) {
        for (let owner = 0; owner < appliesWhen.length; owner++) {
          const path = appliesWhen[owner].schemaPath;
          if (owners.indexOf(path) === -1) owners.push(path);
        }
      }
      const descriptor = `${gate.kind}:${gate.schemaPath}:${Boolean(gate.negated)}:${owners.join(',')}`;
      if (gates.indexOf(descriptor) !== -1) continue;
      const encodedGate = encodeLeaf(descriptor);
      if (gates.length > 0) {
        key += ',';
        boundKey += ',';
      }
      key += encodedGate.key;
      boundKey += encodedGate.boundKey;
      gates.push(descriptor);
    }
    key += ']]';
    boundKey += ']]';
    hostPaths += ']';
  }
  key += ']';
  boundKey += ']",' + hostPaths + ']]';
  return { key, boundKey };
};
