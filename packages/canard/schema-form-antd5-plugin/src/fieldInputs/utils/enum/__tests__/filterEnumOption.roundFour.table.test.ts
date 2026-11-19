import { expect, it } from 'vitest';
import { filterEnumOption } from '../filterEnumOption';
it.each(['Café', '대한민국', 'Ångström', 'éCOLE'])('matches canonically equivalent labels and identities: %s', text => {
  for (const source of ['NFC', 'NFD']) for (const query of ['NFC', 'NFD']) {
    const canonical = filterEnumOption(text.toLowerCase(), { children: text });
    expect(canonical).toBe(true);
    expect(filterEnumOption(text.normalize(query).toLowerCase(), { children: text.normalize(source) })).toBe(canonical);
    expect(filterEnumOption(text.normalize(query).toLowerCase(), { value: text.normalize(source) })).toBe(canonical);
  }
});
