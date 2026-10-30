// Invoked by node run-c-instrumented.mjs; this file is verification tooling.
import {runTiming} from './c-common.mjs';
if(typeof Bun!=='undefined')throw new Error('C instrumentation is Node only');
await runTiming(true);
