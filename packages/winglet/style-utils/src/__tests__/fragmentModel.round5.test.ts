import { afterEach, expect, it, vi } from 'vitest';
import { createStyleHarness } from './helpers/createStyleHarness';
import { createRandom } from './helpers/cssSyntax/createRandom';
import { readStylesheet } from './helpers/cssSyntax/readStylesheet';
import { fragmentCorpus } from './helpers/fragmentCorpus';
import { generateValidSheet } from './helpers/generateValidSheet';

/** Preserve the host surface after the constructable-sheet recording fixture. */
const originalAdopted = Object.getOwnPropertyDescriptor(document, 'adoptedStyleSheets');
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalAdopted) Object.defineProperty(document, 'adoptedStyleSheets', originalAdopted);
  else Reflect.deleteProperty(document, 'adoptedStyleSheets');
});

it.each([[false, false], [false, true], [true, false], [true, true]])('compares seeded identifier operations with isolated Syntax trees: shadow=%s, skipCompression=%s', (shadow, skipCompression) => {
  const seed = 0x1d3f105, random = createRandom(seed);
  const cache = new Map<string, string[]>();
  const isolated = (css: string) => {
    let rules = cache.get(css);
    if (!rules) {
      const harness = createStyleHarness(shadow, 'r5isolated');
      try {
        const normalized = css.charCodeAt(0) === 0xfeff ? css.slice(1) : css;
        harness.add('only', normalized, skipCompression);
        rules = readStylesheet(harness.flush()).map(rule => rule.split('ident-token:r5isolated').join('ident-token:r5target'));
        cache.set(css, rules);
      } finally { harness.destroy(); }
    }
    return rules;
  };
  for (let trial = 0; trial < 768; trial++) {
    const actions = Array.from({ length: 8 }, (_, index) => ({ id: 'id' + Math.floor(random() * 4), remove: index > 1 && random() < 0.25, css: trial < fragmentCorpus.length ? fragmentCorpus[(trial + index) % fragmentCorpus.length] : random() < 0.6 ? fragmentCorpus[Math.floor(random() * fragmentCorpus.length)] : generateValidSheet(random) }));
    for (const action of actions) if (!action.remove && action.css.trim()) isolated(action.css);
    const model = new Map<string, string[]>(), cleanups = new Map<string, () => void>();
    const harness = createStyleHarness(shadow);
    try {
      for (let index = 0; index < actions.length; index++) {
        const action = actions[index];
        if (action.remove) { cleanups.get(action.id)?.(); model.delete(action.id); }
        else {
          cleanups.set(action.id, harness.add(action.id, action.css, skipCompression));
          if (action.css.trim()) model.set(action.id, isolated(action.css));
        }
        const text = harness.flush();
        expect(readStylesheet(text), `seed=${seed}, trial=${trial}, event=${index}, actions=${JSON.stringify(actions)}, text=${JSON.stringify(text)}`).toEqual([...model.values()].flat());
        const sheets: unknown = Reflect.get(harness.root, 'adoptedStyleSheets');
        if (!Array.isArray(sheets)) throw new Error('missing target sheets');
        expect(sheets.length).toBeLessThanOrEqual(1);
      }
    } finally { harness.destroy(); }
  }
}, 120_000);

it('uses stylesheet CDO/CDC and per-fragment BOM semantics before document selector scoping', () => {
  for (const css of ['<!-- .a{color:red} -->', '--> .a{color:red}', '\uFEFF.a{color:red}']) {
    const harness = createStyleHarness(false);
    try {
      harness.add('first', css);
      harness.add('next', '.b{color:blue}');
      expect(readStylesheet(harness.flush()), css).toEqual(readStylesheet('.r5target .a{color:red}.r5target .b{color:blue}'));
    } finally { harness.destroy(); }
  }
});
