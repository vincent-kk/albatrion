import type { FormScenario } from '../types';

/** A subtree load fires only sources in that subtree, even for outside targets. */
const subtreeScopeScenario = {
  name: 'derive.reset-subtree-inject-scope',
  schema: { type: 'object', properties: {
    left: { type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: (value: unknown) => ({ '../../leftTarget': `left:${value}` }),
      } },
    } },
    rightSource: { type: 'string', controls: {
      injectTo: (value: unknown) => ({ '../rightTarget': `right:${value}` }),
    } },
    leftTarget: { type: 'string' }, rightTarget: { type: 'string' },
  } },
  initialValue: { left: { source: 'A' }, rightSource: 'B' },
  steps: [
    { action: 'setValue', path: '/leftTarget', value: 'manual-left',
      expect: { values: { '/leftTarget': 'manual-left' } } },
    { action: 'setValue', path: '/rightTarget', value: 'manual-right',
      expect: { values: { '/rightTarget': 'manual-right' } } },
    { action: 'resetSubtree', path: '/left', expect: { values: {
      '/leftTarget': 'left:A', '/rightTarget': 'manual-right',
    } } },
  ],
} satisfies FormScenario;

/** An undefined injection item consumes the source edge without a write. */
const undefinedInjectionScenario = {
  name: 'derive.undefined-injection-stops',
  schema: { type: 'object', properties: {
    source: { type: 'string', controls: {
      injectTo: (value: unknown) => ({
        '../target': value === 'stop' ? undefined : value,
      }),
    } },
    target: { type: 'string' },
  } },
  initialValue: { source: 'start' },
  steps: [
    { action: 'batch', steps: [{ action: 'setValue', path: '/source', value: 'stop' }],
      expect: { outputValue: { source: 'stop', target: 'start' } } },
    { action: 'setValue', path: '/source', value: 'resume',
      expect: { outputValue: { source: 'resume', target: 'resume' } } },
  ],
} satisfies FormScenario;

export const injectionScenarios: readonly FormScenario[] = [
  subtreeScopeScenario, undefinedInjectionScenario,
];
