import type Ajv from 'ajv';

// Type surface for '@canard/schema-form-ajv8-plugin', mapped by tsconfig paths. At runtime Vite resolves the
// module to the plugin's source entry through the viteFinal alias in .storybook/main.ts. The plugin publishes
// types only from dist/ and its source does not typecheck at this base, so the package declares the exports its stories and regression tests use.
import type { SchemaFormPlugin, ValidatorPlugin } from '../../../../src';

/** The ajv8 plugin entry passed to registerPlugin; it registers only a validator. */
export declare const plugin: SchemaFormPlugin & { validator: ValidatorPlugin };

/** Create the AJV8 validator used by the form reentrancy regression. */
export declare const createValidator: (instance: Ajv) => ValidatorPlugin;
