// Type surface for '@canard/schema-form-ajv8-plugin', mapped by tsconfig paths. At runtime Vite resolves the
// module to the plugin's source entry through the viteFinal alias in .storybook/main.ts. The plugin publishes
// types only from dist/ and its source does not typecheck at this base, so stories declare the one export they use.
import type { SchemaFormPlugin } from '../../../../src';

/** The ajv8 plugin entry passed to registerPlugin; it registers only a validator. */
export declare const plugin: SchemaFormPlugin;
