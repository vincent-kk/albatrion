// 다른 패키지의 eslint.config.js
import path from 'path';
import { fileURLToPath } from 'url';

import { createESLintConfig } from '../../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default createESLintConfig(path.resolve(__dirname, './tsconfig.json'));
