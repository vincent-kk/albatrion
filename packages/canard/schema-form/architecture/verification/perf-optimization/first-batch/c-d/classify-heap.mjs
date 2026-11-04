// Invoked by run-d.mjs in a GC-enabled Node child to classify a retained-heap snapshot.
// Standalone offline classifier; it never opens or writes a heap outside SC.
import path from 'node:path';
import {SC,option,runtime,json} from './config.mjs';
import {HeapGraph,classifyGraph,blueprintBytes,verifyDominators} from './heap-graph.mjs';
const snapshot=path.resolve(option('snapshot','')),blueprintSnapshot=path.resolve(option('blueprint-snapshot',''));
for(const file of [snapshot,blueprintSnapshot])if(!file.startsWith(SC+path.sep))throw new Error('Heap input must stay under SC');
const check=verifyDominators();
const blueprint=blueprintBytes(blueprintSnapshot);globalThis.gc?.();
const result=classifyGraph(HeapGraph.read(snapshot),option('engine','current'),Number(option('nodes','33')));
console.log(json({kind:'D-classification',runtime:runtime(),selfCheck:check,blueprint,...result}));
