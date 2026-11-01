import { isArray } from '@winglet/common-utils/filter';

/** Replace machine-local prefixes in copied evidence while retaining hashes and numerical samples. */
export function portableEvidence(value) {
  if (typeof value === 'string')
    return value
      .replace(/{home}\/[^/\s]+/g, '<home>')
      .replace(/{scratch}\//g, '<scratch>/')
      .replace(/{tmp}\/[^\s"']+/g, '<temporary>');
  if (isArray(value)) return value.map(portableEvidence);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        portableEvidence(key),
        portableEvidence(item),
      ]),
    );
  return value;
}
