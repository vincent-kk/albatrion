import type { FormScenario } from '../types';

/** VALUE-034 projects holes without removing editable slots. */
const rows = { type: 'array', items: { type: ['string', 'null'] }, options: { omitTrailing: true } };

/** Screen dispositions retain explicit slots instead of assuming minItems fill. */
export const arrayRenderScenarios: readonly FormScenario[] = [
  {
    name: 'array.nullable-slots-reset',
    description: 'array.omit-trailing.injection: VALUE-034 filters projection only; nullable container null survives reset.',
    schema: { ...rows, type: ['array', 'null'] }, initialValue: null,
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: null, shape: { '/0': 'absent' } } },
      { action: 'setValue', path: '', value: [undefined, 'value', undefined], expect: { outputValue: [null, 'value'], shape: { '/0': 'present', '/2': 'present' } } },
      { action: 'reset', expect: { outputValue: null, shape: { '/0': 'absent' } } },
    ],
  },
  {
    name: 'array.omit-trailing-leading-holes',
    description: 'array.omit-trailing.injection: VALUE-034 leading and interior holes emit null; TEST-020 mount is silent.',
    schema: rows, initialValue: [undefined, 'middle', undefined],
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: [null, 'middle'], shape: { '/0': 'present', '/2': 'present' } } },
      { action: 'setValue', path: '', value: ['first', undefined, 'last', undefined], expect: { outputValue: ['first', null, 'last'], shape: { '/3': 'present' } } },
      { action: 'reset', expect: { outputValue: [null, 'middle'], shape: { '/2': 'present' } } },
    ],
  },
  {
    name: 'array.branch-projection-injection',
    description: 'array.omit-trailing.composite and conditional: LANDING-023 reads output; LANDING-018 retains inactive raw.',
    schema: { type: 'object', properties: { shown: { type: 'boolean' }, copy: rows }, allOf: [{
      controls: { active: './shown' }, properties: { rows: { ...rows, controls: {
        injectTo: (value: unknown) => ({ '../copy': value }),
      } } },
    }] }, initialValue: { shown: true, rows: ['A', undefined] },
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: { shown: true, rows: ['A'], copy: ['A'] } } },
      { action: 'setValue', path: '/rows/0', value: 'edited', expect: { outputValue: { shown: true, rows: ['edited'], copy: ['edited'] } } },
      { action: 'setValue', path: '/shown', value: false, expect: { shape: { '/rows': 'absent' } } },
      { action: 'setValue', path: '/shown', value: true, expect: { shape: { '/rows/1': 'present' }, values: { '/rows/0': 'edited' }, outputValue: { shown: true, rows: ['edited'], copy: ['edited'] } } },
    ],
  },
  {
    name: 'array.min-items-explicit-slots',
    description: 'array.omit-trailing: LANDING-116 input owns constraints, VALUE-034 projection preserves raw slots.',
    schema: { ...rows, minItems: 3 }, initialValue: [],
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/0': 'absent' }, outputValue: [] } },
      { action: 'setValue', path: '', value: [undefined, 'x', undefined], expect: { shape: { '/0': 'present', '/2': 'present' }, outputValue: [null, 'x'] } },
      { action: 'setValue', path: '/2', value: 'tail', expect: { outputValue: [null, 'x', 'tail'] } },
    ],
  },
  {
    name: 'array.prefix-items-external-reset',
    description: 'array.prefixItems-terminal: LANDING-116 no minItems fill; LANDING-149 declared prefix positions.',
    schema: { type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }], items: { type: 'boolean' } },
    initialValue: ['external', 7, true],
    steps: [
      { action: 'batch', steps: [], expect: { schemaTypes: { '/0': 'string', '/1': 'number', '/2': 'boolean' }, outputValue: ['external', 7, true] } },
      { action: 'setValue', path: '', value: ['next', 8, false], expect: { outputValue: ['next', 8, false] } },
      { action: 'reset', expect: { outputValue: ['external', 7, true], shape: { '/2': 'present' } } },
    ],
  },
  {
    name: 'array.terminal-object-external-reset',
    description: 'terminal-mode: LANDING-142 undefined writes do not invent a load; LANDING-149 terminal values stay whole.',
    schema: { type: 'object', options: { terminal: true }, properties: { ignored: { type: 'string', default: 'schema' } } },
    initialValue: { external: 'loaded' },
    steps: [
      { action: 'setValue', path: '', value: { external: 'edited' }, expect: { outputValue: { external: 'edited' }, shape: { '/ignored': 'absent' } } },
      { action: 'reset', expect: { outputValue: { external: 'loaded' } } },
    ],
  },
  {
    name: 'array.terminal-array-external-reset',
    description: 'array.prefixItems-terminal and terminal-mode: LANDING-116 no automatic minItems fill; terminal raw is whole.',
    schema: { type: 'array', options: { terminal: true }, minItems: 3, prefixItems: [{ type: 'string', default: 'schema' }] },
    initialValue: ['external'],
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: ['external'], shape: { '/0': 'absent' } } },
      { action: 'setValue', path: '', value: ['edited', 2], expect: { outputValue: ['edited', 2] } },
      { action: 'reset', expect: { outputValue: ['external'] } },
    ],
  },
];
