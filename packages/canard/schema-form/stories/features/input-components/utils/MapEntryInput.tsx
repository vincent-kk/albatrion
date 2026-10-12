import { isPlainObject } from '@winglet/common-utils/filter';

import type { FormTypeInputProps } from '../../../../src';

/**
 * A terminal input for an open object: it lists the entries and, on blur, merges one typed "key=value" into the whole value.
 * @param props - FormTypeInput props of an object node whose keys are dynamic (SCHEMA-040).
 * @returns The entry list and one text input that writes the merged object.
 */
export function MapEntryInput({ path, value, onChange }: FormTypeInputProps) {
  const entries = isPlainObject<Record<string, unknown>>(value) ? value : {};
  return <div>
    <output data-map-entries={JSON.stringify(entries)}>{Object.entries(entries).map(([key, item]) => `${key}=${String(item)}`).join(', ')}</output>
    <input id={path} placeholder="key=value" onBlur={(event) => {
      const [key, ...rest] = event.target.value.split('=');
      if (!key || rest.length === 0) return;
      onChange({ ...entries, [key]: rest.join('=') });
      event.target.value = '';
    }} />
  </div>;
}
