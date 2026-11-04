import type { JSONSchema, ValidatorPlugin } from '@canard/schema-form';
import type { ValidationExpectation } from '@aileron/schema-form-scenarios/validator';

/**
 * Validate a copy of a value and reduce the issues to the scenario's comparable shape.
 * @param validate - A whole-validation function returned by the validator's `compile`
 * @param value - The value to validate; a JSON copy is validated so scenario data stays untouched
 * @returns Validity and the distinct issue data paths in ascending order
 */
export const readValidation = async (
  validate: ReturnType<ValidatorPlugin['compile']>,
  value: unknown,
): Promise<ValidationExpectation> => {
  const issues = await validate(copyOf(value));
  const paths = (issues ?? []).map((issue) => issue.dataPath);
  return {
    valid: issues === null,
    dataPaths: paths.filter((path, index) => paths.indexOf(path) === index).sort(),
  };
};

/**
 * Copy scenario data as the engine passes its own copy to the validator.
 * @param value - JSON data from the shared catalogue
 * @returns A deep JSON copy typed as a schema-form schema
 */
export const copyOf = (value: unknown): JSONSchema => JSON.parse(JSON.stringify(value)) as JSONSchema;
