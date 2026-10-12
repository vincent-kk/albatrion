import type { FormScenario } from '../../types';
import type { InputWinner, LabeledDefinition } from './types';

/** Three string fields tagged with a formType used only by this family, so global plugin definitions stay local. */
const resolutionSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', presentation: { formType: 'input-components.probe' } },
    note: { type: 'string', presentation: { formType: 'input-components.probe' } },
    code: { type: 'string', presentation: { formType: 'input-components.probe' } },
  },
};

/** Three probe fields whose input source is decided by inputResolutionCases. */
export const inputResolutionScenario: FormScenario = {
  name: 'input-components.input-resolution',
  description: 'An input is chosen from the inline presentation.FormTypeInput first, then formTypeInputMap, Form formTypeInputDefinitions, Provider formTypeInputDefinitions, and registered plugin definitions; the first matching test wins and an inline null renders no input while the node stays (SchemaNodeInput INTENT, REACT-033 priority unchanged). Cases come from inputResolutionCases.',
  schema: resolutionSchema,
  initialValue: { title: 'T', note: 'N', code: 'C' },
  steps: [{ action: 'batch', steps: [], expect: { shape: { '/title': 'present', '/note': 'present', '/code': 'present' } } }],
};

/** Definition test shared by every level, matching only this family's probe fields. */
const probe = { formType: 'input-components.probe' } as const;

/** One combination of input sources and the winner at each path. */
export interface InputResolutionCase {
  /** Story and test label for the case. */
  readonly label: string;
  /** Inline presentation.FormTypeInput by node path: a definition label, or null for no input. */
  readonly inline?: Readonly<Record<string, string | null>>;
  /** formTypeInputMap keys to labels. */
  readonly map?: Readonly<Record<string, string>>;
  /** Form-level formTypeInputDefinitions. */
  readonly form?: readonly LabeledDefinition[];
  /** FormProvider-level formTypeInputDefinitions. */
  readonly provider?: readonly LabeledDefinition[];
  /** Winner at each path; "plugin" is the registered inputResolutionPluginDefinition. */
  readonly winners: Readonly<Record<string, InputWinner>>;
}

/** Source combinations for inputResolutionScenario; the plugin definition labelled "plugin" is registered for all cases. */
export const inputResolutionCases: readonly InputResolutionCase[] = [
  {
    label: 'AllFiveLevels',
    inline: { '/title': 'inline' },
    map: { '/title': 'map', '/note': 'map' },
    form: [{ test: probe, label: 'form' }],
    provider: [{ test: probe, label: 'provider' }],
    winners: { '/title': 'inline', '/note': 'map', '/code': 'form' },
  },
  {
    label: 'ProviderOverPlugin',
    provider: [{ test: probe, label: 'provider' }],
    winners: { '/title': 'provider', '/note': 'provider', '/code': 'provider' },
  },
  {
    label: 'PluginLast',
    form: [{ test: { formType: 'input-components.absent' }, label: 'form' }],
    winners: { '/title': 'plugin', '/note': 'plugin', '/code': 'plugin' },
  },
  {
    label: 'InlineNullHidesInput',
    inline: { '/title': null },
    map: { '/title': 'map' },
    winners: { '/title': 'none', '/note': 'plugin', '/code': 'plugin' },
  },
];

/** The plugin-level definition the consumer registers once; its test matches only the probe fields. */
export const inputResolutionPluginDefinition: LabeledDefinition = { test: probe, label: 'plugin' };
