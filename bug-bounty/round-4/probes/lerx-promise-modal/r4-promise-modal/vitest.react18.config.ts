import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import react18 from '../../../vitest.react18.config';

import { sourceResolution } from './vitest.config';

/**
 * Probe-local React 18 config: the package's React 18 aliases plus the same
 * "source" condition and @winglet internal aliases as ./vitest.config.ts.
 */
export default mergeConfig(react18, defineConfig(sourceResolution));
