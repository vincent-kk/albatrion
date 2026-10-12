import type { FormScenario } from '../../types';

/** Four fields arranged by a consumer layout instead of the default group. */
const layoutSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    count: { type: 'integer', maximum: 5 },
    enabled: { type: 'boolean' },
    note: { type: 'string' },
  },
};

/** Form.Label, Form.Input, Form.Error and Form.Render place fields by path inside the children function. */
export const layoutCompositionScenario: FormScenario = {
  name: 'handle-layout.layout-composition',
  description: 'The Form children function receives the value and lays out Form.Label, Form.Input, Form.Error and Form.Render by path; a field left out of the layout is not drawn but its value stays in the output; two Form.Input for one path share the node, and typing into one writes the node while the other keeps its own draft, because the input owns its draft (REACT-027) and typing sends no Refresh (EVENT-042). The layout comes from layoutPlan.',
  schema: layoutSchema,
  initialValue: { title: 'Plan', count: 1, enabled: true, note: 'n' },
  steps: [
    { action: 'batch', steps: [], expect: { outputValue: { title: 'Plan', count: 1, enabled: true, note: 'n' } } },
    { action: 'setValue', path: '/count', value: 9, expect: { values: { '/count': 9 }, errors: { '/count': [{ keyword: 'maximum' }] } } },
    { action: 'setValue', path: '/note', value: 'rendered', expect: { values: { '/note': 'rendered' } } },
  ],
};

/** The consumer layout: which paths get which component, and what a play reads back. */
export const layoutPlan = {
  /** Paths drawn with Form.Label and Form.Input. */
  inputs: ['/title', '/count'],
  /** Path drawn twice with Form.Input to show both copies follow one node. */
  repeated: '/title',
  /** Path drawn with Form.Error. */
  error: '/count',
  /** Path drawn with Form.Render, whose render function shows the value. */
  render: '/note',
  /** Paths the layout leaves out; they draw nothing and keep their output. */
  omitted: ['/enabled'],
  /** Text typed into the first copy of the repeated input, appended to its value. */
  typed: ' v2',
  /** Values of both copies after typing: the second keeps its draft (EVENT-042, REACT-027). */
  copiesAfterTyping: ['Plan v2', 'Plan'],
} as const;
