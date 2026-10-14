import { activeTags, build, find, rawTree, settle, setValue, validate, write } from './model.mjs';
const J = JSON.stringify;
const schema = { type: 'object', properties: { name: { type: 'string' } }, oneOf: [
  { properties: { k: { const: 'cat' }, meow: { type: 'string', default: 'M' } }, required: ['k'] },
  { properties: { k: { const: 'dog' }, bark: { type: 'string' } }, required: ['k'] } ] };
for (const init of [{}, { k: 'cat' }, { k: 'zzz', name: 'n' }, { k: '' }]) { const r = build(schema); setValue(r, init); settle(r); console.log(`init ${J(init)} → emit=${J(r.emit)} local=${J(r.local)} active=${J(activeTags(r))} ajv=${J(validate(schema, r.emit).ok)}`); }
const r = build(schema); setValue(r, { k: 'cat' }); settle(r); write(find(r, 'k'), 'dog'); settle(r); console.log(`cat→dog: emit=${J(r.emit)} raw=${J(rawTree(r))} active=${J(activeTags(r))}`);
