import type { FormScenario } from '../../types';

/** One bounded field whose verdict reveals which validator ran. */
const sourceSchema = { type: 'object', properties: { name: { type: 'string', minLength: 3 } } };

/** The Form validatorFactory prop precedes the registered validator plugin; without either, the form warns once. */
export const validatorSourcesScenario: FormScenario = {
  name: 'plugins.validator-sources',
  description: 'ERROR-143 a validator comes from the plugin or the Form validatorFactory prop; VALIDATE-041 the prop is that form\'s instance and precedes the plugin under the same compile and compileGuard contract; VALIDATE-042 and ERROR-024 a form with neither receives one VALIDATOR_MISSING warning, and validation mode None removes it. Cases come from validatorSourceCases; the shared steps run with the plugin.',
  schema: sourceSchema,
  initialValue: { name: 'ab' },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/name': 'ab' }, errors: { '/name': [{ keyword: 'minLength' }] } } }],
};

/** One validator source and the verdict and warnings it produces for the loaded value. */
export interface ValidatorSourceCase {
  /** Story and test label. */
  readonly label: string;
  /** Validator in effect: the registered plugin, the Form prop, or none. */
  readonly source: 'plugin' | 'factory' | 'none';
  /** Validation mode name; defaults to the Form default. */
  readonly validationMode?: 'None';
  /** Keyword the consumer's factory reports for every value. */
  readonly factoryKeyword?: string;
  /** Keywords on /name after handle.validate(). */
  readonly keywords: readonly string[];
  /** Warning codes reaching onError during mount. */
  readonly warnings: readonly string[];
}

/** Sources compared on validatorSourcesScenario; 'none' needs a runtime without a registered validator plugin. */
export const validatorSourceCases: readonly ValidatorSourceCase[] = [
  { label: 'plugin', source: 'plugin', keywords: ['minLength'], warnings: [] },
  { label: 'factory over plugin', source: 'factory', factoryKeyword: 'factory-rule', keywords: ['factory-rule'], warnings: [] },
  { label: 'no validator', source: 'none', keywords: [], warnings: ['SCHEMA_FORM_WARNING.VALIDATOR_MISSING'] },
  { label: 'no validator with mode None', source: 'none', validationMode: 'None', keywords: [], warnings: [] },
];
