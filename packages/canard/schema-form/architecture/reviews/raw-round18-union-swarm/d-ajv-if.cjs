const Ajv = require(process.cwd() + '/node_modules/ajv');
const ajv = new (Ajv.default || Ajv)({ coerceTypes: true, strictSchema: false, allErrors: true });
const s = { type: 'object', properties: { k: { type: ['string','number'] } }, if: { properties: { k: { type: 'number' } } }, then: {} };
const g = ajv.compile({ properties: { k: { type: 'number' } } });
const d1 = { k: '1' }; g(d1);
const v = ajv.compile(s); const d2 = { k: true }; v(d2);
console.log(JSON.stringify({ guardData: d1, unionData: d2, opts: { coerceTypes: ajv.opts.coerceTypes, useDefaults: ajv.opts.useDefaults, removeAdditional: ajv.opts.removeAdditional } }));
