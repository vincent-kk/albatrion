// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from '@storybook/react-vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'path';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
/** Vite accepts aliases as an array or a record; viteFinal appends to either form. */
function normalizeAliases(alias: unknown): { find: string | RegExp; replacement: string }[] {
  if (Array.isArray(alias)) return alias;
  return Object.entries((alias ?? {}) as Record<string, string>).map(([find, replacement]) => ({ find, replacement }));
}
const config: StorybookConfig = {
  stories: [
    '../stories/scenarios/**/*.stories.tsx',
    '../stories/usage/**/*.stories.tsx',
    '../stories/features/**/*.stories.tsx',
    '../stories/composite/**/*.stories.tsx',
  ],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  // The ajv8 plugin publishes only dist/; feature stories register its source entry.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      alias: [
        ...normalizeAliases(viteConfig.resolve?.alias),
        { find: /^@canard\/schema-form-ajv8-plugin$/, replacement: resolve(dirname(fileURLToPath(import.meta.url)), '../../schema-form-ajv8-plugin/src/default/index.ts') },
      ],
    },
  }),
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      skipChildrenPropWithoutDoc: false,
    },
  },
};
export default config;
