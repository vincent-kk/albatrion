import type { FormScenario } from '../types';

/** Source edges preserve caller edits until a new edge or load. */
const derivedEdgeScenario = {
  name: 'derive.derived-edge-and-reset',
  schema: { type: 'object', properties: {
    source: { type: 'string' },
    target: { type: 'string', controls: { derived: '../source' } },
  } },
  initialValue: { source: 'A' },
  steps: [
    { action: 'setValue', path: '/target', value: 'manual',
      expect: { values: { '/target': 'manual' } } },
    { action: 'setValue', path: '', value: { source: 'A', target: 'manual' },
      expect: { outputValue: { source: 'A', target: 'manual' } } },
    { action: 'setValue', path: '/source', value: 'B',
      expect: { outputValue: { source: 'B', target: 'B' } } },
    { action: 'reset', expect: { outputValue: { source: 'A', target: 'A' } } },
  ],
} satisfies FormScenario;

/** A true unset condition consumes each rising edge, including the load. */
const unsetValueScenario = {
  name: 'derive.unset-load-and-runtime-edge',
  schema: { type: 'object', properties: {
    clear: { type: 'boolean' },
    target: { type: 'string', controls: { unsetValue: '../clear' } },
  } },
  initialValue: { clear: true, target: 'loaded' },
  steps: [
    { action: 'setValue', path: '/target', value: 'typed',
      expect: { outputValue: { clear: true, target: 'typed' } } },
    { action: 'setValue', path: '/clear', value: false,
      expect: { values: { '/target': 'typed' } } },
    { action: 'setValue', path: '/clear', value: true,
      expect: { values: { '/target': undefined }, outputValue: { clear: true } } },
    { action: 'reset', expect: { values: { '/target': undefined },
      outputValue: { clear: true } } },
  ],
} satisfies FormScenario;

/** Same-target derived values outrank an injection candidate. */
const sameTargetScenario = {
  name: 'derive.same-target-rank',
  schema: { type: 'object', properties: {
    dep: { type: 'number' },
    source: { type: 'number', controls: {
      injectTo: (value: unknown) => ({ '../target': `I:${value}` }),
    } },
    target: { type: 'string', controls: { derived: '"D:" + ../dep' } },
  } },
  initialValue: { dep: 1, source: 2 },
  steps: [
    { action: 'setValue', path: '/target', value: 'manual',
      expect: { values: { '/target': 'manual' } } },
    { action: 'setValue', path: '/dep', value: 3,
      expect: { values: { '/target': 'D:3' }, diagnostics: { status: 'stable' } } },
  ],
} satisfies FormScenario;

/** The emitted source edge drives an injection without replacing its input. */
const injectEdgeScenario = {
  name: 'derive.inject-to-on-source-edge',
  schema: { type: 'object', properties: {
    source: { type: 'string', controls: {
      injectTo: (value: unknown) => ({ '../target': `copy:${value}` }),
    } },
    target: { type: 'string' },
  } },
  initialValue: { source: 'load' },
  steps: [
    { action: 'setValue', path: '/target', value: 'manual',
      expect: { outputValue: { source: 'load', target: 'manual' } } },
    { action: 'setValue', path: '/source', value: 'edge',
      expect: { outputValue: { source: 'edge', target: 'copy:edge' } } },
    { action: 'reset', expect: { outputValue: { source: 'load', target: 'copy:load' } } },
  ],
} satisfies FormScenario;

/** A suppressed form load keeps its caller data and consumes that load edge. */
const suppressedLoadScenario = {
  name: 'derive.disable-automatic-writes-load',
  schema: { type: 'object', properties: {
    source: { type: 'string' },
    target: { type: 'string', controls: { derived: '../source' } },
  } },
  initialValue: { source: 'A', target: 'loaded' },
  steps: [
    { action: 'setValue', path: '/target', value: 'manual',
      expect: { values: { '/target': 'manual' } } },
    { action: 'reset', automaticWrites: 'disabled',
      expect: { outputValue: { source: 'A', target: 'loaded' } } },
    { action: 'setValue', path: '/source', value: 'B',
      expect: { outputValue: { source: 'B', target: 'B' } } },
  ],
} satisfies FormScenario;

export const edgeScenarios: readonly FormScenario[] = [
  derivedEdgeScenario, unsetValueScenario, sameTargetScenario, injectEdgeScenario,
  suppressedLoadScenario,
];
