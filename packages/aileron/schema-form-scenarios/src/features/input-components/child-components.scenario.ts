import type { FormScenario } from '../../types';

/** An address card drawn by a custom object input, and an open object edited as a whole by a terminal map input. */
const childSchema = {
  type: 'object',
  properties: {
    address: {
      type: 'object', presentation: { inputType: 'input-components.card' },
      properties: { street: { type: 'string', minLength: 3 }, zip: { type: 'string', pattern: '^[0-9]{5}$' } },
    },
    labels: { type: 'object', presentation: { inputType: 'input-components.map' }, additionalProperties: { type: 'string' } },
  },
};

/** A custom object input draws its children through ChildFields; an open object stays one node edited as a whole. */
export const childComponentsScenario: FormScenario = {
  name: 'input-components.child-components',
  description: 'A custom object input receives ChildFields, one per child with its field name, and useChildFieldErrors gives one showErrors entry per child under the display policy; SCHEMA-040 dynamic keys never become nodes, so an open object is edited as a whole by a terminal input and its keys stay extras. Stages come from childComponentStages and mapEntryStages.',
  schema: childSchema,
  initialValue: { address: { street: 'ab', zip: '123' }, labels: { a: 'A' } },
  steps: [
    { action: 'batch', steps: [], expect: { errors: { '/address/street': [{ keyword: 'minLength' }], '/address/zip': [{ keyword: 'pattern' }] } } },
    { action: 'setValue', path: '/labels', value: { a: 'A', b: 'B' }, expect: { shape: { '/labels/b': 'absent' }, values: { '/labels': { a: 'A', b: 'B' } } } },
  ],
};

/** One consumer interaction and what the address card reports afterwards. */
export interface ChildComponentStage {
  /** Load, or type into one child and leave it. */
  readonly act: 'load' | 'edit';
  /** Child path typed into for edit. */
  readonly path?: string;
  /** Text typed for edit, appended to the current value. */
  readonly text?: string;
  /** Child field names the card renders, in order. */
  readonly fields: readonly string[];
  /** useChildFieldErrors showErrors per child under ShowError.EditedTouched: the child's state, not whether it has issues. */
  readonly showErrors: readonly boolean[];
  /** Issue count per child from errorMatrix. */
  readonly errorCounts: readonly number[];
}

/** Interactions applied in order to the address card of childComponentsScenario. */
export const childComponentStages: readonly ChildComponentStage[] = [
  { act: 'load', fields: ['street', 'zip'], showErrors: [false, false], errorCounts: [1, 1] },
  { act: 'edit', path: '/address/zip', text: '4', fields: ['street', 'zip'], showErrors: [false, true], errorCounts: [1, 1] },
  { act: 'edit', path: '/address/street', text: 'x', fields: ['street', 'zip'], showErrors: [true, true], errorCounts: [0, 1] },
];

/** One entry typed into the terminal map input as "key=value" and the whole open-object value afterwards. */
export interface MapEntryStage {
  /** Text typed into the map input before focus leaves it. */
  readonly entry: string;
  /** Value of /labels afterwards. */
  readonly value: Readonly<Record<string, string>>;
}

/** Entries applied in order to /labels of childComponentsScenario after its steps. */
export const mapEntryStages: readonly MapEntryStage[] = [
  { entry: 'c=C', value: { a: 'A', b: 'B', c: 'C' } },
  { entry: 'a=Z', value: { a: 'Z', b: 'B', c: 'C' } },
];
