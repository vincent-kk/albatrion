// Invoked before profile scripts; D0_LEGACY defaults to the historical round-446 reference release.
import { prepareEngines } from '../helpers/prepareEngines.mjs';
import context from './context.mjs';

console.log(
  JSON.stringify(
    prepareEngines(
      context.packageDir,
      context.runDir,
      process.env.D0_LEGACY ?? '0.16.0',
    ),
    null,
    2,
  ),
);
