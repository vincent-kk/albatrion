// 다른 패키지의 eslint.config.js
import path from 'path';
import { fileURLToPath } from 'url';

import { createESLintConfig } from '../../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...createESLintConfig(path.resolve(__dirname, './tsconfig.json')),
  {
    // Benchmark entry scripts and competitor adapters run under tsx/node, never
    // Vite HMR. The local-component + value-export mix that react-refresh flags
    // is expected here and is not a real fast-refresh hazard.
    files: ['src/utils/*.tsx', 'src/benchmarks/competitors/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
];
